import getImageKit from "../config/imageKit.js";
import logger from "../observability/logger.js";
import mongoose from "mongoose";
import Resume from "../models/resume.js";
import ResumeVersion from "../models/ResumeVersion.js";
import { getMongoUserId } from "../utils/userHelper.js";

// Fields a client may modify on a resume. Everything else (userId, _id,
// timestamps, __v) is stripped before writing — prevents mass assignment.
const EDITABLE_FIELDS = [
  "title", "template", "accent_color", "professional_summary", "skills",
  "personal_info", "experience", "project", "education", "certifications",
  "languages", "custom_sections", "style_options", "section_headings", "public",
];

const parsePayload = (payload) => {
  let data = payload;
  for (let i = 0; i < 2; i++) {
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch { break; }
    }
  }
  if (!data || typeof data !== "object") throw new Error("INVALID_RESUME_DATA");
  return data;
};

const buildSafeUpdate = (payload) => {
  const data = parsePayload(payload);
  const safeUpdate = {};
  for (const key of EDITABLE_FIELDS) {
    if (data[key] !== undefined) safeUpdate[key] = data[key];
  }
  if (!safeUpdate.personal_info) safeUpdate.personal_info = {};
  return safeUpdate;
};

// POST: api/resumes/create
export const createResume = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { title } = req.body;
    const newResume = await Resume.create({ userId, title });
    return res.status(201).json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    logger.error("createResume failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE: api/resumes/delete
export const deleteResume = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId } = req.params;
    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    await Resume.findOneAndDelete({ userId, _id: resumeId });
    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    logger.error("deleteResume failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// GET: /api/resumes/get/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId } = req.params;
    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ userId, _id: resumeId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(200).json({ resume });
  } catch (error) {
    logger.error("getResumeById failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// GET: api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ public: true, _id: resumeId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;
    return res.status(200).json(resume);
  } catch (error) {
    logger.error("getPublicResumeById failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// POST: api/resumes/duplicate/:resumeId
export const duplicateResume = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId } = req.params;
    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const original = await Resume.findOne({ userId, _id: resumeId }).lean();
    if (!original) return res.status(404).json({ message: "Resume not found" });

    const { _id, createdAt, updatedAt, __v, ...rest } = original;
    const copy = await Resume.create({
      ...rest,
      title: `${original.title} (Copy)`,
      public: false,
    });

    return res.status(201).json({ message: "Resume duplicated", resume: copy });
  } catch (error) {
    logger.error("duplicateResume failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// PUT: api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const existingResume = await Resume.findOne({ userId, _id: resumeId });

    // Whitelist client fields — blocks mass assignment of userId/_id/etc.
    const safeUpdate = buildSafeUpdate(resumeData);

    // Preserve the stored photo only when the client didn't send an image field
    // (undefined = not provided). Explicit null/"" = user intentionally cleared it.
    if (safeUpdate.personal_info && safeUpdate.personal_info.image === undefined) {
      safeUpdate.personal_info.image = existingResume?.personal_info?.image || "";
    }

    const isRemoveBackground = removeBackground === "true" || removeBackground === true;

    if (image) {
      const uploadOptions = {
        file: image.buffer,
        fileName: `${userId}_${resumeId}.jpg`,
        folder: "user-resumes",
      };
      if (isRemoveBackground) {
        uploadOptions.extensions = [{ name: "remove-bg", options: { add_shadow: false } }];
      }
      try {
        const response = await getImageKit().files.upload(uploadOptions);
        const endpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/deepakkandpal";
        const filePath = response?.filePath || "";
        const baseUrl = filePath ? `${endpoint}/${filePath}` : response?.url || "";
        safeUpdate.personal_info.image = baseUrl;
      } catch (error) {
        logger.error("ImageKit upload failed:", error.message);
        safeUpdate.personal_info.image = existingResume?.personal_info?.image || safeUpdate.personal_info.image || "";
      }
    }

    if (existingResume) {
      await ResumeVersion.create({
        userId,
        resumeId,
        label: "",
        snapshot: existingResume.toObject(),
      });
      const versions = await ResumeVersion.find({ resumeId }).sort({ createdAt: -1 }).lean();
      if (versions.length > 20) {
        const toDelete = versions.slice(20).map(v => v._id);
        await ResumeVersion.deleteMany({ _id: { $in: toDelete } });
      }
    }

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      safeUpdate,
      { new: true }
    );
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    return res.status(200).json({ message: "Saved successfully", resume });
  } catch (error) {
    if (error.message === "INVALID_RESUME_DATA") {
      return res.status(400).json({ message: "Invalid resumeData payload" });
    }
    logger.error("updateResume failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /api/resumes/versions/:resumeId
export const listVersions = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId } = req.params;
    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ userId, _id: resumeId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const versions = await ResumeVersion.find({ resumeId })
      .select("createdAt label _id")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ versions });
  } catch (error) {
    logger.error("listVersions failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /api/resumes/restore/:resumeId/:versionId
export const restoreVersion = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId, versionId } = req.params;
    if (!mongoose.isValidObjectId(resumeId) || !mongoose.isValidObjectId(versionId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const resume = await Resume.findOne({ userId, _id: resumeId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const version = await ResumeVersion.findOne({ _id: versionId, resumeId });
    if (!version) return res.status(404).json({ message: "Version not found" });

    const { _id, __v, userId: vUserId, resumeId: vResumeId, createdAt, updatedAt, ...snapshot } = version.snapshot;

    const restored = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      snapshot,
      { new: true }
    );

    return res.status(200).json({ message: "Restored successfully", resume: restored });
  } catch (error) {
    logger.error("restoreVersion failed:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
