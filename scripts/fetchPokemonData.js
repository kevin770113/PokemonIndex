import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 解決 Vite (ES Module) 環境下找不到 __dirname 的問題
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定位 public 資料夾
const PUBLIC_DIR = path.join(__dirname, '../public');
const GAMEMASTER_URL = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster.json';

async function fetchAndProcessData() {
  console.log('🔄 開始從 PvPoke 獲取最新 gamemaster.json 資料...');
  
  try {
    const response = await fetch(GAMEMASTER_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ 成功獲取原始資料，開始進行萃取與轉化...');

    // ==========================================
    // 1. 萃取寶可夢清單與基礎三圍 (Base Stats)
    // ==========================================
    const pokemonList = data.pokemon.map(p => ({
      speciesId: p.speciesId,
      speciesName: p.speciesName,
      dex: p.dex,
      types: p.types,
      baseStats: {
        atk: p.baseStats.atk,
        def: p.baseStats.def,
        hp: p.baseStats.hp
      },
      fastMoves: p.fastMoves || [],
      chargedMoves: p.chargedMoves || []
    }));

    // ==========================================
    // 2. 萃取招式數據 (Moves Data)
    // ==========================================
    const movesData = {};
    data.moves.forEach(m => {
      movesData[m.moveId] = {
        moveId: m.moveId,
        name: m.name,
        type: m.type,
        power: m.power || 0,
        energy: m.energy || 0, 
        cooldown: m.cooldown || 500
      };
    });

    // ==========================================
    // 3. 方案 C 核心：將兩者打包為單一物件
    // ==========================================
    const combinedData = {
      pokemon: pokemonList,
      moves: movesData
    };

    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    // 只寫入唯一的 pokemon-data.json 檔案
    fs.writeFileSync(
      path.join(PUBLIC_DIR, 'pokemon-data.json'), 
      JSON.stringify(combinedData, null, 2)
    );
    
    console.log(`📝 成功更新 pokemon-data.json (包含 ${pokemonList.length} 隻寶可夢與 ${Object.keys(movesData).length} 個招式)`);
    console.log('🎉 階段一 (方案C)：爬蟲升級與單一資料庫建置完成！');

  } catch (error) {
    console.error('❌ 爬蟲執行失敗:', error);
    process.exit(1); 
  }
}

fetchAndProcessData();
