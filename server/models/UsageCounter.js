import mongoose from "mongoose";

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
usageCounterSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3024000 });

const UsageCounter = mongoose.model("UsageCounter", usageCounterSchema);

export default UsageCounter;
