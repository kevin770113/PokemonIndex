import React, { useState, useMemo } from 'react';
import { PokemonType } from './types/pokemon';
import { PokemonData } from './types/database';
import { TypeSelector } from './components/TypeSelector';
import { ResultSection } from './components/ResultSection';
import { calculateEffectiveness } from './utils/typeCalculator';
import { searchBestAttackers, TierGroup, MoveData } from './utils/searchAlgorithm';
import { usePWA } from './hooks/usePWA';
import { UpdateToast } from './components/UpdateToast';
import { PokemonSearchList } from './components/PokemonSearchList';
import { initTranslator } from './utils/translator';

const App: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [tierResults, setTierResults] = useState<TierGroup[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // 實作使用者參數開關
  const [includeShadow, setIncludeShadow] = useState(true);
  const [includeMega, setIncludeMega] = useState(true);

  const { needRefresh, setNeedRefresh, updateServiceWorker } = usePWA();

  const handleToggleType = (type: PokemonType) => {
    setSelectedTypes(prev => {
      const newTypes = prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : (prev.length < 2 ? [...prev, type] : prev);
      
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
    if (selectedTypes.length === 0) {
      alert("請先上方選擇至少一個防守方屬性！");
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      // 平行發送三個請求，載入雙資料庫與翻譯快取
      const [pokemonResponse, movesResponse, _] = await Promise.all([
        fetch('/pokemon-data.json'),
        fetch('/moves-data.json'),
        initTranslator()
      ]);

      if (!pokemonResponse.ok || !movesResponse.ok) throw new Error('Network response was not ok');
      
      const allPokemon: PokemonData[] = await pokemonResponse.json();
      const movesDict: Record<string, MoveData> = await movesResponse.json();
      
      const results = searchBestAttackers(
        allPokemon, 
        movesDict, 
        selectedTypes, 
        { includeShadow, includeMega }
      );
      setTierResults(results);
    } catch (error) {
      console.error("無法載入資料:", error);
      alert("資料載入失敗，請確認 pokemon-data.json 與 moves-data.json 是否存在。");
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
          <TypeSelector selectedTypes={selectedTypes} onToggleType={handleToggleType} />
        </main>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">防守弱點與戰鬥模擬分析</h2>
          <ResultSection results={effectivenessResults} />
          
          {/* 過濾開關區塊 */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <input 
                type="checkbox" 
                checked={includeShadow} 
                onChange={(e) => setIncludeShadow(e.target.checked)} 
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              包含暗影寶可夢
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <input 
                type="checkbox" 
                checked={includeMega} 
                onChange={(e) => setIncludeMega(e.target.checked)} 
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              包含超級進化 (Mega)
            </label>
          </div>
          
          <div className="mt-6 border-t border-gray-100 text-center pt-6">
            <button
              onClick={handleSearchAttackers}
              disabled={isSearching}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all ${
                isSearching ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
              }`}
            >
              {isSearching ? '🔍 實戰時間軸運算中...' : '🔍 搜尋實戰最佳打手'}
            </button>
          </div>

          {hasSearched && !isSearching && tierResults.length === 0 && (
            <div className="mt-6 text-center text-gray-400 py-6 border-2 border-dashed border-gray-200 rounded-xl">
              沒有符合攻擊門檻 (Atk > 180) 的有效戰力。
            </div>
          )}
          
          <PokemonSearchList tierGroups={tierResults} isLoading={isSearching} />
        </section>

      </div>
      <UpdateToast needRefresh={needRefresh} updateServiceWorker={updateServiceWorker} closeToast={() => setNeedRefresh(false)} />
    </div>
  );
};

export default App;
