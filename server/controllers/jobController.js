import mongoose from "mongoose";
import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import Application from "../models/Application.js";
import SearchAnalytics from "../models/SearchAnalytics.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { fetchExternalJobs, getExternalJobById, isExternalJobId } from "../utils/externalJobs.js";
import { notifyMatchingJobs, notifySavedJobDeletion, notifySavedJobFollowers } from "../utils/notificationAlerts.js";
import { buildLocationQueryFilter, escapeRegex, getLocationVariants, inferStateAndRegionFromCity } from "../utils/locationHelper.js";
import {
  JOB_STATUSES,
  getJobHistoryAction,
  recordJobHistory,
  snapshotJob,
} from "../utils/jobAudit.js";

const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
};

const parseQueryList = (value) => {
  if (!value) return [];
  const items = Array.isArray(value) ? value : String(value).split(",");
  return items.map((item) => String(item).trim()).filter(Boolean);
};

const buildJobQuery = (query) => {
  const filters = {};
  const searchConditions = [];

  if (query.q) {
    const escaped = escapeRegex(query.q);
    searchConditions.push({
      $or: [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { category: { $regex: escaped, $options: "i" } },
        { skills: { $in: [new RegExp(escaped, "i")] } },
      ],
    });
  }

  const selectedSkills = parseQueryList(query.skill ?? query.skills);
  if (selectedSkills.length > 0) {
    searchConditions.push({
      $or: selectedSkills.flatMap((skill) => {
        const escapedSkill = escapeRegex(skill);
        return [
          { skills: { $in: [new RegExp(escapedSkill, "i")] } },
          { title: { $regex: escapedSkill, $options: "i" } },
          { description: { $regex: escapedSkill, $options: "i" } },
          { category: { $regex: escapedSkill, $options: "i" } },
        ];
      }),
    });
  }

  if (query.location) {
    const locationFilter = buildLocationQueryFilter(query.location, query.state);
    if (locationFilter) {
      searchConditions.push(locationFilter);
    }
  }

  if (searchConditions.length === 1) {
    Object.assign(filters, searchConditions[0]);
  } else if (searchConditions.length > 1) {
    filters.$and = searchConditions;
  }

  if (query.jobType) {
    filters.jobType = query.jobType;
  }

  if (query.category) {
    filters.category = { $regex: escapeRegex(query.category), $options: "i" };
  }

  filters.status = query.status || "open";

  if (query.remote === "true") {
    filters.remote = true;
  }

  return filters;
};

const calculateDistanceRank = (job, locationQuery = "") => {
  if (!locationQuery) return 0;
  const q = locationQuery.toLowerCase().trim();
  const jobLoc = String(job.location || job.city || "").toLowerCase();
  const jobState = String(job.state || "").toLowerCase();

  if (jobLoc.includes(q) || q.includes(jobLoc)) return 0; // Exact city/loc match

  const variants = getLocationVariants(q);
  if (variants.some((v) => jobLoc.includes(v))) return 1; // Nearby cluster match

  if (jobState && q.includes(jobState)) return 2; // State match
  if (job.remote) return 3; // Remote match

  return 4; // National match
};

const listJobs = asyncHandler(async (req, res) => {
  const queryObj = buildJobQuery(req.query);

  let [localJobs, externalJobs] = await Promise.all([
    Job.find(queryObj)
      .populate("employer", "companyName logoUrl location website industry")
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 }),
    fetchExternalJobs(req.query),
  ]);

  let allJobs = [
    ...localJobs.map((job) => ({
      ...job.toJSON(),
      source: "local",
      external: false,
    })),
    ...externalJobs,
  ];

  // If local results are sparse and a location query was provided, expand to state level
  if (allJobs.length < 5 && req.query.location) {
    const inferred = inferStateAndRegionFromCity(req.query.location);
    if (inferred.state) {
      const stateQuery = { status: "open", state: new RegExp(escapeRegex(inferred.state), "i") };
      const extraLocal = await Job.find(stateQuery)
        .populate("employer", "companyName logoUrl location website industry")
        .sort({ createdAt: -1 })
        .limit(10);

      const existingIds = new Set(allJobs.map((j) => String(j._id)));
      for (const extraJob of extraLocal) {
        if (!existingIds.has(String(extraJob._id))) {
          allJobs.push({
            ...extraJob.toJSON(),
            source: "local",
            external: false,
          });
        }
      }
    }
  }

  // Sort by Location Distance Rank first, then by Creation Date
  allJobs.sort((a, b) => {
    const rankA = calculateDistanceRank(a, req.query.location);
    const rankB = calculateDistanceRank(b, req.query.location);

    if (rankA !== rankB) return rankA - rankB;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const locationQuery = req.query.location || "";
  const inferredLoc = locationQuery ? inferStateAndRegionFromCity(locationQuery) : { state: "" };
  const searchSummary = locationQuery
    ? `Showing opportunities near ${locationQuery}${inferredLoc.state ? `, ${inferredLoc.state}` : ""} (within 50 km)`
    : "Showing all open vacancies";

  if (req.query.q || req.query.location) {
    void SearchAnalytics.create({
      query: req.query.q || "",
      location: req.query.location || "",
      category: req.query.category || "",
      resultsCount: allJobs.length,
      user: req.user?._id || null,
      ip: req.ip || "",
    }).catch(() => {});
  }

  res.json({
    jobs: allJobs,
    count: allJobs.length,
    searchSummary,
    searchedVariants: locationQuery ? getLocationVariants(locationQuery) : [],
  });
});

const getRecommendedJobs = asyncHandler(async (req, res) => {
  const { city, userLocation, category } = req.query;

  const filter = { status: "open" };
  if (category) {
    filter.category = { $regex: escapeRegex(category), $options: "i" };
  }

  if (city) {
    const locationFilter = buildLocationQueryFilter(city);
    if (locationFilter) {
      Object.assign(filter, locationFilter);
    }
  }

  const localJobs = await Job.find(filter)
    .populate("employer", "companyName logoUrl location website industry")
    .sort({ createdAt: -1 })
    .limit(20);

  const jobs = localJobs.map((job) => ({
    ...job.toJSON(),
    source: "local",
    external: false,
    recommendedReason: city ? `Based on location "${city}"` : "Popular opportunity",
  }));

  res.json({ jobs });
});

const getJobById = asyncHandler(async (req, res) => {
  if (isExternalJobId(req.params.id)) {
    const job = await getExternalJobById(req.params.id);

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    res.json({ job });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid job id");
  }

  const job = await Job.findById(req.params.id)
    .populate("employer", "companyName logoUrl location website industry description")
    .populate("postedBy", "name email");

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const canViewPrivateJob =
    req.user &&
    (req.user.role === "admin" || String(job.postedBy) === String(req.user._id));

  if (job.status === "draft" && !canViewPrivateJob) {
    throw new ApiError(404, "Job not found");
  }

  res.json({ job });
});

const createJob = asyncHandler(async (req, res) => {
  const employer = await Employer.findOne({ user: req.user._id });

  if (!employer && req.user.role !== "admin") {
    throw new ApiError(400, "Create a company profile before posting jobs");
  }

  const {
    title,
    description,
    requirements,
    responsibilities,
    location,
    city,
    state,
    pincode,
    jobType,
    salaryMin,
    salaryMax,
    currency,
    experienceLevel,
    remote,
    category,
    skills,
    deadline,
    status,
  } = req.body;

  if (!title || !description || !location) {
    throw new ApiError(400, "Title, description, and location are required");
  }

  const parseBoolean = (value) => value === true || value === "true";
  const nextStatus = JOB_STATUSES.includes(status) ? status : "draft";
  const employerId = req.user.role === "admin" ? req.body.employerId : employer._id;

  if (!employerId) {
    throw new ApiError(400, "employerId is required for admin job posting");
  }

  const job = await Job.create({
    title,
    description,
    requirements: parseList(requirements),
    responsibilities: parseList(responsibilities),
    location,
    city: city || location.split(",")[0]?.trim() || "",
    state: state || "",
    pincode: pincode || "",
    jobType,
    salaryMin,
    salaryMax,
    currency,
    experienceLevel,
    remote: parseBoolean(remote),
    category,
    skills: parseList(skills),
    deadline,
    status: nextStatus,
    employer: employerId,
    postedBy: req.user._id,
  });

  await recordJobHistory({
    job: job._id,
    actor: req.user._id,
    action: "created",
    after: snapshotJob(job),
  }).catch((error) => {
    console.error("Failed to record job creation history:", error);
  });

  if (job.status === "open") {
    await notifyMatchingJobs({
      job,
      actorId: req.user._id,
    }).catch((error) => {
      console.error("Failed to send matching job notifications:", error);
    });
  }

  res.status(201).json({
    message: "Job posted successfully",
    job,
  });
});

const updateJob = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid job id");
  }

  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const isOwner = String(job.postedBy) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to edit this job");
  }

  const updates = req.body;
  if (updates.status !== undefined && !JOB_STATUSES.includes(updates.status)) {
    throw new ApiError(400, "Invalid job status");
  }

  const beforeSnapshot = snapshotJob(job);
  job.title = updates.title ?? job.title;
  job.description = updates.description ?? job.description;
  job.requirements = updates.requirements ? parseList(updates.requirements) : job.requirements;
  job.responsibilities = updates.responsibilities ? parseList(updates.responsibilities) : job.responsibilities;
  job.location = updates.location ?? job.location;
  job.city = updates.city ?? job.city;
  job.state = updates.state ?? job.state;
  job.pincode = updates.pincode ?? job.pincode;
  job.jobType = updates.jobType ?? job.jobType;
  job.salaryMin = updates.salaryMin ?? job.salaryMin;
  job.salaryMax = updates.salaryMax ?? job.salaryMax;
  job.currency = updates.currency ?? job.currency;
  job.experienceLevel = updates.experienceLevel ?? job.experienceLevel;
  job.remote = updates.remote === undefined ? job.remote : updates.remote === true || updates.remote === "true";
  job.category = updates.category ?? job.category;
  job.skills = updates.skills ? parseList(updates.skills) : job.skills;
  job.status = updates.status ?? job.status;
  job.deadline = updates.deadline ?? job.deadline;

  const updatedJob = await job.save();

  const afterSnapshot = snapshotJob(updatedJob);
  const changedFields = Object.entries(afterSnapshot)
    .filter(([key, value]) => beforeSnapshot[key] !== value)
    .map(([field, after]) => ({
      field,
      before: beforeSnapshot[field],
      after,
    }));
  const historyAction = getJobHistoryAction(changedFields, "updated");

  await recordJobHistory({
    job: updatedJob._id,
    actor: req.user._id,
    action: historyAction,
    before: beforeSnapshot,
    after: afterSnapshot,
  }).catch((error) => {
    console.error("Failed to record job update history:", error);
  });

  if (changedFields.length > 0) {
    await notifySavedJobFollowers({
      job: updatedJob,
      changes: changedFields,
      actorId: req.user._id,
    }).catch((error) => {
      console.error("Failed to send saved job update notifications:", error);
    });
  }

  res.json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});

const deleteJob = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid job id");
  }

  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const isOwner = String(job.postedBy) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to delete this job");
  }

  const beforeSnapshot = snapshotJob(job);
  await Application.deleteMany({ job: job._id });
  await recordJobHistory({
    job: job._id,
    actor: req.user._id,
    action: "deleted",
    before: beforeSnapshot,
  }).catch((error) => {
    console.error("Failed to record job deletion history:", error);
  });
  await notifySavedJobDeletion({
    job,
    actorId: req.user._id,
  }).catch((error) => {
    console.error("Failed to send saved job deletion notifications:", error);
  });
  await job.deleteOne();

  res.json({
    message: "Job deleted successfully",
  });
});

const getMyJobs = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { postedBy: req.user._id };

  const jobs = await Job.find(filter)
    .populate("employer", "companyName location website industry")
    .sort({ createdAt: -1 });

  res.json({ jobs });
});

export { listJobs, getRecommendedJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
