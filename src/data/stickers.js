import data from './stickers_copa2026.json';
import { getTeamSortIndex } from '../utils/statusUtils';

const stickersData = data.figurinhas.map(s => ({
  id: s.numero,
  numero: s.numero,
  nome: s.nome,
  selecao: s.selecao,
  clube: s.clube,
  categoria: s.especial ? "Especial" : "Jogador",
  raridade: s.especial ? "Especial" : "Base",
  imagemUrl: s.img_url || ""
})).sort((a, b) => {
  const teamDiff = getTeamSortIndex(a.selecao) - getTeamSortIndex(b.selecao);
  if (teamDiff !== 0) return teamDiff;
  
  // Secondary sort by number correctly (e.g. MEX1 before MEX10)
  const getNum = (n) => parseInt(n.replace(/[^0-9]/g, '')) || 0;
  return getNum(a.numero) - getNum(b.numero);
});

export default stickersData;
