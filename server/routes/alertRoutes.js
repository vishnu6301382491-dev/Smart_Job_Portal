import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createAlert,
  getMyAlerts,
  toggleAlertStatus,
  deleteAlert,
} from "../controllers/alertController.js";

const router = express.Router();

router.use(protect);

router.post("/", createAlert);
router.get("/", getMyAlerts);
router.patch("/:id/toggle", toggleAlertStatus);
router.delete("/:id", deleteAlert);

export default router;
