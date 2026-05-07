/**
 * Utilitários de status e progresso para a coleção de figurinhas.
 */

// Bandeiras emoji por seleção
export const TEAM_FLAGS = {
  'Brasil': '🇧🇷',
  'Argentina': '🇦🇷',
  'França': '🇫🇷',
  'Alemanha': '🇩🇪',
  'Espanha': '🇪🇸',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Portugal': '🇵🇹',
  'Japão': '🇯🇵',
  'México': '🇲🇽',
  'Estados Unidos': '🇺🇸',
  'África do Sul': '🇿🇦',
  'Coreia do Sul': '🇰🇷',
  'República Tcheca': '🇨🇿',
  'Canadá': '🇨🇦',
  'Bósnia e Herzegovina': '🇧🇦',
  'Catar': '🇶🇦',
  'Suíça': '🇨🇭',
  'Marrocos': '🇲🇦',
  'Haiti': '🇭🇹',
  'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Paraguai': '🇵🇾',
  'Austrália': '🇦🇺',
  'Turquia': '🇹🇷',
  'Curaçao': '🇨🇼',
  'Costa do Marfim': '🇨🇮',
  'Equador': '🇪🇨',
  'Holanda': '🇳🇱',
  'Suécia': '🇸🇪',
  'Tunísia': '🇹🇳',
  'Bélgica': '🇧🇪',
  'Egito': '🇪🇬',
  'Irã': '🇮🇷',
  'Nova Zelândia': '🇳🇿',
  'Cabo Verde': '🇨🇻',
  'Arábia Saudita': '🇸🇦',
  'Uruguai': '🇺🇾',
  'Senegal': '🇸🇳',
  'Iraque': '🇮🇶',
  'Noruega': '🇳🇴',
  'Argélia': '🇩🇿',
  'Áustria': '🇦🇹',
  'Jordânia': '🇯🇴',
  'RD Congo': '🇨🇩',
  'Uzbequistão': '🇺🇿',
  'Venezuela': '🇻🇪',
  'Nigéria': '🇳🇬',
  'Chile': '🇨🇱',
  'Colômbia': '🇨🇴',
  'Croácia': '🇭🇷',
  'Gana': '🇬🇭',
  'Panamá': '🇵🇦',
  '—': '✨'
};

// Cores por raridade
export const RARITY_COLORS = {
  'Base': { bg: '#374151', text: '#9CA3AF', border: '#4B5563' },
  'Prata': { bg: '#1e293b', text: '#cbd5e1', border: '#64748b' },
  'Ouro': { bg: '#451a03', text: '#fbbf24', border: '#d97706' },
  'Lendária': { bg: '#3b0764', text: '#c084fc', border: '#9333ea' },
  'Especial': { bg: '#3b0764', text: '#c084fc', border: '#9333ea' },
};

/**
 * Retorna o status de uma figurinha baseado na quantidade do usuário.
 * @param {number} quantity 
 * @returns {'faltando' | 'tenho' | 'repetida'}
 */
export function getStickerStatus(quantity) {
  if (quantity === 0) return 'faltando';
  if (quantity === 1) return 'tenho';
  return 'repetida';
}

/**
 * Cor de fundo por status
 */
export function getStatusColor(status) {
  switch (status) {
    case 'faltando': return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: '#dc2626' };
    case 'tenho': return { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: '#16a34a' };
    case 'repetida': return { bg: 'rgba(234,179,8,0.15)', text: '#facc15', border: '#ca8a04' };
    default: return { bg: 'transparent', text: '#9CA3AF', border: '#4B5563' };
  }
}

/**
 * Label em português para o status
 */
export function getStatusLabel(status) {
  switch (status) {
    case 'faltando': return 'Faltando';
    case 'tenho': return 'Tenho';
    case 'repetida': return 'Repetida';
    default: return '';
  }
}

/**
 * Calcula o progresso geral da coleção.
 * @param {Object} userQuantities - { stickerId: quantity }
 * @param {Array} allStickers - array de todas as figurinhas
 * @returns {{ total, owned, missing, duplicates, duplicateUnits, percentage }}
 */
export function getOverallProgress(userQuantities, allStickers) {
  const total = allStickers.length;
  let owned = 0;
  let duplicates = 0;
  let duplicateUnits = 0;

  allStickers.forEach(s => {
    const qty = userQuantities[s.id] || 0;
    if (qty >= 1) owned++;
    if (qty > 1) {
      duplicates++;
      duplicateUnits += qty - 1;
    }
  });

  return {
    total,
    owned,
    missing: total - owned,
    duplicates,
    duplicateUnits,
    percentage: total > 0 ? Math.round((owned / total) * 100) : 0,
  };
}

/**
 * Calcula progresso por seleção.
 */
export function getTeamProgress(userQuantities, allStickers, team) {
  const teamStickers = allStickers.filter(s => s.selecao === team);
  const total = teamStickers.length;
  let owned = 0;

  teamStickers.forEach(s => {
    const qty = userQuantities[s.id] || 0;
    if (qty >= 1) owned++;
  });

  return {
    team,
    total,
    owned,
    missing: total - owned,
    percentage: total > 0 ? Math.round((owned / total) * 100) : 0,
  };
}

/**
 * Retorna lista de todas as seleções presentes no banco de dados.
 */
export function getTeams(allStickers) {
  return [...new Set(allStickers.map(s => s.selecao))];
}

/**
 * Retorna lista formatada de figurinhas repetidas para copiar.
 */
export function getDuplicatesText(userQuantities, allStickers) {
  const duplicates = [];
  allStickers.forEach(s => {
    const qty = userQuantities[s.id] || 0;
    if (qty > 1) {
      duplicates.push(s.numero);
    }
  });
  if (duplicates.length === 0) return 'Nenhuma figurinha repetida ainda!';
  return '🔄 Repetidas: ' + duplicates.join(', ');
}

/**
 * Retorna lista formatada de figurinhas faltantes para copiar.
 */
export function getMissingText(userQuantities, allStickers) {
  const missing = [];
  allStickers.forEach(s => {
    const qty = userQuantities[s.id] || 0;
    if (qty === 0) {
      missing.push(s.numero);
    }
  });
  if (missing.length === 0) return 'Álbum completo! 🎉';
  return '❌ Faltam: ' + missing.join(', ');
}

/**
 * Badges/conquistas do sistema.
 */
export const BADGES = [
  { id: 'first_sticker', name: 'Primeira Figurinha', icon: '⭐', description: 'Adicionou a primeira figurinha', check: (p) => p.owned >= 1 },
  { id: 'quarter', name: 'Colecionador Iniciante', icon: '🏅', description: '25% do álbum completo', check: (p) => p.percentage >= 25 },
  { id: 'half', name: 'Meio Caminho', icon: '🏆', description: '50% do álbum completo', check: (p) => p.percentage >= 50 },
  { id: 'three_quarters', name: 'Quase Lá', icon: '💎', description: '75% do álbum completo', check: (p) => p.percentage >= 75 },
  { id: 'complete', name: 'Álbum Completo', icon: '👑', description: '100% do álbum completo', check: (p) => p.percentage >= 100 },
  { id: 'first_duplicate', name: 'Primeira Repetida', icon: '🔄', description: 'Tem pelo menos 1 figurinha repetida', check: (p) => p.duplicates >= 1 },
  { id: 'scanner_used', name: 'Scanner Ativo', icon: '📸', description: 'Usou o scanner pela primeira vez', check: (_, meta) => meta?.scannerUsed },
];

/**
 * Checa quais badges estão desbloqueados.
 * @returns {Array} badges com campo `unlocked: boolean`
 */
export function checkBadges(progress, meta = {}) {
  return BADGES.map(badge => ({
    ...badge,
    unlocked: badge.check(progress, meta),
  }));
}

/**
 * Retorna se alguma seleção está 100% completa.
 */
export function getCompleteTeams(userQuantities, allStickers) {
  const teams = getTeams(allStickers);
  return teams.filter(team => {
    const p = getTeamProgress(userQuantities, allStickers, team);
    return p.percentage === 100;
  });
}
