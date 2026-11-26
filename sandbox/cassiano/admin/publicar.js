/* Copia de demonstracao (sandbox do portfolio) do painel Cassiano Imoveis. Caminhos ajustados; a API e simulada por ../mock-api.js. */
/* Painel: botao "Publicar no site" (so administrador). Dados da API sempre por textContent; sem HTML dinamico. */
(function () {
  'use strict';
  var P = window.Painel;
  var caixa = document.getElementById('publicar');
  if (!P || !caixa) return;
  var h = P.h;
  var TEXTOS = {
    titulo: 'Publicar no site',
    ajuda: 'Envia ao site os imóveis publicados aqui no painel.',
    botao: 'Publicar no site',
    publicando: 'Publicando…',
    iniciada: 'Publicação iniciada. O site atualiza em 1 a 3 minutos.',
    nuncaPublicou: 'Ainda não houve publicação por aqui.',
    naoConfigurada: 'A publicação ainda não está configurada. Peça ajuda a quem cuida do site.',
    falhaEstado: 'Não foi possível ver o estado da publicação.',
    falhaPublicar: 'Não foi possível iniciar a publicação. Tente de novo.'
  };
  var estado = null, timer = null;
  var botao, linhaEstado, linhaUltima, linhaPendentes, linhaEspera, aviso;

  function pendentesTexto(n) { return n === 1 ? '1 alteração ainda não publicada' : n + ' alterações ainda não publicadas'; }
  function esperaTexto(s) { return 'Aguarde ' + s + ' s para publicar de novo.'; }

  function montar() {
    P.limpar(caixa);
    botao = h('button', { class: 'botao primario', type: 'button', id: 'publicar-botao' }, TEXTOS.botao);
    linhaEstado = h('p', { class: 'publicar-estado', role: 'status', 'aria-live': 'polite', id: 'publicar-estado' });
    linhaUltima = h('p', { class: 'publicar-ultima', id: 'publicar-ultima' });
    linhaPendentes = h('p', { class: 'publicar-pendentes', id: 'publicar-pendentes' });
    linhaEspera = h('p', { class: 'publicar-ajuda', id: 'publicar-espera' });
    aviso = h('p', { class: 'publicar-aviso', role: 'note', id: 'publicar-aviso' });
    caixa.appendChild(h('h2', { id: 'publicar-titulo' }, TEXTOS.titulo));
    caixa.appendChild(h('p', { class: 'publicar-ajuda' }, TEXTOS.ajuda));
    caixa.appendChild(aviso);
    caixa.appendChild(h('div', { class: 'publicar-linha' }, botao));
    caixa.appendChild(linhaEstado);
    caixa.appendChild(linhaUltima);
    caixa.appendChild(linhaPendentes);
    caixa.appendChild(linhaEspera);
    botao.addEventListener('click', publicar);
  }

  function desenhar() {
    if (!estado) return;
    aviso.hidden = estado.configurado !== false;
    aviso.textContent = estado.configurado === false ? TEXTOS.naoConfigurada : '';
    linhaUltima.textContent = estado.ultima ? 'Última publicação: ' + P.haQuanto(estado.ultima) : TEXTOS.nuncaPublicou;
    var n = estado.pendentes;
    linhaPendentes.hidden = !(typeof n === 'number' && n > 0);
    linhaPendentes.textContent = linhaPendentes.hidden ? '' : pendentesTexto(n);
    contar();
  }

  function contar() {
    clearInterval(timer);
    var s = estado && estado.espere > 0 ? estado.espere : 0;
    var atualiza = function () {
      linhaEspera.hidden = s <= 0;
      linhaEspera.textContent = s > 0 ? esperaTexto(s) : '';
      botao.disabled = s > 0 || !estado || estado.configurado === false || ocupado;
    };
    atualiza();
    if (s > 0) timer = setInterval(function () { s -= 1; if (s <= 0) { clearInterval(timer); estado.espere = 0; } atualiza(); }, 1000);
  }

  var ocupado = false;
  function mensagem(texto, erro) {
    linhaEstado.textContent = texto || '';
    linhaEstado.className = 'publicar-estado' + (erro ? ' erro' : '');
  }

  function publicar() {
    if (ocupado) return;
    ocupado = true; botao.disabled = true; botao.textContent = TEXTOS.publicando; mensagem('');
    P.api('publicar', { metodo: 'POST' }).then(function (r) {
      ocupado = false; botao.textContent = TEXTOS.botao;
      if (r.ok) {
        estado = { configurado: true, ultima: r.dados.ultima, pendentes: r.dados.pendentes, espere: r.dados.espere || 60 };
        mensagem(TEXTOS.iniciada, false);
      } else if (r.status === 503 && r.dados.erro === 'publicacao_nao_configurada') {
        estado = Object.assign({}, estado, { configurado: false });
        mensagem('', false);
      } else if (r.status === 429) {
        estado = Object.assign({}, estado, { espere: r.dados.espere || 60 });
        mensagem('', false);
      } else {
        mensagem(r.status === 502 ? TEXTOS.falhaPublicar : P.mensagemDeErro(r), true);
      }
      desenhar();
    });
  }

  function carregar() {
    return P.api('publicar').then(function (r) {
      if (r.status === 403) { caixa.hidden = true; return; } // assistente: o bloco nem aparece
      caixa.hidden = false;
      if (!caixa.firstChild) montar();
      if (!r.ok) { mensagem(TEXTOS.falhaEstado, true); botao.disabled = true; return; }
      estado = r.dados;
      if (!ocupado) mensagem('');
      desenhar();
    });
  }

  carregar();
  window.addEventListener('hashchange', function () { if (!/^#\/(editar|novo)\//.test(location.hash)) carregar(); });
})();
