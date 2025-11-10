
import React, { useState, useEffect } from 'react';
import { FoodItem, NavigationTab, MealType } from './types';
import { Header } from './components/Header';
import { Tracker } from './components/Tracker';
import { ChatBot } from './components/ChatBot';
import { Goals } from './components/Goals';
import { OnboardingModal } from './components/OnboardingModal';
import { Planner } from './components/Planner';
import { Database } from './components/Database';
import { SharePage } from './components/SharePage';

// Helper to get YYYY-MM-DD string from a Date object
export const toDateString = (date: Date): string => date.toISOString().split('T')[0];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Tracker);
  const [foodLog, setFoodLog] = useState<Record<string, FoodItem[]>>({});
  const [mealPlan, setMealPlan] = useState<Record<string, FoodItem[]>>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  // Base goals set by the user, loaded from localStorage
  const [calorieGoal, setCalorieGoal] = useState<number>(() => {
    const saved = localStorage.getItem('calorieGoal');
    return saved ? JSON.parse(saved) : 2000;
  });
  const [proteinGoal, setProteinGoal] = useState<number>(() => {
    const saved = localStorage.getItem('proteinGoal');
    return saved ? JSON.parse(saved) : 150;
  });
  const [carbsGoal, setCarbsGoal] = useState<number>(() => {
    const saved = localStorage.getItem('carbsGoal');
    return saved ? JSON.parse(saved) : 250;
  });
  const [fatGoal, setFatGoal] = useState<number>(() => {
    const saved = localStorage.getItem('fatGoal');
    return saved ? JSON.parse(saved) : 65;
  });
  
  // Adjusted daily goals for weekly balancing
  const [goalLog, setGoalLog] = useState<Record<string, { calorie: number }>>({});

  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [waterGoal, setWaterGoal] = useState<number>(() => {
    const saved = localStorage.getItem('waterGoal');
    return saved ? JSON.parse(saved) : 2000;
  });
  
  const [weeklyTargetEnabled, setWeeklyTargetEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('weeklyTargetEnabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // State to trigger animations on food add
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete) {
        setShowOnboarding(true);
    }
  }, []);

  // Persist goals to localStorage
  useEffect(() => {
    localStorage.setItem('calorieGoal', JSON.stringify(calorieGoal));
    localStorage.setItem('proteinGoal', JSON.stringify(proteinGoal));
    localStorage.setItem('carbsGoal', JSON.stringify(carbsGoal));
    localStorage.setItem('fatGoal', JSON.stringify(fatGoal));
    localStorage.setItem('waterGoal', JSON.stringify(waterGoal));
    localStorage.setItem('weeklyTargetEnabled', JSON.stringify(weeklyTargetEnabled));
  }, [calorieGoal, proteinGoal, carbsGoal, fatGoal, waterGoal, weeklyTargetEnabled]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  const recalculateWeeklyGoals = (updatedFoodLog: Record<string, FoodItem[]>, baseGoal: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Saturday - 6
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    let totalConsumedThisWeek = 0;
    let totalPlannedThisWeek = 0;
    
    for (let i = 0; i <= dayOfWeek; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateKey = toDateString(date);

        const dailyIntake = (updatedFoodLog[dateKey] || []).reduce((sum, item) => sum + item.calories, 0);
        totalConsumedThisWeek += dailyIntake;
        
        const plannedGoal = goalLog[dateKey]?.calorie || baseGoal;
        totalPlannedThisWeek += plannedGoal;
    }
    
    const surplus = totalConsumedThisWeek - totalPlannedThisWeek;
    const daysRemaining = 6 - dayOfWeek;
    const newGoalLog = { ...goalLog };

    if (daysRemaining > 0) {
      const adjustment = surplus / daysRemaining;
      for (let i = dayOfWeek + 1; i < 7; i++) {
        const futureDate = new Date(startOfWeek);
        futureDate.setDate(startOfWeek.getDate() + i);
        const futureDateKey = toDateString(futureDate);
        newGoalLog[futureDateKey] = { calorie: Math.max(0, baseGoal - adjustment) };
      }
    }
     // Clear adjustments for past days to avoid clutter
    // Fix: Corrected a typo in the for loop incrementor from 'i_' to 'i'.
    for (let i = 0; i < dayOfWeek; i++) {
        const pastDate = new Date(startOfWeek);
        pastDate.setDate(startOfWeek.getDate() + i);
        const pastDateKey = toDateString(pastDate);
        if (newGoalLog[pastDateKey]) {
            delete newGoalLog[pastDateKey];
        }
    }

    setGoalLog(newGoalLog);
  };

  useEffect(() => {
    if (weeklyTargetEnabled) {
        recalculateWeeklyGoals(foodLog, calorieGoal);
    } else {
        setGoalLog({}); // Clear adjustments when disabled
    }
  }, [weeklyTargetEnabled, calorieGoal, foodLog]);


  const addFoodItem = (item: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...item,
      id: new Date().toISOString() + Math.random(),
    };
    const dateKey = toDateString(currentDate);
    const itemsForDate = foodLog[dateKey] || [];
    const updatedFoodLog = {
      ...foodLog,
      [dateKey]: [...itemsForDate, newItem],
    };
    setFoodLog(updatedFoodLog);
    setLastAddedId(newItem.id); // Trigger animation
  };

  const removeFoodItem = (id: string) => {
    const dateKey = toDateString(currentDate);
    const itemsForDate = foodLog[dateKey] || [];
    const updatedFoodLog = {
       ...foodLog,
      [dateKey]: itemsForDate.filter((item) => item.id !== id),
    };
    setFoodLog(updatedFoodLog);
  };

  const updateFoodItem = (id: string, updates: Partial<Omit<FoodItem, 'id'>>) => {
    const dateKey = toDateString(currentDate);
    const itemsForDate = foodLog[dateKey] || [];
    const updatedFoodLog = {
      ...foodLog,
      [dateKey]: itemsForDate.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    };
    setFoodLog(updatedFoodLog);
  };

  const addMealToPlan = (date: Date, food: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...food,
      id: new Date().toISOString() + Math.random(),
    };
    const dateKey = toDateString(date);
    const itemsForDate = mealPlan[dateKey] || [];
    setMealPlan({
      ...mealPlan,
      [dateKey]: [...itemsForDate, newItem],
    });
  };

  const removeMealFromPlan = (date: Date, itemId: string) => {
    const dateKey = toDateString(date);
    const itemsForDate = mealPlan[dateKey] || [];
    setMealPlan({
      ...mealPlan,
      [dateKey]: itemsForDate.filter(item => item.id !== itemId),
    });
  };

  const logPlannedMeals = (date: Date) => {
    const dateKey = toDateString(date);
    const plannedItems = mealPlan[dateKey] || [];
    if (plannedItems.length === 0) return;

    const currentItems = foodLog[dateKey] || [];
    const newItems = plannedItems.map(item => ({...item, id: new Date().toISOString() + Math.random()}));
    const updatedFoodLog = {
      ...foodLog,
      [dateKey]: [...currentItems, ...newItems],
    };
    setFoodLog(updatedFoodLog);
    setLastAddedId(newItems[newItems.length - 1].id); // Trigger animation
  };


  const logWater = (amount: number) => {
    setWaterIntake(prev => Math.max(0, prev + amount));
  };

  const handlePreviousDay = () => {
    setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
    });
  };

  const handleNextDay = () => {
      setCurrentDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(newDate.getDate() + 1);
          return newDate;
      });
  };

  const isSharePage = window.location.pathname.startsWith('/share');
  const dateKey = toDateString(currentDate);

  // Defer weekly goal adjustment until after onboarding is complete to avoid confusion.
  const adjustedCalorieGoal = (weeklyTargetEnabled && !showOnboarding)
    ? (goalLog[dateKey]?.calorie ?? calorieGoal)
    : calorieGoal;

  const renderContent = () => {
    const itemsForCurrentDate = foodLog[dateKey] || [];

    switch (activeTab) {
      case NavigationTab.Tracker:
        return (
          <Tracker
            foodItems={itemsForCurrentDate}
            addFoodItem={addFoodItem}
            removeFoodItem={removeFoodItem}
            updateFoodItem={updateFoodItem}
            calorieGoal={adjustedCalorieGoal}
            setCalorieGoal={setCalorieGoal}
            proteinGoal={proteinGoal}
            setProteinGoal={setProteinGoal}
            carbsGoal={carbsGoal}
            setCarbsGoal={setCarbsGoal}
            fatGoal={fatGoal}
            setFatGoal={setFatGoal}
            waterIntake={waterIntake}
            waterGoal={waterGoal}
            logWater={logWater}
            currentDate={currentDate}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
            mealPlan={mealPlan}
            logPlannedMeals={logPlannedMeals}
            lastAddedId={lastAddedId}
          />
        );
      case NavigationTab.Planner:
        return (
          <Planner
            mealPlan={mealPlan}
            addMealToPlan={addMealToPlan}
            removeMealFromPlan={removeMealFromPlan}
            logPlannedMeals={logPlannedMeals}
            calorieGoal={calorieGoal}
            proteinGoal={proteinGoal}
            carbsGoal={carbsGoal}
            fatGoal={fatGoal}
          />
        );
      case NavigationTab.Database:
        return <Database addFoodItem={addFoodItem} />;
      case NavigationTab.Goals:
        return (
            <Goals
                calorieGoal={calorieGoal}
                setCalorieGoal={setCalorieGoal}
                proteinGoal={proteinGoal}
                setProteinGoal={setProteinGoal}
                carbsGoal={carbsGoal}
                setCarbsGoal={setCarbsGoal}
                fatGoal={fatGoal}
                setFatGoal={setFatGoal}
                waterGoal={waterGoal}
                setWaterGoal={setWaterGoal}
                weeklyTargetEnabled={weeklyTargetEnabled}
                setWeeklyTargetEnabled={setWeeklyTargetEnabled}
                foodLog={foodLog}
                goalLog={goalLog}
            />
        );
      case NavigationTab.Chat:
        return <ChatBot />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-base-100">
      {isSharePage ? (
        <SharePage />
      ) : (
        <>
          {showOnboarding && <OnboardingModal 
              onComplete={handleOnboardingComplete}
              calorieGoal={calorieGoal}
              setCalorieGoal={setCalorieGoal}
              proteinGoal={proteinGoal}
              setProteinGoal={setProteinGoal}
              carbsGoal={carbsGoal}
              setCarbsGoal={setCarbsGoal}
              fatGoal={fatGoal}
              setFatGoal={setFatGoal}
              waterGoal={waterGoal}
              setWaterGoal={setWaterGoal}
              weeklyTargetEnabled={weeklyTargetEnabled}
              setWeeklyTargetEnabled={setWeeklyTargetEnabled}
           />}
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="container mx-auto p-4 sm:p-6">
            {renderContent()}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
