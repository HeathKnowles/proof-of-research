import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export async function validateWithGemini(code, metadata) {
    const API_KEY = process.env.GEMINI_API_KEY;
    const URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const prompt = `
You are an AI Research Validator Agent.

Here is a user submission:
---
Metadata:
- Title: "${metadata.title}"
- Author: ${metadata.author}
- Description: ${metadata.description}

Code:
${code}
---

Evaluate the submission and return a JSON object **only** with the following structure:

{
  "reproducibility_score": <integer between 0 and 100>,
  "limitations": [
    "Limitation 1 (detailed, clear sentence)",
    "Limitation 2",
    ...
  ],
  "suggestions": [
    "Suggestion 1 (detailed, clear sentence)",
    "Suggestion 2",
    ...
  ]
}

❗ DO NOT write explanations or full paragraphs.
❗ DO NOT write prose or introduce the JSON.
❗ Return only a raw JSON object with arrays of strings.

Give at least 5 entries for both **limitations** and **suggestions**.
`;
    const res = await axios.post(`${URL}?key=${API_KEY}`, {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048, // More space to generate
        },
    }, {
        headers: { "Content-Type": "application/json" },
    });
    const raw = res.data.candidates[0].content.parts[0].text.trim();
    // Safe JSON extraction using regex
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("❌ Agent Error: No valid JSON object found in response.");
    }
    try {
        const parsed = JSON.parse(match[0]);
        return {
            score: parsed.reproducibility_score,
            limitations: parsed.limitations,
            suggestions: parsed.suggestions,
        };
    }
    catch (e) {
        throw new Error("❌ Agent Error: AI response parsing error.\n" + raw.slice(0, 500));
    }
}
