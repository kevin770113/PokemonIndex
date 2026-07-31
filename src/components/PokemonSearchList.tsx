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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 flex-shrink-0">
          {group.tier} <span className="text-sm font-normal text-gray-500 ml-2 hidden sm:inline">({group.label})</span>
        </h3>
        <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 bg-gray-200/60 px-2 py-1 rounded-md shrink-0">
          依通關時間 (TTW) 排序
        </span>
      </div>
      
      <div className="bg-gray-50 px-4 pb-2 sm:hidden block text-[11px] font-normal text-gray-500">
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
          className="w-full py-3 text-sm font-bold text-blue-600 bg-blue-50/30 hover:bg-blue-50 transition-colors border-t border-gray-100 active:bg-blue-100 outline-none"
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
