/* ==========================================================================
   I.Amigo — Live Conversational AI Chat & Bilingual PT|EN Integration
   Connects to https://i-amigo.andrebalbino2.workers.dev (Groq GPT-OSS 120B)
   with warm local friend fallback on 429 or network unavailability.
   ========================================================================== */
(function () {
  'use strict';

  if (window.__iamigoPortfolioInit) return;
  window.__iamigoPortfolioInit = true;

  var WORKER_URL = 'https://i-amigo.andrebalbino2.workers.dev/chat';
  var CONTACT_URL = 'contact.html';

  var I18N = {
    pt: {
      doc_title: 'I.Amigo — Sua I.A Amiga! | André Carvalho',
      ia_page_title: 'I.Amigo — Sua I.A Amiga!',
      ia_tagline: 'Sua I.A Amiga!',
      ia_new_chat: 'Nova conversa',
      ia_input_label: 'Digite sua mensagem para a I.Amigo',
      ia_input_placeholder: 'Escreva qualquer coisa para conversar...',
      ia_send_label: 'Enviar mensagem',
      ia_hint_enter: 'Enter envia',
      ia_hint_shift: 'Shift+Enter quebra linha',
      ia_badge_online: 'Groq Online • GPT-OSS 120B',
      ia_badge_online_title: 'Conectado ao Groq AI (GPT-OSS 120B) via Cloudflare Worker',
      ia_badge_local: 'Modo Amigo Local',
      ia_badge_local_title: 'Respondendo localmente no navegador',
      ia_badge_rest: 'Descansando rapidinho',
      ia_badge_rest_title: 'Atingiu o limite gratuito momentâneo — volta em instantes',
      ia_sleepy_reply: 'Ahh... deu um soninho!! Vou descansar um tempinho, volte daqui a pouquinho para a gente se falar mais! Adorei nossa conversa e gostaria muito de continuar sendo seu amigo! :)',
      ia_typing_label: 'I.Amigo está digitando',
      ia_greeting: 'Sou I.Amigo, sua I.A Amiga :). Vamos conversar sobre o que hoje?!',
      ia_contact_cta: 'Conversar com o André (sem compromisso) ↗',
      ia_fallback_rate: 'O limite gratuito da API atingiu um pico momentâneo (429). Segui no Modo Amigo Local pra não parar nosso papo:',
      ia_fallback_offline: 'Não consegui alcançar o servidor agora. Segui no Modo Amigo Local pra gente continuar conversando:',
      chips: [
        'Como foi o seu dia?',
        'Me indica uma música ou filme?',
        'Bateu uma dúvida aleatória...',
        'Quero tirar uma ideia de projeto do papel'
      ],
      ia_sec_label: '01 • Como a I.Amigo funciona',
      ia_sec_title: 'Conversa natural ao vivo com proxy seguro na borda',
      ia_sec_intro: 'Projetada para soar acolhedora desde o primeiro "oi", mantendo zero segredos no navegador e continuidade mesmo sob limite de requisições.',
      ia_c1_num: '01 / PERSONALIDADE & TOM',
      ia_c1_title: 'Personalidade antes de vendas',
      ia_c1_desc: 'Acolhedora, leve e curiosa para falar de café, música, rotina ou código sem empurrar orçamento. Só menciona o estúdio com link discreto para contato se o visitante trouxer um projeto digital.',
      ia_c2_num: '02 / EDGE PROXY & CORS',
      ia_c2_title: 'Cloudflare Worker Proxy',
      ia_c2_desc: 'As mensagens vão direto para o Worker em produção com validação de origem (CORS) e limite de histórico. A chave da API permanece protegida nos Secrets da Cloudflare, nunca exposta no navegador.',
      ia_c3_num: '03 / INFERÊNCIA & FALLBACK',
      ia_c3_title: 'Groq Free Tier (GPT-OSS 120B)',
      ia_c3_desc: 'Inferência ultrarrápida com openai/gpt-oss-120b e fallback automático de modelos via API da Groq. Se a cota gratuita (429) ou a rede oscilar, o chat alterna para o Modo Amigo Local sem interromper o papo.',
      ia_repo_link: 'Ver código-fonte no GitHub (dedss22/i-amigo) ↗',
      ia_cta_label: '02 • Próximo Passo',
      ia_cta_title: 'Quer integrar IA, automações ou uma experiência sob medida no seu site?',
      ia_cta_desc: 'Construo interfaces web rápidas, assistentes conectados com segurança na borda e sistemas completos para o seu negócio.'
    },
    en: {
      doc_title: 'I.Amigo — Your Friendly A.I! | André Carvalho',
      ia_page_title: 'I.Amigo — Your Friendly A.I!',
      ia_tagline: 'Your Friendly A.I • English Mode',
      ia_tagline_title: 'Dedicated English persona — switch PT | EN anytime to chat in Portuguese',
      ia_new_chat: 'New chat',
      ia_input_label: 'Type your message to I.Amigo',
      ia_input_placeholder: 'Write anything to chat in English...',
      ia_send_label: 'Send message',
      ia_hint_enter: 'Enter sends',
      ia_hint_shift: 'Shift+Enter new line',
      ia_badge_online: 'Groq Online • GPT-OSS 120B',
      ia_badge_online_title: 'Connected to Groq AI (GPT-OSS 120B) in English Mode via Cloudflare Worker',
      ia_badge_local: 'Local Friend Mode',
      ia_badge_local_title: 'Replying locally in English Mode in the browser',
      ia_badge_rest: 'Resting for a moment',
      ia_badge_rest_title: 'Temporary free tier limit reached — back in a few moments',
      ia_sleepy_reply: "Aww... I just got a little sleepy!! I'm going to rest for a short bit — come back in a few moments so we can talk more! I loved our chat and would really love to stay your friend! :)",
      ia_typing_label: 'I.Amigo is typing',
      ia_greeting: "I'm I.Amigo, your friendly A.I :). What should we talk about today?!",
      ia_contact_cta: 'Chat with André (no strings attached) ↗',
      ia_fallback_rate: 'The free API tier hit a temporary rate limit (429). Switched seamlessly to Local Friend Mode so we can keep chatting:',
      ia_fallback_offline: 'Could not reach the live server right now. Switched to Local Friend Mode so our conversation keeps flowing:',
      chips: [
        'How was your day?',
        'Recommend a song or movie?',
        'Got a random curiosity...',
        'I want to bring a project idea to life'
      ],
      ia_sec_label: '01 • How I.Amigo works',
      ia_sec_title: 'Live natural conversation with a secure edge proxy',
      ia_sec_intro: 'Designed to feel warm and human from the very first "hi", keeping zero secrets in the browser and staying responsive even under rate limits.',
      ia_c1_num: '01 / PERSONALITY & TONE',
      ia_c1_title: 'Personality before sales',
      ia_c1_desc: 'Warm, lighthearted and curious — ready to chat about coffee, music, daily life or code without pushing a pitch. It only gently mentions the studio and contact page if the visitor brings up a digital project.',
      ia_c2_num: '02 / EDGE PROXY & CORS',
      ia_c2_title: 'Cloudflare Worker Proxy',
      ia_c2_desc: 'Messages go directly to the production Worker with strict origin validation (CORS) and history trimming. The API key stays protected inside Cloudflare Secrets, never exposed in the browser.',
      ia_c3_num: '03 / INFERENCE & FALLBACK',
      ia_c3_title: 'Groq Free Tier (GPT-OSS 120B)',
      ia_c3_desc: 'Ultra-low-latency inference powered by openai/gpt-oss-120b on Groq with automatic model fallback. If the free tier hits 429 or the network drops, the chat gracefully transitions to Local Friend Mode without breaking flow.',
      ia_repo_link: 'View source code on GitHub (dedss22/i-amigo) ↗',
      ia_cta_label: '02 • Next Step',
      ia_cta_title: 'Want to integrate AI, automations or a custom experience into your website?',
      ia_cta_desc: 'I build fast web interfaces, edge-secured AI assistants and end-to-end systems tailored to your workflow.'
    }
  };

  var messagesEl = document.getElementById('ia-chat-messages');
  var quickChipsEl = document.getElementById('ia-quick-chips');
  var chatFormEl = document.getElementById('ia-chat-form');
  var chatInputEl = document.getElementById('ia-chat-input');
  var sendBtnEl = document.getElementById('ia-btn-send');
  var newChatBtnEl = document.getElementById('ia-btn-new-chat');
  var modeBadgeEl = document.getElementById('ia-mode-badge');
  var modeBadgeTextEl = document.getElementById('ia-mode-badge-text');

  if (!messagesEl || !chatFormEl || !chatInputEl || !sendBtnEl || !newChatBtnEl) {
    return;
  }

  var state = {
    lang: resolveLang(),
    connectionMode: 'online',
    messages: [],
    isBusy: false,
    hasUserInteracted: false,
    memory: {
      userName: null,
      lastTopic: null,
      usedReplyIds: [],
      projectLinkShown: false
    }
  };

  function resolveLang() {
    if (typeof window.portfolioGetLanguage === 'function') {
      return window.portfolioGetLanguage() === 'en' ? 'en' : 'pt';
    }
    try {
      if (window.localStorage.getItem('portfolio_lang') === 'en') return 'en';
    } catch (e) {}
    return document.documentElement.lang === 'en' ? 'en' : 'pt';
  }

  function getCopy(lang) {
    return I18N[lang === 'en' ? 'en' : 'pt'];
  }

  function updateModeBadge() {
    if (!modeBadgeEl || !modeBadgeTextEl) return;
    var t = getCopy(state.lang);
    var isOnline = state.connectionMode === 'online';
    var isRest = state.connectionMode === 'rest';

    modeBadgeEl.classList.toggle('iamigo-badge--online', isOnline);
    modeBadgeEl.classList.toggle('iamigo-badge--local', !isOnline);
    if (isOnline) {
      modeBadgeTextEl.textContent = t.ia_badge_online;
      modeBadgeEl.title = t.ia_badge_online_title;
    } else if (isRest) {
      modeBadgeTextEl.textContent = t.ia_badge_rest;
      modeBadgeEl.title = t.ia_badge_rest_title;
    } else {
      modeBadgeTextEl.textContent = t.ia_badge_local;
      modeBadgeEl.title = t.ia_badge_local_title;
    }
  }

  function syncLanguageUI(newLang) {
    state.lang = newLang === 'en' ? 'en' : 'pt';
    var t = getCopy(state.lang);

    document.title = t.doc_title;

    document.querySelectorAll('[data-ia-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-ia-i18n');
      if (t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    var taglineEl = document.querySelector('.iamigo-tagline');
    if (taglineEl) {
      if (t.ia_tagline_title) {
        taglineEl.title = t.ia_tagline_title;
      } else {
        taglineEl.removeAttribute('title');
      }
    }

    chatInputEl.placeholder = t.ia_input_placeholder;
    sendBtnEl.setAttribute('aria-label', t.ia_send_label);
    sendBtnEl.title = t.ia_send_label;

    if (quickChipsEl) {
      quickChipsEl.querySelectorAll('.iamigo-chip').forEach(function (chip, index) {
        var label = t.chips[index];
        if (label) {
          chip.textContent = label;
          chip.setAttribute('data-prompt', label);
        }
      });
    }

    // Update initial greeting in-place without clearing any ongoing conversation
    if (state.messages.length > 0 && state.messages[0].isInitial) {
      state.messages[0].content = t.ia_greeting;
    }
    var initialRow = messagesEl.querySelector('[data-initial="true"]');
    if (initialRow) {
      var initialParagraph = initialRow.querySelector('.iamigo-bubble p');
      if (initialParagraph) {
        initialParagraph.textContent = t.ia_greeting;
      }
    }

    // Update only contact CTA links without touching EN->PT coach action pills
    messagesEl.querySelectorAll('.iamigo-subtle-link[data-ia-contact-cta]').forEach(function (link) {
      link.textContent = t.ia_contact_cta;
    });

    // Show EN->PT coach pills only while the interface is in EN mode
    messagesEl.querySelectorAll('.iamigo-bubble-actions').forEach(function (wrap) {
      wrap.hidden = state.lang !== 'en';
    });

    updateModeBadge();

    if (typeof scroll !== 'undefined' && scroll && typeof scroll.update === 'function') {
      setTimeout(function () {
        if (typeof scroll !== 'undefined' && scroll && typeof scroll.update === 'function') {
          scroll.update();
        }
      }, 60);
    }
  }

  function normalizeText(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function looksLikePortuguese(text) {
    var raw = String(text || '');
    if (!raw.trim()) return false;
    if (/[ãõç]/i.test(raw)) return true;
    var norm = normalizeText(raw);
    return /\b(oi|ola|tudo bem|como vai|voce|vc|falar|quero|nao|sim|obrigado|obrigada|bom dia|boa tarde|boa noite|portugues|entendi|pra|comigo|porque|tambem)\b/.test(norm);
  }

  function pickFreshVariant(category, variants) {
    for (var i = 0; i < variants.length; i += 1) {
      var id = category + ':' + i;
      if (state.memory.usedReplyIds.indexOf(id) === -1) {
        state.memory.usedReplyIds.push(id);
        if (state.memory.usedReplyIds.length > 24) {
          state.memory.usedReplyIds.shift();
        }
        return variants[i];
      }
    }
    return variants[Math.floor(Math.random() * variants.length)];
  }

  function extractUserName(originalText, normText) {
    if (/\b(meu nome e|me chamo|pode me chamar de|my name is|call me)\b/.test(normText)) {
      var match = originalText.match(/(?:meu nome é|meu nome e|me chamo|pode me chamar de|my name is|call me)\s+([A-Za-zÀ-ÖØ-öø-ÿ]{2,20})/i);
      if (match && match[1]) {
        var candidate = match[1];
        var blocked = ['um', 'uma', 'de', 'que', 'muito', 'bem', 'mal', 'a', 'an', 'the', 'very', 'good', 'fine'];
        if (blocked.indexOf(normalizeText(candidate)) === -1) {
          state.memory.userName = candidate.charAt(0).toUpperCase() + candidate.slice(1);
          return state.memory.userName;
        }
      }
    }
    return null;
  }

  function detectProjectIntent(norm) {
    var creationOrNeed = /\b(criar|fazer|montar|desenvolver|construir|lancar|preciso|quero|pensando em|tirar.*papel|ideia de projeto|pro meu negocio|para meu negocio|para o meu negocio|meu negocio|orcamento|contratar|build|create|make|launch|develop|need|want|project idea|my business|budget|hire)\b/.test(norm);
    var digitalArtifact = /\b(site|website|landing|portfolio|sistema|painel|dashboard|loja virtual|ecommerce|e-commerce|automacao|app|aplicativo|plataforma|projeto digital|sistema web|web app|automation|system|store)\b/.test(norm);
    var explicitIdeaPhrase = /\b(tirar uma ideia de projeto do papel|ideia de projeto|criar um site|fazer um site|site ou sistema|bring a project idea to life|build a website|create a site)\b/.test(norm);

    return explicitIdeaPhrase || (creationOrNeed && digitalArtifact);
  }

  function withName(sentence) {
    if (!state.memory.userName) {
      return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }
    return state.memory.userName + ', ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
  }

  function generateLocalReplyEn(userText, norm) {
    var newName = extractUserName(userText, norm);
    if (newName && norm.split(' ').length <= 6) {
      state.memory.lastTopic = 'greeting';
      return {
        text: 'Nice to meet you, ' + newName + '! Tell me, what is on your mind today?'
      };
    }

    if (/\b(practice english|teach me.*phrase|everyday phrase|learn english)\b/.test(norm)) {
      state.memory.lastTopic = 'english-practice';
      return {
        text: pickFreshVariant('en-practice-phrase', [
          'Awesome! Here is a super useful everyday phrase: **"How\'s it going?"** — it\'s a friendly, natural way to say *"How are you?"*.\n\nIf someone asks *"How\'s it going?"*, you can simply reply: *"Pretty good! How about you?"* Want to try answering me right now? **Hey! How\'s it going today?**',
          'Let\'s do it! Try this natural everyday phrase: **"I\'m down for that!"** — it means *"I\'m in / I\'d love to!"*.\n\nFor example: *"Want to grab a coffee?"* — *"Yeah, I\'m down for that!"* Can you try writing a short sentence using **"I\'m down"**?'
        ])
      };
    }

    if (detectProjectIntent(norm)) {
      state.memory.lastTopic = 'project';
      var firstTime = !state.memory.projectLinkShown;
      state.memory.projectLinkShown = true;

      if (firstTime) {
        var opener = pickFreshVariant('en-project-first', [
          'That sounds exciting! Turning an idea into something real is the best part. Tell me a bit more: what problem do you want this project to solve day to day, and who is it for?',
          'I love when an idea starts taking shape! What is the core feature you would love to see working right away?'
        ]);
        var subtleNote = "By the way, André's studio works specifically on custom websites, systems and automations — if you ever want to bounce this idea directly with him, I'll leave a no-pressure link right below.";
        return {
          text: opener + '\n\n' + subtleNote,
          includeContactLink: true
        };
      }

      return {
        text: pickFreshVariant('en-project-follow', [
          'Makes total sense! Sketching out the simplest version first usually unlocks everything. Which part still feels fuzzy right now?',
          'If we had to pick just the essential core for version one, what could not be missing?'
        ])
      };
    }

    var hasCoffee = /\b(coffee|espresso|cappuccino|tea|latte)\b/.test(norm);
    var hasMusic = /\b(music|song|songs|playlist|spotify|band|singer|rock|lofi|lo-fi|jazz|podcast|listen)\b/.test(norm);
    var hasEntertainment = /\b(movie|movies|film|series|show|cinema|netflix|anime|documentary|watch|book|books|read)\b/.test(norm);
    var hasGreeting = /\b(hi|hello|hey|how are you|how was your day|good morning|good afternoon|good evening)\b/.test(norm);

    if (hasCoffee && hasMusic) {
      state.memory.lastTopic = 'music';
      return {
        text: pickFreshVariant('en-coffee-music', [
          withName('good coffee plus good music is basically the ultimate peace combo. Things are great over here! What is playing on your side right now?'),
          'That sounds like a cozy moment! Warm coffee and a good track make any hour better. Are you listening to something chill or upbeat today?'
        ])
      };
    }

    if (hasGreeting && norm.length <= 55 && !hasCoffee && !hasMusic) {
      state.memory.lastTopic = 'greeting';
      return {
        text: pickFreshVariant('en-greeting', [
          withName("things have been super chill and bright over here! I'm really glad we're chatting. How has your day been going — busy or relaxed?"),
          'Hey! Doing great here and always up for a good conversation. How is your week treating you so far?'
        ])
      };
    }

    if (hasMusic && hasEntertainment) {
      state.memory.lastTopic = 'entertainment';
      return {
        text: pickFreshVariant('en-music-movie', [
          'Love recommending good picks! On the music side, a smooth Brazilian Bossa & Lo-Fi mix or Jungle sets an amazing mood. For movies or shows, "About Time" or "Chef" feel like a warm hug, while "Severance" hooks you right away. Are you more in the mood for music or screen time today?',
          'Here is a great combo: Khruangbin or Tim Bernardes for a relaxed soundtrack, and "The Secret Life of Walter Mitty" if you want an uplifting watch. What vibe are you leaning toward?'
        ])
      };
    }

    if (hasCoffee) {
      state.memory.lastTopic = 'food';
      return {
        text: pickFreshVariant('en-coffee', [
          'Fresh coffee changes the whole mood, right? Are you team black coffee or do you prefer milk and something sweet on the side?',
          'A good coffee break is practically therapy! Taking a breather or fueling up for something?'
        ])
      };
    }

    if (hasMusic) {
      state.memory.lastTopic = 'music';
      return {
        text: pickFreshVariant('en-music', [
          'I love talking music! If you want a light background vibe, acoustic MPB, smooth jazz or lo-fi beats never miss. What kind of sound matches your mood today?',
          'Good music rescues any day! Are you discovering new tracks lately or replaying your all-time favorites?'
        ])
      };
    }

    if (hasEntertainment) {
      state.memory.lastTopic = 'entertainment';
      return {
        text: pickFreshVariant('en-movies', [
          'For a feel-good movie, "Chef" or "About Time" are wonderful. If you want something clever and gripping, "Severance" is hard to beat. What genre sounds best tonight?',
          'Nice pick! Are you looking for something light to unwind, or a mystery that keeps you guessing?'
        ])
      };
    }

    if (/\b(curiosity|random|fact|joke|bored|space|universe|animal)\b/.test(norm)) {
      state.memory.lastTopic = 'curiosity';
      return {
        text: pickFreshVariant('en-curiosity', [
          'Here is a fun random fact: octopuses have three hearts and blue blood — and when they swim, one of those hearts actually stops beating! Want another weird fact or got a random question on your mind?',
          'Did you know the earthy smell after rain has a name? It is called "petrichor", and human noses are surprisingly sensitive to it! Drop any random thought and let us explore it.'
        ])
      };
    }

    if (/\b(tired|exhausted|stressed|sad|anxious|rough|happy|excited|great)\b/.test(norm)) {
      state.memory.lastTopic = 'mood';
      if (/\b(happy|excited|great)\b/.test(norm)) {
        return {
          text: 'Love hearing that! Good energy is contagious — what made your day so bright?'
        };
      }
      return {
        text: 'Some days really drain the battery. If you can, take five quiet minutes away from screens, grab some water and breathe. Want to vent about what made today heavy?'
      };
    }

    if (/\b(thanks|thank you|bye|see you)\b/.test(norm)) {
      state.memory.lastTopic = 'bye';
      return {
        text: 'Anytime! Whenever you want a light chat or a quick breather, I am right here.'
      };
    }

    state.memory.lastTopic = 'general';
    return {
      text: pickFreshVariant('en-general', [
        'I love that you brought this up! Tell me a little more about what sparked that thought.',
        'Good conversations flow just like this — how are you feeling about all of that today?',
        'Interesting! Do you want to dive deeper into that, or switch gears to something light?'
      ])
    };
  }

  function generateLocalReplyPt(userText, norm) {
    var newName = extractUserName(userText, norm);

    if (newName && norm.split(' ').length <= 6) {
      state.memory.lastTopic = 'greeting';
      return {
        text: 'Prazer falar com você, ' + newName + '! Muito bom te conhecer. E me conta: o que tá passando pela sua cabeça hoje?'
      };
    }

    // Golden Rule: ONLY trigger subtle project mention if user explicitly brings up building a site/system/app/automation/project
    if (detectProjectIntent(norm)) {
      state.memory.lastTopic = 'project';
      var firstTime = !state.memory.projectLinkShown;
      state.memory.projectLinkShown = true;

      if (firstTime) {
        var opener = pickFreshVariant('project-first', [
          'Que massa ter uma ideia assim ganhando forma! Me conta um pouquinho melhor: o que você imagina que esse projeto resolve no dia a dia ou pra quem ele vai ser?',
          'Adoro quando uma ideia começa a sair da cabeça e virar plano! Qual é a parte principal que você gostaria que funcionasse logo de cara nesse projeto?',
          'Isso dá uma conversa ótima! Se quiser ir lapidando comigo por aqui — público, funções essenciais, o que vale simplificar primeiro — eu topo total.'
        ]);
        var subtleNote = 'Inclusive, aqui a gente trabalha justamente construindo sites, sistemas e automações sob medida — se em algum momento quiser bater um papo com o André sobre isso, deixo o caminho ali sem compromisso.';
        return {
          text: opener + '\n\n' + subtleNote,
          includeContactLink: true
        };
      }

      return {
        text: pickFreshVariant('project-follow', [
          'Boa! Pensar no fluxo mais simples primeiro costuma destravar tudo. Qual detalhe dessa ideia ainda tá meio nebuloso pra você?',
          'Faz total sentido. Se a gente fosse desenhar a primeira versão bem enxuta disso, o que não poderia faltar de jeito nenhum?'
        ])
      };
    }

    var hasCoffee = /\b(cafe|cafezinho|espresso|cappuccino|cha)\b/.test(norm);
    var hasMusic = /\b(musica|musicas|som|ouvir|ouvindo|playlist|spotify|banda|cantor|rock|mpb|lofi|lo-fi|samba|jazz|podcast)\b/.test(norm);
    var hasGreeting = /\b(oi|ola|oie|e ai|eai|tudo bem|como voce ta|como vc ta|tudo certo|bom dia|boa tarde|boa noite|como foi o seu dia|como foi seu dia)\b/.test(norm);

    if (hasCoffee && hasMusic) {
      state.memory.lastTopic = 'music';
      return {
        text: pickFreshVariant('coffee-music', [
          withName('oi! Olha, café + música boa é praticamente o combo perfeito da paz. Por aqui tá tudo ótimo, bem tranquila e pronta pra prosa. O que tá tocando aí na sua caixa de som agora?'),
          'Que delícia de momento! Um café quentinho e música tocando já melhoram qualquer hora do dia. Tô ótima por aqui — me conta, tá ouvindo algo mais calmo ou animado hoje?'
        ])
      };
    }

    if (hasGreeting && norm.length <= 55 && !hasCoffee && !hasMusic) {
      state.memory.lastTopic = 'greeting';
      return {
        text: pickFreshVariant('greeting', [
          withName('por aqui o dia tá leve e bem gostoso! Fico feliz de conversar com você. Como tá sendo o seu dia por aí — corrido ou mais tranquilo?'),
          'Oi! Tudo ótimo por aqui, com energia boa pra bater papo. E do lado daí, como você tá hoje? Rolou alguma coisa legal ou só buscando um respiro?',
          'Tudo tranquilo por aqui! Adoro quando aparece alguém pra trocar ideia sem pressa. Me conta como anda a sua semana!'
        ])
      };
    }

    if (hasCoffee || /\b(comida|almoco|janta|fome|receita|cozinhar|bolo|pizza|chocolate|lanche|doce|pao)\b/.test(norm)) {
      state.memory.lastTopic = 'food';
      if (hasCoffee) {
        return {
          text: pickFreshVariant('coffee', [
            'Ah, um cafezinho muda tudo, né? Você é do time café puro sem açúcar ou prefere com leite e alguma coisa doce pra acompanhar?',
            'Café passado na hora tem até poder terapêutico! Tá fazendo uma pausa merecida ou tomando pra dar aquele gás?'
          ])
        };
      }
      return {
        text: pickFreshVariant('food', [
          'Assunto bom demais! Quando bate vontade de comer algo gostoso, você prefere ir pro fogão testar receita ou pedir algo prático mesmo?',
          'Falar de comida já abre o apetite! Tem algum prato que é o seu conforto oficial quando o dia pede um carinho?'
        ])
      };
    }

    var hasEntertainment = /\b(filme|filmes|serie|series|cinema|netflix|anime|documentario|assistir)\b/.test(norm);
    if (hasMusic && hasEntertainment) {
      state.memory.lastTopic = 'entertainment';
      return {
        text: pickFreshVariant('music-movie', [
          'Adoro indicar coisa boa! De música, se quiser uma vibe gostosa e leve, vai de Tim Bernardes ou uma playlist de Bossa & Lo-Fi. E de filme, "Questão de Tempo" (leve e emocionante) ou "Chef" (gostoso de assistir com café). Qual clima você tá curtindo mais hoje: som pra relaxar ou história pra prender atenção?',
          'Bora escolher um combo! Na música, Liniker ou Jungle dão uma energia ótima; e em filme/série, "A Vida Secreta de Walter Mitty" é lindo e leve, enquanto "Ruptura" (Severance) prende do começo ao fim. Tá mais no clima de música ou de tela hoje?'
        ])
      };
    }

    if (hasMusic) {
      state.memory.lastTopic = 'music';
      return {
        text: pickFreshVariant('music', [
          'Adoro falar de música! Se quiser uma vibe leve pra acompanhar o dia, curto muito indicar um lo-fi brasileiro, MPB acústica tipo Tim Bernardes/Liniker, ou um jazz suave. Qual estilo combina mais com o seu humor hoje?',
          'Música boa salva qualquer humor! Hoje você tá mais na pegada de descobrir algo novo ou prefere revisitar aquelas faixas clássicas que você sabe cantar de olhos fechados?'
        ])
      };
    }

    if (/\b(filme|filmes|serie|series|cinema|netflix|anime|documentario|assistir|livro|livros|ler|leitura)\b/.test(norm)) {
      state.memory.lastTopic = 'entertainment';
      if (/\b(livro|livros|ler|leitura)\b/.test(norm)) {
        return {
          text: pickFreshVariant('books', [
            'Ler é bom demais! Se você curtir algo envolvente e leve, "A Biblioteca da Meia-Noite" ou crônicas do Luis Fernando Verissimo funcionam super bem. Você costuma ler mais ficção ou não-ficção?',
            'Que hábito bom! Qual foi o último livro que te prendeu tanto que você nem viu a hora passar?'
          ])
        };
      }
      return {
        text: pickFreshVariant('movies', [
          'Pra filme ou série, depende muito da energia do momento! Se quiser algo leve e bonito, "Questão de Tempo" ou "Chef" são abraços em forma de filme; se quiser algo inteligente pra prender atenção, "Ruptura" (Severance) é incrível. Você prefere comédia, drama ou suspense hoje?',
          'Boa pedida! Hoje você tá querendo desligar a cabeça com algo divertido ou mergulhar numa história cheia de mistério?'
        ])
      };
    }

    if (/\b(cansado|cansada|exausto|exausta|sono|corrido|correria|estresse|estressado|triste|ansioso|ansiosa|desabafo|dificil|pesado|desanimado|feliz|animado|animada|otimo|otima)\b/.test(norm)) {
      state.memory.lastTopic = 'mood';
      if (/\b(feliz|animado|animada|otimo|otima)\b/.test(norm)) {
        return {
          text: pickFreshVariant('mood-good', [
            'Que coisa boa ler isso! Dá até pra sentir a energia boa daqui. O que deixou o seu dia tão legal assim?',
            'Aí sim! Momento bom merece ser comemorado. Quer dividir o motivo dessa animação?'
          ])
        };
      }
      return {
        text: pickFreshVariant('mood-support', [
          'Puxa, sinto muito que o peso esteja grande aí... Às vezes a gente só precisa respirar fundo e não se cobrar de resolver tudo numa tarde só. Se quiser desabafar sobre o que tá pegando, tô aqui pra te ouvir sem julgamento.',
          'Tem dias que sugam mesmo a bateria da gente. Se puder, dá uma pausa de cinco minutinhos longe das telas, toma uma água e respira. Quer me contar o que deixou o dia tão puxado?'
        ])
      };
    }

    if (/\b(viagem|viajar|praia|bahia|porto seguro|trancoso|ferias|mar|sol|chuva|trilha|natureza)\b/.test(norm)) {
      state.memory.lastTopic = 'travel';
      return {
        text: pickFreshVariant('travel', [
          'Só de imaginar brisa do mar ou pé na areia já dá uma acalmada boa, né? Você é mais de praia tranquila, serra fria ou cidade cheia de cultura pra explorar?',
          'Viajar renova a alma! Tem algum lugar que você já visitou e moraria fácil, ou um destino que ainda tá no topo da sua lista?'
        ])
      };
    }

    if (/\b(curiosidade|aleatoria|aleatorio|duvida|piada|engracado|tedio|entediado|entediada|universo|espaco|bicho|animal)\b/.test(norm)) {
      state.memory.lastTopic = 'curiosity';
      return {
        text: pickFreshVariant('curiosity', [
          'Olha uma curiosidade aleatória deliciosa: os polvos têm três corações e sangue azul — e quando nadam, um dos corações simplesmente para de bater! Quer outra curiosidade maluca ou tem uma pergunta específica rondando sua cabeça?',
          'Sabia que o cheiro de terra molhada depois da chuva tem até nome? Chama-se "petricor", e nosso olfato é tão sensível a ele quanto o de um tubarão ao sangue no mar! Manda qualquer dúvida aleatória aí que a gente explora junto.',
          'Vai uma curiosidade espacial: em Vênus, um dia (uma rotação inteira dele) dura mais tempo que um ano inteiro dando a volta no Sol! E aí, qual assunto aleatório te deu curiosidade agora?'
        ])
      };
    }

    if (/\b(estudo|estudar|aprender|faculdade|prova|rotina|organizar|foco|produtividade|codigo|programacao|python|javascript|tecnologia|ia|inteligencia artificial)\b/.test(norm)) {
      state.memory.lastTopic = 'study';
      return {
        text: pickFreshVariant('study', [
          'Curto muito esse assunto! Quando a cabeça tá cheia de coisas pra estudar ou organizar, quebrar em blocos curtos de 25 minutos ajuda demais a tirar a inércia. O que você tá aprendendo ou tentando destravar agora?',
          'Que bacana! É uma área cheia de coisa legal pra explorar. Você tá curtindo o processo ou empacou em alguma parte chata que quer trocar ideia pra clarear?'
        ])
      };
    }

    if (/\b(quem e voce|quem e vc|seu nome|voce e humano|voce e robo|como funciona)\b/.test(norm)) {
      state.memory.lastTopic = 'identity';
      return {
        text: pickFreshVariant('identity', [
          'Sou a I.Amigo — uma I.A feita pra conversar de um jeito leve, humano e sem firula! Posso papear sobre seu dia, indicar filmes, tirar dúvidas aleatórias ou só fazer companhia.',
          'Eu sou a I.Amigo, sua companheira de papo por aqui! Gosto de conversar sobre qualquer coisa mesmo — desde café e música até ideias mirabolantes.'
        ])
      };
    }

    if (/\b(obrigado|obrigada|valeu|brigado|brigada|tchau|ate mais|ate logo)\b/.test(norm)) {
      state.memory.lastTopic = 'bye';
      return {
        text: pickFreshVariant('bye', [
          'Imagina! Sempre que quiser bater um papo leve ou só distrair a cabeça um pouco, tô bem aqui.',
          'Por nada! Foi ótimo conversar com você. Volta quando quiser pra gente continuar a prosa!'
        ])
      };
    }

    if (norm.length <= 28 && /\b(e voce|e vc|mais uma|outra|outro|conta mais|sim|claro|pode ser|quero)\b/.test(norm)) {
      if (state.memory.lastTopic === 'curiosity') {
        return {
          text: pickFreshVariant('curiosity-more', [
            'Mais uma então: as lontras marinhas dormem de mãos dadas na água pra correnteza não separar uma da outra!',
            'Lá vai outra: as bananas são tecnicamente bagas na botânica, enquanto os morangos não são! A natureza adora confundir a gente.'
          ])
        };
      }
      if (state.memory.lastTopic === 'music') {
        return {
          text: pickFreshVariant('music-more', [
            'Se quiser uma indicação certeira pra agora: tenta colocar o álbum "Acústico MTV" de alguma banda que você curte ou "Bossa Nova" instrumental — cria um clima super gostoso na hora!',
            'Outra boa: monta uma fila curtinha só com 5 músicas que te dão saudade boa. Nunca falha!'
          ])
        };
      }
    }

    state.memory.lastTopic = 'general';
    return {
      text: pickFreshVariant('general', [
        'Gostei de você trazer isso! Me conta um pouco mais do que te fez pensar nisso agora — tô curiosa pra saber seu ponto de vista.',
        'Olha, papo bom é assim mesmo, vai puxando outro! Como você tá se sentindo em relação a isso?',
        'Interessante! Se você pudesse escolher qualquer rumo pra essa história hoje, pra onde ela iria?',
        'Tô te acompanhando! Quer aprofundar mais nisso ou prefere mudar de assunto e falar de alguma coisa leve?'
      ])
    };
  }

  function generateLocalReply(userText) {
    var norm = normalizeText(userText);
    if (state.lang === 'en') {
      if (looksLikePortuguese(userText)) {
        state.memory.lastTopic = 'english-coach';
        return {
          text: pickFreshVariant('en-pt-coach', [
            'Opa! I noticed you wrote in Portuguese! In **EN** mode, I am tuned to chat **100% in English** with you.\n\nIf you prefer Portuguese, you can switch the whole page back to **PT** below. Or, if you want to **practice English together right now**, try this easy starter phrase: *"Hi I.Amigo! My day is going great — how about yours?"*',
            'Hey! Looks like you wrote in Portuguese! In **EN** mode, I\'m your dedicated English-speaking buddy.\n\nYou can switch the page to **PT** anytime using the button below, or stay here to **practice English**! Try saying: *"I\'m doing well today! Let\'s talk about music or coffee."* Ready when you are!'
          ]),
          includeLangCoachActions: true
        };
      }
      return generateLocalReplyEn(userText, norm);
    }

    if (/\b(how was your day|recommend a song|random curiosity|bring a project idea)\b/.test(norm)) {
      return generateLocalReplyEn(userText, norm);
    }
    return generateLocalReplyPt(userText, norm);
  }

  function autoResizeInput() {
    chatInputEl.style.height = 'auto';
    var nextHeight = Math.min(chatInputEl.scrollHeight, 120);
    chatInputEl.style.height = nextHeight + 'px';
  }

  function updateSendButtonState() {
    var hasText = chatInputEl.value.trim().length > 0;
    sendBtnEl.disabled = !hasText || state.isBusy;
  }

  function scrollToBottom() {
    var apply = function () {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    };
    apply();
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(function () {
        apply();
        window.setTimeout(apply, 60);
      });
    }
  }

  function appendInlineMarkdown(targetEl, rawText) {
    var tokenRe = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
    var lastIdx = 0;
    var match;
    while ((match = tokenRe.exec(rawText)) !== null) {
      if (match.index > lastIdx) {
        targetEl.appendChild(document.createTextNode(rawText.slice(lastIdx, match.index)));
      }
      var token = match[0];
      if (token.slice(0, 2) === '**' && token.slice(-2) === '**') {
        var strong = document.createElement('strong');
        strong.textContent = token.slice(2, -2);
        targetEl.appendChild(strong);
      } else {
        var em = document.createElement('em');
        em.textContent = token.slice(1, -1);
        targetEl.appendChild(em);
      }
      lastIdx = match.index + token.length;
    }
    if (lastIdx < rawText.length) {
      targetEl.appendChild(document.createTextNode(rawText.slice(lastIdx)));
    }
  }

  function appendFormattedParagraph(targetEl, block) {
    var lines = String(block || '').split(/\n/);
    lines.forEach(function (line, idx) {
      if (idx > 0) {
        targetEl.appendChild(document.createElement('br'));
      }
      appendInlineMarkdown(targetEl, line);
    });
  }

  function cleanRepeatedGreeting(replyText) {
    var cleaned = String(replyText || '').trim();
    cleaned = cleaned.replace(/^(?:Sou I\.Amigo,\s*sua I\.A Amiga\s*:?\)?\.?\s*(?:Vamos conversar sobre o que hoje\?!)?\s*)/i, '');
    cleaned = cleaned.replace(/^(?:I['’]m I\.Amigo,\s*your friendly A\.I\s*:?\)?\.?\s*(?:What should we talk about today\?!)?\s*)/i, '');
    return cleaned.trim() || String(replyText || '').trim();
  }

  function createMessageBubble(role, text, options) {
    var opts = options || {};
    var t = getCopy(state.lang);

    var row = document.createElement('article');
    row.className = 'iamigo-msg iamigo-msg--' + role;
    if (opts.isInitial) {
      row.setAttribute('data-initial', 'true');
    }

    if (role === 'assistant') {
      var avatar = document.createElement('span');
      avatar.className = 'iamigo-msg-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      row.appendChild(avatar);
    }

    var bubble = document.createElement('div');
    bubble.className = 'iamigo-bubble';

    if (role === 'assistant' && opts.fallbackNote) {
      var note = document.createElement('p');
      note.className = 'iamigo-fallback-note';
      note.textContent = opts.fallbackNote;
      bubble.appendChild(note);
    }

    var paragraphs = String(text || '').split(/\n{2,}/).filter(Boolean);
    if (paragraphs.length === 0) {
      var p = document.createElement('p');
      appendFormattedParagraph(p, text);
      bubble.appendChild(p);
    } else {
      paragraphs.forEach(function (block) {
        var p = document.createElement('p');
        appendFormattedParagraph(p, block.trim());
        bubble.appendChild(p);
      });
    }

    if (role === 'assistant' && opts.includeContactLink) {
      var linkWrap = document.createElement('div');
      linkWrap.className = 'iamigo-subtle-link-wrap';

      var link = document.createElement('a');
      link.className = 'iamigo-subtle-link';
      link.href = CONTACT_URL;
      link.setAttribute('data-barba-prevent', '');
      link.setAttribute('data-ia-contact-cta', 'true');
      link.textContent = t.ia_contact_cta;

      linkWrap.appendChild(link);
      bubble.appendChild(linkWrap);
    }

    if (role === 'assistant' && opts.includeLangCoachActions && state.lang === 'en') {
      var actionsWrap = document.createElement('div');
      actionsWrap.className = 'iamigo-bubble-actions';

      var switchPtBtn = document.createElement('button');
      switchPtBtn.type = 'button';
      switchPtBtn.className = 'iamigo-subtle-link iamigo-action-switch-pt';
      switchPtBtn.textContent = 'Mudar para Português (PT)';
      switchPtBtn.addEventListener('click', function () {
        if (typeof window.portfolioSetLanguage === 'function') {
          window.portfolioSetLanguage('pt');
        } else {
          var ptBtn = document.querySelector('.nav-bar .lang-switch .btn-pt');
          if (ptBtn) ptBtn.click();
        }
      });

      var practiceEnBtn = document.createElement('button');
      practiceEnBtn.type = 'button';
      practiceEnBtn.className = 'iamigo-subtle-link iamigo-action-practice-en';
      practiceEnBtn.textContent = 'Praticar Inglês aqui! / Practice English';
      practiceEnBtn.addEventListener('click', function () {
        if (state.isBusy) return;
        handleSendMessage("Awesome! Let's practice English together. Can you teach me a cool everyday phrase?");
      });

      actionsWrap.appendChild(switchPtBtn);
      actionsWrap.appendChild(practiceEnBtn);
      bubble.appendChild(actionsWrap);
    }

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
    return row;
  }

  function createTypingIndicator() {
    var t = getCopy(state.lang);
    var row = document.createElement('div');
    row.className = 'iamigo-msg iamigo-msg--assistant iamigo-msg--typing';
    row.setAttribute('data-typing', 'true');
    row.setAttribute('aria-label', t.ia_typing_label);

    var avatar = document.createElement('span');
    avatar.className = 'iamigo-msg-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    row.appendChild(avatar);

    var bubble = document.createElement('div');
    bubble.className = 'iamigo-bubble';

    var dots = document.createElement('div');
    dots.className = 'iamigo-typing';
    dots.innerHTML =
      '<span class="iamigo-typing-dot"></span>' +
      '<span class="iamigo-typing-dot"></span>' +
      '<span class="iamigo-typing-dot"></span>';

    bubble.appendChild(dots);
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
    return row;
  }

  function setChipsVisible(visible) {
    if (!quickChipsEl) return;
    quickChipsEl.hidden = !visible;
  }

  function requestWorkerReply(history) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 26000);

    var payload = {
      lang: state.lang === 'en' ? 'en' : 'pt',
      messages: history.slice(-16).map(function (msg) {
        return {
          role: msg.role,
          content: msg.content
        };
      })
    };

    return fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        window.clearTimeout(timeoutId);
        if (response.status === 429) {
          return { ok: false, reason: 'rate-limit' };
        }
        return response.json().catch(function () { return null; }).then(function (data) {
          if (data && data.rateLimited) {
            return { ok: false, reason: 'rate-limit' };
          }
          if (!response.ok || !data || typeof data.reply !== 'string' || !data.reply.trim()) {
            return { ok: false, reason: 'offline' };
          }
          return {
            ok: true,
            text: cleanRepeatedGreeting(data.reply)
          };
        });
      })
      .catch(function () {
        window.clearTimeout(timeoutId);
        return { ok: false, reason: 'offline' };
      });
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  async function handleSendMessage(rawText) {
    var text = String(rawText || '').trim();
    if (!text || state.isBusy) return;

    state.isBusy = true;
    if (!state.hasUserInteracted) {
      state.hasUserInteracted = true;
      setChipsVisible(false);
    }

    chatInputEl.value = '';
    autoResizeInput();
    updateSendButtonState();

    state.messages.push({ role: 'user', content: text });
    createMessageBubble('user', text);

    var activeLang = state.lang === 'en' ? 'en' : 'pt';
    var showLangCoachActions = activeLang === 'en' && looksLikePortuguese(text);

    var typingNode = createTypingIndicator();
    var result = await requestWorkerReply(state.messages);

    var replyObj = null;
    var fallbackNote = '';
    var t = getCopy(state.lang);

    if (result && result.ok) {
      state.connectionMode = 'online';
      updateModeBadge();
      replyObj = {
        text: result.text,
        includeContactLink: false,
        includeLangCoachActions: showLangCoachActions
      };
    } else if (result && result.reason === 'rate-limit') {
      state.connectionMode = 'rest';
      updateModeBadge();
      replyObj = {
        text: t.ia_sleepy_reply,
        includeContactLink: false,
        includeLangCoachActions: showLangCoachActions
      };
    } else {
      state.connectionMode = 'local';
      updateModeBadge();
      var simulatedWait = 420 + Math.floor(Math.random() * 180);
      await delay(simulatedWait);
      replyObj = generateLocalReply(text);
    }

    typingNode.remove();

    state.messages.push({ role: 'assistant', content: replyObj.text });
    createMessageBubble('assistant', replyObj.text, {
      includeContactLink: Boolean(replyObj.includeContactLink),
      includeLangCoachActions: Boolean(replyObj.includeLangCoachActions || showLangCoachActions),
      fallbackNote: fallbackNote
    });

    state.isBusy = false;
    updateSendButtonState();
    chatInputEl.focus({ preventScroll: true });
  }

  function resetConversation() {
    var t = getCopy(state.lang);
    state.connectionMode = 'online';
    state.messages = [
      { role: 'assistant', content: t.ia_greeting, isInitial: true }
    ];
    state.isBusy = false;
    state.hasUserInteracted = false;
    state.memory = {
      userName: null,
      lastTopic: null,
      usedReplyIds: [],
      projectLinkShown: false
    };

    messagesEl.innerHTML = '';
    createMessageBubble('assistant', t.ia_greeting, { isInitial: true });
    setChipsVisible(true);
    updateModeBadge();
    chatInputEl.value = '';
    autoResizeInput();
    updateSendButtonState();
    chatInputEl.focus({ preventScroll: true });
  }

  function bindEvents() {
    chatInputEl.addEventListener('input', function () {
      autoResizeInput();
      updateSendButtonState();
    });

    chatInputEl.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        if (!sendBtnEl.disabled) {
          handleSendMessage(chatInputEl.value);
        }
      }
    });

    chatFormEl.addEventListener('submit', function (event) {
      event.preventDefault();
      handleSendMessage(chatInputEl.value);
    });

    if (quickChipsEl) {
      quickChipsEl.addEventListener('click', function (event) {
        var chip = event.target.closest('.iamigo-chip');
        if (!chip) return;
        var prompt = chip.getAttribute('data-prompt') || chip.textContent;
        handleSendMessage(prompt);
      });
    }

    newChatBtnEl.addEventListener('click', resetConversation);

    // Prevent Locomotive Scroll from hijacking vertical scroll inside the chat log when scrollable
    messagesEl.addEventListener('wheel', function (event) {
      if (messagesEl.scrollHeight > messagesEl.clientHeight + 2) {
        event.stopPropagation();
      }
    }, { passive: true });

    messagesEl.addEventListener('touchmove', function (event) {
      if (messagesEl.scrollHeight > messagesEl.clientHeight + 2) {
        event.stopPropagation();
      }
    }, { passive: true });

    window.addEventListener('portfolio:langchange', function (event) {
      var nextLang = event && event.detail && event.detail.lang ? event.detail.lang : resolveLang();
      syncLanguageUI(nextLang);
    });
  }

  function init() {
    var t = getCopy(state.lang);
    state.messages = [
      { role: 'assistant', content: t.ia_greeting, isInitial: true }
    ];
    syncLanguageUI(state.lang);
    bindEvents();
    updateSendButtonState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
