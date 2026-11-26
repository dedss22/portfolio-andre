/* Copia de demonstracao (sandbox do portfolio) do painel Cassiano Imoveis. Caminhos ajustados; a API e simulada por ../mock-api.js. */
/* Painel Cassiano Imoveis: utilidades comuns. Sem innerHTML com dados: tudo entra por textContent (protecao contra XSS). */
(function () {
  'use strict';

  var ROTULOS = {
    origem: { 'form-dossie': 'Dossiê do imóvel', 'form-contato': 'Contato', 'form-vendedor': 'Venda seu imóvel' },
    status: { novo: 'Novo', em_contato: 'Em contato', visita: 'Visita marcada', proposta: 'Proposta', ganho: 'Fechado', perdido: 'Perdido' },
    etiqueta: { quente: 'Quente', morno: 'Morno', frio: 'Frio' },
    objetivo: { morar: 'Morar', veraneio: 'Casa de veraneio', investimento: 'Investimento / renda de temporada', nao_sei: 'Ainda não sei' },
    prazo: { asap: 'O quanto antes', ate_3_meses: 'Até 3 meses', de_3_a_12_meses: '3 a 12 meses', pesquisando: 'Só pesquisando', sem_pressa: 'Sem pressa' },
    pagamento: { a_vista: 'À vista', financiamento: 'Financiamento', permuta: 'Permuta', nao_definido: 'Ainda não definido' },
    horario: { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' },
    assunto: { comprar: 'Comprar um imóvel', alugar: 'Alugar', outro: 'Outro assunto' },
    tipo_imovel: { casa_condominio: 'Casa em condomínio', vila_pe_na_areia: 'Vila pé na areia', terreno: 'Terreno / lote', apartamento: 'Apartamento / duplex', gleba: 'Área / gleba de grande porte' },
    situacao: { desocupado: 'Desocupado', ocupado_proprietario: 'Ocupado pelo proprietário', alugado: 'Alugado', em_construcao: 'Em construção' },
    avaliacao: { visita: 'Quer agendar uma visita', conversar: 'Prefere conversar primeiro' },
    faixa: { ate_700k: 'Até R$ 700 mil', '700k_1_5m': 'R$ 700 mil a R$ 1,5 milhão', '1_5m_3m': 'R$ 1,5 a R$ 3 milhões', '3m_5m': 'R$ 3 a R$ 5 milhões', acima_5m: 'Acima de R$ 5 milhões', prefiro_conversar: 'Prefiro conversar' },
  };
  function rotulo(campo, valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    return (ROTULOS[campo] && ROTULOS[campo][valor]) || String(valor);
  }

  /** Cria elemento: h('a', { href: '#', class: 'x' }, 'texto', outroNo). So atributos de uma lista segura e textContent. */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  function limpar(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  var avisoTimer = null;
  function aviso(texto, erro) {
    var el = document.getElementById('aviso');
    if (!el) { el = h('div', { id: 'aviso', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(el); }
    el.className = 'aviso' + (erro ? ' erro' : '');
    el.textContent = texto;
    el.hidden = false;
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { el.hidden = true; }, 5000);
  }

  /** Chamada a API do painel. Mutacoes levam X-Requested-With (CSRF). Devolve { ok, status, dados }. */
  function api(caminho, opcoes) {
    opcoes = opcoes || {};
    var metodo = (opcoes.metodo || 'GET').toUpperCase();
    var cab = { Accept: 'application/json' };
    var init = { method: metodo, headers: cab, credentials: 'same-origin' };
    if (metodo !== 'GET') cab['X-Requested-With'] = 'painel';
    if (opcoes.corpo !== undefined) { cab['Content-Type'] = 'application/json'; init.body = JSON.stringify(opcoes.corpo); }
    return fetch('/api/admin/' + caminho, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (dados) {
        if (r.status === 401 && caminho !== 'login') irParaLogin();
        return { ok: r.ok, status: r.status, dados: dados };
      });
    }).catch(function () { return { ok: false, status: 0, dados: {} }; });
  }

  /** Sem sessao (401): vai para a tela de login e volta para esta mesma pagina (so caminhos /admin/..., validado no login). */
  var indoParaLogin = false;
  function irParaLogin() {
    if (indoParaLogin || /\/login(\.html)?$/.test(location.pathname)) return;
    indoParaLogin = true;
    location.replace('login.html?voltar=' + encodeURIComponent(location.pathname.split('/').pop() + location.search + location.hash));
  }

  /** Encerra a sessao no servidor (cookies apagados e sessao revogada) e vai para o login. Sem rede, avisa e fica. */
  function sair(botao) {
    if (botao) botao.disabled = true;
    return api('logout', { metodo: 'POST' }).then(function (r) {
      if (r.ok || r.status === 401) { indoParaLogin = true; location.replace('login.html'); return; }
      if (botao) botao.disabled = false;
      aviso('Não foi possível sair agora. Tente de novo.', true);
    });
  }

  function mensagemDeErro(r) {
    if (r.status === 401) return 'Sua sessão expirou. Entre novamente.';
    if (r.status === 403) return 'Você não tem permissão para isto.';
    if (r.status === 404) return 'Não encontrado.';
    if (r.status === 0) return 'Sem conexão. Tente de novo.';
    return 'Não foi possível concluir. Tente de novo.';
  }

  /** "2026-11-23 12:00:00" (UTC) -> texto relativo curto em portugues. */
  function haQuanto(utc, agora) {
    var t = Date.parse(String(utc).replace(' ', 'T') + 'Z');
    if (isNaN(t)) return '';
    var s = Math.max(0, Math.round(((agora || Date.now()) - t) / 1000));
    if (s < 60) return 'agora há pouco';
    if (s < 3600) return 'há ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'há ' + Math.floor(s / 3600) + ' h';
    if (s < 86400 * 30) return 'há ' + Math.floor(s / 86400) + ' d';
    return new Date(t).toLocaleDateString('pt-BR');
  }

  function selo(etiqueta) {
    return h('span', { class: 'selo ' + etiqueta }, rotulo('etiqueta', etiqueta));
  }

  /** Textos aprovados pelo dono (blocos A e E); ficam aqui para Inicio e Leads dizerem exatamente o mesmo. */
  var TEXTOS = {
    legenda: { quente: 'Tem pressa e perfil de negócio. Responda primeiro.', morno: 'Tem interesse, mas ainda sem pressa. Acompanhe.', frio: 'Interesse inicial. Responda quando puder.' },
    legendaNota: 'A etiqueta vem de uma pontuação calculada pelas respostas do formulário. Os pesos ainda são provisórios.',
    envioDesligado: 'O envio dos formulários ao painel ainda não está ligado. Por enquanto os contatos chegam só pelo WhatsApp.'
  };

  /** Legenda das etiquetas Quente/Morno/Frio (bloco A). */
  function legendaEtiquetas() {
    var dl = h('dl', { class: 'legenda-etiquetas' });
    ['quente', 'morno', 'frio'].forEach(function (e) {
      dl.appendChild(h('dt', null, selo(e)));
      dl.appendChild(h('dd', null, TEXTOS.legenda[e]));
    });
    return h('section', { class: 'cartao legenda-etq', 'aria-label': 'Etiquetas' }, dl, h('p', { class: 'nota' }, TEXTOS.legendaNota));
  }

  /** Aviso do bloco E: so existe quando o envio dos formularios do site esta desligado. Devolve o elemento ou null. */
  function avisoEnvioDesligado(usuario) {
    if (!usuario || usuario.envio_leads !== false) return null;
    return h('p', { class: 'aviso-envio', role: 'note' }, TEXTOS.envioDesligado);
  }

  /** Mensagens prontas do WhatsApp por origem do lead (bloco G aprovado). {nome} = primeiro nome, {imóvel} = nome ou codigo. */
  var MENSAGENS_WHATSAPP = {
    'form-dossie': 'Olá, {nome}! Aqui é o Cassiano, da Cassiano Imóveis. Vi seu interesse no imóvel {imóvel}. Posso te ajudar?',
    'form-contato': 'Olá, {nome}! Aqui é o Cassiano, da Cassiano Imóveis. Recebi sua mensagem pelo site e já vou te ajudar.',
    'form-vendedor': 'Olá, {nome}! Aqui é o Cassiano, da Cassiano Imóveis. Vi que você quer vender seu imóvel. Podemos conversar?'
  };

  /** Texto da mensagem: se faltar nome ou imovel, a frase continua natural (sem {placeholder} cru). */
  function mensagemWhatsApp(lead) {
    var modelo = MENSAGENS_WHATSAPP[lead.origem];
    if (!modelo) return '';
    var nome = String(lead.nome || '').trim().split(/\s+/)[0] || '';
    var imovel = String(lead.imovel_titulo || lead.ref_codigo || '').trim();
    var t = modelo;
    t = nome ? t.replace('{nome}', nome) : t.replace('Olá, {nome}!', 'Olá!');
    t = imovel ? t.replace('{imóvel}', imovel) : t.replace(' no imóvel {imóvel}', '');
    return t;
  }

  /** SANDBOX: sem links de mensagem (a demonstracao nao tem contatos). */
  function linkWhatsApp(lead) {
    var fone = String(lead.telefone || '').replace(/\D/g, '');
    var texto = mensagemWhatsApp(lead);
    void fone; void texto; return '#';
  }

  var DDI = ['351', '598', '595', '54', '56', '34', '39', '33', '49', '44', '41', '31', '1'];
  /** "+5573998585844" -> "(73) 99858-5844"; fixo "(73) 3333-4444"; outros paises: "+351 912 345 678". Fora do padrao: devolve como veio. */
  function formatarTelefone(e164) {
    var t = String(e164 === null || e164 === undefined ? '' : e164).trim();
    var d = t.replace(/\D/g, '');
    if (!d) return t;
    var m = /^55(\d{2})(9?\d{4})(\d{4})$/.exec(d);
    if (m) return '(' + m[1] + ') ' + m[2] + '-' + m[3];
    for (var i = 0; i < DDI.length; i++) {
      if (d.indexOf(DDI[i]) === 0 && d.length > DDI[i].length + 4) {
        var resto = d.slice(DDI[i].length), grupos = [];
        while (resto.length > 4) { grupos.push(resto.slice(0, 3)); resto = resto.slice(3); }
        grupos.push(resto);
        return '+' + DDI[i] + ' ' + grupos.join(' ');
      }
    }
    return '+' + d;
  }

  /** Copia texto: navigator.clipboard; sem ele (ou se recusar), plano B com textarea + execCommand. Devolve Promise<boolean>. */
  function copiarTexto(texto) {
    function planoB() {
      var ta = h('textarea', { 'aria-hidden': 'true', tabindex: '-1', readonly: 'readonly' });
      ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.left = '-9999px';
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).then(function () { return true; }, function () { return planoB(); });
    }
    return Promise.resolve(planoB());
  }

  /** "1 ponto" / "11 pontos". */
  function pontos(n) { return n + (Number(n) === 1 ? ' ponto' : ' pontos'); }

  /** "CS-103 · Nome do imovel"; sem titulo (imovel nao encontrado) so o codigo. */
  function imovelTexto(codigo, titulo) {
    if (!codigo) return '';
    return titulo ? codigo + ' · ' + titulo : codigo;
  }

  /** Cabecalho comum. atual: 'inicio' | 'leads'. Mostra o nome de quem entrou. */
  function montarTopo(atual) {
    var alvo = document.getElementById('topo');
    if (!alvo) return Promise.resolve(null);
    limpar(alvo);
    var quem = h('span', { class: 'quem', id: 'quem' });
    alvo.appendChild(h('a', { class: 'marca', href: 'imoveis.html' }, 'Cassiano Imóveis'));
    alvo.appendChild(h('nav', { 'aria-label': 'Principal' },
      // SANDBOX: Inicio e Leads ficam fora da demonstracao (sem dados de contato, nem ficticios).
      h('a', { href: 'imoveis.html', 'aria-current': atual === 'imoveis' ? 'page' : null }, 'Gerenciar imóveis de venda'),
      h('a', { href: 'calendario.html', 'aria-current': atual === 'calendario' ? 'page' : null }, 'Temporada')));
    var papel = h('span', { class: 'papel', id: 'papel', hidden: true });
    var botaoSair = h('button', { type: 'button', class: 'sair', id: 'sair' }, 'Sair');
    botaoSair.addEventListener('click', function () { sair(botaoSair); });
    alvo.appendChild(quem);
    alvo.appendChild(papel);
    alvo.appendChild(botaoSair);
    return api('eu').then(function (r) {
      if (r.ok && r.dados.usuario) {
        var u = r.dados.usuario;
        u.envio_leads = r.dados.envio_leads === true;
        quem.textContent = u.nome + (u.papel === 'admin' ? '' : ' (assistente)');
        papel.textContent = u.papel === 'admin' ? 'Administrador' : 'Assistente';
        papel.hidden = false;
        botaoSair.setAttribute('aria-label', 'Sair (' + u.nome + ', ' + (u.papel === 'admin' ? 'administrador' : 'assistente') + ')');
        return u;
      }
      // Sem sessao valida (ou o servico nao respondeu): nunca deixa o painel aberto, vazio e sem login.
      irParaLogin();
      return null;
    });
  }

  /** Centavos inteiros -> '1.800.000,50'. */
  function reais(centavos) {
    if (centavos === null || centavos === undefined || centavos === '') return '';
    var n = Math.round(Number(centavos)), abs = Math.abs(n);
    var inteiro = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (n < 0 ? '-' : '') + inteiro + ',' + String(abs % 100).padStart(2, '0');
  }
  /** '1.800.000,50' ou '1800000' -> centavos inteiros; vazio -> null; invalido -> NaN. */
  function paraCentavos(texto) {
    var t = String(texto === null || texto === undefined ? '' : texto).replace(/R\$|\s/g, '');
    if (t === '') return null;
    if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(t)) return NaN;
    var partes = t.replace(/\./g, '').split(',');
    return Number(partes[0]) * 100 + (partes[1] ? Number((partes[1] + '0').slice(0, 2)) : 0);
  }
  /** '137,5' -> 137.5; vazio -> null; invalido -> NaN. */
  function paraNumero(texto) {
    var t = String(texto === null || texto === undefined ? '' : texto).trim().replace(',', '.');
    if (t === '') return null;
    return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
  }

  /** Ao sair de um campo de valor, "1000000" vira "1.000.000,00". Vale para todo input com placeholder "0,00" (valor em reais)
   *  e para os de texto marcados com data-moeda="texto" (so reformata quando o conteudo e um numero; "3 meses" fica como esta). */
  function formatarMoeda(el) {
    var texto = el.value.trim();
    if (texto === '') return;
    var prefixo = el.getAttribute('data-moeda') === 'texto';
    var bruto = prefixo ? texto.replace(/^R\$\s*/i, '') : texto;
    var c = paraCentavos(bruto);
    if (c === null || c !== c) return;           // vazio ou invalido: o formulario mostra o erro ao salvar
    el.value = (prefixo ? 'R$ ' : '') + reais(c);
  }
  document.addEventListener('focusout', function (e) {
    var el = e.target;
    if (el && el.tagName === 'INPUT' && (el.getAttribute('placeholder') === '0,00' || el.getAttribute('data-moeda') === 'texto')) formatarMoeda(el);
  });

  window.Painel = { formatarMoeda: formatarMoeda, ROTULOS: ROTULOS, rotulo: rotulo, h: h, limpar: limpar, aviso: aviso, api: api, sair: sair, mensagemDeErro: mensagemDeErro, haQuanto: haQuanto, selo: selo, TEXTOS: TEXTOS, legendaEtiquetas: legendaEtiquetas, avisoEnvioDesligado: avisoEnvioDesligado, pontos: pontos, formatarTelefone: formatarTelefone, copiarTexto: copiarTexto, mensagemWhatsApp: mensagemWhatsApp, linkWhatsApp: linkWhatsApp, MENSAGENS_WHATSAPP: MENSAGENS_WHATSAPP, imovelTexto: imovelTexto, montarTopo: montarTopo, reais: reais, paraCentavos: paraCentavos, paraNumero: paraNumero };
})();
