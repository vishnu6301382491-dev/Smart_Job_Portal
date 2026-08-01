import mongoose from "mongoose";

const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "Custom Job Alert",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ["all", "entry", "mid", "senior", "lead"],
      default: "all",
    },
    frequency: {
      type: String,
      enum: ["instant", "daily", "weekly"],
      default: "instant",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastAlertSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

jobAlertSchema.index({ isActive: 1, city: 1, category: 1 });

const JobAlert = mongoose.model("JobAlert", jobAlertSchema);

export default JobAlert;
