import mongoose from "mongoose";

const agentLogSchema = new mongoose.Schema(
  {
    runId: {
      type: String,
      required: true,
      unique: true,
    },
    triggeredBy: {
      type: String,
      enum: ["scheduler", "admin_manual", "system_init"],
      default: "scheduler",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },
    stats: {
      totalCollected: { type: Number, default: 0 },
      newInserted: { type: Number, default: 0 },
      duplicatesPrevented: { type: Number, default: 0 },
      jobsUpdated: { type: Number, default: 0 },
      expiredArchived: { type: Number, default: 0 },
      autoPublished: { type: Number, default: 0 },
      pendingVerification: { type: Number, default: 0 },
      failedAttempts: { type: Number, default: 0 },
    },
    sourcesCrawled: {
      type: [
        {
          sourceName: { type: String, required: true },
          itemsCount: { type: Number, default: 0 },
          status: { type: String, default: "success" },
          error: { type: String, default: "" },
        },
      ],
      default: [],
    },
    logs: {
      type: [
        {
          level: { type: String, enum: ["info", "warn", "error"], default: "info" },
          message: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    errorDetails: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const AgentLog = mongoose.model("AgentLog", agentLogSchema);

export default AgentLog;
