import CollectedJob from "../models/CollectedJob.js";
import AgentLog from "../models/AgentLog.js";
import Job from "../models/Job.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { executeAgentCollection } from "../services/jobAgent/collectorService.js";
import { publishJobToPortal } from "../services/jobAgent/verificationService.js";
import { getSchedulerStatus, updateSchedulerExpression } from "../services/jobAgent/schedulerService.js";
import { runExpirySweep } from "../services/jobAgent/expiryService.js";
import { seedPanIndiaJobsDataset } from "../scripts/seedPanIndiaJobs.js";

const triggerManualRun = asyncHandler(async (req, res) => {
  const resultLog = await executeAgentCollection("admin_manual");
  await runExpirySweep();

  res.json({
    message: "Collection run completed successfully",
    log: resultLog,
  });
});

const importDemoDataset = asyncHandler(async (req, res) => {
  const count = Number(req.body.count || 1000);
  const result = await seedPanIndiaJobsDataset(count);

  res.json({
    message: `Successfully imported ${result.totalCreated} Pan-India demo job listings in ${result.durationSec}s`,
    result,
  });
});

const getAgentLogs = asyncHandler(async (req, res) => {
  const logs = await AgentLog.find().sort({ createdAt: -1 }).limit(50);
  res.json({ logs });
});

const getCollectedJobs = asyncHandler(async (req, res) => {
  const { status, verificationStatus, isLocal, category, city, state, minConfidence, q } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (isLocal !== undefined && isLocal !== "") filter.isLocal = isLocal === "true";
  if (category) filter.category = category;
  if (city) filter.city = new RegExp(city, "i");
  if (state) filter.state = new RegExp(state, "i");
  if (minConfidence) filter.confidenceScore = { $gte: Number(minConfidence) };

  if (q) {
    filter.$or = [
      { title: new RegExp(q, "i") },
      { companyName: new RegExp(q, "i") },
      { city: new RegExp(q, "i") },
      { state: new RegExp(q, "i") },
      { category: new RegExp(q, "i") },
    ];
  }

  const jobs = await CollectedJob.find(filter).sort({ createdAt: -1 }).limit(100);
  const totalCount = await CollectedJob.countDocuments(filter);

  res.json({
    jobs,
    totalCount,
  });
});

const verifyCollectedJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // "approve" or "reject"

  const collectedJob = await CollectedJob.findById(id);
  if (!collectedJob) {
    throw new ApiError(404, "Collected job record not found");
  }

  if (action === "approve") {
    if (collectedJob.publishedJobId) {
      const existingJob = await Job.findById(collectedJob.publishedJobId);
      if (existingJob) {
        existingJob.status = "open";
        await existingJob.save();
      }
    } else {
      await publishJobToPortal(collectedJob);
    }

    collectedJob.verificationStatus = "verified";
    collectedJob.verifiedBy = req.user._id;
    collectedJob.verifiedAt = new Date();
    await collectedJob.save();

    res.json({
      message: "Job approved and published to portal",
      job: collectedJob,
    });
    return;
  }

  if (action === "reject") {
    collectedJob.verificationStatus = "rejected";
    collectedJob.status = "archived";
    await collectedJob.save();

    if (collectedJob.publishedJobId) {
      await Job.findByIdAndUpdate(collectedJob.publishedJobId, { status: "closed" });
    }

    res.json({
      message: "Job rejected and archived",
      job: collectedJob,
    });
    return;
  }

  throw new ApiError(400, "Invalid verification action. Must be 'approve' or 'reject'");
});

const getAgentAnalytics = asyncHandler(async (req, res) => {
  const [
    totalCollected,
    newTodayCount,
    pendingVerificationCount,
    verifiedCount,
    archivedCount,
    localJobsCount,
    categoryBreakdown,
    cityBreakdown,
    stateBreakdown,
    sourceBreakdown,
    recentRuns,
  ] = await Promise.all([
    CollectedJob.countDocuments(),
    CollectedJob.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    CollectedJob.countDocuments({ verificationStatus: "pending" }),
    CollectedJob.countDocuments({ verificationStatus: "verified" }),
    CollectedJob.countDocuments({ status: { $in: ["archived", "expired"] } }),
    CollectedJob.countDocuments({ isLocal: true }),

    CollectedJob.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    CollectedJob.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    CollectedJob.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    CollectedJob.aggregate([
      { $group: { _id: "$sourceName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    AgentLog.find({ status: "completed" }).sort({ createdAt: -1 }).limit(10),
  ]);

  const duplicatesPrevented = recentRuns.reduce((acc, run) => acc + (run.stats?.duplicatesPrevented || 0), 0);
  const updatedJobsCount = recentRuns.reduce((acc, run) => acc + (run.stats?.jobsUpdated || 0), 0);

  const avgConfidenceResult = await CollectedJob.aggregate([
    { $group: { _id: null, avgScore: { $avg: "$confidenceScore" } } },
  ]);
  const averageConfidence = avgConfidenceResult[0]?.avgScore ? Math.round(avgConfidenceResult[0].avgScore) : 85;

  res.json({
    kpis: {
      totalCollected,
      newTodayCount,
      pendingVerificationCount,
      verifiedCount,
      archivedCount,
      localJobsCount,
      duplicatesPrevented,
      updatedJobsCount,
      averageConfidence,
    },
    analytics: {
      byCategory: categoryBreakdown.map((item) => ({ category: item._id || "General", count: item.count })),
      byCity: cityBreakdown.map((item) => ({ city: item._id || "Remote", count: item.count })),
      byState: stateBreakdown.map((item) => ({ state: item._id || "Pan-India", count: item.count })),
      bySource: sourceBreakdown.map((item) => ({ source: item._id || "Other", count: item.count })),
    },
    scheduler: getSchedulerStatus(),
  });
});

const getAgentConfig = asyncHandler(async (req, res) => {
  res.json({
    scheduler: getSchedulerStatus(),
    confidenceThreshold: 70,
  });
});

const updateAgentConfig = asyncHandler(async (req, res) => {
  const { cronSchedule } = req.body;

  if (cronSchedule) {
    updateSchedulerExpression(cronSchedule);
  }

  res.json({
    message: "Agent configuration updated successfully",
    scheduler: getSchedulerStatus(),
  });
});

export {
  triggerManualRun,
  importDemoDataset,
  getAgentLogs,
  getCollectedJobs,
  verifyCollectedJob,
  getAgentAnalytics,
  getAgentConfig,
  updateAgentConfig,
};
