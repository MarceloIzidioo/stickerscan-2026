import data from './stickers_copa2026.json';

const stickersData = data.figurinhas.map(s => ({
  id: s.numero,
  numero: s.numero,
  nome: s.nome,
  selecao: s.selecao,
  clube: s.clube,
  categoria: s.especial ? "Especial" : "Jogador",
  raridade: s.especial ? "Especial" : "Base",
  imagemUrl: s.img_url || ""
}));

export default stickersData;
