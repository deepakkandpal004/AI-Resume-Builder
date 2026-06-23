import getAI from "../config/ai.js";
import Resume from "../models/resume.js";

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
