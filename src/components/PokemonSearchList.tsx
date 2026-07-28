import React from 'react';
import { TierGroup } from '../utils/searchAlgorithm';
import { PokemonCard } from './PokemonCard';

interface PokemonSearchListProps {
  tierGroups: TierGroup[];
  isLoading: boolean;
}

export const PokemonSearchList: React.FC<PokemonSearchListProps> = ({ tierGroups, isLoading }) => {
  if (isLoading) {
    return <div className="text-center text-gray-500 py-10">資料載入與運算中...</div>;
  }

  if (tierGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-6">
      {tierGroups.map((group) => {
        // 防呆機制：如果該級別陣列為空，則直接不渲染該區塊
        if (group.pokemonList.length === 0) return null;

        return (
          <div key={group.tier} className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-lg font-bold text-gray-800">
                {group.tier} <span className="text-sm font-normal text-gray-500 ml-2">({group.label})</span>
              </h3>
            </div>
            {/* 手機顯示 3 欄，平板以上 4~5 欄 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {group.pokemonList.map((pokemon, index) => (
                <PokemonCard key={`${pokemon.dex}-${index}`} pokemon={pokemon} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
