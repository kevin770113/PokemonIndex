import React, { useState, useMemo, useEffect } from 'react';
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
  
  const [includeShadow, setIncludeShadow] = useState(true);
  const [includeMega, setIncludeMega] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { needRefresh, setNeedRefresh, updateServiceWorker } = usePWA();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
      const [dataResponse, _] = await Promise.all([
        fetch('/pokemon-data.json'),
        initTranslator()
      ]);

      if (!dataResponse.ok) throw new Error('Network response was not ok');
      
      const gameData = await dataResponse.json();
      const allPokemon: PokemonData[] = gameData.pokemon;
      const movesDict: Record<string, MoveData> = gameData.moves;
      
      const results = searchBestAttackers(
        allPokemon, 
        movesDict, 
        selectedTypes, 
        { includeShadow, includeMega }
      );
      setTierResults(results);
    } catch (error) {
      console.error("無法載入資料:", error);
      alert("資料載入失敗，請確認 pokemon-data.json 是否存在或格式是否正確。");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-8 font-sans relative pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pokémon GO PVE 屬性相剋計算機
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

          <div className="mt-5 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-500 space-y-3">
            <div>
              <p className="font-bold text-gray-600 mb-1">💡 通關時間 (TTW) 運算假設：</p>
              <p className="text-gray-400">15,000 HP / 頭目基礎 DPS: 15 / 陣亡延遲 2s / 滅團重返 15s</p>
            </div>
            <div>
              <p className="font-bold text-gray-600 mb-1">⚔️ 動態淘汰門檻 (為防神獸壓縮榜單，以「平民第一名」為基準)：</p>
              <ul className="grid grid-cols-2 gap-1 text-gray-400">
                <li><span className="font-medium text-gray-500">S級：</span>落後平民 10% 內</li>
                <li><span className="font-medium text-gray-500">A級：</span>落後平民 20% 內</li>
                <li><span className="font-medium text-gray-500">B級：</span>落後平民 50% 內</li>
                <li><span className="font-medium text-red-400">淘汰：</span>落後平民 &gt; 50%</li>
              </ul>
            </div>
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
              沒有符合攻擊門檻或已被動態評級系統淘汰。
            </div>
          )}
          
          <PokemonSearchList tierGroups={tierResults} isLoading={isSearching} />
        </section>

      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all z-50 backdrop-blur-sm bg-opacity-80 active:scale-90"
          title="回到最上方"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>
      )}

      <UpdateToast needRefresh={needRefresh} updateServiceWorker={updateServiceWorker} closeToast={() => setNeedRefresh(false)} />
    </div>
  );
};

export default App;
