import React, { useState, useMemo } from 'react';
import { PokemonType } from './types/pokemon';
import { TypeSelector } from './components/TypeSelector';
import { ResultSection } from './components/ResultSection';
import { calculateEffectiveness } from './utils/typeCalculator';

const App: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);

  // 處理屬性點擊邏輯：已選則移除，未選且未滿兩個則加入
  const handleToggleType = (type: PokemonType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      if (prev.length < 2) {
        return [...prev, type];
      }
      return prev;
    });
  };

  const handleClear = () => {
    setSelectedTypes([]);
  };

  // 只有當 selectedTypes 改變時，才重新執行計算
  const effectivenessResults = useMemo(
    () => calculateEffectiveness(selectedTypes),
    [selectedTypes]
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Pokémon GO 屬性相剋計算機
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            請選擇防守方寶可夢的屬性（最多兩個）
          </p>
        </header>

        <main className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">防守方屬性</h2>
            {selectedTypes.length > 0 && (
              <button 
                onClick={handleClear}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
              >
                清除重置
              </button>
            )}
          </div>
          
          <TypeSelector 
            selectedTypes={selectedTypes} 
            onToggleType={handleToggleType} 
          />
        </main>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">防守弱點與抗性分析</h2>
          <ResultSection results={effectivenessResults} />
        </section>

      </div>
    </div>
  );
};

export default App;
