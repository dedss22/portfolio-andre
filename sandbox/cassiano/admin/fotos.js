/* Copia de demonstracao (sandbox do portfolio) do painel Cassiano Imoveis. Caminhos ajustados; a API e simulada por ../mock-api.js. */
/* Painel: fotos do imovel (enviar, ver, ordenar, capa, legenda, remover). Dados sempre por textContent/value; sem estilo inline.
   Antes de enviar, o navegador redimensiona e recodifica a foto num canvas (qualidade adaptativa, limite duro de 2 MB):
   isso tambem APAGA os metadados EXIF/GPS. Os bytes vao para /api/admin/imoveis/:id/fotos (no sandbox, simulado por ../mock-api.js). */
(function () {
  'use strict';
  var P = window.Painel, h = P.h;
  var LIMITE = 2 * 1024 * 1024;            // limite duro por foto (igual ao do servidor)
  var ALVO = Math.floor(1.9 * 1024 * 1024); // o navegador procura ficar abaixo disto
  var LADOS = [2400, 2000, 1600, 1200, 800]; // lado maior, em pixels (nunca amplia foto menor)
  var QUALIDADES = [0.9, 0.85, 0.8, 0.75];
  var MAX_FOTOS = 20, MAX_ENTRADA = 50 * 1024 * 1024;

  var TEXTOS = {
    ajudaTitulo: 'Como adicionar fotos',
    ajuda: [
      'Toque em “Adicionar fotos” e escolha as imagens da galeria ou tire na hora (no celular). No computador, escolha os arquivos da pasta. Dá para escolher várias de uma vez.',
      'A primeira foto é a capa: é a que aparece na lista e no topo do anúncio. Para trocar a ordem, use “Mover para trás” e “Mover para frente” (no computador também dá para arrastar).',
      'Para fotos boas: celular na horizontal, boa luz e sem dedo na lente. De 6 a 12 fotos por imóvel já contam bem a história.',
      'As fotos são ajustadas sozinhas antes de enviar: ficam com no máximo 2400 pixels no lado maior, mantendo a melhor qualidade que cabe em 2 MB. A localização (GPS) e outros dados escondidos da foto são apagados.',
      'Limite: 20 fotos por imóvel e 2 MB por foto.',
      'A foto só aparece no site depois que você clicar em “Publicar no site”.'
    ],
    adicionar: 'Adicionar fotos',
    salvarPrimeiro: 'Salve o rascunho primeiro. Depois você poderá adicionar as fotos aqui.',
    semFotos: 'Este imóvel ainda não tem fotos.',
    capa: 'Capa',
    maisTras: 'Mover para trás', maisFrente: 'Mover para frente', remover: 'Remover',
    legenda: 'Legenda (opcional)',
    removerTitulo: 'Remover esta foto?', removerTexto: 'Ela sai do imóvel e do armazenamento. Não dá para desfazer.', removerOk: 'Remover foto', cancelar: 'Cancelar',
    naoConfigurado: 'O envio de fotos não está disponível agora. Suas outras informações continuam funcionando.',
    reduzindo: 'Preparando a foto…', enviando: 'Enviando… ', enviada: 'Enviada',
    erros: {
      limite: 'Este imóvel já tem 20 fotos. Remova alguma para enviar outra.',
      grande: 'Esta foto passou de 2 MB mesmo depois de reduzida. Tente outra.',
      tipo: 'Este arquivo não parece uma foto (use JPG, PNG ou WebP).',
      ler: 'Não foi possível abrir esta foto. Tente outra.',
      muitoGrande: 'Arquivo grande demais para abrir (mais de 50 MB).',
      conexao: 'Sem conexão. Tente de novo.',
      servico: 'O serviço de fotos não respondeu. Tente de novo.',
      naoAchou: 'Imóvel não encontrado.',
      permissao: 'Você não tem permissão para isto.',
      generico: 'Não foi possível enviar. Tente de novo.'
    }
  };

  /** 850 KB / 1,2 MB */
  function tamanhoTexto(b) {
    if (b === null || b === undefined) return '';
    if (b < 1024 * 1024) return Math.max(1, Math.round(b / 1024)) + ' KB';
    return (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  // ------------------------------------------------------------------ processamento da imagem (so no navegador)
  function abrir(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file).catch(function () { return abrirPorImg(file); });
    }
    return abrirPorImg(file);
  }
  // Plano B: FileReader -> data: URL -> <img> (blob: nao e permitido pela CSP do painel).
  function abrirPorImg(file) {
    return new Promise(function (ok, erro) {
      var fr = new FileReader();
      fr.onerror = function () { erro(new Error('ler')); };
      fr.onload = function () {
        var img = new Image();
        img.onload = function () { ok(img); };
        img.onerror = function () { erro(new Error('ler')); };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function paraBlob(canvas, tipo, q) {
    return new Promise(function (ok) { canvas.toBlob(function (b) { ok(b); }, tipo, q); });
  }
  function desenhar(img, w, h2, fundoBranco) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h2;
    var ctx = c.getContext('2d');
    if (fundoBranco) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h2); }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h2);
    return c;
  }
  /** Devolve { blob, largura, altura, thumb } ou rejeita com Error('ler' | 'grande'). */
  function processar(file) {
    return abrir(file).then(function (img) {
      var W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
      if (!W || !H) throw new Error('ler');
      var maior = Math.max(W, H);
      var tentados = {}, tipo = 'image/webp', fundo = false;
      // Descobre se o navegador grava WebP (senao JPEG, com fundo branco).
      return paraBlob(desenhar(img, 1, 1, false), 'image/webp', 0.9).then(function (t) {
        if (!t || t.type !== 'image/webp') { tipo = 'image/jpeg'; fundo = true; }
        var passos = [];
        LADOS.forEach(function (L) {
          var esc = Math.min(1, L / maior), w = Math.max(1, Math.round(W * esc)), h2 = Math.max(1, Math.round(H * esc));
          var k = w + 'x' + h2;
          if (tentados[k]) return; // foto pequena: nao repete o mesmo tamanho
          tentados[k] = true; passos.push({ w: w, h: h2 });
        });
        var i = 0, melhor = null;
        function proximoLado() {
          if (i >= passos.length) return Promise.resolve(melhor);
          var p = passos[i++], c = desenhar(img, p.w, p.h, fundo), j = 0;
          function proximaQualidade() {
            if (j >= QUALIDADES.length) return proximoLado();
            return paraBlob(c, tipo, QUALIDADES[j++]).then(function (b) {
              if (!b) throw new Error('ler');
              if (!melhor || b.size < melhor.blob.size) melhor = { blob: b, largura: p.w, altura: p.h, canvas: c };
              if (b.size <= ALVO) return { blob: b, largura: p.w, altura: p.h, canvas: c };
              return proximaQualidade();
            });
          }
          return proximaQualidade();
        }
        return proximoLado();
      }).then(function (r) {
        if (!r || r.blob.size > LIMITE) throw new Error('grande');
        var s = Math.min(1, 240 / Math.max(r.largura, r.altura));
        var mini = desenhar(r.canvas, Math.max(1, Math.round(r.largura * s)), Math.max(1, Math.round(r.altura * s)), true);
        if (img.close) img.close();
        return { blob: r.blob, largura: r.largura, altura: r.altura, thumb: mini.toDataURL('image/jpeg', 0.6) };
      });
    });
  }

  // ------------------------------------------------------------------ envio com progresso
  function enviarXhr(id, resultado, aoProgresso) {
    return new Promise(function (ok) {
      var x = new XMLHttpRequest();
      x.open('POST', '/api/admin/imoveis/' + id + '/fotos');
      x.responseType = 'json';
      x.withCredentials = true;
      x.setRequestHeader('X-Requested-With', 'painel');
      x.setRequestHeader('Accept', 'application/json');
      x.setRequestHeader('Content-Type', resultado.blob.type);
      x.setRequestHeader('X-Foto-Largura', String(resultado.largura));
      x.setRequestHeader('X-Foto-Altura', String(resultado.altura));
      x.upload.onprogress = function (e) { if (e.lengthComputable) aoProgresso(Math.round((e.loaded / e.total) * 100)); };
      x.onload = function () { ok({ ok: x.status >= 200 && x.status < 300, status: x.status, dados: x.response || {} }); };
      x.onerror = function () { ok({ ok: false, status: 0, dados: {} }); };
      x.ontimeout = x.onerror;
      x.send(resultado.blob);
    });
  }

  function mensagemEnvio(r) {
    var e = TEXTOS.erros, c = r.dados && r.dados.erro;
    if (r.status === 0) return e.conexao;
    if (c === 'limite_fotos') return e.limite;
    if (c === 'foto_grande') return e.grande;
    if (c === 'tipo_invalido' || c === 'foto_vazia') return e.tipo;
    if (r.status === 404) return e.naoAchou;
    if (r.status === 403) return e.permissao;
    if (r.status === 503 || r.status === 502) return e.servico;
    return e.generico;
  }

  // ------------------------------------------------------------------ interface
  /** opcoes: { imovelId } (null = imovel ainda nao salvo). Devolve o elemento da secao. */
  function montar(opcoes) {
    var id = opcoes.imovelId;
    var raiz = h('div', { class: 'fotos' });
    var ajuda = h('details', { class: 'fotos-ajuda' }, h('summary', null, TEXTOS.ajudaTitulo), h('ul', null));
    TEXTOS.ajuda.forEach(function (t) { ajuda.querySelector('ul').appendChild(h('li', null, t)); });
    raiz.appendChild(ajuda);
    if (!id) { raiz.appendChild(h('p', { class: 'vazio' }, TEXTOS.salvarPrimeiro)); return raiz; }

    var fotos = [], fila = [], ocupado = false, limite = MAX_FOTOS;
    var alerta = h('p', { class: 'fotos-alerta', role: 'alert', id: 'fotos-alerta' }); alerta.hidden = true;
    var entrada = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, id: 'fotos-entrada', 'aria-label': TEXTOS.adicionar });
    var botaoAdd = h('button', { type: 'button', class: 'botao primario', id: 'fotos-adicionar' }, TEXTOS.adicionar);
    var contagem = h('span', { class: 'fotos-contagem', role: 'status', 'aria-live': 'polite' });
    var grade = h('ul', { class: 'fotos-grade', id: 'fotos-grade' });
    var vazio = h('p', { class: 'vazio' }, TEXTOS.semFotos);
    raiz.appendChild(alerta);
    raiz.appendChild(h('div', { class: 'acoes' }, botaoAdd, entrada, contagem));
    raiz.appendChild(vazio);
    raiz.appendChild(grade);

    function mostrarAlerta(texto) { alerta.textContent = texto || ''; alerta.hidden = !texto; }
    function atualizarFotos(lista) { fotos = lista; desenharGrade(); }

    botaoAdd.addEventListener('click', function () { entrada.click(); });
    entrada.addEventListener('change', function () {
      var arquivos = Array.prototype.slice.call(entrada.files || []);
      entrada.value = '';
      arquivos.forEach(function (f) { fila.push(novoPendente(f)); });
      desenharGrade();
      processarFila();
    });

    function novoPendente(file) {
      return { file: file, nome: file.name || 'foto', estado: 'espera', pct: 0, erro: '', thumb: '', tamanho: null };
    }
    function pendentesAtivos() { return fila.filter(function (p) { return p.estado !== 'erro'; }).length; }

    function processarFila() {
      if (ocupado) return;
      var p = null;
      for (var i = 0; i < fila.length; i++) if (fila[i].estado === 'espera') { p = fila[i]; break; }
      if (!p) return;
      ocupado = true;
      var restantes = fotos.length; // fotos ja gravadas; as pendentes em andamento contam uma a uma
      if (restantes >= limite) { falhar(p, TEXTOS.erros.limite); return seguir(); }
      if (!/^image\//.test(p.file.type || '') && !/\.(jpe?g|png|webp|heic|heif)$/i.test(p.nome)) { falhar(p, TEXTOS.erros.tipo); return seguir(); }
      if (p.file.size > MAX_ENTRADA) { falhar(p, TEXTOS.erros.muitoGrande); return seguir(); }
      p.estado = 'reduzindo'; desenharGrade();
      processar(p.file).then(function (res) {
        p.thumb = res.thumb; p.tamanho = res.blob.size; p.estado = 'enviando'; p.pct = 0; desenharGrade();
        return enviarXhr(id, res, function (pct) { p.pct = pct; atualizarProgresso(p); });
      }).then(function (r) {
        if (!r) return;
        if (r.status === 401) { location.replace('login.html?voltar=' + encodeURIComponent(location.pathname + location.search + location.hash)); return; }
        if (r.ok) {
          fila.splice(fila.indexOf(p), 1);
          atualizarFotos(r.dados.fotos || []);
          mostrarAlerta('');
          return;
        }
        if (r.status === 503 && r.dados && r.dados.erro === 'armazenamento_nao_configurado') mostrarAlerta(TEXTOS.naoConfigurado);
        falhar(p, r.status === 503 && r.dados && r.dados.erro === 'armazenamento_nao_configurado' ? TEXTOS.erros.servico : mensagemEnvio(r));
      }).catch(function (e) {
        falhar(p, e && e.message === 'grande' ? TEXTOS.erros.grande : TEXTOS.erros.ler);
      }).then(seguir);
    }
    function seguir() { ocupado = false; desenharGrade(); processarFila(); }
    function falhar(p, texto) { p.estado = 'erro'; p.erro = texto; desenharGrade(); }

    // ---- chamadas de edicao
    function chamar(caminho, metodo, corpo) {
      return P.api('imoveis/' + id + '/fotos' + caminho, { metodo: metodo, corpo: corpo }).then(function (r) {
        if (r.ok) { atualizarFotos(r.dados.fotos || []); return true; }
        P.aviso(P.mensagemDeErro(r), true);
        return false;
      });
    }
    function mover(de, para) {
      if (para < 0 || para >= fotos.length || de === para) return;
      var ids = fotos.map(function (f) { return f.id; });
      var x = ids.splice(de, 1)[0]; ids.splice(para, 0, x);
      trava(true);
      chamar('/ordem', 'PUT', { ids: ids }).then(function () { trava(false); focar(para); });
    }
    function trava(sim) { Array.prototype.forEach.call(raiz.querySelectorAll('.foto-card button'), function (b) { if (sim) b.setAttribute('disabled', ''); else b.removeAttribute('disabled'); }); if (!sim) desenharGrade(); }
    function focar(indice) { var li = grade.querySelectorAll('li.foto-card')[indice]; if (li) { var b = li.querySelector('.foto-mover'); if (b) b.focus(); } }

    function confirmarRemocao(f, n) {
      var dlg = h('dialog', { 'aria-labelledby': 'h-rm-foto' }, h('h2', { id: 'h-rm-foto' }, TEXTOS.removerTitulo), h('p', null, TEXTOS.removerTexto));
      var ok = h('button', { class: 'botao perigo primario', type: 'button' }, TEXTOS.removerOk), nao = h('button', { class: 'botao', type: 'button' }, TEXTOS.cancelar);
      dlg.appendChild(h('div', { class: 'acoes' }, ok, nao));
      document.body.appendChild(dlg);
      var fechar = function () { if (dlg.close) dlg.close(); if (dlg.parentNode) dlg.parentNode.removeChild(dlg); };
      nao.addEventListener('click', fechar);
      dlg.addEventListener('cancel', function () { setTimeout(fechar, 0); });
      ok.addEventListener('click', function () { ok.disabled = true; chamar('/' + f.id, 'DELETE').then(function (r) { fechar(); if (r) P.aviso('Foto removida.', false); }); });
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      nao.focus();
    }

    // ---- desenho
    var arrastando = -1;
    function cartaoFoto(f, n) {
      var primeira = n === 0, ultima = n === fotos.length - 1;
      var li = h('li', { class: 'foto-card' + (primeira ? ' e-capa' : ''), draggable: 'true', 'data-foto': f.id });
      li.appendChild(h('img', { src: f.url, alt: f.alt || '', loading: 'lazy', draggable: 'false' }));
      var info = h('div', { class: 'foto-info' });
      info.appendChild(h('span', { class: 'foto-pos' }, 'Foto ' + (n + 1)));
      if (primeira) info.appendChild(h('span', { class: 'selo-capa' }, TEXTOS.capa));
      if (f.bytes) info.appendChild(h('span', { class: 'foto-tam' }, tamanhoTexto(f.bytes)));
      li.appendChild(info);
      var leg = h('input', { type: 'text', maxlength: '200', class: 'foto-legenda', 'aria-label': TEXTOS.legenda + ' da foto ' + (n + 1), placeholder: TEXTOS.legenda, autocomplete: 'off' });
      leg.value = f.legenda || '';
      leg.addEventListener('change', function () {
        var v = leg.value.trim();
        if (v === (f.legenda || '')) return;
        P.api('imoveis/' + id + '/fotos/' + f.id, { metodo: 'PATCH', corpo: { legenda: v } }).then(function (r) {
          if (r.ok) { f.legenda = v || null; P.aviso('Legenda salva.', false); } else P.aviso(P.mensagemDeErro(r), true);
        });
      });
      li.appendChild(leg);
      var ac = h('div', { class: 'foto-acoes' });
      var tras = h('button', { type: 'button', class: 'botao foto-mover', 'aria-label': TEXTOS.maisTras + ' (foto ' + (n + 1) + ')' }, TEXTOS.maisTras);
      var frente = h('button', { type: 'button', class: 'botao foto-mover', 'aria-label': TEXTOS.maisFrente + ' (foto ' + (n + 1) + ')' }, TEXTOS.maisFrente);
      var rm = h('button', { type: 'button', class: 'botao perigo', 'aria-label': TEXTOS.remover + ' foto ' + (n + 1) }, TEXTOS.remover);
      if (primeira) tras.setAttribute('disabled', ''); if (ultima) frente.setAttribute('disabled', '');
      tras.addEventListener('click', function () { mover(n, n - 1); });
      frente.addEventListener('click', function () { mover(n, n + 1); });
      rm.addEventListener('click', function () { confirmarRemocao(f, n); });
      ac.appendChild(tras); ac.appendChild(frente); ac.appendChild(rm);
      li.appendChild(ac);
      li.addEventListener('dragstart', function (e) { arrastando = n; if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(f.id)); } });
      li.addEventListener('dragover', function (e) { if (arrastando >= 0) e.preventDefault(); });
      li.addEventListener('drop', function (e) { e.preventDefault(); var de = arrastando; arrastando = -1; if (de >= 0) mover(de, n); });
      li.addEventListener('dragend', function () { arrastando = -1; });
      return li;
    }
    var barras = new WeakMap();
    function cartaoPendente(p) {
      var li = h('li', { class: 'foto-card pendente estado-' + p.estado, 'data-pendente': p.nome });
      if (p.thumb) li.appendChild(h('img', { src: p.thumb, alt: 'Pré-visualização de ' + p.nome }));
      else li.appendChild(h('div', { class: 'foto-espaco' }));
      var info = h('div', { class: 'foto-info' }, h('span', { class: 'foto-nome' }, p.nome));
      if (p.tamanho) info.appendChild(h('span', { class: 'foto-tam' }, tamanhoTexto(p.tamanho)));
      li.appendChild(info);
      if (p.estado === 'erro') {
        li.appendChild(h('p', { class: 'foto-erro', role: 'alert' }, p.erro));
        var d = h('button', { type: 'button', class: 'botao' }, 'Tirar da lista');
        d.addEventListener('click', function () { fila.splice(fila.indexOf(p), 1); desenharGrade(); });
        li.appendChild(d);
      } else {
        var barra = h('progress', { max: '100', value: String(p.estado === 'enviando' ? p.pct : 0), 'aria-label': 'Envio de ' + p.nome });
        barras.set(p, barra);
        li.appendChild(barra);
        li.appendChild(h('p', { class: 'foto-estado' }, p.estado === 'enviando' ? TEXTOS.enviando + p.pct + '%' : (p.estado === 'reduzindo' ? TEXTOS.reduzindo : 'Na fila…')));
      }
      return li;
    }
    function atualizarProgresso(p) {
      var b = barras.get(p);
      if (b) { b.value = p.pct; var t = b.parentNode && b.parentNode.querySelector('.foto-estado'); if (t) t.textContent = TEXTOS.enviando + p.pct + '%'; }
    }
    function desenharGrade() {
      P.limpar(grade);
      fotos.forEach(function (f, n) { grade.appendChild(cartaoFoto(f, n)); });
      fila.forEach(function (p) { grade.appendChild(cartaoPendente(p)); });
      vazio.hidden = fotos.length > 0 || fila.length > 0;
      contagem.textContent = fotos.length + ' de ' + limite + ' fotos';
      if (fotos.length >= limite) botaoAdd.setAttribute('disabled', ''); else botaoAdd.removeAttribute('disabled');
    }

    // ---- carga inicial
    P.api('imoveis/' + id + '/fotos').then(function (r) {
      if (r.ok) { limite = r.dados.limite || MAX_FOTOS; atualizarFotos(r.dados.fotos || []); }
      else { vazio.textContent = P.mensagemDeErro(r); }
    });
    desenharGrade();
    return raiz;
  }

  window.PainelFotos = { montar: montar, tamanhoTexto: tamanhoTexto, TEXTOS: TEXTOS, processar: processar };
})();
