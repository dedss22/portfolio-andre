/* Copia de demonstracao (sandbox do portfolio) do painel Cassiano Imoveis. Caminhos ajustados; a API e simulada por ../mock-api.js. */
/* Painel: Temporada. Tela 1 = cartoes das casas; tela 2 (#/casa/<id>) = calendario da casa (grade mensal, reservas, epocas e planilha). Dados sempre por textContent/value. */
(function () {
  'use strict';
  var P = window.Painel, h = P.h;
  var $ = function (id) { return document.getElementById(id); };
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var ESTADOS = { alugado: 'Alugado', pre_reserva: 'Pré-reserva', bloqueio_dono: 'Bloqueio do proprietário', manutencao: 'Manutenção' };
  var LETRA = { alugado: 'A', pre_reserva: 'P', bloqueio_dono: 'B', manutencao: 'M' };
  // 'indicacao' e o valor tecnico (CHECK do banco); a tela o chama de "Outro"
  var ORIGENS = { direto: 'Direto/WhatsApp', airbnb: 'Airbnb', booking: 'Booking', indicacao: 'Outro' };
  var PLATAFORMAS = { airbnb: true, booking: true };   // origens com selo (futura integracao por iCal)
  var SITUACAO = { rascunho: 'Rascunho', publicado: 'Publicado', vendido: 'Vendido', alugado: 'Alugado', arquivado: 'Arquivado' };
  var carregandoInicio = true, resumoVelho = false;
  var usuario = null, imoveis = [], resumo = {}, resumoOk = true, imovelId = null, reservas = [], precosBase = null, precosEpocas = [], vista = 'mes', reservasAno = [], anoCarregado = null, pedidoMes = 0;
  var hojeIso = new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10);
  var ano = Number(hojeIso.slice(0, 4)), mes = Number(hojeIso.slice(5, 7)), foco = hojeIso, sel = {};
  var admin = function () { return usuario && usuario.papel === 'admin'; };

  var pad = function (n) { return String(n).padStart(2, '0'); };
  var iso = function (a, m, d) { return a + '-' + pad(m) + '-' + pad(d); };
  function addDias(s, n) { return new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10) + n)).toISOString().slice(0, 10); }
  function diaSemana(s) { return new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))).getUTCDay(); }
  function noites(a, b) { return Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000); }
  var br = function (s) { return s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : ''; };
  var brCurto = function (s) { return s.slice(8, 10) + '/' + s.slice(5, 7); };
  function seloOrigem(r) { return PLATAFORMAS[r.origem] ? h('span', { class: 'selo origem' }, ORIGENS[r.origem]) : null; }
  function casaAtual() { for (var i = 0; i < imoveis.length; i++) if (imoveis[i].id === imovelId) return imoveis[i]; return null; }

  // feriados nacionais (fixos + moveis a partir da Pascoa) e Carnaval; so informativo
  var feriadosCache = {};
  function feriadosDoAno(a) {
    if (feriadosCache[a]) return feriadosCache[a];
    var f = {}, x = a % 19, c = Math.floor(a / 100), d = a % 100, e = Math.floor(c / 4), g = Math.floor((c + 8) / 25), hh = Math.floor((c - g + 1) / 3);
    var i = (19 * x + c - e - hh + 15) % 30, k = d % 4, l = (32 + 2 * (c % 4) + 2 * Math.floor(d / 4) - i - k % 4) % 7, mm = Math.floor((x + 11 * i + 22 * l) / 451);
    var mesP = Math.floor((i + l - 7 * mm + 114) / 31), diaP = ((i + l - 7 * mm + 114) % 31) + 1, pascoa = iso(a, mesP, diaP);
    [['01-01', 'Confraternização Universal'], ['04-21', 'Tiradentes'], ['05-01', 'Dia do Trabalho'], ['09-07', 'Independência'], ['10-12', 'Nossa Senhora Aparecida'], ['11-02', 'Finados'], ['11-15', 'Proclamação da República'], ['11-20', 'Consciência Negra'], ['12-25', 'Natal']].forEach(function (p) { f[a + '-' + p[0]] = p[1]; });
    f[addDias(pascoa, -2)] = 'Sexta-feira Santa'; f[addDias(pascoa, -47)] = 'Carnaval'; f[addDias(pascoa, -48)] = 'Carnaval';
    feriadosCache[a] = f; return f;
  }
  function feriado(d) { return feriadosDoAno(Number(d.slice(0, 4)))[d] || null; }
  // estimativa pelo mesmo criterio do servidor: epoca mais curta que cobre a noite, senao a diaria base
  function estimativa(a, b) {
    if (!precosBase || precosBase.diaria_base_centavos == null) return null;
    var total = 0;
    for (var d = a; d < b; d = addDias(d, 1)) {
      var m = null;
      precosEpocas.forEach(function (t) { if (d < t.de || d >= t.ate) return; if (!m || noites(t.de, t.ate) < noites(m.de, m.ate) || (noites(t.de, t.ate) === noites(m.de, m.ate) && t.de > m.de)) m = t; });
      total += m ? m.diaria_centavos : precosBase.diaria_base_centavos;
    }
    return total;
  }
  function nomeBarra(r) { return r.hospede_nome || ESTADOS[r.estado]; }

  function janela() { var primeiro = iso(ano, mes, 1), ini = addDias(primeiro, -diaSemana(primeiro)); return { ini: ini, fim: addDias(ini, 42), primeiro: primeiro }; }
  function reservaDoDia(d) { for (var i = 0; i < reservas.length; i++) { var r = reservas[i]; if (r.entrada <= d && d < r.saida) return r; } return null; }

  // ---------------------------------------------------------------- grade
  function barrasDaSemana(ini) {
    // reservas que cobrem noites desta semana -> segmentos (coluna inicial 1..7, tamanho)
    var fim = addDias(ini, 7), out = [];
    reservas.forEach(function (r) {
      if (r.saida <= ini || r.entrada >= fim) return;
      var a = r.entrada > ini ? r.entrada : ini, c = r.saida < fim ? r.saida : fim;
      out.push({ r: r, col: noites(ini, a) + 1, n: noites(a, c), esq: r.entrada < ini, dir: r.saida > fim });
    });
    return out;
  }
  function desenhar(manterFoco) {
    var j = janela();
    $('mes-nome').textContent = MESES[mes - 1].charAt(0).toUpperCase() + MESES[mes - 1].slice(1) + ' de ' + ano;
    sincronizarSeletores();
    var g = $('grade'); P.limpar(g); g.setAttribute('aria-busy', 'false');
    var cab = h('div', { class: 'cal-linha cal-cab', role: 'row' });
    DIAS.forEach(function (d, i) { cab.appendChild(h('div', { class: 'cal-dow' + (i === 0 || i === 6 ? ' fds' : ''), role: 'columnheader', 'aria-label': d }, d.charAt(0).toUpperCase())); });
    g.appendChild(cab);
    var focoVisivel = foco >= j.ini && foco < j.fim ? foco : j.primeiro;
    for (var semana = 0; semana < 6; semana++) {
      var linha = h('div', { class: 'cal-linha', role: 'row' });
      for (var k = 0; k < 7; k++) {
        var d = addDias(j.ini, semana * 7 + k), r = reservaDoDia(d), delaMes = d.slice(0, 7) === j.primeiro.slice(0, 7), fer = feriado(d);
        var ehIni = sel.entrada === d, ehFim = sel.saida === d;
        var noSel = sel.entrada && ((!sel.saida && d === sel.entrada) || (sel.saida && d >= sel.entrada && d < sel.saida));
        var cls = 'dia' + (delaMes ? '' : ' fora') + (d === hojeIso ? ' hoje' : '') + (r ? ' ' + r.estado : '') + (noSel ? ' sel' : '') + (ehIni ? ' sel-ini' : '') + (ehFim ? ' sel-fim' : '') + (k === 0 || k === 6 ? ' fds' : '') + (fer ? ' feriado' : '');
        var rot = Number(d.slice(8, 10)) + ' de ' + MESES[Number(d.slice(5, 7)) - 1] + (r ? ', ' + ESTADOS[r.estado].toLowerCase() + (r.hospede_nome ? ', ' + r.hospede_nome : '') + (r.entrada === d ? ', entrada' : '') + (PLATAFORMAS[r.origem] ? ', ' + ORIGENS[r.origem] : '') : ', livre') + (d === hojeIso ? ', hoje' : '') + (fer ? ', feriado: ' + fer : '') + (ehIni ? ', entrada da seleção' : '') + (ehFim ? ', saída da seleção' : '');
        var atr = { type: 'button', class: cls, role: 'gridcell', 'data-dia': d, tabindex: d === focoVisivel ? '0' : '-1', 'aria-label': rot, 'aria-pressed': noSel ? 'true' : 'false' };
        if (fer) atr.title = fer;
        var b = h('button', atr,
          h('span', { class: 'num' }, String(Number(d.slice(8, 10)))), h('span', { class: 'cod', 'aria-hidden': 'true' }, r ? LETRA[r.estado] : '·'),
          ehIni || ehFim ? h('span', { class: 'marca-sel', 'aria-hidden': 'true' }, ehIni ? 'Entrada' : 'Saída') : null);
        linha.appendChild(b);
      }
      barrasDaSemana(addDias(j.ini, semana * 7)).forEach(function (s) {
        var r = s.r, nome = nomeBarra(r);
        linha.appendChild(h('span', { class: 'rbarra ' + r.estado + ' c' + s.col + ' l' + s.n + (s.esq ? ' cont-esq' : '') + (s.dir ? ' cont-dir' : ''), 'aria-hidden': 'true' },
          h('span', { class: 'barra-letra' }, LETRA[r.estado]), h('span', { class: 'barra-nome' }, nome), PLATAFORMAS[r.origem] ? h('span', { class: 'barra-selo' }, ORIGENS[r.origem]) : null));
      });
      g.appendChild(linha);
    }
    if (manterFoco) { var alvo = g.querySelector('[data-dia="' + focoVisivel + '"]'); if (alvo) alvo.focus(); }
    desenharSelecao(); desenharProximas();
  }
  $('grade').addEventListener('click', function (e) {
    var b = e.target.closest('[data-dia]'); if (!b) return;
    var d = b.getAttribute('data-dia'); foco = d;
    var r = reservaDoDia(d);
    if (r && !sel.entrada) { abrirFolha({ reserva: r }); return; }
    if (!sel.entrada || sel.saida || d <= sel.entrada) sel = { entrada: d }; else sel.saida = d;
    desenhar(true);
  });
  $('grade').addEventListener('focusin', function (e) { var d = e.target.closest('[data-dia]'); if (d) foco = d.getAttribute('data-dia'); });
  $('grade').addEventListener('keydown', function (e) {
    var passo = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (passo === undefined && e.key !== 'PageUp' && e.key !== 'PageDown') return;
    e.preventDefault();
    if (e.key === 'PageUp' || e.key === 'PageDown') { var m = mes + (e.key === 'PageUp' ? -1 : 1); foco = iso(m < 1 ? ano - 1 : m > 12 ? ano + 1 : ano, m < 1 ? 12 : m > 12 ? 1 : m, 1); }
    else foco = addDias(foco, passo);
    if (foco.slice(0, 7) !== iso(ano, mes, 1).slice(0, 7)) { ano = Number(foco.slice(0, 4)); mes = Number(foco.slice(5, 7)); carregar(true); } else desenhar(true);
  });

  function desenharSelecao() {
    var box = $('selecao');
    if (!sel.entrada) { box.hidden = true; return; }
    box.hidden = false;
    $('selecao-texto').textContent = sel.saida ? br(sel.entrada) + ' a ' + br(sel.saida) + ' · ' + noites(sel.entrada, sel.saida) + ' noite' + (noites(sel.entrada, sel.saida) === 1 ? '' : 's')
      : 'Entrada em ' + br(sel.entrada) + '. Agora toque no dia da saída.';
    $('selecao-reservar').hidden = !sel.saida;
    var est = sel.saida ? estimativa(sel.entrada, sel.saida) : null;
    $('selecao-preco').textContent = est !== null ? 'Estimativa: R$ ' + P.reais(est) : '';
  }
  $('selecao-limpar').addEventListener('click', function () { sel = {}; desenhar(false); });
  $('selecao-reservar').addEventListener('click', function () { abrirFolha({ entrada: sel.entrada, saida: sel.saida }); });

  function desenharProximas() {
    var ul = $('proximas'); P.limpar(ul);
    if (!reservas.length) { ul.appendChild(h('li', { class: 'vazio' }, 'Nenhuma reserva neste período.')); return; }
    reservas.forEach(function (r) {
      var b = h('button', { type: 'button', class: 'item' }, h('span', { class: 'selo' }, ESTADOS[r.estado]), h('span', { class: 'nome' }, brCurto(r.entrada) + ' → ' + brCurto(r.saida) + (r.hospede_nome ? ' · ' + r.hospede_nome : ''), seloOrigem(r)),
        h('span', { class: 'meta' }, r.noites + ' noite' + (r.noites === 1 ? '' : 's') + (r.total_centavos != null ? ' · R$ ' + P.reais(r.total_centavos) : '')));
      b.addEventListener('click', function () { abrirFolha({ reserva: r }); });
      ul.appendChild(h('li', null, b));
    });
  }

  // ---------------------------------------------------------------- dados
  function mostrarErro(r, repetir) {
    $('erro-cal-texto').textContent = P.mensagemDeErro(r); $('erro-cal').hidden = false; $('carregando-cal').hidden = true;
    $('erro-cal-tentar').onclick = repetir;
  }
  function carregar(manterFoco) {
    if (vista === 'ano') { carregarAno(); return; }
    var j = janela(), id = imovelId, pedido = ++pedidoMes;
    $('erro-cal').hidden = true; $('carregando-cal').hidden = false; $('grade').setAttribute('aria-busy', 'true');
    P.api('reservas?imovel=' + id + '&de=' + j.ini + '&ate=' + j.fim).then(function (r) {
      if (id !== imovelId || pedido !== pedidoMes) return;   // trocou de tela ou de mes enquanto carregava
      $('carregando-cal').hidden = true;
      if (!r.ok) { mostrarErro(r, function () { carregar(manterFoco); }); return; }
      $('erro-cal').hidden = true; reservas = r.dados.itens; desenhar(manterFoco);
    });
    atualizarExportacao();
  }
  function atualizarExportacao() {
    $('acoes-exportar').hidden = !admin();
    var base = '/api/admin/reservas/exportar-agenda?casa=' + imovelId + '&de=' + ano + '-01-01&ate=' + ano + '-12-31&formato=';
    $('exportar-xlsx').href = base + 'xlsx'; $('exportar-csv').href = base + 'csv';
  }
  function mudarMes(delta) { if (vista === 'ano') { ano += delta; sel = {}; carregar(false); return; } mes += delta; if (mes < 1) { mes = 12; ano--; } if (mes > 12) { mes = 1; ano++; } foco = iso(ano, mes, 1); sel = {}; carregar(false); }
  $('mes-ant').addEventListener('click', function () { mudarMes(-1); });
  $('mes-prox').addEventListener('click', function () { mudarMes(1); });
  $('mes-hoje').addEventListener('click', function () { ano = Number(hojeIso.slice(0, 4)); mes = Number(hojeIso.slice(5, 7)); foco = hojeIso; sel = {}; carregar(false); });
  function irPara(a, m) { ano = a; mes = m; foco = iso(a, m, 1); sel = {}; carregar(false); }
  $('mes-sel').addEventListener('change', function () { irPara(ano, Number($('mes-sel').value)); });
  $('ano-sel').addEventListener('change', function () { irPara(Number($('ano-sel').value), mes); });
  function sincronizarSeletores() {
    var ms = $('mes-sel'), as = $('ano-sel');
    if (!ms.options.length) MESES.forEach(function (n, i) { ms.appendChild(h('option', { value: String(i + 1) }, n.charAt(0).toUpperCase() + n.slice(1))); });
    var h0 = Number(hojeIso.slice(0, 4)), de = Math.min(h0 - 2, ano), ate = Math.max(h0 + 4, ano);
    if (as.options.length !== ate - de + 1 || Number(as.options[0].value) !== de) { P.limpar(as); for (var y = de; y <= ate; y++) as.appendChild(h('option', { value: String(y) }, String(y))); }
    ms.value = String(mes); as.value = String(ano); ms.hidden = vista === 'ano';
  }

  // ---------------------------------------------------------------- visao do ano
  function aplicarVista(v) {
    vista = v;
    $('vista-mes').setAttribute('aria-pressed', String(v === 'mes')); $('vista-ano').setAttribute('aria-pressed', String(v === 'ano'));
    $('vista-mes-corpo').hidden = v !== 'mes'; $('vista-ano-corpo').hidden = v !== 'ano'; $('proximas-titulo').hidden = v !== 'mes'; $('proximas').hidden = v !== 'mes';
    $('mes-ant').setAttribute('aria-label', v === 'ano' ? 'Ano anterior' : 'Mês anterior'); $('mes-prox').setAttribute('aria-label', v === 'ano' ? 'Próximo ano' : 'Próximo mês');
    sincronizarSeletores();
  }
  function definirVista(v) { sel = {}; $('selecao').hidden = true; aplicarVista(v); carregar(false); }
  $('vista-mes').addEventListener('click', function () { if (vista !== 'mes') definirVista('mes'); });
  $('vista-ano').addEventListener('click', function () { if (vista !== 'ano') definirVista('ano'); });
  function carregarAno() {
    var id = imovelId, a = ano, pedido = ++pedidoMes;
    $('mes-nome').textContent = String(a); sincronizarSeletores();
    $('erro-cal').hidden = true; $('carregando-cal').hidden = false; P.limpar($('ano-grade'));
    P.api('reservas?imovel=' + id + '&de=' + a + '-01-01&ate=' + (a + 1) + '-01-01').then(function (r) {
      if (id !== imovelId || pedido !== pedidoMes) return;
      $('carregando-cal').hidden = true;
      if (!r.ok) { mostrarErro(r, carregarAno); return; }
      reservasAno = r.dados.itens; desenharAno(a);
    });
    atualizarExportacao();
  }
  function desenharAno(a) {
    var ul = $('ano-grade'); P.limpar(ul);
    for (var m = 1; m <= 12; m++) {
      var prim = iso(a, m, 1), nd = new Date(Date.UTC(a, m, 0)).getUTCDate(), ini = diaSemana(prim), ocup = 0, cel = h('span', { class: 'mini-grade', 'aria-hidden': 'true' });
      for (var k = 0; k < ini; k++) cel.appendChild(h('i', { class: 'mini vazio-c' }));
      for (var d = 1; d <= nd; d++) {
        var ds = iso(a, m, d), r = null;
        for (var i = 0; i < reservasAno.length; i++) { var x = reservasAno[i]; if (x.entrada <= ds && ds < x.saida) { r = x; break; } }
        if (r && (r.estado === 'alugado' || r.estado === 'pre_reserva')) ocup++;
        cel.appendChild(h('i', { class: 'mini' + (r ? ' ' + r.estado : '') + (ds === hojeIso ? ' hoje' : '') }));
      }
      var nome = MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1);
      var b = h('button', { type: 'button', class: 'mini-mes', 'data-mes': String(m), 'aria-label': nome + ' de ' + a + ': ' + ocup + ' de ' + nd + ' noites ocupadas. Abrir o mês' },
        h('span', { class: 'mini-nome' }, nome), cel, h('span', { class: 'mini-conta' }, ocup + ' de ' + nd + ' noites'));
      b.addEventListener('click', function (e) { var mm = Number(e.currentTarget.getAttribute('data-mes')); aplicarVista('mes'); irPara(a, mm); });
      ul.appendChild(h('li', null, b));
    }
  }

  // ---------------------------------------------------------------- menu de acoes da casa
  function fecharMenu(devolverFoco) { var p = $('menu-casa-painel'); if (p.hidden) return; p.hidden = true; $('menu-casa-botao').setAttribute('aria-expanded', 'false'); if (devolverFoco) $('menu-casa-botao').focus(); }
  $('menu-casa-botao').addEventListener('click', function () { var p = $('menu-casa-painel'); p.hidden = !p.hidden; this.setAttribute('aria-expanded', String(!p.hidden)); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharMenu(true); });
  document.addEventListener('click', function (e) { if (!$('menu-casa').contains(e.target)) fecharMenu(false); });
  $('abrir-precos').addEventListener('click', function () { fecharMenu(false); var d = $('precos'); d.open = true; d.scrollIntoView({ block: 'start' }); d.querySelector('summary').focus(); });

  // ---------------------------------------------------------------- folha de reserva
  function abrirFolha(o) {
    var f = $('folha'); P.limpar(f);
    var r = o.reserva || null, editando = !!r;
    var campos = {};
    function erro(nome) { return h('p', { class: 'erro-campo', 'data-erro': nome, role: 'alert' }); }
    function campo(nome, rotulo, input, ajuda) { campos[nome] = { input: input, err: erro(nome) }; input.id = 'f-' + nome; return h('div', { class: 'campo-f' }, h('label', { for: 'f-' + nome }, rotulo), input, ajuda ? h('small', null, ajuda) : null, campos[nome].err); }
    var estado = h('select'); Object.keys(ESTADOS).forEach(function (k) { estado.appendChild(h('option', { value: k }, ESTADOS[k])); });
    var entrada = h('input', { type: 'date' }), saida = h('input', { type: 'date' });
    var nome = h('input', { type: 'text', maxlength: '100', autocomplete: 'off' }), fone = h('input', { type: 'text', inputmode: 'tel', maxlength: '24', autocomplete: 'off' }), pessoas = h('input', { type: 'text', inputmode: 'numeric', maxlength: '2' });
    var origem = h('select'); Object.keys(ORIGENS).forEach(function (k) { origem.appendChild(h('option', { value: k }, ORIGENS[k])); });
    var total = h('input', { type: 'text', inputmode: 'decimal', placeholder: '0,00' }), sinal = h('input', { type: 'text', inputmode: 'decimal', placeholder: '0,00' });
    var pago = h('input', { type: 'checkbox', id: 'f-pago' }), notas = h('textarea', { maxlength: '500', rows: '2' });
    var ids = { estado: estado, entrada: entrada, saida: saida, hospede_nome: nome, hospede_fone: fone, pessoas: pessoas, origem: origem, total_centavos: total, sinal_centavos: sinal, notas: notas };
    if (r) { estado.value = r.estado; entrada.value = r.entrada; saida.value = r.saida; nome.value = r.hospede_nome || ''; fone.value = r.hospede_fone || ''; pessoas.value = r.pessoas || ''; origem.value = r.origem; total.value = r.total_centavos != null ? P.reais(r.total_centavos) : ''; sinal.value = P.reais(r.sinal_centavos || 0); pago.checked = !!r.pago; notas.value = r.notas || ''; }
    else { estado.value = 'alugado'; entrada.value = o.entrada; saida.value = o.saida; origem.value = 'direto'; }
    var conflito = h('div', { class: 'conflito', role: 'alert' }); conflito.hidden = true;
    var hospede = h('div', null, campo('hospede_nome', 'Hóspede', nome), h('div', { class: 'grade2' }, campo('hospede_fone', 'Telefone', fone), campo('pessoas', 'Pessoas', pessoas)), campo('origem', 'Origem', origem));
    var valores = h('div', null, h('div', { class: 'grade2' }, campo('total_centavos', 'Total (R$)', total, 'Em branco: calcula pela diária e pelas épocas.'), campo('sinal_centavos', 'Sinal (R$)', sinal)),
      h('label', { class: 'marca-op', for: 'f-pago' }, pago, 'Pago por completo'));
    function ajustar() { var comHospede = estado.value === 'alugado' || estado.value === 'pre_reserva'; hospede.hidden = !comHospede; valores.hidden = !comHospede; }
    estado.addEventListener('change', ajustar); ajustar();
    var salvar = h('button', { class: 'botao primario', type: 'button' }, 'Salvar'), fechar = h('button', { class: 'botao', type: 'button' }, 'Fechar');
    var cancelar = h('button', { class: 'botao perigo', type: 'button' }, 'Cancelar reserva');
    var permitir = h('button', { class: 'botao', type: 'button' }, 'Permitir mesmo assim'); permitir.hidden = true;
    f.appendChild(h('h2', { id: 'folha-titulo' }, editando ? 'Reserva de ' + brCurto(r.entrada) + ' a ' + brCurto(r.saida) : 'Nova reserva', editando ? seloOrigem(r) : null));
    if (editando) {
      var partes = [r.noites + ' noite' + (r.noites === 1 ? '' : 's') + ' · ' + ESTADOS[r.estado]];
      if (r.total_centavos != null) { partes.push('Total R$ ' + P.reais(r.total_centavos)); if (r.sinal_centavos) partes.push('Sinal R$ ' + P.reais(r.sinal_centavos)); partes.push(r.pago ? 'Pago por completo' : 'Falta R$ ' + P.reais(Math.max(0, r.total_centavos - (r.sinal_centavos || 0)))); }
      if (r.estado === 'pre_reserva' && r.expira_em) partes.push('Válida até ' + window.SandboxCassiano.dataHora(r.expira_em)); // SANDBOX: validade da pre-reserva
      f.appendChild(h('p', { class: 'resumo-reserva' }, partes.join(' · ')));
    }
    f.appendChild(conflito);
    f.appendChild(campo('estado', 'Tipo', estado));
    f.appendChild(h('div', { class: 'grade2' }, campo('entrada', 'Entrada', entrada), campo('saida', 'Saída', saida)));
    f.appendChild(hospede); f.appendChild(valores); f.appendChild(campo('notas', 'Observações', notas));
    var acoes = h('div', { class: 'acoes' }, salvar, permitir); if (editando) acoes.appendChild(cancelar); acoes.appendChild(fechar); f.appendChild(acoes);

    function limpar() { Object.keys(campos).forEach(function (k) { campos[k].err.textContent = ''; campos[k].input.removeAttribute('aria-invalid'); }); conflito.hidden = true; permitir.hidden = true; }
    function mostrar(erros) { var primeiro = null; Object.keys(erros || {}).forEach(function (k) { if (campos[k]) { campos[k].err.textContent = erros[k]; campos[k].input.setAttribute('aria-invalid', 'true'); if (!primeiro) primeiro = campos[k].input; } }); if (primeiro) primeiro.focus(); }
    function enviar(ignorarMinimo) {
      limpar();
      var t = P.paraCentavos(total.value), s = P.paraCentavos(sinal.value), loc = {};
      if (t !== t) loc.total_centavos = 'Confira o valor (ex.: 3.600,00).'; if (s !== s) loc.sinal_centavos = 'Confira o valor (ex.: 500,00).';
      if (!entrada.value) loc.entrada = 'Informe a entrada.'; if (!saida.value) loc.saida = 'Informe a saída.';
      if (Object.keys(loc).length) { mostrar(loc); return; }
      var corpo = { estado: estado.value, entrada: entrada.value, saida: saida.value, hospede_nome: nome.value, hospede_fone: fone.value, pessoas: pessoas.value ? Number(pessoas.value) : null, origem: origem.value,
        total_centavos: t, sinal_centavos: s === null ? 0 : s, pago: pago.checked, notas: notas.value.trim() || null };
      if (!editando) corpo.imovel_id = imovelId; else if (t === null && (estado.value === 'alugado' || estado.value === 'pre_reserva')) corpo.recalcular_total = true;
      if (ignorarMinimo) corpo.ignorar_minimo = true;
      if (admin() && entrada.value < hojeIso) corpo.permitir_passado = true;
      salvar.disabled = true;
      P.api(editando ? 'reservas/' + r.id : 'reservas', { metodo: editando ? 'PUT' : 'POST', corpo: corpo }).then(function (x) {
        salvar.disabled = false;
        if (x.ok) { f.close(); P.aviso(editando ? 'Reserva salva.' : 'Reserva criada.'); sel = {}; carregar(false); return; }
        if (x.status === 409 && x.dados.conflito) { var c = x.dados.conflito; conflito.textContent = 'Estas datas já estão ocupadas: reserva de ' + br(c.entrada) + ' a ' + br(c.saida) + (c.hospede_nome ? ' (' + c.hospede_nome + ')' : '') + '. Escolha outras datas.'; conflito.hidden = false; return; }
        if (x.dados && x.dados.erros) { mostrar(x.dados.erros); if (x.dados.minimo && x.dados.pode_ignorar) permitir.hidden = false; return; }
        P.aviso(P.mensagemDeErro(x), true);
      });
    }
    salvar.addEventListener('click', function () { enviar(false); });
    permitir.addEventListener('click', function () { enviar(true); });
    fechar.addEventListener('click', function () { f.close(); });
    var pedido = false;
    cancelar.addEventListener('click', function () {
      if (!pedido) { pedido = true; cancelar.textContent = 'Tem certeza? Toque de novo para cancelar'; return; }
      cancelar.disabled = true;
      P.api('reservas/' + r.id + '/cancelar', { metodo: 'POST' }).then(function (x) { if (x.ok) { f.close(); P.aviso('Reserva cancelada. As datas ficaram livres.'); sel = {}; carregar(false); } else { cancelar.disabled = false; P.aviso(P.mensagemDeErro(x), true); } });
    });
    f.showModal(); (editando ? nome : estado).focus();
  }

  // ---------------------------------------------------------------- epocas e precos
  function linhaPreco(p) {
    var nome = h('input', { type: 'text', maxlength: '40', 'aria-label': 'Nome da época' }), de = h('input', { type: 'date', 'aria-label': 'Início' }), ate = h('input', { type: 'date', 'aria-label': 'Saída' });
    var dia = h('input', { type: 'text', inputmode: 'decimal', 'aria-label': 'Diária', placeholder: '0,00' }), min = h('input', { type: 'text', inputmode: 'numeric', 'aria-label': 'Estadia mínima', maxlength: '3' });
    var rm = h('button', { class: 'botao perigo', type: 'button' }, 'Remover');
    var tr = h('tr', null, h('td', null, nome), h('td', null, de), h('td', null, ate), h('td', null, dia), h('td', null, min), h('td', null, rm));
    if (p) { nome.value = p.nome; de.value = p.de; ate.value = p.ate; dia.value = P.reais(p.diaria_centavos); min.value = p.estadia_min || ''; }
    rm.addEventListener('click', function () { $('precos-corpo').removeChild(tr); });
    tr.ler = function () { var c = P.paraCentavos(dia.value), m = P.paraNumero(min.value); return { nome: nome.value.trim(), de: de.value, ate: ate.value, diaria_centavos: c, estadia_min: m }; };
    $('precos-corpo').appendChild(tr);
  }
  function carregarPrecos() {
    var id = imovelId;
    P.api('reservas/precos/' + id).then(function (r) {
      if (id !== imovelId) return;
      P.limpar($('precos-corpo')); precosBase = null; precosEpocas = []; if (!r.ok) return;
      precosBase = r.dados; precosEpocas = r.dados.precos || []; if (sel.saida) desenharSelecao();
      $('precos-base').textContent = 'Diária base: R$ ' + P.reais(r.dados.diaria_base_centavos) + ' · mínimo da casa: ' + r.dados.minimo_noites + ' noite(s). As épocas abaixo valem no lugar da diária base nas noites que cobrem.';
      r.dados.precos.forEach(linhaPreco);
    });
  }
  $('preco-add').addEventListener('click', function () { linhaPreco(null); });
  $('preco-salvar').addEventListener('click', function () {
    var erro = $('precos-erro'); erro.textContent = '';
    var lista = Array.prototype.map.call($('precos-corpo').children, function (tr) { return tr.ler(); });
    for (var i = 0; i < lista.length; i++) { var p = lista[i]; if (p.diaria_centavos !== p.diaria_centavos || p.diaria_centavos === null || p.estadia_min !== p.estadia_min) { erro.textContent = 'Confira a diária (ex.: 2.000,00) e a estadia mínima de cada época.'; return; } }
    P.api('reservas/precos/' + imovelId, { metodo: 'PUT', corpo: { precos: lista } }).then(function (r) {
      if (r.ok) P.aviso('Épocas salvas.'); else if (r.dados && r.dados.erros) erro.textContent = r.dados.erros.precos || 'Confira os dados.'; else P.aviso(P.mensagemDeErro(r), true);
    });
  });

  // ---------------------------------------------------------------- tela 1: casas
  function resumoDaCasa(id, rs) {
    var fim30 = addDias(hojeIso, 30), o = { noites30: 0, futuras: 0, proxima: null, agoraAte: null };
    rs.forEach(function (r) {
      if (r.imovel_id !== id || (r.estado !== 'alugado' && r.estado !== 'pre_reserva')) return;
      var a = r.entrada > hojeIso ? r.entrada : hojeIso, b = r.saida < fim30 ? r.saida : fim30;
      if (b > a) o.noites30 += noites(a, b);
      if (r.entrada >= hojeIso) { o.futuras++; if (!o.proxima || r.entrada < o.proxima) o.proxima = r.entrada; }
      else if (r.saida > hojeIso && (!o.agoraAte || r.saida > o.agoraAte)) o.agoraAte = r.saida;
    });
    return o;
  }
  function desenharCasas() {
    var ul = $('casas-lista'); P.limpar(ul);
    imoveis.forEach(function (i) {
      var s = resumo[i.id], linhas = [];
      if (!resumoOk || !s) linhas.push(h('li', null, 'Resumo indisponível.'));
      else {
        if (s.agoraAte) linhas.push(h('li', null, 'Hospedado até ' + br(s.agoraAte)));
        linhas.push(h('li', null, s.proxima ? 'Próxima entrada: ' + br(s.proxima) : 'Sem entradas previstas'));
        linhas.push(h('li', null, 'Noites ocupadas nos próximos 30 dias: ' + s.noites30));
        linhas.push(h('li', null, 'Reservas futuras: ' + s.futuras));
      }
      var local = [i.bairro, i.cidade].filter(Boolean).join(' · ');
      var a = h('a', { class: 'casa-link', href: '#/casa/' + i.id, 'data-casa': String(i.id) },
        h('div', { class: 'casa-cab' }, h('span', { class: 'cod' }, i.codigo), h('span', { class: 'selo status-' + i.status }, SITUACAO[i.status] || i.status)),
        h('p', { class: 'casa-titulo' }, i.titulo),
        local ? h('p', { class: 'local' }, local) : null,
        h.apply(null, ['ul', { class: 'resumo' }].concat(linhas)),
        h('span', { class: 'abrir' }, 'Abrir calendário da casa →'));
      ul.appendChild(h('li', { class: 'casa' }, a, h('a', { class: 'botao', href: 'imoveis.html#/editar/' + i.id, 'data-editar': String(i.id) }, 'Editar dados da casa')));
    });
  }
  function carregarTodasCasas() {
    var todas = [];
    function pagina(n) {
      return P.api('imoveis?negocio=temporada&pagina=' + n).then(function (r) {
        if (!r.ok) return r;
        todas = todas.concat(r.dados.itens);
        if (n < r.dados.paginas && n < 50) return pagina(n + 1);
        return { ok: true };
      });
    }
    return pagina(1).then(function (r) { r.itens = todas.sort(function (a, b) { return a.codigo < b.codigo ? -1 : a.codigo > b.codigo ? 1 : 0; }); return r; });
  }
  function carregarResumos() {
    return P.api('reservas?de=' + hojeIso + '&ate=' + addDias(hojeIso, 366)).then(function (r) {
      resumoOk = !!r.ok; resumo = {};
      if (r.ok) imoveis.forEach(function (i) { resumo[i.id] = resumoDaCasa(i.id, r.dados.itens); });
    });
  }
  function linksExportarTodas() {
    $('exportar-todas').hidden = !admin();
    var a0 = Number(hojeIso.slice(0, 4)), base = '/api/admin/reservas/exportar?de=' + a0 + '-01-01&ate=' + (a0 + 1) + '-01-01&formato=';
    $('exportar-todas-xlsx').href = base + 'xlsx'; $('exportar-todas-csv').href = base + 'csv';
  }

  // ---------------------------------------------------------------- rotas (#/ = casas, #/casa/<id> = painel da casa)
  function mostrarCasas() {
    imovelId = null; sel = {}; document.title = 'Temporada | Painel Cassiano Imóveis';
    $('cal').hidden = true; $('titulo-pagina').hidden = false;
    $('vazio-imoveis').hidden = imoveis.length > 0; $('casas').hidden = !imoveis.length;
    linksExportarTodas(); desenharCasas();
    if (window.AgendaGeral && imoveis.length) { window.AgendaGeral.iniciar({ admin: admin, hoje: hojeIso }); window.AgendaGeral.mostrar(); }
    if (!carregandoInicio) $('titulo-pagina').focus();
    if (resumoVelho) carregarResumos().then(function () { if (imovelId === null) desenharCasas(); });   // as reservas podem ter mudado no painel da casa
  }
  function abrirCasa(id) {
    imovelId = id; sel = {}; reservas = []; reservasAno = []; precosBase = null; precosEpocas = []; resumoVelho = true; fecharMenu(false); aplicarVista('mes');
    ano = Number(hojeIso.slice(0, 4)); mes = Number(hojeIso.slice(5, 7)); foco = hojeIso;
    var c = casaAtual();
    $('casas').hidden = true; $('vazio-imoveis').hidden = true; $('titulo-pagina').hidden = true; $('cal').hidden = false;
    var t = $('casa-titulo'); P.limpar(t); t.appendChild(document.createTextNode(c.codigo + ' · ' + c.titulo + ' '));
    t.appendChild(h('span', { class: 'selo status-' + c.status }, SITUACAO[c.status] || c.status));
    $('editar-casa').href = 'imoveis.html#/editar/' + c.id;
    document.title = c.codigo + ' | Temporada | Painel Cassiano Imóveis';
    P.limpar($('grade')); P.limpar($('proximas')); P.limpar($('ano-grade')); $('precos').open = false; $('grade').setAttribute('aria-busy', 'true');
    carregar(false); carregarPrecos(); t.focus();
  }
  function rota() {
    var m = /^#\/casa\/(\d{1,12})$/.exec(location.hash), id = m ? Number(m[1]) : null;
    if (id !== null) {
      for (var i = 0; i < imoveis.length; i++) if (imoveis[i].id === id) { abrirCasa(id); return; }
      location.replace('#/');   // casa inexistente ou na lixeira: volta para a lista
      return;
    }
    mostrarCasas();
  }
  window.addEventListener('hashchange', function () { if (!carregandoInicio) rota(); });

  // ---------------------------------------------------------------- inicio
  P.montarTopo('calendario').then(function (u) {
    usuario = u;
    carregarTodasCasas().then(function (r) {
      if (!r.ok) { $('erro').textContent = P.mensagemDeErro(r); $('erro').hidden = false; return; }
      imoveis = r.itens;
      carregarResumos().then(function () { rota(); carregandoInicio = false; });
    });
  });
})();
