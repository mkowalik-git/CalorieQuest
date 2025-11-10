import React, { useMemo } from 'react';
import { FoodItem } from '../types';
import { toDateString } from '../App';

type ChartView = 'calories' | 'protein' | 'carbs' | 'fat';

interface ProgressChartProps {
    foodLog: Record<string, FoodItem[]>;
    baseGoals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    goalLog: Record<string, { calorie: number }>;
    view: ChartView;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ foodLog, baseGoals, goalLog, view }) => {
    const chartData = useMemo(() => {
        const today = new Date();
        const days = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            return date;
        }).reverse();

        return days.map(date => {
            const dateKey = toDateString(date);
            const dailyLog = foodLog[dateKey] || [];
            
            let intake = 0;
            let goal = 0;

            switch (view) {
                case 'calories':
                    intake = dailyLog.reduce((sum, item) => sum + item.calories, 0);
                    goal = goalLog[dateKey]?.calorie || baseGoals.calories;
                    break;
                case 'protein':
                    intake = dailyLog.reduce((sum, item) => sum + item.protein, 0);
                    goal = baseGoals.protein;
                    break;
                case 'carbs':
                    intake = dailyLog.reduce((sum, item) => sum + item.carbs, 0);
                    goal = baseGoals.carbs;
                    break;
                case 'fat':
                    intake = dailyLog.reduce((sum, item) => sum + item.fat, 0);
                    goal = baseGoals.fat;
                    break;
            }

            const percentage = goal > 0 ? Math.min((intake / goal) * 100, 150) : 0; // Cap at 150% for visual sanity
            let barColor = 'bg-green-500';
            if (goal > 0) {
                if (intake > goal * 1.1) { // More than 10% over
                    barColor = 'bg-red-500';
                } else if (intake < goal * 0.9) { // Less than 90% of goal
                    barColor = 'bg-yellow-500';
                }
            }
            
            return {
                date,
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                intake,
                goal,
                percentage,
                barColor,
            };
        });
    }, [foodLog, baseGoals, goalLog, view]);

    const unit = view === 'calories' ? 'kcal' : 'g';

    return (
        <div>
            <div className="flex justify-between items-end h-64 bg-base-100 p-4 rounded-lg border border-base-200">
                {chartData.map(day => (
                    <div key={day.date.toISOString()} className="flex flex-col items-center w-[12%] h-full">
                        <div className="text-xs font-semibold text-neutral whitespace-nowrap">
                            {day.intake.toFixed(0)} <span className="text-gray-500">{unit}</span>
                        </div>
                        <div className="w-full h-full flex items-end justify-center pt-1">
                            <div 
                                className={`w-full max-w-[40px] ${day.barColor} rounded-t-md transition-all duration-500 ease-out`}
                                style={{ height: `${(day.percentage / 150) * 100}%` }}
                                title={`Intake: ${day.intake.toFixed(0)} / Goal: ${day.goal.toFixed(0)} ${unit}`}
                            ></div>
                        </div>
                        <div className="text-sm font-medium text-gray-500 mt-2">{day.label}</div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4 text-sm">
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>On Target</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>Under</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>Over</div>
            </div>
        </div>
    );
};