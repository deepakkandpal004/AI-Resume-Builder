import { stringify } from "querystring";
import imagekit from "../config/imageKit.js";
import mongoose from "mongoose";
import Resume from "../models/resume.js";
import fs from "fs";

// controller for new resume
/// POST: api/resumes/create

export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    // create new resume
    const newResume = await Resume.create({ userId, title });
    return res
      .status(201)
      .json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// controller for deleting a resume
// DELETE: api/resumes/delete

export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    await Resume.findOneAndDelete({ userId, _id: resumeId });

    // return success message
    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get user resume by id
// GET: /api/resumes/get

export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId: rawId } = req.params;
    const id = (rawId || "").match(/[a-fA-F0-9]{24}/)?.[0] || "";
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findOne({ userId, _id: id });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(201).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get user by public id
// GET: api/users/public

export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId: rawId } = req.params;
    const id = (rawId || "").match(/[a-fA-F0-9]{24}/)?.[0] || "";
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Invalid resume id" });
    }
    const resume = await Resume.findOne({ public: true, _id: id });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;
    return res.status(200).json(resume);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// controller for updating a resume
// PUT: api/resumes/update

export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    const existingResume = await Resume.findOne({ userId, _id: resumeId });

    const parsePayload = (payload) => {
      let data = payload;
      for (let i = 0; i < 2; i++) {
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            break;
          }
        }
      }
      if (!data || typeof data !== "object") {
        throw new Error("Invalid resumeData payload");
      }
      return data;
    };

    let resumeDataCopy = parsePayload(resumeData);
    if (!resumeDataCopy.personal_info) {
      resumeDataCopy.personal_info = {};
    }
    // Preserve existing image if client sends empty/missing image
    if (!resumeDataCopy.personal_info.image || resumeDataCopy.personal_info.image === "") {
      resumeDataCopy.personal_info.image = existingResume?.personal_info?.image || "";
    }

    if (image) {
      const imageBufferData = fs.createReadStream(image.path);
      const isRemoveBackground = removeBackground === "true" || removeBackground === true;

      const uploadOptions = {
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
      };
      if (isRemoveBackground) {
        uploadOptions.extensions = [
          { name: "remove-bg", options: { add_shadow: false } }
        ];
      }
      let uploadFailed = false;
      try {
        const response = await imagekit.files.upload(uploadOptions);
        const endpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/deepakkandpal";
        const basePath = response?.filePath
          ? `${endpoint}/${response.filePath}`
          : response?.url || `${endpoint}/${response?.filePath || ""}`;
        const tr = `tr=c-maintain_ratio,fo-face,w-300,h-300${isRemoveBackground ? ",e-bgremove" : ""}`;
        const imageUrl = basePath.includes("?") ? `${basePath}&${tr}` : `${basePath}?${tr}`;
        resumeDataCopy.personal_info.image = imageUrl;
      } catch (e) {
        uploadFailed = true;
        // Keep existing image on failure
        resumeDataCopy.personal_info.image = existingResume?.personal_info?.image || resumeDataCopy.personal_info.image || "";
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
