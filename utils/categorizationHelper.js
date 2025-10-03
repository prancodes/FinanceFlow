import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Define the categories your app uses
const VALID_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'General'];

export async function getCategoryForTransaction(description) {
  try {
    const prompt = `
      You are an expert financial categorizer. Your only job is to categorize the following expense description into one of these specific categories: ${VALID_CATEGORIES.join(', ')}.

      Rules:
      - If the description clearly fits Food, Transport, or Entertainment, choose that category.
      - For anything else (like shopping, bills, rent, etc.), use 'General'.
      - Respond with ONLY ONE word: the chosen category. Do not add any other text, explanation, or punctuation.

      Expense Description: "${description}"
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Ensure the AI returns a valid category, otherwise default to General
    if (VALID_CATEGORIES.includes(text)) {
      return text;
    } else {
      return 'General';
    }
  } catch (error) {
    console.error("Error fetching category from AI:", error);
    // If the AI fails for any reason, default to 'General'
    return 'General';
  }
}