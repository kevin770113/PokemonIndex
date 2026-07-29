import React, { useState } from 'react';
import { TierGroup } from '../utils/searchAlgorithm';
import { PokemonListItem } from './PokemonListItem';

interface PokemonSearchListProps {
  tierGroups: TierGroup[];
  isLoading: boolean;
}

// 抽出單一級別區塊的元件，獨立管理「展開/收起」的狀態防呆
const TierSection: React.FC<{ group: TierGroup }> = ({ group }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const PAGING_SIZE = 5;
  const totalCount = group.pokemonList.length;
  const isOverLimit = totalCount > PAGING_SIZE;
  
  // 決定畫面上要顯示哪些名單
  const displayList = isExpanded ? group.pokemonList : group.pokemonList.slice(0, PAGING_SIZE);
  const remainingCount = totalCount - PAGING_SIZE;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      
      {/* 標題列 */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          {group.tier} <span className="text-sm font-normal text-gray-500 ml-2">({group.label})</span>
        </h3>
      </div>
      
      {/* 全寬度雙語列表區塊 */}
      <div className="flex flex-col">
        {displayList.map((pokemon, index) => (
          <PokemonListItem key={`${pokemon.dex}-${index}`} pokemon={pokemon} />
        ))}
      </div>

      {/* 展開看更多按鈕 (若符合數量小於 5 則自動隱藏) */}
      {isOverLimit && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 text-sm font-bold text-blue-600 bg-blue-50/30 hover:bg-blue-50 transition-colors border-t border-gray-100 active:bg-blue-100"
        >
          {isExpanded ? '收起名單 ▲' : `展開看更多符合名單 (還有 ${remainingCount} 隻) ▼`}
        </button>
      )}
    </div>
  );
};

export const PokemonSearchList: React.FC<PokemonSearchListProps> = ({ tierGroups, isLoading }) => {
  if (isLoading) {
    return <div className="text-center text-gray-500 py-10">資料載入與翻譯運算中...</div>;
  }

  if (tierGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-6">
      {tierGroups.map((group) => {
        // 級別陣列為空，直接不渲染該區塊
        if (group.pokemonList.length === 0) return null;
        return <TierSection key={group.tier} group={group} />;
      })}
    </div>
  );
};
