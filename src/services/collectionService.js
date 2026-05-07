/**
 * Serviço de gerenciamento da coleção de figurinhas.
 * Toda persistência é feita via localStorage.
 */

const STORAGE_KEY = 'stickerscan_collection';
const META_KEY = 'stickerscan_meta';
const USER_KEY = 'stickerscan_user';
const VIEW_MODE_KEY = 'stickerscan_view_mode';

/**
 * Carrega as quantidades do usuário do localStorage.
 * @returns {Object} { stickerId: quantity }
 */
export function getCollection() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Salva as quantidades no localStorage.
 * @param {Object} data - { stickerId: quantity }
 */
export function saveCollection(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Adiciona uma unidade de uma figurinha.
 */
export function addSticker(id) {
  const collection = getCollection();
  collection[id] = (collection[id] || 0) + 1;
  saveCollection(collection);
  return collection;
}

/**
 * Remove uma unidade de uma figurinha (mínimo 0).
 */
export function removeSticker(id) {
  const collection = getCollection();
  collection[id] = Math.max(0, (collection[id] || 0) - 1);
  saveCollection(collection);
  return collection;
}

/**
 * Exporta a coleção como JSON string.
 */
export function exportCollection() {
  const collection = getCollection();
  const meta = getMeta();
  const user = getUserName();
  return JSON.stringify({ collection, meta, user, exportedAt: new Date().toISOString() }, null, 2);
}

/**
 * Importa uma coleção a partir de JSON string.
 */
export function importCollection(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.collection && typeof data.collection === 'object') {
      saveCollection(data.collection);
      if (data.meta) saveMeta(data.meta);
      if (data.user) saveUserName(data.user);
      return { success: true, message: 'Coleção importada com sucesso!' };
    }
    return { success: false, message: 'Formato inválido. O JSON deve conter um campo "collection".' };
  } catch {
    return { success: false, message: 'Erro ao ler o arquivo JSON. Verifique o formato.' };
  }
}

/**
 * Reseta toda a coleção.
 */
export function resetCollection() {
  saveCollection({});
  saveMeta({});
}

// --- Metadados ---

export function getMeta() {
  try {
    const data = localStorage.getItem(META_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function markScannerUsed() {
  const meta = getMeta();
  meta.scannerUsed = true;
  saveMeta(meta);
}

// --- Usuário ---

export function getUserName() {
  return localStorage.getItem(USER_KEY) || '';
}

export function saveUserName(name) {
  localStorage.setItem(USER_KEY, name);
}

// --- Configurações Visuais ---

export function getViewMode() {
  return localStorage.getItem(VIEW_MODE_KEY) || 'simplified'; // 'simplified' ou 'complete'
}

export function setViewMode(mode) {
  localStorage.setItem(VIEW_MODE_KEY, mode);
}
