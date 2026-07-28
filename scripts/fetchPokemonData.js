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
    
    // 透過原生 fetch 下載 JSON
    const response = await fetch(PVPOKE_URL);
    if (!response.ok) {
      throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
    }
    
    const rawData = await response.json();
    console.log('✅ 成功獲取原始資料，開始清洗...');

    // 精準萃取需要的欄位，剔除對戰數值以減輕前端負擔
    const cleanedPokemon = rawData.pokemon
      .filter(p => p.dex !== undefined) // 過濾掉沒有圖鑑編號的無效資料
      .map(p => ({
        dex: p.dex,
        speciesId: p.speciesId,
        speciesName: p.speciesName,
        types: p.types || [], // API 回傳的屬性皆為小寫英文，例如 ["grass", "poison"]
        fastMoves: p.fastMoves || [],
        chargedMoves: p.chargedMoves || []
      }));

    // 確保 public 資料夾存在
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 將瘦身後的結果寫入 public/pokemon-data.json
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cleanedPokemon, null, 2));
    
    console.log(`🎉 清洗完成！共擷取了 ${cleanedPokemon.length} 筆寶可夢形態資料。`);
    console.log(`📂 檔案已成功輸出至: ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('❌ 獲取或清洗資料失敗:', error.message);
    process.exit(1); // 讓 CI/CD 知道執行失敗
  }
}

fetchAndCleanData();
