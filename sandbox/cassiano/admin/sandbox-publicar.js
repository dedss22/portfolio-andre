/* Sandbox: depois do "Publicar no site" do painel (publicar.js, sem alteracao), mostra uma simulacao do build.
   No sistema real o botao dispara um build que le o banco e gera o site estatico; se uma etapa falhar, a versao anterior continua no ar.
   Aqui o "site" e a previa em ../site/, gerada a partir do banco em memoria do navegador. */
(function () {
  'use strict';
  var S = window.SandboxCassiano, P = window.Painel, h = P.h;
  var caixa = document.getElementById('publicar');
  var ETAPAS = ['Lendo os imóveis publicados no banco', 'Gerando as páginas estáticas do site', 'Otimizando as fotos', 'Conferindo links, sitemap e prévias de compartilhamento', 'Colocando a nova versão no ar'];
  var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // opcao para ver o caminho de falha
  var falhar = h('input', { type: 'checkbox', id: 'sbx-falhar' });
  var opcao = h('label', { class: 'sbx-falha', for: 'sbx-falhar' }, falhar, 'Simular uma falha no build (para ver o site anterior continuar no ar)');
  new MutationObserver(function () { if (caixa.querySelector('#publicar-botao') && !caixa.contains(opcao)) caixa.appendChild(opcao); }).observe(caixa, { childList: true, subtree: true });

  function abrirSite() {
    if (window.parent !== window) window.parent.postMessage({ tipo: 'cassiano-sandbox:abrir', aba: 'site' }, location.origin);
    else location.href = '../site/index.html';
  }

  window.addEventListener('sandbox:publicar', function () {
    var vaiFalhar = falhar.checked;
    var lista = h('ol', { class: 'sbx-etapas', 'aria-live': 'polite' });
    var itens = ETAPAS.map(function (t) { var li = h('li', null, t); lista.appendChild(li); return li; });
    var nota = h('p', { class: 'sbx-nota', role: 'status' }, 'Se alguma etapa falhar, o site anterior continua no ar. Nada é trocado pela metade.');
    var acoes = h('div', { class: 'sbx-build-acoes' });
    var dlg = h('div', { class: 'sbx-build', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sbx-build-titulo' },
      h('div', { class: 'sbx-build-caixa' }, h('h2', { id: 'sbx-build-titulo', tabindex: '-1' }, 'Publicando no site…'), h('p', { class: 'sbx-build-sub' }, 'Simulação do build (no sistema real leva de 1 a 3 minutos).'), lista, nota, acoes));
    document.body.appendChild(dlg);
    dlg.querySelector('h2').focus();
    var i = 0, passo = reduzido ? 250 : 750;
    function proxima() {
      if (i > 0) itens[i - 1].className = 'feito';
      if (vaiFalhar && i === 2) {
        itens[1].className = 'falhou';
        dlg.querySelector('h2').textContent = 'A publicação falhou (simulação)';
        nota.className = 'sbx-nota erro';
        nota.textContent = 'O build parou em “Gerando as páginas”. O site anterior continua no ar, sem nenhuma mudança. Corrija e publique de novo.';
        fim(false); return;
      }
      if (i >= itens.length) {
        var db = S.carregar(); db.site = S.fotografarSite(db); S.salvar(db); S.marcar('publicou');
        dlg.querySelector('h2').textContent = 'Site atualizado!';
        nota.className = 'sbx-nota ok';
        nota.textContent = 'A nova versão está no ar (na prévia). Os imóveis publicados já aparecem no site.';
        fim(true); return;
      }
      itens[i].className = 'rodando'; i++;
      setTimeout(proxima, passo);
    }
    function fim(ok) {
      var fechar = h('button', { class: 'botao', type: 'button' }, 'Fechar');
      fechar.addEventListener('click', function () { dlg.remove(); var b = document.getElementById('publicar-botao'); if (b) b.focus(); });
      if (ok) { var ver = h('button', { class: 'botao primario', type: 'button', id: 'sbx-ver-site' }, 'Ver o site atualizado'); ver.addEventListener('click', function () { dlg.remove(); abrirSite(); }); acoes.appendChild(ver); }
      acoes.appendChild(fechar);
      (acoes.firstChild).focus();
    }
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape' && acoes.firstChild) acoes.lastChild.click(); });
    setTimeout(proxima, 200);
  });
})();
