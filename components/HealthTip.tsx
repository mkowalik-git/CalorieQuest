import React, { useState, useEffect } from 'react';
import { LightBulbIcon } from './icons/LightBulbIcon';

const healthTips = [
    "Chug some water before meals. It makes you feel full, which means less room for regrettable choices.",
    "Aim for 7-9 hours of sleep. Your muscles and your terrible morning attitude will thank you.",
    "Fiber is your friend. Eat some beans or an apple. It's not glamorous, but neither is being hangry.",
    "Take short breaks to walk around. Your FitBit is getting lonely and your chair deserves a break from you.",
    "Lift heavy things a couple of times a week. It builds muscle, which torches calories even while you're sitting there, judging people.",
    "Meal prep is a superpower. Spend one day cooking so you can eat healthy all week instead of ordering takeout in a panic.",
    "'Eat the rainbow' doesn't mean Skittles. Try adding a variety of colorful fruits and vegetables to your diet.",
    "Sugary drinks are basically liquid sadness for your health goals. Drink water. Or black coffee, the elixir of life.",
    "Listen to your body when it says it's full. It's usually smarter than your 'I deserve this' brain.",
    "Find a way to move that you don't actively hate. It's the only way you'll stick with it.",
];

export const HealthTip: React.FC = () => {
    const [tipIndex, setTipIndex] = useState(Math.floor(Math.random() * healthTips.length));
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setTipIndex(prevIndex => (prevIndex + 1) % healthTips.length);
                setIsFading(false);
            }, 500); // Wait for fade-out transition to complete
        }, 30000); // Change tip every 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 rounded-xl shadow-md flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-accent" />
            </div>
            <div>
                <h3 className="font-bold text-sm text-amber-800">Unsolicited, Yet Probably Correct, Advice</h3>
                <p className={`text-sm text-amber-700 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                    {healthTips[tipIndex]}
                </p>
            </div>
        </div>
    );
};