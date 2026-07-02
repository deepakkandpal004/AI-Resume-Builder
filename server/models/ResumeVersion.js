import mongoose from "mongoose";

const ResumeVersionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
  label: { type: String, default: "" },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

ResumeVersionSchema.index({ resumeId: 1, createdAt: -1 });

export default mongoose.model("ResumeVersion", ResumeVersionSchema);
