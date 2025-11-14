

import React, { useState, useEffect } from 'react';
import { FoodItem, FoodSearchResult, MealType } from '../types';
import * as geminiService from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { CameraIcon } from './icons/CameraIcon';
import { PlusIcon } from './icons/PlusIcon';

const extractJson = (text: string) => {
  // Find the first complete JSON object
  const start = text.indexOf('{');
  if (start === -1) throw new Error("No JSON found");

  let braceCount = 0;
  let end = start;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') braceCount++;
    if (text[i] === '}') braceCount--;
    if (braceCount === 0) {
      end = i;
      break;
    }
  }

  if (braceCount !== 0) throw new Error("Invalid JSON structure");

  const jsonStr = text.substring(start, end + 1);
  // Clean up any non-ASCII characters that might cause parsing issues
  const cleanJsonStr = jsonStr.replace(/[^\x20-\x7E\n\r\t]/g, '');
  return JSON.parse(cleanJsonStr);
};

interface AddFoodModalProps {
  onClose: () => void;
  onAddFood: (item: Omit<FoodItem, 'id'>) => void;
  defaultMealType?: MealType;
  hideMealTypeSelector?: boolean;
}

type ModalTab = 'manual' | 'text' | 'image' | 'search';

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

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const FoodResultDisplay: React.FC<{ food: Omit<FoodItem, 'id' | 'mealType' | 'quantity' | 'servingValue' | 'servingUnit'> & { servingSize: string }; onAdd: (food: Omit<FoodItem, 'id' | 'mealType' | 'quantity'| 'servingValue' | 'servingUnit'> & { servingSize: string }) => void; }> = ({ food, onAdd }) => (
    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mt-4 animate-fade-in">
        <h4 className="font-bold text-lg text-emerald-800">{food.name}</h4>
        <div className="mt-2 text-sm text-emerald-700 space-y-1">
            <p><strong>Serving Size:</strong> {food.servingSize}</p>
            <p><strong>Calories:</strong> {food.calories.toFixed(0)} kcal</p>
            <p><strong>Protein:</strong> {food.protein.toFixed(1)}g</p>
            <p><strong>Carbs:</strong> {food.carbs.toFixed(1)}g</p>
            <p><strong>Fat:</strong> {food.fat.toFixed(1)}g</p>
        </div>
        <button
            onClick={() => onAdd(food)}
            className="w-full mt-3 bg-gradient-primary text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg active:animate-boop"
        >
            Add to Log
        </button>
    </div>
);

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


export const AddFoodModal: React.FC<AddFoodModalProps> = ({ onClose, onAddFood, defaultMealType, hideMealTypeSelector }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('manual');
  const [mealType, setMealType] = useState<MealType>(defaultMealType || MealType.Snack);

  // Manual form state
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [servingValue, setServingValue] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Text analysis state
  const [analysisText, setAnalysisText] = useState('');
  const [textAnalysisResult, setTextAnalysisResult] = useState<FoodSearchResult | null>(null);
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);
  const [textAnalysisError, setTextAnalysisError] = useState('');

  // Image analysis state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<FoodSearchResult | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisError, setImageAnalysisError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    setTextAnalysisResult(null);
    setTextAnalysisError('');
    setAnalysisText('');
    setImageAnalysisResult(null);
    setImageAnalysisError('');
    setImageFile(null);
    setImagePreview(null);
    setSearchResults([]);
    setSearchError('');
    setSearchQuery('');
  }, [activeTab]);

  const handleAddFoodAndClose = (food: FoodSearchResult) => {
    const { value, unit } = parseServingSize(food.servingSize);
    const foodToAdd: Omit<FoodItem, 'id'> = {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        mealType,
        quantity: 1,
        servingValue: value,
        servingUnit: unit,
    };
    onAddFood(foodToAdd);
    onClose();
  };

  const handleTextAnalyze = async () => {
    if (!analysisText) {
      setTextAnalysisError('Please enter a meal description to analyze.');
      return;
    }
    setIsAnalyzingText(true);
    setTextAnalysisError('');
    setTextAnalysisResult(null);
    try {
      const result = await geminiService.analyzeMeal(analysisText);
      let parsedResult = extractJson(result);
      parsedResult = {
        name: parsedResult.name || 'Unknown Meal',
        calories: parsedResult.calories || 0,
        protein: parsedResult.protein || 0,
        carbs: parsedResult.carbs || 0,
        fat: parsedResult.fat || 0,
        servingSize: (parsedResult.servingSize || '1 serving').replace(/[^\x20-\x7E]/g, '').trim() || '1 serving'
      };
      setTextAnalysisResult(parsedResult);
    } catch (e: any) {
      setTextAnalysisError(e.message || 'Could not analyze the description. Please try being more specific about the ingredients and quantities.');
    } finally {
      setIsAnalyzingText(false);
    }
  };

  const handleImageAnalyze = async () => {
    if (!imageFile) {
      setImageAnalysisError('Please upload an image to analyze.');
      return;
    }
    setIsAnalyzingImage(true);
    setImageAnalysisError('');
    setImageAnalysisResult(null);
    try {
      const result = await geminiService.analyzeMealImage(imageFile);
      let parsedResult = extractJson(result);
      parsedResult = {
        name: parsedResult.name || 'Unknown Meal',
        calories: parsedResult.calories || 0,
        protein: parsedResult.protein || 0,
        carbs: parsedResult.carbs || 0,
        fat: parsedResult.fat || 0,
        servingSize: (parsedResult.servingSize || '1 serving').replace(/[^\x20-\x7E]/g, '').trim() || '1 serving'
      };
      setImageAnalysisResult(parsedResult);
    } catch (e: any) {
      setImageAnalysisError(e.message || 'Could not analyze the image. The food might not be recognizable. Please try a different angle or better lighting.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchError('Please enter a food to search for.');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    try {
      const results = await geminiService.searchFoodDatabase(searchQuery);
      if (results.length === 0) {
        setSearchError('No results found. Try a different search term.');
      }
      setSearchResults(results);
    } catch (e: any) {
      setSearchError(e.message || 'Could not perform search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageAnalysisError('');
      setImageAnalysisResult(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Food name is required.';
    if (!calories.trim()) newErrors.calories = 'Calories are required.';
    else if (isNaN(Number(calories)) || Number(calories) < 0) newErrors.calories = 'Must be a non-negative number.';
    if (!servingValue.trim()) newErrors.servingValue = 'Required.';
    else if (isNaN(Number(servingValue)) || Number(servingValue) <= 0) newErrors.servingValue = 'Must be > 0.';
    if (!servingUnit.trim()) newErrors.servingUnit = 'Required.';
    
    const optionalFields: ('protein' | 'carbs' | 'fat')[] = ['protein', 'carbs', 'fat'];
    const values = { protein, carbs, fat };
    optionalFields.forEach(key => {
      const value = values[key];
      if (value.trim() && (isNaN(Number(value)) || Number(value) < 0)) newErrors[key] = 'Must be a non-negative number.';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onAddFood({
        name,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        mealType,
        quantity: 1,
        servingValue: parseFloat(servingValue) || 1,
        servingUnit: servingUnit || 'serving',
      });
      onClose();
    }
  };

  const TabButton: React.FC<{ tab: ModalTab; label: string; }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-2 text-xs sm:px-4 sm:text-sm font-medium rounded-full transition-all duration-200 transform hover:scale-105 ${activeTab === tab ? 'bg-gradient-brand text-white shadow-lg' : 'bg-base-200 hover:bg-base-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-neutral mb-4">Log a New Offense</h2>

        <div className="flex flex-wrap gap-2 border-b border-base-200 mb-4 pb-4">
          <TabButton tab="manual" label="By the Books" />
          <TabButton tab="text" label="The Interrogation" />
          <TabButton tab="image" label="Photo Evidence" />
          <TabButton tab="search" label="Check the Records" />
        </div>
        
        {!hideMealTypeSelector && <MealTypeSelector selected={mealType} onSelect={setMealType} />}

        <div className="min-h-[350px]">
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
                <input id="foodName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Apple" className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-base-300'} rounded-md`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div className="border border-base-200 rounded-md p-3 pt-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Nutrition Facts per Serving</h3>
                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label htmlFor="servingValue" className="block text-xs font-medium text-gray-500">Serving Size</label>
                        <input id="servingValue" type="number" value={servingValue} onChange={(e) => setServingValue(e.target.value)} placeholder="100" className={`w-full p-2 border ${errors.servingValue ? 'border-red-500' : 'border-base-300'} rounded-md`} />
                        {errors.servingValue && <p className="text-red-500 text-xs mt-1">{errors.servingValue}</p>}
                    </div>
                    <div>
                        <label htmlFor="servingUnit" className="block text-xs font-medium text-gray-500">Unit</label>
                        <input id="servingUnit" type="text" value={servingUnit} onChange={(e) => setServingUnit(e.target.value)} placeholder="g" className={`w-full p-2 border ${errors.servingUnit ? 'border-red-500' : 'border-base-300'} rounded-md`} />
                        {errors.servingUnit && <p className="text-red-500 text-xs mt-1">{errors.servingUnit}</p>}
                    </div>
                 </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="calories" className="block text-xs font-medium text-gray-500">Calories (kcal)</label>
                    <input id="calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className={`w-full p-2 border ${errors.calories ? 'border-red-500' : 'border-base-300'} rounded-md`} />
                    {errors.calories && <p className="text-red-500 text-xs mt-1">{errors.calories}</p>}
                  </div>
                   <div>
                    <label htmlFor="protein" className="block text-xs font-medium text-gray-500">Protein (g)</label>
                    <input id="protein" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className={`w-full p-2 border ${errors.protein ? 'border-red-500' : 'border-base-300'} rounded-md`} />
                    {errors.protein && <p className="text-red-500 text-xs mt-1">{errors.protein}</p>}
                  </div>
                  <div>
                    <label htmlFor="carbs" className="block text-xs font-medium text-gray-500">Carbs (g)</label>
                    <input id="carbs" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className={`w-full p-2 border ${errors.carbs ? 'border-red-500' : 'border-base-300'} rounded-md`} />
                    {errors.carbs && <p className="text-red-500 text-xs mt-1">{errors.carbs}</p>}
                  </div>
                  <div>
                    <label htmlFor="fat" className="block text-xs font-medium text-gray-500">Fat (g)</label>
                    <input id="fat" type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className={`w-full p-2 border ${errors.fat ? 'border-red-500' : 'border-base-300'} rounded-md`} />
                    {errors.fat && <p className="text-red-500 text-xs mt-1">{errors.fat}</p>}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-primary text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg active:animate-boop">Log the Evidence</button>
            </form>
          )}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Describe your meal for AI analysis:</label>
              <textarea id="description" value={analysisText} onChange={(e) => setAnalysisText(e.target.value)} placeholder="e.g., A large bowl of oatmeal with blueberries, almonds, and a drizzle of honey" className="w-full p-2 border border-base-300 rounded-md" rows={4} />
              <button onClick={handleTextAnalyze} disabled={isAnalyzingText} className="w-full flex items-center justify-center bg-gradient-brand text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-70 shadow-lg hover:shadow-xl active:animate-boop">
                {isAnalyzingText ? <><LoadingSpinner /> <span className="ml-2">Analyzing...</span></> : <><SparklesIcon className="w-5 h-5 mr-2" />Analyze with AI</>}
              </button>
              {textAnalysisError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-3 text-sm" role="alert">
                    <p><strong className="font-semibold">Analysis Failed:</strong> {textAnalysisError}</p>
                </div>
              )}
              {textAnalysisResult && <FoodResultDisplay food={textAnalysisResult} onAdd={handleAddFoodAndClose} />}
            </div>
          )}
          {activeTab === 'image' && (
            <div className="space-y-3">
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">Upload a picture of your meal:</label>
              <div className="relative w-full h-40 border-2 border-dashed border-base-300 rounded-lg flex items-center justify-center text-center">
                {imagePreview ? <img src={imagePreview} alt="Meal preview" className="max-h-full max-w-full rounded-md" /> : <div className="text-gray-500"><CameraIcon className="w-12 h-12 mx-auto mb-2" /><p>Click to upload an image</p></div>}
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageSelect} className="absolute w-full h-full opacity-0 cursor-pointer" />
              </div>
              <button onClick={handleImageAnalyze} disabled={isAnalyzingImage || !imageFile} className="w-full flex items-center justify-center bg-gradient-brand text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-70 shadow-lg hover:shadow-xl active:animate-boop">
                 {isAnalyzingImage ? <><LoadingSpinner /> <span className="ml-2">Analyzing Image...</span></> : <><SparklesIcon className="w-5 h-5 mr-2" />Analyze with AI</>}
              </button>
              {imageAnalysisError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mt-3 text-sm" role="alert">
                    <p><strong className="font-semibold">Analysis Failed:</strong> {imageAnalysisError}</p>
                </div>
              )}
              {imageAnalysisResult && <FoodResultDisplay food={imageAnalysisResult} onAdd={handleAddFoodAndClose} />}
            </div>
          )}
          {activeTab === 'search' && (
            <div className="space-y-3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search for a food item:</label>
              <div className="flex space-x-2">
                <input id="search" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} placeholder="e.g., 'Apple' or 'Chicken Breast'" className="flex-grow p-2 border border-base-300 rounded-md" />
                <button onClick={handleSearch} disabled={isSearching} className="px-4 py-2 bg-gradient-secondary text-white font-bold rounded-md transition duration-300 disabled:opacity-70 active:animate-boop">
                  {isSearching ? '...' : 'Go'}
                </button>
              </div>
              {searchError && <p className="text-red-500 text-xs mt-1 text-center">{searchError}</p>}
              <div className="grid grid-cols-1 gap-3 max-h-56 overflow-y-auto p-1">
                {searchResults.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-base-200 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-neutral">{item.name}</h3>
                        <p className="text-sm text-gray-500">Serving: {item.servingSize}</p>
                        <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1 py-2 mt-2 border-t border-base-200">
                            <p><strong>Calories:</strong> {item.calories.toFixed(0)} kcal</p>
                            <p><strong>Protein:</strong> {item.protein.toFixed(1)}g</p>
                            <p><strong>Carbs:</strong> {item.carbs.toFixed(1)}g</p>
                            <p><strong>Fat:</strong> {item.fat.toFixed(1)}g</p>
                        </div>
                    </div>
                    <div>
                        <button
                          onClick={() => handleAddFoodAndClose(item)}
                          className="w-full mt-3 flex items-center justify-center bg-gradient-primary text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg active:animate-boop"
                        >
                          <PlusIcon className="w-4 h-4 mr-1"/>
                          Add to Log
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
