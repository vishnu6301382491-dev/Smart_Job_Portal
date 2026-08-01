import JobAlert from "../models/JobAlert.js";
import Job from "../models/Job.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendAlertCreatedEmail, sendMatchingJobAlertEmail } from "../services/emailService.js";
import { matchesLocationQuery } from "../utils/locationHelper.js";

const createAlert = asyncHandler(async (req, res) => {
  const { title, city, category, skills, experienceLevel, frequency } = req.body;

  const alert = await JobAlert.create({
    user: req.user._id,
    title: title || "Job Alert",
    city: city || "",
    category: category || "",
    skills: Array.isArray(skills) ? skills : String(skills || "").split(",").map((s) => s.trim()).filter(Boolean),
    experienceLevel: experienceLevel || "all",
    frequency: frequency || "instant",
  });

  console.log(`[ALERT_CREATED] User: ${req.user.email} (${req.user._id}) | Alert: ${alert.title} | City: ${alert.city}`);

  // Send confirmation email asynchronously
  void sendAlertCreatedEmail({ user: req.user, alert }).catch((err) => {
    console.error(`[ALERT_EMAIL_FAILED] Target: ${req.user.email} | Error:`, err.message);
  });

  // Check existing jobs and notify if matches exist
  void (async () => {
    try {
      const openJobs = await Job.find({ status: "open" }).populate("employer", "companyName").limit(5);
      for (const job of openJobs) {
        const matchesCity = !alert.city || matchesLocationQuery(job.location, alert.city);
        const matchesCat = !alert.category || (job.category || "").toLowerCase().includes(alert.category.toLowerCase());
        if (matchesCity && matchesCat) {
          await sendMatchingJobAlertEmail({ user: req.user, alert, job });
        }
      }
    } catch (err) {
      console.error("[INITIAL_MATCH_EMAIL_ERROR]", err.message);
    }
  })();

  res.status(201).json({
    message: "Job alert created successfully",
    alert,
  });
});

const getMyAlerts = asyncHandler(async (req, res) => {
  const alerts = await JobAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ alerts });
});

const toggleAlertStatus = asyncHandler(async (req, res) => {
  const alert = await JobAlert.findOne({ _id: req.params.id, user: req.user._id });

  if (!alert) {
    throw new ApiError(404, "Job alert not found");
  }

  alert.isActive = !alert.isActive;
  await alert.save();

  console.log(`[ALERT_TOGGLE] Alert ID: ${alert._id} | User: ${req.user.email} | Active: ${alert.isActive}`);

  res.json({
    message: `Job alert ${alert.isActive ? "activated" : "deactivated"}`,
    alert,
  });
});

const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await JobAlert.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!alert) {
    throw new ApiError(404, "Job alert not found");
  }

  console.log(`[ALERT_DELETED] Alert ID: ${req.params.id} | User: ${req.user.email}`);

  res.json({
    message: "Job alert deleted successfully",
  });
});

export { createAlert, getMyAlerts, toggleAlertStatus, deleteAlert };
