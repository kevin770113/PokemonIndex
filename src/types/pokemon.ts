// 18 種屬性的英文列舉 (作為程式內部的 key)
export type PokemonType = 
  | 'Normal' | 'Grass' | 'Fire' | 'Water' | 'Electric' | 'Bug'
  | 'Flying' | 'Rock' | 'Poison' | 'Ground' | 'Ice' | 'Fighting'
  | 'Psychic' | 'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy';

// 屬性多國語系/顯示名稱對應表
export const TYPE_NAMES: Record<PokemonType, string> = {
  Normal: '一般', Grass: '草', Fire: '火', Water: '水',
  Electric: '電', Bug: '蟲', Flying: '飛行', Rock: '岩石',
  Poison: '毒', Ground: '地面', Ice: '冰', Fighting: '格鬥',
  Psychic: '超能力', Ghost: '幽靈', Dragon: '龍', Dark: '惡',
  Steel: '鋼', Fairy: '妖精'
};

// Pokémon GO 屬性相剋倍率常數
export const MULTIPLIERS = {
  SUPER_EFFECTIVE: 1.6,      // 效果絕佳 (紅圈)
  NORMAL: 1.0,               // 一般
  NOT_VERY_EFFECTIVE: 0.625, // 效果不好 (藍三角)
  IMMUNE: 0.390625           // 無效 (灰叉)
} as const;

export type MultiplierValue = typeof MULTIPLIERS[keyof typeof MULTIPLIERS];
