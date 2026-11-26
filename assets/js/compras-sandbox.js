/* ==========================================================================
   Sistema de Gestão de Compras — Interactive 7-Step Sandbox & Coachmark Tour
   v2.0 — Narrative Strip + Micro-Balloon • Zero occlusion • Bilingual PT|EN
   100% sanitized demo data • Locomotive Scroll safe
   ========================================================================== */
(function () {
  'use strict';

  if (window.__comprasSandboxInit) return;
  window.__comprasSandboxInit = true;

  var rootEl = null;
  var lang = 'pt';
  var rafPosId = null;
  var locoScrollBound = false;
  var hasTriggeredViewportAutoplay = false;
  var sandboxObserver = null;
  var autoPlayTimer = null;
  var autoPlayRippleTimer = null;
  var pulseItemTimer = null;
  var pulsedItemId = null;

  /* ------------------------------------------------------------------------
     Bilingual Dictionary (Page Case Study + Sandbox + Narrative Strip + Micro-Balloon)
     ------------------------------------------------------------------------ */
  var I18N = {
    pt: {
      // Page Case Study Copy ([data-gc-i18n])
      gc_eyebrow: 'Estudo de Caso + Sandbox • Paralelo 17 • 2026',
      gc_hero_title: 'Sistema de Gestão de Compras — Paralelo 17',
      gc_hero_lead:
        'Na rotina diária da Paralelo 17, percebi o gargalo das compras de estadias feitas por áudios e mensagens soltas no WhatsApp. Desenhei todo o fluxo ponta a ponta — do painel da equipe (/admin) ao cardápio sem login para a cozinheira (/e/:codigo) e fechamento com notas fiscais — e construí a plataforma completa em produção.',
      gc_meta_client_val: 'Paralelo 17 (Concierge) • Sul da Bahia',
      gc_meta_services_val: 'Desenho de Fluxo & Engenharia Full-Stack',
      gc_sb_badge: 'Demo Interativa • Dados Fictícios',
      gc_sb_heading: 'Veja a demo automática ou faça o Desafio Carbonara em 7 passos',
      gc_sb_sub:
        'Ao chegar aqui, a demo automática mostra o pedido do Macarrão à Carbonara de ponta a ponta — depois assuma o controle, monte os 5 itens e visualize a planilha.',
      gc_overview_label: '01 • Origem, Fluxo & Entrega',
      gc_overview_title: 'Como identifiquei o gargalo na Paralelo 17, desenhei o fluxo e construí o sistema',
      gc_overview_p1:
        'Acompanhando de perto a rotina de Concierge das casas de temporada na Paralelo 17 (Sul da Bahia), percebi a necessidade real por trás de cada hospedagem: as listas de compras dependiam de áudios e mensagens soltas no WhatsApp entre hóspedes, cozinheira e equipe, gerando esquecimentos de unidades, retrabalho ao separar 6 fornecedores locais e horas fechando notas fiscais na mão.',
      gc_overview_p2:
        'Antes de escrever a primeira linha de código, desenhei toda a arquitetura de fluxo para unir ponta a ponta sem atrito: o Concierge cria a estadia em /admin e libera um link único sem senha (/e/:codigo); a cozinheira escolhe itens ou kits proporcionais pelo celular e envia o pedido; a equipe aprova, dispara listas formatadas por fornecedor no WhatsApp, gerencia as notas de compra separando quem pagou e fecha o pedido gerando automaticamente a planilha consolidada.',
      gc_pill_1: '172 Itens / 6 Fornecedores',
      gc_pill_2: '5 Kits Proporcionais',
      gc_pill_3: 'Link sem Login (/e/:codigo)',
      gc_pill_4: 'Storage Privado de NF-e',
      gc_arch_label: '02 • Arquitetura Técnica & Segurança',
      gc_arch_title: 'React 19, Supabase com RLS e prestação de contas em ExcelJS',
      gc_arch_intro:
        'Projetado para rodar com zero fricção no celular da cozinheira e máxima governança financeira na mão do Concierge, com dados isolados por políticas de segurança no PostgreSQL.',
      gc_arch_c1_title: 'React 19, TypeScript & Tailwind v4',
      gc_arch_c1_desc:
        'Interface responsiva construída com React 19, TypeScript estrito, Vite 8 e Tailwind CSS v4. O cardápio calcula automaticamente quantidades de kits prontos (Churrasco, Feijoada, Café da Manhã, Bar Tropical e Kids) proporcionalmente ao nº de hóspedes e dias da estadia.',
      gc_arch_c2_title: 'PostgreSQL, RPCs & Storage Privado',
      gc_arch_c2_desc:
        'Persistência no Supabase com Row Level Security (RLS), RPCs seguras (obter_estadia e criar_pedido com lock FOR UPDATE garantindo numeração sequencial) e bucket privado de comprovantes com upload comprimido e visualização por URL assinada.',
      gc_arch_c3_title: 'Relatórios .xlsx & Testes Automatizados',
      gc_arch_c3_desc:
        'Geração instantânea de planilhas ExcelJS com aba geral consolidada e abas coloridas por fornecedor, além de disparo formatado para WhatsApp e suíte de qualidade com 4 módulos de testes em Vitest e lint com Oxlint.',
      gc_flow_title: 'Fluxo Operacional de Ponta a Ponta',
      gc_flow_s1_title: '1. Estadia (/admin)',
      gc_flow_s1_desc: 'Concierge cadastra casa, datas e hóspedes, gerando o código único da hospedagem.',
      gc_flow_s2_title: '2. Cardápio (/e/:codigo)',
      gc_flow_s2_desc: 'Cozinheira acessa sem senha, escolhe setores ou kits e envia o pedido em segundos.',
      gc_flow_s3_title: '3. Fornecedores & WhatsApp',
      gc_flow_s3_desc: 'Painel agrupa os itens por setor e gera listas prontas para disparo aos 6 parceiros.',
      gc_flow_s4_title: '4. Notas & Excel .xlsx',
      gc_flow_s4_desc: 'Equipe anexa NF-es, separa pagador (hóspede vs. concierge) e fecha a planilha final.',
      gc_cta_label: '03 • Próximo Passo',
      gc_cta_title: 'Quer transformar uma operação manual em um sistema sob medida?',
      gc_cta_desc:
        'Desenvolvo aplicações web completas, painéis operacionais e automações de ponta a ponta para eliminar gargalos reais no seu negócio.',

      // Sandbox Chrome & Rail
      role_admin: 'Modo Concierge (/admin)',
      role_cook: 'Modo Cozinheira (/e/MIR-204)',
      tour_guided: 'Tour Guiado',
      tour_free: 'Modo Livre',
      btn_restart: 'Reiniciar Tour',
      btn_free_explore: 'Explorar livremente',
      btn_resume_tour: 'Retomar Guia',
      btn_autoplay_watch: 'Ver Automático',
      btn_autoplay_pause: 'Pausar Automático',
      ns_autoplay_badge: '▶ DEMO AUTOMÁTICA',
      rail_steps: [
        '1. Login',
        '2. Criar Estadia',
        '3. Link Cardápio',
        '4. Pedido Cozinheira',
        '5. Aprovar Pedido',
        '6. Notas & NF-e',
        '7. Finalizar & .xlsx'
      ],

      // App UI Common
      app_brand: 'Trancoso Concierge',
      app_sub: 'Gestão de Compras & Estadias',
      btn_logout: 'Sair',
      btn_back_admin: 'Voltar ao /admin',
      guests_word: 'hóspedes',
      days_word: 'dias',
      items_word: 'itens',
      item_word: 'item',
      units_word: 'unid.',

      // Step 1: Login
      login_title: 'Acesso da Equipe',
      login_sub: 'Entre no painel operacional com um perfil de demonstração.',
      login_profiles_lbl: 'Perfis Cadastrados (Demo)',
      login_user_lbl: 'Usuário ou E-mail',
      login_pass_lbl: 'Senha',
      login_remember: 'Salvar acesso neste dispositivo',
      login_btn: 'Entrar no Painel',
      role_concierge: 'Concierge',
      role_supervisor: 'Supervisora de Estadias',

      // Step 2 & 3: Stays
      tab_stays: 'Estadias',
      tab_orders: 'Todos os Pedidos',
      filter_active: 'Ativas',
      filter_done: 'Finalizadas',
      filter_archived: 'Arquivadas',
      btn_new_stay: '+ Nova Estadia',
      new_stay_title: 'Cadastrar Nova Estadia',
      field_house: 'Nome da Casa *',
      field_checkin: 'Check-in *',
      field_checkout: 'Check-out *',
      field_guests: 'Nº de Hóspedes *',
      field_responsible: 'Responsável (Equipe) *',
      field_holder: 'Titular da Hospedagem *',
      field_notes: 'Observações do Concierge',
      btn_save_stay: 'Salvar Estadia',
      stay_status_active: 'Ativa',
      cook_link_label: 'Link da Cozinheira:',
      btn_copy_link: 'Copiar Link',
      btn_whatsapp_invite: 'WhatsApp',
      btn_open_menu: 'Acessar Cardápio (Link da Cozinheira)',
      toast_stay_saved: 'Estadia criada! Link exclusivo enviado no WhatsApp — abre no celular sem baixar app e sem senha.',
      toast_link_copied: 'Link /e/MIR-204 copiado para a área de transferência!',
      toast_wa_invite: 'Mensagem de convite enviada para Chef Camila — acesso sem senha pelo celular.',

      // Step 4: Cook Menu
      menu_welcome: 'Acesso sem login liberado para',
      menu_catalog_meta: '172 itens no catálogo completo • Amostra interativa por setor',
      kits_label: 'Kits Prontos (calculados para',
      kit_applied_tag: 'aplicado',
      btn_similar_yes: 'Aceita similar: Sim',
      btn_similar_no: 'Aceita similar: Não',
      summary_selected: 'no carrinho',
      summary_est: 'Estimativa base:',
      btn_send_order: 'Fechar / Enviar Pedido',
      toast_kit_added: 'Kit aplicado proporcionalmente para 8 hóspedes e 4 dias!',
      toast_order_sent: 'Pedido #1 registrado! Encaminhado para aprovação do Concierge.',

      // Step 5a: Order list
      orders_queue_title: 'Fila de Pedidos das Casas',
      status_pending: '⏳ Em Aprovação',
      status_suppliers: '📲 Enviar Fornecedores',
      status_prep: '🚚 Preparação & Entrega',
      status_finalized: '✅ Finalizado',
      btn_open_order: 'Abrir Pedido #1',
      btn_back_list: '← Voltar à fila',

      // Step 5b: Suppliers tab (new!)
      btn_approve_send: 'Aprovar & Enviar p/ Fornecedores',
      btn_whatsapp_preview: 'Ver Disparo WhatsApp',
      sup_tab_label: 'Itens por Fornecedor',
      wa_preview_label: 'Prévia da mensagem WhatsApp:',
      toast_approved: 'Pedido aprovado! Listas enviadas para os 6 fornecedores via WhatsApp.',

      // Step 6 & 7: Order detail tabs
      phase_1: '1. Em Aprovação',
      phase_2: '2. Fornecedores',
      phase_3: '3. Preparação & NF-e',
      phase_4: '4. Finalizado',
      dtab_items: 'Pedido de Compras',
      dtab_notes: 'Comprovantes & Notas',
      dtab_audit: 'Hospedagem & Auditoria',
      fin_total_notes: 'Total das Notas',
      fin_paid_guest: 'Pago pelo Hóspede',
      fin_paid_concierge: 'Pago p/ Outra Pessoa (Concierge)',
      checklist_title: 'Conferência de Itens do Pedido',
      nfe_form_title: 'Gerenciar Notas das Compras & Pagamentos',
      field_supplier: 'Fornecedor',
      field_nfe_val: 'Valor da Nota (R$)',
      field_nfe_date: 'Data do Comprovante',
      field_payer: 'Quem pagou?',
      payer_guest: 'Hóspede (Adiantamento)',
      payer_concierge: 'Outra Pessoa / Concierge',
      btn_attach_nfe: 'Anexar NF-e / Comprovante Demo & Registrar',
      nfe_mock_badge: 'NF-e Anexada (Armazenamento Privado)',
      nfe_mock_key: 'Comprovante salvo com segurança, separando o que foi pago pelo Hóspede e pela Paralelo 17',
      btn_close_order: 'Fechar / Finalizar Pedido',
      xlsx_ready_title: 'Planilha .xlsx pronta para prestação de contas',
      xlsx_ready_sub: 'Aba Geral + abas coloridas por fornecedor prontas para prestação de contas.',
      btn_download_xlsx: 'Baixar Resumo Demo (.csv)',
      btn_preview_sheet: 'Visualizar Planilha Gerada',
      sheet_modal_title: 'pedido-MIR-204-concierge.xlsx',
      sheet_tab_general: 'Geral',
      sheet_col_sup: 'Fornecedor',
      sheet_col_item: 'Item',
      sheet_col_qty: 'Qtd',
      sheet_col_unit: 'Unid.',
      sheet_col_est: 'Estimativa (R$)',
      sheet_col_note: 'Similar / Pagador',
      sheet_row_total_est: 'Total Estimado do Pedido',
      sheet_row_total_notes: 'Total das Notas Lançadas',
      sheet_row_paid_guest: 'Pago pelo Hóspede',
      sheet_row_paid_concierge: 'Pago p/ Outra Pessoa (Concierge)',
      sheet_close_btn: 'Fechar',
      invite_title: 'Agora experimente você! Vamos fazer um Carbonara?',
      invite_desc: 'Assuma desde o início e faça as compras dos 5 ingredientes da Chef Camila (Macarrão, Bandeja de Ovos, Pimenta-do-Reino, Bacon e Queijo Parmesão) até gerar a planilha final.',
      invite_btn_start: '🍝 Iniciar Desafio Carbonara',
      invite_btn_preview: '👁 Visualizar Planilha Gerada',
      invite_btn_rewatch: '↻ Assistir Automático Novamente',
      carbonara_mission_title: '🍝 Missão da Chef Camila: Macarrão à Carbonara',
      carbonara_ingredients_word: 'ingredientes',
      carbonara_mission_hint: 'Clique em um ingrediente faltante para pular direto ao setor dele:',
      carbonara_mission_ready: '5/5 ingredientes no carrinho! Pode enviar o pedido para o Concierge.',
      audit_title: 'Trilha de Auditoria (America/Bahia)',
      toast_nfe_added: 'Comprovante salvo com segurança, separando o que foi pago pelo Hóspede e pela Paralelo 17.',
      toast_order_closed: 'Pedido #1 finalizado! Planilha pronta para prestação de contas liberada.',

      // Narrative Strip (new!)
      ns_persona_admin: '👔 Equipe Paralelo 17 (Painel)',
      ns_persona_cook: '📱 Celular da Cozinheira (Sem senha)',
      ns_step_of: 'Passo {n} de 7',
      ns_done_badge: '✅ Concluído • 7 de 7',
      ns_prev: '← Anterior',
      ns_next: 'Avançar →',
      ns_skip: 'Pular etapa →',
      ns_free: 'Explorar livre',
      ns_restart: '↻ Reiniciar',
      ns_steps: {
        '1': {
          title: 'Passo 1 de 7 — Login da Equipe',
          desc: 'A equipe Paralelo 17 entra no painel com perfis pré-configurados. Clique em "Entrar no Painel" para começar.'
        },
        '2': {
          title: 'Passo 2 de 7 — Criar Estadia',
          desc: 'Preencha ou ajuste os dados da Casa Mirante, datas e hóspedes. Clique em "Salvar Estadia" para gerar o link exclusivo da cozinheira.'
        },
        '3': {
          title: 'Passo 3 de 7 — Link da Cozinheira',
          desc: 'O sistema gera um link exclusivo enviado no WhatsApp — abre no celular sem baixar app e sem senha. Clique em "Acessar Cardápio".'
        },
        '4a': {
          title: 'Passo 4 de 7 — Cardápio da Cozinheira',
          desc: 'Você está no celular da Chef Camila (sem senha). Comece pelo setor Mercado adicionando os ingredientes do Macarrão à Carbonara.'
        },
        '4b': {
          title: 'Passo 4 de 7 — Enviar Pedido',
          desc: 'Ótimo! Continue pelos setores (Mercado, Açougue e Frios) para fechar os 5 itens do Carbonara ou clique em "Fechar / Enviar Pedido".'
        },
        '5a': {
          title: 'Passo 5 de 7 — Abrir Pedido no Painel',
          desc: 'De volta ao painel da Paralelo 17, o pedido da Chef Camila chegou na fila. Clique em "Abrir Pedido #1" para ver os itens por fornecedor.'
        },
        '5b': {
          title: 'Passo 5 de 7 — Aprovar e Enviar aos Fornecedores',
          desc: 'Confira os itens agrupados por fornecedor e a mensagem pronta para WhatsApp. Clique em "Aprovar & Enviar p/ Fornecedores" para avançar.'
        },
        '6': {
          title: 'Passo 6 de 7 — Notas & Comprovantes',
          desc: 'Confira os itens recebidos, defina quem pagou e clique em "Anexar NF-e / Comprovante" para salvar com segurança.'
        },
        '7': {
          title: 'Passo 7 de 7 — Finalizar Pedido',
          desc: 'Com a nota lançada e os totais conciliados, clique em "Fechar / Finalizar Pedido" para concluir o ciclo e liberar a planilha.'
        },
        '7done': {
          title: 'Ciclo Completo Concluído! 🎉',
          desc: 'Pedido finalizado, trilha de auditoria gravada e planilha pronta para prestação de contas. Reinicie o tour ou explore livremente.'
        }
      },

      // Micro-balloon one-liners (new!)
      mb_steps: {
        '1': '👆 Clique em "Entrar no Painel"',
        '2': '💾 Preencha e salve a estadia',
        '3': '📲 Abra o Cardápio da Cozinheira',
        '4a': '🍝 Adicione o Macarrão (+)',
        '4b': '📩 Envie o pedido para a equipe',
        '5a': '📋 Clique para abrir o Pedido #1',
        '5b': '📲 Aprove e envie no WhatsApp',
        '6': '🧾 Anexe uma nota fiscal simulada',
        '7': '✅ Feche e gere a planilha final',
        '7done': '🎉 Tour concluído!'
      }
    },
    en: {
      // Page Case Study Copy
      gc_eyebrow: 'Case Study + Sandbox • Paralelo 17 • 2026',
      gc_hero_title: 'Purchasing Management System — Paralelo 17',
      gc_hero_lead:
        'Working inside Paralelo 17\u2019s day-to-day Concierge operation, I spotted the bottleneck of managing stay groceries through scattered WhatsApp voice notes. I designed the entire end-to-end flow—from the team admin panel (/admin) to a passwordless cook menu (/e/:codigo) and invoice settlement—and built the full system into production.',
      gc_meta_client_val: 'Paralelo 17 (Concierge) • Southern Bahia',
      gc_meta_services_val: 'Workflow Design & Full-Stack Engineering',
      gc_sb_badge: 'Interactive Demo • Mock Data',
      gc_sb_heading: 'Watch the auto-demo or take the 7-step Carbonara Challenge',
      gc_sb_sub:
        'Scroll here to watch the automated Carbonara order flow end to end—then take over from step 1, pick all 5 ingredients, and preview the generated spreadsheet.',
      gc_overview_label: '01 • Origin, Workflow & Build',
      gc_overview_title: 'How I spotted the bottleneck at Paralelo 17, designed the flow, and built it end to end',
      gc_overview_p1:
        'Observing Paralelo 17\u2019s luxury vacation rental Concierge routine in Southern Bahia, I noticed a clear operational need: every stay turned into scattered WhatsApp audios and improvised lists between guests, house cooks, and staff—causing missed quantities, manual supplier splits across 6 partners, and hours reconciling receipts by hand.',
      gc_overview_p2:
        'Starting from that real-world pain point, I mapped and designed the complete architecture before writing the first line of code: the Concierge creates a stay in /admin and shares a zero-login link (/e/:codigo); the cook picks items or proportional kits on mobile and submits the order; the team approves, dispatches supplier-formatted WhatsApp messages, logs invoices by payer, and closes the order with an automated .xlsx workbook.',
      gc_pill_1: '172 Items / 6 Suppliers',
      gc_pill_2: '5 Proportional Kits',
      gc_pill_3: 'No-Login Link (/e/:codigo)',
      gc_pill_4: 'Private Receipt Storage',
      gc_arch_label: '02 • Technical Architecture & Security',
      gc_arch_title: 'React 19, Supabase with RLS, and ExcelJS financial settlement',
      gc_arch_intro:
        'Engineered for zero friction on the cook\u2019s phone and strict financial governance for the Concierge team, backed by PostgreSQL Row Level Security.',
      gc_arch_c1_title: 'React 19, TypeScript & Tailwind v4',
      gc_arch_c1_desc:
        'Responsive interface built with React 19, strict TypeScript, Vite 8, and Tailwind CSS v4. The menu automatically scales 5 preset kits (BBQ, Feijoada, Breakfast, Tropical Bar, Kids) based on guest count and stay duration.',
      gc_arch_c2_title: 'PostgreSQL, RPCs & Private Storage',
      gc_arch_c2_desc:
        'Supabase persistence with Row Level Security (RLS), hardened RPCs (obter_estadia and criar_pedido using FOR UPDATE locks for sequential numbering), and a private receipt bucket with compression and signed URLs.',
      gc_arch_c3_title: '.xlsx Reports & Automated Tests',
      gc_arch_c3_desc:
        'Instant ExcelJS workbook generation with a consolidated summary tab plus color-coded supplier sheets, formatted WhatsApp dispatch messages, and 4 Vitest test suites alongside Oxlint.',
      gc_flow_title: 'End-to-End Operational Flow',
      gc_flow_s1_title: '1. Stay (/admin)',
      gc_flow_s1_desc: 'Concierge registers the house, dates, and guests, generating a unique stay code.',
      gc_flow_s2_title: '2. Menu (/e/:codigo)',
      gc_flow_s2_desc: 'Cook opens the link without login, picks categories or kits, and submits the order.',
      gc_flow_s3_title: '3. Suppliers & WhatsApp',
      gc_flow_s3_desc: 'Dashboard groups items by supplier and formats WhatsApp messages for 6 partners.',
      gc_flow_s4_title: '4. Invoices & Excel .xlsx',
      gc_flow_s4_desc: 'Team attaches receipts, tracks payer (guest vs. concierge), and exports the .xlsx sheet.',
      gc_cta_label: '03 • Next Step',
      gc_cta_title: 'Want to turn manual operations into a custom web platform?',
      gc_cta_desc:
        'I build end-to-end web applications, operational dashboards, and data automations designed to remove real business bottlenecks.',

      // Sandbox Chrome & Rail
      role_admin: 'Concierge Mode (/admin)',
      role_cook: 'Cook Mode (/e/MIR-204)',
      tour_guided: 'Guided Tour',
      tour_free: 'Free Explore',
      btn_restart: 'Restart Tour',
      btn_free_explore: 'Explore freely',
      btn_resume_tour: 'Resume Guide',
      btn_autoplay_watch: 'Watch Auto-Demo',
      btn_autoplay_pause: 'Pause Auto-Demo',
      ns_autoplay_badge: '▶ AUTO DEMO',
      rail_steps: [
        '1. Login',
        '2. Create Stay',
        '3. Menu Link',
        '4. Cook Order',
        '5. Approve Order',
        '6. Invoices',
        '7. Close & .xlsx'
      ],

      // App UI Common
      app_brand: 'Trancoso Concierge',
      app_sub: 'Purchasing & Stay Operations',
      btn_logout: 'Sign out',
      btn_back_admin: 'Back to /admin',
      guests_word: 'guests',
      days_word: 'days',
      items_word: 'items',
      item_word: 'item',
      units_word: 'units',

      // Step 1: Login
      login_title: 'Team Access',
      login_sub: 'Sign in to the operations dashboard using a demo profile.',
      login_profiles_lbl: 'Registered Profiles (Demo)',
      login_user_lbl: 'Username or Email',
      login_pass_lbl: 'Password',
      login_remember: 'Keep signed in on this device',
      login_btn: 'Enter Dashboard',
      role_concierge: 'Concierge',
      role_supervisor: 'Stay Supervisor',

      // Step 2 & 3: Stays
      tab_stays: 'Stays',
      tab_orders: 'All Orders',
      filter_active: 'Active',
      filter_done: 'Completed',
      filter_archived: 'Archived',
      btn_new_stay: '+ New Stay',
      new_stay_title: 'Create New Stay',
      field_house: 'House Name *',
      field_checkin: 'Check-in *',
      field_checkout: 'Check-out *',
      field_guests: 'Guests *',
      field_responsible: 'Owner (Team) *',
      field_holder: 'Primary Guest *',
      field_notes: 'Concierge Notes',
      btn_save_stay: 'Save Stay',
      stay_status_active: 'Active',
      cook_link_label: 'Cook Link:',
      btn_copy_link: 'Copy Link',
      btn_whatsapp_invite: 'WhatsApp',
      btn_open_menu: 'Open Menu (Cook Link)',
      toast_stay_saved: 'Stay created! Exclusive link sent via WhatsApp — opens on mobile with no app download or password.',
      toast_link_copied: 'Link /e/MIR-204 copied to clipboard!',
      toast_wa_invite: 'WhatsApp invite sent to Chef Camila — passwordless mobile access.',

      // Step 4: Cook Menu
      menu_welcome: 'No-login access active for',
      menu_catalog_meta: '172 items in full catalog • Interactive sample by supplier',
      kits_label: 'Ready Kits (scaled for',
      kit_applied_tag: 'applied',
      btn_similar_yes: 'Accept substitute: Yes',
      btn_similar_no: 'Accept substitute: No',
      summary_selected: 'in cart',
      summary_est: 'Est. base:',
      btn_send_order: 'Close / Send Order',
      toast_kit_added: 'Kit scaled for 8 guests & 4 days added to cart!',
      toast_order_sent: 'Order #1 registered! Routed to Concierge approval queue.',

      // Step 5a: Order list
      orders_queue_title: 'House Orders Queue',
      status_pending: '⏳ Pending Approval',
      status_suppliers: '📲 Send to Suppliers',
      status_prep: '🚚 Prep & Delivery',
      status_finalized: '✅ Finalized',
      btn_open_order: 'Open Order #1',
      btn_back_list: '← Back to queue',

      // Step 5b: Suppliers tab (new!)
      btn_approve_send: 'Approve & Dispatch to Suppliers',
      btn_whatsapp_preview: 'WhatsApp Preview',
      sup_tab_label: 'Items by Supplier',
      wa_preview_label: 'WhatsApp message preview:',
      toast_approved: 'Order approved! Lists dispatched to 6 suppliers via WhatsApp.',

      // Step 6 & 7: Order detail tabs
      phase_1: '1. Approval',
      phase_2: '2. Suppliers',
      phase_3: '3. Prep & Invoices',
      phase_4: '4. Finalized',
      dtab_items: 'Purchase Order',
      dtab_notes: 'Receipts & Invoices',
      dtab_audit: 'Stay & Audit Trail',
      fin_total_notes: 'Total Invoices',
      fin_paid_guest: 'Paid by Guest',
      fin_paid_concierge: 'Paid by Other / Concierge',
      checklist_title: 'Item Verification Checklist',
      nfe_form_title: 'Manage Purchase Invoices & Payments',
      field_supplier: 'Supplier',
      field_nfe_val: 'Invoice Amount (BRL)',
      field_nfe_date: 'Receipt Date',
      field_payer: 'Who paid?',
      payer_guest: 'Guest (Advance)',
      payer_concierge: 'Other / Concierge',
      btn_attach_nfe: 'Attach Mock Receipt / Invoice & Save',
      nfe_mock_badge: 'Invoice Attached (Private Storage)',
      nfe_mock_key: 'Receipt stored securely, tracking what was paid by the Guest vs. Paralelo 17',
      btn_close_order: 'Close / Finalize Order',
      xlsx_ready_title: 'Spreadsheet .xlsx ready for accounting',
      xlsx_ready_sub: 'General summary tab + color-coded supplier tabs ready for settlement.',
      btn_download_xlsx: 'Download Demo Summary (.csv)',
      btn_preview_sheet: 'Preview Generated Sheet',
      sheet_modal_title: 'order-MIR-204-concierge.xlsx',
      sheet_tab_general: 'General',
      sheet_col_sup: 'Supplier',
      sheet_col_item: 'Item',
      sheet_col_qty: 'Qty',
      sheet_col_unit: 'Unit',
      sheet_col_est: 'Est. (BRL)',
      sheet_col_note: 'Subst. / Payer',
      sheet_row_total_est: 'Estimated Order Total',
      sheet_row_total_notes: 'Total Logged Invoices',
      sheet_row_paid_guest: 'Paid by Guest',
      sheet_row_paid_concierge: 'Paid by Other / Concierge',
      sheet_close_btn: 'Close',
      invite_title: 'Now it’s your turn! Let’s make a Carbonara?',
      invite_desc: 'Take over from Step 1 and shop for Chef Camila’s 5 ingredients (Spaghetti, Tray of Eggs, Black Pepper, Bacon, and Parmesan) all the way to the final spreadsheet.',
      invite_btn_start: '🍝 Start Carbonara Challenge',
      invite_btn_preview: '👁 Preview Generated Sheet',
      invite_btn_rewatch: '↻ Watch Auto-Demo Again',
      carbonara_mission_title: '🍝 Chef Camila’s Mission: Pasta Carbonara',
      carbonara_ingredients_word: 'ingredients',
      carbonara_mission_hint: 'Click any missing ingredient to jump straight to its supplier:',
      carbonara_mission_ready: '5/5 ingredients in cart! Ready to send the order to the Concierge.',
      audit_title: 'Audit Trail (America/Bahia)',
      toast_nfe_added: 'Receipt stored securely, tracking what was paid by the Guest vs. Paralelo 17.',
      toast_order_closed: 'Order #1 finalized! Spreadsheet ready for accounting unlocked.',

      // Narrative Strip (new!)
      ns_persona_admin: '👔 Paralelo 17 Team (Dashboard)',
      ns_persona_cook: '📱 Cook\'s Phone (No password)',
      ns_step_of: 'Step {n} of 7',
      ns_done_badge: '✅ Completed • 7 of 7',
      ns_prev: '← Previous',
      ns_next: 'Advance →',
      ns_skip: 'Skip step →',
      ns_free: 'Free explore',
      ns_restart: '↻ Restart',
      ns_steps: {
        '1': {
          title: 'Step 1 of 7 — Team Login',
          desc: 'The Paralelo 17 team signs into the dashboard with pre-configured profiles. Click "Enter Dashboard" to begin.'
        },
        '2': {
          title: 'Step 2 of 7 — Create Stay',
          desc: 'Fill in or adjust Casa Mirante\'s details, dates, and guests. Click "Save Stay" to generate the cook\'s exclusive link.'
        },
        '3': {
          title: 'Step 3 of 7 — Cook\'s Link',
          desc: 'The system generates an exclusive link sent via WhatsApp — opens on mobile with no app download or password. Click "Open Menu (Cook Link)".'
        },
        '4a': {
          title: 'Step 4 of 7 — Cook\'s Menu',
          desc: 'You are viewing Chef Camila\'s phone (no login). Start in Market by adding the Pasta Carbonara ingredients.'
        },
        '4b': {
          title: 'Step 4 of 7 — Send Order',
          desc: 'Great! Pick the remaining Carbonara items across Market, Butcher, and Deli & Dairy—or click "Close / Send Order" now.'
        },
        '5a': {
          title: 'Step 5 of 7 — Open Order in Dashboard',
          desc: 'Back in the Paralelo 17 dashboard, Chef Camila\'s order is waiting. Click "Open Order #1" to see items by supplier.'
        },
        '5b': {
          title: 'Step 5 of 7 — Approve & Send to Suppliers',
          desc: 'Review items grouped by supplier and the WhatsApp message ready to send. Click "Approve & Dispatch to Suppliers" to proceed.'
        },
        '6': {
          title: 'Step 6 of 7 — Invoices & Receipts',
          desc: 'Verify received items, select who paid, and click "Attach Mock Receipt / Invoice & Save" to store securely.'
        },
        '7': {
          title: 'Step 7 of 7 — Finalize Order',
          desc: 'With the invoice logged and balances updated, click "Close / Finalize Order" to complete the cycle and unlock the spreadsheet.'
        },
        '7done': {
          title: 'Full Cycle Completed! 🎉',
          desc: 'Order finalized, audit trail recorded, and spreadsheet ready for accounting. Restart the tour anytime or explore freely.'
        }
      },

      // Micro-balloon one-liners (new!)
      mb_steps: {
        '1': '👆 Click "Enter Dashboard"',
        '2': '💾 Fill in & save the stay',
        '3': '📲 Open the Cook\'s Menu',
        '4a': '🍝 Add Spaghetti (+)',
        '4b': '📩 Send the order to the team',
        '5a': '📋 Click to open Order #1',
        '5b': '📲 Approve & send via WhatsApp',
        '6': '🧾 Attach a mock invoice',
        '7': '✅ Close & generate spreadsheet',
        '7done': '🎉 Tour completed!'
      }
    }
  };

  /* ------------------------------------------------------------------------
     Catalog Data (Sanitized Sample of the 6 Real Suppliers + 5 Kits)
     ------------------------------------------------------------------------ */
  var SUPPLIERS = [
    { id: 'mercado', pt: 'Mercado', en: 'Market', color: '#d97706', count: 63 },
    { id: 'acougue', pt: 'Açougue', en: 'Butcher', color: '#b91c1c', count: 20 },
    { id: 'frios-laticinios', pt: 'Frios & Laticínios', en: 'Deli & Dairy', color: '#f59e0b', count: 19 },
    { id: 'hortifruti', pt: 'Hortifruti', en: 'Produce', color: '#059669', count: 40 },
    { id: 'bebidas', pt: 'Bebidas', en: 'Beverages', color: '#7c3aed', count: 21 },
    { id: 'peixaria', pt: 'Peixaria', en: 'Seafood', color: '#0284c7', count: 9 }
  ];

  var CARBONARA_META = [
    { id: 'mc-pasta', sup: 'mercado', shortPt: 'Macarrão', shortEn: 'Spaghetti' },
    { id: 'mc-2', sup: 'mercado', shortPt: 'Bandeja de Ovos', shortEn: 'Eggs Tray' },
    { id: 'mc-pimenta', sup: 'mercado', shortPt: 'Pimenta-do-Reino', shortEn: 'Black Pepper' },
    { id: 'ac-bacon', sup: 'acougue', shortPt: 'Bacon', shortEn: 'Bacon' },
    { id: 'fr-parmesao', sup: 'frios-laticinios', shortPt: 'Queijo Parmesão', shortEn: 'Parmesan' }
  ];

  var CATALOG = [
    { id: 'mc-pasta', sup: 'mercado', pt: 'Macarrão Espaguete Grano Duro', en: 'Grano Duro Spaghetti', unit: 'pct', price: 14.5, carbonara: true },
    { id: 'mc-2', sup: 'mercado', pt: 'Bandeja de Ovos', en: 'Tray of Eggs (30)', unit: 'bdj', price: 28.0, carbonara: true },
    { id: 'mc-pimenta', sup: 'mercado', pt: 'Pimenta-do-Reino Preta', en: 'Black Peppercorns', unit: 'vidro', price: 16.0, carbonara: true },
    { id: 'mc-1', sup: 'mercado', pt: 'Carvão Vegetal Graúdo 4kg', en: 'Lump Charcoal 4kg', unit: 'pct', price: 32.0 },
    { id: 'mc-3', sup: 'mercado', pt: 'Arroz Branco Tipo 1', en: 'White Rice Type 1', unit: 'kg', price: 8.9 },
    { id: 'mc-4', sup: 'mercado', pt: 'Sorvete de Creme Nobre', en: 'Artisanal Vanilla Ice Cream', unit: 'un', price: 42.0 },

    { id: 'ac-bacon', sup: 'acougue', pt: 'Bacon em Cubos Defumado', en: 'Smoked Diced Bacon', unit: 'kg', price: 46.0, carbonara: true },
    { id: 'ac-1', sup: 'acougue', pt: 'Picanha Bovina Especial', en: 'Prime Beef Picanha', unit: 'kg', price: 96.0 },
    { id: 'ac-2', sup: 'acougue', pt: 'Filé-Mignon Limpo Inteiro', en: 'Whole Trimmed Tenderloin', unit: 'kg', price: 108.0 },
    { id: 'ac-3', sup: 'acougue', pt: 'Costela Bovina para Assar', en: 'Roasting Beef Ribs', unit: 'kg', price: 48.0 },
    { id: 'ac-4', sup: 'acougue', pt: 'Fraldinha para Churrasco', en: 'BBQ Flank Steak', unit: 'kg', price: 58.0 },

    { id: 'fr-parmesao', sup: 'frios-laticinios', pt: 'Queijo Parmesão em Peça', en: 'Parmesan Cheese Block', unit: 'kg', price: 94.0, carbonara: true },
    { id: 'fr-1', sup: 'frios-laticinios', pt: 'Presunto Cozido Nobre Fatiado', en: 'Sliced Cooked Ham', unit: 'kg', price: 54.0 },
    { id: 'fr-2', sup: 'frios-laticinios', pt: 'Salame Italiano Fatiado', en: 'Sliced Italian Salami', unit: 'kg', price: 89.0 },
    { id: 'fr-3', sup: 'frios-laticinios', pt: 'Peito de Peru Defumado', en: 'Smoked Turkey Breast', unit: 'kg', price: 68.0 },
    { id: 'fr-4', sup: 'frios-laticinios', pt: 'Queijo Mussarela Fatiado', en: 'Sliced Mozzarella Cheese', unit: 'kg', price: 56.0 },

    { id: 'hf-1', sup: 'hortifruti', pt: 'Mamão Formosa / Papaia', en: 'Formosa / Papaya', unit: 'un', price: 11.5 },
    { id: 'hf-2', sup: 'hortifruti', pt: 'Banana Prata', en: 'Silver Banana', unit: 'kg', price: 9.8 },
    { id: 'hf-3', sup: 'hortifruti', pt: 'Banana da Terra Madura', en: 'Ripe Plantain', unit: 'un', price: 4.5 },
    { id: 'hf-4', sup: 'hortifruti', pt: 'Laranja Pera', en: 'Fresh Oranges', unit: 'kg', price: 8.5 },

    { id: 'bb-1', sup: 'bebidas', pt: 'Água Mineral sem Gás 500ml', en: 'Still Mineral Water 500ml', unit: 'un', price: 3.2 },
    { id: 'bb-2', sup: 'bebidas', pt: 'Água Mineral com Gás 300ml', en: 'Sparkling Water 300ml', unit: 'un', price: 4.0 },
    { id: 'bb-3', sup: 'bebidas', pt: 'Água de Coco Natural Integral', en: 'Natural Coconut Water', unit: 'L', price: 16.0 },
    { id: 'bb-4', sup: 'bebidas', pt: 'Suco de Laranja Integral', en: '100% Orange Juice', unit: 'L', price: 18.5 },

    { id: 'px-1', sup: 'peixaria', pt: 'Camarão Rosa VG Limpo', en: 'Cleaned Pink Shrimp VG', unit: 'kg', price: 128.0 },
    { id: 'px-2', sup: 'peixaria', pt: 'Peixe Branco em Postas', en: 'White Fish Steaks', unit: 'kg', price: 78.0 },
    { id: 'px-3', sup: 'peixaria', pt: 'Filé de Salmão Fresco', en: 'Fresh Salmon Fillet', unit: 'kg', price: 112.0 },
    { id: 'px-4', sup: 'peixaria', pt: 'Filé de Tilápia / Saint Peter', en: 'Tilapia / Saint Peter Fillet', unit: 'kg', price: 64.0 }
  ];

  var KITS = [
    {
      id: 'kit-churrasco',
      pt: 'Churrasco Completo',
      en: 'Full BBQ Kit',
      items: [
        { id: 'ac-1', qty: 2.5 },
        { id: 'ac-4', qty: 1.5 },
        { id: 'mc-1', qty: 2 }
      ]
    },
    {
      id: 'kit-feijoada',
      pt: 'Feijoada de Domingo',
      en: 'Sunday Feijoada',
      items: [
        { id: 'ac-3', qty: 2 },
        { id: 'mc-3', qty: 2 },
        { id: 'hf-4', qty: 2 }
      ]
    },
    {
      id: 'kit-cafe',
      pt: 'Café da Manhã',
      en: 'Breakfast Kit',
      items: [
        { id: 'fr-1', qty: 1 },
        { id: 'fr-4', qty: 1 },
        { id: 'hf-1', qty: 2 },
        { id: 'mc-2', qty: 1 }
      ]
    },
    {
      id: 'kit-bar',
      pt: 'Bebidas & Bar Tropical',
      en: 'Tropical Bar',
      items: [
        { id: 'bb-1', qty: 12 },
        { id: 'bb-2', qty: 8 },
        { id: 'bb-3', qty: 4 }
      ]
    },
    {
      id: 'kit-kids',
      pt: 'Kids & Sobremesa',
      en: 'Kids & Dessert',
      items: [
        { id: 'bb-4', qty: 3 },
        { id: 'mc-4', qty: 2 },
        { id: 'hf-2', qty: 2 }
      ]
    }
  ];

  var PROFILES = [
    { id: 'andre', name: 'Concierge André', user: '@concierge.andre', roleKey: 'role_concierge' },
    { id: 'camila', name: 'Supervisão Camila', user: '@sup.camila', roleKey: 'role_supervisor' }
  ];

  /* ------------------------------------------------------------------------
     Sandbox Application State
     tourStep: '1'|'2'|'3'|'4a'|'4b'|'5a'|'5b'|'6'|'7'|'7done'
     ------------------------------------------------------------------------ */
  var state = null;

  function createInitialState() {
    return {
      tourActive: true,
      tourStep: '1',
      screen: 'login',
      adminTab: 'stays',
      stayFilter: 'active',
      showNewStayForm: true,
      selectedProfile: 'andre',
      loginUser: '@concierge.andre',
      loginPass: 'demo-concierge-2026',
      loggedInUser: 'Concierge André',
      stayDraft: {
        house: 'Casa Mirante — Trancoso',
        checkin: '2026-12-18',
        checkout: '2026-12-22',
        guests: 8,
        responsible: 'Concierge André',
        holder: 'Dr. Eduardo Nogueira',
        notes: 'Recepção com frutas tropicais e bebidas geladas'
      },
      stays: [
        {
          id: 'stay-pre',
          code: 'BRI-108',
          house: 'Vila Brisa — Caraíva',
          checkin: '2026-12-10',
          checkout: '2026-12-14',
          days: 4,
          guests: 6,
          responsible: 'Supervisão Camila',
          holder: 'Mariana Vasconcelos',
          cook: 'Chef Lucas',
          status: 'active',
          isNew: false
        }
      ],
      activeStayCode: 'MIR-204',
      activeSupplier: 'mercado',
      appliedKits: {},
      cart: {},
      orders: [],
      selectedOrderId: null,
      orderDetailTab: 'items',
      showWhatsappPreview: false,
      nfeDraft: {
        supplier: 'mercado',
        amount: '157.50',
        date: '2026-12-18',
        payer: 'guest'
      },
      autoPlayStatus: 'idle',
      autoPlayIndex: 0,
      showCarbonaraInvite: false,
      showSheetModal: false,
      activeSheetTab: 'geral',
      challengeMode: false,
      toast: null
    };
  }

  function t(key) {
    var dict = I18N[lang] || I18N.pt;
    return dict[key] !== undefined ? dict[key] : key;
  }

  function formatBRL(val) {
    var num = Number(val) || 0;
    return 'R$ ' + num.toFixed(2).replace('.', ',');
  }

  function calcDays(checkin, checkout) {
    try {
      var d1 = new Date(checkin);
      var d2 = new Date(checkout);
      var diff = Math.round((d2 - d1) / 86400000);
      return diff > 0 ? diff : 4;
    } catch (e) {
      return 4;
    }
  }

  function getCatalogItem(id) {
    for (var i = 0; i < CATALOG.length; i++) {
      if (CATALOG[i].id === id) return CATALOG[i];
    }
    return null;
  }

  function getSupplierObj(supId) {
    for (var i = 0; i < SUPPLIERS.length; i++) {
      if (SUPPLIERS[i].id === supId) return SUPPLIERS[i];
    }
    return SUPPLIERS[0];
  }

  function getCartStats() {
    var count = 0;
    var units = 0;
    var total = 0;
    Object.keys(state.cart).forEach(function (id) {
      var entry = state.cart[id];
      if (!entry || entry.qty <= 0) return;
      var item = getCatalogItem(id);
      if (!item) return;
      count += 1;
      units += entry.qty;
      total += entry.qty * item.price;
    });
    return { count: count, units: units, total: total };
  }

  function getCarbonaraStats() {
    var doneCount = 0;
    var items = CARBONARA_META.map(function (cm) {
      var entry = state.cart[cm.id];
      var inCart = !!(entry && entry.qty > 0);
      if (inCart) doneCount += 1;
      return {
        id: cm.id,
        sup: cm.sup,
        shortPt: cm.shortPt,
        shortEn: cm.shortEn,
        done: inCart
      };
    });
    return { doneCount: doneCount, total: CARBONARA_META.length, items: items };
  }

  function populateCarbonaraCart() {
    state.cart['mc-pasta'] = { qty: 2, similar: true };
    state.cart['mc-2'] = { qty: 1, similar: true };
    state.cart['mc-pimenta'] = { qty: 1, similar: true };
    state.cart['ac-bacon'] = { qty: 1, similar: true };
    state.cart['fr-parmesao'] = { qty: 0.5, similar: true };
  }

  /* Returns the word "item" or "items" (PT: "item"/"itens") based on count */
  function itemsWord(count) {
    var dict = I18N[lang] || I18N.pt;
    if (count === 1) return dict.item_word || (lang === 'en' ? 'item' : 'item');
    return dict.items_word || (lang === 'en' ? 'items' : 'itens');
  }

  function getCurrentOrder() {
    if (!state.selectedOrderId) return null;
    for (var i = 0; i < state.orders.length; i++) {
      if (state.orders[i].id === state.selectedOrderId) return state.orders[i];
    }
    return null;
  }

  function showToast(msg) {
    state.toast = msg;
    render();
    setTimeout(function () {
      if (state && state.toast === msg) {
        state.toast = null;
        var toastEl = rootEl && rootEl.querySelector('.sb-toast');
        if (toastEl) toastEl.remove();
      }
    }, 2800);
  }

  function clearToast() {
    state.toast = null;
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------------
     Page-Level Translation Hook ([data-gc-i18n])
     ------------------------------------------------------------------------ */
  function applyPageTranslations() {
    var dict = I18N[lang] || I18N.pt;
    document.querySelectorAll('[data-gc-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-gc-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });
  }

  /* ------------------------------------------------------------------------
     Business Actions
     ------------------------------------------------------------------------ */
  function doLogin() {
    var prof = PROFILES.find(function (p) {
      return p.id === state.selectedProfile;
    }) || PROFILES[0];
    state.loggedInUser = prof.name;
    state.screen = 'admin';
    state.adminTab = 'stays';
    state.showNewStayForm = true;
    clearToast();
    if (state.tourActive && state.tourStep === '1') {
      state.tourStep = '2';
    }
    renderAndScroll('step-2-save-stay-btn');
  }

  function doSaveStay() {
    var draft = state.stayDraft;
    var houseName = (draft.house || '').trim() || 'Casa Mirante — Trancoso';
    var guests = Math.max(1, parseInt(draft.guests, 10) || 8);
    var days = calcDays(draft.checkin, draft.checkout);
    var existing = state.stays.find(function (s) {
      return s.code === 'MIR-204';
    });

    if (!existing) {
      state.stays.unshift({
        id: 'stay-mir-204',
        code: 'MIR-204',
        house: houseName,
        checkin: draft.checkin || '2026-12-18',
        checkout: draft.checkout || '2026-12-22',
        days: days,
        guests: guests,
        responsible: draft.responsible || state.loggedInUser,
        holder: (draft.holder || '').trim() || 'Dr. Eduardo Nogueira',
        cook: 'Chef Camila',
        status: 'active',
        isNew: true
      });
    } else {
      existing.house = houseName;
      existing.guests = guests;
      existing.days = days;
      existing.holder = (draft.holder || '').trim() || existing.holder;
    }

    state.activeStayCode = 'MIR-204';
    state.showNewStayForm = false;
    clearToast();
    if (state.tourActive && (state.tourStep === '1' || state.tourStep === '2')) {
      state.tourStep = '3';
    }
    showToast(t('toast_stay_saved'));
    scrollTargetLater('step-3-open-menu-btn');
  }

  function doOpenMenu(code) {
    state.activeStayCode = code || 'MIR-204';
    state.screen = 'menu';
    clearToast();
    if (state.tourActive && (state.tourStep === '3' || state.tourStep === '2')) {
      var stats = getCartStats();
      state.tourStep = stats.count > 0 ? '4b' : '4a';
    }
    var targetId = state.tourStep === '4b' ? 'step-4b-send-order-btn' : 'step-4a-add-item-btn';
    renderAndScroll(targetId);
  }

  function doChangeQty(itemId, delta) {
    var current = state.cart[itemId] ? state.cart[itemId].qty : 0;
    var step = 1;
    var item = getCatalogItem(itemId);
    if (item && (item.unit === 'kg' || item.unit === 'L')) {
      step = 0.5;
    }
    var next = Math.max(0, Math.round((current + delta * step) * 10) / 10);
    if (next <= 0) {
      delete state.cart[itemId];
    } else {
      state.cart[itemId] = {
        qty: next,
        similar: state.cart[itemId] ? state.cart[itemId].similar : true
      };
    }

    var stats = getCartStats();
    var cStats = getCarbonaraStats();
    if (state.tourActive) {
      if (state.tourStep === '4a' && stats.count >= 1) {
        state.tourStep = '4b';
        if (cStats.doneCount === cStats.total) {
          renderAndScroll('step-4b-send-order-btn');
        } else {
          render();
        }
        return;
      } else if (state.tourStep === '4b' && cStats.doneCount === cStats.total && delta > 0) {
        renderAndScroll('step-4b-send-order-btn');
        return;
      } else if (state.tourStep === '4b' && stats.count === 0) {
        state.tourStep = '4a';
        renderAndScroll('step-4a-add-item-btn');
        return;
      }
    }
    render();
  }

  function doApplyKit(kitId) {
    var kit = KITS.find(function (k) {
      return k.id === kitId;
    });
    if (!kit) return;
    kit.items.forEach(function (ki) {
      var prev = state.cart[ki.id] ? state.cart[ki.id].qty : 0;
      state.cart[ki.id] = {
        qty: Math.round((prev + ki.qty) * 10) / 10,
        similar: true
      };
    });
    state.appliedKits[kitId] = true;
    if (state.tourActive && state.tourStep === '4a') {
      state.tourStep = '4b';
      showToast(t('toast_kit_added'));
      scrollTargetLater('step-4b-send-order-btn');
      return;
    }
    showToast(t('toast_kit_added'));
  }

  function doSendOrder() {
    var stats = getCartStats();
    if (stats.count === 0) {
      populateCarbonaraCart();
      stats = getCartStats();
    }

    var orderItems = [];
    Object.keys(state.cart).forEach(function (id) {
      var entry = state.cart[id];
      var item = getCatalogItem(id);
      if (entry && entry.qty > 0 && item) {
        orderItems.push({
          id: item.id,
          sup: item.sup,
          pt: item.pt,
          en: item.en,
          unit: item.unit,
          qty: entry.qty,
          price: item.price,
          similar: entry.similar,
          checked: true
        });
      }
    });

    var firstSup = orderItems.length ? orderItems[0].sup : 'mercado';
    var orderObj = {
      id: 'ord-1',
      number: 1,
      stayCode: state.activeStayCode || 'MIR-204',
      house: state.stayDraft.house || 'Casa Mirante — Trancoso',
      cook: 'Chef Camila',
      status: 'pending',
      createdAt: '21:14',
      items: orderItems,
      totalEstimate: stats.total,
      notes: [],
      audit: [
        { time: '21:14 BRT', pt: 'Pedido #1 criado por Chef Camila — acesso sem senha pelo celular', en: 'Order #1 created by Chef Camila — passwordless mobile access' }
      ]
    };

    state.orders = [orderObj];
    state.selectedOrderId = null;
    state.nfeDraft.supplier = firstSup;
    state.nfeDraft.amount = stats.total.toFixed(2);
    state.screen = 'admin';
    state.adminTab = 'orders';
    clearToast();

    if (state.tourActive) {
      state.tourStep = '5a';
    }
    showToast(t('toast_order_sent'));
    scrollTargetLater('step-5a-open-order-btn');
  }

  function doOpenOrder(orderId) {
    state.selectedOrderId = orderId || (state.orders[0] && state.orders[0].id);
    var ord = getCurrentOrder();
    if (!ord) return;
    // Don't skip 5b: show the items tab (Pedido de Compras) first with WA preview
    state.orderDetailTab = 'items';
    state.showWhatsappPreview = true;
    clearToast();
    if (state.tourActive && (state.tourStep === '5a' || state.tourStep === '4b')) {
      state.tourStep = '5b';
    }
    renderAndScroll('step-5b-approve-btn');
  }

  function doApproveAndSend() {
    var ord = getCurrentOrder();
    if (!ord) return;
    if (ord.status === 'pending') {
      ord.status = 'prep';
      ord.audit.push({
        time: '21:16 BRT',
        pt: 'Pedido aprovado e listas enviadas aos fornecedores por ' + state.loggedInUser,
        en: 'Order approved & lists dispatched to suppliers by ' + state.loggedInUser
      });
    }
    state.orderDetailTab = 'notes';
    state.showWhatsappPreview = false;
    clearToast();
    if (state.tourActive && state.tourStep === '5b') {
      state.tourStep = '6';
    }
    showToast(t('toast_approved'));
    scrollTargetLater('step-6-attach-nfe-btn');
  }

  function doAttachMockNfe() {
    var ord = getCurrentOrder();
    if (!ord) return;
    var amt = parseFloat(String(state.nfeDraft.amount).replace(',', '.'));
    if (isNaN(amt) || amt <= 0) amt = ord.totalEstimate || 256.0;

    var supObj = getSupplierObj(state.nfeDraft.supplier);
    ord.notes.push({
      id: 'nfe-' + (ord.notes.length + 1),
      nfeNum: 'NF-e 004.' + (812 + ord.notes.length),
      supplierId: supObj.id,
      supplierPt: supObj.pt,
      supplierEn: supObj.en,
      amount: amt,
      date: state.nfeDraft.date || '2026-12-18',
      payer: state.nfeDraft.payer || 'guest'
    });

    if (ord.status !== 'finalized') {
      ord.status = 'prep';
    }
    ord.audit.push({
      time: '21:18 BRT',
      pt: 'Comprovante salvo — ' + supObj.pt + ' • ' + formatBRL(amt),
      en: 'Receipt stored securely — ' + supObj.en + ' • ' + formatBRL(amt)
    });

    clearToast();
    if (state.tourActive && state.tourStep === '6') {
      state.tourStep = '7';
    }
    showToast(t('toast_nfe_added'));
    scrollTargetLater('step-7-close-order-btn');
  }

  function doCloseOrder() {
    var ord = getCurrentOrder();
    if (!ord) return;
    if (ord.notes.length === 0) {
      doAttachMockNfe();
    }
    ord.status = 'finalized';
    ord.audit.push({
      time: '21:20 BRT',
      pt: 'Pedido #1 finalizado por ' + state.loggedInUser + ' • Planilha pronta para prestação de contas',
      en: 'Order #1 finalized by ' + state.loggedInUser + ' • Spreadsheet ready for accounting'
    });

    clearToast();
    if (state.tourActive) {
      state.tourStep = '7done';
    }
    showToast(t('toast_order_closed'));
    scrollTargetLater('step-7done-xlsx-card');
  }

  function jumpToTourStep(targetStep) {
    clearToast();
    state.showCarbonaraInvite = false;
    state.showSheetModal = false;
    if (targetStep === '1') {
      state.screen = 'login';
      state.tourStep = '1';
      renderAndScroll('step-1-login-btn');
      return;
    }
    if (targetStep === '2') {
      state.screen = 'admin';
      state.adminTab = 'stays';
      state.showNewStayForm = true;
      state.tourStep = '2';
      renderAndScroll('step-2-save-stay-btn');
      return;
    }
    if (targetStep === '3') {
      if (!state.stays.some(function (s) { return s.code === 'MIR-204'; })) {
        doSaveStay();
      }
      state.screen = 'admin';
      state.adminTab = 'stays';
      state.showNewStayForm = false;
      state.tourStep = '3';
      renderAndScroll('step-3-open-menu-btn');
      return;
    }
    if (targetStep === '4' || targetStep === '4a') {
      if (!state.stays.some(function (s) { return s.code === 'MIR-204'; })) {
        doSaveStay();
      }
      state.screen = 'menu';
      var stats = getCartStats();
      state.tourStep = stats.count > 0 ? '4b' : '4a';
      renderAndScroll(state.tourStep === '4b' ? 'step-4b-send-order-btn' : 'step-4a-add-item-btn');
      return;
    }
    if (targetStep === '4b') {
      if (getCartStats().count === 0) {
        state.cart['mc-pasta'] = { qty: 1, similar: true };
      }
      state.screen = 'menu';
      state.tourStep = '4b';
      renderAndScroll('step-4b-send-order-btn');
      return;
    }
    if (targetStep === '5' || targetStep === '5a') {
      if (state.orders.length === 0) doSendOrder();
      state.screen = 'admin';
      state.adminTab = 'orders';
      state.selectedOrderId = null;
      state.tourStep = '5a';
      renderAndScroll('step-5a-open-order-btn');
      return;
    }
    if (targetStep === '5b') {
      if (state.orders.length === 0) doSendOrder();
      state.screen = 'admin';
      state.adminTab = 'orders';
      state.selectedOrderId = state.orders[0].id;
      state.orderDetailTab = 'items';
      state.showWhatsappPreview = true;
      state.tourStep = '5b';
      renderAndScroll('step-5b-approve-btn');
      return;
    }
    if (targetStep === '6') {
      if (state.orders.length === 0) doSendOrder();
      var ord6 = state.orders[0];
      if (ord6.status === 'pending') ord6.status = 'prep';
      state.screen = 'admin';
      state.adminTab = 'orders';
      state.selectedOrderId = ord6.id;
      state.orderDetailTab = 'notes';
      state.showWhatsappPreview = false;
      state.tourStep = '6';
      renderAndScroll('step-6-attach-nfe-btn');
      return;
    }
    if (targetStep === '7') {
      if (state.orders.length === 0) doSendOrder();
      var ord7 = state.orders[0];
      state.screen = 'admin';
      state.adminTab = 'orders';
      state.selectedOrderId = ord7.id;
      state.orderDetailTab = 'notes';
      state.showWhatsappPreview = false;
      if (ord7.notes.length === 0) {
        ord7.notes.push({
          id: 'nfe-1',
          nfeNum: 'NF-e 004.812',
          supplierId: 'mercado',
          supplierPt: 'Mercado',
          supplierEn: 'Market',
          amount: ord7.totalEstimate || 157.5,
          date: '2026-12-18',
          payer: 'guest'
        });
      }
      if (ord7.status === 'finalized') ord7.status = 'prep';
      state.tourStep = '7';
      renderAndScroll('step-7-close-order-btn');
    }
  }

  function handleTourNextAuto() {
    switch (state.tourStep) {
      case '1': doLogin(); break;
      case '2': doSaveStay(); break;
      case '3': doOpenMenu('MIR-204'); break;
      case '4a': doChangeQty('mc-pasta', 1); break;
      case '4b': doSendOrder(); break;
      case '5a': doOpenOrder(state.orders[0] && state.orders[0].id); break;
      case '5b': doApproveAndSend(); break;
      case '6': doAttachMockNfe(); break;
      case '7': doCloseOrder(); break;
      default: break;
    }
  }

  function handleTourPrev() {
    var order = ['1', '2', '3', '4a', '4b', '5a', '5b', '6', '7', '7done'];
    var idx = order.indexOf(state.tourStep);
    if (idx <= 0) return;
    var prev = order[idx - 1];
    jumpToTourStep(prev);
  }

  function restartTour() {
    hasTriggeredViewportAutoplay = true;
    clearAutoPlayTimers();
    state = createInitialState();
    renderAndScroll('step-1-login-btn');
  }

  function startCarbonaraChallenge() {
    hasTriggeredViewportAutoplay = true;
    clearAutoPlayTimers();
    state = createInitialState();
    state.challengeMode = true;
    state.tourActive = true;
    state.autoPlayStatus = 'idle';
    renderAndScroll('step-1-login-btn');
  }

  /* ------------------------------------------------------------------------
     Auto-Play Engine (IntersectionObserver + Smooth Visible Click Demo)
     ------------------------------------------------------------------------ */
  var AUTOPLAY_STEPS = [
    { delay: 900, rippleMs: 360, target: '[data-tour-target="step-1-login-btn"]', run: function () { doLogin(); } },
    { delay: 950, rippleMs: 360, target: '[data-tour-target="step-2-save-stay-btn"]', run: function () { doSaveStay(); } },
    { delay: 1000, rippleMs: 360, target: '[data-tour-target="step-3-open-menu-btn"]', run: function () { doOpenMenu('MIR-204'); } },
    { delay: 850, rippleMs: 320, target: '[data-action="qty-plus"][data-item="mc-pasta"]', run: function () { doChangeQty('mc-pasta', 2); } },
    { delay: 720, rippleMs: 300, target: '[data-action="qty-plus"][data-item="mc-2"]', run: function () { doChangeQty('mc-2', 1); } },
    { delay: 720, rippleMs: 300, target: '[data-action="qty-plus"][data-item="mc-pimenta"]', run: function () { doChangeQty('mc-pimenta', 1); } },
    { delay: 680, rippleMs: 300, target: '[data-action="select-sup"][data-sup="acougue"]', run: function () { state.activeSupplier = 'acougue'; render(); } },
    { delay: 750, rippleMs: 320, target: '[data-action="qty-plus"][data-item="ac-bacon"]', run: function () { doChangeQty('ac-bacon', 2); } },
    { delay: 680, rippleMs: 300, target: '[data-action="select-sup"][data-sup="frios-laticinios"]', run: function () { state.activeSupplier = 'frios-laticinios'; render(); } },
    { delay: 750, rippleMs: 320, target: '[data-action="qty-plus"][data-item="fr-parmesao"]', run: function () { doChangeQty('fr-parmesao', 1); } },
    { delay: 950, rippleMs: 360, target: '[data-tour-target="step-4b-send-order-btn"]', run: function () { doSendOrder(); } },
    { delay: 950, rippleMs: 360, target: '[data-tour-target="step-5a-open-order-btn"]', run: function () { doOpenOrder(state.orders[0] && state.orders[0].id); } },
    { delay: 1350, rippleMs: 380, target: '[data-tour-target="step-5b-approve-btn"]', run: function () { doApproveAndSend(); } },
    { delay: 1000, rippleMs: 360, target: '[data-tour-target="step-6-attach-nfe-btn"]', run: function () { doAttachMockNfe(); } },
    { delay: 1000, rippleMs: 360, target: '[data-tour-target="step-7-close-order-btn"]', run: function () { doCloseOrder(); finishAutoPlay(); } }
  ];

  function getAutoPlayScale() {
    if (typeof window.__COMPRAS_AUTOPLAY_SCALE === 'number' && window.__COMPRAS_AUTOPLAY_SCALE > 0) {
      return window.__COMPRAS_AUTOPLAY_SCALE;
    }
    return 1;
  }

  function clearAutoPlayTimers() {
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      autoPlayTimer = null;
    }
    if (autoPlayRippleTimer) {
      clearTimeout(autoPlayRippleTimer);
      autoPlayRippleTimer = null;
    }
    if (rootEl) {
      rootEl.querySelectorAll('.sb-auto-ripple').forEach(function (el) {
        el.classList.remove('sb-auto-ripple');
      });
    }
  }

  function stopAutoPlay(nextStatus) {
    clearAutoPlayTimers();
    if (!state) return;
    if (state.autoPlayStatus === 'running') {
      state.autoPlayStatus = nextStatus || 'paused';
      render();
    }
  }

  function finishAutoPlay() {
    clearAutoPlayTimers();
    if (!state) return;
    state.autoPlayStatus = 'completed';
    state.showCarbonaraInvite = true;
    clearToast();
    render();
  }

  function inferAutoPlayIndex() {
    if (!state) return 0;
    switch (state.tourStep) {
      case '1': return 0;
      case '2': return 1;
      case '3': return 2;
      case '4a': return 3;
      case '4b': {
        if (!state.cart['mc-pasta']) return 3;
        if (!state.cart['mc-2']) return 4;
        if (!state.cart['mc-pimenta']) return 5;
        if (!state.cart['ac-bacon']) return state.activeSupplier === 'acougue' ? 7 : 6;
        if (!state.cart['fr-parmesao']) return state.activeSupplier === 'frios-laticinios' ? 9 : 8;
        return 10;
      }
      case '5a': return 11;
      case '5b': return 12;
      case '6': return 13;
      case '7': return 14;
      default: return 0;
    }
  }

  function scheduleNextAutoPlayStep() {
    clearAutoPlayTimers();
    if (!state || state.autoPlayStatus !== 'running') return;
    if (state.autoPlayIndex >= AUTOPLAY_STEPS.length) {
      finishAutoPlay();
      return;
    }

    var stepDef = AUTOPLAY_STEPS[state.autoPlayIndex];
    var scale = getAutoPlayScale();
    var waitMs = Math.max(40, Math.round(stepDef.delay * scale));
    var rippleMs = Math.max(30, Math.round(stepDef.rippleMs * scale));

    autoPlayTimer = setTimeout(function () {
      if (!state || state.autoPlayStatus !== 'running') return;
      var targetEl = rootEl && stepDef.target ? rootEl.querySelector(stepDef.target) : null;
      if (targetEl) {
        targetEl.classList.add('sb-auto-ripple');
      }
      autoPlayRippleTimer = setTimeout(function () {
        if (!state || state.autoPlayStatus !== 'running') return;
        if (targetEl) targetEl.classList.remove('sb-auto-ripple');
        state.autoPlayIndex += 1;
        stepDef.run();
        if (state && state.autoPlayStatus === 'running') {
          scheduleNextAutoPlayStep();
        }
      }, rippleMs);
    }, waitMs);
  }

  function startAutoPlay(fromBeginning) {
    hasTriggeredViewportAutoplay = true;
    clearAutoPlayTimers();
    if (fromBeginning || !state || state.tourStep === '7done') {
      state = createInitialState();
    }
    state.tourActive = true;
    state.showCarbonaraInvite = false;
    state.showSheetModal = false;
    state.challengeMode = false;
    state.autoPlayStatus = 'running';
    state.autoPlayIndex = fromBeginning ? 0 : inferAutoPlayIndex();
    clearToast();
    render();
    scheduleNextAutoPlayStep();
  }

  function toggleAutoPlay() {
    if (!state) return;
    if (state.autoPlayStatus === 'running') {
      stopAutoPlay('paused');
    } else if (state.tourStep === '7done' || state.autoPlayStatus === 'completed') {
      startAutoPlay(true);
    } else {
      startAutoPlay(false);
    }
  }

  function setupViewportObserver() {
    if (!rootEl || sandboxObserver) return;
    if (typeof IntersectionObserver !== 'function') return;
    sandboxObserver = new IntersectionObserver(function (entries) {
      if (hasTriggeredViewportAutoplay) return;
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          hasTriggeredViewportAutoplay = true;
          if (state && state.autoPlayStatus === 'idle' && state.tourStep === '1' && !state.challengeMode) {
            startAutoPlay(true);
          }
          if (sandboxObserver) {
            sandboxObserver.disconnect();
          }
          break;
        }
      }
    }, { threshold: 0.25 });
    sandboxObserver.observe(rootEl);
  }

  function downloadDemoCsv() {
    var ord = getCurrentOrder();
    if (!ord) return;
    var rows = [['Fornecedor', 'Item', 'Qtd', 'Unid', 'Estimativa (R$)']];
    ord.items.forEach(function (it) {
      var sup = getSupplierObj(it.sup);
      rows.push([
        lang === 'en' ? sup.en : sup.pt,
        lang === 'en' ? it.en : it.pt,
        String(it.qty),
        it.unit,
        (it.qty * it.price).toFixed(2)
      ]);
    });
    var csv = rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'pedido-MIR-204-demo.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ------------------------------------------------------------------------
     HTML Renderers
     ------------------------------------------------------------------------ */
  function getStepNumber(stepId) {
    if (stepId === '4a' || stepId === '4b') return 4;
    if (stepId === '5a' || stepId === '5b') return 5;
    if (stepId === '7done') return 7;
    return parseInt(stepId, 10) || 1;
  }

  /* ---- Narrative Strip (replaces big coachmark) ---- */
  function renderNarrativeStrip() {
    var isAutoRunning = state.autoPlayStatus === 'running';
    var autoBadgeHtml = isAutoRunning
      ? '<span class="sb-ns-autoplay-badge"><span class="sb-autoplay-dot" aria-hidden="true"></span>' + esc(t('ns_autoplay_badge')) + '</span>'
      : '';

    if (!state.tourActive) {
      return (
        '<div class="sb-narrative-strip sb-narrative-free">' +
        '  <div class="sb-ns-left">' +
        autoBadgeHtml +
        '    <span class="sb-ns-free-label">' + esc(lang === 'en' ? 'Free Explore Mode' : 'Modo Livre — Explore à vontade') + '</span>' +
        '  </div>' +
        '  <div class="sb-ns-actions">' +
        '    <button type="button" class="sb-ns-btn sb-ns-btn-primary" data-action="toggle-tour">' + esc(t('btn_resume_tour')) + '</button>' +
        '    <button type="button" class="sb-ns-btn" data-action="restart-tour">' + esc(t('ns_restart')) + '</button>' +
        '  </div>' +
        '</div>'
      );
    }

    var dict = I18N[lang] || I18N.pt;
    var nsData = dict.ns_steps[state.tourStep] || dict.ns_steps['1'];
    var nsTitle = nsData.title;
    var nsDesc = nsData.desc;

    if (state.tourStep === '4b') {
      var cStats = getCarbonaraStats();
      if (cStats.doneCount === cStats.total) {
        nsTitle = lang === 'en'
          ? 'Step 4 of 7 — Carbonara 5/5 Ready! Send Order'
          : 'Passo 4 de 7 — Carbonara 5/5 Pronto! Enviar Pedido';
        nsDesc = lang === 'en'
          ? 'All 5 Carbonara ingredients are in the cart. Click "Close / Send Order" to notify the Concierge.'
          : 'Todos os 5 ingredientes do Carbonara estão no carrinho! Clique em "Fechar / Enviar Pedido" para enviar ao Concierge.';
      } else if (cStats.doneCount > 0) {
        nsTitle = lang === 'en'
          ? 'Step 4 of 7 — Carbonara (' + cStats.doneCount + '/5) • Send or Keep Picking'
          : 'Passo 4 de 7 — Carbonara (' + cStats.doneCount + '/5) • Continue ou Envie';
      }
    }

    var stepNum = getStepNumber(state.tourStep);
    var isDone = state.tourStep === '7done';
    var isCookStep = (state.tourStep === '4a' || state.tourStep === '4b');
    var persona = isCookStep ? t('ns_persona_cook') : t('ns_persona_admin');
    var personaClass = isCookStep ? 'sb-ns-persona-cook' : 'sb-ns-persona-admin';
    var pct = Math.round((stepNum / 7) * 100);
    var prevDisabled = state.tourStep === '1' ? ' disabled' : '';
    var isDoneOrFree = isDone;

    var actionBtns = isDoneOrFree
      ? '<button type="button" class="sb-ns-btn" data-action="toggle-tour">' + esc(t('ns_free')) + '</button>' +
        '<button type="button" class="sb-ns-btn sb-ns-btn-primary" data-action="restart-tour">' + esc(t('ns_restart')) + '</button>'
      : '<button type="button" class="sb-ns-btn" data-action="tour-prev"' + prevDisabled + '>' + esc(t('ns_prev')) + '</button>' +
        '<button type="button" class="sb-ns-btn" data-action="toggle-tour">' + esc(t('ns_free')) + '</button>' +
        '<button type="button" class="sb-ns-btn sb-ns-btn-primary" data-action="tour-next">' + esc(t('ns_skip')) + '</button>';

    var badgeText = isDone ? t('ns_done_badge') : t('ns_step_of').replace('{n}', String(stepNum));

    return (
      '<div class="sb-narrative-strip' + (isAutoRunning ? ' is-autoplay' : '') + '">' +
      '  <div class="sb-ns-top">' +
      '    <div class="sb-ns-left">' +
      autoBadgeHtml +
      '      <span class="sb-ns-persona ' + personaClass + '">' + esc(persona) + '</span>' +
      '      <span class="sb-ns-badge">' + esc(badgeText) + '</span>' +
      '    </div>' +
      '    <div class="sb-ns-actions">' + actionBtns + '</div>' +
      '  </div>' +
      '  <div class="sb-ns-progress-track"><div class="sb-ns-progress-fill" style="width:' + pct + '%"></div></div>' +
      '  <div class="sb-ns-body">' +
      '    <strong class="sb-ns-title">' + esc(nsTitle) + '</strong>' +
      '    <p class="sb-ns-desc">' + esc(nsDesc) + '</p>' +
      '  </div>' +
      '</div>'
    );
  }

  function renderChrome() {
    var isCook = state.screen === 'menu';
    var urlText = isCook ? 'concierge.demo/e/' + esc(state.activeStayCode) : 'concierge.demo/admin';
    var roleClass = isCook ? 'is-cook' : 'is-admin';
    var roleText = isCook ? t('role_cook') : t('role_admin');
    var curNum = getStepNumber(state.tourStep);
    var railLabels = I18N[lang].rail_steps;
    var isAutoRunning = state.autoPlayStatus === 'running';

    var railHtml = railLabels
      .map(function (lbl, idx) {
        var stepNum = idx + 1;
        var cls = 'sb-rail-pill';
        if (state.tourStep === '7done' || stepNum < curNum) cls += ' is-done';
        else if (stepNum === curNum) cls += ' is-current';
        return (
          '<button type="button" class="' + cls + '" data-action="rail-step" data-step="' + stepNum + '">' +
          '<span class="sb-rail-num">' + stepNum + '</span>' +
          '<span>' + esc(lbl.replace(/^\d+\.\s*/, '')) + '</span>' +
          '</button>'
        );
      })
      .join('');

    return (
      '<div class="sb-chrome">' +
      '  <div class="sb-chrome-left">' +
      '    <div class="sb-traffic-dots" aria-hidden="true">' +
      '      <span class="sb-dot-red"></span><span class="sb-dot-amber"></span><span class="sb-dot-green"></span>' +
      '    </div>' +
      '    <div class="sb-url-bar">' +
      '      <span class="sb-url-lock" aria-hidden="true">🔒</span>' +
      '      <span>' + urlText + '</span>' +
      '    </div>' +
      '    <span class="sb-role-badge ' + roleClass + '">' + esc(roleText) + '</span>' +
      '  </div>' +
      '  <div class="sb-chrome-actions">' +
      '    <button type="button" class="sb-chrome-btn sb-chrome-autoplay ' + (isAutoRunning ? 'is-running' : '') + '" data-action="toggle-autoplay">' +
      (isAutoRunning ? '⏸ ' + esc(t('btn_autoplay_pause')) : '▶ ' + esc(t('btn_autoplay_watch'))) +
      '    </button>' +
      '    <button type="button" class="sb-chrome-btn ' + (state.tourActive ? 'is-active' : '') + '" data-action="toggle-tour">' +
      (state.tourActive ? esc(t('btn_free_explore')) : esc(t('btn_resume_tour'))) +
      '    </button>' +
      '    <button type="button" class="sb-chrome-btn" data-action="restart-tour">' +
      '      ↺ ' + esc(t('btn_restart')) +
      '    </button>' +
      '  </div>' +
      '</div>' +
      '<div class="sb-step-rail" role="tablist" aria-label="Tour steps">' + railHtml + '</div>'
    );
  }

  function renderLoginScreen() {
    var profileCards = PROFILES.map(function (p) {
      var sel = state.selectedProfile === p.id ? 'is-selected' : '';
      return (
        '<button type="button" class="sb-profile-card ' + sel + '" data-action="select-profile" data-profile="' + p.id + '">' +
        '  <strong>' + esc(p.name) + '</strong>' +
        '  <span>' + esc(t(p.roleKey)) + '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<div class="sb-app-screen">' +
      '  <div class="sb-app-header">' +
      '    <div class="sb-brand">' +
      '      <span class="sb-brand-icon">TC</span>' +
      '      <div>' +
      '        <h3 class="sb-brand-name">' + esc(t('app_brand')) + '</h3>' +
      '        <p class="sb-brand-sub">' + esc(t('app_sub')) + '</p>' +
      '      </div>' +
      '    </div>' +
      '    <span class="sb-user-chip">/admin</span>' +
      '  </div>' +
      '  <div class="sb-login-wrap">' +
      '    <form class="sb-login-card" id="sb-login-form">' +
      '      <div class="sb-login-header">' +
      '        <span class="sb-brand-icon">TC</span>' +
      '        <div>' +
      '          <h3 class="sb-login-title">' + esc(t('login_title')) + '</h3>' +
      '          <p class="sb-login-sub">' + esc(t('login_sub')) + '</p>' +
      '        </div>' +
      '      </div>' +
      '      <span class="sb-profile-label">' + esc(t('login_profiles_lbl')) + '</span>' +
      '      <div class="sb-profile-grid">' + profileCards + '</div>' +
      '      <div class="sb-field">' +
      '        <label for="sb-login-user">' + esc(t('login_user_lbl')) + '</label>' +
      '        <input id="sb-login-user" class="sb-input" type="text" value="' + esc(state.loginUser) + '" />' +
      '      </div>' +
      '      <div class="sb-field">' +
      '        <label for="sb-login-pass">' + esc(t('login_pass_lbl')) + '</label>' +
      '        <input id="sb-login-pass" class="sb-input" type="password" value="' + esc(state.loginPass) + '" />' +
      '      </div>' +
      '      <label class="sb-check-row">' +
      '        <input type="checkbox" checked />' +
      '        <span>' + esc(t('login_remember')) + '</span>' +
      '      </label>' +
      '      <button type="submit" class="sb-btn sb-btn-amber sb-btn-full" data-tour-target="step-1-login-btn">' +
      '        ' + esc(t('login_btn')) + ' →' +
      '      </button>' +
      '    </form>' +
      '  </div>' +
      '</div>'
    );
  }

  function renderAdminHeader() {
    return (
      '<div class="sb-app-header">' +
      '  <div class="sb-brand">' +
      '    <span class="sb-brand-icon">TC</span>' +
      '    <div>' +
      '      <h3 class="sb-brand-name">' + esc(t('app_brand')) + '</h3>' +
      '      <p class="sb-brand-sub">' + esc(t('app_sub')) + '</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="sb-header-right">' +
      '    <span class="sb-user-chip">👤 ' + esc(state.loggedInUser) + '</span>' +
      '    <button type="button" class="sb-ghost-dark-btn" data-action="logout">' + esc(t('btn_logout')) + '</button>' +
      '  </div>' +
      '</div>'
    );
  }

  function renderAdminStays() {
    var d = state.stayDraft;
    var formHtml = state.showNewStayForm
      ? '<form class="sb-card sb-card-highlight" id="sb-new-stay-form">' +
        '<div class="sb-stay-top">' +
        '    <h4 class="sb-card-title">' + esc(t('new_stay_title')) + '</h4>' +
        '    <span class="sb-badge sb-badge-amber">' + esc(lang === 'en' ? '📝 Quick setup' : '📝 Cadastro rápido') + '</span>' +
        '  </div>' +
        '  <div class="sb-form-grid">' +
        '    <div class="sb-field sb-col-span-2">' +
        '      <label for="sb-stay-house">' + esc(t('field_house')) + '</label>' +
        '      <input id="sb-stay-house" class="sb-input" type="text" value="' + esc(d.house) + '" required />' +
        '    </div>' +
        '    <div class="sb-field">' +
        '      <label for="sb-stay-guests">' + esc(t('field_guests')) + '</label>' +
        '      <input id="sb-stay-guests" class="sb-input sb-tabular" type="number" min="1" max="30" value="' + esc(d.guests) + '" required />' +
        '    </div>' +
        '    <div class="sb-field">' +
        '      <label for="sb-stay-checkin">' + esc(t('field_checkin')) + '</label>' +
        '      <input id="sb-stay-checkin" class="sb-input sb-tabular" type="date" value="' + esc(d.checkin) + '" required />' +
        '    </div>' +
        '    <div class="sb-field">' +
        '      <label for="sb-stay-checkout">' + esc(t('field_checkout')) + '</label>' +
        '      <input id="sb-stay-checkout" class="sb-input sb-tabular" type="date" value="' + esc(d.checkout) + '" required />' +
        '    </div>' +
        '    <div class="sb-field">' +
        '      <label for="sb-stay-holder">' + esc(t('field_holder')) + '</label>' +
        '      <input id="sb-stay-holder" class="sb-input" type="text" value="' + esc(d.holder) + '" required />' +
        '    </div>' +
        '    <div class="sb-field sb-col-span-2">' +
        '      <label for="sb-stay-notes">' + esc(t('field_notes')) + '</label>' +
        '      <input id="sb-stay-notes" class="sb-input" type="text" value="' + esc(d.notes) + '" />' +
        '    </div>' +
        '    <div class="sb-field" style="display:flex;align-items:flex-end;">' +
        '      <button type="submit" class="sb-btn sb-btn-amber sb-btn-full" data-tour-target="step-2-save-stay-btn">' +
        '        ' + esc(t('btn_save_stay')) +
        '      </button>' +
        '    </div>' +
        '  </div>' +
        '</form>'
      : '';

    var staysCards = state.stays
      .map(function (st) {
        var isTarget = st.code === 'MIR-204';
        var btnAttr = isTarget ? ' data-tour-target="step-3-open-menu-btn"' : '';
        return (
          '<article class="sb-card ' + (isTarget ? 'sb-card-highlight' : '') + '">' +
          '  <div class="sb-stay-top">' +
          '    <div>' +
          '      <h4 class="sb-card-title">' + esc(st.house) + '</h4>' +
          '      <div class="sb-stay-meta" style="margin-top:0.35rem;margin-bottom:0;">' +
          '        <span>👤 ' + esc(st.holder) + '</span>' +
          '        <span class="sb-tabular">👥 ' + st.guests + ' ' + esc(t('guests_word')) + ' • ' + st.days + ' ' + esc(t('days_word')) + '</span>' +
          '        <span>👩‍🍳 ' + esc(st.cook) + '</span>' +
          '      </div>' +
          '    </div>' +
          '    <span class="sb-badge sb-badge-emerald">' + esc(t('stay_status_active')) + '</span>' +
          '  </div>' +
          '  <div class="sb-cook-link-bar" style="margin-top:0.75rem;">' +
          '    <div>' +
          '      <span style="font-size:0.72rem;color:#78716c;display:block;">' + esc(t('cook_link_label')) + '</span>' +
          '      <span class="sb-cook-code">/e/' + esc(st.code) + '</span>' +
          '    </div>' +
          '    <div class="sb-cook-actions">' +
          '      <button type="button" class="sb-btn sb-btn-outline sb-btn-sm" data-action="copy-link" data-code="' + esc(st.code) + '">' + esc(t('btn_copy_link')) + '</button>' +
          '      <button type="button" class="sb-btn sb-btn-outline sb-btn-sm" data-action="wa-invite" data-code="' + esc(st.code) + '">' + esc(t('btn_whatsapp_invite')) + '</button>' +
          '      <button type="button" class="sb-btn sb-btn-amber sb-btn-sm" data-action="open-menu" data-code="' + esc(st.code) + '"' + btnAttr + '>' + esc(t('btn_open_menu')) + ' →</button>' +
          '    </div>' +
          '  </div>' +
          '</article>'
        );
      })
      .join('');

    return formHtml + '<div class="sb-stays-grid">' + staysCards + '</div>';
  }

  function renderCookMenuScreen() {
    var supObj = getSupplierObj(state.activeSupplier);
    var supTabs = SUPPLIERS.map(function (s) {
      var active = state.activeSupplier === s.id;
      var style = active ? ' style="background:' + s.color + ';border-color:' + s.color + ';"' : '';
      return (
        '<button type="button" class="sb-sup-tab ' + (active ? 'is-active' : '') + '" data-sup="' + s.id + '" data-action="select-sup"' + style + '>' +
        '  <span>' + esc(lang === 'en' ? s.en : s.pt) + '</span>' +
        '  <span style="opacity:0.75;font-size:0.7rem;">(' + s.count + ')</span>' +
        '</button>'
      );
    }).join('');

    var kitsHtml = KITS.map(function (k) {
      var applied = !!state.appliedKits[k.id];
      return (
        '<button type="button" class="sb-kit-pill ' + (applied ? 'is-applied' : '') + '" data-action="apply-kit" data-kit="' + k.id + '">' +
        '  <span>' + (applied ? '✓ ' : '+ ') + esc(lang === 'en' ? k.en : k.pt) + '</span>' +
        '</button>'
      );
    }).join('');

    var filteredItems = CATALOG.filter(function (it) {
      return it.sup === state.activeSupplier;
    });

    var cStats = getCarbonaraStats();
    var cPct = Math.round((cStats.doneCount / cStats.total) * 100);
    var cChipsHtml = cStats.items
      .map(function (ci) {
        var supObjChip = getSupplierObj(ci.sup);
        var supLabel = lang === 'en' ? supObjChip.en : supObjChip.pt;
        var itemLabel = lang === 'en' ? ci.shortEn : ci.shortPt;
        var cls = 'sb-carb-chip' + (ci.done ? ' is-done' : '') + (state.activeSupplier === ci.sup ? ' is-cur-sup' : '');
        return (
          '<button type="button" class="' + cls + '" data-action="carbonara-jump" data-sup="' + ci.sup + '" data-item="' + ci.id + '">' +
          '  <span>' + (ci.done ? '✓' : '○') + ' ' + esc(itemLabel) + '</span>' +
          '  <span class="sb-carb-chip-sup">' + esc(supLabel) + '</span>' +
          '</button>'
        );
      })
      .join('');

    var missionBanner = (
      '<div class="sb-carbonara-mission' + (cStats.doneCount === cStats.total ? ' is-complete' : '') + '">' +
      '  <div class="sb-carb-head">' +
      '    <strong class="sb-carb-title">' + esc(t('carbonara_mission_title')) + ' — <span class="sb-tabular">' + cStats.doneCount + '/' + cStats.total + ' ' + esc(t('carbonara_ingredients_word')) + '</span></strong>' +
      '    <span class="sb-carb-sub">' + esc(cStats.doneCount === cStats.total ? t('carbonara_mission_ready') : t('carbonara_mission_hint')) + '</span>' +
      '  </div>' +
      '  <div class="sb-carb-progress-track"><div class="sb-carb-progress-fill" style="width:' + cPct + '%"></div></div>' +
      '  <div class="sb-carb-chips">' + cChipsHtml + '</div>' +
      '</div>'
    );

    var targetIdx = -1;
    for (var fi = 0; fi < filteredItems.length; fi++) {
      var cand = filteredItems[fi];
      var candQty = state.cart[cand.id] ? state.cart[cand.id].qty : 0;
      if (cand.carbonara && candQty === 0) {
        targetIdx = fi;
        break;
      }
    }
    if (targetIdx === -1) targetIdx = 0;

    var itemsHtml = filteredItems
      .map(function (it, idx) {
        var entry = state.cart[it.id];
        var qty = entry ? entry.qty : 0;
        var sim = entry ? entry.similar : true;
        var isTargetPlus = idx === targetIdx;
        var plusAttr = isTargetPlus ? ' data-tour-target="step-4a-add-item-btn"' : '';
        var isCarb = !!it.carbonara;
        var isPulsed = pulsedItemId === it.id;
        return (
          '<div class="sb-item-card ' + (qty > 0 ? 'is-in-cart' : '') + (isCarb ? ' is-carbonara' : '') + (isPulsed ? ' sb-item-pulse' : '') + '" data-item-id="' + it.id + '">' +
          '  <div class="sb-item-head">' +
          '    <div>' +
          '      <div class="sb-item-title-row">' +
          '        <h4 class="sb-item-name">' + esc(lang === 'en' ? it.en : it.pt) + '</h4>' +
          (isCarb ? '        <span class="sb-carb-item-tag">🍝 Carbonara</span>' : '') +
          '      </div>' +
          '      <div class="sb-item-unit sb-tabular">' + esc(it.unit) + ' • ' + formatBRL(it.price) + '/' + esc(it.unit) + '</div>' +
          '    </div>' +
          '    <button type="button" class="sb-similar-toggle ' + (sim ? 'is-on' : '') + '" data-action="toggle-similar" data-item="' + it.id + '">' +
          '      ' + esc(sim ? t('btn_similar_yes') : t('btn_similar_no')) +
          '    </button>' +
          '  </div>' +
          '  <div class="sb-item-controls">' +
          '    <span class="sb-tabular" style="font-size:0.78rem;font-weight:700;color:' + supObj.color + ';">' +
          (qty > 0 ? formatBRL(qty * it.price) : '—') +
          '    </span>' +
          '    <div class="sb-qty-stepper">' +
          '      <button type="button" class="sb-qty-btn" aria-label="-" data-action="qty-minus" data-item="' + it.id + '">−</button>' +
          '      <span class="sb-qty-val sb-tabular">' + qty + '</span>' +
          '      <button type="button" class="sb-qty-btn" aria-label="+" data-action="qty-plus" data-item="' + it.id + '"' + plusAttr + '>+</button>' +
          '    </div>' +
          '  </div>' +
          '</div>'
        );
      })
      .join('');

    var stats = getCartStats();
    var cartLabel = stats.count + ' ' + itemsWord(stats.count) + ' ' + esc(t('summary_selected'));

    // Cook-view mobile banner
    var cookBanner = (
      '<div class="sb-cook-phone-banner">' +
      '  <div class="sb-cook-phone-icon">📱</div>' +
      '  <div>' +
      '    <strong>' + esc(lang === 'en' ? 'Cook\'s Phone View — Chef Camila (No login)' : 'Visão no celular da Cozinheira — Chef Camila (acesso sem login)') + '</strong>' +
      '    <span>' + esc(lang === 'en' ? 'Exclusive WhatsApp link — opens on mobile with no app download or password' : 'Link exclusivo enviado no WhatsApp — abre no celular sem baixar app e sem senha') + '</span>' +
      '  </div>' +
      '</div>'
    );

    return (
      '<div class="sb-app-screen sb-cook-screen">' +
      '  <div class="sb-app-header sb-cook-header">' +
      '    <div class="sb-brand">' +
      '      <span class="sb-brand-icon">🍳</span>' +
      '      <div>' +
      '        <h3 class="sb-brand-name">' + esc(state.stayDraft.house) + '</h3>' +
      '        <p class="sb-brand-sub">/e/' + esc(state.activeStayCode) + ' • ' + esc(t('menu_welcome')) + ' Chef Camila</p>' +
      '      </div>' +
      '    </div>' +
      '    <div class="sb-header-right">' +
      '      <span class="sb-user-chip sb-tabular">👥 ' + esc(state.stayDraft.guests) + ' ' + esc(t('guests_word')) + '</span>' +
      '      <button type="button" class="sb-ghost-dark-btn" data-action="back-admin">' + esc(t('btn_back_admin')) + '</button>' +
      '    </div>' +
      '  </div>' +
      cookBanner +
      '  <div class="sb-app-body">' +
      missionBanner +
      '    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;">' +
      '      <span style="font-size:0.76rem;font-weight:700;color:#57534e;">⚡ ' + esc(t('kits_label')) + ' ' + esc(state.stayDraft.guests) + ' ' + esc(t('guests_word')) + '):</span>' +
      '      <span style="font-size:0.73rem;color:#78716c;">' + esc(t('menu_catalog_meta')) + '</span>' +
      '    </div>' +
      '    <div class="sb-kits-row">' + kitsHtml + '</div>' +
      '    <div class="sb-supplier-tabs">' + supTabs + '</div>' +
      '    <div class="sb-items-grid">' + itemsHtml + '</div>' +
      '    <div class="sb-bottom-summary">' +
      '      <div class="sb-summary-stats">' +
      '        <strong class="sb-tabular">' + cartLabel + '</strong>' +
      '        <span class="sb-tabular">' + esc(t('summary_est')) + ' ' + formatBRL(stats.total) + '</span>' +
      '      </div>' +
      '      <button type="button" class="sb-btn sb-btn-amber" data-action="send-order" data-tour-target="step-4b-send-order-btn">' +
      '        ' + esc(t('btn_send_order')) + ' (' + stats.count + ') →' +
      '      </button>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  function buildWhatsappText(ord) {
    var grouped = {};
    ord.items.forEach(function (it) {
      if (!grouped[it.sup]) grouped[it.sup] = [];
      grouped[it.sup].push(it);
    });
    var lines = ['*Trancoso Concierge — Pedido #' + ord.number + ' (' + ord.house + ')*'];
    Object.keys(grouped).forEach(function (supId) {
      var sup = getSupplierObj(supId);
      lines.push('\n*[' + (lang === 'en' ? sup.en : sup.pt) + ']*');
      grouped[supId].forEach(function (it) {
        lines.push('• ' + it.qty + ' ' + it.unit + ' — ' + (lang === 'en' ? it.en : it.pt));
      });
    });
    return lines.join('\n');
  }

  function renderAdminOrders() {
    var ord = getCurrentOrder();
    if (!ord) {
      if (state.orders.length === 0) {
        return (
          '<div class="sb-card">' +
          '  <p style="margin:0;color:#57534e;font-size:0.9rem;">' + esc(lang === 'en' ? 'No orders submitted yet. Open the cook\'s menu to create Order #1.' : 'Nenhum pedido enviado ainda. Abra o cardápio da estadia para criar o Pedido #1.') + '</p>' +
          '</div>'
        );
      }
      var listHtml = state.orders
        .map(function (o) {
          var badgeCls = o.status === 'finalized' ? 'sb-badge-emerald' : 'sb-badge-amber';
          var statusLbl = o.status === 'finalized' ? t('status_finalized') : t('status_pending');
          var itemsCount = o.items.length;
          return (
            '<div class="sb-card sb-card-highlight">' +
            '  <div class="sb-order-row">' +
            '    <div>' +
            '      <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">' +
            '        <h4 class="sb-card-title">Pedido #' + o.number + ' • ' + esc(o.house) + '</h4>' +
            '        <span class="sb-badge ' + badgeCls + '">' + esc(statusLbl) + '</span>' +
            '      </div>' +
            '      <div class="sb-stay-meta" style="margin-top:0.35rem;margin-bottom:0;">' +
            '        <span>👩‍🍳 ' + esc(o.cook) + '</span>' +
            '        <span class="sb-tabular">📦 ' + itemsCount + ' ' + esc(itemsWord(itemsCount)) + '</span>' +
            '        <span class="sb-tabular">💰 ' + formatBRL(o.totalEstimate) + '</span>' +
            '      </div>' +
            '    </div>' +
            '    <button type="button" class="sb-btn sb-btn-amber" data-action="open-order" data-order="' + esc(o.id) + '" data-tour-target="step-5a-open-order-btn">' +
            '      ' + esc(t('btn_open_order')) + ' →' +
            '    </button>' +
            '  </div>' +
            '</div>'
          );
        })
        .join('');
      return '<div><h4 style="margin:0 0 0.75rem 0;font-size:0.9rem;color:#57534e;">' + esc(t('orders_queue_title')) + '</h4>' + listHtml + '</div>';
    }

    // Order Detail Workspace
    var isFinalized = ord.status === 'finalized';
    var hasNotes = ord.notes.length > 0;

    var totalNotes = 0;
    var paidGuest = 0;
    var paidConcierge = 0;
    ord.notes.forEach(function (n) {
      totalNotes += n.amount;
      if (n.payer === 'guest') paidGuest += n.amount;
      else paidConcierge += n.amount;
    });

    var phases = [
      { lbl: t('phase_1'), state: 'is-done' },
      { lbl: t('phase_2'), state: (state.tourStep === '5a' || state.tourStep === '5b') ? 'is-active' : 'is-done' },
      { lbl: t('phase_3'), state: isFinalized ? 'is-done' : ((state.tourStep === '6' || state.tourStep === '7') ? 'is-active' : '') },
      { lbl: t('phase_4'), state: isFinalized ? 'is-done' : '' }
    ];
    var stepperHtml = phases
      .map(function (ph) {
        return '<div class="sb-phase-box ' + ph.state + '">' + (ph.state === 'is-done' ? '✓ ' : '● ') + esc(ph.lbl) + '</div>';
      })
      .join('');

    var tabContent = '';

    // Step 5b: items tab with WhatsApp preview + approve button
    if (state.orderDetailTab === 'items') {
      var grouped5b = {};
      ord.items.forEach(function (it) {
        if (!grouped5b[it.sup]) grouped5b[it.sup] = [];
        grouped5b[it.sup].push(it);
      });

      var supGroupsHtml = Object.keys(grouped5b).map(function (supId) {
        var sup = getSupplierObj(supId);
        var supColor = sup.color;
        var supName = lang === 'en' ? sup.en : sup.pt;
        var supItems = grouped5b[supId].map(function (it) {
          return (
            '<tr>' +
            '  <td><strong>' + esc(lang === 'en' ? it.en : it.pt) + '</strong></td>' +
            '  <td class="sb-tabular">' + it.qty + ' ' + esc(it.unit) + '</td>' +
            '  <td class="sb-tabular">' + formatBRL(it.qty * it.price) + '</td>' +
            '</tr>'
          );
        }).join('');
        return (
          '<div style="margin-bottom:0.75rem;">' +
          '  <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem;">' +
          '    <span class="sb-badge" style="background:' + supColor + ';color:' + (sup.id === 'frios-laticinios' ? '#1c1917' : '#fff') + ';">' + esc(supName) + '</span>' +
          '  </div>' +
          '  <table class="sb-xlsx-table" style="width:100%;">' +
          '    <tbody>' + supItems + '</tbody>' +
          '  </table>' +
          '</div>'
        );
      }).join('');

      var waText = buildWhatsappText(ord);
      var waPreviewHtml = state.showWhatsappPreview
        ? '<div class="sb-whatsapp-box" style="margin-top:0.65rem;">' +
          '  <div style="font-size:0.7rem;font-weight:700;color:#166534;margin-bottom:0.4rem;">📲 ' + esc(t('wa_preview_label')) + '</div>' +
          esc(waText) +
          '</div>'
        : '';

      tabContent =
        '<div class="sb-card" style="margin-top:0;">' +
        '  <h4 class="sb-card-title" style="margin-bottom:0.65rem !important;">' + esc(t('sup_tab_label')) + '</h4>' +
        '  <div class="sb-xlsx-table-wrap">' + supGroupsHtml + '</div>' +
        '  <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.65rem;flex-wrap:wrap;">' +
        '    <button type="button" class="sb-btn sb-btn-outline sb-btn-sm" data-action="toggle-wa-preview">📲 ' + esc(t('btn_whatsapp_preview')) + '</button>' +
        '    <button type="button" class="sb-btn sb-btn-amber" data-action="approve-send" data-tour-target="step-5b-approve-btn">✅ ' + esc(t('btn_approve_send')) + ' →</button>' +
        '  </div>' +
        waPreviewHtml +
        '</div>';

    } else if (state.orderDetailTab === 'audit') {
      var auditRows = ord.audit
        .map(function (a) {
          return (
            '<div class="sb-check-item" style="cursor:default;">' +
            '  <span>' + esc(lang === 'en' ? a.en : a.pt) + '</span>' +
            '  <strong class="sb-tabular" style="color:#78716c;">' + esc(a.time) + '</strong>' +
            '</div>'
          );
        })
        .join('');
      tabContent = '<div class="sb-card"><h4 class="sb-card-title" style="margin-bottom:0.65rem !important;">' + esc(t('audit_title')) + '</h4><div class="sb-checklist">' + auditRows + '</div></div>';
    } else {
      // Tab: Comprovantes & Notas (Step 6 & 7)
      var checklistHtml = ord.items
        .map(function (it) {
          return (
            '<label class="sb-check-item">' +
            '  <span style="display:flex;align-items:center;gap:0.45rem;">' +
            '    <input type="checkbox" data-action="toggle-item-check" data-item="' + it.id + '" ' + (it.checked ? 'checked' : '') + ' />' +
            '    <span>' + esc(lang === 'en' ? it.en : it.pt) + ' (' + it.qty + ' ' + esc(it.unit) + ')</span>' +
            '  </span>' +
            '  <strong class="sb-tabular">' + formatBRL(it.qty * it.price) + '</strong>' +
            '</label>'
          );
        })
        .join('');

      var supOptions = SUPPLIERS.map(function (s) {
        return '<option value="' + s.id + '"' + (state.nfeDraft.supplier === s.id ? ' selected' : '') + '>' + esc(lang === 'en' ? s.en : s.pt) + '</option>';
      }).join('');

      var notesListHtml = ord.notes
        .map(function (n) {
          return (
            '<div class="sb-nfe-preview">' +
            '  <div>' +
            '    <span class="sb-badge sb-badge-purple">' + esc(t('nfe_mock_badge')) + '</span>' +
            '    <strong style="display:block;font-size:0.86rem;margin-top:0.25rem;color:#3b0764;">' +
            esc(n.nfeNum) + ' • ' + esc(lang === 'en' ? n.supplierEn : n.supplierPt) +
            '    </strong>' +
            '    <span style="font-size:0.74rem;color:#6b21a8;">' + esc(n.date) + '</span>' +
            '  </div>' +
            '  <div style="text-align:right;">' +
            '    <strong class="sb-tabular" style="font-size:0.95rem;color:#1c1917;display:block;">' + formatBRL(n.amount) + '</strong>' +
            '    <span style="font-size:0.72rem;color:#57534e;">' + esc(n.payer === 'guest' ? t('payer_guest') : t('payer_concierge')) + '</span>' +
            '  </div>' +
            '</div>'
          );
        })
        .join('');

      var orderSupIds = [];
      ord.items.forEach(function (it) {
        if (orderSupIds.indexOf(it.sup) === -1) orderSupIds.push(it.sup);
      });
      var orderSuppliers = SUPPLIERS.filter(function (s) {
        return orderSupIds.indexOf(s.id) !== -1;
      });

      var xlsxHtml = isFinalized
        ? '<div class="sb-xlsx-preview" data-tour-target="step-7done-xlsx-card">' +
          '  <div class="sb-xlsx-header-row">' +
          '    <div>' +
          '      <strong style="font-size:0.92rem;color:#065f46;display:block;">📊 ' + esc(t('xlsx_ready_title')) + '</strong>' +
          '      <span style="font-size:0.78rem;color:#047857;">' + esc(t('xlsx_ready_sub')) + '</span>' +
          '    </div>' +
          '    <div class="sb-xlsx-actions-col">' +
          '      <button type="button" class="sb-btn sb-btn-emerald sb-btn-sm" data-action="download-csv">⬇ ' + esc(t('btn_download_xlsx')) + '</button>' +
          '      <button type="button" class="sb-btn sb-btn-excel-preview sb-btn-sm" data-action="open-sheet-preview">👁 ' + esc(t('btn_preview_sheet')) + '</button>' +
          '    </div>' +
          '  </div>' +
          '  <div class="sb-xlsx-tabs">' +
          '    <button type="button" class="sb-xlsx-sheet-pill" style="background:#1c1917;" data-action="open-sheet-tab" data-sheet="geral">' + esc(t('sheet_tab_general')) + '</button>' +
          orderSuppliers.map(function (s) {
            var tc = s.id === 'frios-laticinios' ? '#1c1917' : '#ffffff';
            return '<button type="button" class="sb-xlsx-sheet-pill" style="background:' + s.color + ';color:' + tc + ';" data-action="open-sheet-tab" data-sheet="' + s.id + '">' + esc(lang === 'en' ? s.en : s.pt) + '</button>';
          }).join('') +
          '  </div>' +
          '</div>'
        : '';

      tabContent =
        '<div class="sb-fin-cards">' +
        '  <div class="sb-fin-card"><span>' + esc(t('fin_total_notes')) + '</span><strong class="sb-tabular">' + formatBRL(totalNotes) + '</strong></div>' +
        '  <div class="sb-fin-card"><span>' + esc(t('fin_paid_guest')) + '</span><strong class="sb-tabular" style="color:#059669;">' + formatBRL(paidGuest) + '</strong></div>' +
        '  <div class="sb-fin-card"><span>' + esc(t('fin_paid_concierge')) + '</span><strong class="sb-tabular" style="color:#9333ea;">' + formatBRL(paidConcierge) + '</strong></div>' +
        '</div>' +
        '<div class="sb-two-pane">' +
        '  <div class="sb-card">' +
        '    <h4 class="sb-card-title" style="margin-bottom:0.65rem !important;">' + esc(t('checklist_title')) + '</h4>' +
        '    <div class="sb-checklist">' + checklistHtml + '</div>' +
        '  </div>' +
        '  <form class="sb-card" id="sb-nfe-form">' +
        '    <h4 class="sb-card-title" style="margin-bottom:0.65rem !important;">' + esc(t('nfe_form_title')) + '</h4>' +
        '    <div class="sb-form-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:0;">' +
        '      <div class="sb-field"><label for="sb-nfe-sup">' + esc(t('field_supplier')) + '</label><select id="sb-nfe-sup" class="sb-select">' + supOptions + '</select></div>' +
        '      <div class="sb-field"><label for="sb-nfe-amt">' + esc(t('field_nfe_val')) + '</label><input id="sb-nfe-amt" class="sb-input sb-tabular" type="text" value="' + esc(state.nfeDraft.amount) + '" /></div>' +
        '      <div class="sb-field"><label for="sb-nfe-date">' + esc(t('field_nfe_date')) + '</label><input id="sb-nfe-date" class="sb-input sb-tabular" type="date" value="' + esc(state.nfeDraft.date) + '" /></div>' +
        '      <div class="sb-field"><label for="sb-nfe-payer">' + esc(t('field_payer')) + '</label><select id="sb-nfe-payer" class="sb-select">' +
        '        <option value="guest"' + (state.nfeDraft.payer === 'guest' ? ' selected' : '') + '>' + esc(t('payer_guest')) + '</option>' +
        '        <option value="concierge"' + (state.nfeDraft.payer === 'concierge' ? ' selected' : '') + '>' + esc(t('payer_concierge')) + '</option>' +
        '      </select></div>' +
        '    </div>' +
        '    <button type="submit" class="sb-btn sb-btn-purple sb-btn-full" data-tour-target="step-6-attach-nfe-btn">📎 ' + esc(t('btn_attach_nfe')) + '</button>' +
        '  </form>' +
        '</div>' +
        notesListHtml +
        xlsxHtml;
    }

    var finalBadge = isFinalized
      ? '<span class="sb-badge sb-badge-emerald">' + esc(t('status_finalized')) + '</span>'
      : '<span class="sb-badge sb-badge-sky">' + esc(t('status_prep')) + '</span>';

    var closeOrderBtn = !isFinalized
      ? '<button type="button" class="sb-btn sb-btn-emerald" data-action="close-order" data-tour-target="step-7-close-order-btn">✓ ' + esc(t('btn_close_order')) + '</button>'
      : '<span class="sb-badge sb-badge-emerald" style="padding:0.45rem 0.85rem;font-size:0.8rem;">' + esc(t('status_finalized')) + '</span>';

    return (
      '<div class="sb-card">' +
      '  <div class="sb-order-row" style="margin-bottom:0.85rem;">' +
      '    <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">' +
      '      <button type="button" class="sb-btn sb-btn-outline sb-btn-sm" data-action="back-orders-list">' + esc(t('btn_back_list')) + '</button>' +
      '      <h4 class="sb-card-title">Pedido #' + ord.number + ' • ' + esc(ord.house) + '</h4>' +
      '      ' + finalBadge +
      '    </div>' +
      '    <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">' +
      '      ' + closeOrderBtn +
      '    </div>' +
      '  </div>' +
      '  <div class="sb-stepper-4" style="margin-bottom:0.85rem;">' + stepperHtml + '</div>' +
      '  <div class="sb-detail-tabs" style="margin-top:0.5rem;">' +
      '    <button type="button" class="sb-detail-tab ' + (state.orderDetailTab === 'items' ? 'is-active' : '') + '" data-action="order-tab" data-tab="items">' + esc(t('dtab_items')) + '</button>' +
      '    <button type="button" class="sb-detail-tab is-purple ' + (state.orderDetailTab === 'notes' ? 'is-active' : '') + '" data-action="order-tab" data-tab="notes">' + esc(t('dtab_notes')) + ' (' + ord.notes.length + ')</button>' +
      '    <button type="button" class="sb-detail-tab ' + (state.orderDetailTab === 'audit' ? 'is-active' : '') + '" data-action="order-tab" data-tab="audit">' + esc(t('dtab_audit')) + '</button>' +
      '  </div>' +
      '</div>' +
      tabContent +
      (hasNotes && state.orderDetailTab !== 'notes' ? '<div style="text-align:right;"><button type="button" class="sb-btn sb-btn-purple sb-btn-sm" data-action="order-tab" data-tab="notes">' + esc(t('dtab_notes')) + '</button></div>' : '')
    );
  }

  function renderAdminScreen() {
    var bodyContent = state.adminTab === 'stays' ? renderAdminStays() : renderAdminOrders();

    var staysActions = state.adminTab === 'stays'
      ? '<div class="sb-subfilters">' +
        '  <button type="button" class="sb-chip-btn ' + (state.stayFilter === 'active' ? 'is-active' : '') + '" data-action="stay-filter" data-val="active">' + esc(t('filter_active')) + '</button>' +
        '  <button type="button" class="sb-btn sb-btn-dark sb-btn-sm" data-action="toggle-new-stay">' + esc(t('btn_new_stay')) + '</button>' +
        '</div>'
      : '';

    return (
      '<div class="sb-app-screen">' +
      renderAdminHeader() +
      '<div class="sb-app-body">' +
      '  <div class="sb-admin-tabs">' +
      '    <div class="sb-tab-group">' +
      '      <button type="button" class="sb-tab-btn ' + (state.adminTab === 'stays' ? 'is-active' : '') + '" data-action="admin-tab" data-tab="stays">' +
      '        ' + esc(t('tab_stays')) + ' <span class="sb-count-pill">' + state.stays.length + '</span>' +
      '      </button>' +
      '      <button type="button" class="sb-tab-btn ' + (state.adminTab === 'orders' ? 'is-active' : '') + '" data-action="admin-tab" data-tab="orders">' +
      '        ' + esc(t('tab_orders')) + ' <span class="sb-count-pill">' + state.orders.length + '</span>' +
      '      </button>' +
      '    </div>' +
      staysActions +
      '  </div>' +
      bodyContent +
      '</div>' +
      '</div>'
    );
  }

  /* ---- Carbonara Invite Overlay (after Auto-Play completes) ---- */
  function renderCarbonaraInviteModal() {
    if (!state.showCarbonaraInvite) return '';
    return (
      '<div class="sb-invite-backdrop" role="dialog" aria-modal="true" aria-labelledby="sb-invite-title">' +
      '  <div class="sb-invite-card">' +
      '    <button type="button" class="sb-invite-close" aria-label="Fechar" data-action="dismiss-invite">✕</button>' +
      '    <div class="sb-invite-badge">🍝 ' + esc(lang === 'en' ? 'Interactive Challenge' : 'Desafio Interativo') + '</div>' +
      '    <h3 class="sb-invite-title" id="sb-invite-title">' + esc(t('invite_title')) + '</h3>' +
      '    <p class="sb-invite-desc">' + esc(t('invite_desc')) + '</p>' +
      '    <div class="sb-invite-ingredients">' +
      CARBONARA_META.map(function (cm) {
        return '<span class="sb-invite-ing-pill">✓ ' + esc(lang === 'en' ? cm.shortEn : cm.shortPt) + '</span>';
      }).join('') +
      '    </div>' +
      '    <div class="sb-invite-actions">' +
      '      <button type="button" class="sb-btn sb-btn-amber sb-invite-primary" data-action="start-carbonara-challenge">' + esc(t('invite_btn_start')) + '</button>' +
      '      <div class="sb-invite-secondary-row">' +
      '        <button type="button" class="sb-btn sb-btn-outline sb-btn-sm" data-action="open-sheet-preview">' + esc(t('invite_btn_preview')) + '</button>' +
      '        <button type="button" class="sb-btn sb-btn-outline sb-btn-sm" data-action="restart-autoplay">' + esc(t('invite_btn_rewatch')) + '</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  /* ---- Authentic Excel-Style Sheet Preview Modal ---- */
  function renderSheetPreviewModal() {
    if (!state.showSheetModal) return '';
    var ord = getCurrentOrder() || (state.orders.length ? state.orders[0] : null);
    if (!ord) return '';

    var orderSupIds = [];
    ord.items.forEach(function (it) {
      if (orderSupIds.indexOf(it.sup) === -1) orderSupIds.push(it.sup);
    });
    var orderSuppliers = SUPPLIERS.filter(function (s) {
      return orderSupIds.indexOf(s.id) !== -1;
    });

    var activeTab = state.activeSheetTab || 'geral';
    if (activeTab !== 'geral' && orderSupIds.indexOf(activeTab) === -1) {
      activeTab = 'geral';
    }

    var visibleItems = activeTab === 'geral'
      ? ord.items
      : ord.items.filter(function (it) { return it.sup === activeTab; });

    var itemsSum = 0;
    visibleItems.forEach(function (it) {
      itemsSum += it.qty * it.price;
    });

    var totalNotes = 0;
    var paidGuest = 0;
    var paidConcierge = 0;
    ord.notes.forEach(function (n) {
      if (activeTab === 'geral' || n.supplierId === activeTab) {
        totalNotes += n.amount;
        if (n.payer === 'guest') paidGuest += n.amount;
        else paidConcierge += n.amount;
      }
    });

    var rowsHtml = '';
    var rowNum = 1;
    rowsHtml +=
      '<tr class="sb-xl-header-row">' +
      '  <td class="sb-xl-rownum">' + (rowNum++) + '</td>' +
      '  <th>' + esc(t('sheet_col_sup')) + '</th>' +
      '  <th>' + esc(t('sheet_col_item')) + '</th>' +
      '  <th class="sb-xl-num">' + esc(t('sheet_col_qty')) + '</th>' +
      '  <th>' + esc(t('sheet_col_unit')) + '</th>' +
      '  <th class="sb-xl-num">' + esc(t('sheet_col_est')) + '</th>' +
      '  <th>' + esc(t('sheet_col_note')) + '</th>' +
      '</tr>';

    visibleItems.forEach(function (it) {
      var sup = getSupplierObj(it.sup);
      var supLabel = lang === 'en' ? sup.en : sup.pt;
      var supTextColor = sup.id === 'frios-laticinios' ? '#1c1917' : '#ffffff';
      var simLabel = it.similar
        ? (lang === 'en' ? 'Subst. OK' : 'Aceita similar')
        : (lang === 'en' ? 'Exact only' : 'Sem similar');
      rowsHtml +=
        '<tr>' +
        '  <td class="sb-xl-rownum">' + (rowNum++) + '</td>' +
        '  <td><span class="sb-xl-sup-tag" style="background:' + sup.color + ';color:' + supTextColor + ';">' + esc(supLabel) + '</span></td>' +
        '  <td><strong>' + esc(lang === 'en' ? it.en : it.pt) + '</strong></td>' +
        '  <td class="sb-xl-num sb-tabular">' + it.qty + '</td>' +
        '  <td>' + esc(it.unit) + '</td>' +
        '  <td class="sb-xl-num sb-tabular">' + formatBRL(it.qty * it.price) + '</td>' +
        '  <td class="sb-xl-muted">' + esc(simLabel) + '</td>' +
        '</tr>';
    });

    var lastItemRow = Math.max(2, rowNum - 1);
    var totalRowNum = rowNum++;
    rowsHtml +=
      '<tr class="sb-xl-total-row">' +
      '  <td class="sb-xl-rownum">' + totalRowNum + '</td>' +
      '  <td colspan="4"><strong>' + esc(t('sheet_row_total_est')) + '</strong></td>' +
      '  <td class="sb-xl-num sb-tabular"><strong>' + formatBRL(itemsSum) + '</strong></td>' +
      '  <td class="sb-xl-muted sb-tabular">=SUM(E2:E' + lastItemRow + ')</td>' +
      '</tr>';

    if (totalNotes > 0) {
      rowsHtml +=
        '<tr class="sb-xl-summary-row">' +
        '  <td class="sb-xl-rownum">' + (rowNum++) + '</td>' +
        '  <td colspan="4">' + esc(t('sheet_row_total_notes')) + '</td>' +
        '  <td class="sb-xl-num sb-tabular"><strong>' + formatBRL(totalNotes) + '</strong></td>' +
        '  <td>' + esc(ord.notes.length + ' NF-e') + '</td>' +
        '</tr>' +
        '<tr class="sb-xl-summary-row">' +
        '  <td class="sb-xl-rownum">' + (rowNum++) + '</td>' +
        '  <td colspan="4">' + esc(t('sheet_row_paid_guest')) + '</td>' +
        '  <td class="sb-xl-num sb-tabular" style="color:#059669;"><strong>' + formatBRL(paidGuest) + '</strong></td>' +
        '  <td><span class="sb-xl-payer-pill is-guest">' + esc(lang === 'en' ? 'Guest' : 'Hóspede') + '</span></td>' +
        '</tr>' +
        '<tr class="sb-xl-summary-row">' +
        '  <td class="sb-xl-rownum">' + (rowNum++) + '</td>' +
        '  <td colspan="4">' + esc(t('sheet_row_paid_concierge')) + '</td>' +
        '  <td class="sb-xl-num sb-tabular" style="color:#9333ea;"><strong>' + formatBRL(paidConcierge) + '</strong></td>' +
        '  <td><span class="sb-xl-payer-pill is-concierge">Concierge</span></td>' +
        '</tr>';
    }

    var sheetTabsHtml =
      '<button type="button" class="sb-xl-sheet-tab ' + (activeTab === 'geral' ? 'is-active' : '') + '" data-action="select-sheet-tab" data-sheet="geral">' +
      '  <span class="sb-xl-tab-dot" style="background:#107c41;"></span>' +
      '  <span>' + esc(t('sheet_tab_general')) + '</span>' +
      '</button>' +
      orderSuppliers.map(function (s) {
        var isAct = activeTab === s.id;
        return (
          '<button type="button" class="sb-xl-sheet-tab ' + (isAct ? 'is-active' : '') + '" data-action="select-sheet-tab" data-sheet="' + s.id + '">' +
          '  <span class="sb-xl-tab-dot" style="background:' + s.color + ';"></span>' +
          '  <span>' + esc(lang === 'en' ? s.en : s.pt) + '</span>' +
          '</button>'
        );
      }).join('');

    return (
      '<div class="sb-excel-backdrop" role="dialog" aria-modal="true" aria-labelledby="sb-xl-title">' +
      '  <div class="sb-excel-window">' +
      '    <div class="sb-xl-topbar">' +
      '      <div class="sb-xl-title-group">' +
      '        <span class="sb-xl-icon">X</span>' +
      '        <strong id="sb-xl-title">' + esc(t('sheet_modal_title')) + '</strong>' +
      '        <span class="sb-xl-badge">ExcelJS</span>' +
      '      </div>' +
      '      <div class="sb-xl-top-actions">' +
      '        <button type="button" class="sb-xl-top-btn" data-action="download-csv">⬇ ' + esc(t('btn_download_xlsx')) + '</button>' +
      '        <button type="button" class="sb-xl-close-btn" data-action="close-sheet-preview">✕ ' + esc(t('sheet_close_btn')) + '</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="sb-xl-formulabar">' +
      '      <span class="sb-xl-namebox">E' + totalRowNum + '</span>' +
      '      <span class="sb-xl-fx">fx</span>' +
      '      <span class="sb-xl-formula-text">=SUM(E2:E' + lastItemRow + ') &nbsp;→&nbsp; <strong>' + formatBRL(itemsSum) + '</strong></span>' +
      '    </div>' +
      '    <div class="sb-xl-grid-wrap">' +
      '      <table class="sb-xl-grid">' +
      '        <thead>' +
      '          <tr>' +
      '            <th class="sb-xl-corner"></th>' +
      '            <th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th>' +
      '          </tr>' +
      '        </thead>' +
      '        <tbody>' + rowsHtml + '</tbody>' +
      '      </table>' +
      '    </div>' +
      '    <div class="sb-xl-tabs-bar" role="tablist" aria-label="Worksheet tabs">' + sheetTabsHtml + '</div>' +
      '  </div>' +
      '</div>'
    );
  }

  /* ---- Micro-Balloon (compact, 1-line tip, points to the target button) ---- */
  function renderMicroBalloon() {
    if (!state.tourActive || state.showCarbonaraInvite || state.showSheetModal) {
      return '<div class="sb-coachmark is-hidden" id="sb-coachmark"></div>';
    }
    var dict = I18N[lang] || I18N.pt;
    var mbText = dict.mb_steps[state.tourStep] || dict.mb_steps['1'];

    if (state.tourStep === '4b') {
      var cStats = getCarbonaraStats();
      if (cStats.doneCount === cStats.total) {
        mbText = lang === 'en' ? '📩 5/5 Carbonara! Send order' : '📩 5/5 Carbonara! Envie o pedido';
      } else if (cStats.doneCount > 0) {
        mbText = lang === 'en'
          ? '🍝 ' + cStats.doneCount + '/5 Carbonara — pick more or send!'
          : '🍝 ' + cStats.doneCount + '/5 Carbonara — continue ou envie!';
      }
    }

    return (
      '<aside class="sb-coachmark sb-coachmark-micro" id="sb-coachmark" role="tooltip" aria-live="polite" data-placement="bottom">' +
      '  <div class="sb-coachmark-arrow" aria-hidden="true"></div>' +
      '  <span class="sb-mb-text">' + esc(mbText) + '</span>' +
      '</aside>'
    );
  }

  /* ------------------------------------------------------------------------
     Coachmark (Micro-Balloon) Positioning Engine
     Guarantees balloon never covers target button or any inputs
     ------------------------------------------------------------------------ */
  function getActiveTargetSelector() {
    switch (state.tourStep) {
      case '1': return '[data-tour-target="step-1-login-btn"]';
      case '2': return '[data-tour-target="step-2-save-stay-btn"]';
      case '3': return '[data-tour-target="step-3-open-menu-btn"]';
      case '4a': return '[data-tour-target="step-4a-add-item-btn"]';
      case '4b': return '[data-tour-target="step-4b-send-order-btn"]';
      case '5a': return '[data-tour-target="step-5a-open-order-btn"]';
      case '5b': return '[data-tour-target="step-5b-approve-btn"]';
      case '6': return '[data-tour-target="step-6-attach-nfe-btn"]';
      case '7': return '[data-tour-target="step-7-close-order-btn"]';
      case '7done': return '[data-tour-target="step-7done-xlsx-card"]';
      default: return null;
    }
  }

  function rectsOverlap(a, b, pad) {
    var p = pad || 0;
    return !(
      a.right + p <= b.left ||
      a.left - p >= b.right ||
      a.bottom + p <= b.top ||
      a.top - p >= b.bottom
    );
  }

  function positionCoachmark() {
    if (!rootEl || !state || !state.tourActive || state.showCarbonaraInvite || state.showSheetModal) return;
    var stage = rootEl.querySelector('.sb-stage');
    var cm = rootEl.querySelector('#sb-coachmark');
    if (!stage || !cm) return;

    rootEl.querySelectorAll('.sb-tour-highlight').forEach(function (el) {
      el.classList.remove('sb-tour-highlight');
    });

    var selector = getActiveTargetSelector();
    var target = selector ? rootEl.querySelector(selector) : null;
    if (!target) {
      cm.setAttribute('data-placement', 'center');
      cm.style.top = '10px';
      cm.style.left = '10px';
      return;
    }

    target.classList.add('sb-tour-highlight');

    var stageRect = stage.getBoundingClientRect();
    var tRect = target.getBoundingClientRect();
    var cmRect = cm.getBoundingClientRect();
    var cw = cmRect.width || 240;
    var ch = cmRect.height || 42;
    var vw = window.innerWidth || document.documentElement.clientWidth || 1280;
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var margin = 8;
    var inItemCard = !!target.closest('.sb-item-card');
    var gap = inItemCard ? 19 : 10;

    var tLeft = tRect.left - stageRect.left;
    var tTop = tRect.top - stageRect.top;
    var tRight = tLeft + tRect.width;
    var tBottom = tTop + tRect.height;
    var tCenterX = tLeft + tRect.width / 2;
    var tCenterY = tTop + tRect.height / 2;

    var waBtn = document.getElementById('floating-whatsapp-btn');
    var waRect = waBtn ? waBtn.getBoundingClientRect() : null;

    // Gather all interactive controls, item cards & toast to avoid overlapping (excluding target itself)
    var controlRects = [];
    rootEl.querySelectorAll('input, select, textarea, button, .sb-qty-val, .sb-fin-card, .sb-nfe-preview, .sb-item-card, .sb-toast, .sb-phase-box').forEach(function (el) {
      if (el === target || target.contains(el)) return;
      if (el.contains(target) && !el.classList.contains('sb-item-card')) return;
      var r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) controlRects.push(r);
    });

    var vpMinLeft = Math.max(8, margin - stageRect.left);
    var vpMaxLeft = Math.min(stageRect.width - cw - 8, vw - margin - cw - stageRect.left);
    if (vpMaxLeft < vpMinLeft) {
      vpMinLeft = margin - stageRect.left;
      vpMaxLeft = vw - margin - cw - stageRect.left;
    }
    var stageMinTop = 8;
    var stageMaxTop = Math.max(stageMinTop, stageRect.height - ch - 8);
    var vpMinTop = Math.max(stageMinTop, margin - stageRect.top);
    var vpMaxTop = Math.min(stageMaxTop, vh - margin - ch - stageRect.top);
    if (vpMaxTop < vpMinTop) {
      vpMinTop = stageMinTop;
      vpMaxTop = stageMaxTop;
    }

    function clamp(val, min, max) {
      if (max < min) return min;
      return Math.max(min, Math.min(max, val));
    }

    var isMobile = vw <= 640;
    var order = isMobile ? ['bottom', 'top'] : (inItemCard ? ['bottom', 'top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']);
    var candidates = [];

    order.forEach(function (dir) {
      var candLeft, candTop;
      if (dir === 'bottom') {
        candTop = tBottom + gap;
        candLeft = clamp(tCenterX - cw / 2, vpMinLeft, vpMaxLeft);
        if (waRect && candLeft + cw > waRect.left - 8 && stageRect.top + candTop + ch > waRect.top - 8) {
          candLeft = clamp(waRect.left - stageRect.left - cw - 10, vpMinLeft, vpMaxLeft);
        }
      } else if (dir === 'top') {
        candTop = tTop - ch - gap;
        candLeft = clamp(tCenterX - cw / 2, vpMinLeft, vpMaxLeft);
      } else if (dir === 'right') {
        candLeft = tRight + gap;
        candTop = clamp(tCenterY - ch / 2, vpMinTop, vpMaxTop);
      } else {
        candLeft = tLeft - cw - gap;
        candTop = clamp(tCenterY - ch / 2, vpMinTop, vpMaxTop);
      }

      var absBox = {
        left: stageRect.left + candLeft,
        top: stageRect.top + candTop,
        right: stageRect.left + candLeft + cw,
        bottom: stageRect.top + candTop + ch
      };

      var inVp =
        absBox.left >= margin - 1 &&
        absBox.right <= vw - margin + 1 &&
        absBox.top >= margin - 1 &&
        absBox.bottom <= vh - margin + 1;

      var inStage =
        candLeft >= 6 &&
        candLeft + cw <= stageRect.width - 6 &&
        candTop >= 6 &&
        candTop + ch <= stageRect.height - 6;

      var overlapsTarget = rectsOverlap(absBox, tRect, 6);
      var overlapsWa = waRect ? rectsOverlap(absBox, waRect, 6) : false;

      // Count how many interactive controls this overlaps
      var overlapsControls = 0;
      controlRects.forEach(function (cr) {
        if (rectsOverlap(absBox, cr, 3)) overlapsControls++;
      });

      candidates.push({
        dir: dir,
        left: candLeft,
        top: candTop,
        absBox: absBox,
        inVp: inVp,
        inStage: inStage,
        overlapsTarget: overlapsTarget,
        overlapsWa: overlapsWa,
        overlapsControls: overlapsControls,
        score: (inVp ? 100 : 0) + (inStage ? 40 : 0) + (!overlapsTarget ? 60 : 0) + (!overlapsWa ? 80 : 0) + (-overlapsControls * 90)
      });
    });

    candidates.sort(function (a, b) {
      return b.score - a.score;
    });

    var best = candidates[0];
    var finalLeft = best.left;
    var finalTop = best.top;
    var finalDir = best.dir;

    if (!best.inVp && !(best.inStage && best.overlapsControls === 0)) {
      var spaceAbove = tTop - stageMinTop;
      var spaceBelow = stageRect.height - 8 - tBottom;
      if (spaceAbove >= ch + gap || spaceAbove >= spaceBelow) {
        finalDir = 'top';
        finalTop = clamp(tTop - ch - gap, stageMinTop, Math.max(stageMinTop, tTop - ch - 8));
      } else {
        finalDir = 'bottom';
        finalTop = clamp(tBottom + gap, tBottom + 8, Math.max(tBottom + 8, stageMaxTop));
      }
      finalLeft = clamp(tCenterX - cw / 2, vpMinLeft, vpMaxLeft);
    }

    cm.setAttribute('data-placement', finalDir);
    cm.style.left = Math.round(finalLeft) + 'px';
    cm.style.top = Math.round(finalTop) + 'px';

    if (finalDir === 'top' || finalDir === 'bottom') {
      var arrowX = clamp(tCenterX - finalLeft, 16, cw - 16);
      cm.style.setProperty('--arrow-left', Math.round(arrowX) + 'px');
    } else {
      var arrowY = clamp(tCenterY - finalTop, 16, ch - 16);
      cm.style.setProperty('--arrow-top', Math.round(arrowY) + 'px');
    }
  }

  function schedulePositionCoachmark() {
    if (rafPosId !== null) return;
    rafPosId = requestAnimationFrame(function () {
      rafPosId = null;
      positionCoachmark();
    });
  }

  function scrollOverlayIntoView(selector) {
    if (!rootEl || !selector) return;
    setTimeout(function () {
      var el = rootEl.querySelector(selector);
      if (!el) return;
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      if (r.top < 16 || r.bottom > vh - 16) {
        var isLocoSmooth =
          document.documentElement.classList.contains('has-scroll-smooth') &&
          typeof scroll !== 'undefined' &&
          scroll &&
          typeof scroll.scrollTo === 'function';
        if (isLocoSmooth) {
          try {
            if (typeof scroll.update === 'function') scroll.update();
            scroll.scrollTo(el, { offset: -Math.max(24, Math.round((vh - Math.min(r.height, vh - 48)) / 2)), duration: 180, disableLerp: true });
          } catch (e) {}
        } else if (typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      }
    }, 40);
  }

  function scrollTargetComfortably(targetAttr) {
    if (!rootEl || !targetAttr) return;
    if (state && (state.autoPlayStatus === 'running' || state.showCarbonaraInvite || state.showSheetModal)) return;
    var target = rootEl.querySelector('[data-tour-target="' + targetAttr + '"]');
    if (!target) return;
    var sbShell = rootEl.querySelector('.sb-shell');
    if (!sbShell) return;

    var vh = window.innerHeight || 800;
    var isLocoSmooth =
      document.documentElement.classList.contains('has-scroll-smooth') &&
      typeof scroll !== 'undefined' &&
      scroll &&
      typeof scroll.scrollTo === 'function';

    var shellRect = sbShell.getBoundingClientRect();
    var rect = target.getBoundingClientRect();

    // Keep the top of .sb-shell (stepper + narrative strip) and the target visible together
    var isMob = (window.innerWidth || 1280) <= 640;
    var bottomPad = isMob ? 110 : 88;
    var targetFitsWithShell = (rect.bottom - shellRect.top) <= (vh - bottomPad);
    var scrollAnchor = targetFitsWithShell ? sbShell : target;
    var offsetVal = targetFitsWithShell ? -14 : -Math.round(vh * 0.45);

    if (shellRect.top < 8 || rect.bottom > vh - bottomPad || rect.top < 56) {
      if (isLocoSmooth) {
        try {
          if (typeof scroll.update === 'function') scroll.update();
          if (typeof scroll.start === 'function') scroll.start();
          scroll.scrollTo(scrollAnchor, { offset: offsetVal, duration: 160, disableLerp: true });
        } catch (e) {}
      } else if (typeof scrollAnchor.scrollIntoView === 'function') {
        scrollAnchor.scrollIntoView({
          block: targetFitsWithShell ? 'start' : 'center',
          behavior: 'auto'
        });
      }
    }
  }

  function scrollTargetLater(targetAttr) {
    var skipScroll = !!(state && (state.autoPlayStatus === 'running' || state.showCarbonaraInvite || state.showSheetModal));
    render();
    setTimeout(function () {
      if (!skipScroll) scrollTargetComfortably(targetAttr);
      positionCoachmark();
    }, 60);
    setTimeout(positionCoachmark, 380);
  }

  function renderAndScroll(targetAttr) {
    render();
    scrollTargetComfortably(targetAttr);
    requestAnimationFrame(positionCoachmark);
    setTimeout(positionCoachmark, 360);
  }

  function syncLocomotiveHeight() {
    if (typeof scroll !== 'undefined' && scroll) {
      if (typeof scroll.update === 'function') scroll.update();
      if (!locoScrollBound && typeof scroll.on === 'function') {
        locoScrollBound = true;
        scroll.on('scroll', schedulePositionCoachmark);
      }
    }
    if (typeof ScrollTrigger !== 'undefined') {
      try { ScrollTrigger.refresh(); } catch (e) {}
    }
  }

  /* ------------------------------------------------------------------------
     Main Render & Event Delegation
     ------------------------------------------------------------------------ */
  function render() {
    if (!rootEl || !state) return;

    var screenHtml = '';
    if (state.screen === 'login') screenHtml = renderLoginScreen();
    else if (state.screen === 'menu') screenHtml = renderCookMenuScreen();
    else screenHtml = renderAdminScreen();

    var toastHtml = state.toast ? '<div class="sb-toast" role="status">' + esc(state.toast) + '</div>' : '';
    var cStats = getCarbonaraStats();
    var hasModal = !!(state.showCarbonaraInvite || state.showSheetModal);

    rootEl.innerHTML =
      '<div class="sb-shell" data-autoplay="' + esc(state.autoPlayStatus) + '" data-tour-step="' + esc(state.tourStep) + '" data-carbonara-count="' + cStats.doneCount + '" data-challenge="' + (state.challengeMode ? '1' : '0') + '">' +
      renderChrome() +
      renderNarrativeStrip() +
      '  <div class="sb-stage' + (hasModal ? ' has-overlay' : '') + '">' +
      toastHtml +
      screenHtml +
      renderMicroBalloon() +
      renderCarbonaraInviteModal() +
      renderSheetPreviewModal() +
      '  </div>' +
      '</div>';

    requestAnimationFrame(function () {
      positionCoachmark();
      syncLocomotiveHeight();
    });
  }

  function interruptAutoPlayOnUserAction(targetEl) {
    if (!state || state.autoPlayStatus !== 'running') return;
    hasTriggeredViewportAutoplay = true;
    var activeId = targetEl && targetEl.id ? targetEl.id : null;
    stopAutoPlay('paused');
    if (activeId && rootEl) {
      var restored = rootEl.querySelector('#' + activeId);
      if (restored && typeof restored.focus === 'function') restored.focus();
    }
  }

  function bindSandboxEvents() {
    if (!rootEl || rootEl._sbBound) return;
    rootEl._sbBound = true;

    rootEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) {
        if (state && state.autoPlayStatus === 'running') {
          interruptAutoPlayOnUserAction(e.target);
        }
        return;
      }
      var action = btn.getAttribute('data-action');

      if (action === 'toggle-autoplay') {
        toggleAutoPlay();
        return;
      }
      if (action === 'restart-autoplay') {
        startAutoPlay(true);
        return;
      }

      if (state && state.autoPlayStatus === 'running') {
        hasTriggeredViewportAutoplay = true;
        clearAutoPlayTimers();
        state.autoPlayStatus = 'paused';
      }

      switch (action) {
        case 'toggle-tour':
          state.tourActive = !state.tourActive;
          render();
          break;
        case 'restart-tour':
          restartTour();
          break;
        case 'start-carbonara-challenge':
          startCarbonaraChallenge();
          break;
        case 'dismiss-invite':
          state.showCarbonaraInvite = false;
          render();
          break;
        case 'open-sheet-preview':
          state.showCarbonaraInvite = false;
          state.showSheetModal = true;
          state.activeSheetTab = 'geral';
          clearToast();
          render();
          scrollOverlayIntoView('.sb-excel-window');
          break;
        case 'open-sheet-tab':
          state.showCarbonaraInvite = false;
          state.showSheetModal = true;
          state.activeSheetTab = btn.getAttribute('data-sheet') || 'geral';
          clearToast();
          render();
          scrollOverlayIntoView('.sb-excel-window');
          break;
        case 'close-sheet-preview':
          state.showSheetModal = false;
          render();
          break;
        case 'select-sheet-tab':
          state.activeSheetTab = btn.getAttribute('data-sheet') || 'geral';
          render();
          break;
        case 'carbonara-jump': {
          var targetSup = btn.getAttribute('data-sup');
          var targetItem = btn.getAttribute('data-item');
          if (targetSup) state.activeSupplier = targetSup;
          pulsedItemId = targetItem || null;
          if (pulseItemTimer) clearTimeout(pulseItemTimer);
          pulseItemTimer = setTimeout(function () {
            pulsedItemId = null;
            var el = rootEl && rootEl.querySelector('.sb-item-card.sb-item-pulse');
            if (el) el.classList.remove('sb-item-pulse');
          }, 1400);
          render();
          break;
        }
        case 'tour-next':
          handleTourNextAuto();
          break;
        case 'tour-prev':
          handleTourPrev();
          break;
        case 'rail-step':
          jumpToTourStep(btn.getAttribute('data-step'));
          break;
        case 'select-profile':
          state.selectedProfile = btn.getAttribute('data-profile');
          var prof = PROFILES.find(function (p) { return p.id === state.selectedProfile; });
          if (prof) state.loginUser = prof.user;
          render();
          break;
        case 'logout':
          state.screen = 'login';
          clearToast();
          if (state.tourActive) state.tourStep = '1';
          render();
          break;
        case 'admin-tab':
          state.adminTab = btn.getAttribute('data-tab');
          if (state.adminTab === 'orders' && state.orders.length > 0 && state.tourActive && state.tourStep === '3') {
            state.tourStep = '5a';
          }
          render();
          break;
        case 'toggle-new-stay':
          state.showNewStayForm = !state.showNewStayForm;
          render();
          break;
        case 'copy-link':
          showToast(t('toast_link_copied'));
          break;
        case 'wa-invite':
          showToast(t('toast_wa_invite'));
          break;
        case 'open-menu':
          doOpenMenu(btn.getAttribute('data-code'));
          break;
        case 'back-admin':
          state.screen = 'admin';
          state.adminTab = state.orders.length > 0 ? 'orders' : 'stays';
          clearToast();
          render();
          break;
        case 'apply-kit':
          doApplyKit(btn.getAttribute('data-kit'));
          break;
        case 'select-sup':
          state.activeSupplier = btn.getAttribute('data-sup');
          render();
          break;
        case 'qty-plus':
          doChangeQty(btn.getAttribute('data-item'), 1);
          break;
        case 'qty-minus':
          doChangeQty(btn.getAttribute('data-item'), -1);
          break;
        case 'toggle-similar': {
          var id = btn.getAttribute('data-item');
          if (!state.cart[id]) state.cart[id] = { qty: 0, similar: true };
          state.cart[id].similar = !state.cart[id].similar;
          render();
          break;
        }
        case 'send-order':
          doSendOrder();
          break;
        case 'open-order':
          doOpenOrder(btn.getAttribute('data-order'));
          break;
        case 'approve-send':
          doApproveAndSend();
          break;
        case 'back-orders-list':
          state.selectedOrderId = null;
          render();
          break;
        case 'order-tab':
          state.orderDetailTab = btn.getAttribute('data-tab');
          render();
          break;
        case 'toggle-wa-preview':
          state.showWhatsappPreview = !state.showWhatsappPreview;
          render();
          break;
        case 'close-order':
          doCloseOrder();
          break;
        case 'download-csv':
          downloadDemoCsv();
          break;
        case 'stay-filter':
          state.stayFilter = btn.getAttribute('data-val');
          render();
          break;
        default:
          break;
      }
    });

    rootEl.addEventListener('submit', function (e) {
      if (state && state.autoPlayStatus === 'running') {
        hasTriggeredViewportAutoplay = true;
        clearAutoPlayTimers();
        state.autoPlayStatus = 'paused';
      }
      if (e.target && e.target.id === 'sb-login-form') {
        e.preventDefault();
        doLogin();
      } else if (e.target && e.target.id === 'sb-new-stay-form') {
        e.preventDefault();
        doSaveStay();
      } else if (e.target && e.target.id === 'sb-nfe-form') {
        e.preventDefault();
        doAttachMockNfe();
      }
    });

    rootEl.addEventListener('input', function (e) {
      var id = e.target && e.target.id;
      if (!id) return;
      if (id === 'sb-login-user') state.loginUser = e.target.value;
      else if (id === 'sb-login-pass') state.loginPass = e.target.value;
      else if (id === 'sb-stay-house') state.stayDraft.house = e.target.value;
      else if (id === 'sb-stay-guests') state.stayDraft.guests = e.target.value;
      else if (id === 'sb-stay-checkin') state.stayDraft.checkin = e.target.value;
      else if (id === 'sb-stay-checkout') state.stayDraft.checkout = e.target.value;
      else if (id === 'sb-stay-holder') state.stayDraft.holder = e.target.value;
      else if (id === 'sb-stay-notes') state.stayDraft.notes = e.target.value;
      else if (id === 'sb-nfe-amt') state.nfeDraft.amount = e.target.value;
      else if (id === 'sb-nfe-date') state.nfeDraft.date = e.target.value;
      if (state && state.autoPlayStatus === 'running') {
        interruptAutoPlayOnUserAction(e.target);
      }
    });

    rootEl.addEventListener('change', function (e) {
      var target = e.target;
      if (!target) return;
      if (target.id === 'sb-nfe-sup') state.nfeDraft.supplier = target.value;
      else if (target.id === 'sb-nfe-payer') state.nfeDraft.payer = target.value;
      else if (target.getAttribute('data-action') === 'toggle-item-check') {
        var ord = getCurrentOrder();
        var itemId = target.getAttribute('data-item');
        if (ord) {
          ord.items.forEach(function (it) {
            if (it.id === itemId) it.checked = target.checked;
          });
        }
      }
      if (state && state.autoPlayStatus === 'running') {
        interruptAutoPlayOnUserAction(target);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Bootstrap & Language Sync
     ------------------------------------------------------------------------ */
  function resolveLanguage() {
    if (typeof window.portfolioGetLanguage === 'function') {
      return window.portfolioGetLanguage() === 'en' ? 'en' : 'pt';
    }
    try {
      return localStorage.getItem('portfolio_lang') === 'en' ? 'en' : 'pt';
    } catch (e) {
      return 'pt';
    }
  }

  function initSandbox() {
    rootEl = document.getElementById('compras-sandbox-root');
    if (!rootEl) return;

    lang = resolveLanguage();
    applyPageTranslations();

    if (!state) {
      state = createInitialState();
    }

    bindSandboxEvents();
    render();
    setupViewportObserver();
  }

  window.addEventListener('portfolio:langchange', function (e) {
    var nextLang = e && e.detail && e.detail.lang === 'en' ? 'en' : 'pt';
    if (nextLang !== lang) {
      lang = nextLang;
      applyPageTranslations();
      render();
    }
  });

  window.addEventListener('resize', schedulePositionCoachmark, { passive: true });
  window.addEventListener('scroll', schedulePositionCoachmark, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSandbox);
  } else {
    initSandbox();
  }

  window.addEventListener('load', function () {
    initSandbox();
    setTimeout(positionCoachmark, 500);
    setTimeout(syncLocomotiveHeight, 600);
  });
})();
