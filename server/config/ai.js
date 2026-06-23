import OpenAI from 'openai';

// Groq is OpenAI-compatible. Client is created lazily (at call time) so env
// vars are loaded by dotenv first — ESM hoists imports before dotenv runs.
// timeout: 25s so a slow/hung call fails fast instead of hanging the request.
const getAI = () =>
  new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_BASE_URL,
    timeout: 25000,
    maxRetries: 0,
  });

export default getAI;
