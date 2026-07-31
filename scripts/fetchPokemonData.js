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
      // 補上基礎三圍，供後續實戰模擬與斬殺線過濾使用
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
        // 補上戰鬥計算所需數值
        power: m.power || 0,
        energy: m.energy || 0, 
        cooldown: m.cooldown || 500
      };
    });

    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    // 寫入兩個全新的 JSON 檔案
    fs.writeFileSync(
      path.join(PUBLIC_DIR, 'pokemon-data.json'), 
      JSON.stringify(pokemonList, null, 2)
    );
    console.log(`📝 成功更新 pokemon-data.json (共 ${pokemonList.length} 筆)`);

    fs.writeFileSync(
      path.join(PUBLIC_DIR, 'moves-data.json'), 
      JSON.stringify(movesData, null, 2)
    );
    console.log(`📝 成功新增 moves-data.json (共 ${Object.keys(movesData).length} 筆)`);

    console.log('🎉 階段一：爬蟲升級與資料庫建置完成！');

  } catch (error) {
    console.error('❌ 爬蟲執行失敗:', error);
    // 強制設定 exit code 1，讓 GitHub Actions 能精準捕捉到錯誤日誌
    process.exit(1); 
  }
}

fetchAndProcessData();
