import React, { useState, useMemo } from 'react';
import { PokemonType } from './types/pokemon';
import { PokemonData } from './types/database';
import { TypeSelector } from './components/TypeSelector';
import { ResultSection } from './components/ResultSection';
import { calculateEffectiveness } from './utils/typeCalculator';
import { searchBestAttackers, TierGroup } from './utils/searchAlgorithm';
import { usePWA } from './hooks/usePWA';
import { UpdateToast } from './components/UpdateToast';
import { PokemonSearchList } from './components/PokemonSearchList';

const App: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [tierResults, setTierResults] = useState<TierGroup[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { needRefresh, setNeedRefresh, updateServiceWorker } = usePWA();

  const handleToggleType = (type: PokemonType) => {
    setSelectedTypes(prev => {
      const newTypes = prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : (prev.length < 2 ? [...prev, type] : prev);
      
      // 更換防守方屬性時，自動重置搜尋狀態
      setTierResults([]);
      setHasSearched(false);
      return newTypes;
    });
  };

  const handleClear = () => {
    setSelectedTypes([]);
    setTierResults([]);
    setHasSearched(false);
  };

  const effectivenessResults = useMemo(
    () => calculateEffectiveness(selectedTypes),
    [selectedTypes]
  );

  const handleSearchAttackers = async () => {
    if (selectedTypes.length === 0) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      // 點擊後才去載入 JSON，節省初次網頁載入資源
      const response = await fetch('/pokemon-data.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const allPokemon: PokemonData[] = await response.json();
      
      // 執行核心分級演算法
      const results = searchBestAttackers(allPokemon, selectedTypes);
      setTierResults(results);
    } catch (error) {
      console.error("無法載入寶可夢資料:", error);
      alert("資料載入失敗，請確認是否已透過 GitHub Actions 產生 pokemon-data.json。");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-8 font-sans relative">
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
          
          {/* 搜尋打手按鈕區塊 */}
          {selectedTypes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <button
                onClick={handleSearchAttackers}
                disabled={isSearching}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all ${
                  isSearching ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
                }`}
              >
                {isSearching ? '🔍 搜尋與運算中...' : '🔍 搜尋最佳打手 (T0~T10)'}
              </button>
            </div>
          )}

          {/* 無符合名單提示 */}
          {hasSearched && !isSearching && tierResults.length === 0 && (
            <div className="mt-6 text-center text-gray-400 py-6 border-2 border-dashed border-gray-200 rounded-xl">
              沒有符合 T0 ~ T10 條件的最佳打手。
            </div>
          )}
          
          {/* 渲染 T0~T10 名單 */}
          <PokemonSearchList tierGroups={tierResults} isLoading={isSearching} />
        </section>

      </div>

      <UpdateToast 
        needRefresh={needRefresh} 
        updateServiceWorker={updateServiceWorker} 
        closeToast={() => setNeedRefresh(false)} 
      />
    </div>
  );
};

export default App;
