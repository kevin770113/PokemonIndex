import { PokemonType } from '../types/pokemon';
import { TYPE_CHART } from '../constants/typeChart';
import { PokemonData } from '../types/database';

export interface MoveData {
  moveId: string;
  name: string;
  type: string;
  power: number;
  energy: number;
  cooldown: number;
}

export interface SearchResult extends PokemonData {
  bestAtkType: PokemonType | null;
  bestAtkMoveId: string | null;   // 大招 ID
  bestFastMoveId: string | null;  // 小招 ID
  atkMultiplier: number;
  defMultiplier: number;
  realDps: number; // 實戰模擬等效 DPS
  ttf: number;     // 存活時間 (Time to Faint)
  tdo: number;     // 總輸出傷害 (Total Damage Output)
}

export interface TierGroup {
  tier: string;
  label: string;
  pokemonList: SearchResult[];
}

const formatType = (typeStr: string): PokemonType => {
  if (!typeStr || typeStr === 'none') return 'Normal';
  return (typeStr.charAt(0).toUpperCase() + typeStr.slice(1).toLowerCase()) as PokemonType;
};

const isCloseTo = (value: number, target: number) => Math.abs(value - target) < 0.1;
const isLessThan025 = (value: number) => value < 0.3;
const is039 = (value: number) => value > 0.3 && value < 0.5;
const is0625 = (value: number) => value > 0.5 && value < 0.8;

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

  // 經過實戰模擬後，我們不再收錄 T7 以下（沒有攻擊加成）的平庸打手
  return null; 
};

/**
 * 核心：60 秒確定性時間軸模擬器
 */
const simulateCombat = (
  pokemon: PokemonData,
  fastMove: MoveData,
  chargeMove: MoveData,
  defenderTypes: PokemonType[],
  worstDefMultiplier: number
) => {
  const getDamage = (move: MoveData) => {
    const moveType = formatType(move.type);
    const isStab = pokemon.types.map(t => formatType(t)).includes(moveType);
    const stabMult = isStab ? 1.2 : 1.0;
    let effectMult = 1.0;
    defenderTypes.forEach(defType => {
      effectMult *= (TYPE_CHART[moveType]?.[defType] ?? 1.0);
    });
    // 傷害公式：Floor(0.5 * 威力 * (攻擊力/頭目防禦) * STAB * 屬性相剋) + 1。假設五星頭目防禦基準為 160。
    return Math.floor(0.5 * move.power * ((pokemon.baseStats?.atk || 100) / 160) * stabMult * effectMult) + 1;
  };

  const fDmg = getDamage(fastMove);
  const cDmg = getDamage(chargeMove);

  const fEne = Math.abs(fastMove.energy || 5);
  const cEne = Math.abs(chargeMove.energy || 50);

  const fTime = fastMove.cooldown || 500;
  const cTime = chargeMove.cooldown || 2000;

  // 模擬頭目傷害：假設頭目基礎 DPS 為 15，並考量我方防禦力與抗性
  const incomingDps = 15 * (100 / (pokemon.baseStats?.def || 100)) * worstDefMultiplier;

  let hp = pokemon.baseStats?.hp || 100;
  let energy = 0;
  let time = 0;
  let totalDamage = 0;
  let currentCooldown = 0;

  const TICK = 500; // 每 0.5 秒跳動一次時間軸

  while (hp > 0 && time < 60000) {
    // 1. 承受頭目攻擊
    const dmgTaken = incomingDps * (TICK / 1000);
    hp -= dmgTaken;
    if (hp <= 0) break; // 若在半空中死亡，後續大招傷害不予計算 (嚴懲玻璃大砲)

    // 2. 受傷集氣機制 (1 HP = 0.5 Energy)
    energy += dmgTaken * 0.5;
    if (energy > 100) energy = 100;

    // 3. 發動攻擊判定
    if (currentCooldown <= 0) {
      if (energy >= cEne) {
        energy -= cEne;
        totalDamage += cDmg;
        currentCooldown = cTime;
      } else {
        energy += fEne;
        if (energy > 100) energy = 100;
        totalDamage += fDmg;
        currentCooldown = fTime;
      }
    }
    currentCooldown -= TICK;
    time += TICK;
  }

  const ttf = Math.min(time, 60000) / 1000;
  const realDps = Number((totalDamage / ttf).toFixed(1));
  
  return { realDps, tdo: totalDamage, ttf: Number(ttf.toFixed(1)) };
};

export const searchBestAttackers = (
  allPokemon: PokemonData[], 
  movesDict: Record<string, MoveData>,
  defenderTypes: PokemonType[],
  options: { includeShadow: boolean; includeMega: boolean }
): TierGroup[] => {
  if (defenderTypes.length === 0 || allPokemon.length === 0 || Object.keys(movesDict).length === 0) return [];

  const tierMap = new Map<string, TierGroup>();
  const tierOrder = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
  
  allPokemon.forEach(pokemon => {
    // 【門檻一】：基礎攻擊力斬殺線寫死 180
    if ((pokemon.baseStats?.atk || 0) < 180) return;

    // 處理使用者開關
    if (!options.includeShadow && pokemon.speciesId.includes('shadow')) return;
    if (!options.includeMega && pokemon.speciesId.includes('mega')) return;

    // 計算最差的防禦抗性 (被頭目打有多痛)
    let worstDefMultiplier = 0;
    defenderTypes.forEach(enemyAtkType => {
      let multiplier = 1.0;
      pokemon.types.forEach(myTypeRaw => {
        const myType = formatType(myTypeRaw);
        if (TYPE_CHART[enemyAtkType]?.[myType] !== undefined) {
          multiplier *= TYPE_CHART[enemyAtkType][myType];
        }
      });
      if (multiplier > worstDefMultiplier) worstDefMultiplier = multiplier;
    });

    let bestCombo: any = null;
    let bestAtkMultForTier = 0;

    // 【門檻二與三】：招式組合與相剋倍率篩選
    pokemon.fastMoves.forEach(fId => {
      const fMove = movesDict[fId];
      if (!fMove) return;
      
      pokemon.chargedMoves.forEach(cId => {
        const cMove = movesDict[cId];
        if (!cMove) return;

        const cMoveType = formatType(cMove.type);
        let cMult = 1.0;
        defenderTypes.forEach(defType => {
          cMult *= (TYPE_CHART[cMoveType]?.[defType] ?? 1.0);
        });
        
        if (cMult > bestAtkMultForTier) bestAtkMultForTier = cMult;

        // 如果大招連基本的 1.6 倍克制都沒有，跳過模擬以節省算力
        if (cMult < 1.5) return;

        // 進入 60 秒實戰模擬
        const simResult = simulateCombat(pokemon, fMove, cMove, defenderTypes, worstDefMultiplier);
        
        if (!bestCombo || simResult.realDps > bestCombo.realDps) {
           bestCombo = {
              bestFastMoveId: fMove.moveId,
              bestAtkMoveId: cMove.moveId,
              bestAtkType: cMoveType,
              atkMultiplier: cMult,
              ...simResult
           };
        }
      });
    });

    // 若無有效招式或無法構成 T6 以上的威脅，則淘汰
    if (!bestCombo || bestAtkMultForTier < 1.5) return;

    const tierInfo = getTier(bestAtkMultForTier, worstDefMultiplier);
    if (tierInfo) {
      if (!tierMap.has(tierInfo.tier)) {
        tierMap.set(tierInfo.tier, { tier: tierInfo.tier, label: tierInfo.label, pokemonList: [] });
      }
      
      tierMap.get(tierInfo.tier)!.pokemonList.push({
        ...pokemon,
        ...bestCombo,
        defMultiplier: worstDefMultiplier
      });
    }
  });

  const finalResults: TierGroup[] = [];
  tierOrder.forEach(tierKey => {
    if (tierMap.has(tierKey)) {
      const group = tierMap.get(tierKey)!;
      // 【關鍵改動】：同級別內，嚴格按照實戰 DPS 由高到低排序！
      group.pokemonList.sort((a, b) => b.realDps - a.realDps);
      finalResults.push(group);
    }
  });

  return finalResults;
};
