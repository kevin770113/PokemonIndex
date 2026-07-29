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
  const [zhMove, setZhMove] = useState(() => pokemon.bestAtkMoveId ? getMoveName(pokemon.bestAtkMoveId) : '無招式');

  const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const enName = pokemon.speciesName; 
  const dexNum = `#${pokemon.dex.toString().padStart(3, '0')}`;
  
  const enMove = pokemon.bestAtkMoveId 
    ? pokemon.bestAtkMoveId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : '';

  const handleSavePokemon = (newName: string) => {
    saveCustomTranslation('pokemon', pokemon.speciesId, newName);
    setZhName(getPokemonName(pokemon.speciesId)); 
    setIsPokemonModalOpen(false);
  };

  const handleSaveMove = (newName: string) => {
    if (pokemon.bestAtkMoveId) {
      saveCustomTranslation('move', pokemon.bestAtkMoveId, newName);
      setZhMove(getMoveName(pokemon.bestAtkMoveId)); 
    }
    setIsMoveModalOpen(false);
  };

  return (
    <>
      {/* 修改點：手機版採 flex-col 上下排列，平板以上採 sm:flex-row 左右排列 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group gap-3">
        
        {/* 上側/左側：寶可夢身分區 */}
        <div className="flex flex-col w-full sm:w-auto">
          <div className="flex items-start gap-2">
            {/* 移除 truncate，改用 break-words 允許長檔名自然換行 */}
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
        </div>

        {/* 下側/右側：招式與屬性徽章區 */}
        {/* 手機版加上一條極淡的頂部格線做區分 */}
        <div className="flex flex-col w-full sm:w-auto sm:items-end border-t border-gray-50 sm:border-0 pt-3 sm:pt-0">
          <div className="flex items-start gap-2 sm:justify-end">
             <button 
                onClick={() => setIsMoveModalOpen(true)}
                disabled={!pokemon.bestAtkMoveId}
                className="text-gray-300 hover:text-blue-500 transition-colors mt-0.5 shrink-0 disabled:opacity-0"
                title="修改招式名稱"
              >
                ✏️
              </button>
            <span className="text-md font-bold text-gray-800 break-words leading-tight text-left sm:text-right">{zhMove}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 sm:justify-end">
            <span className="text-[11px] text-gray-400 font-medium break-words">{enMove}</span>
            {pokemon.bestAtkType && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white bg-type-${pokemon.bestAtkType.toLowerCase()} shrink-0`}>
                {TYPE_NAMES[pokemon.bestAtkType]}
              </span>
            )}
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
