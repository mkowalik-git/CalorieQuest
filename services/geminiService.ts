

/// <reference types="vite/client" />
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { ChatMessage, FoodSearchResult, MealType, SuggestedMealPlan } from '../types.ts';

// In-memory cache for search results to improve performance on repeated queries
const searchCache = new Map<string, FoodSearchResult[]>();

export const analyzeMeal = async (mealDescription: string): Promise<string> => {
  const apiKey = import.meta.env?.VITE_API_KEY || process.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API_KEY not found");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the nutritional content of: "${mealDescription}"

Calculate the TOTAL nutrition for the entire described meal/portion. Use standard nutritional data:
- Look up accurate nutritional values for each ingredient
- Calculate based on specified quantities
- Sum all ingredients together for the final totals

Return ONLY a valid JSON object with exactly these keys and numeric values:
{
  "name": "Brief descriptive name",
  "calories": total_calories_as_number,
  "protein": total_protein_grams_as_number,
  "carbs": total_carbohydrates_grams_as_number,
  "fat": total_fat_grams_as_number,
  "servingSize": "description of total portion"
}

Example for "100g chicken breast": {"name": "Chicken Breast", "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "servingSize": "100g"}
Example for "1 apple": {"name": "Apple", "calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "servingSize": "1 medium apple"}`,
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
          required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
        }
      }
    });
    return response.text;
  } catch (e: any) {
    if (e?.code === 503) {
      throw new Error("The AI service is currently overloaded. Please try again later.");
    } else if (e?.code === 404) {
      throw new Error("Service not found. Please check your connection.");
    } else {
      throw new Error("Failed to analyze meal description. Please try again.");
    }
  }
};

export const analyzeMealImage = async (imageFile: File): Promise<string> => {
    const apiKey = import.meta.env?.VITE_API_KEY || process.env.VITE_API_KEY;
    if (!apiKey) throw new Error("API_KEY not found");
    const ai = new GoogleGenAI({ apiKey });

    try {
        const base64Data = await fileToBase64(imageFile);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: imageFile.type,
                        },
                    },
                    {
                        text: 'Analyze the food in this image and estimate its nutritional content. You must include all keys: "name", "calories", "protein", "carbs", "fat", and "servingSize" with numeric values for nutritional info even if approximate. Return ONLY a single JSON object. For servingSize, provide a reasonable metric quantity (e.g., "100g") or a descriptive unit (e.g., "1 slice").',
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
    } catch (e: any) {
        if (e?.code === 503) {
            throw new Error("The AI service is currently overloaded. Please try again later.");
        } else if (e?.code === 404) {
            throw new Error("Service not found. Please check your connection.");
        } else {
            throw new Error("Failed to analyze meal image. Please try again.");
        }
    }
};

export const searchFoodDatabase = async (query: string): Promise<FoodSearchResult[]> => {
  const cacheKey = query.toLowerCase().trim();
  if (searchCache.has(cacheKey)) {
    // Return a copy to prevent mutation of cached data
    return [...searchCache.get(cacheKey)!];
  }

  const apiKey = import.meta.env?.VITE_API_KEY || process.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API_KEY not found");
  const ai = new GoogleGenAI({ apiKey });

  try {
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
  } catch (e: any) {
    if (e?.code === 503) {
      throw new Error("The AI service is currently overloaded. Please try again later.");
    } else if (e?.code === 404) {
      throw new Error("Service not found. Please check your connection.");
    } else {
      throw new Error("Failed to search food database. Please try again.");
    }
  }
};


let chat: Chat | null = null;
export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<GenerateContentResponse> => {
    const apiKey = import.meta.env?.VITE_API_KEY || process.env.VITE_API_KEY;
    if (!apiKey) throw new Error("API_KEY not found");
    const ai = new GoogleGenAI({ apiKey });

    try {
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
    } catch (e: any) {
        if (e?.code === 503) {
            throw new Error("The AI service is currently overloaded. Please try again later.");
        } else if (e?.code === 404) {
            throw new Error("Service not found. Please check your connection.");
        } else {
            throw new Error("Failed to get chat response. Please try again.");
        }
    }
}

export const suggestMealPlan = async (
  calorieGoal: number,
  proteinGoal: number,
  carbsGoal: number,
  fatGoal: number
): Promise<SuggestedMealPlan> => {
  const apiKey = import.meta.env?.VITE_API_KEY || process.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API_KEY not found");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a one-day meal plan for Breakfast, Lunch, Dinner, and Snack that totals approximately ${calorieGoal} calories, ${proteinGoal}g protein, ${carbsGoal}g carbs, and ${fatGoal}g fat. Provide simple, common food items.

Return ONLY a valid JSON object with exactly these keys: "Breakfast", "Lunch", "Dinner", "Snack". Each key should have an array of food objects with keys: "name", "calories", "protein", "carbs", "fat", "servingSize".

Example format:
{
  "Breakfast": [
    {"name": "Oatmeal", "calories": 150, "protein": 5, "carbs": 27, "fat": 3, "servingSize": "1 cup cooked"}
  ],
  "Lunch": [
    {"name": "Grilled Chicken Salad", "calories": 350, "protein": 35, "carbs": 15, "fat": 12, "servingSize": "1 large bowl"}
  ],
  "Dinner": [
    {"name": "Salmon with rice", "calories": 450, "protein": 35, "carbs": 40, "fat": 18, "servingSize": "6oz salmon + 1 cup rice"}
  ],
  "Snack": [
    {"name": "Greek yogurt", "calories": 100, "protein": 15, "carbs": 8, "fat": 2, "servingSize": "6oz"}
  ]
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            Breakfast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, servingSize: { type: Type.STRING } },
                required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
              },
            },
            Lunch: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, servingSize: { type: Type.STRING } },
                required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
              },
            },
            Dinner: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, servingSize: { type: Type.STRING } },
                required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
              },
            },
            Snack: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER }, servingSize: { type: Type.STRING } },
                required: ["name", "calories", "protein", "carbs", "fat", "servingSize"],
              },
            },
          },
          required: ["Breakfast", "Lunch", "Dinner", "Snack"],
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as SuggestedMealPlan;
  } catch (e: any) {
    if (e?.code === 503) {
      throw new Error("The AI service is currently overloaded. Please try again later.");
    } else if (e?.code === 404) {
      throw new Error("Service not found. Please check your connection.");
    } else {
      throw new Error("Failed to generate meal plan. Please try again.");
    }
  }
};

export const suggestWeeklyMealPlan = async (
  calorieGoal: number,
  proteinGoal: number,
  carbsGoal: number,
  fatGoal: number
): Promise<Record<string, SuggestedMealPlan>> => {
  const apiKey = import.meta.env?.VITE_API_KEY || process.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API_KEY not found");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 7-day meal plan where each day totals approximately ${calorieGoal} calories, ${proteinGoal}g protein, ${carbsGoal}g carbs, and ${fatGoal}g fat. Provide simple, common food items that vary across days for variety.

Return ONLY a valid JSON object with exactly 7 keys: "Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7".

Each day should have exactly 4 meal types: "Breakfast", "Lunch", "Dinner", "Snack". Each meal type should be an array of food objects.

Format:
{
  "Day1": {
    "Breakfast": [{"name": "Oatmeal", "calories": 150, "protein": 5, "carbs": 27, "fat": 3, "servingSize": "1 cup cooked"}],
    "Lunch": [{"name": "Grilled Chicken Salad", "calories": 350, "protein": 35, "carbs": 15, "fat": 12, "servingSize": "1 large bowl"}],
    "Dinner": [{"name": "Salmon with rice", "calories": 450, "protein": 35, "carbs": 40, "fat": 18, "servingSize": "6oz salmon + 1 cup rice"}],
    "Snack": [{"name": "Greek yogurt", "calories": 100, "protein": 15, "carbs": 8, "fat": 2, "servingSize": "6oz"}]
  },
  "Day2": {
    // same structure for each day
  }
  // ... continue for Day3 through Day7
}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as Record<string, SuggestedMealPlan>;
  } catch (e: any) {
    if (e?.code === 503) {
      throw new Error("The AI service is currently overloaded. Please try again later.");
    } else if (e?.code === 404) {
      throw new Error("Service not found. Please check your connection.");
    } else {
      throw new Error("Failed to generate weekly meal plan. Please try again.");
    }
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
