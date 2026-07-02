import mongoose from "mongoose";
import getAI from "../config/ai.js";
import Resume from "../models/resume.js";
import CoverLetter from "../models/CoverLetter.js";
import InterviewQuestion from "../models/InterviewQuestion.js";
import User from "../models/User.js";

// Free-tier daily cover-letter quota (kept in sync with coverLetterRateLimiter).
const COVER_LETTER_DAILY_LIMIT = 3;
// Max cover letters retained per resume; oldest is pruned beyond this.
const COVER_LETTER_PER_RESUME_CAP = 10;
// Max interview question sets retained per resume
const INTERVIEW_PER_RESUME_CAP = 5;

// Translate raw API errors into clean user-facing messages
const handleAIError = (error, res) => {
  const msg = error.message || "";
  if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
    return res.status(429).json({ message: "AI service is busy. Please try again in a moment." });
  }
  if (msg.includes("401") || msg.includes("API key") || msg.includes("INVALID_ARGUMENT")) {
    return res.status(500).json({ message: "AI service configuration error. Please contact support." });
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return res.status(504).json({ message: "AI request timed out. Please try again." });
  }
  return res.status(500).json({ message: "AI service error. Please try again." });
};

// POST /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await getAI().chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Enhance the professional summary in 2-3 compelling sentences highlighting key skills, experience, and career objectives. Make it ATS-friendly. Return only the text, no options or formatting.",
        },
        { role: "user", content: userContent },
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return handleAIError(error, res);
  }
};

// POST /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await getAI().chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Enhance this job description in 1-2 sentences highlighting key responsibilities and achievements. Use action verbs and quantifiable results. Make it ATS-friendly. Return only the text, no options or formatting.",
        },
        { role: "user", content: userContent },
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return handleAIError(error, res);
  }
};

// POST /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!resumeText || resumeText.trim() === "") {
      return res.status(400).json({ message: "Resume text is required" });
    }

    const systemPrompt =
      "You are an expert at extracting structured data from resumes. Respond with ONLY valid JSON, no markdown or explanation.";

    const userPrompt = `Extract all information from this resume and return ONLY valid JSON:

${resumeText}

Use this exact structure:
{
  "professional_summary": "text or empty string",
  "skills": "comma-separated skills or empty string",
  "full_name": "name or empty string",
  "profession": "title or empty string",
  "email": "email or empty string",
  "phone": "phone or empty string",
  "location": "location or empty string",
  "linkedin": "url or empty string",
  "website": "url or empty string",
  "experience": [
    { "company": "name", "position": "title", "start_date": "YYYY-MM", "end_date": "YYYY-MM", "description": "text", "is_current": false }
  ],
  "project": [
    { "name": "name", "type": "type", "description": "text" }
  ],
  "education": [
    { "institution": "name", "degree": "degree", "field": "field", "graduation_date": "YYYY-MM", "gpa": "gpa" }
  ],
  "certifications": [
    { "name": "cert name", "issuer": "issuer name", "issue_date": "YYYY-MM", "expiry_date": "YYYY-MM", "credential_url": "url or empty string" }
  ],
  "languages": [
    { "name": "language name", "proficiency": "Elementary|Conversational|Professional|Fluent|Native / Bilingual" }
  ]
}`;

    const response = await getAI().chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    if (!response?.choices?.[0]) {
      throw new Error("Invalid AI API response");
    }

    // Strip markdown fences if the model adds them despite instructions
    const cleanedData = response.choices[0].message.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parseData;
    try {
      parseData = JSON.parse(cleanedData);
    } catch (parseError) {
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    const sanitizeArray = (arr, fields) => {
      if (!Array.isArray(arr)) return [];
      return arr.map((item) => {
        const out = {};
        fields.forEach((f) => {
          out[f] = f === "is_current" ? Boolean(item[f]) : item[f] ? String(item[f]) : "";
        });
        return out;
      });
    };

    const resumeData = {
      userId,
      title: title?.trim() || "Untitled Resume",
      professional_summary: parseData.professional_summary
        ? String(parseData.professional_summary)
        : "",
      skills: parseData.skills
        ? Array.isArray(parseData.skills)
          ? parseData.skills.map(String)
          : String(parseData.skills)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [],
      personal_info: {
        image: "",
        full_name: parseData.full_name ? String(parseData.full_name) : "",
        profession: parseData.profession ? String(parseData.profession) : "",
        email: parseData.email ? String(parseData.email) : "",
        phone: parseData.phone ? String(parseData.phone) : "",
        location: parseData.location ? String(parseData.location) : "",
        linkedin: parseData.linkedin ? String(parseData.linkedin) : "",
        website: parseData.website ? String(parseData.website) : "",
      },
      experience: sanitizeArray(parseData.experience, [
        "company", "position", "start_date", "end_date", "description", "is_current",
      ]),
      project: sanitizeArray(parseData.project, ["name", "type", "description"]),
      education: sanitizeArray(parseData.education, [
        "institution", "degree", "field", "graduation_date", "gpa",
      ]),
      certifications: sanitizeArray(parseData.certifications, ["name", "issuer", "issue_date", "expiry_date", "credential_url"]),
      languages: Array.isArray(parseData.languages) ? parseData.languages.map(l => ({ name: l.name || "", proficiency: l.proficiency || "Conversational" })) : [],
    };

    const newResume = await Resume.create(resumeData);
    return res.status(200).json({
      message: "Resume uploaded successfully",
      resumeId: newResume._id,
    });
  } catch (error) {
    // Validation errors (Mongoose)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid resume data: " + error.message });
    }
    // JSON parsing failure
    if (error.message?.includes("JSON")) {
      return res.status(500).json({ message: "Failed to process resume. Please try again." });
    }
    return handleAIError(error, res);
  }
};

// POST /api/ai/generate-cover-letter
export const generateCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobDescription, companyName, positionTitle, tone } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!resumeId || !jobDescription || !companyName || !positionTitle) {
      return res.status(400).json({ message: "resumeId, jobDescription, companyName and positionTitle are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: "Invalid resume ID." });
    }
    if (jobDescription.length < 50 || jobDescription.length > 10000) {
      return res.status(400).json({ message: "jobDescription must be between 50 and 10,000 characters." });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    const fullName = resume.personal_info?.full_name || "Candidate";
    const professionalSummary = resume.professional_summary || "";
    const topExperiences = (resume.experience || []).slice(0, 3).map(exp =>
      `${exp.position} at ${exp.company}: ${exp.description}`
    ).join("\n");
    const skills = (resume.skills || []).join(", ");

    const toneMap = {
      formal: "professional and formal",
      conversational: "friendly and conversational",
      enthusiastic: "enthusiastic and energetic",
    };
    const selectedTone = toneMap[tone] || "professional and formal";

    const systemPrompt = `You are an expert cover letter writer. Generate a compelling, ATS-friendly cover letter that:
- Matches the job description keywords naturally
- Highlights relevant experience from the resume
- Uses a ${selectedTone} tone
- Is 250-350 words long
- Has 3 paragraphs: intro (express interest + role fit), body (highlight relevant achievements), closing (call to action)
- Return ONLY the cover letter body text, no subject line, no salutation, no sign-off — just the 3 paragraphs`;

    const userPrompt = `Write a cover letter for:

Candidate Name: ${fullName}
Company: ${companyName}
Position: ${positionTitle}

Professional Summary: ${professionalSummary}

Top Experience:
${topExperiences}

Skills: ${skills}

Job Description:
${jobDescription}`;

    const response = await getAI().chat.completions.create({
      model: process.env.GROQ_MODEL || "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    if (!response?.choices?.[0]) {
      throw new Error("Invalid AI response");
    }

    const generatedContent = response.choices[0].message.content.trim();

    // Enforce per-resume cap: prune the oldest letter once at the limit.
    const existingCount = await CoverLetter.countDocuments({ resumeId });
    if (existingCount >= COVER_LETTER_PER_RESUME_CAP) {
      const oldest = await CoverLetter.findOne({ resumeId }).sort({ createdAt: 1 });
      if (oldest) {
        await CoverLetter.deleteOne({ _id: oldest._id });
      }
    }

    // Persist the generated letter.
    const letter = await CoverLetter.create({
      userId,
      resumeId,
      companyName,
      positionTitle,
      jobDescription: jobDescription.slice(0, 2000),
      tone: ["formal", "conversational", "enthusiastic"].includes(tone) ? tone : "formal",
      content: generatedContent,
    });

    // Compute remaining daily quota for free-tier users (non-fatal on error).
    let lettersRemainingToday = null;
    try {
      const user = await User.findById(userId).select("subscriptionTier");
      if (!user || user.subscriptionTier !== "premium") {
        const utcDayStart = new Date();
        utcDayStart.setUTCHours(0, 0, 0, 0);
        const todayCount = await CoverLetter.countDocuments({
          userId,
          createdAt: { $gte: utcDayStart },
        });
        lettersRemainingToday = Math.max(0, COVER_LETTER_DAILY_LIMIT - todayCount);
      }
    } catch (err) {
      lettersRemainingToday = null;
    }

    return res.status(200).json({
      coverLetterId: letter._id,
      content: letter.content,
      companyName: letter.companyName,
      positionTitle: letter.positionTitle,
      tone: letter.tone,
      createdAt: letter.createdAt,
      lettersRemainingToday,
    });

  } catch (error) {
    return handleAIError(error, res);
  }
};

// GET /api/ai/cover-letter/:resumeId
export const getCoverLetterHistory = async (req, res) => {
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
  if (resume.userId.toString() !== req.userId) {
    return res.status(403).json({ message: "Access denied." });
  }

  const letters = await CoverLetter.find({ resumeId })
    .sort({ createdAt: -1 })
    .limit(COVER_LETTER_PER_RESUME_CAP);

  const result = letters.map((doc) => ({
    letterId: doc._id,
    companyName: doc.companyName,
    positionTitle: doc.positionTitle,
    tone: doc.tone,
    jobDescription: doc.jobDescription,
    content: doc.content,
    createdAt: doc.createdAt,
  }));

  return res.status(200).json({ letters: result });
};

// DELETE /api/ai/cover-letter/:letterId
export const deleteCoverLetter = async (req, res) => {
  const { letterId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(letterId)) {
    return res.status(400).json({ message: "Invalid cover letter ID." });
  }

  let letter;
  try {
    letter = await CoverLetter.findOne({ _id: letterId, userId: req.userId });
  } catch (err) {
    return res.status(503).json({ message: "Database unavailable. Please try again." });
  }

  if (!letter) {
    return res.status(404).json({ message: "Cover letter not found." });
  }

  await CoverLetter.deleteOne({ _id: letter._id });
  return res.status(200).json({ message: "Cover letter deleted successfully." });
};

// POST /api/ai/interview-questions
export const generateInterviewQuestions = async (req, res) => {
  try {
    const { resumeId, targetRole, jobDescription } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!resumeId) {
      return res.status(400).json({ message: "resumeId is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: "Invalid resume ID." });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    // Build a compact resume snapshot for the prompt
    const fullName = resume.personal_info?.full_name || "the candidate";
    const profession = resume.personal_info?.profession || "";
    const summary = resume.professional_summary || "";
    const skills = (resume.skills || []).slice(0, 20).join(", ");
    const experienceSnippet = (resume.experience || [])
      .slice(0, 4)
      .map((e) => `${e.position} at ${e.company}: ${(e.description || "").slice(0, 200)}`)
      .join("\n");
    const projectSnippet = (resume.project || [])
      .slice(0, 3)
      .map((p) => `${p.name}: ${(p.description || "").slice(0, 150)}`)
      .join("\n");
    const education = (resume.education || [])
      .slice(0, 2)
      .map((e) => `${e.degree} in ${e.field || "?"} from ${e.institution}`)
      .join(", ");

    const roleContext = targetRole?.trim()
      ? `Target Role: ${targetRole.trim()}`
      : profession
        ? `Current/Target Profession: ${profession}`
        : "";

    const jdContext =
      jobDescription?.trim()
        ? `\nJob Description Snippet:\n${jobDescription.trim().slice(0, 500)}`
        : "";

    const systemPrompt = `You are an expert technical interviewer and career coach.
Generate exactly 10 interview questions with suggested answers tailored to the candidate's resume.
Respond with ONLY valid JSON — no markdown, no explanation outside the JSON.`;

    const userPrompt = `Generate 10 interview questions with suggested answers for:

Candidate: ${fullName}
${roleContext}${jdContext}

Resume snapshot:
- Professional Summary: ${summary || "N/A"}
- Skills: ${skills || "N/A"}
- Experience:
${experienceSnippet || "N/A"}
- Projects:
${projectSnippet || "N/A"}
- Education: ${education || "N/A"}

Instructions:
1. Mix the 10 questions across 4 categories: "Behavioural", "Technical", "Situational", "Role-Specific"
2. Each suggested answer must reference specific details from the candidate's resume (company names, skills, projects, etc.)
3. Keep each suggested answer to 3-5 sentences — concise but substantive
4. Return ONLY this JSON structure:
{
  "questions": [
    {
      "category": "Behavioural" | "Technical" | "Situational" | "Role-Specific",
      "question": "...",
      "suggestedAnswer": "..."
    }
  ]
}`;

    const response = await getAI().chat.completions.create({
      model: process.env.GROQ_MODEL || "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    if (!response?.choices?.[0]) {
      throw new Error("Invalid AI response");
    }

    const raw = response.choices[0].message.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      throw new Error("Failed to parse AI response as JSON: " + parseError.message);
    }

    const questions = Array.isArray(parsed.questions)
      ? parsed.questions.slice(0, 10).map((q) => ({
          category: q.category || "General",
          question: q.question || "",
          suggestedAnswer: q.suggestedAnswer || "",
        }))
      : [];

    // Persist — prune oldest set if at cap
    try {
      const existingCount = await InterviewQuestion.countDocuments({ resumeId });
      if (existingCount >= INTERVIEW_PER_RESUME_CAP) {
        const oldest = await InterviewQuestion.findOne({ resumeId }).sort({ createdAt: 1 });
        if (oldest) await InterviewQuestion.deleteOne({ _id: oldest._id });
      }
      await InterviewQuestion.create({
        userId,
        resumeId,
        targetRole: targetRole?.trim() || "",
        jobDescription: jobDescription?.trim().slice(0, 500) || "",
        questions,
      });
    } catch {
      // Non-fatal — still return questions even if save fails
    }

    return res.status(200).json({ questions });
  } catch (error) {
    return handleAIError(error, res);
  }
};

// GET /api/ai/interview-questions/:resumeId
export const getInterviewHistory = async (req, res) => {
  const { resumeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    return res.status(400).json({ message: "Invalid resume ID." });
  }

  const resume = await Resume.findById(resumeId);
  if (!resume) return res.status(404).json({ message: "Resume not found." });
  if (resume.userId.toString() !== req.userId) return res.status(403).json({ message: "Access denied." });

  const sets = await InterviewQuestion.find({ resumeId })
    .sort({ createdAt: -1 })
    .limit(INTERVIEW_PER_RESUME_CAP);

  return res.status(200).json({
    sets: sets.map((s) => ({
      setId: s._id,
      targetRole: s.targetRole,
      questions: s.questions,
      createdAt: s.createdAt,
    })),
  });
};

// POST /api/ai/tailor-resume
export const tailorResume = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ message: "resumeId and jobDescription are required." });
    }

    const resume = await Resume.findOne({ userId, _id: resumeId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    const systemPrompt = "You are an expert ATS optimization engine. Respond with ONLY valid JSON, no markdown formatting or text outside the JSON.";

    const userPrompt = `You are a professional resume writer. Your task is to tailor a user's resume for a specific Job Description (JD).
Modify the professional summary, skills list, experience descriptions, and project descriptions to make them ATS-friendly and directly align with the requirements of the job.

INSTRUCTIONS:
1. Rewrite 'professional_summary' to highlight skills/experience matching the JD in 2-3 sentences.
2. In 'skills', preserve their original skills and add relevant missing technical or soft skills mentioned in the JD that fit their profession. Return as a flat array of strings.
3. In 'experience', rewrite the 'description' field for each experience. Keep the original 'company' and 'position'. Rewrite the 'description' to incorporate keywords from the JD, use active verbs, highlight achievements, and retain any metrics. Do NOT change dates or other fields. The array must contain exactly the same number of items, in the exact same order.
4. In 'project', rewrite the 'description' field for each project to emphasize relevant technologies from the JD. The array must contain exactly the same number of items, in the exact same order.
5. You MUST return ONLY a valid JSON object matching this structure:
{
  "professional_summary": "rewritten summary...",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    { "company": "original company name", "position": "original position", "description": "rewritten description..." }
  ],
  "project": [
    { "name": "original project name", "description": "rewritten description..." }
  ]
}

DATA:
Job Description:
${jobDescription}

Current Resume Data:
- Professional Summary: ${resume.professional_summary || ""}
- Skills: ${JSON.stringify(resume.skills || [])}
- Experience: ${JSON.stringify((resume.experience || []).map(exp => ({ company: exp.company, position: exp.position, description: exp.description })))}
- Projects: ${JSON.stringify((resume.project || []).map(proj => ({ name: proj.name, description: proj.description })))}`;

    const response = await getAI().chat.completions.create({
      model: process.env.GROQ_MODEL || "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }
    });

    if (!response?.choices?.[0]) {
      throw new Error("Invalid AI response");
    }

    const cleanedData = response.choices[0].message.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parseData;
    try {
      parseData = JSON.parse(cleanedData);
    } catch (parseError) {
      throw new Error("Failed to parse tailored data as JSON: " + parseError.message);
    }

    return res.status(200).json({
      original: {
        professional_summary: resume.professional_summary || "",
        skills: resume.skills || [],
        experience: (resume.experience || []).map(exp => ({ company: exp.company, position: exp.position, description: exp.description })),
        project: (resume.project || []).map(proj => ({ name: proj.name, description: proj.description }))
      },
      tailored: {
        professional_summary: parseData.professional_summary || "",
        skills: Array.isArray(parseData.skills) ? parseData.skills.map(String) : [],
        experience: Array.isArray(parseData.experience) ? parseData.experience.map(exp => ({
          company: exp.company || "",
          position: exp.position || "",
          description: exp.description || ""
        })) : [],
        project: Array.isArray(parseData.project) ? parseData.project.map(proj => ({
          name: proj.name || "",
          description: proj.description || ""
        })) : []
      }
    });

  } catch (error) {
    return handleAIError(error, res);
  }
};

// POST /api/ai/score-resume
export const scoreResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ message: "resumeId is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: "Invalid resume ID." });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    const systemPrompt = `You are an expert resume reviewer and career coach. Analyze the resume data and score it on these dimensions (each 0-100):

1. **overall** — Overall resume quality and effectiveness
2. **contentQuality** — Quality of experience descriptions: action verbs, quantifiable achievements, impact
3. **completeness** — How well each section is filled out; missing sections reduce the score
4. **skillsPresentation** — How skills are listed, organized, and their relevance
5. **formatting** — Structure, readability, consistency of formatting

Also provide 3-5 specific, actionable suggestions to improve the resume.

Respond with ONLY valid JSON using this structure:
{
  "scores": { "overall": 0, "contentQuality": 0, "completeness": 0, "skillsPresentation": 0, "formatting": 0 },
  "suggestions": [
    { "section": "experience|skills|summary|education|formatting", "text": "specific suggestion" }
  ]
}`;

    const userPrompt = `Score this resume data:\n${JSON.stringify({
      professional_summary: resume.professional_summary,
      skills: resume.skills,
      experience: resume.experience?.map(e => ({ company: e.company, position: e.position, description: e.description, start_date: e.start_date, end_date: e.end_date })),
      education: resume.education?.map(e => ({ institution: e.institution, degree: e.degree, field: e.field, gpa: e.gpa })),
      projects: resume.project?.map(p => ({ name: p.name, description: p.description })),
      certifications: resume.certifications?.map(c => ({ name: c.name, issuer: c.issuer })),
      languages: resume.languages,
    }, null, 2)}`;

    const response = await getAI().chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    if (!response?.choices?.[0]) {
      throw new Error("Invalid AI response");
    }

    const cleanedData = response.choices[0].message.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parseData;
    try {
      parseData = JSON.parse(cleanedData);
    } catch (parseError) {
      throw new Error("Failed to parse AI response: " + parseError.message);
    }

    return res.status(200).json({
      scores: {
        overall: Math.min(100, Math.max(0, parseData.scores?.overall ?? 0)),
        contentQuality: Math.min(100, Math.max(0, parseData.scores?.contentQuality ?? 0)),
        completeness: Math.min(100, Math.max(0, parseData.scores?.completeness ?? 0)),
        skillsPresentation: Math.min(100, Math.max(0, parseData.scores?.skillsPresentation ?? 0)),
        formatting: Math.min(100, Math.max(0, parseData.scores?.formatting ?? 0)),
      },
      suggestions: Array.isArray(parseData.suggestions) ? parseData.suggestions.slice(0, 5) : [],
    });
  } catch (error) {
    return handleAIError(error, res);
  }
};
