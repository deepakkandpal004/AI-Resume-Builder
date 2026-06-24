import mongoose from "mongoose";

const skillsGapItemSchema = new mongoose.Schema({
  skill:    { type: String, required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"], required: true },
  category: { type: String, default: "" },
}, { _id: false });

const suggestionSchema = new mongoose.Schema({
  text:        { type: String, required: true },
  scoreImpact: { type: Number, required: true, min: 1, max: 20 },
  section:     { type: String, default: "" },
}, { _id: false });

const atsScanSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resumeId:        { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true, index: true },
  jdSnippet:       { type: String, maxlength: 500, default: "" },
  atsScore:        { type: Number, required: true, min: 0, max: 100 },
  matchedKeywords: { type: [String], default: [] },
  missingKeywords: { type: [String], default: [] },
  skillsGap:       { type: [skillsGapItemSchema], default: [] },
  suggestions:     { type: [suggestionSchema], default: [] },
}, { timestamps: true });

atsScanSchema.index({ userId: 1, createdAt: -1 });
atsScanSchema.index({ resumeId: 1, createdAt: -1 });
atsScanSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const AtsScore = mongoose.model("AtsScore", atsScanSchema);
export default AtsScore;
