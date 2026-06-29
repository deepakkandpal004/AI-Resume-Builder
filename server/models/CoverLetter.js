import mongoose from "mongoose";

const CoverLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
    index: true,
  },
  companyName: {
    type: String,
    default: "",
  },
  positionTitle: {
    type: String,
    default: "",
  },
  jobDescription: {
    type: String,
    default: "",
  },
  tone: {
    type: String,
    enum: ["formal", "conversational", "enthusiastic"],
    default: "formal",
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Index for efficient queries
CoverLetterSchema.index({ userId: 1, resumeId: 1, createdAt: -1 });

const CoverLetter = mongoose.model("CoverLetter", CoverLetterSchema);

export default CoverLetter;
