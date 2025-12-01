// In GoogleGeminiApi.js
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set."); 
}
 
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function generateContentFromPrompt(prompt) {
    try {
       if (typeof prompt !== 'string') {
            throw new Error(`Invalid prompt type: Expected string, received ${typeof prompt}`);
        }
        const modelId = "gemini-2.5-flash"; 

        const response = await ai.models.generateContent({
            model: modelId,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { 
                            text: prompt
                        }
                    ]
                }
            ],
        });

        console.log(response.text)
        return response.text;

    } catch (error) {
         console.error("Error generating content:", error);
        throw error;
    }
}

export default generateContentFromPrompt;