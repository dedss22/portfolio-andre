/* ==========================================================================
   Guia do sandbox Cassiano Imóveis (só na demonstração, nada aqui existe no painel real).
   - Balão com seta apontando o próximo passo, com o alvo destacado.
   - Formulário de imóvel novo já preenchido com um exemplo; campos obrigatórios marcados.
   - Dicas curtas ao focar campos importantes.
   - Datas sugeridas na página da casa; agenda aberta no período da pré-reserva.
   - Comemoração ao concluir cada etapa, com atalho para a próxima.
   - Botão "Me guie" para reabrir o balão a qualquer momento.
   Estado: progresso no banco fictício (localStorage); o que já foi visto/pulado fica no
   sessionStorage (só nesta aba do navegador).
   ========================================================================== */
(function () {
  'use strict';
  var S = window.SandboxCassiano;
  if (!S) return;

  var EMB = window.parent !== window;
  var K_OFF = 'cassiano-sandbox:guia-off';
  var K_VISTOS = 'cassiano-sandbox:guia-vistos';
  var K_FESTA = 'cassiano-sandbox:guia-festa';
  var ORDEM = ['entrou', 'criou', 'publicou', 'viu_site', 'pre_reserva', 'agenda', 'planilha'];
  var NOMES = { entrou: 'Entrar no painel', criou: 'Cadastrar um imóvel', publicou: 'Publicar no site', viu_site: 'Ver no site', pre_reserva: 'Fazer uma pré-reserva', agenda: 'Conferir na agenda', planilha: 'Abrir a planilha' };
  var REDUZIR = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var caminho = (location.pathname.split('/sandbox/cassiano/')[1] || '').replace(/^\/+/, '');

  // ---------------------------------------------------------------- estado
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } return null; }
  function vistos() { try { return JSON.parse(ss(K_VISTOS) || '{}'); } catch (e) { return {}; } }
  function marcarVisto(id) { var v = vistos(); v[id] = 1; ss(K_VISTOS, JSON.stringify(v)); }
  function desligado() { return ss(K_OFF) === '1'; }
  function progresso() { try { return S.carregar().progresso || {}; } catch (e) { return {}; } }
  function passoAtual(p) { for (var i = 0; i < ORDEM.length; i++) if (!p[ORDEM[i]]) return ORDEM[i]; return null; }
  function rotuloEtapa(id) { var i = ORDEM.indexOf(id); return i < 0 ? 'Demonstração' : 'Passo ' + (i + 1) + ' de ' + ORDEM.length + ' · ' + NOMES[id]; }

  function visivel(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; }
  function q(sel) { var l = document.querySelectorAll(sel); for (var i = 0; i < l.length; i++) if (visivel(l[i])) return l[i]; return null; }
  function porTexto(sel, re) { var l = document.querySelectorAll(sel); for (var i = 0; i < l.length; i++) if (visivel(l[i]) && re.test(l[i].textContent)) return l[i]; return null; }
  function emFormulario() { return /^#\/(novo|editar)\//.test(location.hash); }
  function emNovo() { return /^#\/novo\/venda$/.test(location.hash); }

  /** Vai para outra aba da moldura (ou outra página, fora da moldura). */
  function irPara(aba, pagina) {
    if (EMB) { try { window.parent.postMessage({ tipo: 'cassiano-sandbox:abrir', aba: aba, pagina: pagina || null }, location.origin); return; } catch (e) { /* segue */ } }
    var base = location.pathname.slice(0, location.pathname.indexOf('/sandbox/cassiano/') + '/sandbox/cassiano/'.length);
    var destino = { painel: 'admin/' + (pagina || 'login.html'), casa: 'site/casa.html', planilha: 'planilha.html', site: 'site/index.html' }[aba];
    location.href = base + destino;
  }

  // ---------------------------------------------------------------- o que mostrar em cada página
  /* Cada item: { id, el, texto, botao?: {rotulo, acao} }. O primeiro ainda não visto é o mostrado.
     Sem "el", o balão aparece centralizado no rodapé da tela. */
  function itens() {
    var p = progresso(), passo = passoAtual(p), l = [];
    if (/admin\/login\.html$/.test(caminho)) {
      l.push({ id: 'login', etapa: 'entrou', el: q('button[type=submit]'), texto: 'Clique aqui para entrar como o <strong>Cassiano</strong>. Não tem senha: é uma demonstração.' });
    } else if (/admin\/imoveis\.html$/.test(caminho)) {
      if (!p.criou) {
        if (emNovo()) l.push({ id: 'form-publicar', etapa: 'criou', el: porTexto('button.primario', /^\s*Publicar\s*$/), texto: 'Já deixamos um <strong>exemplo preenchido</strong>: os campos com <strong>obrigatório</strong> são os únicos necessários. Mude o que quiser e clique em <strong>Publicar</strong>.' });
        else if (!emFormulario()) l.push({ id: 'criar', etapa: 'criou', el: q('a[href="#/novo/venda"]'), texto: 'Comece por aqui: crie o seu primeiro imóvel. O formulário já vem com um exemplo.' });
      } else if (!p.publicou) {
        if (emFormulario()) l.push({ id: 'voltar-lista', etapa: 'publicou', el: q('a.botao[href="#/"]') || porTexto('a.botao', /Voltar/), texto: 'Imóvel salvo! Agora volte para a lista para enviá-lo ao site.' });
        else l.push({ id: 'publicar-site', etapa: 'publicou', el: porTexto('#publicar button', /Publicar no site/), texto: 'Clique em <strong>Publicar no site</strong>: o site é refeito com o seu imóvel. Se algo falhar, o site anterior continua no ar.' });
      } else if (passo) {
        l.push(proximaAba(passo));
      }
    } else if (/admin\/calendario\.html$/.test(caminho)) {
      var faixa = porTexto('.ag-faixa.t-pre_reserva', /Visitante do portf/) || q('.ag-faixa.t-pre_reserva.o-site');
      if (faixa) l.push({ id: 'agenda-faixa', etapa: 'agenda', el: faixa, texto: 'Esta é a <strong>sua pré-reserva</strong>, que chegou do site. Clique nela para ver a <strong>validade de 48 h</strong>.' });
      else if (!temPreReserva()) l.push({ id: 'agenda-sem', etapa: 'pre_reserva', texto: 'Ainda não há pré-reserva sua aqui. Faça uma na aba <strong>Página da casa</strong> e volte.', botao: { rotulo: 'Ir para a casa', acao: function () { irPara('casa'); } } });
      if (p.agenda && !p.planilha) l.push(proximaAba('planilha'));
    } else if (/site\/index\.html$/.test(caminho)) {
      var novo = q('.cs-card-selo.novo');
      if (novo) l.push({ id: 'site-novo', etapa: 'viu_site', el: novo.closest('.cs-card') || novo, texto: 'Este é o <strong>seu imóvel</strong>, já no site, com o selo <strong>Novo</strong>.' });
      else if (!p.publicou) l.push({ id: 'site-sem', etapa: 'publicou', texto: 'O seu imóvel ainda não está no site: cadastre e clique em <strong>Publicar no site</strong> no painel.', botao: { rotulo: 'Ir para o painel', acao: function () { irPara('painel', 'imoveis.html'); } } });
      if (passo === 'pre_reserva') l.push(proximaAba('pre_reserva'));
    } else if (/site\/casa\.html$/.test(caminho)) {
      if (!p.pre_reserva) l.push({ id: 'casa-reservar', etapa: 'pre_reserva', el: q('[data-mr=reservar]'), texto: 'Agora você é o <strong>visitante</strong>. Já sugerimos as datas; mude se quiser e clique em <strong>Fazer pré-reserva</strong>.' });
      else if (!p.agenda) l.push(proximaAba('agenda'));
    } else if (/planilha\.html$/.test(caminho)) {
      var cel = q('td.c-res[data-estado="pre_reserva"]');
      if (cel) l.push({ id: 'planilha-cel', etapa: 'planilha', el: cel, texto: 'Na planilha do dono, a <strong>sua pré-reserva</strong> aparece em amarelo.' });
      l.push({ id: 'planilha-baixar', etapa: 'planilha', el: q('#pl-baixar'), texto: 'Clique em <strong>Baixar .xlsx</strong> para abrir a mesma planilha no Excel.' });
    }
    var v = vistos();
    return l.filter(function (x) { return x && !v[x.id]; });
  }
  function temPreReserva() { try { return (S.carregar().reservas || []).some(function (r) { return r.estado === 'pre_reserva' && r.origem === 'site'; }); } catch (e) { return false; } }
  function proximaAba(passo) {
    var mapa = {
      viu_site: { aba: 'site', rotulo: 'Ver no site', texto: 'Pronto no painel! Veja o seu imóvel na <strong>prévia do site</strong>.' },
      pre_reserva: { aba: 'casa', rotulo: 'Ir para a casa', texto: 'Próximo: seja o <strong>visitante</strong> e faça uma pré-reserva numa casa de temporada.' },
      agenda: { aba: 'painel', pagina: 'calendario.html', rotulo: 'Ver na agenda', texto: 'A pré-reserva já chegou no painel do dono. Confira na <strong>agenda</strong>.' },
      planilha: { aba: 'planilha', rotulo: 'Abrir a planilha', texto: 'Último passo: a <strong>planilha</strong> que o dono baixa, com a sua pré-reserva.' }
    }[passo];
    if (!mapa) return null;
    return { id: 'ir-' + passo, texto: mapa.texto, etapa: passo, botao: { rotulo: mapa.rotulo, acao: function () { irPara(mapa.aba, mapa.pagina); } } };
  }

  // ---------------------------------------------------------------- balão
  var balao = null, alvo = null, atual = null;
  function limparAlvo() { if (alvo) alvo.classList.remove('gui-alvo', 'gui-alvo-rel'); alvo = null; }
  function fechar() { limparAlvo(); if (balao) balao.hidden = true; atual = null; }
  function montarBalao() {
    balao = document.createElement('div');
    balao.className = 'gui-balao'; balao.setAttribute('role', 'status'); balao.setAttribute('aria-live', 'polite'); balao.hidden = true;
    document.body.appendChild(balao);
  }
  function mostrar(it) {
    if (!balao) montarBalao();
    var mudou = !atual || atual.id !== it.id;
    atual = it;
    if (mudou) {
      balao.innerHTML = '';
      var et = document.createElement('span'); et.className = 'gui-etapa'; et.textContent = rotuloEtapa(it.etapa || passoAtual(progresso()));
      var tx = document.createElement('p'); tx.className = 'gui-texto'; tx.innerHTML = it.texto;
      var ac = document.createElement('div'); ac.className = 'gui-acoes';
      if (it.botao) ac.appendChild(botao(it.botao.rotulo, 'prim', function () { marcarVisto(it.id); it.botao.acao(); }));
      ac.appendChild(botao(it.botao ? 'Depois' : 'Entendi', it.botao ? '' : 'prim', function () { marcarVisto(it.id); fechar(); avaliar(); }));
      ac.appendChild(botao('Pular guia', '', function () { ss(K_OFF, '1'); fechar(); }));
      balao.appendChild(et); balao.appendChild(tx); balao.appendChild(ac);
      if (it.el && visivel(it.el)) rolarDentro(it.el);
    }
    if (alvo !== it.el) { limparAlvo(); if (it.el) { alvo = it.el; alvo.classList.add('gui-alvo'); if (getComputedStyle(alvo).position === 'static') alvo.classList.add('gui-alvo-rel'); } }
    balao.hidden = false;
    posicionar();
  }
  /** Rola só esta página (o iframe), nunca a página do portfólio por fora: scrollIntoView rolaria as duas. */
  function rolarDentro(el) {
    // tabelas largas (planilha, agenda): traz o alvo para dentro da área com rolagem lateral
    for (var c = el.parentElement; c && c !== document.body; c = c.parentElement) {
      var ox = getComputedStyle(c).overflowX;
      if ((ox === 'auto' || ox === 'scroll') && c.scrollWidth > c.clientWidth) {
        var rc = c.getBoundingClientRect(), re = el.getBoundingClientRect();
        if (re.left < rc.left || re.right > rc.right) c.scrollLeft += re.left - rc.left - Math.max(16, (rc.width - Math.min(re.width, rc.width)) / 2);
        break;
      }
    }
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top >= 70 && r.bottom <= vh - 70) return;
    var y = window.scrollY + r.top - vh / 2 + r.height / 2;
    try { window.scrollTo({ top: Math.max(0, y), behavior: REDUZIR ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, Math.max(0, y)); }
  }
  function botao(rotulo, cls, fn) { var b = document.createElement('button'); b.type = 'button'; b.className = 'gui-btn' + (cls ? ' ' + cls : ''); b.textContent = rotulo; b.addEventListener('click', fn); return b; }
  function posicionar() {
    if (!balao || balao.hidden || !atual) return;
    if (!atual.el || !visivel(atual.el)) { balao.setAttribute('data-lado', 'centro'); balao.style.left = ''; balao.style.top = ''; return; }
    var r = atual.el.getBoundingClientRect(), b = balao.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 12;
    var lado = (r.bottom + b.height + 16 < vh || r.top < b.height + 16) ? 'baixo' : 'cima';
    var top = lado === 'baixo' ? r.bottom + 12 : r.top - b.height - 12;
    var left = Math.max(m, Math.min(vw - b.width - m, r.left + r.width / 2 - b.width / 2));
    balao.setAttribute('data-lado', lado);
    balao.style.left = left + 'px'; balao.style.top = Math.max(m, top) + 'px';
    balao.style.setProperty('--gui-seta-x', Math.max(14, Math.min(b.width - 28, r.left + r.width / 2 - left - 7)) + 'px');
  }

  // ---------------------------------------------------------------- formulário com exemplo
  var EXEMPLO = { titulo: 'Casa de exemplo com piscina e vista para o mar', titulo_card: 'Casa com piscina e vista', badge_destaque: 'Exemplo', bairro: 'Bairro Exemplo', cidade: 'Cidade Exemplo', preco_centavos: '1.250.000,00', quartos: '3', suites: '2', banheiros: '3', vagas: '2', resumo_card: 'Casa fictícia criada na demonstração: 3 quartos, piscina e vista para o mar.' };
  function definir(el, v) {
    if (!el) return;
    var proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var set = Object.getOwnPropertyDescriptor(proto, 'value').set; set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function primeiraOpcao(sel) { if (!sel) return; for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value) { definir(sel, sel.options[i].value); return; } }
  function preencherExemplo(forcar) {
    var t = document.getElementById('c-titulo');
    if (!t || (!forcar && t.value)) return;
    Object.keys(EXEMPLO).forEach(function (k) { var el = document.getElementById('c-' + k); if (el && (forcar || !el.value)) definir(el, EXEMPLO[k]); });
    var d = document.getElementById('c-destino_slug'), ti = document.getElementById('c-tipo_imovel');
    if (d && (forcar || !d.value)) primeiraOpcao(d);
    if (ti && (forcar || !ti.value)) primeiraOpcao(ti);
  }
  var formPreparado = null;
  function prepararFormulario() {
    if (!emNovo()) { formPreparado = null; return; }
    var t = document.getElementById('c-titulo');
    if (!t || formPreparado === t) return;
    formPreparado = t;
    preencherExemplo(false);
    ['titulo', 'destino_slug', 'tipo_imovel', 'preco_centavos'].forEach(function (k) { var el = document.getElementById('c-' + k); var c = el && el.closest('.campo-f, .campo'); if (c) c.classList.add('gui-obrig'); });
    var cartao = t.closest('section, .cartao');
    if (cartao && !document.querySelector('.gui-exemplo-caixa')) {
      var caixa = document.createElement('div'); caixa.className = 'gui-exemplo-caixa';
      var s = document.createElement('span'); s.textContent = 'Preenchemos um imóvel de exemplo para você. Mude o que quiser ou:';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'gui-exemplo'; b.textContent = 'Preencher exemplo de novo';
      b.addEventListener('click', function () { preencherExemplo(true); });
      caixa.appendChild(s); caixa.appendChild(b);
      cartao.parentNode.insertBefore(caixa, cartao);
    }
  }

  // ---------------------------------------------------------------- dicas de campo
  var DICAS = {
    'c-titulo': 'Aparece no topo da página do imóvel e no Google.',
    'c-titulo_card': 'Versão curta, usada no cartão da lista.',
    'c-destino_slug': 'Define em qual destino o imóvel aparece no site.',
    'c-preco_centavos': 'Pode ficar como “sob consulta”: marque a opção logo abaixo.',
    'c-resumo_card': 'Duas ou três linhas que aparecem no cartão da lista.',
    'c-descricao': 'Texto da página do imóvel. Linha em branco separa parágrafos.'
  };
  var dica = null;
  function mostrarDica(el) {
    var t = DICAS[el.id]; if (!t) return esconderDica();
    if (!dica) { dica = document.createElement('div'); dica.className = 'gui-dica'; dica.setAttribute('role', 'note'); document.body.appendChild(dica); }
    dica.textContent = t; dica.hidden = false;
    el.setAttribute('aria-describedby', ((el.getAttribute('aria-describedby') || '') + ' gui-dica-txt').trim()); dica.id = 'gui-dica-txt';
    var r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    dica.style.left = Math.max(12, Math.min(vw - dica.offsetWidth - 12, r.left)) + 'px';
    dica.style.top = (r.top - dica.offsetHeight - 8 > 8 ? r.top - dica.offsetHeight - 8 : r.bottom + 8) + 'px';
  }
  function esconderDica() { if (dica) dica.hidden = true; }
  document.addEventListener('focusin', function (e) { if (e.target && e.target.id && DICAS[e.target.id]) mostrarDica(e.target); else esconderDica(); });
  document.addEventListener('focusout', esconderDica);

  // ---------------------------------------------------------------- página da casa: datas sugeridas
  var casaPronta = false;
  function sugerirDatas() {
    if (casaPronta || !/site\/casa\.html$/.test(caminho) || progresso().pre_reserva) return;
    var dias = document.querySelectorAll('[data-dia][data-estado="livre"]');
    if (!dias.length) return;
    casaPronta = true;
    var limite = S.addDias(S.hojeIso(), 7);
    for (var i = 0; i < dias.length; i++) {
      var d = dias[i].getAttribute('data-dia'); if (d < limite) continue;
      dias[i].click();
      var saida = null, depois = document.querySelectorAll('[data-dia][data-estado="livre"]');
      for (var j = 0; j < depois.length; j++) if (depois[j].getAttribute('data-dia') > d) { saida = depois[j]; break; }
      if (saida) { saida.click(); break; }
    }
    var nome = document.getElementById('mr-nome');
    if (nome && !nome.value) definir(nome, 'Visitante do portfólio');
  }

  // ---------------------------------------------------------------- agenda: abrir no período da pré-reserva
  var agendaAjustada = false;
  function ultimaPreReserva() {
    try { var l = (S.carregar().reservas || []).filter(function (r) { return r.estado === 'pre_reserva' && r.origem === 'site'; }); return l.length ? l[l.length - 1] : null; } catch (e) { return null; }
  }
  function ajustarAgenda() {
    if (agendaAjustada || !/admin\/calendario\.html$/.test(caminho)) return;
    var r = ultimaPreReserva(), mes = q('[data-atalho="mes"]');
    if (!r || !mes) return;
    agendaAjustada = true;
    if (mes.getAttribute('aria-pressed') !== 'true') return;   // o visitante já escolheu outro período: respeita
    var dias = S.noites(S.hojeIso(), r.entrada), alvo = dias <= 25 ? '30' : dias <= 85 ? '90' : 'ano';
    var b = q('[data-atalho="' + alvo + '"]'); if (b) b.click();
  }

  // ---------------------------------------------------------------- comemoração
  var FESTA = {
    criou: { pagina: /admin\/imoveis\.html$/, texto: 'Imóvel criado!' },
    publicou: { pagina: /admin\/imoveis\.html$/, texto: 'Site atualizado! O seu imóvel já está no ar (na prévia).', rotulo: 'Ver no site', aba: 'site' },
    pre_reserva: { pagina: /site\/casa\.html$/, texto: 'Pré-reserva enviada! Ela já chegou no painel do dono.', rotulo: 'Ver na agenda', aba: 'painel', destino: 'calendario.html' },
    planilha: { pagina: /planilha\.html$/, texto: 'Pronto! Você fez o ciclo completo do dono.' }
  };
  function comemorar(antes, agora) {
    var feitas; try { feitas = JSON.parse(ss(K_FESTA) || '{}'); } catch (e) { feitas = {}; }
    Object.keys(FESTA).forEach(function (k) {
      // só comemora na tela onde a ação aconteceu (as outras abas da moldura também estão abertas)
      if (agora[k] && !antes[k] && !feitas[k] && FESTA[k].pagina.test(caminho)) {
        feitas[k] = 1; ss(K_FESTA, JSON.stringify(feitas));
        var f = FESTA[k], el = document.createElement('div'); el.className = 'gui-festa'; el.setAttribute('role', 'status');
        var s = document.createElement('span'); s.textContent = f.texto; el.appendChild(s);
        if (f.rotulo) el.appendChild(botao(f.rotulo, '', function () { el.remove(); irPara(f.aba, f.destino); }));
        el.appendChild(botao('Fechar', '', function () { el.remove(); }));
        document.body.appendChild(el);
        setTimeout(function () { if (el.parentNode) el.remove(); }, 9000);
      }
    });
  }

  // ---------------------------------------------------------------- "Me guie"
  function montarMeGuie() {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'gui-me-guie'; b.textContent = 'Me guie';
    b.setAttribute('aria-label', 'Me guie: mostrar o próximo passo da demonstração');
    b.addEventListener('click', function () { ss(K_OFF, null); ss(K_VISTOS, null); fechar(); avaliar(); if (!atual) { var it = proximaAba(passoAtual(progresso())); if (it) mostrar(it); else mostrar({ id: 'fim', texto: 'Você já fez o ciclo completo. Explore à vontade ou use <strong>Restaurar dados</strong> para recomeçar.' }); } });
    document.body.appendChild(b);
  }

  // ---------------------------------------------------------------- ciclo
  var ultimo = progresso();
  function avaliar() {
    prepararFormulario(); sugerirDatas(); ajustarAgenda();
    var agora = progresso(); comemorar(ultimo, agora); ultimo = agora;
    if (desligado()) { fechar(); return; }
    // janela do build (ou outra caixa modal) aberta: ela já orienta; o balão espera
    if (q('.sbx-build') || q('dialog[open]')) { fechar(); return; }
    var l = itens(), it = null;
    for (var i = 0; i < l.length; i++) if (!l[i].el || visivel(l[i].el) || !('el' in l[i])) { it = l[i]; break; }
    // um alvo esperado que ainda não apareceu: espera, não mostra balão solto
    if (it && 'el' in it && !it.el) it = null;
    if (it) mostrar(it); else if (atual) fechar();
  }
  function iniciar() {
    montarMeGuie();
    avaliar();
    setInterval(avaliar, 500);
    window.addEventListener('hashchange', function () { fechar(); setTimeout(avaliar, 60); });
    window.addEventListener('scroll', posicionar, true);
    window.addEventListener('resize', posicionar);
    document.addEventListener('click', function (e) { if (atual && atual.el && atual.el.contains(e.target)) { marcarVisto(atual.id); fechar(); setTimeout(avaliar, 300); } }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
