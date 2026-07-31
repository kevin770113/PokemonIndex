export interface BaseStats {
  atk: number;
  def: number;
  hp: number;
}

export interface PokemonData {
  speciesId: string;
  speciesName: string;
  dex: number;
  types: string[];
  baseStats?: BaseStats;
  fastMoves: string[];
  chargedMoves: string[];
}
