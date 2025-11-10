import React, { useState, useMemo } from 'react';
import { DailySummary, MealType } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface ShareModalProps {
  onClose: () => void;
  dailySummary: DailySummary;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose, dailySummary }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const shareLink = useMemo(() => {
    try {
      const jsonString = JSON.stringify(dailySummary);
      const base64String = btoa(jsonString);
      const encodedData = encodeURIComponent(base64String);
      return `${window.location.origin}/share?data=${encodedData}`;
    } catch (error) {
      console.error("Error creating share link:", error);
      return '';
    }
  }, [dailySummary]);

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      }).catch(err => {
        console.error("Failed to copy link:", err);
        alert("Failed to copy link. Please try again.");
      });
    }
  };
  
  const date = new Date(dailySummary.date);
  const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  
  const meals = useMemo(() => {
    return dailySummary.foodItems.reduce((acc, item) => {
        acc[item.mealType] = [...(acc[item.mealType] || []), item];
        return acc;
    }, {} as Record<MealType, typeof dailySummary.foodItems>);
  }, [dailySummary.foodItems]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-brand" />
            <h2 className="text-xl font-bold text-neutral">Share Your Summary</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Share a read-only summary of your nutrition for {formattedDate}.</p>

        <div className="bg-base-100 p-4 rounded-lg border border-base-200 mb-4 max-h-60 overflow-y-auto">
            <h3 className="font-bold text-center mb-2">Summary Preview</h3>
            <div className="text-sm space-y-3">
                <div className="flex justify-around font-semibold text-center">
                    <div><p>{dailySummary.totals.calories.toFixed(0)}</p><p className="text-xs text-gray-500">Calories</p></div>
                    <div><p>{dailySummary.totals.protein.toFixed(0)}g</p><p className="text-xs text-gray-500">Protein</p></div>
                    <div><p>{dailySummary.totals.carbs.toFixed(0)}g</p><p className="text-xs text-gray-500">Carbs</p></div>
                    <div><p>{dailySummary.totals.fat.toFixed(0)}g</p><p className="text-xs text-gray-500">Fat</p></div>
                </div>
                {Object.entries(meals).map(([mealType, items]) => {
                    if (items.length === 0) return null;
                    return (
                        <div key={mealType}>
                            <h4 className="font-semibold text-xs uppercase text-gray-400">{mealType}</h4>
                            <ul className="list-disc list-inside text-gray-600">
                                {items.map(item => {
                                    const displayQuantity = item.servingValue ? (item.quantity * item.servingValue).toFixed(0) : item.quantity;
                                    const displayUnit = item.servingUnit || 'serving';
                                    return <li key={item.id}>{item.name} ({displayQuantity}{displayUnit})</li>
                                })}
                            </ul>
                        </div>
                    )
                })}
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" readOnly value={shareLink} className="flex-grow p-2 border border-base-300 rounded-md bg-base-200 text-sm text-gray-600" />
            <button
                onClick={handleCopy}
                className={`w-full sm:w-auto px-6 py-2 font-bold text-white rounded-md transition duration-300 ${copyStatus === 'copied' ? 'bg-emerald-500' : 'bg-primary hover:bg-primary-focus'}`}
            >
                {copyStatus === 'copied' ? 'Copied!' : 'Copy Link'}
            </button>
        </div>
      </div>
    </div>
  );
};