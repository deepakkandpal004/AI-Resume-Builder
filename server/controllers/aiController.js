// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum

import ai from "../config/ai.js";
import Resume from "../models/resume.js";
import { GEMINI_MODELS } from "../config/geminiModels.js";

export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing require fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.GEMINI_MODEL || GEMINI_MODELS.GEMINI_FLASH_LATEST,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });
    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// controller for enhancing a resume's job description
// POST: /api/ai/enhance-job-desc

export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing require fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.GEMINI_MODEL || GEMINI_MODELS.GEMINI_FLASH_LATEST,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });
    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// controller for uploading a resume to the database
// POST: /api/ai/upload-resume

export const uploadResume = async (req, res) => {
  try {
    console.log("=== Upload Resume Started ===");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("User ID:", req.userId);

    const { resumeText, title } = req.body;
    const userId = req.userId;

    // Validate userId
    if (!userId) {
      console.error("No userId found - auth middleware issue");
      return res.status(401).json({ message: "Unauthorized - No user ID" });
    }

    // Validate resumeText
    if (!resumeText || resumeText.trim() === "") {
      console.error("Resume text is missing or empty");
      return res.status(400).json({ message: "Resume text is required" });
    }

    console.log("Resume text length:", resumeText.length);
    console.log("Title:", title);

    const systemPrompt = "You are an expert at extracting structured data from resumes. You MUST respond with ONLY valid JSON, no other text or markdown formatting.";

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
    {
      "company": "name",
      "position": "title",
      "start_date": "date",
      "end_date": "date",
      "description": "text",
      "is_current": false
    }
  ],
  "project": [
    {
      "name": "name",
      "type": "type",
      "description": "text"
    }
  ],
  "education": [
    {
      "institution": "name",
      "degree": "degree",
      "field": "field",
      "graduation_date": "date",
      "gpa": "gpa"
    }
  ]
}

Return ONLY the JSON object. No markdown, no explanation.`;

    console.log("Calling AI API...");
    
    const response = await ai.chat.completions.create({
      model: process.env.GEMINI_MODEL || GEMINI_MODELS.GEMINI_FLASH_LATEST,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    console.log("AI API Response received");
    
    if (!response || !response.choices || !response.choices[0]) {
      throw new Error("Invalid AI API response");
    }

    const extractedData = response.choices[0].message.content;
    console.log("Raw AI response:", extractedData.substring(0, 200) + "...");
    
    // Clean the response - remove markdown and extra whitespace
    let cleanedData = extractedData
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    console.log("Cleaned data:", cleanedData.substring(0, 200) + "...");

    // Parse JSON with error handling
    let parseData;
    try {
      parseData = JSON.parse(cleanedData);
      console.log("JSON parsed successfully");
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Failed to parse:", cleanedData);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Helper to sanitize array of objects
    const sanitizeArray = (arr, fields) => {
      if (!Array.isArray(arr)) return [];
      return arr.map(item => {
        const sanitizedItem = {};
        fields.forEach(field => {
          sanitizedItem[field] = item[field] ? String(item[field]) : "";
        });
        // Handle boolean is_current specifically if needed, but schema says Boolean. 
        // If schema is Boolean, String("false") is "false", which casts to true in JS boolean logic? 
        // No, Mongoose casts "false" string to false boolean.
        if (item.is_current !== undefined && fields.includes('is_current')) {
             sanitizedItem.is_current = item.is_current;
        }
        return sanitizedItem;
      });
    };

    // Restructure data to match your schema
    const resumeData = {
      userId,
      title: title && title.trim() !== "" ? title.trim() : "Untitled Resume",
      professional_summary: parseData.professional_summary ? String(parseData.professional_summary) : "",
      skills: parseData.skills ? (Array.isArray(parseData.skills) ? parseData.skills.map(String) : String(parseData.skills).split(',').map(s => s.trim())) : [],
      personal_info: {
        image: parseData.image ? String(parseData.image) : "",
        full_name: parseData.full_name ? String(parseData.full_name) : "",
        profession: parseData.profession ? String(parseData.profession) : "",
        email: parseData.email ? String(parseData.email) : "",
        phone: parseData.phone ? String(parseData.phone) : "",
        location: parseData.location ? String(parseData.location) : "",
        linkedin: parseData.linkedin ? String(parseData.linkedin) : "",
        website: parseData.website ? String(parseData.website) : "",
      },
      experience: sanitizeArray(parseData.experience, ['company', 'position', 'start_date', 'end_date', 'description', 'is_current']),
      project: sanitizeArray(parseData.project, ['name', 'type', 'description']),
      education: sanitizeArray(parseData.education, ['institution', 'degree', 'field', 'graduation_date', 'gpa']),
    };

    console.log("Resume data structured, creating in database...");
    console.log("Resume data:", JSON.stringify(resumeData, null, 2));

    const newResume = await Resume.create(resumeData);
    console.log("Resume created successfully with ID:", newResume._id);

    return res.status(200).json({ 
      message: "Resume uploaded successfully",
      resumeId: newResume._id 
    });
    
  } catch (error) {
    console.error("=== Upload Resume Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Send appropriate error response
    let errorMessage = "Server Error";
    let statusCode = 500;

    if (error.message.includes("JSON")) {
      errorMessage = "Failed to process resume data. Please try again.";
    } else if (error.message.includes("AI API")) {
      errorMessage = "AI service error. Please try again.";
    } else if (error.name === "ValidationError") {
      errorMessage = "Invalid resume data: " + error.message;
      statusCode = 400;
    }
    
    return res.status(statusCode).json({ 
      message: errorMessage, 
      error: error.message,
      errorType: error.name 
    });
  }
};