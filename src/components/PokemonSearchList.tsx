import React, { useState } from 'react';
import { TierGroup } from '../utils/searchAlgorithm';
import { PokemonListItem } from './PokemonListItem';

interface PokemonSearchListProps {
  tierGroups: TierGroup[];
  isLoading: boolean;
}

const TierSection: React.FC<{ group: TierGroup }> = ({ group }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const PAGING_SIZE = 5;
  const totalCount = group.pokemonList.length;
  const isOverLimit = totalCount > PAGING_SIZE;
  
  const displayList = isExpanded ? group.pokemonList : group.pokemonList.slice(0, PAGING_SIZE);
  const remainingCount = totalCount - PAGING_SIZE;

  // 針對 MVP 賦予特別的視覺標頭
  const isMVP = group.tier === 'MVP';
  const headerBgClass = isMVP ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border-yellow-200' : 'bg-gray-50 border-gray-200';
  const titleTextClass = isMVP ? 'text-amber-700' : 'text-gray-800';
  const badgeClass = isMVP ? 'bg-white text-amber-600 shadow-sm border border-yellow-200' : 'bg-gray-200/60 text-gray-500';

  return (
    <div className={`bg-white rounded-2xl border ${isMVP ? 'border-yellow-200 shadow-md' : 'border-gray-200 shadow-sm'} overflow-hidden`}>
      
      <div className={`${headerBgClass} px-4 py-3 border-b flex justify-between items-center`}>
        <h3 className={`text-lg font-bold flex-shrink-0 flex items-center gap-2 ${titleTextClass}`}>
          {isMVP && <span>👑</span>} 
          {group.tier}
          <span className={`text-sm font-normal ml-1 hidden sm:inline ${isMVP ? 'text-amber-600/80' : 'text-gray-500'}`}>
            ({group.label})
          </span>
        </h3>
        <span className={`text-[10px] sm:text-[11px] font-medium px-2 py-1 rounded-md shrink-0 ${badgeClass}`}>
          依通關時間 (TTW) 排序
        </span>
      </div>
      
      <div className={`${headerBgClass} px-4 pb-2 sm:hidden block text-[11px] font-normal border-b-0 ${isMVP ? 'text-amber-600/80' : 'text-gray-500'}`}>
        {group.label}
      </div>
      
      <div className="flex flex-col">
        {displayList.map((pokemon, index) => (
          <PokemonListItem key={`${pokemon.speciesId}-${index}`} pokemon={pokemon} />
        ))}
      </div>

      {isOverLimit && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full py-3 text-sm font-bold transition-colors border-t outline-none ${
            isMVP 
              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-yellow-100' 
              : 'text-blue-600 bg-blue-50/30 hover:bg-blue-50 border-gray-100 active:bg-blue-100'
          }`}
        >
          {isExpanded ? '收起名單 ▲' : `展開看更多符合名單 (還有 ${remainingCount} 隻) ▼`}
        </button>
      )}
    </div>
  );
};

export const PokemonSearchList: React.FC<PokemonSearchListProps> = ({ tierGroups, isLoading }) => {
  if (isLoading) {
    return <div className="text-center text-gray-500 py-10 animate-pulse">實戰時間軸模擬中，請稍候...</div>;
  }

  if (tierGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-6">
      {tierGroups.map((group) => {
        if (group.pokemonList.length === 0) return null;
        return <TierSection key={group.tier} group={group} />;
      })}
    </div>
  );
};
