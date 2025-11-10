import React, { useState, useMemo } from 'react';
import { FoodItem, MealType, SuggestedMeal, SuggestedMealPlan } from '../types';
import { AddFoodModal } from './AddFoodModal';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { toDateString } from '../App';
import { CalendarPlusIcon } from './icons/CalendarPlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import * as geminiService from '../services/geminiService';

interface PlannerProps {
  mealPlan: Record<string, FoodItem[]>;
  addMealToPlan: (date: Date, food: Omit<FoodItem, 'id'>) => void;
  removeMealFromPlan: (date: Date, itemId: string) => void;
  logPlannedMeals: (date: Date) => void;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

const parseServingSize = (servingSize?: string): { value: number; unit: string } => {
    if (!servingSize || typeof servingSize !== 'string') {
        return { value: 1, unit: 'serving' };
    }
    const match = servingSize.trim().match(/^(\d*\.?\d+)\s*(\w[\w\s]*)$/);
    if (match) {
        return { value: parseFloat(match[1]), unit: match[2].trim() };
    }
    return { value: 1, unit: servingSize.trim() };
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const SuggestedPlanModal: React.FC<{
  plan: SuggestedMealPlan;
  targetDate: Date;
  onClose: () => void;
  onApply: (date: Date, plan: SuggestedMealPlan) => void;
}> = ({ plan, targetDate, onClose, onApply }) => {
    
    const totals = useMemo(() => {
        return Object.values(plan).flat().reduce((acc, item) => {
            acc.calories += item.calories;
            acc.protein += item.protein;
            acc.carbs += item.carbs;
            acc.fat += item.fat;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [plan]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                <h2 className="text-xl font-bold text-neutral mb-2">AI Meal Plan Suggestion</h2>
                <p className="text-sm text-gray-500 mb-4">For {targetDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                
                <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
                    {Object.entries(plan).map(([mealType, meals]) => (
                        <div key={mealType}>
                            <h3 className="font-bold text-md text-neutral border-b border-base-200 pb-1 mb-2">{mealType}</h3>
                            <ul className="space-y-1 text-sm">
                                {(meals as SuggestedMeal[]).map((meal, index) => (
                                    <li key={index} className="flex justify-between items-center bg-base-100 p-2 rounded">
                                        <span>{meal.name} <span className="text-xs text-gray-500">({meal.servingSize})</span></span>
                                        <span className="text-gray-500 text-xs">{meal.calories.toFixed(0)} kcal</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-base-200 text-center font-semibold">
                    <p>Total: {totals.calories.toFixed(0)}kcal | P:{totals.protein.toFixed(0)}g | C:{totals.carbs.toFixed(0)}g | F:{totals.fat.toFixed(0)}g</p>
                </div>
                 <button 
                    onClick={() => onApply(targetDate, plan)}
                    className="w-full mt-4 bg-gradient-primary text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg active:animate-boop"
                >
                    Apply this Plan
                </button>
            </div>
        </div>
    );
};


export const Planner: React.FC<PlannerProps> = (props) => {
  const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(new Date()));
  const [modalState, setModalState] = useState<{ open: boolean; date: Date | null; mealType: MealType | null }>({ open: false, date: null, mealType: null });
  
  const [suggestedPlan, setSuggestedPlan] = useState<SuggestedMealPlan | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [suggestionTargetDate, setSuggestionTargetDate] = useState<Date | null>(null);


  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [startOfWeek]);
  
  const handleAddFoodToPlan = (food: Omit<FoodItem, 'id'>) => {
    if (modalState.date) {
      props.addMealToPlan(modalState.date, food);
    }
    setModalState({ open: false, date: null, mealType: null });
  };
  
  const openModal = (date: Date, mealType: MealType) => {
    setModalState({ open: true, date, mealType });
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    setStartOfWeek(current => {
      const newDate = new Date(current);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  };

  const handleSuggestPlan = async (date: Date) => {
    setIsSuggesting(true);
    setSuggestionError('');
    setSuggestedPlan(null);
    setSuggestionTargetDate(date);
    try {
        const plan = await geminiService.suggestMealPlan(
            props.calorieGoal,
            props.proteinGoal,
            props.carbsGoal,
            props.fatGoal
        );
        setSuggestedPlan(plan);
    } catch (e) {
        console.error(e);
        setSuggestionError('Could not generate a meal plan. Please try again.');
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleApplySuggestion = (date: Date, plan: SuggestedMealPlan) => {
    Object.entries(plan).forEach(([mealType, meals]) => {
      (meals as SuggestedMeal[]).forEach(meal => {
        const { value, unit } = parseServingSize(meal.servingSize);
        props.addMealToPlan(date, { 
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            quantity: 1, 
            mealType: mealType as MealType,
            servingValue: value,
            servingUnit: unit,
        });
      });
    });
    setSuggestedPlan(null);
    setSuggestionTargetDate(null);
  };
  
  const weekFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  });
  
  const weekRange = `${weekFormatter.format(weekDays[0])} - ${weekFormatter.format(weekDays[6])}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => changeWeek('prev')} className="p-2 rounded-full hover:bg-base-200 transition" aria-label="Previous week">
          <ChevronLeftIcon className="w-6 h-6 text-neutral" />
        </button>
        <h2 className="text-xl font-bold text-center text-neutral">{weekRange}</h2>
        <button onClick={() => changeWeek('next')} className="p-2 rounded-full hover:bg-base-200 transition" aria-label="Next week">
          <ChevronRightIcon className="w-6 h-6 text-neutral" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map(date => {
          const dateKey = toDateString(date);
          const todaysPlan = props.mealPlan[dateKey] || [];
          const totalCalories = todaysPlan.reduce((sum, item) => sum + item.calories * item.quantity, 0);

          return (
            <div key={dateKey} className="bg-base-100 rounded-lg p-3 flex flex-col space-y-3 min-h-[300px]">
              <div className="text-center border-b border-base-200 pb-2">
                <p className="font-bold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <p className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { day: 'numeric' })}</p>
                <p className="text-sm font-semibold text-primary mt-1">{totalCalories.toFixed(0)} kcal</p>
              </div>
              <div className="flex-grow space-y-2">
                {Object.values(MealType).map(mealType => {
                   const itemsForMeal = todaysPlan.filter(item => item.mealType === mealType);
                   return (
                     <div key={mealType}>
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase text-gray-500">{mealType}</h4>
                            <button onClick={() => openModal(date, mealType)} className="text-secondary hover:text-secondary-focus p-1"><PlusIcon className="w-4 h-4" /></button>
                        </div>
                        <div className="text-xs space-y-1 mt-1">
                            {itemsForMeal.map(item => (
                                <div key={item.id} className="group flex justify-between items-center bg-white p-1 rounded">
                                    <span>{item.name} <span className="text-gray-400">({(item.quantity * (item.servingValue || 1)).toFixed(0)}{item.servingUnit})</span></span>
                                    <button onClick={() => props.removeMealFromPlan(date, item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><TrashIcon className="w-3.5 h-3.5"/></button>
                                </div>
                            ))}
                        </div>
                     </div>
                   )
                })}
              </div>
              <div className="mt-auto space-y-2">
                <button
                    onClick={() => handleSuggestPlan(date)}
                    disabled={isSuggesting && suggestionTargetDate?.toDateString() === date.toDateString()}
                    className="w-full flex items-center justify-center gap-1 text-xs bg-gradient-brand text-white font-bold py-1.5 px-2 rounded-md transition duration-300 shadow hover:shadow-md disabled:opacity-70 active:animate-boop"
                >
                    {isSuggesting && suggestionTargetDate?.toDateString() === date.toDateString() ? '...' : <><SparklesIcon className="w-4 h-4" />Ask the Oracle</>}
                </button>
                {todaysPlan.length > 0 && (
                  <button
                    onClick={() => props.logPlannedMeals(date)}
                    className="flex items-center justify-center gap-1 w-full text-xs bg-gradient-secondary text-white font-bold py-1.5 px-2 rounded-md transition duration-300 shadow hover:shadow-md active:animate-boop"
                  >
                    <CalendarPlusIcon className="w-4 h-4" />
                    Log All
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {modalState.open && modalState.date && modalState.mealType && (
        <AddFoodModal 
            onClose={() => setModalState({ open: false, date: null, mealType: null })}
            onAddFood={handleAddFoodToPlan}
            defaultMealType={modalState.mealType}
            hideMealTypeSelector={true}
        />
      )}

      {suggestedPlan && suggestionTargetDate && (
        <SuggestedPlanModal
            plan={suggestedPlan}
            targetDate={suggestionTargetDate}
            onClose={() => { setSuggestedPlan(null); setSuggestionTargetDate(null); }}
            onApply={handleApplySuggestion}
        />
      )}
    </div>
  );
};