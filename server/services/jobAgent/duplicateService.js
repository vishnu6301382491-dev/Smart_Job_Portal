import crypto from "crypto";
import CollectedJob from "../../models/CollectedJob.js";

const generateFingerprint = (title = "", companyName = "", location = "") => {
  const normTitle = String(title).toLowerCase().replace(/[^a-z0-9]/g, "");
  const normCompany = String(companyName).toLowerCase().replace(/[^a-z0-9]/g, "");
  const normLoc = String(location).toLowerCase().replace(/[^a-z0-9]/g, "");

  const rawKey = `${normTitle}:${normCompany}:${normLoc}`;
  return crypto.createHash("sha256").update(rawKey).digest("hex");
};

const calculateTextSimilarity = (str1 = "", str2 = "") => {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const word of words1) {
    if (words2.has(word)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
};

const escapeRegex = (string = "") => String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const processDuplicateCheckAndMerge = async (cleanedJob) => {
  const fingerprint = generateFingerprint(cleanedJob.title, cleanedJob.companyName, cleanedJob.city || cleanedJob.location);
  cleanedJob.duplicateFingerprint = fingerprint;

  let existingJob = await CollectedJob.findOne({ duplicateFingerprint: fingerprint });

  if (!existingJob) {
    const candidateJobs = await CollectedJob.find({
      companyName: new RegExp(`^${escapeRegex(cleanedJob.companyName)}$`, "i"),
      status: { $ne: "archived" },
    }).limit(10);

    for (const candidate of candidateJobs) {
      const similarity = calculateTextSimilarity(cleanedJob.description, candidate.description);
      if (similarity > 0.75) {
        existingJob = candidate;
        break;
      }
    }
  }

  if (!existingJob) {
    return { isDuplicate: false, existingJob: null };
  }

  const changes = [];
  const fieldsToCheck = ["salaryMin", "salaryMax", "description", "skills", "deadline", "location", "isLocal"];

  for (const field of fieldsToCheck) {
    const beforeVal = existingJob[field];
    const afterVal = cleanedJob[field];

    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal) && afterVal !== null && afterVal !== undefined) {
      changes.push({
        field,
        before: beforeVal,
        after: afterVal,
        updatedAt: new Date(),
      });
      existingJob[field] = afterVal;
    }
  }

  if (changes.length > 0) {
    existingJob.status = "updated";
    existingJob.history.push(...changes);
    await existingJob.save();
    return { isDuplicate: true, action: "updated", job: existingJob, changesCount: changes.length };
  }

  return { isDuplicate: true, action: "skipped", job: existingJob, changesCount: 0 };
};

export { generateFingerprint, calculateTextSimilarity, processDuplicateCheckAndMerge };
