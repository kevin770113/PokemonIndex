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
  bestAtkMoveId: string | null;
  bestFastMoveId: string | null;
  atkMultiplier: number;
  defMultiplier: number;
  realDps: number; 
  ttf: number;     
  tdo: number;     
  ttw: number;
  deaths: number;
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
    return Math.floor(0.5 * move.power * ((pokemon.baseStats?.atk || 100) / 160) * stabMult * effectMult) + 1;
  };

  const fDmg = getDamage(fastMove);
  const cDmg = getDamage(chargeMove);

  const fEne = Math.abs(fastMove.energy || 5);
  const cEne = Math.abs(chargeMove.energy || 50);

  const fTime = fastMove.cooldown || 500;
  const cTime = chargeMove.cooldown || 2000;

  const incomingDps = 15 * (100 / (pokemon.baseStats?.def || 100)) * worstDefMultiplier;

  let hp = pokemon.baseStats?.hp || 100;
  let energy = 0;
  let time = 0;
  let totalDamage = 0;
  let currentCooldown = 0;

  const TICK = 500; 

  while (hp > 0 && time < 300000) {
    const dmgTaken = incomingDps * (TICK / 1000);
    hp -= dmgTaken;
    if (hp <= 0) break; 

    energy += dmgTaken * 0.5;
    if (energy > 100) energy = 100;

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

  const ttf = Math.min(time, 300000) / 1000;
  const realDps = totalDamage === 0 ? 0.1 : (totalDamage / ttf);
  
  const BOSS_HP = 15000;
  const deaths = Math.max(0, Math.ceil(BOSS_HP / (totalDamage || 1)) - 1);
  const relobbies = Math.floor(deaths / 6);
  const ttw = (BOSS_HP / realDps) + (deaths * 2) + (relobbies * 15);

  return { 
    realDps: Number(realDps.toFixed(1)), 
    tdo: totalDamage, 
    ttf: Number(ttf.toFixed(1)),
    ttw: Number(ttw.toFixed(1)),
    deaths
  };
};

export const searchBestAttackers = (
  allPokemon: PokemonData[], 
  movesDict: Record<string, MoveData>,
  defenderTypes: PokemonType[],
  options: { includeShadow: boolean; includeMega: boolean }
): TierGroup[] => {
  if (defenderTypes.length === 0 || allPokemon.length === 0 || Object.keys(movesDict).length === 0) return [];

  const validPokemonList: SearchResult[] = [];
  
  allPokemon.forEach(pokemon => {
    // 靜態門檻保持不變，保留奇兵
    if ((pokemon.baseStats?.atk || 0) < 180) return;

    if (!options.includeShadow && pokemon.speciesId.includes('shadow')) return;
    if (!options.includeMega && pokemon.speciesId.includes('mega')) return;

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
        if (cMult < 1.5) return;

        const simResult = simulateCombat(pokemon, fMove, cMove, defenderTypes, worstDefMultiplier);
        
        if (!bestCombo || simResult.ttw < bestCombo.ttw) {
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

    if (bestCombo && bestAtkMultForTier >= 1.5) {
      validPokemonList.push({
        ...pokemon,
        ...bestCombo,
        defMultiplier: worstDefMultiplier
      });
    }
  });

  if (validPokemonList.length === 0) return [];

  // 全體統一依照 TTW 由快到慢排序
  validPokemonList.sort((a, b) => a.ttw - b.ttw);

  // 取得全場第一名 (絕對 MVP)
  const absoluteBestTTW = validPokemonList[0].ttw;
  
  // 方案一：尋找非暗影、非 Mega 的「平民第一名」作為基準線。如果找不到，才退回用絕對第一名當基準。
  const regularBest = validPokemonList.find(p => !p.speciesId.includes('shadow') && !p.speciesId.includes('mega'));
  const benchmarkTTW = regularBest ? regularBest.ttw : absoluteBestTTW;

  const groups: TierGroup[] = [
    { tier: 'MVP', label: '極限通關首選', pokemonList: [] },
    { tier: 'S', label: '平民基準 10% 內 (頂級神手)', pokemonList: [] },
    { tier: 'A', label: '平民基準 10%~20% (卓越戰力)', pokemonList: [] },
    { tier: 'B', label: '平民基準 20%~50% (優質備用)', pokemonList: [] }
  ];

  validPokemonList.forEach(poke => {
    // 只要是跟全場第一名一樣快，無條件進入 MVP 寶座
    if (poke.ttw === absoluteBestTTW) {
      groups[0].pokemonList.push(poke);
    } 
    // 後續依照「平民基準」進行相對落後幅度過濾
    else if (poke.ttw <= benchmarkTTW * 1.1) {
      groups[1].pokemonList.push(poke);
    } else if (poke.ttw <= benchmarkTTW * 1.2) {
      groups[2].pokemonList.push(poke);
    } else if (poke.ttw <= benchmarkTTW * 1.5) {
      groups[3].pokemonList.push(poke);
    }
  });

  return groups.filter(g => g.pokemonList.length > 0);
};
