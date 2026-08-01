import Job from "../../models/Job.js";
import Employer from "../../models/Employer.js";
import User from "../../models/User.js";

const calculateConfidenceScore = (job) => {
  let score = 50;
  const reasons = [];

  if (job.suspiciousCheck?.isSuspicious) {
    score -= 50;
    reasons.push(`Suspicious content flag: ${job.suspiciousCheck.reason}`);
  } else {
    score += 10;
    reasons.push("Passed spam/suspicious content check");
  }

  if (job.sourceName && ["Arbeitnow", "Government Portal", "Remotive", "Company Careers", "Verified Partner"].includes(job.sourceName)) {
    score += 20;
    reasons.push(`High source credibility (${job.sourceName})`);
  } else if (job.sourceUrl && job.sourceUrl.startsWith("http")) {
    score += 10;
    reasons.push("Valid web source URL provided");
  }

  if (job.description && job.description.length > 200) {
    score += 10;
    reasons.push("Comprehensive description provided");
  }

  if (job.skills && job.skills.length > 0) {
    score += 5;
    reasons.push(`Extracted ${job.skills.length} relevant skills`);
  }

  if (job.salaryMin || job.salaryMax) {
    score += 5;
    reasons.push("Explicit salary information available");
  }

  if (job.city && job.city !== "Remote") {
    score += 5;
    reasons.push(`Geographic location verified (${job.city})`);
  }

  if (job.isLocal) {
    reasons.push("Flagged as Local Business listing (Requires Admin Verification)");
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    reasons,
  };
};

const getSystemAdminUser = async () => {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@smartjob.local").trim().toLowerCase();
  let adminUser = await User.findOne({ role: "admin", email: adminEmail });

  if (!adminUser) {
    adminUser = await User.findOne({ role: "admin" });
  }

  return adminUser;
};

const escapeRegex = (string = "") => String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getOrCreateEmployerForCompany = async (companyName, location, website = "", userId) => {
  let employer = await Employer.findOne({ companyName: new RegExp(`^${escapeRegex(companyName)}$`, "i") });

  if (!employer) {
    employer = await Employer.create({
      companyName,
      location: location || "Remote",
      website: website || "https://smartjobportal.local",
      industry: "General",
      description: `Automated listing provider for ${companyName}`,
      user: userId,
    });
  }

  return employer;
};

const publishJobToPortal = async (collectedJob) => {
  const adminUser = await getSystemAdminUser();

  if (!adminUser) {
    throw new Error("System Admin user not available to publish job");
  }

  const employer = await getOrCreateEmployerForCompany(
    collectedJob.companyName,
    collectedJob.location,
    collectedJob.sourceUrl,
    adminUser._id
  );

  let jobType = collectedJob.employmentType || "full-time";
  if (!["full-time", "part-time", "contract", "internship", "freelance"].includes(jobType)) {
    jobType = "full-time";
  }

  const publishedJob = await Job.create({
    title: collectedJob.title,
    description: collectedJob.description,
    requirements: collectedJob.skills || [],
    responsibilities: [],
    location: collectedJob.location,
    jobType,
    salaryMin: collectedJob.salaryMin || 0,
    salaryMax: collectedJob.salaryMax || 0,
    currency: collectedJob.currency || "INR",
    experienceLevel: collectedJob.experienceLevel || "entry",
    remote: Boolean(collectedJob.remote),
    category: collectedJob.category || "General",
    skills: collectedJob.skills || [],
    status: "open",
    deadline: collectedJob.deadline || undefined,
    employer: employer._id,
    postedBy: adminUser._id,
  });

  collectedJob.verificationStatus = "verified";
  collectedJob.verifiedBy = adminUser._id;
  collectedJob.verifiedAt = new Date();
  collectedJob.publishedJobId = publishedJob._id;
  await collectedJob.save();

  return publishedJob;
};

export { calculateConfidenceScore, publishJobToPortal };
