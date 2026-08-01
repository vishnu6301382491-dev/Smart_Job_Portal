import CollectedJob from "../../models/CollectedJob.js";
import Job from "../../models/Job.js";

const runExpirySweep = async (logger = console.log) => {
  const now = new Date();
  let archivedCount = 0;

  const expiredJobs = await CollectedJob.find({
    status: { $in: ["active", "updated"] },
    deadline: { $ne: null, $lt: now },
  });

  for (const collectedJob of expiredJobs) {
    collectedJob.status = "archived";
    collectedJob.history.push({
      field: "status",
      before: "active",
      after: "archived",
      updatedAt: now,
    });

    await collectedJob.save();
    archivedCount++;

    if (collectedJob.publishedJobId) {
      await Job.findByIdAndUpdate(collectedJob.publishedJobId, { status: "closed" });
    }
  }

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const staleJobs = await CollectedJob.find({
    status: { $in: ["active", "updated"] },
    deadline: null,
    createdAt: { $lt: thirtyDaysAgo },
  });

  for (const staleJob of staleJobs) {
    staleJob.status = "expired";
    staleJob.history.push({
      field: "status",
      before: "active",
      after: "expired",
      updatedAt: now,
    });

    await staleJob.save();
    archivedCount++;

    if (staleJob.publishedJobId) {
      await Job.findByIdAndUpdate(staleJob.publishedJobId, { status: "closed" });
    }
  }

  logger(`Expiry sweep complete: Archived/Expired ${archivedCount} jobs`);
  return { archivedCount };
};

export { runExpirySweep };
