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

  const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);

  const enName = pokemon.speciesName; 
  const dexNum = `#${pokemon.dex.toString().padStart(3, '0')}`;
  
  const handleSavePokemon = (newName: string) => {
    saveCustomTranslation('pokemon', pokemon.speciesId, newName);
    setZhName(getPokemonName(pokemon.speciesId)); 
    setIsPokemonModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group gap-3 relative">
        
        {/* 若為 Mega 進化，在左側加上特殊邊識線 */}
        {pokemon.speciesId.includes('mega') && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 rounded-l-md" title="超級進化 (隊伍限帶一隻)"></div>
        )}

        {/* 左側：寶可夢身分區 */}
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
          {/* 新增：三圍與戰鬥力指標 */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              實戰 DPS: {pokemon.realDps.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
              存活 {pokemon.ttf.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* 右側：招式與屬性徽章區 */}
        <div className="flex flex-col w-full sm:w-auto sm:items-end border-t border-gray-50 sm:border-0 pt-3 sm:pt-0">
          <div className="flex flex-col sm:items-end gap-1">
            <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
              小招：<span className="text-gray-800 font-bold">{zhFastMove}</span>
            </div>
            <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
              大招：<span className="text-gray-800 font-bold">{zhChargeMove}</span>
              {pokemon.bestAtkType && (
                <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded text-white bg-type-${pokemon.bestAtkType.toLowerCase()} shrink-0`}>
                  {TYPE_NAMES[pokemon.bestAtkType]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <OverrideModal 
        isOpen={isPokemonModalOpen}
        onClose={() => setIsPokemonModalOpen(false)}
        onSave={handleSavePokemon}
        title="寶可夢"
        originalEnName={enName}
        currentZhName={zhName}
      />
    </>
  );
};
