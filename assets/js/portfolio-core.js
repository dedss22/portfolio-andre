/* ==========================================================================
   Portfolio Core — André Carvalho
   Unified i18n (PT | EN), BRT Clock, InteractiveFluidSphere, Scroll Rescue,
   Preloader Fallback, FormSubmit AJAX Handler & Adaptive WhatsApp Button
   ========================================================================== */
(function () {
  'use strict';

  if (window.__portfolioCoreInit) return;
  window.__portfolioCoreInit = true;

  /**
   * Número público oficial de WhatsApp (DDI+DDD+número, apenas dígitos).
   */
  const WHATSAPP_NUMBER = '5531984996219';

  const STORAGE_KEY = 'portfolio_lang';
  let currentLang = 'pt';
  let clockIntervalId = null;

  const PAGE_TITLES = {
    home: {
      pt: 'André Carvalho • Desenvolvedor Web & Otimizador de Processos',
      en: 'André Carvalho • Web Developer & Process Optimizer'
    },
    work: {
      pt: 'Projetos — André Carvalho',
      en: 'Work — André Carvalho'
    },
    about: {
      pt: 'Sobre — André Carvalho',
      en: 'About — André Carvalho'
    },
    contact: {
      pt: 'Contato — André Carvalho',
      en: 'Contact — André Carvalho'
    },
    cassiano: {
      pt: 'Cassiano Imóveis — Estudo de Caso | André Carvalho',
      en: 'Cassiano Imóveis — Case Study | André Carvalho'
    }
  };

  const DICT = {
    pt: {
      // Common / Navigation / Footer
      code_by: 'Feito por ',
      menu_label: 'Menu',
      nav_home: 'Início',
      nav_work: 'Projetos',
      work: 'Projetos',
      nav_about: 'Sobre',
      about: 'Sobre',
      nav_contact: 'Contato',
      contact: 'Contato',
      nav_success: 'Sucesso',
      nav_archive: 'Arquivo',
      nav_error: 'Erro',
      nav_title: 'Navegação',
      socials_title: 'Redes Sociais',
      contact_socials_title: 'Redes Sociais',
      about_me: 'Sobre mim',
      get_in_touch: 'Entrar em contato',
      lets_work: 'Vamos trabalhar',
      together: 'juntos',
      local_time: 'Horário local',
      version_title: 'Versão',
      version_edition: '2026 © Edição',
      located_l1: 'Localizado',
      located_l2: 'no Brasil',
      footer_location: 'Porto Seguro, BA • Brasil',

      // Index
      hero_role_1: 'Desenvolvedor Web',
      hero_role_2: '& Otimizador de Processos',
      intro_title: 'Potencializando empresas com plataformas web ultrarrápidas em Astro e automações inteligentes em Python. Zero gargalos, código limpo e arquitetura de alta performance.',
      intro_desc: 'A união entre desenvolvimento moderno e otimização operacional me coloca em uma posição estratégica: crio experiências digitais fluidas enquanto elimino ineficiências nos bastidores.',
      recent_work: 'Projetos Recentes',
      cassiano_subtitle_home: 'Desenvolvimento Web & Astro 4 • Trancoso / Porto Seguro',
      view_project: 'Ver projeto',
      view_all_work: 'Ver todos os projetos',
      view_all_projects: 'Ver todos os projetos',

      // Work
      work_hero_1: 'Criando plataformas web',
      work_hero_2: 'de alta performance & automações',
      filter_all: 'Todos',
      filter_design: 'Design',
      filter_dev: 'Desenvolvimento',
      table_client: 'Cliente',
      table_location: 'Localização',
      table_services: 'Serviços',
      table_year: 'Ano',
      cassiano_location: 'Brasil (Porto Seguro / Trancoso, BA)',
      cassiano_services: 'Desenvolvimento Web & Astro 4',

      // About
      about_hero_1: 'Otimizando operações',
      about_hero_2: '& desenvolvendo plataformas web modernas',
      about_bio_main: 'Ajudo empresas a acelerarem seus resultados através de plataformas web modernas, ultrarrápidas e arquiteturas escaláveis em Astro, combinadas com automações inteligentes em Python. Cada projeto é desenvolvido com foco cirúrgico em performance, código limpo e eliminação de gargalos operacionais.',
      about_bio_sub: 'Sempre em evolução nos bastidores.',
      about_services_title: 'Como posso ajudar',
      service_1_title: 'Desenvolvimento Web Moderno',
      service_1_desc: 'Criação de sites e portais de alta conversão construídos em Astro 4, Tailwind CSS e JavaScript moderno. Arquitetura componentizada, SEO técnico impecável e tempo de carregamento ultrarrápido.',
      service_2_title: 'Automações & Processos',
      service_2_desc: 'Otimização de fluxos operacionais e rotinas de negócios com Python e integrações de dados. Eliminação de tarefas manuais repetitivas, estruturação de pipelines de mídia e esteiras operacionais eficientes na Paralelo 17.',
      service_3_title: 'Solução Completa',
      service_3_desc: 'Do conceito e arquitetura até a implementação e deploy contínuo. A união entre engenharia front-end de ponta e automação de bastidores para entregar produtos digitais consistentes e robustos.',
      about_track_title: 'Engenharia de Precisão<br>& Mentalidade de Produto',
      about_track_desc: 'Atuação contínua em projetos de alta demanda, estruturação de soluções digitais corporativas e desenvolvimento de ecossistemas web de alta fidelidade. Foco inegociável em métricas reais, estabilidade técnica e código feito para escalar.',
      about_img_alt: 'André Carvalho — Desenvolvedor Web & Otimizador de Processos',

      // Contact
      contact_hero_1: 'Vamos iniciar',
      contact_hero_2: 'um projeto juntos',
      contact_label_name: 'Qual é o seu nome?',
      contact_label_email: 'Qual é o seu e-mail?',
      contact_label_org: 'Qual é a sua empresa ou organização?',
      contact_label_services: 'Quais serviços você procura?',
      contact_label_message: 'Sua mensagem',
      contact_btn_send: 'Enviar mensagem',
      contact_details_title: 'Detalhes de Contato',
      contact_business_title: 'Dados Profissionais',
      biz_role: 'Desenvolvedor Web & Otimizador de Processos',
      biz_location: 'Porto Seguro / Trancoso, BA • Brasil',
      ph_name: 'João Silva *',
      ph_email: 'joao@empresa.com *',
      ph_company: 'Empresa Ltda ®',
      ph_service: 'Web Design, Desenvolvimento Astro, Automações...',
      ph_message: 'Olá André, preciso de ajuda com ... *',

      // Case Study: Cassiano Imóveis
      case_back_work: 'Voltar para Projetos',
      case_eyebrow: 'Estudo de Caso • 2024',
      case_hero_lead: 'Plataforma web imobiliária desenvolvida para apresentar propriedades em Trancoso e Porto Seguro (BA), unindo geração estática com Astro 4 SSG, modelagem e migrações no Supabase e scripts de dados em Python.',
      meta_client_label: 'Cliente / Localização',
      meta_services_label: 'Serviços',
      meta_services_value: 'Desenvolvimento Web & Astro SSG',
      meta_stack_label: 'Stack',
      meta_year_label: 'Ano',
      overview_label: '01 • Visão Geral & Desafio',
      overview_title: 'Vitrine imobiliária leve com base de dados estruturada',
      overview_p1: 'A atuação no mercado imobiliário de Trancoso e Porto Seguro (BA) demanda uma presença digital clara, confiável e responsiva, permitindo que compradores e investidores explorem imóveis da região sem lentidão ou interfaces carregadas.',
      overview_p2: 'O desafio central do projeto foi combinar a entrega estática enxuta do Astro SSG com uma camada de dados organizada no Supabase e rotinas de tratamento em Python — garantindo consistência cadastral entre localidades, categorias e mídias dos imóveis sem depender de arquiteturas pesadas em tempo de execução.',
      pill_location: 'Trancoso / Porto Seguro, BA',
      arch_label: '02 • Arquitetura Técnica',
      arch_title: 'SSG em Astro, Supabase e scripts Python em sintonia',
      arch_intro: 'A solução foi estruturada em três camadas complementares para separar com clareza a preparação dos dados imobiliários, o armazenamento relacional e a geração das páginas estáticas.',
      arch_c1_title: 'Astro 4 & Geração Estática',
      arch_c1_desc: 'Construção de templates modulares e componentes reutilizáveis em Astro 4 no modelo Static Site Generation (SSG). O build gera HTML semântico e leve, enviando JavaScript ao navegador apenas para interações pontuais e mantendo foco em SEO técnico.',
      arch_c2_title: 'Integrações & Migrações Supabase',
      arch_c2_desc: 'Modelagem relacional no Supabase acompanhada de migrações versionadas para estruturar imóveis, localidades de Trancoso e Porto Seguro, tipologias e referências de mídia, oferecendo rastreabilidade na evolução do banco de dados.',
      arch_c3_title: 'Scripts Python de Dados Imobiliários',
      arch_c3_desc: 'Scripts em Python responsáveis por higienização, padronização de campos e preparação do pipeline de dados imobiliários antes da sincronização com o Supabase e da geração das páginas no Astro.',
      flow_title: 'Fluxo de Pipeline & Publicação',
      flow_s1_title: '1. Scripts Python',
      flow_s1_desc: 'Padronização, validação e tratamento dos registros imobiliários.',
      flow_s2_title: '2. Supabase',
      flow_s2_desc: 'Esquema relacional e migrações controladas para catálogo e mídias.',
      flow_s3_title: '3. Astro 4 SSG',
      flow_s3_desc: 'Consumo estruturado dos dados e geração das páginas estáticas.',
      flow_s4_title: '4. Entrega Web',
      flow_s4_desc: 'Páginas leves e responsivas para desktop e mobile em produção.',
      cta_label: '03 • Próximo Passo',
      cta_title: 'Precisa de uma plataforma rápida e sob medida?',
      cta_desc: 'Se você busca unir desenvolvimento web em Astro com integrações de dados e automações em Python, vamos conversar sobre o seu próximo projeto.',
      cta_btn_start: 'Iniciar um projeto',
      cta_btn_work: 'Ver todos os projetos',

      // Adaptive WhatsApp Button
      wa_aria: 'Conversar pelo WhatsApp',
      wa_title: 'Falar no WhatsApp',
      wa_prefill: 'Olá André! Vi seu portfólio e gostaria de conversar sobre um projeto.'
    },
    en: {
      // Common / Navigation / Footer
      code_by: 'Code by ',
      menu_label: 'Menu',
      nav_home: 'Home',
      nav_work: 'Work',
      work: 'Work',
      nav_about: 'About',
      about: 'About',
      nav_contact: 'Contact',
      contact: 'Contact',
      nav_success: 'Success',
      nav_archive: 'Archive',
      nav_error: 'Error',
      nav_title: 'Navigation',
      socials_title: 'Socials',
      contact_socials_title: 'Socials',
      about_me: 'About me',
      get_in_touch: 'Get in touch',
      lets_work: 'Let’s work',
      together: 'together',
      local_time: 'Local time',
      version_title: 'Version',
      version_edition: '2026 © Edition',
      located_l1: 'Located',
      located_l2: 'in Brazil',
      footer_location: 'Porto Seguro, BA • Brazil',

      // Index
      hero_role_1: 'Web Developer',
      hero_role_2: '& Process Optimizer',
      intro_title: 'Empowering modern businesses with ultra-fast web platforms in Astro and intelligent Python automations. Zero bloat, clean code, and peak operational performance.',
      intro_desc: 'The intersection of cutting-edge frontend engineering and backend automation positions me uniquely: crafting fluid digital experiences while eliminating operational bottlenecks.',
      recent_work: 'Recent Work',
      cassiano_subtitle_home: 'Web Development & Astro 4 • Trancoso / Porto Seguro',
      view_project: 'View project',
      view_all_work: 'View all work',
      view_all_projects: 'View all work',

      // Work
      work_hero_1: 'Crafting high-performance',
      work_hero_2: 'web platforms & automations',
      filter_all: 'All',
      filter_design: 'Design',
      filter_dev: 'Development',
      table_client: 'Client',
      table_location: 'Location',
      table_services: 'Services',
      table_year: 'Year',
      cassiano_location: 'Brazil (Porto Seguro / Trancoso, BA)',
      cassiano_services: 'Web Development & Astro 4',

      // About
      about_hero_1: 'Optimizing operations',
      about_hero_2: '& building modern web platforms',
      about_bio_main: 'I help businesses accelerate their growth through ultra-fast, modern web platforms and scalable Astro architectures, combined with intelligent Python automations. Every project is built with surgical focus on performance, clean code, and operational efficiency.',
      about_bio_sub: 'Always evolving behind the scenes.',
      about_services_title: 'How I can help',
      service_1_title: 'Modern Web Development',
      service_1_desc: 'High-converting websites and portals built with Astro 4, Tailwind CSS, and modern JavaScript. Component-driven architecture, pristine technical SEO, and blazing-fast loading speeds.',
      service_2_title: 'Automations & Workflows',
      service_2_desc: 'Optimizing operational workflows and business logic using Python and custom API integrations. Eliminating repetitive tasks, structuring media pipelines, and scaling systems at Paralelo 17.',
      service_3_title: 'Full-Cycle Solution',
      service_3_desc: 'From concept and system architecture to production deployment. Combining cutting-edge frontend engineering with backend automation to deliver robust, high-performance digital products.',
      about_track_title: 'Precision Engineering<br>& Product Mindset',
      about_track_desc: 'Continuous track record building high-fidelity digital solutions and robust enterprise architectures. Uncompromising focus on real-world metrics, code reliability, and systems engineered to scale.',
      about_img_alt: 'André Carvalho — Web Developer & Process Optimizer',

      // Contact
      contact_hero_1: 'Let’s start',
      contact_hero_2: 'a project together',
      contact_label_name: "What's your name?",
      contact_label_email: "What's your email?",
      contact_label_org: "What's the name of your organization?",
      contact_label_services: 'What services are you looking for?',
      contact_label_message: 'Your message',
      contact_btn_send: 'Send message',
      contact_details_title: 'Contact Details',
      contact_business_title: 'Business Details',
      biz_role: 'Web Developer & Process Optimizer',
      biz_location: 'Porto Seguro / Trancoso, BA • Brazil',
      ph_name: 'John Doe *',
      ph_email: 'john@doe.com *',
      ph_company: 'John & Doe ®',
      ph_service: 'Web Design, Astro Development, Automations...',
      ph_message: 'Hello André, can you help me with ... *',

      // Case Study: Cassiano Imóveis
      case_back_work: 'Back to Work',
      case_eyebrow: 'Case Study • 2024',
      case_hero_lead: 'Real estate web platform built to showcase properties in Trancoso and Porto Seguro, Bahia, combining Astro 4 Static Site Generation (SSG), Supabase modeling and migrations, and Python data pipelines.',
      meta_client_label: 'Client / Location',
      meta_services_label: 'Services',
      meta_services_value: 'Web Development & Astro SSG',
      meta_stack_label: 'Stack',
      meta_year_label: 'Year',
      overview_label: '01 • Overview & Challenge',
      overview_title: 'Lightweight property showcase backed by structured data',
      overview_p1: 'Operating in the Trancoso and Porto Seguro real estate market requires a clear, trustworthy, and responsive digital presence so buyers and investors can browse regional properties without sluggish or bloated interfaces.',
      overview_p2: 'The core engineering challenge was combining Astro SSG’s lean static delivery with a structured Supabase data layer and Python processing routines—keeping property listings, locations, and media consistent without heavy runtime overhead.',
      pill_location: 'Trancoso / Porto Seguro, BA',
      arch_label: '02 • Technical Architecture',
      arch_title: 'Astro SSG, Supabase, and Python working in sync',
      arch_intro: 'The system was organized into three complementary layers to cleanly separate real estate data preparation, relational storage, and static page generation.',
      arch_c1_title: 'Astro 4 & Static Generation',
      arch_c1_desc: 'Modular templates and reusable components built with Astro 4 Static Site Generation (SSG). The build outputs clean semantic HTML, shipping browser JavaScript only where interactivity is needed while keeping strong technical SEO.',
      arch_c2_title: 'Supabase Modeling & Migrations',
      arch_c2_desc: 'Relational schema design in Supabase backed by versioned migrations to structure properties, Trancoso and Porto Seguro locations, categories, and media references with predictable schema evolution.',
      arch_c3_title: 'Python Real Estate Data Scripts',
      arch_c3_desc: 'Dedicated Python scripts handling data sanitization, field normalization, and real estate pipeline preparation prior to Supabase synchronization and Astro static generation.',
      flow_title: 'Pipeline & Publishing Flow',
      flow_s1_title: '1. Python Scripts',
      flow_s1_desc: 'Normalization, validation, and preparation of property records.',
      flow_s2_title: '2. Supabase',
      flow_s2_desc: 'Relational schema and controlled migrations for listings and media.',
      flow_s3_title: '3. Astro 4 SSG',
      flow_s3_desc: 'Structured data consumption and static page generation.',
      flow_s4_title: '4. Web Delivery',
      flow_s4_desc: 'Lightweight, responsive pages across desktop and mobile.',
      cta_label: '03 • Next Step',
      cta_title: 'Need a fast, tailor-made web platform?',
      cta_desc: 'If you want to pair Astro web development with structured data integrations and Python automation, let’s talk about your next project.',
      cta_btn_start: 'Start a project',
      cta_btn_work: 'View all projects',

      // Adaptive WhatsApp Button
      wa_aria: 'Chat on WhatsApp',
      wa_title: 'Message on WhatsApp',
      wa_prefill: 'Hi André! I saw your portfolio and would like to discuss a project.'
    }
  };

  function getSavedLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'pt';
    } catch (e) {
      return 'pt';
    }
  }

  function detectPageKey() {
    const bodyKey = document.body && document.body.dataset ? document.body.dataset.pageKey : '';
    if (bodyKey && PAGE_TITLES[bodyKey]) return bodyKey;

    const main = document.querySelector('main[data-barba-namespace]');
    const ns = main ? main.getAttribute('data-barba-namespace') : '';
    if (ns && PAGE_TITLES[ns]) return ns;

    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('cassiano-imoveis')) return 'cassiano';
    if (path.includes('work')) return 'work';
    if (path.includes('about')) return 'about';
    if (path.includes('contact')) return 'contact';
    return 'home';
  }

  function normalizeText(str) {
    return (str || '').replace(/\s+/g, ' ').trim();
  }

  /* ------------------------------------------------------------------------
     Unified BRT Clock (no Intl.DateTimeFormat prototype mutation)
     ------------------------------------------------------------------------ */
  function updateBrazilClock() {
    const timeSpan = document.getElementById('timeSpan');
    if (!timeSpan) return;

    try {
      const now = new Date();
      let formatted = '';
      if (currentLang === 'pt') {
        formatted = new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23'
        }).format(now);
      } else {
        formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Sao_Paulo',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(now);
      }
      timeSpan.textContent = formatted + ' BRT';
    } catch (e) {
      // Ignore environments missing ICU timezone data
    }
  }

  function startBrazilClock() {
    updateBrazilClock();
    if (clockIntervalId !== null) {
      clearInterval(clockIntervalId);
    }
    clockIntervalId = setInterval(updateBrazilClock, 1000);
  }

  window.updateBrazilClock = updateBrazilClock;

  /* ------------------------------------------------------------------------
     Bilingual i18n Engine
     ------------------------------------------------------------------------ */
  function updateLanguage(newLang) {
    currentLang = newLang === 'en' ? 'en' : 'pt';
    document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en';

    const pageKey = detectPageKey();
    if (PAGE_TITLES[pageKey] && PAGE_TITLES[pageKey][currentLang]) {
      document.title = PAGE_TITLES[pageKey][currentLang];
    }

    document.querySelectorAll('.lang-btn.btn-pt, .btn-pt').forEach(function (el) {
      el.classList.toggle('active', currentLang === 'pt');
      el.setAttribute('aria-pressed', currentLang === 'pt' ? 'true' : 'false');
    });
    document.querySelectorAll('.lang-btn.btn-en, .btn-en').forEach(function (el) {
      el.classList.toggle('active', currentLang === 'en');
      el.setAttribute('aria-pressed', currentLang === 'en' ? 'true' : 'false');
    });

    const t = DICT[currentLang];
    if (t) {
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        const val = t[key];
        if (val === undefined) return;

        if (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'button')) {
          if (!el.disabled) {
            el.value = val;
          }
          return;
        }

        if (el.classList.contains('span-lines')) {
          const currentPlain = normalizeText(el.textContent);
          const nextPlain = normalizeText(val.replace(/<br\s*\/?>/gi, ' '));
          // Preserve existing .span-line DOM & ScrollTrigger timeline if text already matches
          if (currentPlain === nextPlain && el.querySelector('.span-line')) {
            return;
          }
          if (val.indexOf('<br>') !== -1) {
            el.innerHTML = val;
          } else {
            el.textContent = val;
          }
          if (typeof window.reinitTextSpans === 'function') {
            window.reinitTextSpans(el);
          }
          return;
        }

        if (val.indexOf('<br>') !== -1 || (el.innerHTML && el.innerHTML.indexOf('<br>') !== -1)) {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key] !== undefined) {
          el.placeholder = t[key];
        }
      });

      document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-alt');
        if (t[key] !== undefined) {
          el.alt = t[key];
        }
      });
    }

    try {
      localStorage.setItem(STORAGE_KEY, currentLang);
    } catch (e) {}

    updateBrazilClock();
    syncWhatsAppButtonAttrs();

    if (typeof scroll !== 'undefined' && scroll && typeof scroll.update === 'function') {
      setTimeout(function () {
        if (typeof scroll !== 'undefined' && scroll && typeof scroll.update === 'function') {
          scroll.update();
        }
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 60);
    }
  }

  function syncLoadingWordForHref(href) {
    if (!href) return;
    const lower = href.toLowerCase();
    let targetPage = null;
    if (lower.includes('cassiano-imoveis.html')) targetPage = 'cassiano';
    else if (lower.includes('work.html')) targetPage = 'work';
    else if (lower.includes('about.html')) targetPage = 'about';
    else if (lower.includes('contact.html')) targetPage = 'contact';
    else if (lower.includes('index.html') || lower === '/' || lower.endsWith('/')) targetPage = 'home';

    if (!targetPage) return;

    const loadingWords = document.querySelector('.loading-words');
    if (!loadingWords) return;

    const t = DICT[currentLang] || DICT.pt;
    loadingWords.querySelectorAll('h2:not(.home-active):not(.home-active-last)').forEach(function (h2) {
      if (h2.getAttribute('data-page') === targetPage) {
        h2.classList.add('active');
        const span = h2.querySelector('[data-i18n]');
        if (span) {
          const key = span.getAttribute('data-i18n');
          if (t[key] !== undefined) {
            span.textContent = t[key];
          }
        }
      } else {
        h2.classList.remove('active');
      }
    });
  }

  function observeLoadingWords() {
    const lw = document.querySelector('.loading-words');
    if (!lw || lw._observed) return;
    lw._observed = true;

    const observer = new MutationObserver(function () {
      const t = DICT[currentLang];
      if (!t) return;
      lw.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined && el.textContent !== t[key]) {
          el.textContent = t[key];
        }
      });
    });
    observer.observe(lw, { childList: true, subtree: true });
  }

  function bindLanguageSwitchers() {
    document.querySelectorAll('.lang-switch, .lang-switcher-wrap').forEach(function (switcher) {
      if (switcher._langBound) return;
      switcher._langBound = true;
      switcher.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target.closest('.lang-btn');
        let next = currentLang === 'pt' ? 'en' : 'pt';
        if (target) {
          if (target.classList.contains('btn-pt')) next = 'pt';
          else if (target.classList.contains('btn-en')) next = 'en';
        }
        updateLanguage(next);
      });
    });
  }

  function initLang() {
    updateLanguage(getSavedLang());
    observeLoadingWords();
    bindLanguageSwitchers();
  }

  window.portfolioSetLanguage = updateLanguage;
  window.portfolioGetLanguage = function () { return currentLang; };

  /* ------------------------------------------------------------------------
     Scroll Rescue (respects open nav drawer) & Preloader Safety Fallback
     ------------------------------------------------------------------------ */
  function isNavOpen() {
    const main = document.querySelector('main');
    return !!(main && main.classList.contains('nav-active'));
  }

  function ensureScrollActive() {
    if (isNavOpen()) return;
    if (typeof scroll !== 'undefined' && scroll) {
      if (typeof scroll.start === 'function') scroll.start();
      if (typeof scroll.update === 'function') scroll.update();
    }
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
    bindLocomotiveScrollForWhatsApp();
    scheduleWhatsAppAdaptiveUpdate();
  }

  function schedulePreloaderFallback() {
    setTimeout(function () {
      const lc = document.querySelector('.loading-container');
      if (!lc) return;
      const ls = lc.querySelector('.loading-screen');
      const rect = ls ? ls.getBoundingClientRect() : lc.getBoundingClientRect();
      const stillVisible =
        window.getComputedStyle(lc).display !== 'none' &&
        (typeof gsap === 'undefined' || (rect && rect.bottom > 10));

      if (stillVisible) {
        lc.style.opacity = '0';
        lc.style.pointerEvents = 'none';
        lc.style.transition = 'opacity 0.45s ease';
        document.documentElement.style.cursor = 'auto';
        setTimeout(function () {
          lc.style.display = 'none';
        }, 460);
        ensureScrollActive();
      }
    }, 3200);
  }

  /* ------------------------------------------------------------------------
     Optimized InteractiveFluidSphere (Touch + IntersectionObserver +
     prefers-reduced-motion + idle decay sleep + debounced resize)
     ------------------------------------------------------------------------ */
  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  class InteractiveFluidSphere {
    constructor(container, canvas) {
      this.container = container;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      if (!this.ctx) return;

      this.numPoints = 28;
      this.points = [];
      this.k = 0.038;
      this.d = 0.048;
      this.spread = 0.22;

      this.baseLevel = 0.52;
      this.targetLevel = 0.52;
      this.currentLevel = 0.52;

      this.tilt = 0;
      this.tiltTarget = 0;
      this.tiltVel = 0;

      this.isHovered = false;
      this.isInView = true;
      this.rafId = null;
      this.idleAmp = 1.0;
      this.lastActiveTime = performance.now();
      this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0, speed: 0 };

      this.initSize();
      this.initPoints();
      this.bindEvents();
      this.observeVisibility();

      if (this.prefersReducedMotion()) {
        this.idleAmp = 0;
        this.draw(performance.now());
      } else {
        this.wake();
      }
    }

    prefersReducedMotion() {
      return !!(reducedMotionQuery && reducedMotionQuery.matches);
    }

    initSize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = this.container.offsetWidth || 160;
      this.h = this.container.offsetHeight || 160;
      this.canvas.width = this.w * this.dpr;
      this.canvas.height = this.h * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.radius = this.w / 2;
    }

    initPoints() {
      this.points = [];
      for (let i = 0; i <= this.numPoints; i++) {
        this.points.push({
          x: (i / this.numPoints) * this.w,
          y: this.h * this.baseLevel,
          targetY: this.h * this.baseLevel,
          vel: 0
        });
      }
    }

    handlePointerMove(clientX, clientY) {
      const rect = this.container.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      const vx = mx - this.mouse.prevX;
      const vy = my - this.mouse.prevY;
      const speed = Math.sqrt(vx * vx + vy * vy);

      this.mouse.x = mx;
      this.mouse.y = my;
      this.mouse.prevX = mx;
      this.mouse.prevY = my;
      this.mouse.speed = speed;

      this.tiltTarget = Math.max(-0.45, Math.min(0.45, -vx * 0.028));

      const idx = Math.round((mx / this.w) * this.numPoints);
      if (idx >= 0 && idx <= this.numPoints) {
        const force = Math.min(20, speed * 0.5);
        this.points[idx].vel += (vy > 0 ? force : -force * 0.7);
        if (idx > 0) this.points[idx - 1].vel += force * 0.4;
        if (idx < this.numPoints) this.points[idx + 1].vel += force * 0.4;
      }
      this.wake();
    }

    handlePointerStart(clientX, clientY) {
      this.isHovered = true;
      this.targetLevel = 0.42;
      const rect = this.container.getBoundingClientRect();
      this.mouse.prevX = clientX - rect.left;
      this.mouse.prevY = clientY - rect.top;
      this.mouse.x = this.mouse.prevX;
      this.mouse.y = this.mouse.prevY;
      this.splash(this.mouse.prevX, 22);
      this.wake();
    }

    handlePointerEnd() {
      this.isHovered = false;
      this.targetLevel = this.baseLevel;
      this.tiltTarget = 0;
      this.lastActiveTime = performance.now();
      this.wake();
    }

    bindEvents() {
      this.container.addEventListener('mouseenter', (e) => {
        this.handlePointerStart(e.clientX, e.clientY);
      });

      this.container.addEventListener('mouseleave', () => {
        this.handlePointerEnd();
      });

      this.container.addEventListener('mousemove', (e) => {
        this.handlePointerMove(e.clientX, e.clientY);
      });

      this.container.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length) {
          this.handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      this.container.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length) {
          this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      this.container.addEventListener('touchend', () => {
        this.handlePointerEnd();
      }, { passive: true });

      this.container.addEventListener('touchcancel', () => {
        this.handlePointerEnd();
      }, { passive: true });

      let resizeTimer = null;
      window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.initSize();
          this.initPoints();
          if (this.prefersReducedMotion()) {
            this.draw(performance.now());
          } else {
            this.wake();
          }
        }, 150);
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else if (this.isInView && !this.prefersReducedMotion() && (this.isHovered || this.idleAmp > 0.02)) {
          this.wake();
        }
      });

      if (reducedMotionQuery && typeof reducedMotionQuery.addEventListener === 'function') {
        reducedMotionQuery.addEventListener('change', () => {
          if (this.prefersReducedMotion()) {
            this.stop();
            this.idleAmp = 0;
            this.draw(performance.now());
          } else {
            this.wake();
          }
        });
      }
    }

    observeVisibility() {
      if (typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isInView = entry.isIntersecting;
          if (!this.isInView) {
            this.stop();
          } else if (!this.prefersReducedMotion()) {
            this.wake();
          } else {
            this.draw(performance.now());
          }
        });
      }, { threshold: 0.01 });
      observer.observe(this.container);
    }

    splash(x, strength) {
      const idx = Math.round((x / this.w) * this.numPoints);
      if (idx >= 0 && idx <= this.numPoints) {
        this.points[idx].vel += strength;
      }
    }

    wake() {
      this.idleAmp = 1.0;
      this.lastActiveTime = performance.now();
      if (this.prefersReducedMotion()) {
        this.idleAmp = 0;
        this.draw(performance.now());
        return;
      }
      if (!this.isInView || document.hidden) return;
      if (this.rafId === null) {
        this.rafId = requestAnimationFrame((t) => this.animate(t));
      }
    }

    stop() {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    updatePhysics(time) {
      if (!this.isHovered && time - this.lastActiveTime > 2200) {
        this.idleAmp *= 0.96;
        if (this.idleAmp < 0.015) this.idleAmp = 0;
      } else {
        this.idleAmp = 1.0;
      }

      this.currentLevel += (this.targetLevel - this.currentLevel) * 0.08;
      const baseTargetY = this.h * this.currentLevel;

      const tiltSpring = -0.16 * (this.tilt - this.tiltTarget) - 0.76 * this.tiltVel;
      this.tiltVel += tiltSpring;
      this.tilt += this.tiltVel;

      const cx = this.w / 2;
      for (let i = 0; i <= this.numPoints; i++) {
        const pt = this.points[i];
        const xOffset = pt.x - cx;
        const tiltOffset = xOffset * Math.tan(this.tilt);
        const idleWave = Math.sin(time * 0.003 + i * 0.4) * 3.5 * this.idleAmp;

        pt.targetY = baseTargetY + tiltOffset + idleWave;

        const dy = pt.targetY - pt.y;
        pt.vel += dy * this.k - pt.vel * this.d;
        pt.y += pt.vel;
      }

      const leftDeltas = new Array(this.numPoints + 1).fill(0);
      const rightDeltas = new Array(this.numPoints + 1).fill(0);

      for (let j = 0; j < 4; j++) {
        for (let i = 0; i <= this.numPoints; i++) {
          if (i > 0) {
            leftDeltas[i] = this.spread * (this.points[i].y - this.points[i - 1].y);
            this.points[i - 1].vel += leftDeltas[i];
          }
          if (i < this.numPoints) {
            rightDeltas[i] = this.spread * (this.points[i].y - this.points[i + 1].y);
            this.points[i + 1].vel += rightDeltas[i];
          }
        }
        for (let i = 0; i <= this.numPoints; i++) {
          if (i > 0) this.points[i - 1].y += leftDeltas[i];
          if (i < this.numPoints) this.points[i + 1].y += rightDeltas[i];
        }
      }
    }

    isSettled() {
      if (this.isHovered || this.idleAmp > 0) return false;
      if (Math.abs(this.currentLevel - this.targetLevel) > 0.002) return false;
      if (Math.abs(this.tilt) > 0.002 || Math.abs(this.tiltVel) > 0.002) return false;

      for (let i = 0; i <= this.numPoints; i++) {
        const pt = this.points[i];
        if (Math.abs(pt.vel) > 0.03 || Math.abs(pt.targetY - pt.y) > 0.08) {
          return false;
        }
      }
      return true;
    }

    draw(time) {
      this.ctx.clearRect(0, 0, this.w, this.h);

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.w / 2, this.h / 2, this.radius, 0, Math.PI * 2);
      this.ctx.clip();

      // 1. Deep background wave (Sapphire)
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.h);
      for (let i = 0; i <= this.numPoints; i++) {
        const pt = this.points[i];
        const backOffset = Math.sin(time * 0.0025 + i * 0.35 + 1.5) * 6 * this.idleAmp - 8;
        const backY = pt.y + backOffset;
        if (i === 0) this.ctx.lineTo(pt.x, backY);
        else {
          const prev = this.points[i - 1];
          const prevBackY = prev.y + Math.sin(time * 0.0025 + (i - 1) * 0.35 + 1.5) * 6 * this.idleAmp - 8;
          const midX = (prev.x + pt.x) / 2;
          const midY = (prevBackY + backY) / 2;
          this.ctx.quadraticCurveTo(prev.x, prevBackY, midX, midY);
        }
      }
      this.ctx.lineTo(this.w, this.h);
      this.ctx.closePath();

      const backGrad = this.ctx.createLinearGradient(0, this.h * 0.3, 0, this.h);
      backGrad.addColorStop(0, 'rgba(14, 165, 233, 0.45)');
      backGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.7)');
      backGrad.addColorStop(1, 'rgba(8, 47, 73, 0.95)');
      this.ctx.fillStyle = backGrad;
      this.ctx.fill();

      // 2. Primary front wave
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.h);
      for (let i = 0; i <= this.numPoints; i++) {
        const pt = this.points[i];
        if (i === 0) this.ctx.lineTo(pt.x, pt.y);
        else {
          const prev = this.points[i - 1];
          const midX = (prev.x + pt.x) / 2;
          const midY = (prev.y + pt.y) / 2;
          this.ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
      }
      this.ctx.lineTo(this.w, this.h);
      this.ctx.closePath();

      const frontGrad = this.ctx.createLinearGradient(0, this.h * 0.35, 0, this.h);
      frontGrad.addColorStop(0, '#38BDF8');
      frontGrad.addColorStop(0.4, '#0284C7');
      frontGrad.addColorStop(1, '#071E3D');
      this.ctx.fillStyle = frontGrad;
      this.ctx.fill();

      // 3. Wave highlight crest
      this.ctx.beginPath();
      for (let i = 0; i <= this.numPoints; i++) {
        const pt = this.points[i];
        if (i === 0) this.ctx.moveTo(pt.x, pt.y);
        else {
          const prev = this.points[i - 1];
          const midX = (prev.x + pt.x) / 2;
          const midY = (prev.y + pt.y) / 2;
          this.ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
      }
      this.ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      // 4. Bioluminescent cursor glow
      if (this.isHovered) {
        const glow = this.ctx.createRadialGradient(
          this.mouse.x, this.mouse.y, 0,
          this.mouse.x, this.mouse.y, 70
        );
        glow.addColorStop(0, 'rgba(125, 211, 252, 0.4)');
        glow.addColorStop(0.6, 'rgba(56, 189, 248, 0.15)');
        glow.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glow;
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, 70, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    animate(timestamp) {
      this.rafId = null;
      if (!this.isInView || document.hidden || this.prefersReducedMotion()) {
        return;
      }

      const time = timestamp || performance.now();
      this.updatePhysics(time);
      this.draw(time);

      if (!this.isSettled()) {
        this.rafId = requestAnimationFrame((t) => this.animate(t));
      }
    }
  }

  function initAllFluidSpheres() {
    document.querySelectorAll('.btn-round .btn-click').forEach(function (btn) {
      if (btn._fluidSphere) return;
      let canvas = btn.querySelector('canvas.fluid-canvas');
      if (canvas && canvas._fluidSphere) {
        btn._fluidSphere = canvas._fluidSphere;
        return;
      }
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'fluid-canvas';
        btn.insertBefore(canvas, btn.firstChild);
      }
      const instance = new InteractiveFluidSphere(btn, canvas);
      btn._fluidSphere = instance;
      canvas._fluidSphere = instance;
    });
  }

  /* ------------------------------------------------------------------------
     Contact Form AJAX Handler (FormSubmit + Bilingual Validation + mailto)
     ------------------------------------------------------------------------ */
  const FORM_MESSAGES = {
    pt: {
      sendingBtn: 'Enviando...',
      defaultBtn: 'Enviar mensagem',
      sendingStatus: 'Enviando sua mensagem...',
      requiredError: 'Por favor, preencha os campos obrigatórios:',
      emailError: 'Informe um endereço de e-mail válido.',
      success: 'Mensagem enviada com sucesso! Obrigado pelo contato — responderei em breve.',
      networkError: 'Não foi possível enviar pelo formulário neste momento. Você pode escrever diretamente para',
      fields: {
        name: 'Nome',
        email: 'E-mail',
        company: 'Empresa ou organização',
        service: 'Serviços',
        message: 'Mensagem'
      }
    },
    en: {
      sendingBtn: 'Sending...',
      defaultBtn: 'Send message',
      sendingStatus: 'Sending your message...',
      requiredError: 'Please fill in the required fields:',
      emailError: 'Please enter a valid email address.',
      success: 'Message sent successfully! Thank you for reaching out — I will reply soon.',
      networkError: 'Could not send through the form right now. You can email me directly at',
      fields: {
        name: 'Name',
        email: 'Email',
        company: 'Organization',
        service: 'Services',
        message: 'Message'
      }
    }
  };

  function focusFieldSafely(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch (e) {
      el.focus();
    }
  }

  function showContactStatus(statusEl, type, htmlContent) {
    if (!statusEl) return;
    statusEl.className = 'contact-form-status is-visible is-' + type;
    statusEl.innerHTML = htmlContent;
    if (typeof scroll !== 'undefined' && scroll && typeof scroll.update === 'function') {
      scroll.update();
    }
  }

  function initContactAjaxForm() {
    const form = document.getElementById('contact-form') || document.querySelector('.contact-header form');
    if (!form || form._ajaxBound) return;
    form._ajaxBound = true;

    const statusEl = document.getElementById('contact-form-status') || form.querySelector('.contact-form-status');
    const submitBtn = document.getElementById('contact-submit-btn') || form.querySelector('input[type="submit"], button[type="submit"]');

    form.querySelectorAll('.field').forEach(function (field) {
      field.addEventListener('input', function () {
        const col = field.closest('.form-col');
        if (col) col.classList.remove('has-error');
      });
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const lang = currentLang === 'en' ? 'en' : 'pt';
      const t = FORM_MESSAGES[lang];

      const telInput = document.getElementById('form-tel') || form.querySelector('input[name="tel"]');
      if (telInput && telInput.value.trim() !== '') {
        form.reset();
        showContactStatus(statusEl, 'success', t.success);
        return;
      }

      const nameEl = document.getElementById('form-name') || form.querySelector('[name="name"]');
      const emailEl = document.getElementById('form-email') || form.querySelector('[name="email"]');
      const companyEl = document.getElementById('form-company') || form.querySelector('[name="company"]');
      const serviceEl = document.getElementById('form-service') || form.querySelector('[name="service"]');
      const messageEl = document.getElementById('form-message') || form.querySelector('[name="message"]');

      const entries = [
        { el: nameEl, key: 'name' },
        { el: emailEl, key: 'email' },
        { el: companyEl, key: 'company' },
        { el: serviceEl, key: 'service' },
        { el: messageEl, key: 'message' }
      ];

      const missing = [];
      let firstInvalid = null;

      entries.forEach(function (item) {
        if (!item.el) return;
        const col = item.el.closest('.form-col');
        if (col) col.classList.remove('has-error');
        if (item.el.hasAttribute('required') && item.el.value.trim() === '') {
          missing.push(t.fields[item.key]);
          if (col) col.classList.add('has-error');
          if (!firstInvalid) firstInvalid = item.el;
        }
      });

      const emailVal = emailEl ? emailEl.value.trim() : '';
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

      if (missing.length > 0) {
        showContactStatus(statusEl, 'error', t.requiredError + ' <strong>' + missing.join(', ') + '</strong>.');
        focusFieldSafely(firstInvalid);
        return;
      }

      if (!emailValid) {
        const emailCol = emailEl ? emailEl.closest('.form-col') : null;
        if (emailCol) emailCol.classList.add('has-error');
        showContactStatus(statusEl, 'error', t.emailError);
        focusFieldSafely(emailEl);
        return;
      }

      const payload = {
        name: nameEl ? nameEl.value.trim() : '',
        email: emailVal,
        company: companyEl ? companyEl.value.trim() : '',
        service: serviceEl ? serviceEl.value.trim() : '',
        message: messageEl ? messageEl.value.trim() : '',
        _subject: 'Portfolio Contact - ' + (nameEl ? nameEl.value.trim() : ''),
        _template: 'table'
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.tagName === 'INPUT') submitBtn.value = t.sendingBtn;
        else submitBtn.textContent = t.sendingBtn;
      }
      showContactStatus(statusEl, 'sending', t.sendingStatus);

      try {
        const response = await fetch('https://formsubmit.co/ajax/andrecarvalho2@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(function () { return {}; });
        if (response.ok && (data.success === true || data.success === 'true')) {
          form.reset();
          form.querySelectorAll('.form-col').forEach(function (col) {
            col.classList.remove('not-empty', 'has-error');
          });
          showContactStatus(statusEl, 'success', t.success);
        } else {
          throw new Error(data.message || 'Request failed');
        }
      } catch (err) {
        const mailSubject = encodeURIComponent('Contato Portfólio — ' + payload.name);
        const mailBody = encodeURIComponent(
          'Nome: ' + payload.name + '\n' +
          'E-mail: ' + payload.email + '\n' +
          'Empresa: ' + payload.company + '\n' +
          'Serviços: ' + payload.service + '\n\n' +
          payload.message
        );
        const mailtoHref = 'mailto:andrecarvalho2@gmail.com?subject=' + mailSubject + '&body=' + mailBody;
        showContactStatus(
          statusEl,
          'error',
          t.networkError + ' <a href="' + mailtoHref + '">andrecarvalho2@gmail.com</a>.'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          const doneLabel = FORM_MESSAGES[currentLang === 'en' ? 'en' : 'pt'].defaultBtn;
          if (submitBtn.tagName === 'INPUT') submitBtn.value = doneLabel;
          else submitBtn.textContent = doneLabel;
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     Floating Adaptive WhatsApp Button (Dual-Layer Pixel-Exact Clip Mask)
     ------------------------------------------------------------------------ */
  const WA_SVG_PATH =
    'M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38' +
    'c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01' +
    'A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83' +
    'c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32' +
    'a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24zm-3.53 4.75c-.19 0-.5.07-.76.35' +
    '-.26.29-1 .98-1 2.39s1.02 2.77 1.17 2.96c.14.19 2.01 3.07 4.87 4.3.68.29 1.21.47 1.62.6' +
    '.68.22 1.3.19 1.79.11.55-.08 1.68-.69 1.92-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.19' +
    '-.55-.33-.29-.14-1.68-.83-1.94-.92-.26-.1-.45-.14-.64.14-.19.29-.74.92-.9 1.11-.17.19' +
    '-.33.21-.62.07-.29-.14-1.21-.45-2.31-1.43-.85-.76-1.43-1.7-1.6-1.99-.17-.29-.02-.44.13-.58' +
    '.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11z';

  const DARK_BG_SELECTOR =
    '.theme-dark, .home-header, .hero-navy-section, #about-navy-theme .about-header, ' +
    '#about-navy-theme .about-image, .about-header, .about-image, .line-globe, ' +
    '.about-services, .about-awwwards, .footer, .footer-wrap, .work-navy-section, ' +
    '.case-hero-section, .case-section, .case-cta-section, .dark-section, ' +
    '.contact-header, .fixed-nav, .nav-container';

  let waButtonEl = null;
  let waLayersEl = null;
  let waWhiteLayerEl = null;
  let waLastClipPath = '';
  let waRafId = null;
  let waGlobalHooksBound = false;

  function createWaSvgElement() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('clip-rule', 'evenodd');
    path.setAttribute('d', WA_SVG_PATH);
    svg.appendChild(path);
    return svg;
  }

  function getCleanWhatsAppNumber() {
    return String(WHATSAPP_NUMBER || '').replace(/\D/g, '');
  }

  function syncWhatsAppButtonAttrs() {
    if (!waButtonEl) return;
    const t = DICT[currentLang] || DICT.pt;
    const cleanNum = getCleanWhatsAppNumber();

    waButtonEl.setAttribute('aria-label', t.wa_aria);
    waButtonEl.setAttribute('title', t.wa_title);

    if (cleanNum) {
      const encodedMsg = encodeURIComponent(t.wa_prefill);
      waButtonEl.setAttribute('href', 'https://wa.me/' + cleanNum + '?text=' + encodedMsg);
      waButtonEl.setAttribute('target', '_blank');
      waButtonEl.setAttribute('rel', 'noopener noreferrer');
      waButtonEl.removeAttribute('data-wa-pending');
    } else {
      waButtonEl.setAttribute('href', 'contact.html#whatsapp');
      waButtonEl.setAttribute('data-wa-pending', 'true');
      waButtonEl.removeAttribute('target');
      waButtonEl.removeAttribute('rel');
    }
  }

  function parseRgbaColor(colorStr) {
    if (!colorStr || colorStr === 'transparent') return null;
    const match = colorStr.match(/rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i);
    if (!match) return null;
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: match[4] !== undefined ? Number(match[4]) : 1
    };
  }

  function relativeLuminance(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  function detectGradientDarkness(bgImage) {
    if (!bgImage || bgImage === 'none' || bgImage.indexOf('gradient(') === -1) {
      return null;
    }
    const regex = /rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/gi;
    let match;
    let sumLum = 0;
    let count = 0;
    while ((match = regex.exec(bgImage)) !== null) {
      const a = match[4] !== undefined ? Number(match[4]) : 1;
      if (a >= 0.45) {
        sumLum += relativeLuminance(Number(match[1]), Number(match[2]), Number(match[3]));
        count += 1;
      }
    }
    if (count === 0) return null;
    return (sumLum / count) < 0.35;
  }

  function isIgnoredStackElement(el) {
    if (!el || el.nodeType !== 1) return true;
    if (el.closest('.floating-whatsapp-btn')) return true;
    if (el.closest('.loading-container')) return true;
    if (el.matches('.custom-cursor, .mouse-pos-list-image, .mouse-pos-list-image-bounce, .mouse-pos-list-btn, .mouse-pos-list-span')) {
      return true;
    }
    return false;
  }

  function isViewportPointDark(vx, vy) {
    const maxX = Math.max(0, (window.innerWidth || document.documentElement.clientWidth || 1) - 1);
    const maxY = Math.max(0, (window.innerHeight || document.documentElement.clientHeight || 1) - 1);
    const cx = Math.max(0, Math.min(maxX, vx));
    const cy = Math.max(0, Math.min(maxY, vy));

    const stack = document.elementsFromPoint ? document.elementsFromPoint(cx, cy) : [];
    for (let i = 0; i < stack.length; i++) {
      const el = stack[i];
      if (isIgnoredStackElement(el)) continue;

      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) {
        continue;
      }

      const gradDark = detectGradientDarkness(cs.backgroundImage);
      if (gradDark !== null) {
        return gradDark;
      }

      const bg = parseRgbaColor(cs.backgroundColor);
      if (bg && bg.a >= 0.45) {
        return relativeLuminance(bg.r, bg.g, bg.b) < 0.35;
      }

      if (el.matches && el.matches(DARK_BG_SELECTOR)) {
        return true;
      }
    }

    return false;
  }

  function binarySearchVerticalEdge(vx, yTop, yBottom, topIsDark) {
    let lo = yTop;
    let hi = yBottom;
    for (let iter = 0; iter < 7; iter++) {
      const mid = (lo + hi) * 0.5;
      if (isViewportPointDark(vx, mid) === topIsDark) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return (lo + hi) * 0.5;
  }

  function binarySearchHorizontalEdge(vy, xLeft, xRight, leftIsDark) {
    let lo = xLeft;
    let hi = xRight;
    for (let iter = 0; iter < 7; iter++) {
      const mid = (lo + hi) * 0.5;
      if (isViewportPointDark(mid, vy) === leftIsDark) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return (lo + hi) * 0.5;
  }

  function fmtPx(val) {
    return val.toFixed(1) + 'px';
  }

  function computeAdaptiveClipPath(rect) {
    const w = rect.width;
    const h = rect.height;
    if (w <= 0 || h <= 0) return 'inset(100% 0 0 0)';

    const sampleFracs = [0.02, 0.5, 0.98];
    let allDark = true;
    let allLight = true;

    for (let ix = 0; ix < sampleFracs.length; ix++) {
      const vx = rect.left + sampleFracs[ix] * w;
      for (let iy = 0; iy < sampleFracs.length; iy++) {
        const vy = rect.top + sampleFracs[iy] * h;
        const dark = isViewportPointDark(vx, vy);
        if (dark) allLight = false;
        else allDark = false;
      }
    }

    if (allDark) return 'inset(0px)';
    if (allLight) return 'inset(100% 0 0 0)';

    const cols = [0, 0.25, 0.5, 0.75, 1];
    const colInfo = [];
    let maxTransitions = 0;
    let hasTopDark = false;
    let hasTopLight = false;

    for (let j = 0; j < cols.length; j++) {
      const u = cols[j];
      const localX = u * w;
      const vx = rect.left + Math.min(w - 0.35, Math.max(0.35, localX));
      const steps = 8;
      const flags = [];
      for (let s = 0; s <= steps; s++) {
        const vy = rect.top + Math.min(h - 0.25, Math.max(0.25, (s / steps) * h));
        flags.push(isViewportPointDark(vx, vy));
      }

      const splits = [];
      for (let s = 0; s < steps; s++) {
        if (flags[s] !== flags[s + 1]) {
          const yA = rect.top + (s / steps) * h;
          const yB = rect.top + ((s + 1) / steps) * h;
          const exactY = binarySearchVerticalEdge(vx, yA, yB, flags[s]);
          splits.push(Math.max(0, Math.min(h, exactY - rect.top)));
        }
      }

      if (flags[0]) hasTopDark = true;
      else hasTopLight = true;

      if (splits.length > maxTransitions) maxTransitions = splits.length;
      colInfo.push({
        x: localX,
        topDark: flags[0],
        bottomDark: flags[steps],
        splits: splits
      });
    }

    // Purely vertical split (left vs right) with no vertical transitions in columns
    if (maxTransitions === 0 && hasTopDark && hasTopLight) {
      const rows = [0, 0.25, 0.5, 0.75, 1];
      const leftDark = colInfo[0].topDark;
      const edgePts = [];
      for (let r = 0; r < rows.length; r++) {
        const localY = rows[r] * h;
        const vy = rect.top + Math.min(h - 0.35, Math.max(0.35, localY));
        const exactX = binarySearchHorizontalEdge(vy, rect.left + 0.35, rect.right - 0.35, leftDark);
        edgePts.push({ x: Math.max(0, Math.min(w, exactX - rect.left)), y: localY });
      }
      if (leftDark) {
        const poly = ['0px 0px'];
        for (let i = 0; i < edgePts.length; i++) poly.push(fmtPx(edgePts[i].x) + ' ' + fmtPx(edgePts[i].y));
        poly.push('0px ' + fmtPx(h));
        return 'polygon(' + poly.join(', ') + ')';
      } else {
        const poly = [fmtPx(w) + ' 0px', fmtPx(w) + ' ' + fmtPx(h)];
        for (let i = edgePts.length - 1; i >= 0; i--) poly.push(fmtPx(edgePts[i].x) + ' ' + fmtPx(edgePts[i].y));
        return 'polygon(' + poly.join(', ') + ')';
      }
    }

    // Standard horizontal or curved section boundary (<= 1 transition per column)
    if (maxTransitions <= 1) {
      const topIsDark = colInfo.some(function (c) {
        return c.splits.length === 1 && c.topDark;
      }) || (!colInfo.some(function (c) { return c.splits.length === 1; }) && hasTopDark);

      if (topIsDark) {
        // Dark above boundary -> polygon from top edge down to splitY[j]
        const poly = ['0px 0px', fmtPx(w) + ' 0px'];
        for (let j = colInfo.length - 1; j >= 0; j--) {
          const c = colInfo[j];
          const yVal = c.splits.length === 1 ? c.splits[0] : (c.topDark ? h : 0);
          poly.push(fmtPx(c.x) + ' ' + fmtPx(yVal));
        }
        return 'polygon(' + poly.join(', ') + ')';
      } else {
        // Dark below boundary -> polygon from splitY[j] down to bottom edge
        const poly = [];
        for (let j = 0; j < colInfo.length; j++) {
          const c = colInfo[j];
          const yVal = c.splits.length === 1 ? c.splits[0] : (c.bottomDark ? 0 : h);
          poly.push(fmtPx(c.x) + ' ' + fmtPx(yVal));
        }
        poly.push(fmtPx(w) + ' ' + fmtPx(h));
        poly.push('0px ' + fmtPx(h));
        return 'polygon(' + poly.join(', ') + ')';
      }
    }

    // Band inside button (2 transitions: top & bottom of dark strip)
    const upper = [];
    const lower = [];
    for (let j = 0; j < colInfo.length; j++) {
      const c = colInfo[j];
      if (c.splits.length >= 2 && !c.topDark) {
        upper.push(fmtPx(c.x) + ' ' + fmtPx(c.splits[0]));
        lower.unshift(fmtPx(c.x) + ' ' + fmtPx(c.splits[1]));
      } else if (c.topDark && c.bottomDark) {
        upper.push(fmtPx(c.x) + ' 0px');
        lower.unshift(fmtPx(c.x) + ' ' + fmtPx(h));
      } else {
        const fallbackY = c.splits.length === 1 ? c.splits[0] : (c.topDark ? 0 : h);
        upper.push(fmtPx(c.x) + ' ' + fmtPx(fallbackY));
        lower.unshift(fmtPx(c.x) + ' ' + fmtPx(fallbackY));
      }
    }
    return 'polygon(' + upper.concat(lower).join(', ') + ')';
  }

  function updateWhatsAppAdaptiveState() {
    if (!waButtonEl || !waLayersEl || !waWhiteLayerEl) return;

    const navOpen = isNavOpen();
    waButtonEl.classList.toggle('is-nav-hidden', navOpen);
    waButtonEl.setAttribute('aria-hidden', navOpen ? 'true' : 'false');
    waButtonEl.tabIndex = navOpen ? -1 : 0;

    if (navOpen) return;

    const rect = waLayersEl.getBoundingClientRect();
    const nextClip = computeAdaptiveClipPath(rect);
    if (nextClip !== waLastClipPath) {
      waLastClipPath = nextClip;
      waWhiteLayerEl.style.clipPath = nextClip;
      waWhiteLayerEl.style.webkitClipPath = nextClip;
    }
  }

  function scheduleWhatsAppAdaptiveUpdate() {
    if (waRafId !== null) return;
    waRafId = requestAnimationFrame(function () {
      waRafId = null;
      updateWhatsAppAdaptiveState();
    });
  }

  function bindLocomotiveScrollForWhatsApp() {
    if (typeof scroll !== 'undefined' && scroll && typeof scroll.on === 'function' && !scroll._waScrollBound) {
      scroll._waScrollBound = true;
      scroll.on('scroll', function () {
        if (waRafId !== null) {
          cancelAnimationFrame(waRafId);
          waRafId = null;
        }
        updateWhatsAppAdaptiveState();
      });
    }
  }

  function bindWhatsAppGlobalListeners() {
    if (waGlobalHooksBound) return;
    waGlobalHooksBound = true;

    window.addEventListener('scroll', scheduleWhatsAppAdaptiveUpdate, { passive: true });
    document.addEventListener('scroll', scheduleWhatsAppAdaptiveUpdate, { passive: true, capture: true });
    window.addEventListener('resize', scheduleWhatsAppAdaptiveUpdate, { passive: true });
    window.addEventListener('wheel', function () {
      bindLocomotiveScrollForWhatsApp();
      scheduleWhatsAppAdaptiveUpdate();
    }, { passive: true });
    window.addEventListener('touchmove', function () {
      bindLocomotiveScrollForWhatsApp();
      scheduleWhatsAppAdaptiveUpdate();
    }, { passive: true });

    if (typeof MutationObserver !== 'undefined' && document.body) {
      const observer = new MutationObserver(function (mutations) {
        let shouldUpdate = false;
        for (let i = 0; i < mutations.length; i++) {
          const m = mutations[i];
          if (m.target && m.target.closest && m.target.closest('.floating-whatsapp-btn')) {
            continue;
          }
          shouldUpdate = true;
          break;
        }
        if (shouldUpdate) {
          bindLocomotiveScrollForWhatsApp();
          scheduleWhatsAppAdaptiveUpdate();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
  }

  function initFloatingWhatsApp() {
    const existing = document.getElementById('floating-whatsapp-btn');
    if (existing) {
      waButtonEl = existing;
      waLayersEl = existing.querySelector('.floating-whatsapp-layers');
      waWhiteLayerEl = existing.querySelector('.floating-whatsapp-layer-white');
      syncWhatsAppButtonAttrs();
      bindLocomotiveScrollForWhatsApp();
      scheduleWhatsAppAdaptiveUpdate();
      return;
    }

    if (!document.body) return;

    const btn = document.createElement('a');
    btn.id = 'floating-whatsapp-btn';
    btn.className = 'floating-whatsapp-btn';
    btn.setAttribute('data-barba-prevent', '');

    const layers = document.createElement('span');
    layers.className = 'floating-whatsapp-layers';
    layers.setAttribute('aria-hidden', 'true');

    const navyLayer = document.createElement('span');
    navyLayer.className = 'floating-whatsapp-layer floating-whatsapp-layer-navy';
    navyLayer.appendChild(createWaSvgElement());

    const whiteLayer = document.createElement('span');
    whiteLayer.className = 'floating-whatsapp-layer floating-whatsapp-layer-white';
    whiteLayer.appendChild(createWaSvgElement());

    layers.appendChild(navyLayer);
    layers.appendChild(whiteLayer);
    btn.appendChild(layers);
    document.body.appendChild(btn);

    btn.addEventListener('click', function (e) {
      if (btn.getAttribute('data-wa-pending') === 'true' && detectPageKey() === 'contact') {
        e.preventDefault();
        const nameField = document.getElementById('form-name') || document.querySelector('.contact-header [name="name"]');
        const formEl = document.getElementById('contact-form') || document.querySelector('.contact-header form');
        if (typeof scroll !== 'undefined' && scroll && typeof scroll.scrollTo === 'function' && formEl) {
          scroll.scrollTo(formEl, { offset: -100 });
        } else if (formEl && typeof formEl.scrollIntoView === 'function') {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (nameField) {
          setTimeout(function () { focusFieldSafely(nameField); }, 250);
        }
      }
    });

    btn.addEventListener('mouseenter', scheduleWhatsAppAdaptiveUpdate);
    btn.addEventListener('mouseleave', scheduleWhatsAppAdaptiveUpdate);
    btn.addEventListener('transitionend', scheduleWhatsAppAdaptiveUpdate);

    waButtonEl = btn;
    waLayersEl = layers;
    waWhiteLayerEl = whiteLayer;

    syncWhatsAppButtonAttrs();
    bindWhatsAppGlobalListeners();
    bindLocomotiveScrollForWhatsApp();
    updateWhatsAppAdaptiveState();
  }

  /* ------------------------------------------------------------------------
     Bootstrap & Global Event Hooks
     ------------------------------------------------------------------------ */
  function bootstrap() {
    initLang();
    startBrazilClock();
    initAllFluidSpheres();
    initContactAjaxForm();
    initFloatingWhatsApp();
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (link) {
      syncLoadingWordForHref(link.getAttribute('href'));
    }
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  window.addEventListener('load', function () {
    bootstrap();
    schedulePreloaderFallback();
    setTimeout(ensureScrollActive, 600);
    setTimeout(ensureScrollActive, 1500);
    setTimeout(ensureScrollActive, 3000);
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      ensureScrollActive();
    }
  });

  let lastWheelRescue = 0;
  window.addEventListener('wheel', function () {
    if (isNavOpen()) return;
    const now = Date.now();
    if (now - lastWheelRescue > 600) {
      lastWheelRescue = now;
      if (typeof scroll !== 'undefined' && scroll && scroll.isStopped) {
        if (typeof scroll.start === 'function') scroll.start();
        if (typeof scroll.update === 'function') scroll.update();
      }
    }
  }, { passive: true });

  if (typeof barba !== 'undefined') {
    try {
      barba.hooks.afterEnter(function () {
        bootstrap();
      });
      barba.hooks.beforeLeave(function (data) {
        if (data && data.next && data.next.url) {
          syncLoadingWordForHref(data.next.url.path || data.next.url.href);
        }
      });
    } catch (e) {}
  }
})();
