
import React from 'react';
import { PokemonType, TYPE_NAMES } from '../types/pokemon';

interface TypeSelectorProps {
  selectedTypes: PokemonType[];
  onToggleType: (type: PokemonType) => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({ 
  selectedTypes, 
  onToggleType 
}) => {
  const allTypes = Object.keys(TYPE_NAMES) as PokemonType[];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {allTypes.map((type) => {
        const isSelected = selectedTypes.includes(type);
        const isMaxSelected = selectedTypes.length >= 2;
        // 如果還沒被選到，且已經選滿 2 個了，就禁用該按鈕
        const isDisabled = !isSelected && isMaxSelected;

        return (
          <button
            key={type}
            onClick={() => onToggleType(type)}
            disabled={isDisabled}
            className={`
              relative py-2 px-1 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out
              ${isSelected 
                ? `bg-type-${type.toLowerCase()} text-white shadow-md ring-2 ring-offset-2 ring-type-${type.toLowerCase()} scale-105 z-10` 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
              }
              ${isDisabled ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer'}
            `}
          >
            {TYPE_NAMES[type]}
          </button>
        );
      })}
    </div>
  );
};
