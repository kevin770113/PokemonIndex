import React, { useState } from 'react';
import { SearchResult } from '../utils/searchAlgorithm';
import { TYPE_NAMES } from '../types/pokemon';
import { getPokemonName, getMoveName, saveCustomTranslation } from '../utils/translator';
import { OverrideModal } from './OverrideModal';

interface PokemonListItemProps {
  pokemon: SearchResult;
}

export const PokemonListItem: React.FC<PokemonListItemProps> = ({ pokemon }) => {
  // 建立本地狀態，讓元件能在修改翻譯後立即更新畫面
  const [zhName, setZhName] = useState(() => getPokemonName(pokemon.speciesId));
  const [zhMove, setZhMove] = useState(() => pokemon.bestAtkMoveId ? getMoveName(pokemon.bestAtkMoveId) : '無招式');

  // 控制彈窗開關的狀態
  const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const enName = pokemon.speciesName; 
  const dexNum = `#${pokemon.dex.toString().padStart(3, '0')}`;
  
  const enMove = pokemon.bestAtkMoveId 
    ? pokemon.bestAtkMoveId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : '';

  // 處理儲存寶可夢自訂翻譯
  const handleSavePokemon = (newName: string) => {
    saveCustomTranslation('pokemon', pokemon.speciesId, newName);
    setZhName(getPokemonName(pokemon.speciesId)); // 重新從翻譯引擎抓取最新狀態
    setIsPokemonModalOpen(false);
  };

  // 處理儲存招式自訂翻譯
  const handleSaveMove = (newName: string) => {
    if (pokemon.bestAtkMoveId) {
      saveCustomTranslation('move', pokemon.bestAtkMoveId, newName);
      setZhMove(getMoveName(pokemon.bestAtkMoveId)); // 重新從翻譯引擎抓取最新狀態
    }
    setIsMoveModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group">
        
        {/* 左側：寶可夢身分區 */}
        <div className="flex flex-col max-w-[50%]">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-gray-900 truncate">{zhName}</span>
            <button 
              onClick={() => setIsPokemonModalOpen(true)}
              className="text-gray-300 hover:text-blue-500 transition-colors px-1"
              title="修改中文名稱"
            >
              ✏️
            </button>
          </div>
          <span className="text-xs font-medium text-gray-500 mt-0.5 truncate">
            {dexNum} {enName}
          </span>
        </div>

        {/* 右側：招式與屬性徽章區 */}
        <div className="flex flex-col items-end max-w-[50%]">
          <div className="flex items-center gap-1">
             <button 
                onClick={() => setIsMoveModalOpen(true)}
                disabled={!pokemon.bestAtkMoveId}
                className="text-gray-300 hover:text-blue-500 transition-colors px-1 disabled:opacity-0"
                title="修改招式名稱"
              >
                ✏️
              </button>
            <span className="text-md font-bold text-gray-800 truncate">{zhMove}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-400 font-medium truncate">{enMove}</span>
            {pokemon.bestAtkType && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white bg-type-${pokemon.bestAtkType.toLowerCase()} shrink-0`}>
                {TYPE_NAMES[pokemon.bestAtkType]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 寶可夢翻譯覆寫彈窗 */}
      <OverrideModal 
        isOpen={isPokemonModalOpen}
        onClose={() => setIsPokemonModalOpen(false)}
        onSave={handleSavePokemon}
        title="寶可夢"
        originalEnName={enName}
        currentZhName={zhName}
      />

      {/* 招式翻譯覆寫彈窗 */}
      {pokemon.bestAtkMoveId && (
        <OverrideModal 
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          onSave={handleSaveMove}
          title="招式"
          originalEnName={enMove}
          currentZhName={zhMove}
        />
      )}
    </>
  );
};
