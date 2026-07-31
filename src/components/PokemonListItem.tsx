import React, { useState } from 'react';
import { SearchResult } from '../utils/searchAlgorithm';
import { TYPE_NAMES } from '../types/pokemon';
import { getPokemonName, getMoveName, saveCustomTranslation } from '../utils/translator';
import { OverrideModal } from './OverrideModal';

interface PokemonListItemProps {
  pokemon: SearchResult;
}

export const PokemonListItem: React.FC<PokemonListItemProps> = ({ pokemon }) => {
  const [zhName, setZhName] = useState(() => getPokemonName(pokemon.speciesId));
  const [zhFastMove, setZhFastMove] = useState(() => pokemon.bestFastMoveId ? getMoveName(pokemon.bestFastMoveId) : '無小招');
  const [zhChargeMove, setZhChargeMove] = useState(() => pokemon.bestAtkMoveId ? getMoveName(pokemon.bestAtkMoveId) : '無大招');

  // 控制三個獨立彈窗的開關
  const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);
  const [isFastMoveModalOpen, setIsFastMoveModalOpen] = useState(false);
  const [isChargeMoveModalOpen, setIsChargeMoveModalOpen] = useState(false);

  const enName = pokemon.speciesName; 
  const dexNum = `#${pokemon.dex.toString().padStart(3, '0')}`;
  
  const enFastMove = pokemon.bestFastMoveId 
    ? pokemon.bestFastMoveId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : '';
  const enChargeMove = pokemon.bestAtkMoveId 
    ? pokemon.bestAtkMoveId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : '';

  const handleSavePokemon = (newName: string) => {
    saveCustomTranslation('pokemon', pokemon.speciesId, newName);
    setZhName(getPokemonName(pokemon.speciesId)); 
    setIsPokemonModalOpen(false);
  };

  const handleSaveFastMove = (newName: string) => {
    if (pokemon.bestFastMoveId) {
      saveCustomTranslation('move', pokemon.bestFastMoveId, newName);
      setZhFastMove(getMoveName(pokemon.bestFastMoveId)); 
    }
    setIsFastMoveModalOpen(false);
  };

  const handleSaveChargeMove = (newName: string) => {
    if (pokemon.bestAtkMoveId) {
      saveCustomTranslation('move', pokemon.bestAtkMoveId, newName);
      setZhChargeMove(getMoveName(pokemon.bestAtkMoveId)); 
    }
    setIsChargeMoveModalOpen(false);
  };

  // 決定 TTF 的視覺警示 (小於 12 秒標記為玻璃大砲)
  let ttfColorClass = "text-emerald-700 bg-emerald-50 border-emerald-100";
  let ttfLabel = `存活 ${pokemon.ttf.toFixed(1)}s`;
  
  if (pokemon.ttf < 12) {
    ttfColorClass = "text-red-700 bg-red-50 border-red-100";
    ttfLabel = `存活 ${pokemon.ttf.toFixed(1)}s (偏脆)`;
  } else if (pokemon.ttf < 18) {
    ttfColorClass = "text-orange-700 bg-orange-50 border-orange-100";
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group gap-3 relative">
        
        {/* Mega 標示線 (提醒隊伍只能帶一隻) */}
        {pokemon.speciesId.includes('mega') && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 rounded-l-md" title="超級進化 (隊伍限帶一隻)"></div>
        )}

        {/* 左側：寶可夢身分與數據區 */}
        <div className="flex flex-col w-full sm:w-auto pl-2">
          <div className="flex items-start gap-2">
            <span className="text-lg font-bold text-gray-900 break-words leading-tight">{zhName}</span>
            <button 
              onClick={() => setIsPokemonModalOpen(true)}
              className="text-gray-300 hover:text-blue-500 transition-colors mt-0.5 shrink-0"
              title="修改中文名稱"
            >
              ✏️
            </button>
          </div>
          <span className="text-xs font-medium text-gray-500 mt-1 break-words">
            {dexNum} {enName}
          </span>
          {/* 三圍與戰鬥力動態指標 */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 whitespace-nowrap">
              實戰 DPS: {pokemon.realDps.toFixed(1)}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-md border whitespace-nowrap ${ttfColorClass}`}>
              {ttfLabel}
            </span>
          </div>
        </div>

        {/* 右側：大小招與屬性徽章區 */}
        <div className="flex flex-col w-full sm:w-auto sm:items-end border-t border-gray-50 sm:border-0 pt-3 sm:pt-0 gap-2">
          
          {/* 小招區塊 */}
          <div className="flex items-center justify-start sm:justify-end gap-1">
            <span className="text-xs text-gray-400 font-medium">小招：</span>
            <span className="text-sm font-bold text-gray-700 break-words">{zhFastMove}</span>
            <button 
              onClick={() => setIsFastMoveModalOpen(true)}
              disabled={!pokemon.bestFastMoveId}
              className="text-gray-300 hover:text-blue-500 transition-colors shrink-0 disabled:opacity-0"
              title="修改小招名稱"
            >
              ✏️
            </button>
          </div>

          {/* 大招區塊 */}
          <div className="flex items-center justify-start sm:justify-end gap-1">
            <span className="text-xs text-gray-400 font-medium">大招：</span>
            <span className="text-sm font-bold text-gray-800 break-words">{zhChargeMove}</span>
            <button 
              onClick={() => setIsChargeMoveModalOpen(true)}
              disabled={!pokemon.bestAtkMoveId}
              className="text-gray-300 hover:text-blue-500 transition-colors shrink-0 disabled:opacity-0"
              title="修改大招名稱"
            >
              ✏️
            </button>
            {pokemon.bestAtkType && (
              <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded text-white bg-type-${pokemon.bestAtkType.toLowerCase()} shrink-0`}>
                {TYPE_NAMES[pokemon.bestAtkType]}
              </span>
            )}
          </div>
          
        </div>
      </div>

      {/* 獨立彈窗區 */}
      <OverrideModal 
        isOpen={isPokemonModalOpen}
        onClose={() => setIsPokemonModalOpen(false)}
        onSave={handleSavePokemon}
        title="寶可夢"
        originalEnName={enName}
        currentZhName={zhName}
      />

      {pokemon.bestFastMoveId && (
        <OverrideModal 
          isOpen={isFastMoveModalOpen}
          onClose={() => setIsFastMoveModalOpen(false)}
          onSave={handleSaveFastMove}
          title="小招"
          originalEnName={enFastMove}
          currentZhName={zhFastMove}
        />
      )}

      {pokemon.bestAtkMoveId && (
        <OverrideModal 
          isOpen={isChargeMoveModalOpen}
          onClose={() => setIsChargeMoveModalOpen(false)}
          onSave={handleSaveChargeMove}
          title="大招"
          originalEnName={enChargeMove}
          currentZhName={zhChargeMove}
        />
      )}
    </>
  );
};
