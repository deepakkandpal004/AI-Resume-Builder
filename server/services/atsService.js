/**
 * atsService.js
 * Pure, testable helper functions for the ATS Score Checker feature.
 * Other functions (buildResumeText, normalizeText, parseAtsResponse, etc.)
 * are implemented in parallel tasks and should be merged into this file.
 */

// ---------------------------------------------------------------------------
// buildAtsPrompt
// ---------------------------------------------------------------------------

/**
 * Construct the `messages` array for Groq's chat.completions.create call.
 *
 * @param {string} resumeText  - Normalized resume text produced by buildResumeText / normalizeText.
 * @param {string} jdText      - Raw job description text supplied by the user.
 * @returns {Array<{role: string, content: string}>}  Messages array ready for getAI().chat.completions.create.
 *
 * Requirements: 2.2, 3.1, 3.4, 4.5, 5.4 — Design: Groq AI Prompt Engineering
 */
export function buildAtsPrompt(resumeText, jdText) {
  const systemContent = `You are an ATS (Applicant Tracking System) compatibility expert.
Analyze the provided resume and job description, then return ONLY valid JSON — no markdown fences,
no explanation. Compute the ats_score as an integer 0–100 using this exact weighting:
  - keyword_match_rate: 40%
  - skills_coverage_rate: 25%
  - experience_education_relevance: 20%
  - title_and_completeness: 15%

Limits:
  - Extract at most 30 keywords; exclude common stop words (the, and, is, a, etc.).
  - Return at most 15 skills gap items, highest priority first (High = >=3 JD mentions, Medium = 2, Low = 1).
  - Return 3–7 improvement suggestions ranked by score impact (integer 1–20 pts) descending.
  - Categorize skills gap items as "Technical", "Soft Skills", or "Tools/Platforms" when possible.
  - For each suggestion include the target resume section key: "summary", "experience", "education",
    "projects", "skills", or a custom section name.`;

  const userContent = `RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Return JSON matching exactly this schema:
{
  "ats_score": <integer 0-100>,
  "matched_keywords": ["<keyword>", ...],
  "missing_keywords": ["<keyword>", ...],
  "skills_gap": [
    { "skill": "<string>", "priority": "High|Medium|Low", "category": "<string>" }
  ],
  "suggestions": [
    { "text": "<string>", "score_impact": <integer 1-20>, "section": "<string>" }
  ]
}`;

  return [
    { role: "system", content: systemContent },
    { role: "user",   content: userContent },
  ];
}

// ---------------------------------------------------------------------------
// clampScore
// ---------------------------------------------------------------------------

/**
 * Rounds a numeric value to the nearest integer (0.5 rounds up) and clamps
 * the result to the inclusive range [0, 100].
 *
 * Requirements: 2.1, 13.4
 *
 * @param {number} value - Any finite number (may be fractional or out-of-range).
 * @returns {number}     - Integer in [0, 100].
 */
export function clampScore(value) {
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 100) return 100;
  return rounded;
}

// ---------------------------------------------------------------------------
// AtsParseError
// ---------------------------------------------------------------------------

/**
 * Thrown by parseAtsResponse when the AI response cannot be decoded into a
 * valid, usable result object.
 *
 * Consumers (atsController) should catch this and return HTTP 500.
 */
export class AtsParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "AtsParseError";
  }
}

// ---------------------------------------------------------------------------
// parseAtsResponse
// ---------------------------------------------------------------------------

/**
 * Parses the raw string returned by the Groq AI service into a structured,
 * validated ATS result object.
 *
 * Processing steps:
 *   1. Strip leading/trailing markdown code fences (```json … ```).
 *   2. JSON.parse — throws AtsParseError("Failed to parse AI response") on failure.
 *   3. Validate ats_score is a finite number; throws AtsParseError("Invalid score")
 *      if not.
 *   4. Apply clampScore to produce the final atsScore.
 *   5. Default missing array fields to [].
 *   6. Map snake_case AI keys → camelCase:
 *        ats_score        → atsScore
 *        matched_keywords → matchedKeywords
 *        missing_keywords → missingKeywords
 *        skills_gap       → skillsGap
 *        score_impact     → scoreImpact  (inside each suggestion)
 *   7. Truncate:
 *        matchedKeywords + missingKeywords combined ≤ 30
 *          (take matched first, fill remaining slots with missing)
 *        skillsGap   ≤ 15
 *        suggestions ≤ 7
 *
 * Requirements: 3.4, 3.5, 4.4, 5.1, 13.1–13.6
 *
 * @param {string} rawContent - Raw string from Groq chat completion.
 * @returns {{
 *   atsScore: number,
 *   matchedKeywords: string[],
 *   missingKeywords: string[],
 *   skillsGap: Array<{skill: string, priority: string, category: string}>,
 *   suggestions: Array<{text: string, scoreImpact: number, section: string}>
 * }}
 * @throws {AtsParseError} When JSON is invalid or ats_score is not a finite number.
 */
export function parseAtsResponse(rawContent) {
  // Step 1: Strip markdown code fences.
  // Handles both ` ```json\n...\n``` ` and plain ` ```...\n``` ` variants.
  const stripped = rawContent
    .replace(/^```(?:json)?\s*/i, "")  // leading fence with optional "json" label
    .replace(/\s*```\s*$/i, "");       // trailing fence

  // Step 2: Parse JSON.
  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new AtsParseError("Failed to parse AI response");
  }

  // Step 3: Validate ats_score (AI uses snake_case key).
  const rawScore = parsed.ats_score;
  if (!Number.isFinite(rawScore)) {
    throw new AtsParseError("Invalid score");
  }

  // Step 4: Clamp to integer [0, 100].
  const atsScore = clampScore(rawScore);

  // Step 5 & 6: Default missing arrays and map snake_case → camelCase.

  const rawMatched    = Array.isArray(parsed.matched_keywords) ? parsed.matched_keywords : [];
  const rawMissing    = Array.isArray(parsed.missing_keywords) ? parsed.missing_keywords : [];
  const rawSkillsGap  = Array.isArray(parsed.skills_gap)       ? parsed.skills_gap       : [];
  const rawSuggestions = Array.isArray(parsed.suggestions)     ? parsed.suggestions      : [];

  // Step 7: Truncate.

  // matchedKeywords + missingKeywords combined cap of 30.
  // Fill matched first, then use any remaining budget for missing.
  const KEYWORD_CAP     = 30;
  const matchedKeywords = rawMatched.slice(0, KEYWORD_CAP);
  const remainingSlots  = KEYWORD_CAP - matchedKeywords.length;
  const missingKeywords = rawMissing.slice(0, remainingSlots);

  // skillsGap: at most 15 items, preserve AI-returned order.
  const skillsGap = rawSkillsGap.slice(0, 15).map((item) => ({
    skill:    item.skill    ?? "",
    priority: item.priority ?? "",
    category: item.category ?? "",
  }));

  // suggestions: at most 7 items; rename score_impact → scoreImpact.
  const suggestions = rawSuggestions.slice(0, 7).map((item) => ({
    text:        item.text         ?? "",
    scoreImpact: item.score_impact ?? 0,
    section:     item.section      ?? "",
  }));

  return {
    atsScore,
    matchedKeywords,
    missingKeywords,
    skillsGap,
    suggestions,
  };
}

// ---------------------------------------------------------------------------
// buildResumeText
// ---------------------------------------------------------------------------

/**
 * Builds a raw (un-normalized) plain-text string from a resume document by
 * concatenating all relevant text fields with a single space separator.
 *
 * Fields included (per Requirements 12.1):
 *   personal_info.full_name, personal_info.profession,
 *   professional_summary, skills[], experience[].position,
 *   experience[].company, experience[].description,
 *   education[].degree, education[].institution,
 *   project[].name, project[].description,
 *   custom_sections[].content
 *
 * @param {object} resumeDoc - Mongoose resume document (or plain object)
 * @returns {string} Raw concatenated text before normalization
 */
export function buildResumeText(resumeDoc) {
  const parts = [];

  const push = (val) => {
    if (typeof val === "string" && val.trim().length > 0) {
      parts.push(val.trim());
    }
  };

  // personal_info fields
  const pi = resumeDoc?.personal_info ?? {};
  push(pi.full_name);
  push(pi.profession);

  // Top-level text fields
  push(resumeDoc?.professional_summary);

  // Skills array
  const skills = resumeDoc?.skills ?? [];
  for (const skill of skills) {
    push(skill);
  }

  // Experience entries
  const experience = resumeDoc?.experience ?? [];
  for (const exp of experience) {
    push(exp?.position);
    push(exp?.company);
    push(exp?.description);
  }

  // Education entries
  const education = resumeDoc?.education ?? [];
  for (const edu of education) {
    push(edu?.degree);
    push(edu?.institution);
  }

  // Project entries
  const project = resumeDoc?.project ?? [];
  for (const proj of project) {
    push(proj?.name);
    push(proj?.description);
  }

  // Custom sections
  const customSections = resumeDoc?.custom_sections ?? [];
  for (const section of customSections) {
    push(section?.content);
  }

  // Certifications
  const certifications = resumeDoc?.certifications ?? [];
  for (const cert of certifications) {
    push(cert?.name);
    push(cert?.issuer);
  }

  // Languages
  const languages = resumeDoc?.languages ?? [];
  for (const lang of languages) {
    push(lang?.name);
    push(lang?.proficiency);
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// normalizeText
// ---------------------------------------------------------------------------

/**
 * Normalizes a raw text string for keyword matching.
 *
 * Steps (per Requirements 12.2):
 *   1. Convert to lowercase
 *   2. Remove all characters outside the set [a-z0-9 \-\/]
 *
 * @param {string} rawText
 * @returns {string} Normalized string containing only [a-z0-9 \-\/]
 */
export function normalizeText(rawText) {
  if (typeof rawText !== "string") return "";
  return rawText
    .toLowerCase()
    .replace(/[^a-z0-9 \-\/]/g, "");
}

// ---------------------------------------------------------------------------
// checkKeywordMatch
// ---------------------------------------------------------------------------

/**
 * Checks whether a keyword appears as a consecutive substring in the already-
 * normalized resume text.
 *
 * The keyword itself is normalized with the same rules before comparison so
 * that the caller can pass raw (mixed-case, punctuated) keywords directly.
 *
 * Multi-word keywords (e.g. "machine learning") are matched only when all
 * constituent words appear consecutively in the same order (Requirements 3.2,
 * 3.6).
 *
 * @param {string} keyword             - Raw or pre-normalized keyword string
 * @param {string} normalizedResumeText - Already-normalized resume text
 * @returns {boolean} true if the normalized keyword is a substring of normalizedResumeText
 */
export function checkKeywordMatch(keyword, normalizedResumeText) {
  const normalizedKeyword = normalizeText(keyword);
  if (normalizedKeyword.length === 0) return false;
  return normalizedResumeText.includes(normalizedKeyword);
}
