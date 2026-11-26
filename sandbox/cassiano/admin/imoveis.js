/* Copia de demonstracao (sandbox do portfolio) do painel Cassiano Imoveis. Caminhos ajustados; a API e simulada por ../mock-api.js. */
/* Painel: imoveis (lista e formulario de venda, aluguel e temporada). Dados sempre por textContent/value. */
(function () {
  'use strict';
  var P = window.Painel, h = P.h;
  var $ = function (id) { return document.getElementById(id); };
  var usuario = null;
  var admin = function () { return usuario && usuario.papel === 'admin'; };
  var NEGOCIOS = { venda: 'Venda', aluguel: 'Aluguel', temporada: 'Temporada' };
  var STATUS = { rascunho: 'Rascunho', publicado: 'Publicado', vendido: 'Vendido', alugado: 'Alugado', arquivado: 'Arquivado' };
  var DESTINOS = { arraial: "Arraial d'Ajuda", trancoso: 'Trancoso', cabralia: 'Santa Cruz Cabrália', portoseguro: 'Porto Seguro', caraiva: 'Caraíva' };
  var TIPOS = { casa: 'Casa', apartamento: 'Apartamento', terreno: 'Terreno / lote' };
  var ESTILOS = { 'pe-na-areia': 'Pé na areia', condominio: 'Condomínio', 'vista-mar': 'Vista para o mar', 'alto-padrao': 'Alto padrão', praia: 'Praia' };
  var ICONES = { 'fa-arrows-alt': 'Área', 'fa-bed': 'Quartos / suítes', 'fa-bath': 'Banheiros', 'fa-car': 'Vagas', 'fa-shield': 'Segurança', 'fa-sun-o': 'Lazer', 'fa-building': 'Prédio', 'fa-clock-o': 'Distância', 'fa-money': 'Valor', 'fa-tint': 'Água / piscina', 'fa-tree': 'Natureza', 'fa-home': 'Casa', 'fa-star': 'Destaque',
    'fa-snowflake-o': 'Climatização', 'fa-cutlery': 'Gourmet', 'fa-glass': 'Bar / taça', 'fa-check': 'Estado', 'fa-check-circle': 'Infraestrutura', 'fa-map-pin': 'Localização', 'fa-map-marker': 'Praia', 'fa-map-signs': 'Região', 'fa-anchor': 'Mar', 'fa-ship': 'Balsa', 'fa-eye': 'Vista', 'fa-futbol-o': 'Esportes', 'fa-trophy': 'Clube', 'fa-line-chart': 'Valorização', 'fa-square-o': 'Terreno', 'fa-road': 'Pavimentação', 'fa-ban': 'Sem taxa', 'fa-pencil': 'Projeto livre' };
  var estado = { negocio: 'venda', status: '', q: '', lixeira: false, pagina: 1 };
  var ultimaPagina = 1, buscaTimer = null;

  // ---------------------------------------------------------------- lista
  function consulta() {
    var p = new URLSearchParams();
    p.set('negocio', estado.negocio);
    if (estado.status) p.set('status', estado.status);
    if (estado.q) p.set('q', estado.q);
    if (estado.lixeira) p.set('lixeira', '1');
    if (estado.pagina > 1) p.set('pagina', String(estado.pagina));
    return p.toString();
  }
  function preco(i) {
    if (i.tipo_negocio === 'temporada') return i.diaria_centavos != null ? 'R$ ' + P.reais(i.diaria_centavos) + ' / noite' : 'Sem diária';
    if (i.preco_sob_consulta && i.preco_centavos == null) return 'Sob consulta';
    if (i.preco_centavos == null) return 'Sem preço';
    return 'R$ ' + P.reais(i.preco_centavos) + (i.tipo_negocio === 'aluguel' ? ' / mês' : '');
  }
  function detalhes(i) {
    var d = [];
    if (i.quartos != null) d.push(i.quartos + (i.quartos === 1 ? ' quarto' : ' quartos'));
    if (i.suites != null) d.push(i.suites + (i.suites === 1 ? ' suíte' : ' suítes'));
    if (i.vagas != null) d.push(i.vagas + (i.vagas === 1 ? ' vaga' : ' vagas'));
    if (i.area_privativa_m2 != null) d.push(String(i.area_privativa_m2).replace('.', ',') + ' m²');
    return d.join(' · ');
  }
  function celula(rotulo, cls) {
    var td = h('td', { 'data-rotulo': rotulo, class: cls || null });
    for (var k = 2; k < arguments.length; k++) if (arguments[k]) td.appendChild(typeof arguments[k] === 'string' ? document.createTextNode(arguments[k]) : arguments[k]);
    return td;
  }
  function linhaDoImovel(i) {
    var local = [i.bairro, i.cidade].filter(Boolean).join(', ');
    var acoes = h('div', { class: 'acoes-linha' });
    if (estado.lixeira) {
      if (admin()) {
        var b = h('button', { class: 'botao', type: 'button' }, 'Restaurar');
        b.addEventListener('click', function () {
          b.disabled = true;
          P.api('imoveis/' + i.id + '/restaurar', { metodo: 'POST' }).then(function (r) { P.aviso(r.ok ? 'Imóvel restaurado.' : P.mensagemDeErro(r), !r.ok); carregarLista(); });
        });
        acoes.appendChild(b);
      }
    } else {
      acoes.appendChild(h('a', { class: 'botao', href: '#/editar/' + i.id, 'aria-label': 'Editar ' + i.codigo }, 'Editar'));
      if (admin()) {
        var x = h('button', { class: 'botao perigo', type: 'button', 'aria-label': 'Excluir ' + i.codigo }, 'Excluir');
        x.addEventListener('click', function () { confirmarExclusao(i, x); });
        acoes.appendChild(x);
      }
    }
    return h('tr', { class: 'item' },
      celula('Código', 'cod', i.codigo),
      celula('Imóvel', 'imovel', h('span', { class: 'nome' }, i.titulo), local ? h('span', { class: 'meta' }, local) : null),
      celula('Preço', 'preco', preco(i)),
      celula('Detalhes', 'det', detalhes(i) || '—'),
      celula('Situação', 'sit', h('span', { class: 'selo status-' + i.status }, STATUS[i.status] || i.status)),
      celula('Atualizado', 'atu', (i.updated_at && P.haQuanto(i.updated_at)) || '—'),
      celula('Ações', 'acs', acoes));
  }
  function linhaAviso(cls, texto, papel) {
    return h('tr', { class: cls }, h('td', { colspan: '7', role: papel || null }, texto));
  }
  function confirmarExclusao(i, gatilho) {
    var dlg = h('dialog', { 'aria-labelledby': 'h-lixo-lista' }, h('h2', { id: 'h-lixo-lista' }, 'Enviar para a lixeira?'),
      h('p', null, i.codigo + ' sai do site e fica na lixeira; dá para restaurar depois.'));
    var ok = h('button', { class: 'botao perigo primario', type: 'button' }, 'Enviar para a lixeira'), cancela = h('button', { class: 'botao', type: 'button' }, 'Cancelar');
    dlg.appendChild(h('div', { class: 'acoes' }, ok, cancela));
    cancela.addEventListener('click', function () { dlg.close(); dlg.remove(); gatilho.focus(); });
    dlg.addEventListener('cancel', function () { setTimeout(function () { dlg.remove(); }, 0); });
    ok.addEventListener('click', function () {
      ok.disabled = true;
      P.api('imoveis/' + i.id, { metodo: 'DELETE' }).then(function (r) {
        if (r.ok) { dlg.close(); dlg.remove(); P.aviso('Imóvel enviado para a lixeira.'); carregarLista(); }
        else { ok.disabled = false; P.aviso(P.mensagemDeErro(r), true); }
      });
    });
    document.body.appendChild(dlg);
    dlg.showModal();
  }
  function carregarLista() {
    $('novo').setAttribute('href', '#/novo/' + estado.negocio);
    $('titulo-lista').textContent = 'Gerenciar imóveis de ' + NEGOCIOS[estado.negocio].toLowerCase();
    document.title = $('titulo-lista').textContent + ' | Painel Cassiano Imóveis';
    var lista = $('lista');
    P.limpar(lista);
    lista.appendChild(linhaAviso('carregando', 'Carregando…', 'status'));
    P.api('imoveis?' + consulta()).then(function (r) {
      P.limpar(lista);
      if (!r.ok) { lista.appendChild(linhaAviso('erro', P.mensagemDeErro(r), 'alert')); $('paginacao').hidden = true; return; }
      var d = r.dados;
      $('contagem').textContent = d.total === 1 ? '1 imóvel' : d.total + ' imóveis';
      if (!d.itens.length) lista.appendChild(linhaAviso('vazio', estado.lixeira ? 'A lixeira está vazia.' : estado.q || estado.status ? 'Nenhum imóvel com estes filtros.' : 'Nenhum imóvel de ' + NEGOCIOS[estado.negocio].toLowerCase() + ' ainda. Use "Criar novo imóvel" para cadastrar o primeiro.'));
      d.itens.forEach(function (i) { lista.appendChild(linhaDoImovel(i)); });
      ultimaPagina = d.paginas;
      $('paginacao').hidden = d.paginas <= 1;
      $('pag-texto').textContent = 'Página ' + d.pagina + ' de ' + d.paginas;
      $('pag-anterior').disabled = d.pagina <= 1; $('pag-proxima').disabled = d.pagina >= d.paginas;
    });
  }
  function montarFiltros() {
    var chips = $('f-negocio');
    // Temporada nao aparece aqui: as casas de temporada ficam na aba Temporada (o formulario segue acessivel por #/novo/temporada e #/editar/<id>).
    Object.keys(NEGOCIOS).filter(function (k) { return k !== 'temporada'; }).forEach(function (k) {
      var b = h('button', { type: 'button', class: 'chip', 'data-valor': k, 'aria-pressed': k === estado.negocio ? 'true' : 'false' }, NEGOCIOS[k]);
      b.addEventListener('click', function () {
        estado.negocio = k; estado.pagina = 1;
        Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-valor') === k ? 'true' : 'false'); });
        carregarLista();
      });
      chips.appendChild(b);
    });
    Object.keys(STATUS).forEach(function (k) { $('f-status').appendChild(h('option', { value: k }, STATUS[k])); });
    $('f-status').addEventListener('change', function (e) { estado.status = e.target.value; estado.pagina = 1; carregarLista(); });
    $('f-lixeira').addEventListener('change', function (e) { estado.lixeira = e.target.checked; estado.pagina = 1; carregarLista(); });
    $('f-q').addEventListener('input', function (e) { clearTimeout(buscaTimer); buscaTimer = setTimeout(function () { estado.q = e.target.value.trim(); estado.pagina = 1; carregarLista(); }, 300); });
    $('filtros').addEventListener('submit', function (e) { e.preventDefault(); });
    $('pag-anterior').addEventListener('click', function () { if (estado.pagina > 1) { estado.pagina--; carregarLista(); } });
    $('pag-proxima').addEventListener('click', function () { if (estado.pagina < ultimaPagina) { estado.pagina++; carregarLista(); } });
  }

  // ---------------------------------------------------------------- formulario
  function formulario(negocio, atual) {
    var v = $('vista-form');
    P.limpar(v);
    var campos = {};   // nome -> { ler(), definir(valor), erro(msg) }
    var editando = !!atual;

    function erroDe(nome) { return h('p', { class: 'erro-campo', id: 'e-' + nome, 'data-erro': nome, role: 'alert' }); }
    function registrar(nome, input, ler, definir) {
      var err = erroDe(nome);
      campos[nome] = { input: input, err: err, ler: ler, definir: definir, mostrarErro: function (m) { err.textContent = m || ''; if (m) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); } };
      input.setAttribute('aria-describedby', 'e-' + nome);
      return err;
    }
    function texto(nome, rotulo, o) {
      o = o || {};
      var input = o.area ? h('textarea', { id: 'c-' + nome, maxlength: o.max, rows: o.linhas || 3 }) : h('input', { id: 'c-' + nome, type: 'text', maxlength: o.max, inputmode: o.modo || null, placeholder: o.dica || null, autocomplete: 'off', 'data-moeda': o.moeda ? 'texto' : null });
      var err = registrar(nome, input, function () { return input.value; }, function (x) { input.value = x == null ? '' : x; });
      if (o.somenteLeitura) input.readOnly = true;
      return h('div', { class: 'campo-f' }, h('label', { for: 'c-' + nome }, rotulo + (o.obrig ? ' *' : '')), input, o.ajuda ? h('small', null, o.ajuda) : null, err);
    }
    function dinheiro(nome, rotulo, o) {
      o = o || {};
      var input = h('input', { id: 'c-' + nome, type: 'text', inputmode: 'decimal', placeholder: '0,00', autocomplete: 'off' });
      var err = registrar(nome, input, function () { return input.value; }, function (c) { input.value = c == null ? '' : P.reais(c); });
      return h('div', { class: 'campo-f' }, h('label', { for: 'c-' + nome }, rotulo + (o.obrig ? ' *' : '') + ' (R$)'), input, o.ajuda ? h('small', null, o.ajuda) : null, err);
    }
    function numero(nome, rotulo, o) {
      o = o || {};
      var input = h('input', { id: 'c-' + nome, type: 'text', inputmode: o.decimal ? 'decimal' : 'numeric', autocomplete: 'off' });
      var err = registrar(nome, input, function () { return input.value; }, function (x) { input.value = x == null ? '' : String(x).replace('.', ','); });
      return h('div', { class: 'campo-f' }, h('label', { for: 'c-' + nome }, rotulo + (o.obrig ? ' *' : '')), input, o.ajuda ? h('small', null, o.ajuda) : null, err);
    }
    function lista(nome, rotulo, opcoes, obrig) {
      var sel = h('select', { id: 'c-' + nome }, h('option', { value: '' }, 'Escolha…'));
      Object.keys(opcoes).forEach(function (k) { sel.appendChild(h('option', { value: k }, opcoes[k])); });
      var err = registrar(nome, sel, function () { return sel.value; }, function (x) { sel.value = x || ''; });
      return h('div', { class: 'campo-f' }, h('label', { for: 'c-' + nome }, rotulo + (obrig ? ' *' : '')), sel, err);
    }
    function marca(nome, rotulo) {
      var input = h('input', { type: 'checkbox', id: 'c-' + nome });
      registrar(nome, input, function () { return input.checked; }, function (x) { input.checked = !!x; });
      return h('label', { class: 'marca-op', for: 'c-' + nome }, input, rotulo);
    }
    function secao(titulo, id) { var s = h('section', { class: 'cartao', 'aria-labelledby': 'h-' + id }, h('h2', { id: 'h-' + id }, titulo)); for (var i = 2; i < arguments.length; i++) if (arguments[i]) s.appendChild(arguments[i]); return s; }

    // ---- repetidores
    var espec = [], dif = [];
    var espBox = h('div'), difBox = h('div');
    // Seletor de icone: o botao mostra o desenho; ao clicar abre a grade de desenhos. O nome fica como dica e para leitor de tela.
    function seletorIcone(salvo) {
      var chaves = Object.keys(ICONES), escolhido;
      // icone salvo que nao esta na lista continua como esta (nunca troca nem apaga o que ja estava salvo) e segue disponivel na grade
      if (salvo && chaves.indexOf(salvo) < 0) chaves.unshift(salvo);
      var nome = function (k) { return Object.prototype.hasOwnProperty.call(ICONES, k) ? ICONES[k] : 'Ícone atual'; };
      var desenho = function (k) { return h('span', { class: 'fa ' + k, 'aria-hidden': 'true' }); };
      var botao = h('button', { class: 'botao icone-botao', type: 'button', 'aria-haspopup': 'dialog' });
      function definir(k) {
        escolhido = k;
        botao.setAttribute('data-icone', k); botao.setAttribute('title', nome(k)); botao.setAttribute('aria-label', 'Ícone: ' + nome(k) + '. Trocar');
        botao.textContent = ''; botao.appendChild(desenho(k)); botao.appendChild(h('span', { class: 'icone-seta', 'aria-hidden': 'true' }, '▾'));
      }
      botao.addEventListener('click', function () {
        var grade = h('div', { class: 'icones-grade' });
        var fechar = h('button', { class: 'botao', type: 'button' }, 'Fechar');
        var caixa = h('dialog', { class: 'icones-caixa', 'aria-labelledby': 'icones-titulo' }, h('h2', { id: 'icones-titulo' }, 'Escolha o ícone'), grade, h('div', { class: 'acoes' }, fechar));
        chaves.forEach(function (k) {
          var op = h('button', { class: 'icone-op', type: 'button', 'data-icone': k, title: nome(k), 'aria-label': nome(k), 'aria-pressed': k === escolhido ? 'true' : 'false' }, desenho(k));
          op.addEventListener('click', function () { definir(k); caixa.close(); });
          grade.appendChild(op);
        });
        fechar.addEventListener('click', function () { caixa.close(); });
        caixa.addEventListener('close', function () { caixa.remove(); botao.focus(); });
        document.body.appendChild(caixa); caixa.showModal();
        var marcado = grade.querySelector('[aria-pressed="true"]'); if (marcado) marcado.focus();
      });
      definir(salvo || chaves[0]);
      return { botao: botao, valor: function () { return escolhido; } };
    }
    function linhaEspec(v0) {
      var ic = seletorIcone(v0 && v0.icone);
      var tit = h('input', { type: 'text', maxlength: '40', 'aria-label': 'Título', placeholder: 'Ex.: Suítes' });
      var val = h('input', { type: 'text', maxlength: '60', 'aria-label': 'Valor', placeholder: 'Ex.: 3 suítes' });
      var rm = h('button', { class: 'botao perigo', type: 'button' }, 'Remover');
      var linha = h('div', { class: 'rep espec' }, h('div', null, h('label', null, 'Ícone'), ic.botao), h('div', null, h('label', null, 'Título'), tit), h('div', null, h('label', null, 'Valor'), val), rm);
      var o = { linha: linha, ler: function () { return { icone: ic.valor(), titulo: tit.value.trim(), valor: val.value.trim() }; } };
      if (v0) {
        tit.value = v0.titulo; val.value = v0.valor;
      }
      rm.addEventListener('click', function () { espec.splice(espec.indexOf(o), 1); espBox.removeChild(linha); });
      espec.push(o); espBox.appendChild(linha);
    }
    function linhaDif(t) {
      var inp = h('input', { type: 'text', maxlength: '200', 'aria-label': 'Diferencial', placeholder: 'Ex.: Piscina com deck' });
      var rm = h('button', { class: 'botao perigo', type: 'button' }, 'Remover');
      var linha = h('div', { class: 'rep dif' }, h('div', null, h('label', null, 'Diferencial'), inp), rm);
      var o = { linha: linha, ler: function () { return inp.value.trim(); } };
      if (t) inp.value = t;
      rm.addEventListener('click', function () { dif.splice(dif.indexOf(o), 1); difBox.removeChild(linha); });
      dif.push(o); difBox.appendChild(linha);
    }
    var addEsp = h('button', { class: 'botao', type: 'button' }, 'Adicionar item'); addEsp.addEventListener('click', function () { if (espec.length < 12) linhaEspec(); else P.aviso('No máximo 12 itens.', true); });
    var addDif = h('button', { class: 'botao', type: 'button' }, 'Adicionar diferencial'); addDif.addEventListener('click', function () { if (dif.length < 30) linhaDif(); else P.aviso('No máximo 30 diferenciais.', true); });

    // ---- estilos
    var estilosBox = h('div', { class: 'marcas', role: 'group', 'aria-label': 'Estilos' });
    var estilosMarcados = {};
    Object.keys(ESTILOS).forEach(function (k) { var i = h('input', { type: 'checkbox', id: 'c-est-' + k }); estilosMarcados[k] = i; estilosBox.appendChild(h('label', { class: 'marca-op', for: 'c-est-' + k }, i, ESTILOS[k])); });

    // ---- secoes
    v.appendChild(negocio === 'temporada' ? h('a', { class: 'botao', href: 'calendario.html' }, '← Voltar para Temporada') : h('a', { class: 'botao', href: '#/' }, '← Voltar para a lista'));
    v.appendChild(h('h1', { id: 'titulo-form', tabindex: '-1' }, editando ? atual.codigo + ' · ' + atual.titulo : 'Novo imóvel de ' + NEGOCIOS[negocio].toLowerCase()));
    var resumo = h('div', { class: 'resumo-erros', role: 'alert', id: 'resumo-erros' }); resumo.hidden = true; v.appendChild(resumo);

    v.appendChild(secao('Básico', 'basico',
      texto('titulo', 'Título', { max: 150, obrig: true, ajuda: 'Aparece no topo da página do imóvel.' }),
      h('div', { class: 'grade2' }, texto('titulo_card', 'Título curto (cartão da lista)', { max: 150 }), texto('badge_destaque', 'Selo de destaque', { max: 40, dica: 'Ex.: Alto Padrão' })),
      h('div', { class: 'grade2' }, lista('destino_slug', 'Destino', DESTINOS, true), lista('tipo_imovel', 'Tipo do imóvel', TIPOS, true)),
      h('div', { class: 'campo-f' }, h('label', null, 'Estilos'), estilosBox),
      h('div', { class: 'grade2' }, texto('bairro', 'Bairro', { max: 80 }), texto('cidade', 'Cidade', { max: 80 })),
      texto('uf', 'Estado (sigla)', { max: 2, dica: 'BA' })));

    var valores = [];
    if (negocio === 'temporada') {
      valores.push(h('div', { class: 'grade2' }, dinheiro('diaria_centavos', 'Diária base', { obrig: true, ajuda: 'Os preços de alta temporada, réveillon e carnaval ficam em Calendário.' }), numero('minimo_noites', 'Mínimo de noites')));
      valores.push(h('div', { class: 'grade2' }, numero('capacidade_hospedes', 'Capacidade (hóspedes)'), dinheiro('taxa_limpeza_centavos', 'Taxa de limpeza')));
      valores.push(h('div', { class: 'grade2' }, texto('checkin_hora', 'Check-in (HH:MM)', { max: 5, dica: '15:00' }), texto('checkout_hora', 'Check-out (HH:MM)', { max: 5, dica: '11:00' })));
    } else if (negocio === 'aluguel') {
      valores.push(h('div', { class: 'grade2' }, dinheiro('preco_centavos', 'Aluguel mensal', { obrig: true }), texto('caucao_texto', 'Caução', { max: 120, dica: 'Ex.: 3 meses' })));
      valores.push(h('div', { class: 'grade2' }, texto('condominio_texto', 'Condomínio', { max: 120, moeda: true, dica: 'Ex.: 1.200,00' }), texto('iptu_texto', 'IPTU', { max: 120, moeda: true, dica: 'Ex.: 3.500,00' })));
    } else {
      valores.push(h('div', { class: 'grade2' }, dinheiro('preco_centavos', 'Preço', { obrig: true }), texto('preco_label', 'Rótulo do preço', { max: 60, dica: 'Ex.: Valor de Venda' })));
      valores.push(marca('preco_sob_consulta', 'Preço sob consulta (não mostra o valor)'));
      valores.push(h('div', { class: 'grade2' }, dinheiro('preco_secundario_centavos', 'Segundo preço (opcional)'), texto('preco_secundario_label', 'Rótulo do segundo preço', { max: 60 })));
      valores.push(h('div', { class: 'grade2' }, texto('condominio_texto', 'Condomínio', { max: 120, moeda: true, dica: 'Ex.: 1.200,00' }), texto('iptu_texto', 'IPTU', { max: 120, moeda: true, dica: 'Ex.: 3.500,00' })));
    }
    v.appendChild(secao('Valores', 'valores', valores[0], valores[1], valores[2], valores[3], valores[4]));

    v.appendChild(secao('Características', 'caract',
      h('div', { class: 'grade2' }, numero('area_privativa_m2', 'Área privativa (m²)', { decimal: true }), numero('area_total_m2', 'Área total (m²)', { decimal: true })),
      h('div', { class: 'grade2' }, numero('quartos', 'Quartos'), numero('suites', 'Suítes')),
      h('div', { class: 'grade2' }, numero('banheiros', 'Banheiros'), numero('vagas', 'Vagas')),
      texto('vagas_texto', 'Vagas (texto livre)', { max: 60, dica: 'Ex.: Privativas' })));

    v.appendChild(secao('Destaques da página', 'destaques',
      h('h3', null, 'Cartões de características'), h('p', { class: 'vazio' }, 'Até 12 itens, como Área Privativa, Suítes e Vagas.'), espBox, addEsp, campoErro('especificacoes'),
      h('h3', null, 'Destaques e diferenciais'), difBox, addDif, campoErro('diferenciais')));
    function campoErro(nome) { var e = erroDe(nome); campos[nome] = { input: e, err: e, mostrarErro: function (m) { e.textContent = m || ''; } }; return e; }

    v.appendChild(secao('Textos', 'textos',
      texto('resumo_card', 'Resumo (cartão da lista)', { max: 300, area: true, linhas: 3 }),
      texto('descricao', 'Descrição', { max: 6000, area: true, linhas: 10, ajuda: 'Texto simples. Deixe uma linha em branco entre os parágrafos.' })));

    var seo = h('details', { class: 'cartao' }, h('summary', null, 'Site e Google (opcional)'),
      texto('seo_title', 'Título para o Google', { max: 70 }), texto('seo_description', 'Descrição para o Google', { max: 200, area: true, linhas: 2 }), texto('seo_keywords', 'Palavras-chave', { max: 200 }),
      texto('slug', 'Endereço da página (link)', { max: 80, ajuda: editando && atual.status !== 'rascunho' ? 'Imóvel publicado: o endereço não pode mudar.' : 'Deixe em branco para gerar a partir do título.', somenteLeitura: editando && atual.status !== 'rascunho' }),
      h('div', { class: 'marcas' }, marca('destaque', 'Destacar na página inicial'), marca('noindex', 'Não aparecer no Google')));
    v.appendChild(seo);
    v.appendChild(secao('Fotos', 'fotos', window.PainelFotos.montar({ imovelId: editando ? atual.id : null })));

    // ---- preencher
    if (editando) {
      Object.keys(campos).forEach(function (k) { if (campos[k].definir) { var x = atual[k]; campos[k].definir(k === 'descricao' ? atual.descricao : x); } });
      (atual.estilos || []).forEach(function (k) { if (estilosMarcados[k]) estilosMarcados[k].checked = true; });
      (atual.especificacoes || []).forEach(linhaEspec); (atual.diferenciais || []).forEach(linhaDif);
    } else { campos.uf.definir('BA'); if (campos.minimo_noites) campos.minimo_noites.definir(1); }

    // ---- coleta e erros
    function coletar() {
      var d = { tipo_negocio: negocio }, locais = {};
      var DIN = ['preco_centavos', 'preco_secundario_centavos', 'diaria_centavos', 'taxa_limpeza_centavos'], INT = ['minimo_noites', 'capacidade_hospedes', 'quartos', 'suites', 'banheiros', 'vagas'], REAL = ['area_privativa_m2', 'area_total_m2'], BOOL = ['preco_sob_consulta', 'destaque', 'noindex'];
      Object.keys(campos).forEach(function (k) {
        var c = campos[k]; if (!c.ler) return;
        var x = c.ler();
        if (DIN.indexOf(k) >= 0) { var n = P.paraCentavos(x); if (n !== n) locais[k] = 'Confira o valor (ex.: 1.800.000,00).'; d[k] = n; }
        else if (INT.indexOf(k) >= 0) { var m = P.paraNumero(x); if (m !== m || (m !== null && !Number.isInteger(m))) locais[k] = 'Use um número inteiro.'; d[k] = m; }
        else if (REAL.indexOf(k) >= 0) { var r = P.paraNumero(x); if (r !== r) locais[k] = 'Use um número (ex.: 137,5).'; d[k] = r; }
        else if (BOOL.indexOf(k) >= 0) d[k] = !!x;
        else { var t = typeof x === 'string' ? x.trim() : x; d[k] = t === '' ? null : t; }
      });
      d.estilos = Object.keys(estilosMarcados).filter(function (k) { return estilosMarcados[k].checked; });
      d.especificacoes = espec.map(function (e) { return e.ler(); }).filter(function (e) { return e.titulo || e.valor; });
      d.diferenciais = dif.map(function (e) { return e.ler(); }).filter(Boolean);
      return { d: d, locais: locais };
    }
    function limparErros() { Object.keys(campos).forEach(function (k) { campos[k].mostrarErro(''); }); resumo.hidden = true; }
    function mostrarErros(erros) {
      var primeiro = null, soltos = [];
      Object.keys(erros).forEach(function (k) { if (campos[k]) { campos[k].mostrarErro(erros[k]); if (!primeiro) primeiro = campos[k].input; } else soltos.push(erros[k]); });
      P.limpar(resumo);
      resumo.appendChild(h('strong', null, 'Corrija os campos marcados antes de salvar.'));
      soltos.forEach(function (m) { resumo.appendChild(h('div', null, m)); });
      resumo.hidden = false;
      (primeiro && primeiro.focus ? primeiro : resumo).scrollIntoView({ block: 'center' });
      if (primeiro && primeiro.focus) primeiro.focus();
    }

    // ---- salvar
    var salvando = false;
    function salvar(depois) {
      if (salvando) return Promise.resolve(false);
      limparErros();
      var c = coletar();
      if (Object.keys(c.locais).length) { mostrarErros(c.locais); return Promise.resolve(false); }
      salvando = true; botoes.forEach(function (b) { b.disabled = true; });
      var req = editando ? P.api('imoveis/' + atual.id, { metodo: 'PUT', corpo: c.d }) : P.api('imoveis', { metodo: 'POST', corpo: c.d });
      return req.then(function (r) {
        salvando = false; botoes.forEach(function (b) { b.disabled = false; });
        if (!r.ok) { if (r.dados && r.dados.erros) mostrarErros(r.dados.erros); else P.aviso(P.mensagemDeErro(r), true); return false; }
        return r.dados.id || (atual && atual.id);
      });
    }
    var bSalvar = h('button', { class: 'botao', type: 'button' }, editando ? 'Salvar alterações' : 'Salvar rascunho');
    var bPublicar = h('button', { class: 'botao primario', type: 'button' }, 'Publicar');
    var botoes = [bSalvar, bPublicar];
    bSalvar.addEventListener('click', function () {
      salvar().then(function (id) { if (!id) return; P.aviso(editando ? 'Alterações salvas.' : 'Rascunho salvo.'); if (!editando) location.hash = '#/editar/' + id; else abrirEdicao(id); });
    });
    bPublicar.addEventListener('click', function () {
      salvar().then(function (id) {
        if (!id) return;
        P.api('imoveis/' + id + '/status', { metodo: 'POST', corpo: { status: 'publicado' } }).then(function (r) {
          if (!r.ok) { P.aviso(P.mensagemDeErro(r), true); return; }
          P.aviso('Imóvel publicado. Ele aparece no site em até 1 ou 2 minutos.');
          if (!editando) location.hash = '#/editar/' + id; else abrirEdicao(id);
        });
      });
    });
    var barra = h('div', { class: 'barra' }, bSalvar, bPublicar);
    if (editando) {
      var sel = h('select', { id: 'c-situacao', 'aria-label': 'Situação' }); Object.keys(STATUS).forEach(function (k) { var o = h('option', { value: k }, STATUS[k]); if (k === atual.status) o.selected = true; sel.appendChild(o); });
      var bSit = h('button', { class: 'botao', type: 'button' }, 'Alterar situação');
      bSit.addEventListener('click', function () {
        P.api('imoveis/' + atual.id + '/status', { metodo: 'POST', corpo: { status: sel.value } }).then(function (r) { P.aviso(r.ok ? 'Situação alterada.' : P.mensagemDeErro(r), !r.ok); if (r.ok) abrirEdicao(atual.id); });
      });
      v.appendChild(secao('Situação', 'situacao', h('p', null, 'Hoje: ', h('strong', null, STATUS[atual.status] || atual.status)), h('div', { class: 'campo-f' }, h('label', { for: 'c-situacao' }, 'Mudar para'), sel), h('div', { class: 'acoes' }, bSit)));
      if (admin()) {
        var dlg = h('dialog', { 'aria-labelledby': 'h-lixo' }, h('h2', { id: 'h-lixo' }, 'Enviar para a lixeira?'),
          h('p', null, atual.codigo + ' sai do site e fica na lixeira; dá para restaurar depois.'));
        var ok = h('button', { class: 'botao perigo primario', type: 'button' }, 'Enviar para a lixeira'), cancela = h('button', { class: 'botao', type: 'button' }, 'Cancelar');
        dlg.appendChild(h('div', { class: 'acoes' }, ok, cancela));
        cancela.addEventListener('click', function () { dlg.close(); });
        ok.addEventListener('click', function () {
          ok.disabled = true;
          P.api('imoveis/' + atual.id, { metodo: 'DELETE' }).then(function (r) { if (r.ok) { dlg.close(); P.aviso('Imóvel enviado para a lixeira.'); if (negocio === 'temporada') location.href = 'calendario.html'; else location.hash = '#/'; } else { ok.disabled = false; P.aviso(P.mensagemDeErro(r), true); } });
        });
        var bExcluir = h('button', { class: 'botao perigo', type: 'button' }, 'Excluir imóvel');
        bExcluir.addEventListener('click', function () { dlg.showModal(); });
        barra.appendChild(bExcluir); v.appendChild(dlg);
      }
    }
    v.appendChild(barra);
    $('titulo-form').focus();
  }

  function abrirEdicao(id) {
    $('vista-lista').hidden = true; var v = $('vista-form'); v.hidden = false; P.limpar(v);
    v.appendChild(h('p', { class: 'carregando', role: 'status' }, 'Carregando…'));
    P.api('imoveis/' + id).then(function (r) {
      if (!r.ok) { P.limpar(v); v.appendChild(h('a', { class: 'botao', href: '#/' }, '← Voltar para a lista')); v.appendChild(h('p', { class: 'erro', role: 'alert' }, P.mensagemDeErro(r))); return; }
      formulario(r.dados.imovel.tipo_negocio, r.dados.imovel);
    });
  }

  // ---------------------------------------------------------------- navegacao
  function rotear() {
    var m = /^#\/editar\/(\d+)$/.exec(location.hash), n = /^#\/novo\/(venda|aluguel|temporada)$/.exec(location.hash);
    if (m) { abrirEdicao(Number(m[1])); return; }
    if (n) { $('vista-lista').hidden = true; $('vista-form').hidden = false; formulario(n[1], null); return; }
    $('vista-form').hidden = true; $('vista-lista').hidden = false; carregarLista();
  }
  var q0 = new URLSearchParams(location.search).get('negocio');
  if (NEGOCIOS[q0] && q0 !== 'temporada') estado.negocio = q0;
  montarFiltros();
  P.montarTopo('imoveis').then(function (u) { usuario = u; rotear(); });
  window.addEventListener('hashchange', rotear);
})();
