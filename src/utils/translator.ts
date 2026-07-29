import { POKEMON_NAMES } from '../constants/pokemonNames';
import { MOVE_NAMES } from '../constants/moveNames';

// 定義儲存在 LocalStorage 的 Key 前綴
const LOCAL_STORAGE_PREFIX = {
  POKEMON: 'custom_pokemon_name_',
  MOVE: 'custom_move_name_'
};

/**
 * 防呆備用機制：將底線轉換為空格，並將每個單字首字母大寫
 * 例如：'charizard_mega_x' -> 'Charizard Mega X'
 * 例如：'VINE_WHIP' -> 'Vine Whip'
 */
const formatFallbackName = (id: string): string => {
  if (!id) return '';
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * 取得寶可夢中文名稱
 */
export const getPokemonName = (id: string): string => {
  // 1. 檢查 LocalStorage 是否有手動校正紀錄
  const customName = localStorage.getItem(`${LOCAL_STORAGE_PREFIX.POKEMON}${id}`);
  if (customName) return customName;

  // 2. 檢查靜態字典
  if (POKEMON_NAMES[id]) return POKEMON_NAMES[id];

  // 3. 防呆降級回傳格式化英文
  return formatFallbackName(id);
};

/**
 * 取得招式中文名稱
 */
export const getMoveName = (id: string): string => {
  // 1. 檢查 LocalStorage 是否有手動校正紀錄
  const customName = localStorage.getItem(`${LOCAL_STORAGE_PREFIX.MOVE}${id}`);
  if (customName) return customName;

  // 2. 檢查靜態字典
  if (MOVE_NAMES[id]) return MOVE_NAMES[id];

  // 3. 防呆降級回傳格式化英文
  return formatFallbackName(id);
};

/**
 * 儲存手動校正名稱至 LocalStorage
 */
export const saveCustomTranslation = (type: 'pokemon' | 'move', id: string, newName: string) => {
  const prefix = type === 'pokemon' ? LOCAL_STORAGE_PREFIX.POKEMON : LOCAL_STORAGE_PREFIX.MOVE;
  
  if (!newName.trim()) {
    // 如果輸入空白，代表清除自訂翻譯，恢復預設
    localStorage.removeItem(`${prefix}${id}`);
  } else {
    // 儲存新的自訂翻譯
    localStorage.setItem(`${prefix}${id}`, newName.trim());
  }
};
