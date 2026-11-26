/* ==========================================================================
   Sistema de Gestão de Compras — Interactive 7-Step Sandbox & Coachmark Tour
   100% sanitized demo data • Bilingual PT | EN • Locomotive Scroll safe
   ========================================================================== */
(function () {
  'use strict';

  if (window.__comprasSandboxInit) return;
  window.__comprasSandboxInit = true;

  var rootEl = null;
  var lang = 'pt';
  var rafPosId = null;
  var locoScrollBound = false;

  /* ------------------------------------------------------------------------
     Bilingual Dictionary (Page Case Study + Sandbox + Coachmarks)
     ------------------------------------------------------------------------ */
  var I18N = {
    pt: {
      // Page Case Study Copy ([data-gc-i18n])
      gc_eyebrow: 'Estudo de Caso + Sandbox • 2026',
      gc_hero_title: 'Sistema de Gestão de Compras',
      gc_hero_lead:
        'Plataforma operacional sob medida para uma empresa imobiliária com operação de Concierge: conecta o painel administrativo (/admin) à cozinheira na casa de temporada via link único sem login (/e/:codigo), unificando pedidos, WhatsApp por fornecedor, notas fiscais e planilha .xlsx.',
      gc_meta_client_val: 'Imobiliária Concierge • Sul da Bahia',
      gc_meta_services_val: 'Design & Engenharia Full-Stack',
      gc_sb_badge: 'Demo Interativa • Dados Fictícios',
      gc_sb_heading: 'Teste o fluxo completo Dono + Cozinheira em 7 passos guiados',
      gc_sb_sub:
        'Siga os balões interativos para simular do login do Concierge até o fechamento da compra com nota fiscal e planilha .xlsx.',
      gc_overview_label: '01 • Visão Geral & Desafio',
      gc_overview_title: 'Conectando o Concierge imobiliário à cozinha da casa sem atrito',
      gc_overview_p1:
        'Em operações imobiliárias de alto padrão com serviço de Concierge no Sul da Bahia (região de Trancoso), cada estadia envolve coordenar listas de compras entre hóspedes, a cozinheira contratada para a residência e múltiplos fornecedores locais (peixaria, açougue, hortifruti, frios, bebidas e mercado).',
      gc_overview_p2:
        'O processo anterior dependia de áudios e listas soltas em mensagens, gerando esquecimentos de unidades, falta de rastreabilidade nas notas fiscais e horas gastas fechando prestações de contas manuais. A solução eliminou esse gargalo separando duas experiências na mesma base de dados: o painel completo da equipe (/admin) e um cardápio mobile-first sem senha (/e/:codigo) para a cozinheira montar o pedido direto do celular.',
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
      btn_free_explore: 'Explorar Livremente',
      btn_resume_tour: 'Retomar Guia',
      rail_steps: [
        '1. Login',
        '2. Criar Estadia',
        '3. Link Cardápio',
        '4. Pedido Cozinheira',
        '5. Abrir Pedido',
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
      toast_stay_saved: 'Estadia criada! Código /e/MIR-204 pronto para a cozinheira.',
      toast_link_copied: 'Link /e/MIR-204 copiado para a área de transferência!',
      toast_wa_invite: 'Mensagem de convite WhatsApp gerada para Chef Camila (/e/MIR-204).',

      // Step 4: Cook Menu
      menu_welcome: 'Acesso sem login liberado para',
      menu_catalog_meta: '172 itens no catálogo completo • Amostra interativa por setor',
      kits_label: 'Kits Prontos (calculados para',
      kit_applied_tag: 'aplicado',
      btn_similar_yes: 'Aceita similar: Sim',
      btn_similar_no: 'Aceita similar: Não',
      summary_selected: 'selecionados no carrinho',
      summary_est: 'Estimativa base:',
      btn_send_order: 'Fechar / Enviar Pedido',
      toast_kit_added: 'Kit aplicado proporcionalmente para 8 hóspedes e 4 dias!',
      toast_order_sent: 'Pedido #1 registrado! Encaminhado para aprovação do Concierge.',

      // Step 5, 6, 7: Orders & Detail
      orders_queue_title: 'Fila de Pedidos das Casas',
      status_pending: '⏳ Em Aprovação',
      status_suppliers: '📲 Enviar Fornecedores',
      status_prep: '🚚 Preparação & Entrega',
      status_finalized: '✅ Finalizado',
      btn_open_order: 'Abrir Pedido #1',
      btn_back_list: '← Voltar à fila',
      phase_1: '1. Em Aprovação',
      phase_2: '2. Fornecedores',
      phase_3: '3. Preparação & NF-e',
      phase_4: '4. Finalizado',
      dtab_items: 'Pedido de Compras',
      dtab_notes: 'Comprovantes & Notas',
      dtab_audit: 'Hospedagem & Auditoria',
      btn_whatsapp_preview: 'Ver Disparo WhatsApp',
      btn_approve_send: 'Aprovar & Enviar p/ Fornecedores',
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
      nfe_mock_badge: 'NF-e Anexada (Storage Privado)',
      nfe_mock_key: 'DANFE Simulada • URL Assinada 60s',
      btn_close_order: 'Fechar / Finalizar Pedido',
      xlsx_ready_title: 'Planilha ExcelJS (.xlsx) Consolidada Liberada',
      xlsx_ready_sub: 'Aba Geral + abas coloridas por fornecedor prontas para prestação de contas.',
      btn_download_xlsx: 'Baixar Resumo Demo (.csv)',
      audit_title: 'Trilha de Auditoria (America/Bahia)',
      toast_nfe_added: 'Comprovante NF-e anexado e saldo financeiro atualizado!',
      toast_order_closed: 'Pedido #1 finalizado! Planilha .xlsx e resumo consolidado liberados.',

      // Coachmark UI
      cm_step_of: 'Passo {n} de 7',
      cm_done_badge: 'Concluído • 7 de 7',
      cm_prev: 'Anterior',
      cm_next: 'Próximo (Auto)',
      cm_free: 'Explorar livre',
      cm_restart: 'Reiniciar Tour',
      cm_steps: {
        '1': {
          title: '1/7 • Login do Concierge (/admin)',
          desc: 'A equipe imobiliária entra no painel administrativo com perfis pré-configurados. Clique em "Entrar no Painel" para começar.'
        },
        '2': {
          title: '2/7 • Criar uma Estadia',
          desc: 'Preencha ou ajuste os dados fictícios da casa (Casa Mirante), datas e hóspedes. Clique em "Salvar Estadia" para gerar o link exclusivo.'
        },
        '3': {
          title: '3/7 • Link da Cozinheira sem Login',
          desc: 'O sistema gera a rota /e/MIR-204 para enviar por WhatsApp. A cozinheira acessa pelo celular sem senha! Clique em "Acessar Cardápio".'
        },
        '4a': {
          title: '4/7 • Escolher Itens no Cardápio',
          desc: 'Agora você está na visão da cozinheira (/e/MIR-204). Use os setores ou Kits Prontos e clique em "+" para adicionar pelo menos 1 item.'
        },
        '4b': {
          title: '4/7 • Fechar / Enviar Pedido',
          desc: 'Item adicionado e carrinho atualizado! Agora clique em "Fechar / Enviar Pedido" para encaminhar a lista ao Concierge.'
        },
        '5': {
          title: '5/7 • Abrir Pedido no Painel Concierge',
          desc: 'De volta ao /admin, o pedido #1 da Chef Camila chegou na fila "Em Aprovação". Clique em "Abrir Pedido #1" para gerenciar.'
        },
        '6': {
          title: '6/7 • Gerenciar Notas das Compras',
          desc: 'Confira os itens recebidos, defina quem pagou e clique em "Anexar NF-e / Comprovante Demo & Registrar" para simular o upload no bucket privado.'
        },
        '7': {
          title: '7/7 • Fechar / Finalizar Pedido',
          desc: 'Com a nota lançada e os totais conciliados, clique em "Fechar / Finalizar Pedido" para concluir o ciclo e liberar a planilha .xlsx.'
        },
        '7done': {
          title: 'Ciclo Completo Concluído!',
          desc: 'Pedido finalizado, trilha de auditoria gravada e planilha ExcelJS pronta. Você pode reiniciar o tour ou explorar livremente todas as abas.'
        }
      }
    },
    en: {
      // Page Case Study Copy
      gc_eyebrow: 'Case Study + Sandbox • 2026',
      gc_hero_title: 'Purchasing Management System',
      gc_hero_lead:
        'Tailor-made operational platform for a luxury real estate agency with Concierge service: connects the admin team (/admin) with the house cook via a zero-login link (/e/:codigo), unifying orders, supplier WhatsApp lists, invoices, and .xlsx reporting.',
      gc_meta_client_val: 'Real Estate Concierge • Southern Bahia',
      gc_meta_services_val: 'Design & Full-Stack Engineering',
      gc_sb_badge: 'Interactive Demo • Mock Data',
      gc_sb_heading: 'Test the full Owner + Cook workflow in 7 guided steps',
      gc_sb_sub:
        'Follow the interactive coachmark balloons from Concierge login through cook ordering, invoice upload, and final .xlsx settlement.',
      gc_overview_label: '01 • Overview & Challenge',
      gc_overview_title: 'Connecting real estate Concierge teams to the house kitchen seamlessly',
      gc_overview_p1:
        'In high-end vacation rental operations with Concierge service in Southern Bahia (Trancoso region), every stay requires coordinating grocery lists across guests, the house cook, and six local supplier categories (seafood, butcher, produce, deli, beverages, and market).',
      gc_overview_p2:
        'The legacy workflow relied on voice notes and fragmented chat messages, causing missed quantities, untracked receipts, and hours spent reconciling spreadsheets manually. The platform solved this by pairing two experiences on a single database: the full operations dashboard (/admin) and a passwordless mobile-first menu (/e/:codigo) for the cook.',
      gc_pill_1: '172 Items / 6 Suppliers',
      gc_pill_2: '5 Proportional Kits',
      gc_pill_3: 'No-Login Link (/e/:codigo)',
      gc_pill_4: 'Private Receipt Storage',
      gc_arch_label: '02 • Technical Architecture & Security',
      gc_arch_title: 'React 19, Supabase with RLS, and ExcelJS financial settlement',
      gc_arch_intro:
        'Engineered for zero friction on the cook’s phone and strict financial governance for the Concierge team, backed by PostgreSQL Row Level Security.',
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
      btn_free_explore: 'Free Explore',
      btn_resume_tour: 'Resume Guide',
      rail_steps: [
        '1. Login',
        '2. Create Stay',
        '3. Menu Link',
        '4. Cook Order',
        '5. Open Order',
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
      toast_stay_saved: 'Stay created! Route /e/MIR-204 is ready for the cook.',
      toast_link_copied: 'Link /e/MIR-204 copied to clipboard!',
      toast_wa_invite: 'WhatsApp invite text generated for Chef Camila (/e/MIR-204).',

      // Step 4: Cook Menu
      menu_welcome: 'No-login access active for',
      menu_catalog_meta: '172 items in full catalog • Interactive sample by supplier',
      kits_label: 'Ready Kits (scaled for',
      kit_applied_tag: 'applied',
      btn_similar_yes: 'Accept substitute: Yes',
      btn_similar_no: 'Accept substitute: No',
      summary_selected: 'selected in cart',
      summary_est: 'Est. base:',
      btn_send_order: 'Close / Send Order',
      toast_kit_added: 'Kit scaled for 8 guests & 4 days added to cart!',
      toast_order_sent: 'Order #1 registered! Routed to Concierge approval queue.',

      // Step 5, 6, 7: Orders & Detail
      orders_queue_title: 'House Orders Queue',
      status_pending: '⏳ Pending Approval',
      status_suppliers: '📲 Send to Suppliers',
      status_prep: '🚚 Prep & Delivery',
      status_finalized: '✅ Finalized',
      btn_open_order: 'Open Order #1',
      btn_back_list: '← Back to queue',
      phase_1: '1. Approval',
      phase_2: '2. Suppliers',
      phase_3: '3. Prep & Invoices',
      phase_4: '4. Finalized',
      dtab_items: 'Purchase Order',
      dtab_notes: 'Receipts & Invoices',
      dtab_audit: 'Stay & Audit Trail',
      btn_whatsapp_preview: 'WhatsApp Preview',
      btn_approve_send: 'Approve & Dispatch',
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
      nfe_mock_badge: 'Invoice Attached (Private Bucket)',
      nfe_mock_key: 'Mock DANFE • 60s Signed URL',
      btn_close_order: 'Close / Finalize Order',
      xlsx_ready_title: 'Consolidated ExcelJS (.xlsx) Sheet Ready',
      xlsx_ready_sub: 'General summary tab + color-coded supplier tabs ready for settlement.',
      btn_download_xlsx: 'Download Demo Summary (.csv)',
      audit_title: 'Audit Trail (America/Bahia)',
      toast_nfe_added: 'Mock invoice attached and financial cards updated!',
      toast_order_closed: 'Order #1 finalized! Consolidated .xlsx sheet unlocked.',

      // Coachmark UI
      cm_step_of: 'Step {n} of 7',
      cm_done_badge: 'Completed • 7 of 7',
      cm_prev: 'Previous',
      cm_next: 'Next (Auto)',
      cm_free: 'Free explore',
      cm_restart: 'Restart Tour',
      cm_steps: {
        '1': {
          title: '1/7 • Concierge Login (/admin)',
          desc: 'The operations team signs into the admin panel using pre-configured profiles. Click "Enter Dashboard" to begin.'
        },
        '2': {
          title: '2/7 • Create a Stay',
          desc: 'Review or edit the demo stay (Casa Mirante), dates, and guests. Click "Save Stay" to generate the unique cook link.'
        },
        '3': {
          title: '3/7 • Passwordless Cook Link',
          desc: 'The system generates /e/MIR-204 for WhatsApp. The cook opens it on mobile with zero login! Click "Open Menu (Cook Link)".'
        },
        '4a': {
          title: '4/7 • Add Items in the Menu',
          desc: 'You are now in the cook’s view (/e/MIR-204). Browse suppliers or Ready Kits and click "+" to add at least 1 item.'
        },
        '4b': {
          title: '4/7 • Close / Send Order',
          desc: 'Item added and cart updated! Now click "Close / Send Order" to submit the list to the Concierge.'
        },
        '5': {
          title: '5/7 • Open Order in Admin Queue',
          desc: 'Back in /admin, Chef Camila’s order #1 is waiting in "Pending Approval". Click "Open Order #1" to inspect suppliers and receipts.'
        },
        '6': {
          title: '6/7 • Manage Purchase Invoices',
          desc: 'Check received items, select who paid, and click "Attach Mock Receipt / Invoice & Save" to simulate private bucket upload.'
        },
        '7': {
          title: '7/7 • Close / Finalize Order',
          desc: 'With the invoice logged and balances updated, click "Close / Finalize Order" to complete the cycle and unlock the .xlsx sheet.'
        },
        '7done': {
          title: 'Full Cycle Completed!',
          desc: 'Order finalized, audit trail recorded, and ExcelJS report ready. Restart the tour anytime or explore freely.'
        }
      }
    }
  };

  /* ------------------------------------------------------------------------
     Catalog Data (Sanitized Sample of the 6 Real Suppliers + 5 Kits)
     ------------------------------------------------------------------------ */
  var SUPPLIERS = [
    { id: 'peixaria', pt: 'Peixaria', en: 'Seafood', color: '#0284c7', count: 9 },
    { id: 'acougue', pt: 'Açougue', en: 'Butcher', color: '#b91c1c', count: 20 },
    { id: 'frios-laticinios', pt: 'Frios & Laticínios', en: 'Deli & Dairy', color: '#f59e0b', count: 19 },
    { id: 'hortifruti', pt: 'Hortifruti', en: 'Produce', color: '#059669', count: 40 },
    { id: 'bebidas', pt: 'Bebidas', en: 'Beverages', color: '#7c3aed', count: 21 },
    { id: 'mercado', pt: 'Mercado', en: 'Market', color: '#d97706', count: 63 }
  ];

  var CATALOG = [
    { id: 'px-1', sup: 'peixaria', pt: 'Camarão Rosa VG Limpo', en: 'Cleaned Pink Shrimp VG', unit: 'kg', price: 128.0 },
    { id: 'px-2', sup: 'peixaria', pt: 'Peixe Branco em Postas', en: 'White Fish Steaks', unit: 'kg', price: 78.0 },
    { id: 'px-3', sup: 'peixaria', pt: 'Filé de Salmão Fresco', en: 'Fresh Salmon Fillet', unit: 'kg', price: 112.0 },
    { id: 'px-4', sup: 'peixaria', pt: 'Filé de Tilápia / Saint Peter', en: 'Tilapia / Saint Peter Fillet', unit: 'kg', price: 64.0 },

    { id: 'ac-1', sup: 'acougue', pt: 'Picanha Bovina Especial', en: 'Prime Beef Picanha', unit: 'kg', price: 96.0 },
    { id: 'ac-2', sup: 'acougue', pt: 'Filé-Mignon Limpo Inteiro', en: 'Whole Trimmed Tenderloin', unit: 'kg', price: 108.0 },
    { id: 'ac-3', sup: 'acougue', pt: 'Costela Bovina para Assar', en: 'Roasting Beef Ribs', unit: 'kg', price: 48.0 },
    { id: 'ac-4', sup: 'acougue', pt: 'Fraldinha para Churrasco', en: 'BBQ Flank Steak', unit: 'kg', price: 58.0 },

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

    { id: 'mc-1', sup: 'mercado', pt: 'Carvão Vegetal Graúdo 4kg', en: 'Lump Charcoal 4kg', unit: 'pct', price: 32.0 },
    { id: 'mc-2', sup: 'mercado', pt: 'Ovos Frescos Grandes (30 un)', en: 'Fresh Large Eggs (Tray 30)', unit: 'bdj', price: 28.0 },
    { id: 'mc-3', sup: 'mercado', pt: 'Arroz Branco Tipo 1', en: 'White Rice Type 1', unit: 'kg', price: 8.9 },
    { id: 'mc-4', sup: 'mercado', pt: 'Sorvete de Creme Nobre', en: 'Artisanal Vanilla Ice Cream', unit: 'un', price: 42.0 }
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
     ------------------------------------------------------------------------ */
  var state = null;

  function createInitialState() {
    return {
      tourActive: true,
      tourStep: '1', // '1' | '2' | '3' | '4a' | '4b' | '5' | '6' | '7' | '7done'
      screen: 'login', // 'login' | 'admin' | 'menu'
      adminTab: 'stays', // 'stays' | 'orders'
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
      activeSupplier: 'peixaria',
      appliedKits: {},
      cart: {}, // { itemId: { qty, similar } }
      orders: [],
      selectedOrderId: null,
      orderDetailTab: 'items', // 'items' | 'notes' | 'audit'
      showWhatsappPreview: false,
      nfeDraft: {
        supplier: 'peixaria',
        amount: '320.00',
        date: '2026-12-18',
        payer: 'guest'
      },
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
    }, 2200);
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
     Business Actions (Driven by Both Real Clicks & "Next Auto")
     ------------------------------------------------------------------------ */
  function doLogin() {
    var prof = PROFILES.find(function (p) {
      return p.id === state.selectedProfile;
    }) || PROFILES[0];
    state.loggedInUser = prof.name;
    state.screen = 'admin';
    state.adminTab = 'stays';
    state.showNewStayForm = true;
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
    if (state.tourActive && (state.tourStep === '1' || state.tourStep === '2')) {
      state.tourStep = '3';
    }
    showToast(t('toast_stay_saved'));
    scrollTargetLater('step-3-open-menu-btn');
  }

  function doOpenMenu(code) {
    state.activeStayCode = code || 'MIR-204';
    state.screen = 'menu';
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
    if (state.tourActive) {
      if (state.tourStep === '4a' && stats.count >= 1) {
        state.tourStep = '4b';
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
      // Auto-add first item if triggered via Auto/Next
      state.cart['px-1'] = { qty: 2, similar: true };
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

    var firstSup = orderItems.length ? orderItems[0].sup : 'peixaria';
    var orderObj = {
      id: 'ord-1',
      number: 1,
      stayCode: state.activeStayCode || 'MIR-204',
      house: state.stayDraft.house || 'Casa Mirante — Trancoso',
      cook: 'Chef Camila',
      status: 'pending', // 'pending' | 'suppliers' | 'prep' | 'finalized'
      createdAt: '21:14',
      items: orderItems,
      totalEstimate: stats.total,
      notes: [],
      audit: [
        { time: '21:14 BRT', pt: 'Pedido #1 criado por Chef Camila via /e/MIR-204', en: 'Order #1 created by Chef Camila via /e/MIR-204' }
      ]
    };

    state.orders = [orderObj];
    state.selectedOrderId = null;
    state.nfeDraft.supplier = firstSup;
    state.nfeDraft.amount = stats.total.toFixed(2);
    state.screen = 'admin';
    state.adminTab = 'orders';

    if (state.tourActive) {
      state.tourStep = '5';
    }
    showToast(t('toast_order_sent'));
    scrollTargetLater('step-5-open-order-btn');
  }

  function doOpenOrder(orderId) {
    state.selectedOrderId = orderId || (state.orders[0] && state.orders[0].id);
    var ord = getCurrentOrder();
    if (!ord) return;
    if (ord.status === 'pending') {
      ord.status = 'prep';
      ord.audit.push({
        time: '21:16 BRT',
        pt: 'Pedido aprovado e enviado aos fornecedores por ' + state.loggedInUser,
        en: 'Order approved & dispatched to suppliers by ' + state.loggedInUser
      });
    }
    state.orderDetailTab = 'notes';
    if (state.tourActive && (state.tourStep === '5' || state.tourStep === '4b')) {
      state.tourStep = '6';
    }
    renderAndScroll('step-6-attach-nfe-btn');
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
      pt: 'NF-e anexada (' + supObj.pt + ' • ' + formatBRL(amt) + ') no bucket privado',
      en: 'Mock invoice attached (' + supObj.en + ' • ' + formatBRL(amt) + ') in private bucket'
    });

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
      pt: 'Pedido #1 finalizado por ' + state.loggedInUser + ' • Planilha ExcelJS gerada',
      en: 'Order #1 finalized by ' + state.loggedInUser + ' • ExcelJS workbook generated'
    });

    if (state.tourActive) {
      state.tourStep = '7done';
    }
    showToast(t('toast_order_closed'));
    scrollTargetLater('step-7done-xlsx-card');
  }

  function jumpToTourStep(targetStep) {
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
        state.cart['px-1'] = { qty: 2, similar: true };
      }
      state.screen = 'menu';
      state.tourStep = '4b';
      renderAndScroll('step-4b-send-order-btn');
      return;
    }
    if (targetStep === '5') {
      if (state.orders.length === 0) doSendOrder();
      state.screen = 'admin';
      state.adminTab = 'orders';
      state.selectedOrderId = null;
      state.tourStep = '5';
      renderAndScroll('step-5-open-order-btn');
      return;
    }
    if (targetStep === '6') {
      if (state.orders.length === 0) doSendOrder();
      state.screen = 'admin';
      state.adminTab = 'orders';
      state.selectedOrderId = state.orders[0].id;
      state.orderDetailTab = 'notes';
      state.tourStep = '6';
      renderAndScroll('step-6-attach-nfe-btn');
      return;
    }
    if (targetStep === '7') {
      if (state.orders.length === 0) doSendOrder();
      var ord = state.orders[0];
      state.screen = 'admin';
      state.adminTab = 'orders';
      state.selectedOrderId = ord.id;
      state.orderDetailTab = 'notes';
      if (ord.notes.length === 0) {
        ord.notes.push({
          id: 'nfe-1',
          nfeNum: 'NF-e 004.812',
          supplierId: 'peixaria',
          supplierPt: 'Peixaria',
          supplierEn: 'Seafood',
          amount: ord.totalEstimate || 256,
          date: '2026-12-18',
          payer: 'guest'
        });
      }
      if (ord.status === 'finalized') ord.status = 'prep';
      state.tourStep = '7';
      renderAndScroll('step-7-close-order-btn');
    }
  }

  function handleTourNextAuto() {
    switch (state.tourStep) {
      case '1': doLogin(); break;
      case '2': doSaveStay(); break;
      case '3': doOpenMenu('MIR-204'); break;
      case '4a': doChangeQty('px-1', 2); break;
      case '4b': doSendOrder(); break;
      case '5': doOpenOrder(state.orders[0] && state.orders[0].id); break;
      case '6': doAttachMockNfe(); break;
      case '7': doCloseOrder(); break;
      default: break;
    }
  }

  function handleTourPrev() {
    var order = ['1', '2', '3', '4a', '4b', '5', '6', '7', '7done'];
    var idx = order.indexOf(state.tourStep);
    if (idx <= 0) return;
    var prev = order[idx - 1];
    jumpToTourStep(prev);
  }

  function restartTour() {
    state = createInitialState();
    renderAndScroll('step-1-login-btn');
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
    if (stepId === '7done') return 7;
    return parseInt(stepId, 10) || 1;
  }

  function renderChrome() {
    var isCook = state.screen === 'menu';
    var urlText = isCook ? 'concierge.demo/e/' + esc(state.activeStayCode) : 'concierge.demo/admin';
    var roleClass = isCook ? 'is-cook' : 'is-admin';
    var roleText = isCook ? t('role_cook') : t('role_admin');
    var curNum = getStepNumber(state.tourStep);
    var railLabels = I18N[lang].rail_steps;

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
        '  <div class="sb-stay-top">' +
        '    <h4 class="sb-card-title">' + esc(t('new_stay_title')) + '</h4>' +
        '    <span class="sb-badge sb-badge-amber">POST /rest/v1/estadias</span>' +
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

    var itemsHtml = filteredItems
      .map(function (it, idx) {
        var entry = state.cart[it.id];
        var qty = entry ? entry.qty : 0;
        var sim = entry ? entry.similar : true;
        var isFirstPlus = idx === 0;
        var plusAttr = isFirstPlus ? ' data-tour-target="step-4a-add-item-btn"' : '';
        return (
          '<div class="sb-item-card ' + (qty > 0 ? 'is-in-cart' : '') + '">' +
          '  <div class="sb-item-head">' +
          '    <div>' +
          '      <h4 class="sb-item-name">' + esc(lang === 'en' ? it.en : it.pt) + '</h4>' +
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

    return (
      '<div class="sb-app-screen">' +
      '  <div class="sb-app-header">' +
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
      '  <div class="sb-app-body">' +
      '    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;">' +
      '      <span style="font-size:0.76rem;font-weight:700;color:#57534e;">⚡ ' + esc(t('kits_label')) + ' ' + esc(state.stayDraft.guests) + ' ' + esc(t('guests_word')) + '):</span>' +
      '      <span style="font-size:0.73rem;color:#78716c;">' + esc(t('menu_catalog_meta')) + '</span>' +
      '    </div>' +
      '    <div class="sb-kits-row">' + kitsHtml + '</div>' +
      '    <div class="sb-supplier-tabs">' + supTabs + '</div>' +
      '    <div class="sb-items-grid">' + itemsHtml + '</div>' +
      '    <div class="sb-bottom-summary">' +
      '      <div class="sb-summary-stats">' +
      '        <strong class="sb-tabular">' + stats.count + ' ' + esc(t('items_word')) + ' ' + esc(t('summary_selected')) + '</strong>' +
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

  function renderAdminOrders() {
    var ord = getCurrentOrder();
    if (!ord) {
      if (state.orders.length === 0) {
        return (
          '<div class="sb-card">' +
          '  <p style="margin:0;color:#57534e;font-size:0.9rem;">Nenhum pedido enviado ainda. Abra o cardápio da estadia para criar o Pedido #1.</p>' +
          '</div>'
        );
      }
      var listHtml = state.orders
        .map(function (o) {
          var badgeCls = o.status === 'finalized' ? 'sb-badge-emerald' : 'sb-badge-amber';
          var statusLbl = o.status === 'finalized' ? t('status_finalized') : t('status_pending');
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
            '        <span class="sb-tabular">📦 ' + o.items.length + ' ' + esc(t('items_word')) + '</span>' +
            '        <span class="sb-tabular">💰 ' + formatBRL(o.totalEstimate) + '</span>' +
            '      </div>' +
            '    </div>' +
            '    <button type="button" class="sb-btn sb-btn-amber" data-action="open-order" data-order="' + esc(o.id) + '" data-tour-target="step-5-open-order-btn">' +
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
      { lbl: t('phase_2'), state: 'is-done' },
      { lbl: t('phase_3'), state: isFinalized ? 'is-done' : 'is-active' },
      { lbl: t('phase_4'), state: isFinalized ? 'is-done' : '' }
    ];
    var stepperHtml = phases
      .map(function (ph) {
        return '<div class="sb-phase-box ' + ph.state + '">' + (ph.state === 'is-done' ? '✓ ' : '● ') + esc(ph.lbl) + '</div>';
      })
      .join('');

    var whatsappText = '';
    if (state.showWhatsappPreview) {
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
      whatsappText = '<div class="sb-whatsapp-box">' + esc(lines.join('\n')) + '</div>';
    }

    var tabContent = '';
    if (state.orderDetailTab === 'items') {
      var rowsHtml = ord.items
        .map(function (it) {
          var sup = getSupplierObj(it.sup);
          return (
            '<tr>' +
            '  <td><span class="sb-badge" style="background:' + sup.color + ';color:' + (sup.id === 'frios-laticinios' ? '#1c1917' : '#fff') + ';">' + esc(lang === 'en' ? sup.en : sup.pt) + '</span></td>' +
            '  <td><strong>' + esc(lang === 'en' ? it.en : it.pt) + '</strong></td>' +
            '  <td class="sb-tabular">' + it.qty + ' ' + esc(it.unit) + '</td>' +
            '  <td class="sb-tabular">' + formatBRL(it.qty * it.price) + '</td>' +
            '</tr>'
          );
        })
        .join('');
      tabContent =
        '<div class="sb-xlsx-table-wrap">' +
        '  <table class="sb-xlsx-table">' +
        '    <thead><tr><th>' + esc(t('field_supplier')) + '</th><th>Item</th><th>Qtd</th><th>Est.</th></tr></thead>' +
        '    <tbody>' + rowsHtml + '</tbody>' +
        '  </table>' +
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
            '    <span style="font-size:0.74rem;color:#6b21a8;">' + esc(t('nfe_mock_key')) + ' • ' + esc(n.date) + '</span>' +
            '  </div>' +
            '  <div style="text-align:right;">' +
            '    <strong class="sb-tabular" style="font-size:0.95rem;color:#1c1917;display:block;">' + formatBRL(n.amount) + '</strong>' +
            '    <span style="font-size:0.72rem;color:#57534e;">' + esc(n.payer === 'guest' ? t('payer_guest') : t('payer_concierge')) + '</span>' +
            '  </div>' +
            '</div>'
          );
        })
        .join('');

      var xlsxHtml = isFinalized
        ? '<div class="sb-xlsx-preview" data-tour-target="step-7done-xlsx-card">' +
          '  <div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;">' +
          '    <div>' +
          '      <strong style="font-size:0.92rem;color:#065f46;display:block;">📊 ' + esc(t('xlsx_ready_title')) + '</strong>' +
          '      <span style="font-size:0.78rem;color:#047857;">' + esc(t('xlsx_ready_sub')) + '</span>' +
          '    </div>' +
          '    <button type="button" class="sb-btn sb-btn-emerald sb-btn-sm" data-action="download-csv">⬇ ' + esc(t('btn_download_xlsx')) + '</button>' +
          '  </div>' +
          '  <div class="sb-xlsx-tabs">' +
          '    <span class="sb-xlsx-sheet-pill" style="background:#1c1917;">Geral</span>' +
          SUPPLIERS.map(function (s) {
            var tc = s.id === 'frios-laticinios' ? '#1c1917' : '#ffffff';
            return '<span class="sb-xlsx-sheet-pill" style="background:' + s.color + ';color:' + tc + ';">' + esc(lang === 'en' ? s.en : s.pt) + '</span>';
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
      '      <button type="button" class="sb-btn sb-btn-outline sb-btn-sm" data-action="toggle-wa-preview">📲 ' + esc(t('btn_whatsapp_preview')) + '</button>' +
      '      ' + closeOrderBtn +
      '    </div>' +
      '  </div>' +
      '  <div class="sb-stepper-4" style="margin-bottom:0.85rem;">' + stepperHtml + '</div>' +
      whatsappText +
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

  function renderCoachmark() {
    if (!state.tourActive) {
      return '<div class="sb-coachmark is-hidden" id="sb-coachmark"></div>';
    }
    var stepData = (I18N[lang] && I18N[lang].cm_steps[state.tourStep]) || I18N.pt.cm_steps['1'];
    var stepNum = getStepNumber(state.tourStep);
    var pct = Math.round((stepNum / 7) * 100);
    var isDone = state.tourStep === '7done';
    var badgeText = isDone ? t('cm_done_badge') : t('cm_step_of').replace('{n}', String(stepNum));
    var prevDisabled = state.tourStep === '1' ? ' disabled' : '';

    var actionButtons = isDone
      ? '<button type="button" class="sb-cm-btn" data-action="toggle-tour">' + esc(t('btn_free_explore')) + '</button>' +
        '<button type="button" class="sb-cm-btn sb-cm-btn-primary" data-action="restart-tour">↺ ' + esc(t('cm_restart')) + '</button>'
      : '<button type="button" class="sb-cm-btn" data-action="tour-prev"' + prevDisabled + '>' + esc(t('cm_prev')) + '</button>' +
        '<button type="button" class="sb-cm-btn" data-action="toggle-tour">' + esc(t('cm_free')) + '</button>' +
        '<button type="button" class="sb-cm-btn sb-cm-btn-primary" data-action="tour-next">' + esc(t('cm_next')) + ' →</button>';

    return (
      '<aside class="sb-coachmark" id="sb-coachmark" role="dialog" aria-live="polite" data-placement="bottom">' +
      '  <div class="sb-coachmark-arrow" aria-hidden="true"></div>' +
      '  <div class="sb-cm-top">' +
      '    <span class="sb-cm-step-label">' + esc(badgeText) + '</span>' +
      '  </div>' +
      '  <div class="sb-cm-progress-track"><div class="sb-cm-progress-fill" style="width:' + pct + '%;"></div></div>' +
      '  <h4 class="sb-cm-title">' + esc(stepData.title) + '</h4>' +
      '  <p class="sb-cm-desc">' + esc(stepData.desc) + '</p>' +
      '  <div class="sb-cm-actions">' +
      '    <div class="sb-cm-btn-group">' + actionButtons + '</div>' +
      '  </div>' +
      '</aside>'
    );
  }

  /* ------------------------------------------------------------------------
     Coachmark Positioning & Target Spotlight Engine
     Guarantees balloon never overflows viewport & never covers target button
     ------------------------------------------------------------------------ */
  function getActiveTargetSelector() {
    switch (state.tourStep) {
      case '1': return '[data-tour-target="step-1-login-btn"]';
      case '2': return '[data-tour-target="step-2-save-stay-btn"]';
      case '3': return '[data-tour-target="step-3-open-menu-btn"]';
      case '4a': return '[data-tour-target="step-4a-add-item-btn"]';
      case '4b': return '[data-tour-target="step-4b-send-order-btn"]';
      case '5': return '[data-tour-target="step-5-open-order-btn"]';
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
    if (!rootEl || !state || !state.tourActive) return;
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
      cm.style.top = '16px';
      cm.style.left = '16px';
      return;
    }

    target.classList.add('sb-tour-highlight');

    var stageRect = stage.getBoundingClientRect();
    var tRect = target.getBoundingClientRect();
    var cmRect = cm.getBoundingClientRect();
    var cw = cmRect.width || 330;
    var ch = cmRect.height || 175;
    var vw = window.innerWidth || document.documentElement.clientWidth || 1280;
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    var margin = 10;
    var gap = 14;

    var tLeft = tRect.left - stageRect.left;
    var tTop = tRect.top - stageRect.top;
    var tRight = tLeft + tRect.width;
    var tBottom = tTop + tRect.height;
    var tCenterX = tLeft + tRect.width / 2;
    var tCenterY = tTop + tRect.height / 2;

    var waBtn = document.getElementById('floating-whatsapp-btn');
    var waRect = waBtn ? waBtn.getBoundingClientRect() : null;

    var vpMinLeft = Math.max(8, margin - stageRect.left);
    var vpMaxLeft = Math.min(stageRect.width - cw - 8, vw - margin - cw - stageRect.left);
    if (vpMaxLeft < vpMinLeft) {
      vpMinLeft = margin - stageRect.left;
      vpMaxLeft = vw - margin - cw - stageRect.left;
    }
    var vpMinTop = margin - stageRect.top;
    var vpMaxTop = vh - margin - ch - stageRect.top;

    function clamp(val, min, max) {
      if (max < min) return min;
      return Math.max(min, Math.min(max, val));
    }

    var isMobile = vw <= 640;
    var order = isMobile ? ['top', 'bottom'] : ['top', 'bottom', 'left', 'right'];
    var candidates = [];

    order.forEach(function (dir) {
      var candLeft, candTop;
      if (dir === 'bottom') {
        candTop = tBottom + gap;
        candLeft = clamp(tCenterX - cw / 2, vpMinLeft, vpMaxLeft);
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
      var overlapsWa = waRect ? rectsOverlap(absBox, waRect, 4) : false;

      candidates.push({
        dir: dir,
        left: candLeft,
        top: candTop,
        absBox: absBox,
        inVp: inVp,
        inStage: inStage,
        overlapsTarget: overlapsTarget,
        overlapsWa: overlapsWa,
        score: (inVp ? 100 : 0) + (inStage ? 40 : 0) + (!overlapsTarget ? 60 : 0) + (!overlapsWa ? 10 : 0)
      });
    });

    candidates.sort(function (a, b) {
      return b.score - a.score;
    });

    var best = candidates[0];
    var finalLeft = best.left;
    var finalTop = best.top;
    var finalDir = best.dir;

    // Fallback: if best is still outside viewport vertically without overlapping target,
    // pick the vertical side with more viewport space and clamp without overlapping target.
    if (!best.inVp) {
      var spaceAbove = tRect.top - margin;
      var spaceBelow = vh - margin - tRect.bottom;
      if (spaceAbove >= spaceBelow) {
        finalDir = 'top';
        finalTop = clamp(tTop - ch - gap, vpMinTop, tTop - ch - 8);
      } else {
        finalDir = 'bottom';
        finalTop = clamp(tBottom + gap, tBottom + 8, Math.max(tBottom + 8, vpMaxTop));
      }
      finalLeft = clamp(tCenterX - cw / 2, vpMinLeft, vpMaxLeft);
    }

    cm.setAttribute('data-placement', finalDir);
    cm.style.left = Math.round(finalLeft) + 'px';
    cm.style.top = Math.round(finalTop) + 'px';

    if (finalDir === 'top' || finalDir === 'bottom') {
      var arrowX = clamp(tCenterX - finalLeft, 20, cw - 20);
      cm.style.setProperty('--arrow-left', Math.round(arrowX) + 'px');
    } else {
      var arrowY = clamp(tCenterY - finalTop, 20, ch - 20);
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

  function scrollTargetComfortably(targetAttr) {
    if (!rootEl || !targetAttr) return;
    var target = rootEl.querySelector('[data-tour-target="' + targetAttr + '"]');
    if (!target) return;
    var rect = target.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    if (rect.top < 90 || rect.bottom > vh - 160) {
      var isLocoSmooth =
        document.documentElement.classList.contains('has-scroll-smooth') &&
        typeof scroll !== 'undefined' &&
        scroll &&
        typeof scroll.scrollTo === 'function';
      if (isLocoSmooth) {
        try {
          if (typeof scroll.start === 'function') scroll.start();
          scroll.scrollTo(target, { offset: -Math.round(vh * 0.4), duration: 200, disableLerp: true });
        } catch (e) {}
      } else if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    }
  }

  function scrollTargetLater(targetAttr) {
    render();
    setTimeout(function () {
      scrollTargetComfortably(targetAttr);
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

    rootEl.innerHTML =
      '<div class="sb-shell">' +
      renderChrome() +
      '  <div class="sb-stage">' +
      toastHtml +
      screenHtml +
      renderCoachmark() +
      '  </div>' +
      '</div>';

    requestAnimationFrame(function () {
      positionCoachmark();
      syncLocomotiveHeight();
    });
  }

  function bindSandboxEvents() {
    if (!rootEl || rootEl._sbBound) return;
    rootEl._sbBound = true;

    rootEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');

      switch (action) {
        case 'toggle-tour':
          state.tourActive = !state.tourActive;
          render();
          break;
        case 'restart-tour':
          restartTour();
          break;
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
          if (state.tourActive) state.tourStep = '1';
          render();
          break;
        case 'admin-tab':
          state.adminTab = btn.getAttribute('data-tab');
          if (state.adminTab === 'orders' && state.orders.length > 0 && state.tourActive && state.tourStep === '3') {
            state.tourStep = '5';
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
        default:
          break;
      }
    });

    rootEl.addEventListener('submit', function (e) {
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
