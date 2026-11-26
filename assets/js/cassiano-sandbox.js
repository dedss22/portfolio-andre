/* ==========================================================================
   Cassiano Imóveis — moldura do sandbox (abas + tour curto), galeria com lightbox.
   O sandbox roda em iframes do próprio portfólio (sandbox/cassiano/...), 100% no navegador:
   nenhuma chamada ao sistema real. O progresso do tour vem do localStorage compartilhado
   pelos iframes e de mensagens postMessage da mesma origem.
   ========================================================================== */
(function () {
  'use strict';
  var CHAVE = 'cassiano-sandbox:v1';
  var BASE = 'sandbox/cassiano/';
  var ABAS = {
    painel: { inicio: 'admin/login.html', rotulo: '/admin' },
    casa: { inicio: 'site/casa.html', rotulo: '/temporada/casa-de-exemplo' },
    planilha: { inicio: 'planilha.html', rotulo: 'agenda-geral.xlsx' },
    site: { inicio: 'site/index.html', rotulo: '/' }
  };
  var PASSOS = [
    { id: 'entrou', aba: 'painel', pagina: 'admin/login.html' },
    { id: 'criou', aba: 'painel', pagina: 'admin/imoveis.html#/novo/venda' },
    { id: 'publicou', aba: 'painel', pagina: 'admin/imoveis.html' },
    { id: 'viu_site', aba: 'site', pagina: 'site/index.html' },
    { id: 'pre_reserva', aba: 'casa', pagina: 'site/casa.html' },
    { id: 'agenda', aba: 'painel', pagina: 'admin/calendario.html' },
    { id: 'planilha', aba: 'planilha', pagina: 'planilha.html' }
  ];
  var TXT = {
    pt: {
      guia: [
        'Clique em <strong>“Entrar na demonstração”</strong>. Não tem senha: você entra como o dono.',
        'Clique em <strong>“Criar novo imóvel”</strong>, preencha título, destino, tipo e preço e <strong>salve o rascunho</strong>. Depois, se quiser, adicione uma foto do seu computador (ela não sai do navegador).',
        'Mude a situação para <strong>Publicado</strong> (botão “Publicar” no formulário) e, na lista, clique em <strong>“Publicar no site”</strong>. Veja as etapas do build.',
        'Esta é a prévia do site. O imóvel que você publicou aparece aqui com o selo <strong>Novo</strong>.',
        'Agora você é o visitante: escolha a <strong>entrada</strong> e a <strong>saída</strong> no calendário e clique em <strong>“Fazer pré-reserva”</strong>.',
        'De volta ao painel: na <strong>Agenda geral</strong>, escolha “Próximos 30 dias” ou “Próximos 90 dias” e clique na faixa amarela tracejada para ver a <strong>validade</strong> da pré-reserva.',
        'Esta é a planilha que o dono baixa. A sua pré-reserva aparece em amarelo. Clique em <strong>“Baixar .xlsx”</strong> para abrir no Excel.'
      ],
      ok: 'Feito!', passo: 'Passo', de: 'de', concluidos: 'concluídos', fim: 'Pronto! Você fez o ciclo completo do dono: cadastrou, publicou, recebeu uma pré-reserva e conferiu a planilha.',
      restaurar: 'Restaurar dados', confirmar: 'Toque de novo para confirmar', restaurado: 'Dados de demonstração restaurados.',
      carregando: 'Carregando a demonstração…', fechar: 'Fechar', anterior: 'Imagem anterior', proxima: 'Próxima imagem', imagem: 'Imagem'
    },
    en: {
      guia: [
        'Click <strong>“Entrar na demonstração”</strong> (enter the demo). No password: you sign in as the owner.',
        'Click <strong>“Criar novo imóvel”</strong> (new listing), fill in title, destination, type and price and <strong>save the draft</strong>. Optionally add a photo from your computer (it never leaves your browser).',
        'Set it to <strong>Published</strong> (the “Publicar” button in the form), then click <strong>“Publicar no site”</strong> (publish to site) in the list and watch the build steps.',
        'This is the website preview. The listing you published shows up here with a <strong>Novo</strong> (new) badge.',
        'Now you are the guest: pick <strong>check-in</strong> and <strong>check-out</strong> dates and click <strong>“Fazer pré-reserva”</strong> (pre-book).',
        'Back in the panel: in the <strong>Agenda geral</strong> (combined calendar), pick “Próximos 30 dias” and click the dashed yellow bar to see the pre-booking <strong>expiry</strong>.',
        'This is the spreadsheet the owner downloads. Your pre-booking appears in yellow. Click <strong>“Baixar .xlsx”</strong> to open it in Excel.'
      ],
      ok: 'Done!', passo: 'Step', de: 'of', concluidos: 'completed', fim: 'All set! You went through the owner’s full cycle: added a listing, published it, received a pre-booking and checked the spreadsheet.',
      restaurar: 'Reset data', confirmar: 'Tap again to confirm', restaurado: 'Demo data restored.',
      carregando: 'Loading the demo…', fechar: 'Close', anterior: 'Previous image', proxima: 'Next image', imagem: 'Image'
    }
  };
  function lang() { return document.documentElement.lang && document.documentElement.lang.indexOf('en') === 0 ? 'en' : 'pt'; }
  function t() { return TXT[lang()]; }
  var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lerProgresso() {
    try { var db = JSON.parse(localStorage.getItem(CHAVE) || 'null'); return (db && db.progresso) || {}; } catch (e) { return {}; }
  }
  function atualizarLoco() {
    try { if (typeof scroll !== 'undefined' && scroll && typeof scroll.update === 'function') scroll.update(); } catch (e) { /* sem Locomotive */ }
  }
  function rolarAte(el) {
    try {
      if (document.documentElement.classList.contains('has-scroll-smooth') && typeof scroll !== 'undefined' && scroll && typeof scroll.scrollTo === 'function') { scroll.scrollTo(el, { offset: -24, duration: reduzido ? 0 : 900 }); return; }
    } catch (e) { /* segue */ }
    el.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'start' });
  }

  function iniciarSandbox() {
    var raiz = document.getElementById('cassiano-sandbox');
    if (!raiz || raiz.getAttribute('data-pronto')) return;
    raiz.setAttribute('data-pronto', '1');
    var palco = raiz.querySelector('.csb-palco'), url = raiz.querySelector('[data-csb-url]');
    var abas = Array.prototype.slice.call(raiz.querySelectorAll('.csb-tab'));
    var frames = {}, atual = null, tourAtivo = false, passoAtual = 0;
    var carregando = raiz.querySelector('.csb-carregando');

    function frame(aba) {
      if (frames[aba]) return frames[aba];
      var f = document.createElement('iframe');
      f.title = raiz.querySelector('#csb-tab-' + aba).textContent.trim();
      f.setAttribute('data-aba', aba);
      f.hidden = true;
      f.addEventListener('load', function () {
        if (aba === atual) { carregando.hidden = true; mostrarEndereco(); }
        atualizarLoco();
      });
      palco.appendChild(f);
      frames[aba] = f;
      return f;
    }
    function mostrarEndereco() {
      var f = frames[atual], caminho = ABAS[atual].rotulo;
      try { var p = f.contentWindow.location.pathname.split('/sandbox/cassiano/')[1]; if (p) caminho = '/' + p.replace(/\.html$/, '').replace(/^site\//, '').replace('index', '') + (f.contentWindow.location.hash || ''); } catch (e) { /* ainda carregando */ }
      url.textContent = caminho;
    }
    function abrir(aba, pagina, focar) {
      var f = frame(aba), recarregar = !!f.src && atual !== aba;
      atual = aba;
      abas.forEach(function (b) { var sel = b.getAttribute('data-aba') === aba; b.setAttribute('aria-selected', String(sel)); b.tabIndex = sel ? 0 : -1; });
      Object.keys(frames).forEach(function (k) { frames[k].hidden = k !== aba; });
      palco.classList.toggle('is-planilha', aba === 'planilha');
      palco.setAttribute('aria-labelledby', 'csb-tab-' + aba);
      var destino = BASE + (pagina || ABAS[aba].inicio);
      if (!f.src || pagina) { carregando.hidden = false; f.src = destino; }
      else if (recarregar) { carregando.hidden = false; try { f.contentWindow.location.reload(); } catch (e) { f.src = destino; } }
      mostrarEndereco();
      if (focar) raiz.querySelector('#csb-tab-' + aba).focus();
    }
    abas.forEach(function (b, i) {
      b.addEventListener('click', function () { abrir(b.getAttribute('data-aba')); });
      b.addEventListener('keydown', function (e) {
        var d = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key]; if (d === undefined) return;
        e.preventDefault();
        var n = d === -99 ? 0 : d === 99 ? abas.length - 1 : (i + d + abas.length) % abas.length;
        abrir(abas[n].getAttribute('data-aba'), null, true);
      });
    });

    // ---- progresso e tour
    var passosEl = Array.prototype.slice.call(raiz.querySelectorAll('.csb-step'));
    var guia = raiz.querySelector('.csb-guia'), guiaTexto = guia.querySelector('p'), guiaProx = guia.querySelector('[data-csb-prox]'), guiaFim = guia.querySelector('[data-csb-fim]');
    function desenharProgresso() {
      var p = lerProgresso(), feitos = 0;
      passosEl.forEach(function (b, i) {
        var ok = !!p[PASSOS[i].id]; if (ok) feitos++;
        b.classList.toggle('is-feito', ok);
        b.classList.toggle('is-atual', tourAtivo && i === passoAtual);
        b.setAttribute('aria-current', tourAtivo && i === passoAtual ? 'step' : 'false');
      });
      raiz.querySelector('[data-csb-feitos]').textContent = String(feitos);
      raiz.querySelector('.csb-barra span').style.width = Math.round(feitos / PASSOS.length * 100) + '%';
      raiz.querySelector('.csb-barra').setAttribute('aria-valuenow', String(feitos));
      return p;
    }
    function mostrarGuia(ok) {
      var x = t();
      guia.hidden = !tourAtivo;
      if (!tourAtivo) return;
      guia.classList.toggle('is-ok', !!ok);
      if (ok === 'fim') { guiaTexto.innerHTML = '<strong>' + x.ok + '</strong> ' + x.fim; guiaProx.hidden = true; return; }
      guiaProx.hidden = passoAtual >= PASSOS.length - 1;
      guiaTexto.innerHTML = (ok ? '<strong>' + x.ok + '</strong> ' : '') + '<strong>' + x.passo + ' ' + (passoAtual + 1) + ' ' + x.de + ' ' + PASSOS.length + ':</strong> ' + x.guia[passoAtual];
    }
    function irPasso(i) {
      passoAtual = Math.max(0, Math.min(PASSOS.length - 1, i));
      var s = PASSOS[passoAtual];
      abrir(s.aba, s.pagina);
      desenharProgresso(); mostrarGuia(false);
    }
    passosEl.forEach(function (b, i) { b.addEventListener('click', function () { tourAtivo = true; irPasso(i); }); });
    guiaProx.addEventListener('click', function () { irPasso(passoAtual + 1); });
    guiaFim.addEventListener('click', function () { tourAtivo = false; desenharProgresso(); mostrarGuia(); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-csb-comecar]'), function (b) {
      b.addEventListener('click', function () {
        tourAtivo = true;
        var p = lerProgresso(), primeiro = 0;
        while (primeiro < PASSOS.length - 1 && p[PASSOS[primeiro].id]) primeiro++;
        irPasso(primeiro);
        rolarAte(raiz);
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-csb-ir]'), function (b) { b.addEventListener('click', function () { rolarAte(raiz); }); });
    function aoProgresso(passo) {
      var p = desenharProgresso();
      if (!tourAtivo || PASSOS[passoAtual].id !== passo) return;
      var tudo = PASSOS.every(function (s) { return p[s.id]; });
      mostrarGuia(tudo ? 'fim' : true);
    }

    window.addEventListener('message', function (e) {
      if (e.origin !== location.origin || !e.data || typeof e.data.tipo !== 'string') return;
      if (e.data.tipo === 'cassiano-sandbox:progresso') aoProgresso(e.data.passo);
      else if (e.data.tipo === 'cassiano-sandbox:abrir' && ABAS[e.data.aba]) {
        abrir(e.data.aba, e.data.pagina ? (e.data.aba === 'painel' ? 'admin/' : '') + e.data.pagina : null);
        if (tourAtivo) { for (var i = 0; i < PASSOS.length; i++) if (PASSOS[i].aba === e.data.aba && !lerProgresso()[PASSOS[i].id]) { passoAtual = i; break; } desenharProgresso(); mostrarGuia(false); }
      } else if (e.data.tipo === 'cassiano-sandbox:restaurado') { desenharProgresso(); recarregarOutros(); }
    });
    window.addEventListener('storage', function (e) { if (e.key === CHAVE || e.key === null) desenharProgresso(); });
    function recarregarOutros() { Object.keys(frames).forEach(function (k) { if (k !== atual && frames[k].src) frames[k].removeAttribute('src'); }); }

    // ---- barra da moldura: restaurar e abrir em nova aba
    var bRest = raiz.querySelector('[data-csb-restaurar]'), timerRest = null;
    bRest.addEventListener('click', function () {
      var x = t();
      if (bRest.getAttribute('data-confirmar') !== '1') {
        bRest.setAttribute('data-confirmar', '1'); bRest.textContent = x.confirmar;
        clearTimeout(timerRest); timerRest = setTimeout(function () { bRest.removeAttribute('data-confirmar'); bRest.textContent = t().restaurar; }, 4000);
        return;
      }
      clearTimeout(timerRest); bRest.removeAttribute('data-confirmar'); bRest.textContent = x.restaurar;
      try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento: o sandbox usa memoria */ }
      Object.keys(frames).forEach(function (k) { frames[k].removeAttribute('src'); });
      tourAtivo = false; mostrarGuia();
      abrir(atual || 'painel', ABAS[atual || 'painel'].inicio);
      desenharProgresso();
      var st = raiz.querySelector('[data-csb-status]'); st.textContent = x.restaurado; setTimeout(function () { st.textContent = ''; }, 4000);
    });
    raiz.querySelector('[data-csb-novaaba]').addEventListener('click', function (e) {
      var f = frames[atual]; if (!f) return;
      try { e.currentTarget.href = f.contentWindow.location.href; } catch (err) { e.currentTarget.href = BASE + ABAS[atual].inicio; }
    });

    window.addEventListener('portfolio:langchange', function () { bRest.textContent = t().restaurar; carregando.textContent = t().carregando; mostrarGuia(); });
    desenharProgresso();
    // carrega a primeira aba so quando a moldura chega perto da tela (pagina mais leve)
    var iniciar = function () { if (!atual) abrir('painel'); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en.some(function (x) { return x.isIntersecting; })) { iniciar(); io.disconnect(); } }, { rootMargin: '400px 0px' });
      io.observe(palco);
    } else iniciar();
    setTimeout(iniciar, 6000);   // Locomotive pode atrasar o observer; garante o carregamento
  }

  // ---------------------------------------------------------------- galeria + lightbox
  function iniciarGaleria() {
    var botoes = Array.prototype.slice.call(document.querySelectorAll('.csb-fig-btn'));
    if (!botoes.length) return;
    var lb = document.createElement('div'), idx = 0, voltarFoco = null;
    lb.className = 'csb-lb'; lb.hidden = true;
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-labelledby', 'csb-lb-titulo');
    lb.innerHTML = '<span class="csb-lb-conta" aria-live="polite"></span><button type="button" class="csb-lb-fechar">&#x2715;</button><button type="button" class="csb-lb-ant">&#x2039;</button><button type="button" class="csb-lb-prox">&#x203A;</button><figure><img alt=""><figcaption><strong id="csb-lb-titulo"></strong><span></span></figcaption></figure>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), tit = lb.querySelector('#csb-lb-titulo'), desc = lb.querySelector('figcaption span'), conta = lb.querySelector('.csb-lb-conta');
    var bF = lb.querySelector('.csb-lb-fechar'), bA = lb.querySelector('.csb-lb-ant'), bP = lb.querySelector('.csb-lb-prox');
    function rotulos() { var x = t(); bF.setAttribute('aria-label', x.fechar); bA.setAttribute('aria-label', x.anterior); bP.setAttribute('aria-label', x.proxima); }
    function mostrar(i) {
      idx = (i + botoes.length) % botoes.length;
      var b = botoes[idx], fig = b.closest('figure'), mini = b.querySelector('img');
      img.src = b.getAttribute('data-grande') || mini.currentSrc || mini.src;
      img.alt = mini.alt;
      tit.textContent = fig.querySelector('figcaption strong').textContent;
      desc.textContent = fig.querySelector('figcaption span').textContent;
      conta.textContent = t().imagem + ' ' + (idx + 1) + ' / ' + botoes.length;
    }
    function abrir(i) { voltarFoco = document.activeElement; rotulos(); mostrar(i); lb.hidden = false; document.documentElement.classList.add('csb-lb-aberto'); try { if (typeof scroll !== 'undefined' && scroll && scroll.stop) scroll.stop(); } catch (e) { /* ok */ } bF.focus(); }
    function fechar() { lb.hidden = true; document.documentElement.classList.remove('csb-lb-aberto'); try { if (typeof scroll !== 'undefined' && scroll && scroll.start) scroll.start(); } catch (e) { /* ok */ } if (voltarFoco && voltarFoco.focus) voltarFoco.focus({ preventScroll: true }); }
    botoes.forEach(function (b, i) { b.addEventListener('click', function () { abrir(i); }); });
    bF.addEventListener('click', fechar);
    bA.addEventListener('click', function () { mostrar(idx - 1); });
    bP.addEventListener('click', function () { mostrar(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) fechar(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); fechar(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); mostrar(idx - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(idx + 1); }
      else if (e.key === 'Tab') {   // foco preso nos tres botoes
        var f = [bF, bA, bP], k = f.indexOf(document.activeElement);
        e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('.csb-galeria img'), function (im) { if (!im.complete) im.addEventListener('load', atualizarLoco, { once: true }); });
  }

  function iniciar() { iniciarSandbox(); iniciarGaleria(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
