import mongoose from "mongoose";
import Resume from "../models/resume.js";
import AtsScore from "../models/AtsScore.js";
import User from "../models/User.js";
import getAI from "../config/ai.js";
import { buildResumeText, normalizeText, buildAtsPrompt, parseAtsResponse, AtsParseError } from "../services/atsService.js";

/**
 * GET /api/ai/ats-score/:resumeId
 * Returns up to 10 most-recent ATS scan records for the given resume,
 * sorted by createdAt descending.
 *
 * Requirements: 11.1–11.4
 */
export const getScanHistory = async (req, res) => {
  const { resumeId } = req.params;

  // 1. Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    return res.status(400).json({ message: "Invalid resume ID." });
  }

  // 2. Fetch resume and verify ownership
  let resume;
  try {
    resume = await Resume.findById(resumeId);
  } catch (err) {
    return res.status(503).json({ message: "Database unavailable. Please try again." });
  }

  if (!resume) {
    return res.status(404).json({ message: "Resume not found." });
  }

  if (resume.userId.toString() !== req.userId) {
    return res.status(403).json({ message: "Access denied." });
  }

  // 3. Fetch scan history (most recent 10, descending)
  const scans = await AtsScore.find({ resumeId }).sort({ createdAt: -1 }).limit(10);

  // 4. Map to response shape
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

/**
 * POST /api/ai/ats-score
 * Runs an ATS scan for a given resume against a provided job description.
 *
 * Requirements: 2.1, 2.6, 6.6, 8.1, 8.4, 8.5, 10.1–10.7, 12.1–12.4, 13.1–13.6
 */
export const runAtsScan = async (req, res) => {
  // Step 1: Destructure inputs
  const { resumeId, jobDescription } = req.body;

  // Step 2: Validate required fields
  if (!resumeId || !jobDescription) {
    return res.status(400).json({ message: "resumeId and jobDescription are required." });
  }

  // Step 3: Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    return res.status(400).json({ message: "Invalid resume ID." });
  }

  // Step 4: Validate jobDescription length
  if (jobDescription.length < 50 || jobDescription.length > 10000) {
    return res.status(400).json({ message: "jobDescription must be between 50 and 10,000 characters." });
  }

  // Step 5: Fetch resume and verify ownership
  let resume;
  try {
    resume = await Resume.findById(resumeId);
  } catch (err) {
    return res.status(503).json({ message: "Database unavailable. Please try again." });
  }

  if (!resume) {
    return res.status(404).json({ message: "Resume not found." });
  }

  if (resume.userId.toString() !== req.userId) {
    return res.status(403).json({ message: "Access denied." });
  }

  // Step 6: Build and normalize resume text
  const rawText = buildResumeText(resume);
  const normalizedResumeText = normalizeText(rawText);

  if (normalizedResumeText.trim().length === 0) {
    return res.status(422).json({
      message: "Resume has no content to analyze. Please add content to your resume before running an ATS scan.",
    });
  }

  // Step 7: Build AI prompt messages
  const messages = buildAtsPrompt(normalizedResumeText, jobDescription);

  // Step 8: Call AI with timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  let aiResponse;
  try {
    aiResponse = await getAI().chat.completions.create(
      {
        model: process.env.GROQ_MODEL || "llama3-70b-8192",
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

  // Step 9: Parse AI response
  const rawContent = aiResponse.choices[0].message.content;
  let parsed;
  try {
    parsed = parseAtsResponse(rawContent);
  } catch (err) {
    if (err instanceof AtsParseError) {
      console.error("ATS parse error. Raw content:", rawContent);
      if (err.message.includes("Invalid score")) {
        return res.status(500).json({ message: "AI returned an invalid score. Please try again." });
      }
      return res.status(500).json({ message: "Failed to process AI analysis. Please try again." });
    }
    return res.status(500).json({ message: "Failed to process AI analysis. Please try again." });
  }

  // Step 10: Enforce per-resume 10-scan cap (delete oldest if at limit)
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

  // Step 11: Save new scan document
  const newScan = new AtsScore({
    userId: req.userId,
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

  // Step 12: Compute scansRemainingToday for free-tier users
  let scansRemainingToday = null;
  try {
    const user = await User.findById(req.userId).select("subscriptionTier");
    if (!user || user.subscriptionTier !== "premium") {
      const utcDayStart = new Date();
      utcDayStart.setUTCHours(0, 0, 0, 0);
      const todayCount = await AtsScore.countDocuments({
        userId: req.userId,
        createdAt: { $gte: utcDayStart },
      });
      scansRemainingToday = Math.max(0, 1 - todayCount);
    }
  } catch (err) {
    scansRemainingToday = null; // non-fatal — don't fail the response
  }

  // Step 13: Return result
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
