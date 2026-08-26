import mongoose from "mongoose";
import logger from "../observability/logger.js";
import Resume from "../models/resume.js";
import AtsScore from "../models/AtsScore.js";
import User from "../models/User.js";
import getAI from "../config/ai.js";
import { buildResumeText, normalizeText, buildAtsPrompt, parseAtsResponse, AtsParseError } from "../services/atsService.js";
import { getMongoUserId } from "../utils/userHelper.js";


// GET /api/ai/ats-score/:resumeId
export const getScanHistory = async (req, res) => {
  const { resumeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    return res.status(400).json({ message: "Invalid resume ID." });
  }

  let resume;
  try {
    resume = await Resume.findById(resumeId);
  } catch (err) {
    return res.status(503).json({ message: "Database unavailable. Please try again." });
  }

  if (!resume) {
    return res.status(404).json({ message: "Resume not found." });
  }

  if (resume.userId.toString() !== (await getMongoUserId(req.userId)).toString()) {
    return res.status(403).json({ message: "Access denied." });
  }

  const scans = await AtsScore.find({ resumeId }).sort({ createdAt: -1 }).limit(10);

  const result = scans.map((doc) => ({
    scanId: doc._id,
    atsScore: doc.atsScore,
    jdSnippet: doc.jdSnippet,
    matchedKeywords: doc.matchedKeywords,
    missingKeywords: doc.missingKeywords,
    skillsGap: doc.skillsGap,
    suggestions: doc.suggestions,
    createdAt: doc.createdAt,
  }));

  return res.status(200).json({ scans: result });
};

//POST /api/ai/ats-score
export const runAtsScan = async (req, res) => {
  const { resumeId, jobDescription } = req.body;

  if (!resumeId || !jobDescription) {
    return res.status(400).json({ message: "resumeId and jobDescription are required." });
  }

  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    return res.status(400).json({ message: "Invalid resume ID." });
  }

  if (jobDescription.length < 50 || jobDescription.length > 10000) {
    return res.status(400).json({ message: "jobDescription must be between 50 and 10,000 characters." });
  }
  let resume;
  try {
    resume = await Resume.findById(resumeId);
  } catch (err) {
    return res.status(503).json({ message: "Database unavailable. Please try again." });
  }

  if (!resume) {
    return res.status(404).json({ message: "Resume not found." });
  }

  if (resume.userId.toString() !== (await getMongoUserId(req.userId)).toString()) {
    return res.status(403).json({ message: "Access denied." });
  }

  const rawText = buildResumeText(resume);
  const normalizedResumeText = normalizeText(rawText);

  if (normalizedResumeText.trim().length === 0) {
    return res.status(422).json({
      message: "Resume has no content to analyze. Please add content to your resume before running an ATS scan.",
    });
  }

  const messages = buildAtsPrompt(normalizedResumeText, jobDescription);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  let aiResponse;
  try {
    aiResponse = await getAI().chat.completions.create(
      {
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages,
        response_format: { type: "json_object" },
      },
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    if (
      err.name === "AbortError" ||
      err.code === "ABORT_ERR" ||
      err.message?.includes("abort")
    ) {
      return res.status(504).json({ message: "Analysis timed out. Please try again." });
    }
    return res.status(503).json({ message: "AI scoring service is temporarily unavailable. Please try again." });
  }

  const rawContent = aiResponse.choices[0].message.content;
  let parsed;
  try {
    parsed = parseAtsResponse(rawContent);
  } catch (err) {
    if (err instanceof AtsParseError) {
      logger.error({ contentPreview: String(rawContent).slice(0, 500) }, "ATS parse error");
      if (err.message.includes("Invalid score")) {
        return res.status(500).json({ message: "AI returned an invalid score. Please try again." });
      }
      return res.status(500).json({ message: "Failed to process AI analysis. Please try again." });
    }
    return res.status(500).json({ message: "Failed to process AI analysis. Please try again." });
  }

  const existingCount = await AtsScore.countDocuments({ resumeId });
  if (existingCount >= 10) {
    const oldest = await AtsScore.findOne({ resumeId }).sort({ createdAt: 1 });
    if (oldest) {
      try {
        await AtsScore.deleteOne({ _id: oldest._id });
      } catch (err) {
        return res.status(500).json({ message: "Failed to save scan results. Please try again." });
      }
    }
  }

    const newScan = new AtsScore({
    userId: await getMongoUserId(req.userId),
    resumeId,
    jdSnippet: jobDescription.slice(0, 500),
    atsScore: parsed.atsScore,
    matchedKeywords: parsed.matchedKeywords,
    missingKeywords: parsed.missingKeywords,
    skillsGap: parsed.skillsGap,
    suggestions: parsed.suggestions,
  });

  try {
    await newScan.save();
  } catch (err) {
    return res.status(500).json({ message: "Failed to save scan results. Please try again." });
  }

  let scansRemainingToday = null;
  try {
    const mongoUserId = await getMongoUserId(req.userId);
    const user = await User.findById(mongoUserId).select("subscriptionTier");
    if (!user || user.subscriptionTier !== "premium") {
      const utcDayStart = new Date();
      utcDayStart.setUTCHours(0, 0, 0, 0);
      const todayCount = await AtsScore.countDocuments({
        userId: mongoUserId,
        createdAt: { $gte: utcDayStart },
      });
      scansRemainingToday = Math.max(0, 1 - todayCount);
    }
  } catch (err) {
    scansRemainingToday = null;
  }
  return res.status(200).json({
    atsScore: parsed.atsScore,
    scanId: newScan._id,
    scansRemainingToday,
    matchedKeywords: parsed.matchedKeywords,
    missingKeywords: parsed.missingKeywords,
    skillsGap: parsed.skillsGap,
    suggestions: parsed.suggestions,
  });
};
