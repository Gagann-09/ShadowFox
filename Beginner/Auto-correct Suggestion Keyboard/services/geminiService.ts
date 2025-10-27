import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function fetchNextWordSuggestions(text: string): Promise<string[]> {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return [];
  }

  // Use the last 10 words of the text to provide better context for prediction.
  const words = trimmedText.split(/\s+/);
  const contextText = words.slice(-10).join(' ');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Given the following text, predict the 5 most likely words that could come next. Respond with only a JSON array of these words. Do not include any other text, explanation, or markdown formatting. Text: "${contextText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A predicted next word",
          },
        },
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    
    if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
      return suggestions;
    }
    
    console.error("Unexpected response format from API:", suggestions);
    return [];

  } catch (error) {
    console.error("Error fetching word suggestions:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get suggestions from Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching suggestions.");
  }
}

export async function fetchAutocorrection(word: string): Promise<string> {
  if (!word) {
    return word;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Correct the spelling of the following word. If it is already correct, return the original word. Respond with only a JSON object containing a single key "correctedWord" with the corrected word as its value. Do not include any other text or formatting. Word: "${word}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedWord: {
              type: Type.STRING,
              description: "The corrected word",
            },
          },
        },
        temperature: 0.2, // Lower temperature for more deterministic correction
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && typeof result.correctedWord === 'string') {
      return result.correctedWord;
    }

    console.error("Unexpected response format for autocorrection:", result);
    return word; // Return original word on format error
  } catch (error) {
    console.error("Error fetching autocorrection:", error);
    // On error, return the original word to avoid disrupting user flow
    return word;
  }
}