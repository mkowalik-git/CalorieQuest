export interface FoodItem {
  id: string;
  name: string;
  calories: number; // Calories per base serving
  protein: number; // Protein per base serving
  carbs: number; // Carbs per base serving
  fat: number; // Fat per base serving
  mealType: MealType;
  quantity: number; // Number of servings
  servingValue: number; // e.g. 100
  servingUnit: string; // e.g. 'g', 'ml', 'serving'
}

export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack',
  Drinks = 'Drinks',
}

export interface FoodSearchResult {
  name:string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export enum NavigationTab {
  Tracker = 'Tracker',
  Planner = 'Planner',
  Database = 'Database',
  Goals = 'Goals',
  Chat = 'Chat',
}

export interface SuggestedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

export type SuggestedMealPlan = Partial<Record<MealType, SuggestedMeal[]>>;

export interface DailySummary {
  date: string; // ISO string
  foodItems: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  waterIntake: number;
}