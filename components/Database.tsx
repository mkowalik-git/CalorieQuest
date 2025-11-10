import React, { useState, useMemo } from 'react';
import { FoodItem, FoodSearchResult, MealType } from '../types';
import * as geminiService from '../services/geminiService';
import { PlusIcon } from './icons/PlusIcon';
import { FilterIcon } from './icons/FilterIcon';

interface DatabaseProps {
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
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

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full p-10">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

type SortKey = 'default' | 'calories-asc' | 'calories-desc' | 'protein-desc' | 'carbs-asc' | 'fat-asc';

const sortOptions: { key: SortKey, label: string }[] = [
    { key: 'default', label: 'Default' },
    { key: 'calories-asc', label: 'Calories ↑' },
    { key: 'calories-desc', label: 'Calories ↓' },
    { key: 'protein-desc', label: 'Protein ↓' },
    { key: 'carbs-asc', label: 'Carbs ↑' },
    { key: 'fat-asc', label: 'Fat ↑' },
];

export const Database: React.FC<DatabaseProps> = ({ addFoodItem }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.Snack);

  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minCalories: '', maxCalories: '',
    minProtein: '', maxProtein: '',
    minCarbs: '', maxCarbs: '',
    minFat: '', maxFat: '',
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    setResults([]);
    setSortKey('default');
    setFilters({ minCalories: '', maxCalories: '', minProtein: '', maxProtein: '', minCarbs: '', maxCarbs: '', minFat: '', maxFat: '' });
    setShowFilters(false);
    try {
      const searchResults = await geminiService.searchFoodDatabase(query);
      if (searchResults.length === 0) {
        setError("The archives returned nothing. Either this food is a myth, or you spelled it wrong. Let's assume the latter.");
      }
      setResults(searchResults);
    } catch (e) {
      console.error(e);
      setError('An error occurred during the search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processedResults = useMemo(() => {
    let processed = [...results];

    // Filtering
    const filterValues = {
        minCalories: parseInt(filters.minCalories, 10), maxCalories: parseInt(filters.maxCalories, 10),
        minProtein: parseInt(filters.minProtein, 10), maxProtein: parseInt(filters.maxProtein, 10),
        minCarbs: parseInt(filters.minCarbs, 10), maxCarbs: parseInt(filters.maxCarbs, 10),
        minFat: parseInt(filters.minFat, 10), maxFat: parseInt(filters.maxFat, 10),
    };

    if (!isNaN(filterValues.minCalories)) processed = processed.filter(item => item.calories >= filterValues.minCalories);
    if (!isNaN(filterValues.maxCalories)) processed = processed.filter(item => item.calories <= filterValues.maxCalories);
    if (!isNaN(filterValues.minProtein)) processed = processed.filter(item => item.protein >= filterValues.minProtein);
    if (!isNaN(filterValues.maxProtein)) processed = processed.filter(item => item.protein <= filterValues.maxProtein);
    if (!isNaN(filterValues.minCarbs)) processed = processed.filter(item => item.carbs >= filterValues.minCarbs);
    if (!isNaN(filterValues.maxCarbs)) processed = processed.filter(item => item.carbs <= filterValues.maxCarbs);
    if (!isNaN(filterValues.minFat)) processed = processed.filter(item => item.fat >= filterValues.minFat);
    if (!isNaN(filterValues.maxFat)) processed = processed.filter(item => item.fat <= filterValues.maxFat);
    
    // Sorting
    switch (sortKey) {
        case 'calories-asc': processed.sort((a, b) => a.calories - b.calories); break;
        case 'calories-desc': processed.sort((a, b) => b.calories - a.calories); break;
        case 'protein-desc': processed.sort((a, b) => b.protein - a.protein); break;
        case 'carbs-asc': processed.sort((a, b) => a.carbs - b.carbs); break;
        case 'fat-asc': processed.sort((a, b) => a.fat - b.fat); break;
        default: break;
    }

    return processed;
  }, [results, sortKey, filters]);

  
  const handleStartAdd = (item: FoodSearchResult) => {
    setAddingItemId(item.name + item.servingSize); // Create a simple unique ID
    setSelectedMealType(MealType.Snack);
  };

  const handleConfirmAdd = (item: FoodSearchResult) => {
    const { value, unit } = parseServingSize(item.servingSize);
    addFoodItem({
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      mealType: selectedMealType,
      quantity: 1,
      servingValue: value,
      servingUnit: unit,
    });
    setAddingItemId(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ minCalories: '', maxCalories: '', minProtein: '', maxProtein: '', minCarbs: '', maxCarbs: '', minFat: '', maxFat: '' });
  };


  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-neutral">The Culinary Archives</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Look up that questionable street taco..."
          className="flex-grow p-3 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition duration-300 disabled:opacity-70"
        >
          {isLoading ? '...' : 'Search'}
        </button>
      </div>

       {results.length > 0 && (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Sort by:</span>
                    {sortOptions.map(opt => (
                        <button 
                            key={opt.key}
                            onClick={() => setSortKey(opt.key)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 transform hover:scale-105 ${sortKey === opt.key ? 'bg-gradient-secondary text-white shadow-md' : 'bg-base-200 hover:bg-base-300'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                 <button onClick={() => setShowFilters(prev => !prev)} className="flex items-center gap-2 text-sm font-semibold text-neutral bg-base-200 px-4 py-2 rounded-full hover:bg-base-300 transition">
                    <FilterIcon className="w-5 h-5"/>
                    Filters
                </button>
            </div>
             {showFilters && (
                <div className="bg-base-100 p-4 rounded-lg border border-base-200 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FilterInput label="Min Calories" name="minCalories" value={filters.minCalories} onChange={handleFilterChange} />
                        <FilterInput label="Max Calories" name="maxCalories" value={filters.maxCalories} onChange={handleFilterChange} />
                        <FilterInput label="Min Protein (g)" name="minProtein" value={filters.minProtein} onChange={handleFilterChange} />
                        <FilterInput label="Max Protein (g)" name="maxProtein" value={filters.maxProtein} onChange={handleFilterChange} />
                        <FilterInput label="Min Carbs (g)" name="minCarbs" value={filters.minCarbs} onChange={handleFilterChange} />
                        <FilterInput label="Max Carbs (g)" name="maxCarbs" value={filters.maxCarbs} onChange={handleFilterChange} />
                        <FilterInput label="Min Fat (g)" name="minFat" value={filters.minFat} onChange={handleFilterChange} />
                        <FilterInput label="Max Fat (g)" name="maxFat" value={filters.maxFat} onChange={handleFilterChange} />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={resetFilters} className="text-sm font-semibold text-gray-600 hover:text-red-500 transition">Reset Filters</button>
                    </div>
                </div>
            )}
        </div>
      )}

      <div className="min-h-[400px]">
        {isLoading && <LoadingSpinner />}
        {error && !isLoading && (
          <div className="text-center text-gray-500 py-10">
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && results.length === 0 && (
            <div className="text-center text-gray-400 py-10">
                <p className="font-semibold">The archives are vast. What culinary mystery shall we solve today?</p>
                <p className="text-sm mt-2">e.g., "grilled chicken breast", "avocado", "oatmeal"</p>
            </div>
        )}
        {!isLoading && results.length > 0 && processedResults.length === 0 && (
             <div className="text-center text-gray-500 py-10">
                <p>No results match your current filters.</p>
                <button onClick={resetFilters} className="mt-2 text-sm font-semibold text-primary hover:underline">Clear filters</button>
            </div>
        )}

        {processedResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedResults.map((item, index) => {
              const uniqueId = item.name + item.servingSize;
              const isAdding = addingItemId === uniqueId;

              return (
                <div key={index} className="bg-base-100 p-4 rounded-lg shadow-sm space-y-3 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-neutral">{item.name}</h3>
                    <p className="text-sm text-gray-500">Serving: {item.servingSize}</p>
                  </div>
                  <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1 py-2">
                    <p><strong>Calories:</strong> {item.calories.toFixed(0)}</p>
                    <p><strong>Protein:</strong> {item.protein.toFixed(1)}g</p>
                    <p><strong>Carbs:</strong> {item.carbs.toFixed(1)}g</p>
                    <p><strong>Fat:</strong> {item.fat.toFixed(1)}g</p>
                  </div>
                  
                  {isAdding ? (
                    <div className="space-y-2 pt-2 border-t border-base-200">
                        <div className="flex justify-center flex-wrap gap-1 my-2">
                            {Object.values(MealType).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedMealType(type)}
                                    className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${selectedMealType === type ? 'bg-secondary text-white' : 'bg-base-200 hover:bg-base-300'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleConfirmAdd(item)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2 rounded-md transition">Confirm</button>
                            <button onClick={() => setAddingItemId(null)} className="w-full bg-gray-300 hover:bg-gray-400 text-neutral text-sm font-bold py-2 rounded-md transition">Cancel</button>
                        </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStartAdd(item)}
                      className="w-full flex items-center justify-center bg-gradient-primary text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg active:animate-boop"
                    >
                      <PlusIcon className="w-4 h-4 mr-1"/>
                      Add to Log
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterInput: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <input
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            placeholder="Any"
            className="w-full p-2 text-sm border border-base-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        />
    </div>
);