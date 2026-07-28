import React from 'react';
import { SearchResult } from '../utils/searchAlgorithm';
import { TYPE_NAMES } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: SearchResult;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
      <span className="text-sm font-bold text-gray-800 text-center line-clamp-1 mb-2">
        {pokemon.speciesName}
      </span>
      {pokemon.bestAtkType && (
        <span className={`text-xs font-medium px-2 py-1 rounded-md text-white bg-type-${pokemon.bestAtkType.toLowerCase()}`}>
          {TYPE_NAMES[pokemon.bestAtkType]}
        </span>
      )}
    </div>
  );
};
