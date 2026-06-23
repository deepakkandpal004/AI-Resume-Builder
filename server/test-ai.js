import "dotenv/config";
import OpenAI from "openai";

const run = async () => {
  console.log("Testing AI connection...");
  console.log("Model:", process.env.GROQ_MODEL);
  console.log("Base URL:", process.env.GROQ_BASE_URL);

  try {
    const ai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: process.env.GROQ_BASE_URL,
    });

    const response = await ai.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello." },
      ],
    });

    console.log("Success!");
    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Failed!");
    console.error(error);
  }
};

run();
