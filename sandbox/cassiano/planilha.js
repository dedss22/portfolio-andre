/* Visualizador da planilha "Agenda geral" (sandbox). Desenha em HTML a mesma aba 1 que lib/agenda-xlsx.js grava no .xlsx
   (bloco por mes, linha por casa, reservas mescladas e coloridas por origem, "Unidades livres" e legenda) e gera o .xlsx de verdade
   no navegador com o gerador puro do servidor. Os dados vem do banco em memoria do sandbox. */
(function () {
  'use strict';
  var S = window.SandboxCassiano;
  var $ = function (id) { return document.getElementById(id); };
  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return; if (k === 'class') el.className = v; else if (k === 'style') el.setAttribute('style', v); else el.setAttribute(k, String(v)); });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null || c === false) continue; el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }
    return el;
  }
  var dias = 30, aba = 0, L = null, dados = null;
  var ABAS = [{ nome: 'Agenda geral', cor: '#0E4D5A' }, { nome: 'Períodos livres', cor: '#15805C' }, { nome: 'Reservas', cor: '#C94444' }];
  var br = function (s) { return s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4); };
  function letra(n) { var s = ''; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function reais(c) { if (c == null) return ''; var n = Math.round(Number(c)); return String(Math.floor(n / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + String(n % 100).padStart(2, '0'); }

  function periodo() { var de = S.hojeIso(); return { de: de, ate: S.addDias(de, dias - 1) }; }
  function carregar() {
    var p = periodo();
    dados = S.dadosAgenda(L, S.carregar(), p.de, p.ate, null);
    $('pl-arquivo').textContent = 'agenda-geral-' + p.de + '-a-' + p.ate + '.xlsx';
    desenhar();
    S.marcar('planilha');
  }

  /** Celula de texto: tambem mostra o conteudo na barra de formula ao passar ou focar. */
  function cel(tag, cls, texto, extra) {
    var a = Object.assign({ class: cls || null }, extra || {});
    var c = h(tag, a, texto == null ? '' : texto);
    if (texto) c.setAttribute('data-v', String(texto));
    return c;
  }
  function linha(tb, n, celulas) { var tr = h('tr', null, h('td', { class: 'rn' }, String(n))); celulas.forEach(function (c) { tr.appendChild(c); }); tb.appendChild(tr); }
  function cabecalho(nCols) { var tr = h('tr', null, h('th', { class: 'rn' }, '')); for (var c = 1; c <= nCols; c++) tr.appendChild(h('th', null, letra(c))); return h('thead', null, tr); }

  function aba1() {
    var X = L.agendaXlsx, CAT = X.CATEGORIAS, T = X.TEXTOS, agenda = dados.agenda;
    var blocos = [];
    agenda.dias.forEach(function (d) { var ym = d.data.slice(0, 7); if (!blocos.length || blocos[blocos.length - 1].ym !== ym) blocos.push({ ym: ym, dias: [] }); blocos[blocos.length - 1].dias.push(d); });
    var maxDias = Math.max.apply(null, blocos.map(function (b) { return b.dias.length; })), nCols = 2 + maxDias;
    var tab = h('table', { class: 'xl-tab' }), tb = h('tbody'); tab.appendChild(cabecalho(nCols)); tab.appendChild(tb);
    var n = 1;
    function texto(r) {
      if (r.estado === 'pre_reserva') return r.hospede ? T.rotulos.pre + ' · ' + r.hospede : T.rotulos.pre;
      if (r.estado === 'manutencao') return T.rotulos.manutencao;
      if (r.estado === 'bloqueio_dono') return X.categoriaDe(r) === 'canal' ? T.rotulos.canal : T.rotulos.bloqueio;
      return r.hospede || T.rotulos.reserva;
    }
    blocos.forEach(function (b) {
      var d0 = b.dias[0].data, d1 = b.dias[b.dias.length - 1].data, ateEx = S.addDias(d1, 1), nb = b.dias.length;
      linha(tb, n++, [cel('td', 'c-titulo', T.titulo(d0, d1), { colspan: nCols })]);
      var c1 = [cel('td', 'c-cab', T.propriedade, { rowspan: 2 }), cel('td', 'c-cab', T.unidade, { rowspan: 2 })], c2 = [];
      b.dias.forEach(function (d) { c1.push(cel('td', 'c-cab c-dia', d.data.slice(8, 10) + '/' + d.data.slice(5, 7), { title: d.feriado || null })); c2.push(cel('td', 'c-cab' + (d.fim_de_semana ? ' fds' : ''), T.semana[d.dow])); });
      linha(tb, n++, c1); linha(tb, n++, c2);
      agenda.casas.forEach(function (casa) {
        var noite = new Array(nb).fill(null), cells = [cel('td', 'c-prop', casa.codigo + ' ' + casa.titulo, { title: casa.codigo + ' ' + casa.titulo }), cel('td', 'c-unid', casa.unidade)];
        casa.reservas.forEach(function (r) {
          var a = r.entrada > d0 ? r.entrada : d0, z = r.saida < ateEx ? r.saida : ateEx; if (z <= a) return;
          var i0 = S.noites(d0, a), i1 = S.noites(d0, z);
          for (var i = i0; i < i1; i++) noite[i] = noite[i] ? Object.assign({}, noite[i], { conflito: true }) : { r: r, cont: r.entrada < d0 && i === i0 };
        });
        for (var i = 0; i < nb;) {
          var x = noite[i];
          if (!x) { cells.push(cel('td', 'c-dia' + (b.dias[i].fim_de_semana ? ' fds' : ''), '')); i++; continue; }
          if (x.conflito) { cells.push(cel('td', 'c-res', T.rotulos.conflito, { style: 'background:' + CAT.conflito.fundo + ';color:' + CAT.conflito.texto })); i++; continue; }
          var j = i + 1; while (j < nb && noite[j] && !noite[j].conflito && noite[j].r.id === x.r.id) j++;
          var cat = CAT[X.categoriaDe(x.r)], tx = (x.cont ? T.continuacao : '') + texto(x.r);
          var dica = tx + ' · ' + br(x.r.entrada) + ' a ' + br(x.r.saida) + (x.r.estado === 'pre_reserva' && x.r.expira_em ? ' · válida até ' + S.dataHora(x.r.expira_em) : '');
          cells.push(cel('td', 'c-res', tx, { colspan: j - i, style: 'background:' + cat.fundo + ';color:' + cat.texto, title: dica, 'data-estado': x.r.estado, 'data-reserva': x.r.id }));
          i = j;
        }
        linha(tb, n++, cells);
      });
      var idx0 = S.noites(agenda.de, d0), cl = [cel('td', 'c-livres-rot', T.unidadesLivres, { colspan: 2 })];
      b.dias.forEach(function (_, i) { var v = agenda.livres_por_dia[idx0 + i]; cl.push(cel('td', 'c-livres' + (v === 0 ? ' zero' : ''), String(v))); });
      linha(tb, n++, cl);
      linha(tb, n++, [cel('td', 'c-vazio', '', { colspan: nCols })]);
    });
    linha(tb, n++, [cel('td', 'c-leg', T.legenda, { colspan: nCols, style: 'color:#0B5563' })]);
    ['direta', 'airbnb', 'booking', 'site', 'pre', 'bloqueio', 'canal', 'manutencao', 'conflito'].forEach(function (k) {
      linha(tb, n++, [cel('td', 'c-leg', CAT[k].nome, { style: 'background:' + CAT[k].fundo + ';color:' + CAT[k].texto }), cel('td', 'c-vazio', ''), cel('td', 'c-nota', CAT[k].desc, { colspan: nCols - 2, style: 'font-style:normal' })]);
    });
    linha(tb, n++, [cel('td', 'c-leg', 'Livre'), cel('td', 'c-vazio', ''), cel('td', 'c-nota', 'Sem reserva (fins de semana em cinza claro)', { colspan: nCols - 2, style: 'font-style:normal' })]);
    linha(tb, n++, [cel('td', 'c-nota', T.nota, { colspan: nCols })]);
    return tab;
  }
  function tabela(colunas, linhas) {
    var tab = h('table', { class: 'xl-tab xl-tab-simples' }), tb = h('tbody'); tab.appendChild(cabecalho(colunas.length)); tab.appendChild(tb);
    linha(tb, 1, colunas.map(function (c) { return cel('td', null, c); }));
    linhas.forEach(function (l, i) { linha(tb, i + 2, l.map(function (v) { return cel('td', null, v); })); });
    if (!linhas.length) linha(tb, 2, [cel('td', 'c-nota', 'Nada neste período.', { colspan: colunas.length })]);
    return tab;
  }
  function aba2() {
    var l = []; dados.agenda.casas.forEach(function (c) { c.livres.forEach(function (x) { l.push([c.codigo + ' ' + c.titulo, br(x.de), br(x.ate), String(x.noites)]); }); });
    return tabela(['Casa', 'Livre a partir de', 'Até o dia (saída)', 'Noites livres'], l);
  }
  function aba3() {
    var X = L.agendaXlsx, nome = {}; dados.casas.forEach(function (c) { nome[c.id] = c.codigo + ' ' + c.titulo; });
    var l = dados.reservas.slice().sort(function (a, b) { return a.entrada < b.entrada ? -1 : 1; }).map(function (r) {
      return [nome[r.imovel_id], r.hospede_nome || '', br(r.entrada), br(r.saida), String(S.noites(r.entrada, r.saida)), X.ROT_ORIGEM[r.origem] || r.origem, X.ROT_ESTADO[r.estado] + (r.estado === 'pre_reserva' && r.expira_em ? ' (até ' + S.dataHora(r.expira_em) + ')' : ''), reais(r.total_centavos), reais(r.sinal_centavos), r.pago ? 'Sim' : 'Não'];
    });
    return tabela(['Casa', 'Hóspede', 'Entrada', 'Saída', 'Noites', 'Origem', 'Situação', 'Total', 'Sinal', 'Pago'], l);
  }

  function desenhar() {
    var g = $('pl-grade'); while (g.firstChild) g.removeChild(g.firstChild);
    g.appendChild([aba1, aba2, aba3][aba]());
    Array.prototype.forEach.call(document.querySelectorAll('.xl-aba'), function (b, i) { b.setAttribute('aria-selected', String(i === aba)); b.tabIndex = i === aba ? 0 : -1; });
    var pre = dados.reservas.filter(function (r) { return r.estado === 'pre_reserva'; }).length;
    $('pl-status').textContent = dados.agenda.casas.length + ' casas · ' + dados.reservas.length + ' reservas no período' + (pre ? ' · ' + pre + (pre === 1 ? ' pré-reserva' : ' pré-reservas') : '') + '. Passe o mouse numa reserva para ver as datas.';
  }
  var abas = $('pl-abas');
  ABAS.forEach(function (a, i) {
    var b = h('button', { type: 'button', class: 'xl-aba', role: 'tab', id: 'pl-aba-' + i, 'aria-controls': 'pl-grade' }, h('span', { class: 'xl-ponto', style: 'background:' + a.cor, 'aria-hidden': 'true' }), a.nome);
    b.addEventListener('click', function () { aba = i; desenhar(); });
    abas.appendChild(b);
  });
  abas.addEventListener('keydown', function (e) {
    var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); aba = (aba + d + ABAS.length) % ABAS.length; desenhar(); abas.children[aba].focus();
  });
  $('pl-grade').addEventListener('mouseover', function (e) {
    var c = e.target.closest('td[data-v], td[title]'); if (!c) return;
    var tr = c.parentNode, col = 0; for (var k = 0; k < tr.children.length && tr.children[k] !== c; k++) col += Number(tr.children[k].getAttribute('colspan') || 1);
    $('pl-celula').textContent = letra(col) + tr.firstChild.textContent;
    $('pl-formula').textContent = c.getAttribute('title') || c.getAttribute('data-v') || '';
  });
  Array.prototype.forEach.call(document.querySelectorAll('.pl-chip'), function (b) {
    b.addEventListener('click', function () {
      dias = Number(b.getAttribute('data-dias'));
      Array.prototype.forEach.call(document.querySelectorAll('.pl-chip'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      carregar();
    });
  });
  $('pl-baixar').addEventListener('click', function () {
    var bytes = L.agendaXlsx.gerarPlanilhaAgenda(dados, new Date());
    var url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    var a = h('a', { href: url, download: $('pl-arquivo').textContent }); a.hidden = true; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    $('pl-status').textContent = 'Planilha gerada no seu navegador: ' + $('pl-arquivo').textContent + ' (' + Math.round(bytes.length / 1024) + ' KB).';
  });
  window.addEventListener('storage', function (e) { if (e.key && e.key.indexOf('cassiano-sandbox') === 0 && L) carregar(); });
  S.libs().then(function (x) { L = x; carregar(); });
})();
