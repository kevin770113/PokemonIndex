import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module 環境下的路徑處理
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PVPOKE_URL = 'https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/gamemaster.json';
const OUTPUT_PATH = path.join(__dirname, '../public/pokemon-data.json');

async function fetchAndCleanData() {
  try {
    console.log('⏳ 開始從 PvPoke 獲取最新 gamemaster.json...');
    
    const response = await fetch(PVPOKE_URL);
    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }
    
    const rawData = await response.json();
    console.log('✅ 成功獲取原始資料，開始處理招式屬性映射...');

    // 建立招式對應屬性的字典 (Dictionary)
    const moveTypeMap = new Map();
    if (rawData.moves) {
      rawData.moves.forEach(move => {
        // PvPoke 的 move 物件包含 moveId (如 VINE_WHIP) 與 type (如 grass)
        moveTypeMap.set(move.moveId, move.type);
      });
    }

    // 輔助函式：將招式字串轉換為帶有屬性的物件
    const mapMove = (moveId) => ({
      name: moveId,
      type: moveTypeMap.get(moveId) || 'normal' // 若無對應屬性預設為 normal
    });

    console.log('✅ 開始清洗寶可夢資料並綁定招式屬性...');
    // 精準萃取需要的欄位，並將招式轉換為物件結構
    const cleanedPokemon = rawData.pokemon
      .filter(p => p.dex !== undefined) 
      .map(p => ({
        dex: p.dex,
        speciesId: p.speciesId,
        speciesName: p.speciesName,
        types: p.types || [], 
        fastMoves: (p.fastMoves || []).map(mapMove),
        chargedMoves: (p.chargedMoves || []).map(mapMove)
      }));

    // 確保 public 資料夾存在
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 將瘦身且升級後的結果寫入 public/pokemon-data.json
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cleanedPokemon, null, 2));
    
    console.log(`🎉 清洗完成！共擷取了 ${cleanedPokemon.length} 筆寶可夢形態資料。`);
    console.log(`📂 檔案已成功輸出至: ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('❌ 獲取或清洗資料失敗:', error.message);
    process.exit(1); 
  }
}

fetchAndCleanData();
