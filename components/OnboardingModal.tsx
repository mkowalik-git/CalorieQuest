
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { TargetIcon } from './icons/TargetIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { PlateIcon } from './icons/PlateIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ScaleIcon } from './icons/ScaleIcon';

interface OnboardingModalProps {
  onComplete: () => void;
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
}

const steps = [
  {
    icon: SparklesIcon,
    title: "So, We Meet Again.",
    text: "You and that scale. Let's make this relationship a little less toxic. Welcome to CalorieQuest, where we track your food's tragic backstory.",
  },
  {
    icon: PlateIcon,
    title: "Log Your Culinary Crimes",
    text: "Snap a photo, describe your meal, or search our vast database. We make logging food so easy, you'll run out of excuses. Go on, confess that cupcake.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Actually Plan Ahead",
    text: "The Planner tab is your new best friend for pretending you have it all figured out. Schedule meals, hit your targets, and feel smug about it.",
  },
  {
    icon: ChatBubbleIcon,
    title: "Consult the Oracle",
    text: "Got questions? Our AI Chatbot has answers. Ask for recipe ideas, fitness tips, or whether that 'diet' soda is secretly sabotaging you. It's like having a nutritionist who's available 24/7 and won't charge you a copay.",
  },
  {
    icon: ScaleIcon,
    title: "The Accountability Engine",
    text: "Went a bit wild on pizza night? Enable this, and we'll passive-aggressively adjust your future goals to keep you honest. No escape.",
  },
];

const GoalInput: React.FC<{label: string, value: number, onChange: (value: number) => void, unit: string}> = ({ label, value, onChange, unit }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
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

export const OnboardingModal: React.FC<OnboardingModalProps> = (props) => {
  const [currentStep, setCurrentStep] = useState(0);

  const isWeeklyBalancingStep = currentStep === steps.length - 1;
  const isGoalSettingStep = currentStep === steps.length;

  const handleNext = () => {
    if (isGoalSettingStep) {
      props.onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const stepContent = isGoalSettingStep ? {
    icon: TargetIcon,
    title: "State Your Intentions",
    text: "Let's set some goals. Don't worry, they're not legally binding. You can always change them later when no one's looking.",
  } : steps[currentStep];

  const { icon: Icon, title, text } = stepContent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center transform transition-all duration-300 scale-100">
        <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-10 h-10 text-primary" />
            </div>
        </div>

        <h2 className="text-2xl font-bold text-neutral mb-3">{title}</h2>
        <p className="text-gray-600 mb-6 min-h-[70px]">{text}</p>
        
        {isGoalSettingStep ? (
            <div className="space-y-4 text-left mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <GoalInput label="Calories" value={props.calorieGoal} onChange={props.setCalorieGoal} unit="kcal" />
                    <GoalInput label="Protein" value={props.proteinGoal} onChange={props.setProteinGoal} unit="g" />
                    <GoalInput label="Carbs" value={props.carbsGoal} onChange={props.setCarbsGoal} unit="g" />
                    <GoalInput label="Fat" value={props.fatGoal} onChange={props.setFatGoal} unit="g" />
                </div>
                 <GoalInput label="Water" value={props.waterGoal} onChange={props.setWaterGoal} unit="ml" />
            </div>
        ) : isWeeklyBalancingStep ? (
            <div className="flex items-center justify-between bg-base-100 p-4 rounded-lg my-6 animate-fade-in">
                <div>
                    <h3 className="font-semibold text-neutral text-left">Enable Weekly Balancing?</h3>
                </div>
                <label htmlFor="weekly-toggle-onboarding" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id="weekly-toggle-onboarding" className="sr-only" checked={props.weeklyTargetEnabled} onChange={(e) => props.setWeeklyTargetEnabled(e.target.checked)} />
                        <div className="block bg-base-300 w-14 h-8 rounded-full"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${props.weeklyTargetEnabled ? 'transform translate-x-6 bg-primary' : ''}`}></div>
                    </div>
                </label>
            </div>
        ) : (
             <div className="flex justify-center space-x-2 mb-8">
                {[...steps, {}].map((_, index) => (
                    <div key={index} className={`w-2 h-2 rounded-full transition-colors ${currentStep === index ? 'bg-primary' : 'bg-base-300'}`}></div>
                ))}
            </div>
        )}
       

        <div className="flex items-center justify-between mt-4">
            {currentStep > 0 ? (
                <button
                    onClick={handleBack}
                    className="text-sm font-semibold text-gray-500 hover:text-neutral transition-colors"
                >
                    Back
                </button>
            ) : <div />}
             <div className="flex-grow"></div>
            <button
                onClick={handleNext}
                className="bg-primary hover:bg-primary-focus text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
                {isGoalSettingStep ? "Unleash the Quest!" : "Next"}
            </button>
        </div>
      </div>
    </div>
  );
};
