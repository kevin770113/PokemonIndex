// 定義帶有屬性的招式結構
export interface PokemonMove {
  name: string;
  type: string;
}

// 更新寶可夢資料庫介面
export interface PokemonData {
  dex: number;
  speciesId: string;
  speciesName: string;
  types: string[]; 
  fastMoves: PokemonMove[];
  chargedMoves: PokemonMove[];
}
