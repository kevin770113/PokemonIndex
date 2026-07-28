import React from 'react';
import { PokemonType, TYPE_NAMES } from '../types/pokemon';

interface ResultBadgeProps {
  type: PokemonType;
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({ type }) => {
  return (
    <span 
      className={`
        inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold tracking-wider shadow-sm
        transition-transform hover:scale-105 cursor-default
        bg-type-${type.toLowerCase()}
      `}
    >
      {TYPE_NAMES[type]}
    </span>
  );
};
