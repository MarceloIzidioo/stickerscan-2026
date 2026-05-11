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

    const prompt = "Você é um especialista em figurinhas da Copa do Mundo 2026. A imagem pode ser a FRENTE da figurinha (com nome e seleção) ou o VERSO (apenas com o código alfanumérico, ex: MAR14, BRA1). Retorne um JSON estrito com os campos: 'numero' (OBRIGATÓRIO usar essa chave para o código alfanumérico do verso ou frente), 'nome' (se visível), 'selecao' (se visível). Se a informação não existir, use null. Retorne APENAS o JSON limpo.";

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

    let numberMatch = null;
    const extractedNum = aiResult.numero || aiResult.codigo || aiResult.número || aiResult.id;

    if (extractedNum) {
      const rawNum = String(extractedNum).toUpperCase();
      numberMatch = stickersData.find(s => s.numero.toUpperCase() === rawNum);
      if (!numberMatch) {
        const normalize = (n) => String(n).replace(/[-\s]/g, '').replace(/([A-Z]+)0+([1-9])/g, '$1$2').toUpperCase();
        const normAi = normalize(rawNum);
        numberMatch = stickersData.find(s => normalize(s.numero) === normAi);
      }
    }

    let nameMatch = null;
    let highestScore = 0;

    const removeAccents = (str) => {
      return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
    };

    if (aiResult.nome) {
      const queryName = removeAccents(String(aiResult.nome).toLowerCase().trim());
      const querySelecao = aiResult.selecao ? removeAccents(String(aiResult.selecao).toLowerCase().trim()) : "";

      for (const s of stickersData) {
        let score = 0;
        const sName = removeAccents(s.nome.toLowerCase());
        const sSel = removeAccents(s.selecao.toLowerCase());

        // 1. Avalia o Nome
        if (sName === queryName) {
          score += 50;
        } else if (sName.includes(queryName) || queryName.includes(sName)) {
          if (sName.length >= 4 && queryName.length >= 4) score += 15;
        }

        // 2. Avalia a Seleção
        if (querySelecao) {
          if (sSel === querySelecao) {
            score += 30;
          } else if (sSel.includes(querySelecao) || querySelecao.includes(sSel)) {
            score += 10;
          }
        }

        if (score > highestScore) {
          highestScore = score;
          nameMatch = s;
        }
      }

      // Filtra matches ruins
      if (highestScore < 15) {
        nameMatch = null;
      }
    }

    // 3. Algoritmo de Decisão de Conflito (Número OCR vs Nome)
    if (numberMatch && nameMatch && numberMatch.id !== nameMatch.id) {
      // Conflito detectado! 
      // Ex: IA leu o número "GHA1" (Logo) mas o nome "Antoine Semenyo" (GHA17).
      // Como números pequenos podem ser cortados na foto, se o score do Nome for ALTÍSSIMO (Nome + Seleção bateram perfeitos), o Nome vence.
      if (highestScore >= 80) {
        matchedSticker = nameMatch;
        confidence = 0.90; // Alta precisão no nome
      } else {
        matchedSticker = numberMatch;
        confidence = 0.85; // Prioriza o número, mas avisa que a precisão caiu pelo conflito
      }
    } else {
      // Sem conflito ou apenas um dos dois retornou
      if (numberMatch) {
        matchedSticker = numberMatch;
        confidence = (nameMatch && numberMatch.id === nameMatch.id) ? 0.99 : 0.95;
      } else if (nameMatch) {
        matchedSticker = nameMatch;
        confidence = highestScore >= 50 ? 0.90 : 0.80;
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
