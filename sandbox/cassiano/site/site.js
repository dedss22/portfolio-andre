/* Previa do site publico no sandbox: vitrine, pagina do imovel e pagina da casa de temporada com o motor de reservas.
   Le a "ultima publicacao" (o que o build simulado copiou do banco em memoria). As datas ocupadas vem das reservas atuais.
   Todo texto entra por textContent. Nenhum dado sai do navegador. */
(function () {
  'use strict';
  var S = window.SandboxCassiano;
  var pagina = document.body.getAttribute('data-pagina');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return; if (k === 'class') el.className = v; else el.setAttribute(k, v === true ? '' : String(v)); });
    var filhos = Array.prototype.slice.call(arguments, 2);
    (function add(lista) { lista.forEach(function (c) { if (c == null || c === false) return; if (Array.isArray(c)) add(c); else el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }); })(filhos);
    return el;
  }
  var DESTINOS = { arraial: "Arraial d'Ajuda", trancoso: 'Trancoso', cabralia: 'Santa Cruz Cabrália', portoseguro: 'Porto Seguro', caraiva: 'Caraíva' };
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function reais(c) { var n = Math.round(Number(c)); return String(Math.floor(n / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + String(n % 100).padStart(2, '0'); }
  function json(t, d) { try { return JSON.parse(t); } catch (e) { return d; } }
  function paragrafos(html) { return String(html || '').split(/<\/p>\s*/i).map(function (p) { return p.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim(); }).filter(Boolean); }
  function preco(i) {
    if (i.tipo_negocio === 'temporada') return i.diaria_centavos != null ? 'Diária a partir de R$ ' + reais(i.diaria_centavos) : 'Consulte';
    if (i.preco_sob_consulta || i.preco_centavos == null) return 'Sob consulta';
    return 'R$ ' + reais(i.preco_centavos) + (i.tipo_negocio === 'aluguel' ? ' / mês' : '');
  }
  function detalhes(i) {
    var d = [];
    if (i.capacidade_hospedes) d.push(i.capacidade_hospedes + ' hóspedes');
    if (i.quartos != null) d.push(i.quartos + (i.quartos === 1 ? ' quarto' : ' quartos'));
    if (i.suites) d.push(i.suites + (i.suites === 1 ? ' suíte' : ' suítes'));
    if (i.area_privativa_m2 != null) d.push(String(i.area_privativa_m2).replace('.', ',') + ' m²');
    else if (i.area_total_m2 != null) d.push(String(i.area_total_m2).replace('.', ',') + ' m² de terreno');
    return d;
  }
  function link(i) { return (i.tipo_negocio === 'temporada' ? 'casa.html?slug=' : 'imovel.html?slug=') + encodeURIComponent(i.slug); }
  function capa(i) { return i.fotos && i.fotos.length ? S.resolverFoto(i.fotos[0]) : S.resolverFoto('img/demo-casa-1.webp'); }
  var db = S.carregar(), site = db.site || { imoveis: [], gerado_em: null };
  function achar(slug, lista) { for (var k = 0; k < lista.length; k++) if (lista[k].slug === slug) return lista[k]; return null; }
  function cartao(i) {
    var novo = /^CS-/.test(i.codigo);
    return h('li', null, h('article', { class: 'cs-card' }, h('a', { class: 'cs-card-link', href: link(i), 'data-slug': i.slug },
      h('div', { class: 'cs-card-foto' }, h('img', { src: capa(i), alt: i.titulo, loading: 'lazy', width: '960', height: '600' }),
        novo ? h('span', { class: 'cs-card-selo novo' }, 'Novo') : i.badge_destaque ? h('span', { class: 'cs-card-selo' }, i.badge_destaque) : null),
      h('div', { class: 'cs-card-corpo' }, h('span', { class: 'cs-tag' }, DESTINOS[i.destino_slug] || ''), h('h3', { class: 'cs-card-titulo' }, i.titulo_card || i.titulo),
        h('p', { class: 'cs-local' }, [i.bairro, i.cidade].filter(Boolean).join(', ')), h('p', { class: 'cs-preco' }, preco(i)),
        h('p', { class: 'cs-det' }, detalhes(i).map(function (t) { return h('span', null, t); }))))));
  }

  // ---------------------------------------------------------------- vitrine
  if (pagina === 'vitrine') {
    S.marcar('viu_site');
    var alvo = $('#vitrine');
    $('#ultima').textContent = site.gerado_em ? 'Última publicação: ' + S.dataHora(site.gerado_em) + '.' : 'O site ainda não foi publicado.';
    var pend = db.imoveis.filter(function (i) { return i.updated_at > (site.gerado_em || ''); }).length;
    if (pend) alvo.appendChild(h('p', { class: 'cs-pendente', role: 'note' }, pend === 1 ? 'Há 1 alteração no painel que ainda não está no site. No painel, clique em “Publicar no site” para ela aparecer aqui.' : 'Há ' + pend + ' alterações no painel que ainda não estão no site. No painel, clique em “Publicar no site” para elas aparecerem aqui.'));
    [['venda', 'Imóveis à venda'], ['aluguel', 'Para alugar'], ['temporada', 'Casas de temporada']].forEach(function (g) {
      var lista = site.imoveis.filter(function (i) { return i.tipo_negocio === g[0]; });
      alvo.appendChild(h('h2', { class: 'cs-h2', id: g[0] }, g[1]));
      if (!lista.length) { alvo.appendChild(h('p', { class: 'cs-vazio' }, 'Nenhum imóvel publicado nesta categoria ainda.')); return; }
      alvo.appendChild(h.apply(null, ['ul', { class: 'cs-grade', 'data-grupo': g[0] }].concat(lista.map(cartao))));
    });
    return;
  }

  // ---------------------------------------------------------------- pagina do imovel de venda / aluguel
  var slug = new URLSearchParams(location.search).get('slug');
  if (pagina === 'imovel') {
    var i = achar(slug, site.imoveis), box = $('#imovel');
    if (!i) { box.appendChild(h('p', { class: 'cs-vazio' }, 'Este imóvel não está no site. Se acabou de criar, publique no painel primeiro.')); return; }
    document.title = i.titulo + ' | Cassiano Imóveis (prévia)';
    $('#migalha').textContent = i.titulo;
    var fotos = (i.fotos.length ? i.fotos : ['img/demo-casa-1.webp']).slice(0, 3).map(S.resolverFoto);
    box.appendChild(h.apply(null, ['div', { class: 'cs-im-galeria' + (fotos.length === 1 ? ' uma' : '') }].concat(fotos.map(function (f, k) { return h('img', { src: f, alt: k ? 'Foto ' + (k + 1) + ' de ' + i.titulo : 'Foto de ' + i.titulo, width: '960', height: '600' }); }))));
    box.appendChild(h('span', { class: 'cs-tag' }, (DESTINOS[i.destino_slug] || '') + ' · ' + i.codigo));
    box.appendChild(h('h1', { class: 'cs-im-titulo' }, i.titulo));
    box.appendChild(h('p', { class: 'cs-local' }, [i.bairro, i.cidade, i.uf].filter(Boolean).join(', ')));
    box.appendChild(h('p', { class: 'cs-preco' }, (i.preco_label ? i.preco_label + ': ' : '') + preco(i)));
    var esp = json(i.especificacoes_json, []);
    if (esp.length) box.appendChild(h.apply(null, ['ul', { class: 'cs-specs' }].concat(esp.map(function (e) { return h('li', null, h('span', { class: 'fa ' + e.icone, 'aria-hidden': 'true' }), h('small', null, e.titulo), h('strong', null, e.valor)); }))));
    var ps = paragrafos(i.descricao_html);
    if (ps.length) { box.appendChild(h('h2', { class: 'cs-h2' }, 'Sobre o imóvel')); ps.forEach(function (p) { box.appendChild(h('p', null, p)); }); }
    var dif = json(i.diferenciais_json, []);
    if (dif.length) { box.appendChild(h('h2', { class: 'cs-h2' }, 'Destaques e diferenciais')); box.appendChild(h.apply(null, ['ul', { class: 'cs-lista' }].concat(dif.map(function (d) { return h('li', null, h('span', { class: 'fa fa-check', 'aria-hidden': 'true' }), d); })))); }
    return;
  }

  // ---------------------------------------------------------------- casa de temporada + motor de reservas
  if (pagina !== 'casa') return;
  var casas = site.imoveis.filter(function (x) { return x.tipo_negocio === 'temporada'; });
  var casa = achar(slug, casas) || casas[0];
  var raiz = $('#casa');
  if (!casa) { raiz.appendChild(h('p', { class: 'cassiano-casa-aviso' }, 'Nenhuma casa de temporada publicada no site.')); return; }
  document.title = casa.titulo + ' | Temporada | Cassiano Imóveis (prévia)';
  $('#migalha').textContent = casa.titulo;
  var noitesTxt = function (n) { return n + ' ' + (n === 1 ? 'noite' : 'noites'); };
  var fotosC = (casa.fotos.length ? casa.fotos : ['img/demo-temporada.webp']).slice(0, 3).map(S.resolverFoto);
  var principal = h('main', { class: 'cassiano-casa-principal' });
  var lateral = h('aside', { class: 'cassiano-casa-lateral', 'aria-label': 'Reserva' });
  raiz.appendChild(h('p', { class: 'cassiano-casa-aviso', role: 'note' }, 'Esta é uma casa de exemplo, usada apenas para demonstrar a página e o calendário. As informações não são de uma casa real.'));
  raiz.appendChild(h.apply(null, ['div', { class: 'cassiano-casa-galeria cassiano-casa-galeria--' + fotosC.length }].concat(fotosC.map(function (f, k) { return h('img', { src: f, alt: k ? 'Foto ' + (k + 1) + ' de ' + casa.titulo : 'Foto de ' + casa.titulo, loading: k ? 'lazy' : 'eager' }); }))));
  raiz.appendChild(h('div', { class: 'cassiano-casa-layout' }, principal, lateral));
  principal.appendChild(h('p', { class: 'cassiano-casa-local' }, h('i', { class: 'fa fa-map-marker', 'aria-hidden': 'true' }), ' ' + (DESTINOS[casa.destino_slug] || '') + ' - ' + (casa.uf || 'BA')));
  principal.appendChild(h('h1', { class: 'cassiano-casa-titulo' }, casa.titulo, h('span', { class: 'cassiano-casa-selo' }, 'Exemplo')));
  principal.appendChild(h('ul', { class: 'cassiano-casa-icones', 'aria-label': 'Capacidade da casa' },
    h('li', null, h('i', { class: 'fa fa-users', 'aria-hidden': 'true' }), ' ', h('strong', null, String(casa.capacidade_hospedes || 2)), ' hóspedes'),
    h('li', null, h('i', { class: 'fa fa-bed', 'aria-hidden': 'true' }), ' ', h('strong', null, String(casa.quartos || 1)), casa.quartos === 1 ? ' quarto' : ' quartos'),
    h('li', null, h('i', { class: 'fa fa-bath', 'aria-hidden': 'true' }), ' ', h('strong', null, String(casa.banheiros || 1)), casa.banheiros === 1 ? ' banheiro' : ' banheiros'),
    h('li', null, h('i', { class: 'fa fa-calendar', 'aria-hidden': 'true' }), ' Estadia mínima: ', h('strong', null, noitesTxt(casa.minimo_noites || 1)))));
  principal.appendChild(h('section', { 'aria-labelledby': 'h-sobre' }, h('h2', { id: 'h-sobre', class: 'cassiano-casa-h2' }, 'Sobre a casa'), paragrafos(casa.descricao_html).map(function (p) { return h('p', null, p); })));
  principal.appendChild(h('section', { 'aria-labelledby': 'h-comodidades' }, h('h2', { id: 'h-comodidades', class: 'cassiano-casa-h2' }, 'Comodidades'),
    h.apply(null, ['ul', { class: 'cassiano-casa-lista' }].concat(json(casa.diferenciais_json, []).map(function (c) { return h('li', null, h('i', { class: 'fa fa-check', 'aria-hidden': 'true' }), ' ' + c); })))));
  var regras = [];
  if (casa.checkin_hora) regras.push('Entrada a partir das ' + casa.checkin_hora.replace(':00', 'h'));
  if (casa.checkout_hora) regras.push('Saída até as ' + casa.checkout_hora.replace(':00', 'h'));
  regras.push('Animais sob consulta');
  principal.appendChild(h('section', { 'aria-labelledby': 'h-regras' }, h('h2', { id: 'h-regras', class: 'cassiano-casa-h2' }, 'Regras da casa'),
    h.apply(null, ['ul', { class: 'cassiano-casa-lista' }].concat(regras.map(function (r) { return h('li', null, h('i', { class: 'fa fa-info-circle', 'aria-hidden': 'true' }), ' ' + r); })))));
  if (casas.length > 1) {
    var outras = h('p', null, 'Outras casas: ');
    casas.filter(function (c) { return c.slug !== casa.slug; }).forEach(function (c, k) { if (k) outras.appendChild(document.createTextNode(' · ')); outras.appendChild(h('a', { href: 'casa.html?slug=' + encodeURIComponent(c.slug) }, c.titulo)); });
    principal.appendChild(outras);
  }
  principal.appendChild(h('p', null, h('a', { href: 'index.html#temporada', class: 'cassiano-casa-voltar' }, '← Ver todas as casas de temporada')));

  // ---- motor (mesma marcacao do MotorReserva.astro; o botao do WhatsApp vira pre-reserva do "motor do site")
  var hoje = S.hojeIso(), maxH = casa.capacidade_hospedes || 2;
  var sel = { entrada: null, saida: null }, inicioMes = hoje.slice(0, 8) + '01', temporadas = (db.precos[casa.id] || []), minimoCasa = casa.minimo_noites || 1, L = null;
  var motor = h('section', { class: 'motor-reserva', id: 'reservar', 'aria-labelledby': 'mr-titulo', 'data-motor-reserva': true });
  var elEntrada = h('strong', { 'data-mr': 'entrada' }, 'Escolha a data'), elSaida = h('strong', { 'data-mr': 'saida' }, 'Escolha a data');
  var ant = h('button', { type: 'button', class: 'mr-nav-btn', 'data-mr': 'anterior', 'aria-label': 'Mês anterior' }, '‹'), prox = h('button', { type: 'button', class: 'mr-nav-btn', 'data-mr': 'proximo', 'aria-label': 'Próximo mês' }, '›');
  var meses = h('div', { class: 'mr-meses', 'data-mr': 'meses' });
  var aviso = h('p', { class: 'mr-aviso', 'data-mr': 'aviso', role: 'status', 'aria-live': 'polite' });
  var hosp = h('select', { id: 'mr-hospedes', 'data-mr': 'hospedes', class: 'mr-select' });
  for (var n = 1; n <= maxH; n++) { var op = h('option', { value: String(n) }, n + (n === 1 ? ' hóspede' : ' hóspedes')); if (n === Math.min(2, maxH)) op.selected = true; hosp.appendChild(op); }
  var nome = h('input', { id: 'mr-nome', class: 'mr-input', type: 'text', maxlength: '60', autocomplete: 'off', placeholder: 'Ex.: Visitante Exemplo' });
  var resumo = h('p', { class: 'mr-resumo', 'data-mr': 'resumo', 'aria-live': 'polite' }, 'Escolha a entrada e a saída.');
  var reservar = h('button', { type: 'button', class: 'mr-reservar', 'data-mr': 'reservar', 'aria-disabled': 'true' }, h('i', { class: 'fa fa-calendar-check-o', 'aria-hidden': 'true' }), ' Fazer pré-reserva');
  var limpar = h('button', { type: 'button', class: 'mr-limpar', 'data-mr': 'limpar', hidden: true }, 'Limpar datas');
  var ok = h('div', { class: 'mr-ok', role: 'status', hidden: true });
  motor.appendChild(h('h2', { id: 'mr-titulo', class: 'mr-titulo' }, 'Reserve suas datas'));
  motor.appendChild(h('div', { class: 'mr-datas', 'aria-live': 'off' }, h('div', { class: 'mr-data-caixa' }, h('span', { class: 'mr-rotulo' }, 'Entrada'), elEntrada), h('div', { class: 'mr-data-caixa' }, h('span', { class: 'mr-rotulo' }, 'Saída'), elSaida)));
  motor.appendChild(h('div', { class: 'mr-nav' }, ant, prox));
  motor.appendChild(meses);
  motor.appendChild(h('ul', { class: 'mr-legenda', 'aria-label': 'Legenda do calendário' }, h('li', null, h('span', { class: 'mr-leg mr-leg-livre' }), ' Disponível'), h('li', null, h('span', { class: 'mr-leg mr-leg-ocupado' }), ' Ocupado'), h('li', null, h('span', { class: 'mr-leg mr-leg-sel' }), ' Selecionado')));
  motor.appendChild(aviso);
  motor.appendChild(h('div', { class: 'mr-campo' }, h('label', { for: 'mr-hospedes', class: 'mr-rotulo' }, 'Hóspedes'), hosp, h('span', { class: 'mr-ajuda' }, 'Máximo de ' + maxH + ' hóspedes · estadia mínima de ' + noitesTxt(minimoCasa))));
  motor.appendChild(h('div', { class: 'mr-campo' }, h('label', { for: 'mr-nome', class: 'mr-rotulo' }, 'Seu nome (pode ser fictício)'), nome));
  motor.appendChild(resumo); motor.appendChild(reservar); motor.appendChild(limpar); motor.appendChild(ok);
  motor.appendChild(h('p', { class: 'mr-nota' }, 'No site real, este botão abre o WhatsApp do corretor e a reserva só é confirmada depois da conversa. Aqui ele simula o motor de reservas do site: as datas ficam seguradas por 48 horas como pré-reserva, que aparece na agenda do painel.'));
  lateral.appendChild(motor);

  function ocupadas() {
    var agora = Date.now(), set = {};
    S.carregar().reservas.forEach(function (r) {
      if (r.imovel_id !== casa.id || r.estado === 'cancelado' || (r.estado === 'pre_reserva' && r.expira_em && Date.parse(r.expira_em) < agora)) return;
      for (var d = r.entrada; d < r.saida; d = S.addDias(d, 1)) set[d] = true;
    });
    return set;
  }
  var ocup = ocupadas();
  function minimo(entrada) { return L ? L.reservas.estadiaMinima({ entrada: entrada, minimoCasa: minimoCasa, temporadas: temporadas }) : minimoCasa; }
  function livreAte(entrada) { for (var d = entrada; ; d = S.addDias(d, 1)) { if (ocup[d] && d !== entrada) return d; if (S.noites(entrada, d) > 400) return d; } }
  function br(s) { return s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4); }
  function estado(d) {
    if (d < hoje) return 'passado';
    if (sel.entrada && d === sel.entrada) return 'entrada';
    if (sel.saida && d === sel.saida) return 'saida';
    if (sel.entrada && sel.saida && d > sel.entrada && d < sel.saida) return 'intervalo';
    if (sel.entrada && !sel.saida && d > sel.entrada) {
      var lim = livreAte(sel.entrada);
      if (d > lim) return 'indisponivel';
      if (S.noites(sel.entrada, d) < minimo(sel.entrada)) return 'minima';
      return 'livre';
    }
    return ocup[d] ? 'ocupado' : 'livre';
  }
  function desenhar() {
    while (meses.firstChild) meses.removeChild(meses.firstChild);
    for (var m = 0; m < 2; m++) {
      var a = Number(inicioMes.slice(0, 4)), mm = Number(inicioMes.slice(5, 7)) + m; if (mm > 12) { mm -= 12; a++; }
      var prim = a + '-' + String(mm).padStart(2, '0') + '-01', nd = new Date(Date.UTC(a, mm, 0)).getUTCDate(), dow = new Date(Date.UTC(a, mm - 1, 1)).getUTCDay();
      var grade = h('div', { class: 'mr-grade', role: 'grid', 'aria-label': MESES[mm - 1] + ' de ' + a });
      ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(function (x) { grade.appendChild(h('span', { class: 'mr-sem', 'aria-hidden': 'true' }, x)); });
      for (var k = 0; k < dow; k++) grade.appendChild(h('span', { class: 'mr-vazio' }));
      for (var dd = 1; dd <= nd; dd++) {
        var d = prim.slice(0, 8) + String(dd).padStart(2, '0'), e = estado(d);
        var rot = dd + ' de ' + MESES[mm - 1] + ({ ocupado: ', ocupado', passado: ', data passada', indisponivel: ', indisponível', entrada: ', entrada', saida: ', saída' }[e] || '');
        grade.appendChild(h('button', { type: 'button', class: 'mr-dia', 'data-dia': d, 'data-estado': e, 'data-hoje': d === hoje ? 'true' : null, 'aria-label': rot, 'aria-disabled': e === 'passado' || e === 'ocupado' || e === 'indisponivel' ? 'true' : null }, String(dd)));
      }
      meses.appendChild(h('div', { class: 'mr-mes' }, h('p', { class: 'mr-mes-titulo' }, MESES[mm - 1] + ' de ' + a), grade));
    }
    ant.disabled = inicioMes <= hoje.slice(0, 8) + '01';
    elEntrada.textContent = sel.entrada ? br(sel.entrada) : 'Escolha a data';
    elSaida.textContent = sel.saida ? br(sel.saida) : 'Escolha a data';
    limpar.hidden = !sel.entrada;
    var pronto = !!(sel.entrada && sel.saida);
    reservar.setAttribute('aria-disabled', pronto ? 'false' : 'true');
    if (pronto) {
      var nn = S.noites(sel.entrada, sel.saida), est = L ? L.reservas.calcularPreco({ entrada: sel.entrada, saida: sel.saida, diariaBase: casa.diaria_centavos, temporadas: temporadas }).total_centavos : null;
      resumo.textContent = noitesTxt(nn) + ' · ' + br(sel.entrada) + ' a ' + br(sel.saida) + (est ? ' · estimativa de R$ ' + reais(est) + ' (fictício)' : '');
    } else resumo.textContent = sel.entrada ? 'Agora escolha a saída.' : 'Escolha a entrada e a saída.';
  }
  meses.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-dia]'); if (!b) return;
    var d = b.getAttribute('data-dia'), e = b.getAttribute('data-estado');
    aviso.textContent = ''; ok.hidden = true;
    if (e === 'passado') { aviso.textContent = 'Essa data já passou.'; return; }
    if (!sel.entrada || sel.saida || d <= sel.entrada) {
      if (ocup[d]) { aviso.textContent = 'Essa noite já está ocupada. Escolha outra data de entrada.'; return; }
      sel = { entrada: d, saida: null };
    } else {
      if (e === 'indisponivel') { aviso.textContent = 'Há noites ocupadas entre as datas. Escolha uma saída antes delas.'; return; }
      var mn = minimo(sel.entrada);
      if (S.noites(sel.entrada, d) < mn) { aviso.textContent = 'A estadia mínima nessa época é de ' + noitesTxt(mn) + '.'; return; }
      sel.saida = d;
    }
    desenhar();
    var alvo = meses.querySelector('[data-dia="' + d + '"]'); if (alvo) alvo.focus({ preventScroll: true });
  });
  function mudarMes(delta) { var a = Number(inicioMes.slice(0, 4)), mm = Number(inicioMes.slice(5, 7)) + delta; if (mm < 1) { mm = 12; a--; } if (mm > 12) { mm = 1; a++; } inicioMes = a + '-' + String(mm).padStart(2, '0') + '-01'; desenhar(); }
  ant.addEventListener('click', function () { mudarMes(-1); });
  prox.addEventListener('click', function () { mudarMes(1); });
  limpar.addEventListener('click', function () { sel = { entrada: null, saida: null }; aviso.textContent = ''; desenhar(); });
  reservar.addEventListener('click', function () {
    if (reservar.getAttribute('aria-disabled') === 'true') { aviso.textContent = 'Escolha a entrada e a saída primeiro.'; return; }
    reservar.setAttribute('aria-disabled', 'true');
    S.preReservar({ imovel_id: casa.id, entrada: sel.entrada, saida: sel.saida, pessoas: Number(hosp.value), hospede_nome: nome.value.trim() || 'Visitante (demonstração)', notas: 'Pré-reserva feita pela página da casa (sandbox).' }).then(function (r) {
      if (r.status >= 300) {
        reservar.setAttribute('aria-disabled', 'false');
        aviso.textContent = r.status === 409 ? 'Essas datas acabaram de ser ocupadas. Escolha outras.' : (r.corpo.erros && (r.corpo.erros.saida || r.corpo.erros.entrada)) || 'Não foi possível fazer a pré-reserva. Tente de novo.';
        return;
      }
      var e0 = sel.entrada, s0 = sel.saida;
      ocup = ocupadas(); sel = { entrada: null, saida: null }; desenhar();
      while (ok.firstChild) ok.removeChild(ok.firstChild);
      var ver = h('button', { type: 'button', id: 'mr-ver-agenda' }, 'Ver na agenda do painel');
      ver.addEventListener('click', function () {
        if (window.parent !== window) window.parent.postMessage({ tipo: 'cassiano-sandbox:abrir', aba: 'painel', pagina: 'calendario.html' }, location.origin);
        else location.href = '../admin/calendario.html';
      });
      ok.appendChild(h('h3', null, 'Pré-reserva feita!'));
      ok.appendChild(h('p', null, br(e0) + ' a ' + br(s0) + ' · ' + noitesTxt(S.noites(e0, s0)) + (r.corpo.total_centavos ? ' · R$ ' + reais(r.corpo.total_centavos) + ' (fictício)' : '') + '. As datas ficam seguradas até ' + S.dataHora(r.corpo.expira_em) + '.'));
      ok.appendChild(ver);
      ok.hidden = false;
      ver.focus({ preventScroll: true });
    });
  });
  desenhar();
  S.libs().then(function (x) { L = x; desenhar(); });
})();
