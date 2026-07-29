import React from 'react';
import { SearchResult } from '../utils/searchAlgorithm';
import { TYPE_NAMES } from '../types/pokemon';
import { getPokemonName, getMoveName } from '../utils/translator';

interface PokemonListItemProps {
  pokemon: SearchResult;
}

export const PokemonListItem: React.FC<PokemonListItemProps> = ({ pokemon }) => {
  // 透過翻譯引擎取得中文，若無則會自動降級為排版整齊的英文
  const zhName = getPokemonName(pokemon.speciesId);
  const enName = pokemon.speciesName; 
  const dexNum = `#${pokemon.dex.toString().padStart(3, '0')}`;
  
  const zhMove = pokemon.bestAtkMoveId ? getMoveName(pokemon.bestAtkMoveId) : '無招式';
  
  // 處理招式英文排版 (例如 BLAST_BURN -> Blast Burn)
  const enMove = pokemon.bestAtkMoveId 
    ? pokemon.bestAtkMoveId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : '';

  return (
    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      
      {/* 左側：寶可夢身分區 (主標題為中文，副標題為編號與英文) */}
      <div className="flex flex-col max-w-[50%]">
        <span className="text-lg font-bold text-gray-900 truncate">{zhName}</span>
        <span className="text-xs font-medium text-gray-500 mt-0.5 truncate">
          {dexNum} {enName}
        </span>
      </div>

      {/* 右側：招式與屬性徽章區 */}
      <div className="flex flex-col items-end max-w-[50%]">
        <span className="text-md font-bold text-gray-800 truncate">{zhMove}</span>
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
  );
};
