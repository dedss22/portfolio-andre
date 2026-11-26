/* Sandbox do portfolio: simulacao 100% no navegador da API do painel Cassiano Imoveis.
   - Nada sai daqui: fetch e XMLHttpRequest para /api/admin/* sao respondidos por um banco em memoria guardado no localStorage
     deste navegador. Nao existe servidor, chave, banco ou URL do sistema real neste arquivo.
   - Todos os dados sao ficticios (estilo dos dados DEMO de demonstracao do projeto).
   - As regras (validacao do imovel, da reserva, preco por epoca, estadia minima, agenda e planilha) vem das copias das libs
     puras do servidor em ./lib, carregadas sob demanda. */
(function () {
  'use strict';
  var CHAVE = 'cassiano-sandbox:v1';
  var script = document.currentScript;
  var RAIZ = new URL('./', script ? script.src : location.href).href;   // .../sandbox/cassiano/
  var USUARIO = { nome: 'Cassiano (demonstração)', email: 'dono@exemplo.test', papel: 'admin' };
  var ESPERA_PUBLICAR = 15;   // no sistema real: 60 s entre publicacoes
  var POR_PAGINA = 20, MAX_FOTOS = 20;

  // ------------------------------------------------------------------ utilidades
  var pad = function (n) { return String(n).padStart(2, '0'); };
  function hojeIso() { return new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10); }
  function addDias(s, n) { return new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10) + n)).toISOString().slice(0, 10); }
  function noites(a, b) { return Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000); }
  /** "AAAA-MM-DD HH:MM:SS" em UTC (formato que o painel espera em updated_at). */
  function agoraSql(ms) { return new Date(ms == null ? Date.now() : ms).toISOString().slice(0, 19).replace('T', ' '); }
  /** Data e hora no horario da Bahia (UTC-3): "28/11/2026 às 14:05". */
  function dataHora(v) {
    var t = Date.parse(String(v).indexOf('T') > 0 || /Z$/.test(String(v)) ? v : String(v).replace(' ', 'T') + 'Z');
    if (isNaN(t)) return '';
    var s = new Date(t - 3 * 3600000).toISOString();
    return s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) + ' às ' + s.slice(11, 16);
  }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function resolverFoto(chave) { return /^data:|^https?:/.test(chave) ? chave : new URL(chave, RAIZ).href; }

  // ------------------------------------------------------------------ libs puras (copiadas do servidor)
  var libsPromessa = null;
  function libs() {
    if (!libsPromessa) {
      var m = function (n) { return import(new URL('lib/' + n + '.js', RAIZ).href); };
      libsPromessa = Promise.all([m('imoveis'), m('reservas'), m('agenda'), m('agenda-xlsx'), m('xlsx'), m('csv')]).then(function (x) {
        return { imoveis: x[0], reservas: x[1], agenda: x[2], agendaXlsx: x[3], xlsx: x[4], csv: x[5] };
      });
    }
    return libsPromessa;
  }

  // ------------------------------------------------------------------ dados de demonstracao (100% ficticios)
  var DESC = function (t) { return t.split('\n\n').map(function (p) { return '<p class="cassiano-desc-text">' + p + '</p>'; }).join(''); };
  function semente() {
    var h = hojeIso(), agora = Date.now(), antes = function (dias) { return agoraSql(agora - dias * 86400000); };
    var base = { titulo_card: null, badge_destaque: null, estilos_json: '[]', uf: 'BA', preco_sob_consulta: 0, preco_centavos: null, preco_label: null, preco_secundario_centavos: null,
      preco_secundario_label: null, condominio_texto: null, iptu_texto: null, caucao_texto: null, diaria_centavos: null, minimo_noites: 1, capacidade_hospedes: null, checkin_hora: null,
      checkout_hora: null, taxa_limpeza_centavos: null, area_privativa_m2: null, area_total_m2: null, quartos: null, suites: null, banheiros: null, vagas: null, vagas_texto: null,
      especificacoes_json: '[]', diferenciais_json: '[]', resumo_card: null, descricao_html: null, seo_title: null, seo_description: null, seo_keywords: null, destaque: 0, noindex: 1,
      deleted_at: null, published_at: null };
    function im(o) { var x = Object.assign({}, base, o); x.created_at = x.created_at || x.updated_at; return x; }
    var imoveis = [
      im({ id: 1, codigo: 'DEMO-1', slug: 'demo-casa-exemplo-venda', tipo_negocio: 'venda', status: 'publicado', titulo: 'Casa de exemplo com piscina em condomínio', titulo_card: 'Casa de exemplo com piscina',
        badge_destaque: 'Exemplo', destino_slug: 'arraial', tipo_imovel: 'casa', estilos_json: '["condominio"]', bairro: 'Bairro Fictício', cidade: 'Cidade Exemplo',
        preco_centavos: 100000000, preco_label: 'Valor de venda (fictício)', quartos: 3, suites: 1, banheiros: 2, vagas: 2, area_privativa_m2: 150, area_total_m2: 420, destaque: 1,
        especificacoes_json: JSON.stringify([{ icone: 'fa-arrows-alt', titulo: 'Área privativa', valor: '150 m²' }, { icone: 'fa-bed', titulo: 'Quartos', valor: '3 quartos, 1 suíte' }, { icone: 'fa-car', titulo: 'Vagas', valor: '2 vagas' }, { icone: 'fa-tint', titulo: 'Lazer', valor: 'Piscina privativa' }]),
        diferenciais_json: JSON.stringify(['Piscina com deck', 'Varanda gourmet', 'Condomínio com portaria']),
        resumo_card: 'Imóvel fictício de demonstração: casa térrea com piscina e varanda gourmet.',
        descricao_html: DESC('Imóvel fictício, criado só para demonstrar o painel. Não existe.\n\nCasa térrea com sala integrada, varanda gourmet e piscina, num condomínio de exemplo.'),
        updated_at: antes(3), published_at: antes(20) }),
      im({ id: 2, codigo: 'DEMO-2', slug: 'demo-apartamento-exemplo-aluguel', tipo_negocio: 'aluguel', status: 'publicado', titulo: 'Apartamento de exemplo para alugar', destino_slug: 'portoseguro', tipo_imovel: 'apartamento',
        bairro: 'Bairro Fictício', cidade: 'Cidade Exemplo', preco_centavos: 300000, caucao_texto: '3 meses', quartos: 2, suites: 0, banheiros: 1, vagas: 1, area_privativa_m2: 70,
        resumo_card: 'Imóvel fictício de demonstração para aluguel anual.', descricao_html: DESC('Imóvel fictício, criado só para demonstrar o painel. Não existe.'), updated_at: antes(9), published_at: antes(30) }),
      im({ id: 3, codigo: 'DEMO-3', slug: 'demo-casa-exemplo-temporada', tipo_negocio: 'temporada', status: 'publicado', titulo: 'Casa de exemplo para temporada', destino_slug: 'trancoso', tipo_imovel: 'casa',
        estilos_json: '["praia"]', bairro: 'Bairro Fictício', cidade: 'Cidade Exemplo', diaria_centavos: 100000, minimo_noites: 3, capacidade_hospedes: 8, checkin_hora: '15:00', checkout_hora: '11:00',
        taxa_limpeza_centavos: 25000, quartos: 4, suites: 2, banheiros: 3, vagas: 2, area_privativa_m2: 200,
        diferenciais_json: JSON.stringify(['Ar-condicionado', 'Wi-Fi', 'Cozinha equipada', 'Piscina', 'Churrasqueira', 'Roupa de cama']),
        descricao_html: DESC('Casa fictícia usada apenas para demonstrar a página e o calendário de reservas.\n\nAmpla, com varanda, piscina e espaço para até 8 hóspedes. Nenhuma informação aqui é de uma casa real.'),
        updated_at: antes(5), published_at: antes(40) }),
      im({ id: 4, codigo: 'DEMO-4', slug: 'demo-bangalo-exemplo-temporada', tipo_negocio: 'temporada', status: 'publicado', titulo: 'Bangalô de exemplo pé na areia', destino_slug: 'caraiva', tipo_imovel: 'casa',
        estilos_json: '["pe-na-areia"]', bairro: 'Bairro Fictício', cidade: 'Vila Exemplo', diaria_centavos: 65000, minimo_noites: 2, capacidade_hospedes: 4, checkin_hora: '14:00', checkout_hora: '11:00',
        quartos: 2, suites: 1, banheiros: 2, diferenciais_json: JSON.stringify(['Pé na areia', 'Wi-Fi', 'Rede na varanda']),
        descricao_html: DESC('Bangalô fictício de demonstração, a poucos passos de uma praia de exemplo.'), updated_at: antes(6), published_at: antes(40) }),
      im({ id: 5, codigo: 'DEMO-5', slug: 'demo-vila-exemplo-temporada', tipo_negocio: 'temporada', status: 'publicado', titulo: 'Vila de exemplo com jardim', destino_slug: 'arraial', tipo_imovel: 'casa',
        estilos_json: '["alto-padrao"]', bairro: 'Bairro Fictício', cidade: 'Cidade Exemplo', diaria_centavos: 140000, minimo_noites: 3, capacidade_hospedes: 10, checkin_hora: '15:00', checkout_hora: '11:00',
        quartos: 5, suites: 5, banheiros: 6, diferenciais_json: JSON.stringify(['Jardim', 'Piscina aquecida', 'Ar-condicionado', 'Wi-Fi']),
        descricao_html: DESC('Vila fictícia de demonstração com cinco suítes e jardim.'), updated_at: antes(7), published_at: antes(40) }),
      im({ id: 6, codigo: 'DEMO-6', slug: 'demo-terreno-exemplo-venda', tipo_negocio: 'venda', status: 'rascunho', titulo: 'Terreno de exemplo com vista para o mar', destino_slug: 'trancoso', tipo_imovel: 'terreno',
        estilos_json: '["vista-mar"]', bairro: 'Bairro Fictício', cidade: 'Cidade Exemplo', preco_centavos: 45000000, area_total_m2: 1000,
        resumo_card: 'Terreno fictício de demonstração, ainda em rascunho.', updated_at: antes(1) }),
    ];
    var fotos = [
      { id: 1, imovel_id: 1, arquivo_chave: 'img/demo-casa-1.webp', alt: 'Casa de exemplo com piscina', legenda: 'Fachada (ilustração)', ordem: 0, is_card_capa: 1, largura: 960, altura: 600, bytes: null, mime: 'image/webp' },
      { id: 2, imovel_id: 1, arquivo_chave: 'img/demo-casa-2.webp', alt: 'Área da piscina', legenda: null, ordem: 1, is_card_capa: 0, largura: 960, altura: 600, bytes: null, mime: 'image/webp' },
      { id: 3, imovel_id: 2, arquivo_chave: 'img/demo-apto.webp', alt: 'Apartamento de exemplo', legenda: null, ordem: 0, is_card_capa: 1, largura: 960, altura: 600, bytes: null, mime: 'image/webp' },
      { id: 4, imovel_id: 3, arquivo_chave: 'img/demo-temporada.webp', alt: 'Casa de temporada de exemplo', legenda: null, ordem: 0, is_card_capa: 1, largura: 960, altura: 600, bytes: null, mime: 'image/webp' },
      { id: 5, imovel_id: 3, arquivo_chave: 'img/demo-casa-2.webp', alt: 'Piscina da casa de temporada', legenda: null, ordem: 1, is_card_capa: 0, largura: 960, altura: 600, bytes: null, mime: 'image/webp' },
      { id: 6, imovel_id: 4, arquivo_chave: 'img/demo-bangalo.webp', alt: 'Bangalô de exemplo', legenda: null, ordem: 0, is_card_capa: 1, largura: 960, altura: 600, bytes: null, mime: 'image/webp' },
      { id: 7, imovel_id: 5, arquivo_chave: 'img/demo-casa-1.webp', alt: 'Vila de exemplo', legenda: null, ordem: 0, is_card_capa: 1, largura: 960, altura: 600, bytes: null, mime: 'image/webp' },
    ];
    var d = function (n) { return addDias(h, n); };
    var R = function (o) { return Object.assign({ hospede_nome: null, hospede_fone: null, pessoas: null, diaria_centavos: null, total_centavos: null, sinal_centavos: 0, pago: 0, notas: null, expira_em: null, criado_em: agoraSql() }, o); };
    var reservas = [
      R({ id: 1, imovel_id: 3, entrada: d(3), saida: d(8), estado: 'alugado', hospede_nome: 'Hóspede Exemplo 01', pessoas: 4, origem: 'direto', diaria_centavos: 100000, total_centavos: 500000, sinal_centavos: 150000, notas: 'Reserva fictícia de demonstração.' }),
      R({ id: 2, imovel_id: 3, entrada: d(12), saida: d(15), estado: 'pre_reserva', hospede_nome: 'Hóspede Exemplo 02', pessoas: 2, origem: 'airbnb', diaria_centavos: 100000, total_centavos: 300000, notas: 'Pré-reserva fictícia de demonstração.', expira_em: new Date(agora + 2 * 86400000).toISOString() }),
      R({ id: 3, imovel_id: 3, entrada: d(20), saida: d(24), estado: 'bloqueio_dono', origem: 'direto', notas: 'Bloqueio fictício de demonstração.' }),
      R({ id: 4, imovel_id: 3, entrada: d(30), saida: d(35), estado: 'alugado', hospede_nome: 'Hóspede Exemplo 03', pessoas: 6, origem: 'booking', diaria_centavos: 100000, total_centavos: 500000, sinal_centavos: 500000, pago: 1 }),
      R({ id: 5, imovel_id: 4, entrada: d(-1), saida: d(4), estado: 'alugado', hospede_nome: 'Hóspede Exemplo 04', pessoas: 2, origem: 'direto', diaria_centavos: 65000, total_centavos: 325000, sinal_centavos: 100000 }),
      R({ id: 6, imovel_id: 4, entrada: d(9), saida: d(13), estado: 'alugado', hospede_nome: 'Hóspede Exemplo 05', pessoas: 3, origem: 'airbnb', diaria_centavos: 65000, total_centavos: 260000, sinal_centavos: 260000, pago: 1 }),
      R({ id: 7, imovel_id: 4, entrada: d(16), saida: d(18), estado: 'manutencao', origem: 'direto', notas: 'Pintura (fictício).' }),
      R({ id: 8, imovel_id: 5, entrada: d(5), saida: d(11), estado: 'alugado', hospede_nome: 'Hóspede Exemplo 06', pessoas: 9, origem: 'booking', diaria_centavos: 140000, total_centavos: 840000, sinal_centavos: 300000 }),
      R({ id: 9, imovel_id: 5, entrada: d(14), saida: d(17), estado: 'bloqueio_dono', origem: 'airbnb', notas: 'Fechado no canal (fictício).' }),
      R({ id: 10, imovel_id: 5, entrada: d(22), saida: d(29), estado: 'alugado', hospede_nome: 'Hóspede Exemplo 07', pessoas: 8, origem: 'direto', diaria_centavos: 140000, total_centavos: 980000, sinal_centavos: 490000 }),
    ];
    var precos = { 3: [
      { nome: 'Baixa (demonstração)', de: d(-30), ate: d(60), diaria_centavos: 100000, estadia_min: 2 },
      { nome: 'Alta (demonstração)', de: d(60), ate: d(90), diaria_centavos: 200000, estadia_min: 5 },
      { nome: 'Réveillon (demonstração)', de: d(90), ate: d(100), diaria_centavos: 300000, estadia_min: 7 },
    ] };
    var db = { versao: 1, sessao: false, imoveis: imoveis, fotos: fotos, reservas: reservas, precos: precos, seq: { imovel: 100, foto: 100, reserva: 100, codigo: 101 },
      publicacoes: [antes(2)], tentativa: 0, site: null, progresso: {} };
    db.site = fotografarSite(db, antes(2));
    return db;
  }

  /** "Build" do site: copia o que esta publicado (como o build real le do banco). */
  function fotografarSite(db, quando) {
    var vivos = db.imoveis.filter(function (i) { return !i.deleted_at && i.status === 'publicado'; }).map(function (i) {
      var x = copia(i);
      x.fotos = db.fotos.filter(function (f) { return f.imovel_id === i.id; }).sort(function (a, b) { return a.ordem - b.ordem || a.id - b.id; }).map(function (f) { return f.arquivo_chave; });
      return x;
    });
    return { gerado_em: quando || agoraSql(), imoveis: vivos };
  }

  // ------------------------------------------------------------------ persistencia (so neste navegador)
  var memoria = null;
  function carregar() {
    var bruto = null;
    try { bruto = localStorage.getItem(CHAVE); } catch (e) { bruto = null; }
    var db = null;
    if (bruto) { try { db = JSON.parse(bruto); } catch (e) { db = null; } }
    if (!db || db.versao !== 1) db = memoria || semente();
    expirarPreReservas(db);
    memoria = db;
    return db;
  }
  function salvar(db) {
    memoria = db;
    try { localStorage.setItem(CHAVE, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  function restaurar() {
    var p = memoria && memoria.progresso;
    var db = semente();
    void p;
    salvar(db);
    return db;
  }
  /** Pre-reserva vencida vira cancelada (no banco real, um gatilho faz isso ao gravar). */
  function expirarPreReservas(db) {
    var agora = Date.now();
    (db.reservas || []).forEach(function (r) { if (r.estado === 'pre_reserva' && r.expira_em && Date.parse(r.expira_em) < agora) r.estado = 'cancelado'; });
  }
  function marcar(passo) {
    var db = carregar();
    if (db.progresso[passo]) return;
    db.progresso[passo] = agoraSql();
    salvar(db);
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ tipo: 'cassiano-sandbox:progresso', passo: passo }, location.origin); } catch (e) { /* sem moldura */ }
  }

  // ------------------------------------------------------------------ API simulada
  function resp(status, corpo) { return { status: status, corpo: corpo }; }
  var naoAchou = function () { return resp(404, { ok: false, erro: 'nao_encontrado' }); };
  function vivo(db, id) { for (var i = 0; i < db.imoveis.length; i++) if (db.imoveis[i].id === id) return db.imoveis[i]; return null; }
  function fotosDe(db, id) {
    return db.fotos.filter(function (f) { return f.imovel_id === id; }).sort(function (a, b) { return a.ordem - b.ordem || a.id - b.id; }).map(function (f) {
      return { id: f.id, url: resolverFoto(f.arquivo_chave), origem: 'sandbox', alt: f.alt, legenda: f.legenda, ordem: f.ordem, capa: f.is_card_capa === 1, largura: f.largura, altura: f.altura, bytes: f.bytes, mime: f.mime };
    });
  }
  function renumerar(db, id) { db.fotos.filter(function (f) { return f.imovel_id === id; }).sort(function (a, b) { return a.ordem - b.ordem || a.id - b.id; }).forEach(function (f, i) { f.ordem = i; f.is_card_capa = i === 0 ? 1 : 0; }); }
  function tocar(im) { im.updated_at = agoraSql(); }
  function ativas(db) { return db.reservas.filter(function (r) { return r.estado !== 'cancelado'; }); }
  function conflitoDe(db, imovelId, entrada, saida, ignorar) {
    var agora = Date.now();
    return ativas(db).filter(function (r) {
      if (r.imovel_id !== imovelId || r.id === ignorar) return false;
      if (r.estado === 'pre_reserva' && r.expira_em && Date.parse(r.expira_em) < agora) return false;
      return r.entrada < saida && entrada < r.saida;
    })[0] || null;
  }

  function apiImoveis(L, db, metodo, partes, url, corpo) {
    var I = L.imoveis;
    if (!partes.length) {
      if (metodo === 'GET') {
        var p = url.searchParams, q = (p.get('q') || '').trim().toLowerCase().slice(0, 60);
        var lista = db.imoveis.filter(function (i) {
          if (p.get('lixeira') === '1' ? !i.deleted_at : i.deleted_at) return false;
          if (I.NEGOCIOS.indexOf(p.get('negocio')) >= 0 && i.tipo_negocio !== p.get('negocio')) return false;
          if (I.STATUS_IMOVEL.indexOf(p.get('status')) >= 0 && i.status !== p.get('status')) return false;
          if (q && [i.titulo, i.codigo, i.bairro || ''].join(' ').toLowerCase().indexOf(q) < 0) return false;
          return true;
        }).sort(function (a, b) { return a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : b.id - a.id; });
        var pagina = Math.max(1, parseInt(p.get('pagina') || '1', 10) || 1), total = lista.length;
        var itens = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(function (i) {
          var f = fotosDe(db, i.id)[0];
          return { id: i.id, codigo: i.codigo, slug: i.slug, tipo_negocio: i.tipo_negocio, status: i.status, titulo: i.titulo, bairro: i.bairro, cidade: i.cidade, preco_sob_consulta: i.preco_sob_consulta,
            preco_centavos: i.preco_centavos, diaria_centavos: i.diaria_centavos, quartos: i.quartos, suites: i.suites, vagas: i.vagas, area_privativa_m2: i.area_privativa_m2, destaque: i.destaque,
            updated_at: i.updated_at, deleted_at: i.deleted_at, capa: f ? f.url : null };
        });
        return resp(200, { ok: true, itens: itens, total: total, pagina: pagina, paginas: Math.max(1, Math.ceil(total / POR_PAGINA)), por_pagina: POR_PAGINA });
      }
      if (metodo === 'POST') {
        var v = I.validarImovel(corpo);
        if (!v.ok) return resp(400, { ok: false, erros: v.erros });
        var x = v.valor;
        x.codigo = 'CS-' + db.seq.codigo++;
        if (x.slug && db.imoveis.some(function (i) { return i.slug === x.slug; })) return resp(409, { ok: false, erros: { slug: 'Este endereço já existe.' } });
        if (!x.slug) { var base = I.slugificar(x.codigo + ' ' + x.titulo), s = base, n = 2; while (db.imoveis.some(function (i) { return i.slug === s; })) s = (base + '-' + n++).slice(0, 80); x.slug = s; }
        x.id = ++db.seq.imovel; x.status = 'rascunho'; x.deleted_at = null; x.published_at = null; x.created_at = x.updated_at = agoraSql();
        db.imoveis.push(x);
        marcar('criou');
        return resp(201, { ok: true, id: x.id, codigo: x.codigo, slug: x.slug });
      }
      return resp(405, { ok: false });
    }
    var id = /^\d{1,12}$/.test(partes[0]) ? Number(partes[0]) : null, im = id === null ? null : vivo(db, id);
    if (!im) return naoAchou();
    if (partes.length === 1) {
      if (metodo === 'GET') {
        var o = copia(im), j = function (t, d) { try { return JSON.parse(t); } catch (e) { return d; } };
        o.estilos = j(o.estilos_json, []); o.especificacoes = j(o.especificacoes_json, []); o.diferenciais = j(o.diferenciais_json, []); o.descricao = I.htmlParaParagrafos(o.descricao_html);
        delete o.estilos_json; delete o.especificacoes_json; delete o.diferenciais_json; delete o.descricao_html;
        o.fotos = fotosDe(db, id);
        return resp(200, { ok: true, imovel: o });
      }
      if (im.deleted_at) return naoAchou();
      if (metodo === 'PUT') {
        var v2 = I.validarImovel(corpo, { tipo_negocio: im.tipo_negocio });
        if (!v2.ok) return resp(400, { ok: false, erros: v2.erros });
        var y = v2.valor;
        if (y.slug && y.slug !== im.slug) {
          if (im.status !== 'rascunho') return resp(400, { ok: false, erros: { slug: 'O endereço de um imóvel publicado não pode mudar (o link quebraria).' } });
          if (db.imoveis.some(function (i) { return i.slug === y.slug && i.id !== id; })) return resp(409, { ok: false, erros: { slug: 'Este endereço já existe.' } });
        } else y.slug = im.slug;
        I.COLUNAS_EDITAVEIS.forEach(function (c) { if (c !== 'tipo_negocio' && c !== 'codigo' && y[c] !== undefined) im[c] = y[c]; });
        tocar(im);
        marcar('editou');
        return resp(200, { ok: true });
      }
      if (metodo === 'DELETE') { im.deleted_at = agoraSql(); tocar(im); return resp(200, { ok: true }); }
      return resp(405, { ok: false });
    }
    if (partes[1] === 'status' && metodo === 'POST') {
      if (!corpo || I.STATUS_IMOVEL.indexOf(corpo.status) < 0) return resp(400, { ok: false, erros: { status: 'Status inválido.' } });
      im.status = corpo.status; if (corpo.status === 'publicado' && !im.published_at) im.published_at = agoraSql();
      tocar(im);
      return resp(200, { ok: true });
    }
    if (partes[1] === 'restaurar' && metodo === 'POST') { if (!im.deleted_at) return naoAchou(); im.deleted_at = null; tocar(im); return resp(200, { ok: true }); }
    if (partes[1] === 'fotos') {
      var resto = partes.slice(2);
      if (!resto.length && metodo === 'GET') return resp(200, { ok: true, fotos: fotosDe(db, id), limite: MAX_FOTOS, limite_bytes: 2097152 });
      if (resto[0] === 'ordem' && metodo === 'PUT') {
        var ids = corpo && corpo.ids, atuais = db.fotos.filter(function (f) { return f.imovel_id === id; });
        if (!Array.isArray(ids) || ids.length !== atuais.length) return resp(400, { ok: false, erro: 'ordem_invalida' });
        ids.forEach(function (fid, k) { atuais.forEach(function (f) { if (f.id === fid) f.ordem = k; }); });
        renumerar(db, id); tocar(im);
        return resp(200, { ok: true, fotos: fotosDe(db, id) });
      }
      var fid = Number(resto[0]), foto = db.fotos.filter(function (f) { return f.id === fid && f.imovel_id === id; })[0];
      if (!foto) return naoAchou();
      if (metodo === 'PATCH') { var leg = corpo && typeof corpo.legenda === 'string' ? corpo.legenda.trim() : null; if (leg === null || leg.length > 200) return resp(400, { ok: false, erros: { legenda: 'Texto inválido.' } }); foto.legenda = leg || null; return resp(200, { ok: true, fotos: fotosDe(db, id) }); }
      if (metodo === 'DELETE') { db.fotos.splice(db.fotos.indexOf(foto), 1); renumerar(db, id); tocar(im); return resp(200, { ok: true, fotos: fotosDe(db, id) }); }
    }
    return naoAchou();
  }

  function itemReserva(db, r) {
    var i = vivo(db, r.imovel_id) || {};
    var o = copia(r); o.codigo = i.codigo; o.titulo = i.titulo; o.noites = noites(r.entrada, r.saida);
    return o;
  }
  function apiReservas(L, db, metodo, partes, url, corpo) {
    var R = L.reservas, p = url.searchParams;
    if (!partes.length && metodo === 'GET') {
      var hoje = hojeIso(), de = /^\d{4}-\d{2}-\d{2}$/.test(p.get('de') || '') ? p.get('de') : hoje.slice(0, 8) + '01';
      var ate = /^\d{4}-\d{2}-\d{2}$/.test(p.get('ate') || '') ? p.get('ate') : addDias(de, 92);
      var imovel = /^\d+$/.test(p.get('imovel') || '') ? Number(p.get('imovel')) : null;
      var itens = db.reservas.filter(function (r) { return r.entrada < ate && r.saida > de && (imovel === null || r.imovel_id === imovel) && (p.get('canceladas') === '1' || r.estado !== 'cancelado'); })
        .sort(function (a, b) { return a.entrada < b.entrada ? -1 : a.entrada > b.entrada ? 1 : a.id - b.id; }).map(function (r) { return itemReserva(db, r); });
      return resp(200, { ok: true, de: de, ate: ate, itens: itens });
    }
    if (!partes.length && metodo === 'POST') return criarReserva(L, db, corpo, { admin: true });
    if (partes[0] === 'precos' && partes.length === 2) {
      var im = vivo(db, Number(partes[1]));
      if (!im || im.tipo_negocio !== 'temporada' || im.deleted_at) return naoAchou();
      if (metodo === 'GET') return resp(200, { ok: true, diaria_base_centavos: im.diaria_centavos, minimo_noites: im.minimo_noites, precos: db.precos[im.id] || [] });
      if (metodo === 'PUT') {
        var lista = corpo && Array.isArray(corpo.precos) ? corpo.precos : null, limpas = [];
        if (!lista || lista.length > 40) return resp(400, { ok: false, erros: { precos: 'Envie até 40 épocas.' } });
        for (var k = 0; k < lista.length; k++) {
          var e = lista[k], nome = typeof e.nome === 'string' ? e.nome.replace(/\s+/g, ' ').trim() : '';
          var ok = nome && nome.length <= 40 && /^\d{4}-\d{2}-\d{2}$/.test(e.de) && /^\d{4}-\d{2}-\d{2}$/.test(e.ate) && e.ate > e.de && Number.isInteger(e.diaria_centavos) && e.diaria_centavos >= 0 && (e.estadia_min == null || (Number.isInteger(e.estadia_min) && e.estadia_min >= 1 && e.estadia_min <= 365));
          if (!ok) return resp(400, { ok: false, erros: { precos: 'Confira o nome, as datas (a saída depois da entrada), a diária e a estadia mínima de cada época.' } });
          limpas.push({ nome: nome, de: e.de, ate: e.ate, diaria_centavos: e.diaria_centavos, estadia_min: e.estadia_min == null ? null : e.estadia_min });
        }
        db.precos[im.id] = limpas;
        return resp(200, { ok: true });
      }
    }
    var id = Number(partes[0]), r = db.reservas.filter(function (x) { return x.id === id; })[0];
    if (!r) return naoAchou();
    if (partes.length === 1 && metodo === 'PUT') {
      if (r.estado === 'cancelado') return naoAchou();
      var casa = vivo(db, r.imovel_id), v = R.validarReserva(Object.assign({}, r, corpo), { hoje: hojeIso(), permitirPassado: true });
      if (!v.ok) return resp(400, { ok: false, erros: v.erros });
      var y = v.valor, temporadas = db.precos[r.imovel_id] || [];
      var viola = R.violaEstadiaMinima({ entrada: y.entrada, saida: y.saida, minimoCasa: casa.minimo_noites, temporadas: temporadas, estado: y.estado });
      if (viola && !(corpo && corpo.ignorar_minimo === true)) return resp(400, { ok: false, erros: { saida: 'A estadia mínima nesta época é de ' + viola.minimo + ' noites.' }, minimo: viola.minimo, pode_ignorar: true });
      if (conflitoDe(db, r.imovel_id, y.entrada, y.saida, r.id)) return resp(409, { ok: false, erros: { entrada: 'Estas datas já estão ocupadas.' } });
      if (corpo && corpo.recalcular_total === true && casa.diaria_centavos != null) { var pr = R.calcularPreco({ entrada: y.entrada, saida: y.saida, diariaBase: casa.diaria_centavos, temporadas: temporadas }); y.total_centavos = pr.total_centavos; y.diaria_centavos = Math.round(pr.total_centavos / pr.noites); }
      ['entrada', 'saida', 'estado', 'hospede_nome', 'hospede_fone', 'pessoas', 'origem', 'diaria_centavos', 'total_centavos', 'sinal_centavos', 'pago', 'notas'].forEach(function (c) { r[c] = y[c] == null ? null : y[c]; });
      if (r.estado !== 'pre_reserva') r.expira_em = null; else if (!r.expira_em) r.expira_em = new Date(Date.now() + 48 * 3600000).toISOString();
      return resp(200, { ok: true });
    }
    if (partes.length === 1 && metodo === 'DELETE') { db.reservas.splice(db.reservas.indexOf(r), 1); return resp(200, { ok: true }); }
    if (partes[1] === 'cancelar' && metodo === 'POST') { if (r.estado === 'cancelado') return naoAchou(); r.estado = 'cancelado'; return resp(200, { ok: true }); }
    return naoAchou();
  }
  /** Mesma regra do servidor (criar em admin-reservas.mjs). opcoes.admin libera estadia minima e datas passadas; o "motor do site" nao. */
  function criarReserva(L, db, corpo, opcoes) {
    var R = L.reservas;
    if (!corpo || typeof corpo !== 'object') return resp(400, { ok: false, erros: { corpo: 'Dados inválidos.' } });
    var im = Number.isInteger(corpo.imovel_id) ? vivo(db, corpo.imovel_id) : null;
    if (!im || im.deleted_at || im.tipo_negocio !== 'temporada') return resp(400, { ok: false, erros: { imovel_id: 'Escolha um imóvel de temporada.' } });
    var v = R.validarReserva(corpo, { hoje: hojeIso(), permitirPassado: opcoes.admin && corpo.permitir_passado === true });
    if (!v.ok) return resp(400, { ok: false, erros: v.erros });
    var r = v.valor;
    if (r.estado === 'cancelado') return resp(400, { ok: false, erros: { estado: 'Escolha o tipo da reserva.' } });
    var temporadas = db.precos[im.id] || [];
    var viola = R.violaEstadiaMinima({ entrada: r.entrada, saida: r.saida, minimoCasa: im.minimo_noites, temporadas: temporadas, estado: r.estado });
    if (viola && !(opcoes.admin && corpo.ignorar_minimo === true)) return resp(400, { ok: false, erros: { saida: 'A estadia mínima nesta época é de ' + viola.minimo + ' noites.' }, minimo: viola.minimo, pode_ignorar: !!opcoes.admin });
    if ((r.estado === 'alugado' || r.estado === 'pre_reserva') && r.total_centavos == null && im.diaria_centavos != null) {
      var pr = R.calcularPreco({ entrada: r.entrada, saida: r.saida, diariaBase: im.diaria_centavos, temporadas: temporadas });
      r.total_centavos = pr.total_centavos; r.diaria_centavos = r.diaria_centavos == null ? Math.round(pr.total_centavos / pr.noites) : r.diaria_centavos;
      if (r.sinal_centavos > r.total_centavos) r.sinal_centavos = 0;
    }
    if (r.estado === 'pre_reserva' && !r.expira_em) r.expira_em = new Date(Date.now() + 48 * 3600000).toISOString();
    var c = conflitoDe(db, im.id, r.entrada, r.saida, null);
    if (c) return resp(409, { ok: false, erros: { entrada: 'Estas datas já estão ocupadas.' }, conflito: { id: c.id, entrada: c.entrada, saida: c.saida, estado: c.estado, hospede_nome: c.hospede_nome } });
    var nova = { id: ++db.seq.reserva, imovel_id: im.id, entrada: r.entrada, saida: r.saida, estado: r.estado, hospede_nome: r.hospede_nome, hospede_fone: r.hospede_fone, pessoas: r.pessoas, origem: r.origem,
      diaria_centavos: r.diaria_centavos, total_centavos: r.total_centavos, sinal_centavos: r.sinal_centavos || 0, pago: r.pago, notas: r.notas, expira_em: r.expira_em, criado_em: agoraSql() };
    db.reservas.push(nova);
    return resp(201, { ok: true, id: nova.id, total_centavos: nova.total_centavos, expira_em: nova.expira_em });
  }

  /** Igual a carregarAgenda (lib/agenda.mjs), lendo do banco em memoria. Acrescenta expira_em nas reservas (validade da pre-reserva). */
  function dadosAgenda(L, db, de, ate, casaId) {
    var casas = db.imoveis.filter(function (i) { return i.tipo_negocio === 'temporada' && !i.deleted_at && (casaId == null || i.id === casaId); })
      .sort(function (a, b) { return a.codigo < b.codigo ? -1 : a.codigo > b.codigo ? 1 : a.id - b.id; })
      .map(function (i) { return { id: i.id, codigo: i.codigo, titulo: i.titulo, bairro: i.bairro, cidade: i.cidade }; });
    if (casaId != null && !casas.length) return null;
    var ateEx = addDias(ate, 1), ids = casas.map(function (c) { return c.id; });
    var reservas = db.reservas.filter(function (r) { return r.estado !== 'cancelado' && r.entrada < ateEx && r.saida > de && ids.indexOf(r.imovel_id) >= 0; })
      .sort(function (a, b) { return a.entrada < b.entrada ? -1 : a.entrada > b.entrada ? 1 : a.id - b.id; }).map(copia);
    var agenda = L.agenda.montarAgenda({ de: de, ate: ate, casas: casas, reservas: reservas, agora: new Date() });
    var exp = {}; reservas.forEach(function (r) { exp[r.id] = r.expira_em; });
    agenda.casas.forEach(function (c) { c.reservas.forEach(function (r) { r.expira_em = exp[r.id] || null; }); });
    return { agenda: agenda, reservas: reservas, casas: casas };
  }

  function baixar(nome, dados, tipo) {
    var url = URL.createObjectURL(new Blob([dados], { type: tipo }));
    var a = document.createElement('a'); a.href = url; a.download = nome; a.hidden = true;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }
  var TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  /** Exportacoes (links do painel para /api/admin/reservas/exportar*): o arquivo e gerado aqui mesmo, pelas libs do servidor. */
  function exportar(url) {
    return libs().then(function (L) {
      var db = carregar(), p = url.searchParams, ano = hojeIso().slice(0, 4), formato = p.get('formato') === 'csv' ? 'csv' : 'xlsx';
      var de = p.get('de') || ano + '-01-01', ate = p.get('ate') || ano + '-12-31';
      if (/exportar$/.test(url.pathname)) {
        // Planilha de reservas (todas as casas): no sistema real tem tambem as abas Ocupacao e Receita.
        var COL = [{ chave: 'imovel', titulo: 'Imóvel', largura: 34 }, { chave: 'entrada', titulo: 'Entrada', tipo: 'data', largura: 12 }, { chave: 'saida', titulo: 'Saída', tipo: 'data', largura: 12 },
          { chave: 'noites', titulo: 'Noites', tipo: 'inteiro', largura: 8 }, { chave: 'estado', titulo: 'Situação', largura: 22 }, { chave: 'hospede_nome', titulo: 'Hóspede', largura: 24 },
          { chave: 'origem', titulo: 'Origem', largura: 14 }, { chave: 'total_centavos', titulo: 'Total', tipo: 'moeda', largura: 14 }, { chave: 'sinal_centavos', titulo: 'Sinal', tipo: 'moeda', largura: 14 }, { chave: 'pago', titulo: 'Pago', tipo: 'sim_nao', largura: 8 }];
        var linhas = ativas(db).filter(function (r) { return r.entrada < ate && r.saida > de; }).map(function (r) { var i = vivo(db, r.imovel_id); return Object.assign({}, r, { imovel: i.codigo + ' ' + i.titulo, noites: noites(r.entrada, r.saida), estado: L.agendaXlsx.ROT_ESTADO[r.estado], origem: L.agendaXlsx.ROT_ORIGEM[r.origem] }); });
        if (formato === 'csv') baixar('reservas-' + de + '-a-' + ate + '.csv', L.csv.gerarCsv(COL, linhas), 'text/csv;charset=utf-8');
        else baixar('reservas-' + de + '-a-' + ate + '.xlsx', L.xlsx.gerarXlsx([{ nome: 'Reservas', colunas: COL, linhas: linhas }]), TIPO_XLSX);
      } else {
        if (L.agenda.validarPeriodo(de, ate).ok !== true) { de = ano + '-01-01'; ate = ano + '-12-31'; }
        var casa = /^\d+$/.test(p.get('casa') || '') ? Number(p.get('casa')) : null, dados = dadosAgenda(L, db, de, ate, casa);
        if (!dados) return;
        var suf = casa != null ? '-' + dados.agenda.casas[0].codigo.toLowerCase() : '';
        if (formato === 'csv') baixar('agenda-geral' + suf + '-' + de + '-a-' + ate + '.csv', L.agendaXlsx.gerarCsvAgenda(dados), 'text/csv;charset=utf-8');
        else baixar('agenda-geral' + suf + '-' + de + '-a-' + ate + '.xlsx', L.agendaXlsx.gerarPlanilhaAgenda(dados, new Date()), TIPO_XLSX);
      }
      marcar('planilha');
    });
  }

  function apiPublicar(db, metodo) {
    function estado() {
      var ultima = db.publicacoes.length ? db.publicacoes[db.publicacoes.length - 1] : null;
      var espere = Math.max(0, Math.ceil(ESPERA_PUBLICAR - (Date.now() - (db.tentativa || 0)) / 1000));
      var pendentes = ultima ? db.imoveis.filter(function (i) { return i.tipo_negocio === 'venda' && i.updated_at > ultima; }).length : null;
      return { ultima: ultima, pendentes: pendentes, espere: espere };
    }
    if (metodo === 'GET') return resp(200, Object.assign({ ok: true, configurado: true }, estado()));
    if (metodo !== 'POST') return resp(405, { ok: false });
    var e = estado();
    if (e.espere > 0) return resp(429, { ok: false, erro: 'aguarde', espere: e.espere });
    db.tentativa = Date.now();
    db.publicacoes.push(agoraSql());
    var depois = estado();
    setTimeout(function () { window.dispatchEvent(new CustomEvent('sandbox:publicar')); }, 0);
    return resp(200, { ok: true, ultima: depois.ultima, pendentes: depois.pendentes, espere: ESPERA_PUBLICAR });
  }

  /** Roteador: caminho = segmentos depois de /api/admin/. Devolve Promise<{status, corpo}>. */
  function tratar(metodo, url, corpo) {
    var partes = url.pathname.split('/api/admin/')[1].split('/').filter(Boolean).map(decodeURIComponent);
    return libs().then(function (L) {
      var db = carregar(), r, rota = partes[0];
      if (rota === 'login') { if (metodo !== 'POST') return resp(405, { ok: false }); db.sessao = true; salvar(db); marcar('entrou'); return resp(200, { ok: true, usuario: USUARIO }); }
      if (rota === 'logout') { db.sessao = false; salvar(db); return resp(200, { ok: true }); }
      if (!db.sessao) return resp(401, { ok: false, erro: 'sem_sessao' });
      if (rota === 'eu') return resp(200, { ok: true, usuario: USUARIO, envio_leads: false });
      if (rota === 'imoveis') r = apiImoveis(L, db, metodo, partes.slice(1), url, corpo);
      else if (rota === 'reservas') r = apiReservas(L, db, metodo, partes.slice(1), url, corpo);
      else if (rota === 'publicar') r = apiPublicar(db, metodo);
      else if (rota === 'temporada' && partes[1] === 'agenda') {
        var v = L.agenda.validarPeriodo(url.searchParams.get('de'), url.searchParams.get('ate'));
        if (!v.ok) return resp(400, { ok: false, erro: v.erro });
        var casa = url.searchParams.has('casa') ? Number(url.searchParams.get('casa')) : null, dd = dadosAgenda(L, db, v.de, v.ate, casa);
        if (!dd) return naoAchou();
        marcar('agenda');
        r = resp(200, dd.agenda);
      } else r = naoAchou();
      if (metodo !== 'GET' && r.status < 300 && !salvar(db)) return resp(507, { ok: false, erro: 'armazenamento_cheio' });
      return r;
    }).catch(function () { return resp(500, { ok: false, erro: 'interno' }); });
  }
  function ehApi(u) { return u.origin === location.origin && u.pathname.indexOf('/api/admin/') >= 0; }
  var atraso = function () { return new Promise(function (ok) { setTimeout(ok, 120 + Math.random() * 180); }); };

  // ------------------------------------------------------------------ interceptacao de fetch
  var fetchOriginal = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (entrada, init) {
    var u = new URL(typeof entrada === 'string' ? entrada : entrada.url, location.href);
    if (!ehApi(u)) return fetchOriginal(entrada, init);
    init = init || {};
    var metodo = String(init.method || 'GET').toUpperCase(), corpo = null;
    if (typeof init.body === 'string') { try { corpo = JSON.parse(init.body); } catch (e) { corpo = null; } }
    return atraso().then(function () { return tratar(metodo, u, corpo); }).then(function (r) {
      return new Response(JSON.stringify(r.corpo), { status: r.status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Sandbox': 'cassiano' } });
    });
  };

  // ------------------------------------------------------------------ interceptacao de XHR (envio de fotos do fotos.js)
  /** Guarda uma versao pequena da foto (data: URL) para caber no localStorage. A foto nunca sai do navegador. */
  function miniatura(blob) {
    return new Promise(function (ok, erro) {
      var fr = new FileReader();
      fr.onerror = erro;
      fr.onload = function () {
        var img = new Image();
        img.onerror = erro;
        img.onload = function () {
          var s = Math.min(1, 960 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var d = c.toDataURL('image/webp', 0.72);
          if (d.indexOf('data:image/webp') !== 0) d = c.toDataURL('image/jpeg', 0.72);
          ok({ url: d, largura: c.width, altura: c.height });
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(blob);
    });
  }
  var XO = XMLHttpRequest.prototype, abrirO = XO.open, enviarO = XO.send, cabO = XO.setRequestHeader;
  XO.open = function (metodo, url) {
    var u = new URL(url, location.href);
    this.__sandbox = ehApi(u) ? { metodo: String(metodo).toUpperCase(), url: u, cab: {} } : null;
    if (!this.__sandbox) return abrirO.apply(this, arguments);
  };
  XO.setRequestHeader = function (k, v) { if (this.__sandbox) { this.__sandbox.cab[k.toLowerCase()] = v; return; } return cabO.apply(this, arguments); };
  XO.send = function (dados) {
    var x = this, s = x.__sandbox;
    if (!s) return enviarO.apply(x, arguments);
    var definir = function (k, v) { Object.defineProperty(x, k, { configurable: true, value: v }); };
    var terminar = function (status, corpo) {
      definir('status', status); definir('readyState', 4); definir('response', corpo); definir('responseText', JSON.stringify(corpo));
      if (typeof x.onload === 'function') x.onload(); x.dispatchEvent(new Event('load'));
    };
    var partes = s.url.pathname.split('/api/admin/')[1].split('/');
    var id = Number(partes[1]);
    var passo = 0, prog = setInterval(function () {   // progresso simulado (nada e enviado)
      passo += 25;
      if (x.upload && typeof x.upload.onprogress === 'function') x.upload.onprogress({ lengthComputable: true, loaded: Math.min(passo, 100), total: 100 });
      if (passo >= 100) clearInterval(prog);
    }, 120);
    var gravar = function (m) {
      var db = carregar(), im = vivo(db, id);
      if (!im || im.deleted_at) return terminar(404, { ok: false, erro: 'nao_encontrado' });
      var n = db.fotos.filter(function (f) { return f.imovel_id === id; }).length;
      if (n >= MAX_FOTOS) return terminar(409, { ok: false, erro: 'limite_fotos', limite: MAX_FOTOS });
      db.fotos.push({ id: ++db.seq.foto, imovel_id: id, arquivo_chave: m.url, alt: im.titulo, legenda: null, ordem: n, is_card_capa: n === 0 ? 1 : 0,
        largura: Number(s.cab['x-foto-largura']) || m.largura, altura: Number(s.cab['x-foto-altura']) || m.altura, bytes: dados && dados.size || null, mime: dados && dados.type || 'image/webp' });
      tocar(im);
      if (!salvar(db)) { db.fotos.pop(); return terminar(507, { ok: false, erro: 'armazenamento_cheio' }); }
      marcar('foto');
      terminar(201, { ok: true, fotos: fotosDe(db, id) });
    };
    setTimeout(function () {
      if (!carregar().sessao) return terminar(401, { ok: false });
      if (s.metodo !== 'POST' || !(dados instanceof Blob) || !dados.size) return terminar(400, { ok: false, erro: 'foto_vazia' });
      miniatura(dados).then(gravar, function () { terminar(415, { ok: false, erro: 'tipo_invalido' }); });
    }, 550);
  };

  // ------------------------------------------------------------------ links de exportacao (download gerado no navegador)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var u = new URL(a.getAttribute('href'), location.href);
    if (!ehApi(u)) return;
    e.preventDefault();
    exportar(u);
  }, true);

  // ------------------------------------------------------------------ dentro da moldura: rolagem e foco sem mexer na pagina de fora
  if (window.parent !== window) {
    var focoO = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (o) { return focoO.call(this, Object.assign({ preventScroll: true }, o || {})); };
    Element.prototype.scrollIntoView = function () {
      var r = this.getBoundingClientRect();
      window.scrollBy({ top: r.top - window.innerHeight / 3, behavior: 'auto' });
    };
  }

  // ------------------------------------------------------------------ faixa de demonstracao nas telas do painel
  function faixa() {
    if (!document.body || !document.body.hasAttribute('data-sandbox-faixa') && !/\/admin\//.test(location.pathname)) return;
    var f = document.createElement('div');
    f.className = 'sbx-faixa'; f.setAttribute('role', 'note');
    var t = document.createElement('span');
    t.textContent = 'Você está no lugar do dono: teste à vontade. Os dados são fictícios e nada aqui afeta o site real.';
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sbx-restaurar'; b.textContent = 'Restaurar dados de demonstração';
    b.addEventListener('click', function () {
      if (b.getAttribute('data-confirmar') !== '1') { b.setAttribute('data-confirmar', '1'); b.textContent = 'Toque de novo para restaurar'; return; }
      restaurar();
      var db = carregar(); db.sessao = /login/.test(location.pathname) ? false : true; salvar(db);
      try { window.parent.postMessage({ tipo: 'cassiano-sandbox:restaurado' }, location.origin); } catch (e2) { /* sem moldura */ }
      location.reload();
    });
    f.appendChild(t); f.appendChild(b);
    document.body.insertBefore(f, document.body.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', faixa); else faixa();

  window.SandboxCassiano = {
    raiz: RAIZ, carregar: carregar, salvar: salvar, restaurar: restaurar, marcar: marcar, libs: libs, hojeIso: hojeIso, addDias: addDias, noites: noites, dataHora: dataHora,
    resolverFoto: resolverFoto, fotografarSite: fotografarSite, dadosAgenda: dadosAgenda, agoraSql: agoraSql,
    /** Motor de reservas do site (visitante): cria uma pre-reserva com origem "site", com as mesmas regras do painel (sem os poderes de admin). */
    preReservar: function (dados) {
      return libs().then(function (L) {
        var db = carregar();
        var r = criarReserva(L, db, Object.assign({}, dados, { estado: 'pre_reserva', origem: 'site' }), { admin: false });
        if (r.status < 300) { if (!salvar(db)) return resp(507, { ok: false }); marcar('pre_reserva'); }
        return r;
      });
    }
  };
})();
