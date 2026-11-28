# Karen: guia técnico do projeto

Karen é uma assistente pessoal de voz que roda no navegador do celular (PWA). Antes se chamava **Jarvis**. Ela fala no **feminino**.

- Site: https://franamaro1.github.io/Jarvis/ (GitHub Pages, branch `main`)
- O dono do projeto está aprendendo a programar: explique em português, de forma simples e curta.

## Arquivos
- `index.html`: o app inteiro (HTML, CSS e JS num arquivo só)
- `sw.js`: service worker. **A cada mudança, aumente a versão `jarvis-vN`** para o celular pegar a atualização
- `manifest.webmanifest`: nome e ícone do app instalado
- `worker/karen-ia.js`: "cofre" (Cloudflare Worker) que guarda a chave da IA na nuvem (Gemini com busca no Google, ou Claude)
- `CONFIGURAR-IA.md`: passo a passo para um adulto configurar a IA na nuvem
- `data/`, `icons/`, `vendor/`, `tools/`: dados, ícones e bibliotecas

## Cuidados
- **Nunca renomeie as chaves `jarvis_*` do localStorage** (ex.: `jarvis_config`). Isso apagaria os dados salvos do usuário.
- Teste antes de enviar: extraia os `<script>` do index.html e rode `node --check`; teste as frases alteradas digitando no campo `#typeInput` (Playwright com o Chrome do sistema funciona).
- Respostas da Karen são faladas: curtas, sem markdown. Emojis são removidos na fala.
- Conteúdo sempre apropriado para um público jovem.

## Como a Karen escolhe a resposta (`responderA`)
jogo ativo → contas (`responderConta`) → easter eggs → gírias (`responderGirias`) → heróis (`responderHerois`) → famosos (`responderFamosos`) → cumprimentos (`responderCumprimento`) → comandos (agenda, lembretes, tarefas, gastos, notas, carrinho, timer…) → respostas antigas → `SEM_RESPOSTA` (vai pra IA).

Antes de tudo, `trocarTuPorVoce` troca tu/vc/cê/contigo/teu/tua por você/seu/sua.

## Funções
- Voz (reconhecimento e fala), rosto animado com expressões
- Lembretes com notificação, agenda, tarefas, timer, gastos, notas, lista de compras
- Contas (operadores, números por extenso, raiz, potência, porcentagem)
- Gírias e easter eggs (67, aura, sigma, papo reto, GG, sextou, rizz, NPC, brainrot…)
- Heróis da Marvel e famosos (esportes, música, internet, ciência)
- Jogos: pedra-papel-tesoura, adivinhar o número, par ou ímpar, cara ou coroa, dado

## IA
Quando não sabe responder (`SEM_RESPOSTA`):
1. IA na nuvem pelo cofre (`cfg.iaUrl` + `cfg.iaSenha`). Status: ainda não configurada
2. IA no celular (WebLLM, `Llama-3.2-1B-Instruct-q4f16_1-MLC`, `cfg.iaLocal`). Não responde notícias (`pareceNoticia`): avisa que precisa da IA na nuvem
3. Senão, `respostaNaoSei()`

O histórico das últimas ~12 mensagens vai junto (`historicoConversa`).

## Ideias pendentes
Voz feminina por padrão, previsão do tempo, mais jogos (quiz, forca, charadas), visual novo, IA maior no celular (3B), pulseira ESP32 (sem Bluetooth no Safari do iPhone).
