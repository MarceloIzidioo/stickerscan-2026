# ⚽ StickerScan 2026

O **StickerScan 2026** é um Web App Progressivo (PWA) de tempo de vida curto, construído especialmente para ajudar colecionadores a organizarem seu álbum da Copa do Mundo de 2026 de forma inteligente, rápida e integrada. Diga adeus às listas de papel e planilhas desatualizadas!

![Status](https://img.shields.io/badge/Status-Ativo-success)
![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-orange)

## ✨ Principais Funcionalidades

*   **📸 Scanner com IA (Google Gemini):** Aponte a câmera para a sua figurinha e o aplicativo reconhecerá automaticamente a seleção e o número, adicionando ela ao seu álbum com apenas um toque!
*   **📱 Instalação PWA:** Use como um aplicativo nativo no seu celular (Android e iOS). Funciona em tela cheia, sem barra de navegação, rápido e leve.
*   **📊 Dashboard de Progresso:** Acompanhe em tempo real a porcentagem de conclusão do seu álbum, quantas figurinhas você tem e quantas faltam.
*   **🔄 Gestão de Trocas:** Uma aba dedicada para facilitar as negociações. Exporte instantaneamente suas figurinhas Repetidas e Faltantes em formato otimizado `CODIGO-NUMERO` (ex: `BRA-1, ARG-10`) direto para o WhatsApp.
*   **💾 Armazenamento Local Seguro:** Sem necessidade de criar conta ou fazer login. Todos os dados das suas figurinhas são salvos diretamente no seu celular (`localStorage`).
*   **📦 Ferramenta de Backup:** Exporte e importe todo o seu progresso em um arquivo JSON caso troque de aparelho.

---

## 🛠 Tecnologias Utilizadas

Este projeto foi construído focando em performance, baixo custo de hospedagem e experiência "Mobile-First":

*   **React + Vite:** Motor principal para renderização ultrarrápida.
*   **Google Gemini API (`@google/genai`):** Motor de Visão Computacional para o Scanner das figurinhas.
*   **Vite PWA Plugin:** Para transformar a aplicação Web em um aplicativo instalável.
*   **Vanilla CSS:** Estilização limpa, responsiva e focada em performance (Glassmorphism e Dark Mode premium).

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado.
*   Uma chave de API gratuita do [Google Gemini (AI Studio)](https://aistudio.google.com/app/apikey).

### Passo a Passo Local
1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/stickerscan-2026.git
   cd stickerscan-2026
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure sua chave de IA:
   * Crie um arquivo chamado `.env` na raiz do projeto.
   * Adicione a seguinte linha dentro dele:
     ```env
     VITE_GEMINI_API_KEY=sua_chave_do_gemini_aqui
     ```
4. Inicie o servidor local:
   ```bash
   npm run dev
   ```

---

## 🌐 Publicando na Vercel (Deploy)

Para que a funcionalidade da Câmera funcione em dispositivos móveis e o aplicativo possa ser instalado (PWA), ele **precisa** estar hospedado em um ambiente HTTPS válido. Recomendamos a Vercel:

1. Faça o envio (push) deste repositório para o seu GitHub.
2. Acesse [Vercel](https://vercel.com/) e crie um novo projeto importando este repositório.
3. **CRÍTICO:** Durante a configuração na Vercel, adicione a Variável de Ambiente (`Environment Variables`) com o nome `VITE_GEMINI_API_KEY` e o valor da sua chave do Gemini.
4. Clique em **Deploy**.

Após a Vercel finalizar, abra o link gerado pelo celular e uma faixa aparecerá no topo sugerindo a instalação do Aplicativo!

---

## 📄 Estrutura de Dados
Os dados base do aplicativo (as 51 seleções e mapeamento oficial das figurinhas da Copa) estão localizados no arquivo estático `src/data/stickers_copa2026.json`.

---

*Desenvolvido para revolucionar a troca de figurinhas da Copa de 2026!* 🏆
