import getImageKit from "../config/imageKit.js";
import mongoose from "mongoose";
import Resume from "../models/resume.js";
import ResumeVersion from "../models/ResumeVersion.js";
import fs from "fs";
import { getMongoUserId } from "../utils/userHelper.js";

// POST: api/resumes/create
export const createResume = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { title } = req.body;
    const newResume = await Resume.create({ userId, title });
    return res.status(201).json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// DELETE: api/resumes/delete
export const deleteResume = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId } = req.params;
    await Resume.findOneAndDelete({ userId, _id: resumeId });
    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET: /api/resumes/get/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId: rawId } = req.params;
    const id = (rawId || "").match(/[a-fA-F0-9]{24}/)?.[0] || "";
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ userId, _id: id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET: api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId: rawId } = req.params;
    const id = (rawId || "").match(/[a-fA-F0-9]{24}/)?.[0] || "";
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Invalid resume id" });
    }
    const resume = await Resume.findOne({ public: true, _id: id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;
    return res.status(200).json(resume);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST: api/resumes/duplicate/:resumeId
export const duplicateResume = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId } = req.params;
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
    return res.status(400).json({ message: error.message });
  }
};

// PUT: api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    const existingResume = await Resume.findOne({ userId, _id: resumeId });

    const parsePayload = (payload) => {
      let data = payload;
      for (let i = 0; i < 2; i++) {
        if (typeof data === "string") {
          try { data = JSON.parse(data); } catch { break; }
        }
      }
      if (!data || typeof data !== "object") throw new Error("Invalid resumeData payload");
      return data;
    };

    let resumeDataCopy = parsePayload(resumeData);
    if (!resumeDataCopy.personal_info) resumeDataCopy.personal_info = {};

    if (!resumeDataCopy.personal_info.image || resumeDataCopy.personal_info.image === "") {
      resumeDataCopy.personal_info.image = existingResume?.personal_info?.image || "";
    }

    const isRemoveBackground = removeBackground === "true" || removeBackground === true;

    if (image) {
      const uploadOptions = {
        file: fs.createReadStream(image.path),
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
        const tr = "tr=c-maintain_ratio,fo-face,w-300,h-300";
        resumeDataCopy.personal_info.image = baseUrl.includes("?") ? `${baseUrl}&${tr}` : `${baseUrl}?${tr}`;
      } catch {
        resumeDataCopy.personal_info.image = existingResume?.personal_info?.image || resumeDataCopy.personal_info.image || "";
      } finally {
        fs.unlink(image.path, () => {});
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
      resumeDataCopy,
      { new: true }
    );

    return res.status(200).json({ message: "Saved successfully", resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET /api/resumes/versions/:resumeId
export const listVersions = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId } = req.params;
    const resume = await Resume.findOne({ userId, _id: resumeId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const versions = await ResumeVersion.find({ resumeId })
      .select("createdAt label _id")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ versions });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST /api/resumes/restore/:resumeId/:versionId
export const restoreVersion = async (req, res) => {
  try {
    const userId = await getMongoUserId(req.userId);
    if (!userId) return res.status(404).json({ message: "User not found" });

    const { resumeId, versionId } = req.params;
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
    return res.status(400).json({ message: error.message });
  }
};
