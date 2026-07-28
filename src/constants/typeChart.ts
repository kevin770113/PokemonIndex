import { PokemonType, MULTIPLIERS, MultiplierValue } from '../types/pokemon';

const { SUPER_EFFECTIVE: SE, NOT_VERY_EFFECTIVE: NV, IMMUNE: IM } = MULTIPLIERS;

// 輔助函式：只定義有變化的倍率，其餘預設為 1.0
const createTypeMatchups = (matchups: Partial<Record<PokemonType, MultiplierValue>>): Record<PokemonType, MultiplierValue> => {
  const allTypes: PokemonType[] = [
    'Normal', 'Grass', 'Fire', 'Water', 'Electric', 'Bug', 'Flying', 'Rock', 
    'Poison', 'Ground', 'Ice', 'Fighting', 'Psychic', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
  ];
  const result: any = {};
  allTypes.forEach(type => {
    result[type] = matchups[type] ?? MULTIPLIERS.NORMAL;
  });
  return result;
};

// [攻擊方][防守方] = 傷害倍率
export const TYPE_CHART: Record<PokemonType, Record<PokemonType, MultiplierValue>> = {
  Normal: createTypeMatchups({ Rock: NV, Ghost: IM, Steel: NV }),
  Grass: createTypeMatchups({ Water: SE, Ground: SE, Rock: SE, Grass: NV, Fire: NV, Poison: NV, Flying: NV, Bug: NV, Dragon: NV, Steel: NV }),
  Fire: createTypeMatchups({ Grass: SE, Bug: SE, Ice: SE, Steel: SE, Fire: NV, Water: NV, Rock: NV, Dragon: NV }),
  Water: createTypeMatchups({ Fire: SE, Rock: SE, Ground: SE, Grass: NV, Water: NV, Dragon: NV }),
  Electric: createTypeMatchups({ Water: SE, Flying: SE, Grass: NV, Electric: NV, Dragon: NV, Ground: IM }),
  Bug: createTypeMatchups({ Grass: SE, Psychic: SE, Dark: SE, Fire: NV, Flying: NV, Poison: NV, Fighting: NV, Ghost: NV, Steel: NV, Fairy: NV }),
  Flying: createTypeMatchups({ Grass: SE, Bug: SE, Fighting: SE, Electric: NV, Rock: NV, Steel: NV }),
  Rock: createTypeMatchups({ Fire: SE, Bug: SE, Flying: SE, Ice: SE, Ground: NV, Fighting: NV, Steel: NV }),
  Poison: createTypeMatchups({ Grass: SE, Fairy: SE, Poison: NV, Ground: NV, Rock: NV, Ghost: NV, Steel: IM }),
  Ground: createTypeMatchups({ Fire: SE, Electric: SE, Rock: SE, Poison: SE, Steel: SE, Grass: NV, Bug: NV, Flying: IM }),
  Ice: createTypeMatchups({ Grass: SE, Flying: SE, Ground: SE, Dragon: SE, Fire: NV, Water: NV, Ice: NV, Steel: NV }),
  Fighting: createTypeMatchups({ Normal: SE, Rock: SE, Ice: SE, Dark: SE, Steel: SE, Flying: NV, Bug: NV, Poison: NV, Psychic: NV, Fairy: NV, Ghost: IM }),
  Psychic: createTypeMatchups({ Fighting: SE, Poison: SE, Psychic: NV, Steel: NV, Dark: IM }),
  Ghost: createTypeMatchups({ Psychic: SE, Ghost: SE, Dark: NV, Normal: IM }),
  Dragon: createTypeMatchups({ Dragon: SE, Steel: NV, Fairy: IM }),
  Dark: createTypeMatchups({ Psychic: SE, Ghost: SE, Fighting: NV, Dark: NV, Fairy: NV }),
  Steel: createTypeMatchups({ Rock: SE, Ice: SE, Fairy: SE, Fire: NV, Water: NV, Electric: NV, Steel: NV }),
  Fairy: createTypeMatchups({ Fighting: SE, Dragon: SE, Dark: SE, Fire: NV, Poison: NV, Steel: NV })
};
