import mongoose from "mongoose";

// One doc per (user, feature, UTC day). The unique index lets claimQuota's
// upsert + $inc act as a race-safe atomic counter.
const usageCounterSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    feature: { type: String, required: true },
    day: { type: String, required: true }, // "YYYY-MM-DD" (UTC)
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

usageCounterSchema.index({ userId: 1, feature: 1, day: 1 }, { unique: true });

const UsageCounter = mongoose.model("UsageCounter", usageCounterSchema);

export default UsageCounter;
