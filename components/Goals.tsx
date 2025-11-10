

import React, { useState } from 'react';
import { FoodItem } from '../types';
import { toDateString } from '../App';
import { ProgressChart } from './ProgressChart';

interface GoalsProps {
    calorieGoal: number;
    setCalorieGoal: (goal: number) => void;
    proteinGoal: number;
    setProteinGoal: (goal: number) => void;
    carbsGoal: number;
    setCarbsGoal: (goal: number) => void;
    fatGoal: number;
    setFatGoal: (goal: number) => void;
    waterGoal: number;
    setWaterGoal: (goal: number) => void;
    weeklyTargetEnabled: boolean;
    setWeeklyTargetEnabled: (enabled: boolean) => void;
    foodLog: Record<string, FoodItem[]>;
    goalLog: Record<string, { calorie: number }>;
}

const GoalInput: React.FC<{label: string, value: number, onChange: (value: number) => void, unit: string}> = ({ label, value, onChange, unit }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{unit}</span>
            </div>
        </div>
    </div>
);

type ChartView = 'calories' | 'protein' | 'carbs' | 'fat';

export const Goals: React.FC<GoalsProps> = (props) => {
  const [chartView, setChartView] = useState<ChartView>('calories');

  const chartTabs: { key: ChartView; label: string }[] = [
      { key: 'calories', label: 'Calories' },
      { key: 'protein', label: 'Protein' },
      { key: 'carbs', label: 'Carbs' },
      { key: 'fat', label: 'Fat' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-neutral mb-4">Your Grand Proclamations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GoalInput label="Calories" value={props.calorieGoal} onChange={props.setCalorieGoal} unit="kcal" />
            <GoalInput label="Protein" value={props.proteinGoal} onChange={props.setProteinGoal} unit="g" />
            <GoalInput label="Carbohydrates" value={props.carbsGoal} onChange={props.setCarbsGoal} unit="g" />
            <GoalInput label="Fat" value={props.fatGoal} onChange={props.setFatGoal} unit="g" />
            <GoalInput label="Water" value={props.waterGoal} onChange={props.setWaterGoal} unit="ml" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-neutral mb-4">A Week in Review (Brace Yourself)</h2>
        <div className="flex items-center justify-between bg-base-100 p-4 rounded-lg mb-6">
            <div>
                <h3 className="font-semibold text-neutral">Weekly Target Balancing</h3>
                <p className="text-sm text-gray-500">Feeling rebellious yesterday? This feature will passive-aggressively adjust your future goals to keep you honest. No escape.</p>
            </div>
             <label htmlFor="weekly-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id="weekly-toggle" className="sr-only" checked={props.weeklyTargetEnabled} onChange={(e) => props.setWeeklyTargetEnabled(e.target.checked)} />
                    <div className="block bg-base-300 w-14 h-8 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${props.weeklyTargetEnabled ? 'transform translate-x-6 bg-primary' : ''}`}></div>
                </div>
            </label>
        </div>

        <div>
            <div className="flex justify-center space-x-1 bg-base-200 p-1 rounded-full mb-4">
                {chartTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setChartView(tab.key)}
                        className={`w-full px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
                            chartView === tab.key
                            ? 'bg-white text-primary shadow'
                            : 'text-neutral hover:bg-base-300/50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <ProgressChart
                foodLog={props.foodLog}
                goalLog={props.goalLog}
                baseGoals={{
                    calories: props.calorieGoal,
                    protein: props.proteinGoal,
                    carbs: props.carbsGoal,
                    fat: props.fatGoal,
                }}
                view={chartView}
            />
        </div>
      </div>
    </div>
  );
};