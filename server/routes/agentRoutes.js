import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  triggerManualRun,
  importDemoDataset,
  getAgentLogs,
  getCollectedJobs,
  verifyCollectedJob,
  getAgentAnalytics,
  getAgentConfig,
  updateAgentConfig,
} from "../controllers/agentController.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.post("/run", triggerManualRun);
router.post("/import-demo", importDemoDataset);
router.get("/logs", getAgentLogs);
router.get("/jobs", getCollectedJobs);
router.patch("/jobs/:id/verify", verifyCollectedJob);
router.get("/analytics", getAgentAnalytics);
router.get("/config", getAgentConfig);
router.put("/config", updateAgentConfig);

export default router;
