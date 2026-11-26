/* Copia de demonstracao (sandbox do portfolio) do painel Cassiano Imoveis. Caminhos ajustados; a API e simulada por ../mock-api.js. */
/* Painel: Temporada > Agenda geral (todas as casas, no periodo escolhido). Dados de GET /api/admin/temporada/agenda; todo texto de usuario entra por textContent.
   Montada por calendario.js: AgendaGeral.iniciar({ admin: fn, hoje: 'AAAA-MM-DD' }) uma vez e AgendaGeral.mostrar() sempre que a lista de casas aparece. */
(function () {
  'use strict';
  var P = window.Painel, h = P.h;
  var $ = function (id) { return document.getElementById(id); };
  var MAX_DIAS = 366;
  var DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var DOW_LONGO = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  // origem tecnica -> nome na tela. 'indicacao' (valor do banco) entra no grupo "Direta".
  var ORIGENS = { direto: { nome: 'Direta', letra: 'D' }, airbnb: { nome: 'Airbnb', letra: 'A' }, booking: { nome: 'Booking', letra: 'B' }, site: { nome: 'Motor de reservas do site', curto: 'Site', letra: 'S' } };
  var TIPOS = { alugado: 'Alugado', pre_reserva: 'Pré-reserva', bloqueio_dono: 'Bloqueio', manutencao: 'Manutenção' };
  var opcoes = { admin: function () { return false; }, hoje: new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10) };
  var iniciado = false, de = '', ate = '', dados = null, pedido = 0, filtro = { direto: true, airbnb: true, booking: true, site: true }, minNoites = 1, modelo = null, ultimoFoco = null;

  var pad = function (n) { return String(n).padStart(2, '0'); };
  var iso = function (a, m, d) { return a + '-' + pad(m) + '-' + pad(d); };
  function utc(s) { return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)); }
  function addDias(s, n) { return new Date(utc(s) + n * 86400000).toISOString().slice(0, 10); }
  function noites(a, b) { return Math.round((utc(b) - utc(a)) / 86400000); }
  var br = function (s) { return s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : ''; };
  var brCurto = function (s) { return s.slice(8, 10) + '/' + s.slice(5, 7); };
  var plural = function (n, a, b) { return n + ' ' + (n === 1 ? a : b); };
  function grupo(o) { return o === 'indicacao' ? 'direto' : (ORIGENS[o] ? o : 'direto'); }
  function tipoDe(r) { return r.tipo || r.estado; }
  function cancelada(r) { return r.estado === 'cancelada' || r.estado === 'cancelado'; }
  function ehPlataforma(r) { return grupo(r.origem) === 'airbnb' || grupo(r.origem) === 'booking'; }
  function filtrada(r) { var t = tipoDe(r); return (t === 'alugado' || t === 'pre_reserva') && filtro[grupo(r.origem)] === false; }
  function filtroAtivo() { return Object.keys(filtro).some(function (k) { return filtro[k] === false; }); }
  function nomeCurtoOrigem(g) { return ORIGENS[g].curto || ORIGENS[g].nome; }

  // ---------------------------------------------------------------- periodo
  function validarPeriodo(a, b) {
    if (!a || !b) return 'Escolha a data inicial e a data final.';
    if (a.slice(0, 4) < '2000' || b.slice(0, 4) > '2100') return 'Confira o ano das datas.';
    if (b < a) return 'A data final precisa ser igual ou depois da inicial.';
    var n = noites(a, b) + 1;
    if (n > MAX_DIAS) return 'Escolha no máximo ' + MAX_DIAS + ' dias. Você marcou ' + n + ' dias.';
    return null;
  }
  function ultimoDia(a, m) { return new Date(Date.UTC(a, m, 0)).getUTCDate(); }
  function periodoDoAtalho(nome) {
    var hj = opcoes.hoje, a = Number(hj.slice(0, 4)), m = Number(hj.slice(5, 7));
    if (nome === 'mes') return [iso(a, m, 1), iso(a, m, ultimoDia(a, m))];
    if (nome === 'proximo') { var m2 = m === 12 ? 1 : m + 1, a2 = m === 12 ? a + 1 : a; return [iso(a2, m2, 1), iso(a2, m2, ultimoDia(a2, m2))]; }
    if (nome === '30') return [hj, addDias(hj, 29)];
    if (nome === '90') return [hj, addDias(hj, 89)];
    return [iso(a, 1, 1), iso(a, 12, 31)];
  }
  function marcarAtalho() {
    Array.prototype.forEach.call(document.querySelectorAll('#agenda-atalhos [data-atalho]'), function (b) {
      var p = periodoDoAtalho(b.getAttribute('data-atalho'));
      b.setAttribute('aria-pressed', String(p[0] === de && p[1] === ate));
    });
  }
  function aplicarPeriodo(a, b) {
    var erro = validarPeriodo(a, b), e = $('agenda-erro-periodo');
    e.textContent = erro || '';
    $('agenda-de').setAttribute('aria-invalid', String(!!erro)); $('agenda-ate').setAttribute('aria-invalid', String(!!erro));
    if (erro) return false;
    de = a; ate = b; $('agenda-de').value = de; $('agenda-ate').value = ate;
    marcarAtalho(); atualizarExportacao(); carregar();
    return true;
  }
  function atualizarExportacao() {
    var admin = !!opcoes.admin();
    $('agenda-exportar').hidden = !admin;
    if (!admin) return;
    var base = '/api/admin/reservas/exportar-agenda?de=' + de + '&ate=' + ate + '&formato=';
    $('agenda-xlsx').href = base + 'xlsx'; $('agenda-csv').href = base + 'csv';
  }

  // ---------------------------------------------------------------- dados -> modelo (respeita o filtro de origem)
  function calcular(d) {
    var dias = d.dias || [], n = dias.length, d0 = n ? dias[0].data : d.de;
    var livresPorDia = [], i;
    for (i = 0; i < n; i++) livresPorDia.push(0);
    var casas = (d.casas || []).map(function (c) {
      var cobre = [], faixas = [], livres = [], k;
      for (i = 0; i < n; i++) cobre.push([]);
      (c.reservas || []).forEach(function (r) {
        if (cancelada(r) || filtrada(r)) return;
        var a = Math.max(0, noites(d0, r.entrada)), b = Math.min(n, noites(d0, r.saida));
        for (k = a; k < b; k++) cobre[k].push(r);
      });
      i = 0;
      while (i < n) {
        var chave = cobre[i].map(function (r) { return r.id; }).join(','), j = i + 1;
        while (j < n && cobre[j].map(function (r) { return r.id; }).join(',') === chave) j++;
        faixas.push({ i0: i, n: j - i, rs: cobre[i] });
        if (!cobre[i].length) { livres.push({ de: dias[i].data, ate: addDias(dias[j - 1].data, 1), noites: j - i }); for (k = i; k < j; k++) livresPorDia[k]++; }
        i = j;
      }
      return { c: c, faixas: faixas, livres: livres };
    });
    var total = casas.length * n, livresTotal = livresPorDia.reduce(function (s, x) { return s + x; }, 0);
    return { dias: dias, casas: casas, livresPorDia: livresPorDia, resumo: { casas: casas.length, noites_livres: livresTotal, noites_ocupadas: total - livresTotal, ocupacao_percentual: total ? Math.round((total - livresTotal) / total * 1000) / 10 : 0 } };
  }

  // ---------------------------------------------------------------- tabela
  function classeFaixa(f) {
    var r = f.rs[0];
    if (f.rs.length > 1) return 't-conflito';
    var t = tipoDe(r), g = grupo(r.origem);
    if (t === 'bloqueio_dono') return 't-bloqueio' + (ehPlataforma(r) ? ' canal' : '');
    if (t === 'manutencao') return 't-manutencao';
    return 't-' + t + ' o-' + g;
  }
  function descricao(r, g) {
    var t = tipoDe(r), o = ORIGENS[g] ? ORIGENS[g].nome : '';
    if (t === 'bloqueio_dono') return ehPlataforma(r) ? 'bloqueio do canal ' + ORIGENS[g].nome : 'bloqueio';
    if (t === 'manutencao') return 'manutenção';
    return (t === 'pre_reserva' ? 'pré-reserva ' : 'ocupado por ') + o + (r.hospede ? ', hóspede ' + r.hospede : '');
  }
  function textoFaixa(f) {
    if (f.rs.length > 1) return 'Conflito: ' + f.rs.map(function (r) { return r.hospede || TIPOS[tipoDe(r)] || 'reserva'; }).join(' e ');
    var r = f.rs[0], t = tipoDe(r);
    if (t === 'pre_reserva') return 'Pré · ' + (r.hospede || ORIGENS[grupo(r.origem)].nome);
    if (t === 'bloqueio_dono') return r.hospede || (ehPlataforma(r) ? 'Bloqueio do canal' : 'Bloqueio');
    if (t === 'manutencao') return r.hospede || 'Manutenção';
    return r.hospede || ORIGENS[grupo(r.origem)].nome;
  }
  function iconeFaixa(f) {
    if (f.rs.length > 1) return '!';
    var r = f.rs[0], t = tipoDe(r);
    if (t === 'bloqueio_dono') return 'B'; if (t === 'manutencao') return 'M';
    return ORIGENS[grupo(r.origem)].letra;
  }
  function rotuloFaixa(c, f) {
    if (f.rs.length > 1) return 'Casa ' + c.titulo + ': conflito, reservas sobrepostas (' + f.rs.map(function (r) { return brCurto(r.entrada) + ' a ' + brCurto(r.saida) + (r.hospede ? ', ' + r.hospede : ''); }).join('; ') + '). Abrir detalhes';
    var r = f.rs[0];
    return 'Casa ' + c.titulo + ', de ' + brCurto(r.entrada) + ' a ' + brCurto(r.saida) + ' (' + plural(r.noites != null ? r.noites : noites(r.entrada, r.saida), 'noite', 'noites') + '): ' + descricao(r, grupo(r.origem)) + '. Abrir detalhes';
  }

  /** Uma tabela para os dias [ini, fim) do modelo. impressao=true: sem botoes/links (so texto). */
  function montarTabela(m, ini, fim, impressao) {
    var dias = m.dias, hoje = opcoes.hoje;
    var cab1 = h('tr'), cab2 = h('tr'), k, i;
    cab1.appendChild(h('th', { class: 'ag-canto', scope: 'col', rowspan: '2' }, 'Propriedade'));
    var mesAtual = null, th = null, cont = 0;
    for (i = ini; i < fim; i++) {
      var d = dias[i], ym = d.data.slice(0, 7);
      if (ym !== mesAtual) { if (th) th.setAttribute('colspan', String(cont)); mesAtual = ym; cont = 0; th = h('th', { class: 'ag-mes', scope: 'colgroup' }, MESES[Number(ym.slice(5, 7)) - 1].replace(/^./, function (x) { return x.toUpperCase(); }) + ' de ' + ym.slice(0, 4)); cab1.appendChild(th); }
      cont++;
      var dw = typeof d.dow === 'number' ? d.dow : new Date(utc(d.data)).getUTCDay();
      cab2.appendChild(h('th', { scope: 'col', class: 'ag-dia' + (d.fim_de_semana ? ' fds' : '') + (d.data === hoje ? ' hoje' : '') + (d.feriado ? ' feriado' : ''), title: d.feriado || null, 'aria-label': DOW_LONGO[dw] + ', ' + brCurto(d.data) + (d.data === hoje ? ', hoje' : '') + (d.feriado ? ', feriado: ' + d.feriado : '') },
        h('span', { class: 'dd', 'aria-hidden': 'true' }, brCurto(d.data)), h('span', { class: 'sem', 'aria-hidden': 'true' }, DOW[dw])));
    }
    if (th) th.setAttribute('colspan', String(cont));
    var corpo = h('tbody');
    m.casas.forEach(function (x) {
      var c = x.c, tr = h('tr');
      var interno = [h('span', { class: 'nm' }, c.titulo), h('small', null, 'Unidade: ' + (c.unidade || 'Casa inteira'))];
      var cabLinha = impressao ? h.apply(null, ['span', { class: 'casa-nome' }].concat(interno)) : h.apply(null, ['a', { class: 'casa-nome', href: '#/casa/' + c.id, title: c.codigo + ' · ' + c.titulo, 'aria-label': 'Casa ' + c.titulo + ' (' + c.codigo + '). Abrir o painel da casa' }].concat(interno));
      tr.appendChild(h('th', { scope: 'row', class: 'ag-casa' }, cabLinha));
      x.faixas.forEach(function (f) {
        var a = Math.max(f.i0, ini), b = Math.min(f.i0 + f.n, fim);
        if (b <= a) return;
        if (!f.rs.length) {
          for (k = a; k < b; k++) { var dk = dias[k]; tr.appendChild(h('td', { class: 'ag-livre' + (dk.fim_de_semana ? ' fds' : '') + (dk.data === hoje ? ' hoje' : '') }, h('span', { class: 'so-leitor-a' }, 'livre'))); }
          return;
        }
        var r = f.rs[0], ini2 = dias[a].data, fimDia = addDias(dias[b - 1].data, 1);
        var cls = 'ag-faixa ' + classeFaixa(f) + (f.rs.some(function (q) { return q.entrada < ini2; }) ? ' cont-esq' : '') + (f.rs.some(function (q) { return q.saida > fimDia; }) ? ' cont-dir' : '');
        var interior = [h('span', { class: 'ico', 'aria-hidden': 'true' }, iconeFaixa(f)), h('span', { class: 'txt' }, textoFaixa(f))];
        var td = h('td', { colspan: String(b - a), class: 'ag-celula-faixa' });
        if (impressao) td.appendChild(h.apply(null, ['span', { class: cls }].concat(interior)));
        else td.appendChild(h.apply(null, ['button', { type: 'button', class: cls, 'data-agenda-casa': String(c.id), 'data-agenda-reserva': String(r.id), 'data-n': String(f.rs.length), title: textoFaixa(f), 'aria-label': rotuloFaixa(c, f) }].concat(interior)));
        tr.appendChild(td);
      });
      corpo.appendChild(tr);
    });
    var rodape = h('tr', { class: 'ag-livres' }, h('th', { scope: 'row', class: 'ag-casa' }, 'Unidades livres', filtroAtivo() ? h('small', null, 'com o filtro de origem') : null));
    for (i = ini; i < fim; i++) rodape.appendChild(h('td', { class: 'ag-un' + (m.livresPorDia[i] === 0 ? ' zero' : '') + (dias[i].fim_de_semana ? ' fds' : '') + (dias[i].data === hoje ? ' hoje' : '') }, String(m.livresPorDia[i])));
    var t = h('table', { class: 'ag-tabela' + (impressao ? ' imp' : '') }, h('caption', { class: 'so-leitor-a' }, 'Agenda geral de ' + br(dias[ini].data) + ' a ' + br(dias[fim - 1].data) + '. Cada linha é uma casa e cada coluna é um dia.'),
      h('thead', null, cab1, cab2), corpo, h('tfoot', null, rodape));
    return t;
  }

  // ---------------------------------------------------------------- desenho
  function resumoTexto(r) {
    return plural(r.casas, 'casa', 'casas') + ' · ' + plural(r.noites_livres, 'noite livre', 'noites livres') + ' · ' + plural(r.noites_ocupadas, 'noite ocupada', 'noites ocupadas') + ' · ocupação de ' + String(r.ocupacao_percentual).replace('.', ',') + '%';
  }
  function desenhar() {
    if (!dados) return;
    modelo = calcular(dados);
    var tela = $('agenda-tela'), n = modelo.dias.length;
    P.limpar(tela); P.limpar($('agenda-impressao'));
    $('agenda-carregando').hidden = true; $('agenda-erro').hidden = true;
    if (!modelo.casas.length || !n) { tela.hidden = true; $('agenda-resumo').textContent = 'Nenhuma casa de temporada para mostrar neste período.'; desenharLivres(); return; }
    tela.hidden = false;
    tela.appendChild(montarTabela(modelo, 0, n, false));
    $('agenda-resumo').textContent = resumoTexto(modelo.resumo);
    // impressao: paginas de no maximo 31 dias, de tamanho parecido
    var paginas = Math.ceil(n / 31), tam = Math.ceil(n / paginas), imp = $('agenda-impressao');
    for (var p = 0; p < paginas; p++) imp.appendChild(h('div', { class: 'ag-pagina' }, montarTabela(modelo, p * tam, Math.min(n, (p + 1) * tam), true), h('p', { class: 'ag-rodape' })));
    var titulo = 'Agenda geral · ' + br(dados.de || de) + ' a ' + br(dados.ate || ate);
    $('agenda-titulo-print').textContent = titulo;
    rodape(dados.gerado_em);
    desenharLivres(); atualizarOrigens(); atualizarAviso();
    if (n > 31) { var hojeTh = tela.querySelector('th.hoje'); if (hojeTh) tela.scrollLeft = Math.max(0, hojeTh.offsetLeft - 140); }
  }
  function rodape(g) { Array.prototype.forEach.call(document.querySelectorAll('.ag-rodape'), function (p) { p.textContent = 'Cassiano Imóveis · Temporada · Gerada em ' + agoraTexto(g); }); }
  function agoraTexto(g) {
    var t = g ? Date.parse(g) : NaN; if (t !== t) t = Date.now();
    var s = new Date(t - 3 * 3600000).toISOString();   // horario da Bahia (UTC-3, sem horario de verao)
    return br(s.slice(0, 10)) + ' ' + s.slice(11, 16);
  }
  function atualizarOrigens() {
    var cont = { direto: 0, airbnb: 0, booking: 0, site: 0 };
    (dados.casas || []).forEach(function (c) { (c.reservas || []).forEach(function (r) { var t = tipoDe(r); if (!cancelada(r) && (t === 'alugado' || t === 'pre_reserva')) cont[grupo(r.origem)]++; }); });
    Array.prototype.forEach.call(document.querySelectorAll('#agenda-origens [data-origem]'), function (b) {
      var g = b.getAttribute('data-origem');
      b.setAttribute('aria-pressed', String(filtro[g] !== false));
      b.querySelector('.conta').textContent = String(cont[g]);
      b.setAttribute('aria-label', nomeCurtoOrigem(g) + ': ' + plural(cont[g], 'reserva', 'reservas') + (filtro[g] === false ? ', oculta' : ', visível'));
    });
  }
  function atualizarAviso() {
    var off = Object.keys(filtro).filter(function (k) { return filtro[k] === false; }).map(nomeCurtoOrigem);
    var el = $('agenda-aviso-filtro'); el.hidden = !off.length;
    $('agenda-aviso-filtro-texto').textContent = off.length ? 'Filtro ativo: reservas de ' + off.join(', ') + ' ocultas. Esses dias aparecem como livres aqui, mas podem estar ocupados.' : '';
  }

  // ---------------------------------------------------------------- periodos livres
  function desenharLivres() {
    var box = $('agenda-livres-lista'); P.limpar(box);
    if (!modelo) return;
    var algum = false;
    modelo.casas.forEach(function (x) {
      var itens = x.livres.filter(function (l) { return l.noites >= minNoites; });
      var ul = h('ul', { class: 'ag-livres-itens' });
      itens.forEach(function (l) { ul.appendChild(h('li', null, 'de ' + brCurto(l.de) + ' até ' + brCurto(l.ate) + ' · ' + plural(l.noites, 'noite', 'noites'))); });
      if (!itens.length) ul.appendChild(h('li', { class: 'vazio-li' }, minNoites > 1 ? 'Nenhum período livre de ' + minNoites + ' noites ou mais.' : 'Sem datas livres neste período.'));
      else algum = true;
      box.appendChild(h('section', { class: 'ag-livres-casa' }, h('h4', null, h('a', { href: '#/casa/' + x.c.id }, x.c.titulo), ' ', h('small', null, x.c.codigo)), ul));
    });
    $('agenda-livres-vazio').hidden = algum || !modelo.casas.length;
  }

  // ---------------------------------------------------------------- carregar
  function carregar() {
    var meu = ++pedido;
    $('agenda-carregando').hidden = false; $('agenda-erro').hidden = true; $('agenda-tela').setAttribute('aria-busy', 'true');
    P.api('temporada/agenda?de=' + de + '&ate=' + ate).then(function (r) {
      if (meu !== pedido) return;   // outro periodo foi pedido enquanto este carregava
      $('agenda-tela').setAttribute('aria-busy', 'false'); $('agenda-carregando').hidden = true;
      if (!r.ok) { $('agenda-erro-texto').textContent = P.mensagemDeErro(r); $('agenda-erro').hidden = false; return; }
      dados = r.dados; desenhar();
    });
  }

  // ---------------------------------------------------------------- detalhe da reserva
  function achar(casaId, reservaId) {
    var cs = (dados && dados.casas) || [];
    for (var i = 0; i < cs.length; i++) if (String(cs[i].id) === casaId) for (var j = 0; j < cs[i].reservas.length; j++) if (String(cs[i].reservas[j].id) === reservaId) return { c: cs[i], r: cs[i].reservas[j] };
    return null;
  }
  function abrirDetalhe(botao) {
    var x = achar(botao.getAttribute('data-agenda-casa'), botao.getAttribute('data-agenda-reserva')); if (!x) return;
    ultimoFoco = botao;
    var c = x.c, r = x.r, t = tipoDe(r), g = grupo(r.origem), f = $('agenda-folha'); P.limpar(f);
    var n = r.noites != null ? r.noites : noites(r.entrada, r.saida);
    var linhas = [['Casa', c.codigo + ' · ' + c.titulo], ['Entrada', br(r.entrada)], ['Saída', br(r.saida) + ' (o dia fica livre)'], ['Noites', String(n)], ['Tipo', TIPOS[t] || t]];
    if (t === 'alugado' || t === 'pre_reserva' || ehPlataforma(r)) linhas.push(['Origem', ORIGENS[g].nome + (r.origem === 'indicacao' ? ' (indicação)' : '')]);
    if (r.hospede) linhas.push(['Hóspede', r.hospede]);
    // SANDBOX: validade da pre-reserva (no sistema real, 48 h; campo reserva.expira_em).
    if (t === 'pre_reserva' && r.expira_em) linhas.push(['Validade', 'até ' + window.SandboxCassiano.dataHora(r.expira_em)]);
    var dl = h('dl', { class: 'ag-detalhe' });
    linhas.forEach(function (l) { dl.appendChild(h('dt', null, l[0])); dl.appendChild(h('dd', null, l[1])); });
    var abrir = h('a', { class: 'botao primario', href: '#/casa/' + c.id, id: 'agenda-abrir-casa' }, 'Abrir calendário da casa'), fechar = h('button', { class: 'botao', type: 'button' }, 'Fechar');
    abrir.addEventListener('click', function () { f.close(); });
    fechar.addEventListener('click', function () { f.close(); });
    f.appendChild(h('h2', { id: 'agenda-folha-titulo' }, 'Reserva de ' + brCurto(r.entrada) + ' a ' + brCurto(r.saida)));
    if (botao.getAttribute('data-n') !== '1') f.appendChild(h('p', { class: 'conflito', role: 'alert' }, 'Há reservas sobrepostas nestas datas. Abra o calendário da casa para corrigir.'));
    f.appendChild(dl); f.appendChild(h('div', { class: 'acoes' }, abrir, fechar));
    f.showModal(); fechar.focus();
  }
  $('agenda-folha').addEventListener('close', function () { if (ultimoFoco && document.body.contains(ultimoFoco)) ultimoFoco.focus(); });

  // ---------------------------------------------------------------- eventos
  $('agenda-tela').addEventListener('click', function (e) { var b = e.target.closest('button[data-agenda-reserva]'); if (b) abrirDetalhe(b); });
  $('agenda-de').addEventListener('change', function () { aplicarPeriodo($('agenda-de').value, $('agenda-ate').value); });
  $('agenda-ate').addEventListener('change', function () { aplicarPeriodo($('agenda-de').value, $('agenda-ate').value); });
  $('agenda-atalhos').addEventListener('click', function (e) { var b = e.target.closest('[data-atalho]'); if (!b) return; var p = periodoDoAtalho(b.getAttribute('data-atalho')); aplicarPeriodo(p[0], p[1]); });
  $('agenda-origens').addEventListener('click', function (e) { var b = e.target.closest('[data-origem]'); if (!b) return; var g = b.getAttribute('data-origem'); filtro[g] = filtro[g] === false; desenhar(); var novo = document.querySelector('#agenda-origens [data-origem="' + g + '"]'); if (novo) novo.focus(); });
  $('agenda-mostrar-tudo').addEventListener('click', function () { filtro = { direto: true, airbnb: true, booking: true, site: true }; desenhar(); });
  $('agenda-min-noites').addEventListener('input', function () { var v = Number($('agenda-min-noites').value); minNoites = v >= 1 && v <= MAX_DIAS ? Math.floor(v) : 1; desenharLivres(); });
  $('agenda-imprimir').addEventListener('click', function () { if (dados) rodape(null); window.print(); });
  $('agenda-erro-tentar').addEventListener('click', carregar);

  window.AgendaGeral = {
    iniciar: function (o) {
      opcoes = { admin: o.admin || opcoes.admin, hoje: o.hoje || opcoes.hoje };
      if (iniciado) return; iniciado = true;
      var p = periodoDoAtalho('mes'); $('agenda-de').value = p[0]; $('agenda-ate').value = p[1]; de = p[0]; ate = p[1];
      marcarAtalho(); atualizarExportacao();
    },
    /** Chamada sempre que a lista de casas aparece: recarrega (as reservas podem ter mudado no painel da casa). */
    mostrar: function () { if (!iniciado) return; atualizarExportacao(); carregar(); }
  };
})();
