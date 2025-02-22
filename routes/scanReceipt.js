import dotenv from 'dotenv';
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

router.post('/scan-receipt', async (req, res) => {
  const { fileData, fileType } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extract the following information from this receipt:
    - Total Amount
    - Date (format as YYYY-MM-DD)
    - Description (limit to 10 words)
    - Category (choose from: Food, Transport, Entertainment)
    - Type (choose from: Expense, Income)
    - Infer if the transaction is recurring (yes/no). If yes, specify the interval (choose from: Daily, Weekly, Monthly, Yearly).

    Respond in a JSON format. For example:
    {
      "amount": "123.45",
      "date": "2024-01-01",
      "description": "Grocery shopping at supermarket",
      "category": "Food",
      "type": "Expense",
      "isRecurring": "no",
      "recurringInterval": null
    }`;

    const imageParts = [
      {
        inlineData: {
          data: fileData.split(',')[1],
          mimeType: fileType,
        },
      },
    ];

    const result = await model.generateContent([prompt, imageParts]);
    const response = await result.response;
    const text = await response.text();

    // Extract JSON part from the response text
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStartIndex, jsonEndIndex);

    res.json({ success: true, data: JSON.parse(jsonString) });
  } catch (error) {
    console.error("Error scanning receipt:", error);
    res.status(500).json({ success: false, message: "An error occurred while scanning the receipt." });
  }
});

export default router;
