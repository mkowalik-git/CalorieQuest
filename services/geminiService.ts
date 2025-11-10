

import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { ChatMessage, FoodSearchResult, MealType, SuggestedMealPlan } from '../types';

// In-memory cache for search results to improve performance on repeated queries
const searchCache = new Map<string, FoodSearchResult[]>();

export const analyzeMeal = async (mealDescription: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API_KEY not found");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Analyze the following meal description and estimate its nutritional content. Return ONLY a single JSON object with the keys: "name", "calories", "protein", "carbs", "fat", and "servingSize". For servingSize, provide a reasonable metric quantity (e.g., "100g") or a descriptive unit (e.g., "1 bowl"). Example: {"name": "Chicken Salad", "calories": 350, "protein": 30, "carbs": 10, "fat": 20, "servingSize": "1 bowl"}. Meal: "${mealDescription}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            name: {type: Type.STRING},
            calories: {type: Type.NUMBER},
            protein: {type: Type.NUMBER},
            carbs: {type: Type.NUMBER},
            fat: {type: Type.NUMBER},
            servingSize: {type: Type.STRING},
        },
      }
    }
  });
  return response.text;
};

export const analyzeMealImage = async (imageFile: File): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API_KEY not found");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const base64Data = await fileToBase64(imageFile);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: imageFile.type,
                    },
                },
                {
                    text: 'Analyze the food in this image and estimate its nutritional content. Return ONLY a single JSON object with the keys: "name", "calories", "protein", "carbs", "fat", and "servingSize". For servingSize, provide a reasonable metric quantity (e.g., "100g") or a descriptive unit (e.g., "1 slice").',
                },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                    servingSize: { type: Type.STRING },
                },
            }
        }
    });
    return response.text;
};

export const searchFoodDatabase = async (query: string): Promise<FoodSearchResult[]> => {
  const cacheKey = query.toLowerCase().trim();
  if (searchCache.has(cacheKey)) {
    // Return a copy to prevent mutation of cached data
    return [...searchCache.get(cacheKey)!];
  }

  if (!process.env.API_KEY) throw new Error("API_KEY not found");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Switched to faster model for better performance
    contents: `Find nutritional information for "${query}". Provide a list of common variations. Return ONLY a JSON array of up to 5 objects with keys: "name", "calories", "protein", "carbs", "fat", and "servingSize". The serving size must be in metric units (e.g., "100g", "250ml"). If you can't find the food, return an empty array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            servingSize: { type: Type.STRING },
          },
          required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
        }
      }
    }
  });

  try {
    const jsonText = response.text.trim();
    // Handle cases where the model might return an empty string for no results
    if (!jsonText) {
        return [];
    }
    const result = JSON.parse(jsonText) as FoodSearchResult[];
    
    // Store result in cache for subsequent requests
    if (result.length > 0) {
        searchCache.set(cacheKey, result);
    }
    
    return result;
  } catch (e) {
    console.error("Error parsing food database response:", e);
    return []; // Return empty array on parsing error
  }
};


let chat: Chat | null = null;
export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<GenerateContentResponse> => {
    if (!process.env.API_KEY) throw new Error("API_KEY not found");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    if (!chat) {
        // Fix: The history from the component contains the latest user message.
        // We should initialize the chat with the history *before* that message,
        // as `sendMessage` will add it, preventing message duplication.
        const chatHistory = history.slice(0, -1);
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: chatHistory,
            config: {
                systemInstruction: 'You are a friendly and helpful nutrition and fitness assistant. Provide concise and encouraging advice.',
            }
        });
    }

    const result = await chat.sendMessage({ message: newMessage });
    return result;
}

export const suggestMealPlan = async (
  calorieGoal: number,
  proteinGoal: number,
  carbsGoal: number,
  fatGoal: number
): Promise<SuggestedMealPlan> => {
  if (!process.env.API_KEY) throw new Error("API_KEY not found");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Generate a one-day meal plan for Breakfast, Lunch, Dinner, and Snacks that totals approximately ${calorieGoal} calories, ${proteinGoal}g protein, ${carbsGoal}g carbs, and ${fatGoal}g fat. Provide simple, common food items. Return ONLY a JSON object where keys are the meal types ('Breakfast', 'Lunch', 'Dinner', 'Snack') and values are arrays of food items, each with 'name', 'calories', 'protein', 'carbs', 'fat', and 'servingSize' keys. The servingSize should be a reasonable estimate (e.g., "1 cup" or "100g").`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          [MealType.Breakfast]: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, servingSize: { type: Type.STRING } },
              required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
            },
          },
          [MealType.Lunch]: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, servingSize: { type: Type.STRING } },
              required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
            },
          },
          [MealType.Dinner]: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, servingSize: { type: Type.STRING } },
              required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
            },
          },
          [MealType.Snack]: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, servingSize: { type: Type.STRING } },
              required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
            },
          },
        },
      }
    }
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as SuggestedMealPlan;
  } catch (e) {
    console.error("Error parsing suggested meal plan response:", e);
    throw new Error("Failed to parse the meal plan suggestion.");
  }
};


// Fix: Add a helper function to convert a File object to a base64 encoded string.
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Could not read file as base64 string"));
      }
    };
    reader.onerror = error => reject(error);
  });
};