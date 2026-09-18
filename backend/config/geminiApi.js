import { GoogleGenAI } from "@google/genai";

const genAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default genAi;