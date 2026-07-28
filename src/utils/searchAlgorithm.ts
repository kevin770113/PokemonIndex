import { PokemonType } from '../types/pokemon';
import { TYPE_CHART } from '../constants/typeChart';
import { PokemonData } from '../types/database';

export interface SearchResult extends PokemonData {
  bestAtkType: PokemonType | null;
  atkMultiplier: number;
  defMultiplier: number;
}

export interface TierGroup {
  tier: string;
  label: string;
  pokemonList: SearchResult[];
}

// 輔助函式：將 PvPoke 的小寫屬性轉換為系統內的大寫開頭格式 (例如 'grass' -> 'Grass')
const formatType = (typeStr: string): PokemonType => {
  if (!typeStr || typeStr === 'none') return 'Normal'; // 預設防呆
  return (typeStr.charAt(0).toUpperCase() + typeStr.slice(1).toLowerCase()) as PokemonType;
};

// 輔助函式：判定是否落在特定倍率區間 (解決浮點數精度問題)
const isCloseTo = (value: number, target: number) => Math.abs(value - target) < 0.1;
const isLessThan025 = (value: number) => value < 0.3;
const is039 = (value: number) => value > 0.3 && value < 0.5;
const is0625 = (value: number) => value > 0.5 && value < 0.8;

/**
 * 嚴格比對 6813.png 的 T0 ~ T10 分級表
 */
const getTier = (atk: number, def: number): { tier: string, label: string } | null => {
  const isAtk256 = atk > 2.5;
  const isAtk16 = atk > 1.5 && atk < 2.5;
  const isAtk1 = isCloseTo(atk, 1.0);

  const defIs025 = isLessThan025(def);
  const defIs039 = is039(def);
  const defIs0625 = is0625(def);
  const defIs1 = isCloseTo(def, 1.0);

  if (isAtk256 && defIs025) return { tier: 'T0', label: '攻擊 2.56x / 抵抗 <0.25x' };
  if (isAtk256 && defIs039) return { tier: 'T1', label: '攻擊 2.56x / 抵抗 0.39x' };
  if (isAtk256 && defIs0625) return { tier: 'T2', label: '攻擊 2.56x / 抵抗 0.625x' };
  
  if (isAtk16 && defIs025) return { tier: 'T3', label: '攻擊 1.6x / 抵抗 <0.25x' };
  if (isAtk16 && defIs039) return { tier: 'T4', label: '攻擊 1.6x / 抵抗 0.39x' };
  if (isAtk16 && defIs0625) return { tier: 'T5', label: '攻擊 1.6x / 抵抗 0.625x' };
  if (isAtk16 && defIs1) return { tier: 'T6', label: '攻擊 1.6x / 抵抗 1x' };
  
  if (isAtk1 && defIs025) return { tier: 'T7', label: '攻擊 1x / 抵抗 <0.25x' };
  if (isAtk1 && defIs039) return { tier: 'T8', label: '攻擊 1x / 抵抗 0.39x' };
  if (isAtk1 && defIs0625) return { tier: 'T9', label: '攻擊 1x / 抵抗 0.625x' };
  if (isAtk1 && defIs1) return { tier: 'T10', label: '攻擊 1x / 抵抗 1x' };

  return null; // 不符合上述嚴格條件則直接剔除
};

/**
 * 核心演算法：搜尋並分級最佳打手
 */
export const searchBestAttackers = (
  allPokemon: PokemonData[], 
  defenderTypes: PokemonType[]
): TierGroup[] => {
  if (defenderTypes.length === 0 || allPokemon.length === 0) return [];

  // 初始化 T0~T10 容器
  const tierMap = new Map<string, TierGroup>();
  const tierOrder = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];
  
  allPokemon.forEach(pokemon => {
    // 1. 攻擊面運算：找出該寶可夢所有招式中，打在防守方身上最痛的那一招
    let bestAtkMultiplier = 0;
    let bestAtkType: PokemonType | null = null;
    const allMoves = [...pokemon.fastMoves, ...pokemon.chargedMoves];

    allMoves.forEach(move => {
      const moveType = formatType(move.type);
      if (!TYPE_CHART[moveType]) return;

      let multiplier = 1.0;
      defenderTypes.forEach(defType => {
        multiplier *= TYPE_CHART[moveType][defType];
      });

      if (multiplier > bestAtkMultiplier) {
        bestAtkMultiplier = multiplier;
        bestAtkType = moveType;
      }
    });

    // 2. 防禦面運算 (最差情境)：防守方用自身屬性打回來，算出最痛的受擊倍率
    let worstDefMultiplier = 0;
    defenderTypes.forEach(enemyAtkType => {
      let multiplier = 1.0;
      pokemon.types.forEach(myTypeRaw => {
        const myType = formatType(myTypeRaw);
        if (TYPE_CHART[enemyAtkType] && TYPE_CHART[enemyAtkType][myType] !== undefined) {
          multiplier *= TYPE_CHART[enemyAtkType][myType];
        }
      });
      if (multiplier > worstDefMultiplier) {
        worstDefMultiplier = multiplier;
      }
    });

    // 3. 判定級別
    const tierInfo = getTier(bestAtkMultiplier, worstDefMultiplier);
    
    // 如果符合 T0~T10 任何一級，就塞進對應的陣列中
    if (tierInfo) {
      if (!tierMap.has(tierInfo.tier)) {
        tierMap.set(tierInfo.tier, {
          tier: tierInfo.tier,
          label: tierInfo.label,
          pokemonList: []
        });
      }
      
      tierMap.get(tierInfo.tier)!.pokemonList.push({
        ...pokemon,
        bestAtkType,
        atkMultiplier: bestAtkMultiplier,
        defMultiplier: worstDefMultiplier
      });
    }
  });

  // 將 Map 轉為陣列，並確保按照 T0 到 T10 的順序排列，剔除空的級別
  const finalResults: TierGroup[] = [];
  tierOrder.forEach(tierKey => {
    if (tierMap.has(tierKey)) {
      // 可選：將同級別內的寶可夢稍微按圖鑑編號或名稱排序，讓畫面更整齊
      const group = tierMap.get(tierKey)!;
      group.pokemonList.sort((a, b) => a.dex - b.dex);
      finalResults.push(group);
    }
  });

  return finalResults;
};
