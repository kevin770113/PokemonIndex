// 定義儲存在 LocalStorage 的 Key 前綴
const LOCAL_STORAGE_PREFIX = {
  POKEMON: 'custom_pokemon_name_',
  MOVE: 'custom_move_name_'
};

// 記憶體中的翻譯字典快取
let translationCache: { pokemon: Record<string, string>, moves: Record<string, string> } = {
  pokemon: {},
  moves: {}
};

/**
 * 初始化翻譯字典：由外部非同步呼叫載入 public/translations.json
 */
export const initTranslator = async () => {
  // 如果已經載入過，就不重複載入，節省網路資源
  if (Object.keys(translationCache.pokemon).length > 0) return;

  try {
    const response = await fetch('/translations.json');
    if (response.ok) {
      translationCache = await response.json();
    }
  } catch (error) {
    console.error("無法載入翻譯檔案 translations.json:", error);
  }
};

/**
 * 防呆備用機制：將底線轉換為空格，並將每個單字首字母大寫
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
  const customName = localStorage.getItem(`${LOCAL_STORAGE_PREFIX.POKEMON}${id}`);
  if (customName) return customName;

  // 從快取中的 JSON 找翻譯
  if (translationCache.pokemon[id]) return translationCache.pokemon[id];

  return formatFallbackName(id);
};

/**
 * 取得招式中文名稱
 */
export const getMoveName = (id: string): string => {
  const customName = localStorage.getItem(`${LOCAL_STORAGE_PREFIX.MOVE}${id}`);
  if (customName) return customName;

  // 從快取中的 JSON 找翻譯
  if (translationCache.moves[id]) return translationCache.moves[id];

  return formatFallbackName(id);
};

/**
 * 儲存手動校正名稱至 LocalStorage
 */
export const saveCustomTranslation = (type: 'pokemon' | 'move', id: string, newName: string) => {
  const prefix = type === 'pokemon' ? LOCAL_STORAGE_PREFIX.POKEMON : LOCAL_STORAGE_PREFIX.MOVE;
  
  if (!newName.trim()) {
    localStorage.removeItem(`${prefix}${id}`);
  } else {
    localStorage.setItem(`${prefix}${id}`, newName.trim());
  }
};
