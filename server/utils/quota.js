import UsageCounter from "../models/UsageCounter.js";

export const utcDay = () => new Date().toISOString().slice(0, 10);

/**
 * Atomically claim one unit of quota. Returns the post-increment count.
 *
 * Uses findOneAndUpdate with upsert + $inc so concurrent requests can never
 * read-then-write (the TOCTOU race the old count-then-act limiters had).
 */
export const claimQuota = async (userId, feature) => {
  const day = utcDay();
  const doc = await UsageCounter.findOneAndUpdate(
    { userId, feature, day },
    { $inc: { count: 1 }, $setOnInsert: { userId, feature, day } },
    { upsert: true, new: true, select: "count" }
  );
  return doc.count;
};

export const refundQuota = async (userId, feature) => {
  const day = utcDay();
  await UsageCounter.updateOne(
    { userId, feature, day, count: { $gt: 0 } },
    { $inc: { count: -1 } }
  );
};
