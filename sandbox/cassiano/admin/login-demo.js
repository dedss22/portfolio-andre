/* Sandbox: entrada de demonstracao. Mesmo fluxo do login.js real (POST /api/admin/login e volta para a pagina pedida), sem senha. */
(function () {
  'use strict';
  var form = document.getElementById('form'), botao = document.getElementById('entrar'), erro = document.getElementById('erro');
  function destino() {
    var v = null;
    try { v = new URLSearchParams(location.search).get('voltar'); } catch (e) { v = null; }
    return v && /^(imoveis|calendario)\.html([?#][\w\-/#=&]*)?$/.test(v) ? v : 'imoveis.html';
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    botao.disabled = true; botao.textContent = 'Entrando…'; erro.hidden = true;
    fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'painel' }, body: JSON.stringify({ email: 'dono@exemplo.test', senha: 'demo' }) })
      .then(function (r) {
        if (r.ok) { location.replace(destino()); return; }
        botao.disabled = false; botao.textContent = 'Entrar na demonstração';
        erro.textContent = 'Não foi possível entrar agora. Tente de novo.'; erro.hidden = false;
      });
  });
})();
