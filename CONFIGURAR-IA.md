# Ligar a IA da Karen — guia para os pais

A Karen é um assistente que o Francisco montou no celular. Ela já faz várias coisas sozinha: lembretes, contas, jogos, gírias…
Quando ela **não sabe** responder, pode perguntar para uma IA de verdade (o Gemini, do Google).

Para isso funcionar, falta uma parte que precisa de um adulto: **criar a chave da IA**. As contas dessas IAs são só para maiores de 18 anos.

⏱️ Leva uns 10 minutos. É melhor fazer no computador.
💰 **Grátis.** Usa o plano gratuito do Google e o plano gratuito da Cloudflare. Não precisa de cartão.

---

## Por que precisa de um "cofre"?

O site da Karen é público. Se a chave da IA ficasse no código dele, qualquer pessoa poderia copiar e usar.
Por isso a chave fica guardada num "cofre" (um Cloudflare Worker). A Karen manda a pergunta pro cofre, e o cofre pergunta pra IA.
O cofre só aceita pedidos que venham do site da Karen e tenham a senha certa.

---

## Passo 1 — Pegar a chave do Gemini (Google)

1. Entre em **https://aistudio.google.com** com uma conta Google sua (de adulto).
2. Aceite os termos, se aparecerem.
3. No menu, clique em **Get API key** (ou "Obter chave de API").
4. Clique em **Create API key** (Criar chave de API).
5. Copie a chave. Ela começa com `AIza...`. Guarde por um minutinho e **não mande pra ninguém**.

> ℹ️ No plano gratuito, o Google pode usar as conversas para melhorar os produtos dele. Por isso, a Karen é instruída a não pedir dados pessoais. Se preferir, o cofre também funciona com o Claude (pago). Veja o final deste guia.

---

## Passo 2 — Criar o cofre (Cloudflare)

1. Crie uma conta grátis em **https://dash.cloudflare.com/sign-up** e confirme o e-mail.
2. No menu da esquerda, vá em **Compute (Workers)** › **Workers & Pages**. Em algumas contas aparece só **Workers & Pages**.
3. Clique em **Create** (Criar) e escolha **Start with Hello World!**
4. Dê o nome **karen-ia** e clique em **Deploy**.
5. Clique em **Edit code** (Editar código).
6. Apague todo o código que aparece e cole o código deste link:
   **https://raw.githubusercontent.com/franamaro1/jarvis/main/worker/karen-ia.js**
   (abra o link, selecione tudo, copie e cole)
7. Clique em **Deploy** (canto de cima, à direita).

## Passo 3 — Guardar a chave e a senha no cofre

1. Volte para a página do worker **karen-ia** e abra a aba **Settings** (Configurações).
2. Vá em **Variables and Secrets** e clique em **Add**.
3. Adicione os dois segredos abaixo, escolhendo o tipo **Secret** nos dois:

| Nome (exatamente assim) | Valor |
|---|---|
| `GEMINI_API_KEY` | a chave `AIza...` do Passo 1 |
| `KAREN_SENHA` | uma senha inventada por vocês (ex.: `pizza-azul-2026`) |

4. Clique em **Deploy** ou **Save** pra salvar.
5. Copie o endereço do worker. Ele fica no topo da página e parece com
   `https://karen-ia.SEU-NOME.workers.dev`.
   Se você abrir esse endereço no navegador, deve aparecer **"Cofre da Karen funcionando. ✅"**

## Passo 4 — Ligar na Karen (no celular do Francisco)

1. Abra a Karen: **https://franamaro1.github.io/Jarvis/**
2. Vá na aba **Ajustes** (role as abas pro lado).
3. No cartão **Inteligência artificial**, preencha:
   - **Endereço do cofre:** o endereço `https://karen-ia....workers.dev`
   - **Senha:** a mesma senha do `KAREN_SENHA`
4. Toque em **Testar IA**, volte na aba **Conversa** e veja se ela respondeu. 🎉

Pronto! Agora, quando a Karen não souber algo, ela pergunta pra IA.

---

## Dúvidas

**Quanto custa?** No plano gratuito do Gemini, nada. Se passar do limite grátis do dia, a IA só para de responder até o dia seguinte. Não gera cobrança, porque não tem cartão cadastrado.

**É seguro?** A chave fica só no cofre, nunca no celular nem no site. O cofre só responde ao site da Karen com a senha certa. A Karen é instruída a dar respostas curtas, apropriadas para a idade, e a sugerir conversar com os pais em assuntos sérios.

**Como desligar?** Nos Ajustes da Karen, toque em **Desligar IA**. Ou apague a chave em aistudio.google.com.

**Ela respondeu "a senha da minha IA tá errada".** A senha nos Ajustes tem que ser idêntica à do `KAREN_SENHA`, com maiúsculas, minúsculas e traços iguais.

**Quero usar o Claude em vez do Gemini.** Crie uma chave paga em https://console.anthropic.com. No cofre, apague o segredo `GEMINI_API_KEY` e adicione `ANTHROPIC_API_KEY` com a chave nova. O resto continua igual.
