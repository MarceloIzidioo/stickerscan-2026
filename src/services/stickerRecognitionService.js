/**
 * Serviço de reconhecimento de figurinhas por imagem.
 * 
 * ============================================================
 * 🔮 INTEGRAÇÃO FUTURA COM IA:
 * 
 * No MVP, este serviço retorna resultados MOCKADOS (simulados).
 * 
 * Para integrar IA real, substitua a função recognizeStickerFromImage()
 * por uma chamada a:
 * 
 * - Google Cloud Vision API (OCR para ler número da figurinha)
 * - Google Gemini API (análise de imagem multimodal)  
 * - TensorFlow.js com modelo treinado localmente
 * - Embeddings de imagem + busca por similaridade
 * 
 * A interface da função permanece a mesma:
 * Input: imageData (base64 ou Blob)
 * Output: { match, confidence, signals }
 * ============================================================
 */

import stickersData from '../data/stickers';

/**
 * Simula o reconhecimento de uma figurinha a partir de dados de imagem.
 * Usando API Gemini 2.5 Flash agora.
 */
export async function recognizeStickerFromImage(imageData) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chave da API do Gemini não configurada no arquivo .env.local');
  }

  try {
    // Busca os dados da imagem em base64 se for um object URL ou File
    let base64String = imageData;
    let mimeType = 'image/jpeg';
    
    if (imageData.startsWith('data:')) {
      const parts = imageData.split(',');
      mimeType = parts[0].match(/:(.*?);/)[1];
      base64String = parts[1];
    } else if (imageData.startsWith('blob:')) {
      const response = await fetch(imageData);
      const blob = await response.blob();
      mimeType = blob.type;
      base64String = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
    }

    const prompt = "Você é um especialista em figurinhas da Copa do Mundo 2026. Analise a imagem desta figurinha. Extraia as informações disponíveis, como número (ex: BRA-001, PAN-002), nome do jogador ou seleção, e se é escudo ou jogador. Retorne um JSON com os campos: numero, nome, selecao. Seja o mais preciso possível no campo 'numero'. Retorne apenas o JSON limpo, sem marcações markdown como ```json.";

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64String
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("A IA não retornou resultados visuais ou foi bloqueada.");
    }

    const aiResultText = data.candidates[0].content.parts[0].text;
    
    let aiResult;
    try {
      const cleanText = aiResultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiResult = JSON.parse(cleanText);
    } catch (e) {
      console.error("Falha ao fazer parse do JSON retornado pela IA:", aiResultText);
      throw new Error("Formato de resposta inválido da IA.");
    }

    console.log("Resultado bruto da IA:", aiResult);

    // Tentar encontrar no banco local
    let matchedSticker = null;
    let confidence = 0.99;

    // Busca pelo número
    if (aiResult.numero) {
      const rawNum = String(aiResult.numero).toUpperCase();
      
      // 1. Tenta match exato
      matchedSticker = stickersData.find(s => s.numero.toUpperCase() === rawNum);
      
      // 2. Tenta match flexível (remove espaços, hífens e zeros extras)
      if (!matchedSticker) {
        const normalize = (n) => String(n).replace(/[-\s]/g, '').replace(/([A-Z]+)0+([1-9])/g, '$1$2').toUpperCase();
        const normAi = normalize(rawNum);
        matchedSticker = stickersData.find(s => normalize(s.numero) === normAi);
        if (matchedSticker) confidence = 0.95; // Confiança alta, mas precisou corrigir
      }
    }

    // Fallback: Busca por nome e seleção (Sistema de Pontuação)
    if (!matchedSticker && aiResult.nome) {
      const queryName = String(aiResult.nome).toLowerCase().trim();
      const querySelecao = aiResult.selecao ? String(aiResult.selecao).toLowerCase().trim() : "";

      let bestMatch = null;
      let highestScore = 0;

      for (const s of stickersData) {
        let score = 0;
        const sName = s.nome.toLowerCase();
        const sSel = s.selecao.toLowerCase();

        // 1. Avalia o Nome
        if (sName === queryName) {
          score += 50; // Match exato é muito forte
        } else if (sName.includes(queryName) || queryName.includes(sName)) {
           // Match parcial: só ganha pontos se não for uma palavra muito curta, para evitar colisões bobas
           if (sName.length >= 4 && queryName.length >= 4) {
             score += 15;
           }
        }

        // 2. Avalia a Seleção
        if (querySelecao) {
          if (sSel === querySelecao) {
            score += 30; // Match exato de seleção
          } else if (sSel.includes(querySelecao) || querySelecao.includes(sSel)) {
            score += 10; // Match parcial de seleção
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = s;
        }
      }

      // Só aceitamos o match se a pontuação for razoável (pelo menos um match parcial bom ou nome exato)
      if (bestMatch && highestScore >= 15) {
        matchedSticker = bestMatch;
        confidence = highestScore >= 50 ? 0.90 : 0.80; // Ajuste da confiança baseada na pontuação
      }
    }

    if (!matchedSticker) {
      throw new Error(`Figurinha identificada como ${aiResult.numero || '?'} - ${aiResult.nome || '?'}, mas não encontrada no nosso banco de dados local.`);
    }

    return {
      match: matchedSticker,
      confidence: confidence,
      signals: {
        ocrNumber: aiResult.numero || matchedSticker.numero,
        playerName: aiResult.nome || matchedSticker.nome,
        visualSimilarity: confidence,
      },
    };

  } catch (error) {
    console.error("Erro no reconhecimento com Gemini:", error);
    throw error;
  }
}

/**
 * Simula reconhecimento em lote (múltiplas figurinhas na imagem).
 * 
 * @param {string} imageData 
 * @returns {Promise<Array>}
 */
export async function recognizeMultipleStickers(imageData) {
  // Ainda usando mock para múltiplas por enquanto
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

  const count = 2 + Math.floor(Math.random() * 4); // 2 a 5 figurinhas
  const results = [];
  const usedIndexes = new Set();

  for (let i = 0; i < count; i++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * stickersData.length);
    } while (usedIndexes.has(idx));
    usedIndexes.add(idx);

    results.push({
      match: stickersData[idx],
      confidence: Math.round((0.82 + Math.random() * 0.16) * 100) / 100,
    });
  }

  return results;
}
