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
      pt: 'Cassiano Imóveis — Site e Painel Administrativo | André Carvalho',
      en: 'Cassiano Imóveis — Website & Admin Panel | André Carvalho'
    },
    compras: {
      pt: 'Sistema de Gestão de Compras — Paralelo 17 | André Carvalho',
      en: 'Purchasing Management System — Paralelo 17 | André Carvalho'
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
      nav_compras: 'Compras — Paralelo 17',
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
      cassiano_subtitle_home: 'Plataforma imobiliária + painel administrativo',
      compras_subtitle_home: 'Paralelo 17 (Concierge) • Da dor real e desenho do fluxo ao sistema',
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
      cassiano_services: 'Site + painel administrativo',
      cassiano_client_value: 'Imobiliária • Trancoso / Porto Seguro, BA',
      cassiano_year_value: '2024 — hoje (em evolução)',
      cassiano_hero_alt: 'Cassiano Imóveis — site imobiliário com painel administrativo',
      cassiano_overview_p3: 'E havia uma condição: não abrir mão do que já funcionava. O site precisava continuar rápido, fácil de encontrar no Google e, acima de tudo, sempre no ar.',
      cassiano_pill_admin: 'Painel administrativo',
      cassiano_hl_label: '03 • Destaques',
      cassiano_hl_title: 'O que vai além de um site de vitrine',
      cassiano_hl_intro: 'Além do fluxo de publicação, o projeto resolve rotinas do dia a dia da imobiliária e cuida do que o visitante não vê, mas sente.',
      cassiano_hl_c1_title: 'Gestão de temporada',
      cassiano_hl_c1_desc: 'Agenda geral por período com todas as casas, exportação para planilha no mesmo modelo que o cliente já usava e pré-reservas com prazo de validade.',
      cassiano_hl_c2_title: 'Fotos e características',
      cassiano_hl_c2_desc: 'Fotos enviadas direto do painel para o Supabase Storage, com limite de tamanho, e otimizadas para ficarem mais leves no site. As características do imóvel são escolhidas num seletor visual de ícones.',
      cassiano_hl_c3_title: 'Base de contatos (CRM)',
      cassiano_hl_c3_desc: 'Uma base de CRM para os contatos (leads) está em construção, para que os interessados fiquem organizados num só lugar, dentro do mesmo painel.',
      cassiano_hl_c4_title: 'Compartilhamento e SEO',
      cassiano_hl_c4_desc: 'Prévia de link bonita no WhatsApp com Open Graph e SEO técnico com sitemap e canonical, para o imóvel ser bem apresentado onde é compartilhado e encontrado.',
      cassiano_hl_c5_title: 'Infraestrutura enxuta',
      cassiano_hl_c5_desc: 'Quando o plano gratuito da Netlify acabou, a hospedagem foi migrada para o Cloudflare. Uma tarefa agendada no GitHub Actions mantém ativo o banco do plano gratuito.',
      cassiano_hl_c6_title: 'Qualidade e testes',
      cassiano_hl_c6_desc: 'Mais de 330 testes automatizados (node:test + Playwright) e desenvolvimento em PRs pequenos e revisados, para cada mudança chegar ao ar sem surpresas.',
      cassiano_result_label: '04 • O Que Mudou',
      cassiano_result_title: 'O dono publica sozinho, e o site não quebra',
      cassiano_result_p1: 'Hoje o dono cadastra, edita e publica os imóveis de venda sem depender de ninguém. Os 11 imóveis de venda iniciais já foram todos importados para o painel, e uma alteração chega ao site com um clique em “Publicar no site”.',
      cassiano_result_p2: 'A temporada ganhou uma visão de todas as casas por período, e a planilha continua no formato de sempre, agora gerada pelo sistema. Com perfis separados, o assistente ajuda na operação sem poder exportar ou apagar dados.',
      cassiano_result_p3: 'O projeto segue em evolução desde 2024, com a base de CRM como próximo passo, sempre em entregas pequenas, revisadas e testadas.',
      cassiano_sb_badge: 'Demo interativa • Dados fictícios',
      cassiano_sb_title: 'Experimente ser o dono',
      cassiano_sb_sub: 'Entre no painel do Cassiano, cadastre um imóvel, publique no site, faça uma pré-reserva como visitante e veja tudo chegar na planilha da agenda. É o mesmo painel do projeto, rodando aqui com dados de exemplo.',
      cassiano_sb_btn_tour: 'Começar o tour',
      cassiano_sb_btn_live: 'Ver site no ar ↗',
      cassiano_sb_safe: 'Você está no lugar do dono: teste à vontade, nada aqui afeta o site real. Os dados são fictícios e ficam só no seu navegador.',
      cassiano_sb_tour_title: 'Tour em 7 passos (opcional)',
      cassiano_sb_done: 'concluídos',
      cassiano_sb_s1: 'Entre no painel',
      cassiano_sb_s2: 'Cadastre um imóvel',
      cassiano_sb_s3: 'Publique no site',
      cassiano_sb_s4: 'Veja no site',
      cassiano_sb_s5: 'Faça uma pré-reserva',
      cassiano_sb_s6: 'Confira na agenda',
      cassiano_sb_s7: 'Abra a planilha',
      cassiano_sb_next: 'Próximo passo',
      cassiano_sb_end: 'Encerrar tour',
      cassiano_sb_tab_panel: 'Painel do Cassiano',
      cassiano_sb_tab_house: 'Página da casa (visitante)',
      cassiano_sb_tab_sheet: 'Planilha da agenda',
      cassiano_sb_tab_site: 'Site (prévia)',
      cassiano_sb_reset: 'Restaurar dados',
      cassiano_sb_newtab: 'Abrir em nova aba',
      cassiano_sb_loading: 'Carregando a demonstração…',
      cassiano_sb_note: 'O painel e a planilha são os do projeto, com os textos em português. A API foi trocada por uma simulação no navegador: não há login real, banco de dados nem envio de fotos.',
      cassiano_sb_note_mobile: 'No celular, o painel aparece como no telefone do dono. Role dentro da moldura para ver tudo.',
      cassiano_sb_gal_label: 'Galeria • O site no ar',
      cassiano_sb_gal_title: 'Como o site ficou, página por página',
      cassiano_sb_gal_intro: 'Telas reais do site público, no computador e no celular, e duas telas do painel na versão de demonstração. Clique em uma imagem para ampliar.',
      cassiano_sb_gal_fict: 'Sandbox • dados fictícios',
      cassiano_sb_g1_t: 'Página inicial',
      cassiano_sb_g1_d: 'A chegada mostra o posicionamento e leva direto aos imóveis à venda, com busca rápida por destino logo abaixo.',
      cassiano_sb_g1_a: 'Página inicial do site Cassiano Imóveis com o título Propriedades Exclusivas no Sul da Bahia',
      cassiano_sb_g2_t: 'Lista de imóveis à venda',
      cassiano_sb_g2_d: 'Cartões com foto, referência, preço e características. Tudo vem do painel: quando o dono publica, a lista se atualiza sozinha.',
      cassiano_sb_g2_a: 'Catálogo com cartões de imóveis à venda, cada um com foto, referência e valor',
      cassiano_sb_g3_t: 'Página do imóvel',
      cassiano_sb_g3_d: 'Título, valor e fotos em destaque. O texto, as fotos e os ícones das características são editados pelo dono no painel.',
      cassiano_sb_g3_a: 'Página de um imóvel de alto padrão com título, valor de venda e foto aérea',
      cassiano_sb_g4_t: 'Temporada',
      cassiano_sb_g4_d: 'Casas para alugar por temporada, com filtro por destino. Cada casa tem uma página com calendário de datas livres e ocupadas.',
      cassiano_sb_g4_a: 'Página de temporada com filtro por destino e cartão de uma casa',
      cassiano_sb_g5_t: 'Celular: página inicial',
      cassiano_sb_g5_d: 'Pensado para quem chega pelo celular: botões grandes e textos legíveis sem zoom.',
      cassiano_sb_g5_a: 'Página inicial do site vista no celular',
      cassiano_sb_g6_t: 'Celular: página do imóvel',
      cassiano_sb_g6_d: 'O valor e a referência aparecem logo no topo, para quem decide rápido pelo telefone.',
      cassiano_sb_g6_a: 'Página de um imóvel vista no celular, com título e valor de venda',
      cassiano_sb_g7_t: 'Painel: gerenciar imóveis',
      cassiano_sb_g7_d: 'Onde o dono cria, edita e publica. O botão “Publicar no site” avisa quantas alterações ainda não foram para o ar.',
      cassiano_sb_g7_a: 'Painel administrativo com a lista de imóveis e o botão Publicar no site',
      cassiano_sb_g8_t: 'Painel: agenda geral da temporada',
      cassiano_sb_g8_d: 'Todas as casas no mesmo período, coloridas pela origem da reserva (direta, Airbnb, Booking), com as pré-reservas tracejadas.',
      cassiano_sb_g8_a: 'Agenda geral com uma linha por casa e reservas coloridas por origem',
      cassiano_sb_info_label: 'Em resumo',
      cassiano_sb_info_title: 'O projeto em números',
      cassiano_sb_n1: 'imóveis de venda iniciais importados para o painel',
      cassiano_sb_n2: 'testes automatizados (node:test + Playwright)',
      cassiano_sb_n3_v: 'clique',
      cassiano_sb_n3: 'para publicar o site, sem desenvolvedor',
      cassiano_sb_n4: 'de validade de uma pré-reserva antes de as datas voltarem a ficar livres',
      cassiano_sb_n5: 'origens de reserva na agenda: direta, Airbnb, Booking e o motor do site (em breve)',
      cassiano_sb_n6: 'perfis de acesso: administrador e assistente',
      cassiano_sb_solo_title: 'O que o dono faz sozinho',
      cassiano_sb_solo1: 'Cadastra e edita imóveis de venda e aluguel, com ícones das características',
      cassiano_sb_solo2: 'Envia fotos pelo celular, já reduzidas e sem dados de localização',
      cassiano_sb_solo3: 'Publica o site com um botão; se algo falhar, a versão anterior continua no ar',
      cassiano_sb_solo4: 'Marca reservas, bloqueios e épocas de preço de cada casa de temporada',
      cassiano_sb_solo5: 'Vê todas as casas na agenda geral e acha os períodos livres',
      cassiano_sb_solo6: 'Baixa a planilha da agenda no mesmo modelo que já usava',
      cassiano_sb_stack_title: 'Stack',
      compras_title: 'Sistema de Gestão de Compras — Paralelo 17',
      compras_location: 'Brasil (Sul da Bahia • Paralelo 17)',
      compras_services: 'Desenho de Fluxo & Full-Stack',

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
      case_eyebrow: 'Estudo de Caso • 2024 — hoje',
      case_hero_lead: 'Site imobiliário com painel administrativo próprio: o dono cadastra, edita e publica os imóveis sozinho, com um botão, sem depender de desenvolvedor e sem risco de derrubar o site.',
      meta_client_label: 'Cliente / Contexto',
      meta_services_label: 'Serviços',
      meta_services_value: 'Site, painel administrativo & publicação',
      meta_stack_label: 'Stack',
      meta_year_label: 'Ano',
      overview_label: '01 • O Problema',
      overview_title: 'Um catálogo que só mudava quando o desenvolvedor mexia',
      overview_p1: 'Uma imobiliária vive de anúncios atualizados. Quando cada imóvel novo, foto trocada ou descrição corrigida precisa passar por um desenvolvedor, o site fica para trás e vira um gargalo: o imóvel já está disponível, mas ainda não aparece.',
      overview_p2: 'Na temporada, o desafio era outro: enxergar a ocupação de todas as casas no mesmo período e continuar entregando a planilha no modelo com que o cliente já trabalhava.',
      arch_label: '02 • A Solução & Como Funciona',
      arch_title: 'Site estático, painel próprio e publicação com um botão',
      arch_intro: 'A solução separa o que o visitante vê do que o dono administra. O site continua estático e leve; o conteúdo passa a morar num banco de dados que o dono controla pelo painel, e um botão transforma esse conteúdo em site novo.',
      arch_c1_title: 'Site em Astro no Cloudflare Pages',
      arch_c1_desc: 'As páginas são geradas de forma estática em Astro e servidas pelo Cloudflare Pages, com domínio próprio. O visitante recebe HTML pronto e leve, sem um servidor montando a página a cada acesso.',
      arch_c2_title: 'Painel administrativo próprio',
      arch_c2_desc: 'Painel em /admin feito em HTML, CSS e JavaScript puros, com Content Security Policy estrita. A API é uma Cloudflare Pages Function sobre Supabase (Postgres + Auth, região São Paulo), conectada via Hyperdrive. Perfis admin e assistente têm permissões diferentes: o assistente não exporta nem apaga.',
      arch_c3_title: 'Publicação segura',
      arch_c3_desc: 'O botão “Publicar no site” dispara um novo build, que gera o site a partir do banco. Se a leitura do banco falhar, o build falha de propósito e o site anterior continua no ar. Publicar nunca quebra o site.',
      flow_title: 'Como funciona a publicação',
      flow_s1_title: '1. Cadastro no painel',
      flow_s1_desc: 'O dono cria ou edita o imóvel, envia as fotos e escolhe os ícones das características.',
      flow_s2_title: '2. Banco de dados',
      flow_s2_desc: 'Os dados ficam no Supabase (Postgres) e as fotos no Supabase Storage.',
      flow_s3_title: '3. Publicar no site',
      flow_s3_desc: 'Um clique dispara o build, que lê o banco e gera as páginas estáticas.',
      flow_s4_title: '4. Site atualizado',
      flow_s4_desc: 'Se tudo deu certo, a nova versão entra no ar; se algo falhou, a anterior continua.',
      cta_label: '05 • Próximo Passo',
      cta_title: 'Sua empresa depende de alguém para cada atualização?',
      cta_desc: 'Se um processo digital está travando o seu dia a dia, vamos conversar. Eu encontro o gargalo e construo a ferramenta certa para resolvê-lo.',
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
      nav_compras: 'Purchasing — Paralelo 17',
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
      cassiano_subtitle_home: 'Real estate platform + admin panel',
      compras_subtitle_home: 'Paralelo 17 (Concierge) • Workflow design to production system',
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
      cassiano_services: 'Website + admin panel',
      cassiano_client_value: 'Real estate agency • Trancoso / Porto Seguro, Brazil',
      cassiano_year_value: '2024 — present (ongoing)',
      cassiano_hero_alt: 'Cassiano Imóveis — real estate website with an admin panel',
      cassiano_overview_p3: 'And there was one condition: keep everything that already worked. The website had to stay fast, easy to find on Google and, above all, always online.',
      cassiano_pill_admin: 'Admin panel',
      cassiano_hl_label: '03 • Highlights',
      cassiano_hl_title: 'What goes beyond a listings website',
      cassiano_hl_intro: 'Beyond the publishing flow, the project handles the agency’s day-to-day routines and takes care of what visitors don’t see, but do feel.',
      cassiano_hl_c1_title: 'Seasonal rentals',
      cassiano_hl_c1_desc: 'A combined calendar of every house by period, spreadsheet export in the same format the client already used, and pre-bookings with an expiry date.',
      cassiano_hl_c2_title: 'Photos and features',
      cassiano_hl_c2_desc: 'Photos are uploaded from the panel straight to Supabase Storage, with a size limit, and optimized to load lighter on the website. Property features are chosen from a visual icon picker.',
      cassiano_hl_c3_title: 'Contacts base (CRM)',
      cassiano_hl_c3_desc: 'A CRM base for contacts (leads) is under construction, so every prospect is organized in one place, inside the same panel.',
      cassiano_hl_c4_title: 'Sharing and SEO',
      cassiano_hl_c4_desc: 'Clean WhatsApp link previews with Open Graph, plus technical SEO with a sitemap and canonical URLs, so each listing looks good where it is shared and found.',
      cassiano_hl_c5_title: 'Lean infrastructure',
      cassiano_hl_c5_desc: 'When the Netlify free plan ran out, hosting was migrated to Cloudflare. A scheduled GitHub Actions task keeps the free-tier database active.',
      cassiano_hl_c6_title: 'Quality and testing',
      cassiano_hl_c6_desc: 'More than 330 automated tests (node:test + Playwright) and development in small, reviewed PRs, so every change goes live without surprises.',
      cassiano_result_label: '04 • What Changed',
      cassiano_result_title: 'The owner publishes independently, and the site never breaks',
      cassiano_result_p1: 'Today the owner adds, edits and publishes sale listings without depending on anyone. All 11 initial sale listings have been imported into the panel, and any change reaches the website with a click on “Publish to site”.',
      cassiano_result_p2: 'Seasonal rentals gained a view of every house by period, and the spreadsheet keeps its familiar format, now generated by the system. With separate roles, the assistant helps run operations without being able to export or delete data.',
      cassiano_result_p3: 'The project has kept evolving since 2024, with the CRM base as the next step, always shipped in small, reviewed and tested increments.',
      cassiano_sb_badge: 'Interactive demo • Fictional data',
      cassiano_sb_title: 'Try being the owner',
      cassiano_sb_sub: 'Sign in to Cassiano’s panel, add a listing, publish it to the website, pre-book a house as a guest and watch it all land in the agenda spreadsheet. It is the project’s real panel, running here with sample data.',
      cassiano_sb_btn_tour: 'Start the tour',
      cassiano_sb_btn_live: 'See the live site ↗',
      cassiano_sb_safe: 'You are in the owner’s seat: try anything, nothing here touches the real website. The data is fictional and stays in your browser only.',
      cassiano_sb_tour_title: '7-step tour (optional)',
      cassiano_sb_done: 'completed',
      cassiano_sb_s1: 'Sign in',
      cassiano_sb_s2: 'Add a listing',
      cassiano_sb_s3: 'Publish to the site',
      cassiano_sb_s4: 'See it on the site',
      cassiano_sb_s5: 'Pre-book a house',
      cassiano_sb_s6: 'Check the agenda',
      cassiano_sb_s7: 'Open the spreadsheet',
      cassiano_sb_next: 'Next step',
      cassiano_sb_end: 'End tour',
      cassiano_sb_tab_panel: 'Cassiano’s panel',
      cassiano_sb_tab_house: 'House page (guest)',
      cassiano_sb_tab_sheet: 'Agenda spreadsheet',
      cassiano_sb_tab_site: 'Website (preview)',
      cassiano_sb_reset: 'Reset data',
      cassiano_sb_newtab: 'Open in new tab',
      cassiano_sb_loading: 'Loading the demo…',
      cassiano_sb_note: 'The panel and spreadsheet are the project’s own, with texts in Portuguese. The API was replaced by an in-browser simulation: no real login, database or photo upload.',
      cassiano_sb_note_mobile: 'On a phone, the panel looks just like on the owner’s phone. Scroll inside the frame to see everything.',
      cassiano_sb_gal_label: 'Gallery • The live site',
      cassiano_sb_gal_title: 'What the site looks like, page by page',
      cassiano_sb_gal_intro: 'Real screens from the public website, on desktop and mobile, plus two panel screens from the demo version. Click any image to enlarge.',
      cassiano_sb_gal_fict: 'Sandbox • fictional data',
      cassiano_sb_g1_t: 'Home page',
      cassiano_sb_g1_d: 'The landing states the positioning and leads straight to the listings for sale, with a quick search by destination right below.',
      cassiano_sb_g1_a: 'Cassiano Imóveis home page with the headline Exclusive Properties in Southern Bahia',
      cassiano_sb_g2_t: 'Listings for sale',
      cassiano_sb_g2_d: 'Cards with photo, reference, price and features. Everything comes from the panel: when the owner publishes, the list updates itself.',
      cassiano_sb_g2_a: 'Catalog of listings for sale, each card with photo, reference and price',
      cassiano_sb_g3_t: 'Listing page',
      cassiano_sb_g3_d: 'Title, price and photos up front. The text, photos and feature icons are edited by the owner in the panel.',
      cassiano_sb_g3_a: 'High-end listing page with title, sale price and aerial photo',
      cassiano_sb_g4_t: 'Seasonal rentals',
      cassiano_sb_g4_d: 'Houses for seasonal rent, filtered by destination. Each house has a page with a calendar of free and booked dates.',
      cassiano_sb_g4_a: 'Seasonal rentals page with destination filter and a house card',
      cassiano_sb_g5_t: 'Mobile: home page',
      cassiano_sb_g5_d: 'Built for people arriving on their phones: large buttons and text you can read without zooming.',
      cassiano_sb_g5_a: 'Website home page on a phone',
      cassiano_sb_g6_t: 'Mobile: listing page',
      cassiano_sb_g6_d: 'Price and reference sit right at the top, for people who decide quickly on their phone.',
      cassiano_sb_g6_a: 'Listing page on a phone, with title and sale price',
      cassiano_sb_g7_t: 'Panel: manage listings',
      cassiano_sb_g7_d: 'Where the owner creates, edits and publishes. The “Publish to site” button shows how many changes are not live yet.',
      cassiano_sb_g7_a: 'Admin panel with the listings table and the Publish to site button',
      cassiano_sb_g8_t: 'Panel: combined seasonal calendar',
      cassiano_sb_g8_d: 'Every house over the same period, colored by booking source (direct, Airbnb, Booking), with dashed pre-bookings.',
      cassiano_sb_g8_a: 'Combined calendar with one row per house and bookings colored by source',
      cassiano_sb_info_label: 'At a glance',
      cassiano_sb_info_title: 'The project in numbers',
      cassiano_sb_n1: 'initial sale listings imported into the panel',
      cassiano_sb_n2: 'automated tests (node:test + Playwright)',
      cassiano_sb_n3_v: 'click',
      cassiano_sb_n3: 'to publish the site, no developer needed',
      cassiano_sb_n4: 'pre-booking validity before the dates are released again',
      cassiano_sb_n5: 'booking sources in the agenda: direct, Airbnb, Booking and the site’s booking engine (coming soon)',
      cassiano_sb_n6: 'access roles: administrator and assistant',
      cassiano_sb_solo_title: 'What the owner does on his own',
      cassiano_sb_solo1: 'Adds and edits sale and rental listings, with feature icons',
      cassiano_sb_solo2: 'Uploads photos from his phone, already resized and stripped of location data',
      cassiano_sb_solo3: 'Publishes the site with one button; if anything fails, the previous version stays live',
      cassiano_sb_solo4: 'Records bookings, blocks and seasonal prices for each rental house',
      cassiano_sb_solo5: 'Sees every house in the combined calendar and finds free periods',
      cassiano_sb_solo6: 'Downloads the agenda spreadsheet in the same format he already used',
      cassiano_sb_stack_title: 'Stack',
      compras_title: 'Purchasing Management System — Paralelo 17',
      compras_location: 'Brazil (Southern Bahia • Paralelo 17)',
      compras_services: 'Workflow Design & Full-Stack',

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
      case_eyebrow: 'Case Study • 2024 — present',
      case_hero_lead: 'A real estate website with its own admin panel: the owner adds, edits and publishes listings independently, with a single button, without waiting on a developer and without any risk of taking the site down.',
      meta_client_label: 'Client / Context',
      meta_services_label: 'Services',
      meta_services_value: 'Website, admin panel & publishing',
      meta_stack_label: 'Stack',
      meta_year_label: 'Year',
      overview_label: '01 • The Problem',
      overview_title: 'A catalog that only changed when the developer touched it',
      overview_p1: 'A real estate agency runs on up-to-date listings. When every new property, swapped photo or corrected description has to go through a developer, the website falls behind and becomes a bottleneck: the property is already available, but it is not online yet.',
      overview_p2: 'For seasonal rentals, the challenge was different: seeing the occupancy of every house over the same period while still delivering the spreadsheet in the format the client already worked with.',
      arch_label: '02 • The Solution & How It Works',
      arch_title: 'Static website, custom admin panel and one-click publishing',
      arch_intro: 'The solution separates what visitors see from what the owner manages. The website stays static and lightweight; the content now lives in a database the owner controls through the panel, and a single button turns that content into a fresh version of the site.',
      arch_c1_title: 'Astro website on Cloudflare Pages',
      arch_c1_desc: 'Pages are statically generated with Astro and served by Cloudflare Pages on a custom domain. Visitors get ready-made, lightweight HTML, with no server assembling the page on every request.',
      arch_c2_title: 'Custom admin panel',
      arch_c2_desc: 'An /admin panel built with plain HTML, CSS and JavaScript under a strict Content Security Policy. The API is a Cloudflare Pages Function on top of Supabase (Postgres + Auth, São Paulo region), connected through Hyperdrive. Admin and assistant roles have different permissions: the assistant cannot export or delete.',
      arch_c3_title: 'Safe publishing',
      arch_c3_desc: 'The “Publish to site” button triggers a new build that generates the website from the database. If reading the database fails, the build fails on purpose and the previous version stays online. Publishing never breaks the site.',
      flow_title: 'How publishing works',
      flow_s1_title: '1. Edit in the panel',
      flow_s1_desc: 'The owner creates or edits a listing, uploads photos and picks the feature icons.',
      flow_s2_title: '2. Database',
      flow_s2_desc: 'Data lives in Supabase (Postgres) and photos in Supabase Storage.',
      flow_s3_title: '3. Publish to site',
      flow_s3_desc: 'One click triggers the build, which reads the database and generates the static pages.',
      flow_s4_title: '4. Site updated',
      flow_s4_desc: 'If everything works, the new version goes live; if something fails, the previous one stays up.',
      cta_label: '05 • Next Step',
      cta_title: 'Does your business depend on someone for every update?',
      cta_desc: 'If a digital process is slowing down your day-to-day, let’s talk. I find the bottleneck and build the right tool to remove it.',
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
    if (bodyKey) {
      if (PAGE_TITLES[bodyKey]) return bodyKey;
      if (bodyKey === 'gestao-de-compras') return 'compras';
    }

    const main = document.querySelector('main[data-barba-namespace]');
    const ns = main ? main.getAttribute('data-barba-namespace') : '';
    if (ns) {
      if (PAGE_TITLES[ns]) return ns;
      if (ns === 'gestao-de-compras') return 'compras';
    }

    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('cassiano-imoveis')) return 'cassiano';
    if (path.includes('gestao-de-compras')) return 'compras';
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

    try {
      window.dispatchEvent(new CustomEvent('portfolio:langchange', { detail: { lang: currentLang } }));
    } catch (e) {}

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
    else if (lower.includes('gestao-de-compras.html')) targetPage = 'compras';
    else if (lower.includes('work.html')) targetPage = 'work';
    else if (lower.includes('about.html')) targetPage = 'about';
    else if (lower.includes('contact.html')) targetPage = 'contact';
    else if (lower.includes('index.html') || lower === '/' || lower.endsWith('/')) targetPage = 'home';

    if (!targetPage) return;

    const loadingWords = document.querySelector('.loading-words');
    if (!loadingWords) return;

    const t = DICT[currentLang] || DICT.pt;
    loadingWords.querySelectorAll('h2:not(.home-active):not(.home-active-last)').forEach(function (h2) {
      const dp = h2.getAttribute('data-page');
      const isMatch = dp === targetPage || (targetPage === 'compras' && dp === 'gestao-de-compras');
      if (isMatch) {
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
    'M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16' +
    'l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326z' +
    'M7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505' +
    'c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66' +
    'c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646' +
    '-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05' +
    '-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403' +
    '.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347' +
    '-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007' +
    'a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049' +
    'c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08' +
    '.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232';

  const DARK_BG_SELECTOR =
    '.theme-dark, .home-header, .hero-navy-section, #about-navy-theme .about-header, ' +
    '#about-navy-theme .about-image, .about-header, .about-image, .line-globe, ' +
    '.about-services, .about-standards, .footer, .footer-wrap, .work-navy-section, ' +
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
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('fill', 'currentColor');
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
