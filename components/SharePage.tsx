import React, { useState, useEffect, useMemo } from 'react';
import { DailySummary, FoodItem, MealType } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { WaterDropIcon } from './icons/WaterDropIcon';

const MacroCard: React.FC<{ label: string; current: number; goal: number; unit: string }> = ({ label, current, goal, unit }) => {
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    const isOver = current > goal;
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-neutral">{current.toFixed(0)}<span className="text-lg text-gray-400">/{goal.toFixed(0)}{unit}</span></p>
            <div className="w-full bg-base-200 rounded-full h-2 mt-2">
                <div 
                    className={`h-2 rounded-full ${isOver ? 'bg-red-400' : 'bg-primary'}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const MealCard: React.FC<{ title: string; items: FoodItem[] }> = ({ title, items }) => {
    if (items.length === 0) return null;
    const totalCalories = items.reduce((sum, item) => sum + item.calories * item.quantity, 0);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-neutral">{title}</h3>
                <p className="text-sm font-semibold text-gray-500">{totalCalories.toFixed(0)} kcal</p>
            </div>
            <ul className="space-y-2">
                {items.map(item => {
                    const displayQuantity = item.servingValue ? (item.quantity * item.servingValue).toFixed(0) : item.quantity;
                    const displayUnit = item.servingUnit || 'serving';

                    return (
                        <li key={item.id} className="text-sm text-gray-700 border-b border-base-200 pb-1 flex justify-between">
                            <span>{item.name} <span className="text-gray-500">({displayQuantity}{displayUnit})</span></span>
                            <span>{(item.calories * item.quantity).toFixed(0)} kcal</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export const SharePage: React.FC = () => {
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const data = params.get('data');
            if (!data) {
                throw new Error("No summary data found in the link.");
            }
            const decodedData = atob(decodeURIComponent(data));
            const parsedSummary: DailySummary = JSON.parse(decodedData);
            
            // Basic validation
            if (!parsedSummary.date || !parsedSummary.totals || !parsedSummary.goals) {
                throw new Error("The shared data is incomplete or corrupted.");
            }

            setSummary(parsedSummary);
        } catch (e) {
            console.error("Failed to parse shared data:", e);
            setError("This sharing link is invalid or has expired. Please ask for a new link.");
        }
    }, []);

    const meals = useMemo(() => {
        // Fix: Ensure the return type is consistent, preventing type errors on `meals` properties.
        if (!summary) return {} as Partial<Record<MealType, FoodItem[]>>;
        return summary.foodItems.reduce((acc, item) => {
            (acc[item.mealType] = acc[item.mealType] || []).push(item);
            return acc;
        }, {} as Partial<Record<MealType, FoodItem[]>>);
    }, [summary]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                 <div className="flex items-center text-3xl font-bold text-neutral mb-4">
                    <SparklesIcon className="w-10 h-10 text-brand mr-2"/>
                    CalorieQuest
                </div>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-md" role="alert">
                    <strong className="font-bold">Oops! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
                 <a href="/" className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-primary-focus transition">Go to App</a>
            </div>
        );
    }
    
    if (!summary) {
        return (
             <div className="min-h-screen flex items-center justify-center">
                 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    const formattedDate = new Date(summary.date).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });


    return (
        <div className="min-h-screen bg-base-100 font-sans">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center text-2xl font-bold text-neutral">
                        <SparklesIcon className="w-8 h-8 text-brand mr-2"/>
                        CalorieQuest
                    </div>
                    <a href="/" className="bg-primary text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-primary-focus transition">Get Started</a>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-neutral">Daily Nutrition Summary</h1>
                    <p className="text-gray-500">{formattedDate}</p>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MacroCard label="Calories" current={summary.totals.calories} goal={summary.goals.calories} unit="kcal" />
                        <MacroCard label="Protein" current={summary.totals.protein} goal={summary.goals.protein} unit="g" />
                        <MacroCard label="Carbs" current={summary.totals.carbs} goal={summary.goals.carbs} unit="g" />
                        <MacroCard label="Fat" current={summary.totals.fat} goal={summary.goals.fat} unit="g" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <MealCard title="Breakfast" items={meals.Breakfast || []} />
                            <MealCard title="Lunch" items={meals.Lunch || []} />
                            <MealCard title="Dinner" items={meals.Dinner || []} />
                            <MealCard title="Snack" items={meals.Snack || []} />
                            <MealCard title="Drinks" items={meals.Drinks || []} />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                            <WaterDropIcon className="w-16 h-16 text-blue-500 mb-2" />
                            <h3 className="font-bold text-lg text-neutral">Water Intake</h3>
                            <p className="text-3xl font-bold text-blue-600">{summary.waterIntake}<span className="text-lg text-gray-400">/{summary.goals.water}ml</span></p>
                        </div>
                    </div>
                </div>
            </main>
             <footer className="text-center py-8">
                <p className="text-gray-600">Think your friends can handle the truth about their lunch?</p>
                <a href="/" className="mt-2 inline-block bg-gradient-brand text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition">
                    Start Your Own Nutritional Reckoning
                </a>
            </footer>
        </div>
    );
};