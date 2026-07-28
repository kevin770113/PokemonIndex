import { PokemonType } from '../types/pokemon';
import { TYPE_CHART } from '../constants/typeChart';

export interface TypeEffectiveness {
  multiplier: number;
  types: PokemonType[];
}

/**
 * 計算防守方（單屬性或雙屬性）受到各屬性攻擊的綜合傷害倍率
 * @param defenderTypes 防守方屬性陣列 (長度 1 或 2)
 * @returns 依照倍率由大到小分類排序的陣列 (例如：2.56, 1.6, 1.0, 0.625...)
 */
export const calculateEffectiveness = (defenderTypes: PokemonType[]): TypeEffectiveness[] => {
  if (defenderTypes.length === 0 || defenderTypes.length > 2) {
    return [];
  }

  const allAttackingTypes = Object.keys(TYPE_CHART) as PokemonType[];
  const resultsMap = new Map<number, PokemonType[]>();

  allAttackingTypes.forEach((attacker) => {
    let finalMultiplier = 1.0;

    // 將單屬性或雙屬性的倍率相乘
    defenderTypes.forEach((defender) => {
      // 陣列結構為 TYPE_CHART[攻擊方][防守方]
      const multiplier = TYPE_CHART[attacker][defender];
      finalMultiplier *= multiplier;
    });

    // 處理 JavaScript 浮點數精度問題，保留至小數第 6 位確保分組精確
    const safeMultiplier = Number(finalMultiplier.toFixed(6));

    if (!resultsMap.has(safeMultiplier)) {
      resultsMap.set(safeMultiplier, []);
    }
    resultsMap.get(safeMultiplier)!.push(attacker);
  });

  // 將 Map 轉換為陣列，過濾掉 1.0 (一般效果，通常畫面上不需要特別顯示)，並由大至小排序
  const sortedResults = Array.from(resultsMap.entries())
    .filter(([multiplier]) => multiplier !== 1.0)
    .map(([multiplier, types]) => ({ multiplier, types }))
    .sort((a, b) => b.multiplier - a.multiplier);

  return sortedResults;
};
