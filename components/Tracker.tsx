

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FoodItem, MealType } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { WaterGlass } from './WaterGlass';
import { AddFoodModal } from './AddFoodModal';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CalendarPlusIcon } from './icons/CalendarPlusIcon';
import { toDateString } from '../App';
import { Confetti } from './Confetti';
import { AnimatedNumber } from './AnimatedNumber';
import { HealthTip } from './HealthTip';
import { ShareIcon } from './icons/ShareIcon';
import { ShareModal } from './ShareModal';
import { PencilIcon } from './icons/PencilIcon';
import { EditFoodModal } from './EditFoodModal';

interface TrackerProps {
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  removeFoodItem: (id: string) => void;
  updateFoodItem: (id: string, updates: Partial<Omit<FoodItem, 'id'>>) => void;
  calorieGoal: number;
  setCalorieGoal: (goal: number) => void;
  proteinGoal: number;
  setProteinGoal: (goal: number) => void;
  carbsGoal: number;
  setCarbsGoal: (goal: number) => void;
  fatGoal: number;
  setFatGoal: (goal: number) => void;
  waterIntake: number;
  waterGoal: number;
  logWater: (amount: number) => void;
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  mealPlan: Record<string, FoodItem[]>;
  logPlannedMeals: (date: Date) => void;
  lastAddedId: string | null;
}

const CalorieProgress: React.FC<{ current: number; goal: number; setGoal: (goal: number) => void; }> = ({ current, goal, setGoal }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState(String(goal));
    const [animate, setAnimate] = useState(false);
    const prevCurrentRef = useRef<number>();
    
    useEffect(() => {
        if (prevCurrentRef.current !== undefined && prevCurrentRef.current !== current) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 400);
            // FIX: Pass the timer ID to clearTimeout to prevent errors and memory leaks.
            return () => clearTimeout(timer);
        }
        prevCurrentRef.current = current;
    }, [current]);

    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    const circumference = 2 * Math.PI * 52; // 2 * pi * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const handleGoalSave = () => {
        const newGoal = parseInt(tempGoal, 10);
        if (!isNaN(newGoal) && newGoal > 0) {
            setGoal(newGoal);
        } else {
            setTempGoal(String(goal)); // Reset on invalid input
        }
        setIsEditing(false);
    };
    
    const gradientId = useMemo(() => {
        if (goal <= 0) return 'on-target-gradient'; // Default
        const ratio = current / goal;
        if (ratio > 1.1) return 'over-gradient';
        if (ratio < 0.9) return 'under-gradient';
        return 'on-target-gradient';
    }, [current, goal]);

    return (
        <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="12" className="text-base-200"/>
                <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    strokeWidth="12"
                    stroke={`url(#${gradientId})`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease-in-out'
                    }}
                />
                 <defs>
                    <linearGradient id="on-target-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="under-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#facc15" />
                    </linearGradient>
                     <linearGradient id="over-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#f87171" />
                    </linearGradient>
                </defs>
            </svg>
            <div className={`absolute flex flex-col items-center transition-transform duration-300 ${animate ? 'animate-bump' : ''}`}>
                <span className="text-3xl font-bold text-neutral"><AnimatedNumber value={current} /></span>
                 <div className="text-sm text-gray-500 cursor-pointer" onClick={() => setIsEditing(true)}>
                    {isEditing ? (
                        <input
                            type="number"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(e.target.value)}
                            onBlur={handleGoalSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
                            className="w-20 text-center bg-base-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                    ) : (
                        <span>/ {goal.toFixed(0)} kcal</span>
                    )}
                </div>
            </div>
        </div>
    );
};

const MacroProgress: React.FC<{ label: string; current: number; goal: number; setGoal: (goal: number) => void; }> = ({ label, current, goal, setGoal }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState(String(goal));
    const [animate, setAnimate] = useState(false);
    const prevCurrentRef = useRef<number>();

    useEffect(() => {
        if (prevCurrentRef.current !== undefined && prevCurrentRef.current !== current) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 400); // Animation duration
            // FIX: Pass the timer ID to clearTimeout to prevent errors and memory leaks.
            return () => clearTimeout(timer);
        }
        prevCurrentRef.current = current;
    }, [current]);
    
    const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

    const handleGoalSave = () => {
        const newGoal = parseInt(tempGoal, 10);
        if (!isNaN(newGoal) && newGoal >= 0) {
            setGoal(newGoal);
        } else {
            setTempGoal(String(goal));
        }
        setIsEditing(false);
    };

    const { statusColor, progressBarColor } = useMemo(() => {
        if (goal <= 0) {
            return { statusColor: 'bg-gray-200', progressBarColor: 'bg-gray-200' };
        }
        const ratio = current / goal;
        if (ratio > 1.1) {
            return {
                statusColor: 'bg-red-500',
                progressBarColor: 'bg-gradient-to-r from-red-500 to-rose-500',
            };
        } else if (ratio < 0.9) {
            return {
                statusColor: 'bg-yellow-500',
                progressBarColor: 'bg-gradient-to-r from-amber-500 to-yellow-500',
            };
        } else {
            return {
                statusColor: 'bg-emerald-500',
                progressBarColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
            };
        }
    }, [current, goal]);


    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></span>
                    <span className="text-sm font-semibold text-neutral">{label}</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer" onClick={() => setIsEditing(true)}>
                    <span>
                        <span className={`inline-block transition-transform duration-300 ${animate ? 'animate-bump' : ''}`}>
                            <AnimatedNumber value={current} />
                        </span>
                        &nbsp;/
                    </span>
                     {isEditing ? (
                        <input
                            type="number"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(e.target.value)}
                            onBlur={handleGoalSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
                            className="w-12 p-0.5 text-center bg-base-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                        />
                    ) : (
                       <span>{goal}g</span>
                    )}
                </div>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2.5 overflow-hidden">
                <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${percentage}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
        </div>
    );
};

const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const MealSection: React.FC<{
  title: string;
  items: FoodItem[];
  onRemove: (id: string) => void;
  onEdit: (item: FoodItem) => void;
}> = ({ title, items, onRemove, onEdit }) => {
  
  if (items.length === 0) return null;

  const totalCalories = items.reduce((sum, item) => sum + item.calories * item.quantity, 0);

  return (
    <div>
      <div className="flex justify-between items-center border-b border-base-200 pb-2 mb-3">
        <h3 className="font-bold text-lg text-neutral">{title}</h3>
        <p className="text-sm font-semibold text-gray-600">{totalCalories.toFixed(0)} kcal</p>
      </div>
      <div className="space-y-3">
        {items.map(item => {
            const servingValue = item.servingValue || 1;
            const servingUnit = item.servingUnit || 'serving';
            const isServingUnit = servingUnit.toLowerCase().includes('serving');

            return (
              <div key={item.id} className="flex items-center justify-between bg-base-100 p-3 rounded-lg shadow-sm">
                <div>
                  <p className="font-semibold text-neutral">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {(item.calories * item.quantity).toFixed(0)} kcal &bull; P:{(item.protein * item.quantity).toFixed(1)}g C:{(item.carbs * item.quantity).toFixed(1)}g F:{(item.fat * item.quantity).toFixed(1)}g
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right p-1 rounded-md w-36 bg-base-200/50 flex items-center justify-end px-2">
                      <div>
                          <span className="font-semibold text-sm">{(item.quantity * servingValue).toFixed(isServingUnit ? 1 : 0)} {servingUnit}</span>
                          <span className="block text-xs text-gray-500 capitalize">{item.mealType.toLowerCase()}</span>
                      </div>
                  </div>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded-full transition"
                    aria-label={`Edit ${item.name}`}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition"
                    aria-label={`Delete ${item.name}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
        })}
      </div>
    </div>
  );
};

export const Tracker: React.FC<TrackerProps> = ({ foodItems, addFoodItem, removeFoodItem, updateFoodItem, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatGoal, setFatGoal, waterIntake, waterGoal, logWater, currentDate, onPreviousDay, onNextDay, mealPlan, logPlannedMeals, lastAddedId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateWater, setAnimateWater] = useState(false);
  const prevWaterIntakeRef = useRef<number | undefined>();

  useEffect(() => {
    if (lastAddedId) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 4000); // Confetti lasts for 4 seconds
        // FIX: Pass the timer ID to clearTimeout to prevent errors and memory leaks.
        return () => clearTimeout(timer);
    }
  }, [lastAddedId]);

  useEffect(() => {
    if (prevWaterIntakeRef.current !== undefined && waterIntake !== prevWaterIntakeRef.current) {
        setAnimateWater(true);
        const timer = setTimeout(() => setAnimateWater(false), 400); // Animation duration
        return () => clearTimeout(timer);
    }
    prevWaterIntakeRef.current = waterIntake;
  }, [waterIntake]);

  const totals = useMemo(() => {
    return foodItems.reduce(
      (acc, item) => {
        const quantity = item.quantity || 1;
        acc.calories += item.calories * quantity;
        acc.protein += item.protein * quantity;
        acc.carbs += item.carbs * quantity;
        acc.fat += item.fat * quantity;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [foodItems]);
  
  const meals = useMemo(() => {
    return foodItems.reduce((acc, item) => {
        acc[item.mealType] = [...(acc[item.mealType] || []), item];
        return acc;
    }, {} as Record<MealType, FoodItem[]>);
  }, [foodItems]);

  const dateKey = toDateString(currentDate);
  const hasPlanForToday = (mealPlan[dateKey] || []).length > 0;
  const isNextDayDisabled = isSameDay(currentDate, new Date());

  const handleLogPlan = () => {
      logPlannedMeals(currentDate);
      const btn = document.getElementById('log-plan-btn');
      btn?.classList.add('animate-boop');
      setTimeout(() => btn?.classList.remove('animate-boop'), 200);
  }

  const handleAddFood = () => {
    setIsModalOpen(true);
  }
  
  const handleEditSave = (id: string, updates: Partial<Omit<FoodItem, 'id'>>) => {
    updateFoodItem(id, updates);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 relative">
      {showConfetti && <Confetti />}
      <HealthTip />
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-lg">
        <button onClick={onPreviousDay} className="p-2 rounded-full hover:bg-base-200 transition active:animate-boop" aria-label="Previous day">
            <ChevronLeftIcon className="w-6 h-6 text-neutral" />
        </button>
        <h2 className="text-lg font-bold text-center text-neutral">{formatDate(currentDate)}</h2>
        <button
            onClick={onNextDay}
            disabled={isNextDayDisabled}
            className="p-2 rounded-full hover:bg-base-200 transition disabled:opacity-50 disabled:cursor-not-allowed active:animate-boop"
            aria-label="Next day"
        >
            <ChevronRightIcon className="w-6 h-6 text-neutral" />
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neutral">The Evidence Locker</h2>
          <div className="flex items-center gap-2">
            {hasPlanForToday && (
               <button
                id="log-plan-btn"
                onClick={handleLogPlan}
                className="flex items-center bg-gradient-secondary text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow hover:shadow-lg"
              >
                <CalendarPlusIcon className="w-5 h-5 mr-1" />
                Log Plan
              </button>
            )}
            <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center bg-white border border-base-300 text-neutral font-bold py-2 px-4 rounded-full transition duration-300 shadow-sm hover:shadow-md active:animate-boop"
              >
                <ShareIcon className="w-5 h-5 mr-1" />
                Share
              </button>
            <button
              onClick={handleAddFood}
              className="flex items-center bg-gradient-primary text-white font-bold py-2 px-4 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:animate-boop"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Add Food
            </button>
          </div>
        </div>
        <div className="space-y-6 mt-4">
          {foodItems.length > 0 ? (
            <>
              <MealSection title="Breakfast" items={meals.Breakfast || []} onRemove={removeFoodItem} onEdit={setEditingItem} />
              <MealSection title="Lunch" items={meals.Lunch || []} onRemove={removeFoodItem} onEdit={setEditingItem} />
              <MealSection title="Dinner" items={meals.Dinner || []} onRemove={removeFoodItem} onEdit={setEditingItem} />
              <MealSection title="Snack" items={meals.Snack || []} onRemove={removeFoodItem} onEdit={setEditingItem} />
              <MealSection title="Drinks" items={meals.Drinks || []} onRemove={removeFoodItem} onEdit={setEditingItem} />
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
                <p className="font-semibold">Nothing logged yet.</p>
                <p className="text-sm">Are you surviving on air and good intentions?</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-neutral mb-4">The Damage Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex justify-center">
                    <CalorieProgress current={totals.calories} goal={calorieGoal} setGoal={setCalorieGoal} />
                </div>
                <div className="space-y-4">
                    <MacroProgress label="Protein" current={totals.protein} goal={proteinGoal} setGoal={setProteinGoal} />
                    <MacroProgress label="Carbohydrates" current={totals.carbs} goal={carbsGoal} setGoal={setCarbsGoal} />
                    <MacroProgress label="Fat" current={totals.fat} goal={fatGoal} setGoal={setFatGoal} />
                </div>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
            <h2 className="text-xl font-bold text-neutral mb-4">Hydration Station</h2>
              <div className="flex-grow flex flex-col items-center justify-center space-y-3">
                  <WaterGlass percentage={waterGoal > 0 ? (waterIntake / waterGoal) * 100 : 0} />
                  <p className={`text-2xl font-bold text-neutral transition-transform duration-300 ${animateWater ? 'animate-bump' : ''}`}>
                      {waterIntake} / {waterGoal} ml
                  </p>
                  <div className="flex items-center space-x-4">
                      <button onClick={() => logWater(-250)} className="p-2 rounded-full bg-base-200 hover:bg-base-300 transition active:animate-boop" aria-label="Remove one glass of water (250ml)">
                          <MinusIcon className="w-6 h-6 text-neutral" />
                      </button>
                      <button onClick={() => logWater(250)} className="p-3 rounded-full bg-gradient-secondary text-white transition shadow-lg hover:shadow-xl active:animate-boop" aria-label="Add one glass of water (250ml)">
                          <PlusIcon className="w-7 h-7" />
                      </button>
                  </div>
              </div>
        </div>
      </div>

      {isModalOpen && (
        <AddFoodModal
          onClose={() => setIsModalOpen(false)}
          onAddFood={addFoodItem}
        />
      )}
      
      {editingItem && (
        <EditFoodModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleEditSave}
        />
      )}

      {isShareModalOpen && (
        <ShareModal
          onClose={() => setIsShareModalOpen(false)}
          dailySummary={{
            date: currentDate.toISOString(),
            foodItems,
            totals,
            goals: {
                calories: calorieGoal,
                protein: proteinGoal,
                carbs: carbsGoal,
                fat: fatGoal,
                water: waterGoal,
            },
            waterIntake: waterIntake,
          }}
        />
      )}
    </div>
  );
};
