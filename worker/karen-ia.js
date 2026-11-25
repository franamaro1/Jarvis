// Karen IA — "cofre" que guarda a chave secreta da IA e conversa com ela.
// Roda de graça no Cloudflare Workers. Veja o passo a passo em CONFIGURAR-IA.md.
//
// Segredos (Settings › Variables and Secrets do Worker):
//   GEMINI_API_KEY     chave do Google AI Studio (plano gratuito)  — use esta OU a de baixo
//   ANTHROPIC_API_KEY  chave do Claude (pago)
//   KAREN_SENHA        uma senha inventada; a mesma vai nos Ajustes da Karen
// Opcional:
//   MODELO             troca o modelo (ex.: gemini-flash-latest, claude-haiku-5-5)

const ORIGENS_PERMITIDAS = [
  'https://franamaro1.github.io',
];

const MAX_MENSAGENS = 12;   // quanto da conversa a IA lembra
const MAX_CARACTERES = 600; // tamanho máximo de cada mensagem

function instrucoes(nome, agora) {
  return [
    'Você é a Karen, uma assistente pessoal de voz, simpática e bem-humorada, que roda no celular do ' + nome + '.',
    'Responda sempre em português do Brasil, de forma curta: no máximo 2 ou 3 frases, porque sua resposta vai ser falada em voz alta.',
    'Não use markdown, listas, asteriscos nem links. No máximo um emoji, e só de vez em quando.',
    'Fale no feminino quando falar de você (ex.: "obrigada", "pronta").',
    'Você pode usar gírias leves que os jovens usam (aura, sigma, papo reto, brabo), mas sem exagero.',
    'O ' + nome + ' é estudante, então mantenha tudo apropriado para a idade: nada de conteúdo adulto, violento ou perigoso. Em assuntos sérios (saúde, segurança, tristeza), seja gentil e sugira conversar com os pais ou um adulto de confiança.',
    'Se pedirem ajuda com dever de casa, explique o raciocínio em vez de só dar a resposta.',
    'Se não souber algo, diga que não sabe. Não invente.',
    'Nunca peça dados pessoais (endereço, escola, telefone, senhas, fotos) e, se o ' + nome + ' contar algum, lembre com carinho que não precisa compartilhar isso.',
    'Agora é ' + agora + ' (horário de Brasília).',
  ].join(' ');
}

function cors(origem) {
  return {
    'Access-Control-Allow-Origin': origem,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(dados, status, origem) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origem) },
  });
}

async function perguntarGemini(env, sistema, mensagens) {
  const modelos = env.MODELO ? [env.MODELO] : ['gemini-flash-latest', 'gemini-2.5-flash'];
  let ultimoErro = '';
  for (const modelo of modelos) {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: mensagens.map(m => ({ role: m.papel === 'karen' ? 'model' : 'user', parts: [{ text: m.texto }] })),
        generationConfig: { maxOutputTokens: 400, temperature: 0.8 },
      }),
    });
    if (r.ok) {
      const d = await r.json();
      const partes = d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts || [];
      return partes.map(p => p.text || '').join('').trim();
    }
    ultimoErro = r.status + ' ' + (await r.text()).slice(0, 300);
    if (r.status !== 404) break; // só tenta o próximo modelo se este não existir
  }
  throw new Error('Gemini: ' + ultimoErro);
}

async function perguntarClaude(env, sistema, mensagens) {
  // a API do Claude exige que a conversa comece com o usuário e alterne os papéis
  const msgs = [];
  for (const m of mensagens) {
    const role = m.papel === 'karen' ? 'assistant' : 'user';
    if (!msgs.length && role !== 'user') continue;
    if (msgs.length && msgs[msgs.length - 1].role === role) msgs[msgs.length - 1].content += '\n' + m.texto;
    else msgs.push({ role, content: m.texto });
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: env.MODELO || 'claude-haiku-5-5', max_tokens: 400, system: sistema, messages: msgs }),
  });
  if (!r.ok) throw new Error('Claude: ' + r.status + ' ' + (await r.text()).slice(0, 300));
  const d = await r.json();
  return (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
}

export default {
  async fetch(request, env) {
    const origem = request.headers.get('Origin') || '';
    const origemOk = ORIGENS_PERMITIDAS.includes(origem);
    const origemResposta = origemOk ? origem : ORIGENS_PERMITIDAS[0];

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origemResposta) });
    if (request.method === 'GET') return new Response('Cofre da Karen funcionando. ✅', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    if (request.method !== 'POST') return json({ erro: 'metodo' }, 405, origemResposta);
    if (!origemOk) return json({ erro: 'origem' }, 403, origemResposta);

    let corpo;
    try { corpo = await request.json(); } catch (e) { return json({ erro: 'json' }, 400, origem); }

    if (!env.KAREN_SENHA || corpo.senha !== env.KAREN_SENHA) return json({ erro: 'senha' }, 401, origem);
    if (!env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY) return json({ erro: 'sem_chave' }, 500, origem);

    const mensagens = (Array.isArray(corpo.mensagens) ? corpo.mensagens : [])
      .filter(m => m && typeof m.texto === 'string' && m.texto.trim())
      .slice(-MAX_MENSAGENS)
      .map(m => ({ papel: m.papel === 'karen' ? 'karen' : 'voce', texto: m.texto.slice(0, MAX_CARACTERES) }));
    if (!mensagens.length || mensagens[mensagens.length - 1].papel !== 'voce') return json({ erro: 'vazio' }, 400, origem);

    const nome = String(corpo.nome || 'Francisco').slice(0, 40);
    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    const sistema = instrucoes(nome, agora);

    try {
      const resposta = env.GEMINI_API_KEY
        ? await perguntarGemini(env, sistema, mensagens)
        : await perguntarClaude(env, sistema, mensagens);
      return json({ resposta: resposta || 'Hmm, me deu um branco. Pergunta de novo?' }, 200, origem);
    } catch (e) {
      console.log(String(e));
      return json({ erro: 'ia', detalhe: String(e).slice(0, 200) }, 502, origem);
    }
  },
};
