
import React, { useState, useEffect } from 'react';
import { FoodItem, MealType } from '../types';

interface EditFoodModalProps {
  item: FoodItem;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<FoodItem, 'id'>>) => void;
}

const MealTypeSelector: React.FC<{ selected: MealType; onSelect: (type: MealType) => void }> = ({ selected, onSelect }) => (
    <div className="flex justify-center flex-wrap gap-2 my-4">
        {Object.values(MealType).map(type => (
            <button
                key={type}
                onClick={() => onSelect(type)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 transform hover:scale-105 ${selected === type ? 'bg-gradient-secondary text-white shadow-lg' : 'bg-base-200 hover:bg-base-300'}`}
            >
                {type}
            </button>
        ))}
    </div>
);

export const EditFoodModal: React.FC<EditFoodModalProps> = ({ item, onClose, onSave }) => {
  const [mealType, setMealType] = useState<MealType>(item.mealType);
  
  const servingValue = item.servingValue || 1;
  const isServingUnit = (item.servingUnit || 'serving').toLowerCase().includes('serving');
  const initialQuantity = (item.quantity * servingValue).toFixed(isServingUnit ? 1 : 0);
  const [quantity, setQuantity] = useState<string>(initialQuantity);

  useEffect(() => {
    setMealType(item.mealType);
    const newInitialQuantity = (item.quantity * (item.servingValue || 1)).toFixed(isServingUnit ? 1 : 0);
    setQuantity(newInitialQuantity);
  }, [item, servingValue, isServingUnit]);

  const handleSave = () => {
    const newDisplayQuantity = parseFloat(quantity);
    if (!isNaN(newDisplayQuantity) && newDisplayQuantity > 0 && servingValue > 0) {
      const newQuantityMultiplier = newDisplayQuantity / servingValue;
      onSave(item.id, { quantity: newQuantityMultiplier, mealType });
    } else {
        onClose(); // Close without saving if input is invalid
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-neutral mb-2">Edit Entry</h2>
        <p className="text-gray-600 mb-4">You can't un-eat it, but you can at least correct the record.</p>
        
        <div className="bg-base-100 p-3 rounded-lg text-center mb-4">
            <p className="font-bold text-lg text-neutral">{item.name}</p>
            <p className="text-sm text-gray-500">
                {(item.calories).toFixed(0)} kcal &bull; P:{(item.protein).toFixed(1)}g C:{(item.carbs).toFixed(1)}g F:{(item.fat).toFixed(1)}g per {item.servingValue}{item.servingUnit}
            </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <div className="relative">
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full p-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                onFocus={(e) => e.target.select()}
                autoFocus
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">{item.servingUnit}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
            <MealTypeSelector selected={mealType} onSelect={setMealType} />
          </div>

          <div className="flex gap-2 pt-2">
            <button
                onClick={onClose}
                className="w-full bg-base-200 hover:bg-base-300 text-neutral font-bold py-2 px-4 rounded-md transition"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="w-full bg-gradient-primary text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg active:animate-boop"
            >
                Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
