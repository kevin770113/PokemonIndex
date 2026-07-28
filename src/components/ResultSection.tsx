import React from 'react';
import { TypeEffectiveness } from '../utils/typeCalculator';
import { ResultBadge } from './ResultBadge';

interface ResultSectionProps {
  results: TypeEffectiveness[];
}

export const ResultSection: React.FC<ResultSectionProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-200 rounded-xl">
        請在上方選擇 1 到 2 個防守方屬性，以查看相剋結果。
      </div>
    );
  }

  // 將倍率轉換為易讀的標題與顏色
  const getMultiplierLabel = (multiplier: number) => {
    if (multiplier > 2.5) return { text: '雙重弱點 (2.56x)', color: 'text-red-600', bg: 'bg-red-50' };
    if (multiplier > 1.5) return { text: '弱點 (1.6x)', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (multiplier > 0.6) return { text: '抵抗 (0.625x)', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (multiplier > 0.3) return { text: '雙重抵抗 / 免疫 (0.39x)', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    return { text: '極度抵抗 (< 0.25x)', color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  return (
    <div className="space-y-6">
      {results.map(({ multiplier, types }) => {
        const { text, color, bg } = getMultiplierLabel(multiplier);
        
        return (
          <div key={multiplier} className={`p-4 rounded-xl shadow-sm ${bg}`}>
            <h3 className={`text-lg font-bold mb-3 border-b pb-2 border-black/10 ${color}`}>
              {text}
            </h3>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <ResultBadge key={type} type={type} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
