import mongoose from "mongoose";

const searchAnalyticsSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ip: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

searchAnalyticsSchema.index({ location: 1, createdAt: -1 });
searchAnalyticsSchema.index({ query: 1 });

const SearchAnalytics = mongoose.model("SearchAnalytics", searchAnalyticsSchema);

export default SearchAnalytics;
