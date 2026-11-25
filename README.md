# Portfólio — André Carvalho

Portfólio profissional de **André Carvalho**, Desenvolvedor Web & Otimizador de Processos (Astro 4 + Python / Paralelo 17), configurado para publicação em **https://andrecarvalhodev.com.br/**.

## Histórico & Roadmap por Pull Requests

- **Baseline (`main`):** Estrutura inicial limpa do site (sem arquivos temporários/residuais de prototipagem).
- **PR #1 (Mergeado) — [`fix/p0-critical-bugs`](https://github.com/dedss22/portfolio-andre/pull/1):**
  - Auto-hospedagem local de CSS/JS/fontes (zero dependência de `dennissnellenberg.com`).
  - Remoção do GA4 e metadados residuais do template; adição de SEO próprio e `favicon.svg`.
  - Correção do botão e fluxo AJAX do formulário de contato (`contact.html`).
  - Restauração do botão `Menu` mobile + link `Início` no drawer de todas as páginas.
  - Correção do modo Grade/Columns em `work.html` e criação da página de estudo de caso `cassiano-imoveis.html`.
- **PR #2 (Mergeado) — [`fix/p1-contrast-i18n-ux`](https://github.com/dedss22/portfolio-andre/pull/2):**
  - Unificação cromática Deep Navy `#0B1220` + Sapphire `#0284C7` / Cyan `#38BDF8` (removido `#455CE9`).
  - Correção do contraste de `PT | EN` em `work.html`, remoção da faixa branca `.line-globe` em `about.html`, contraste de `.btn-hamburger`, alinhamento mobile `01..05` e sidebar em `contact.html`, hero mobile em `index.html`.
  - Modularização JS em `assets/js/portfolio-core.js`, i18n 100% PT/EN (sem quebrar `.span-lines`), relógio BRT sem mutação global de `Intl`, `InteractiveFluidSphere` com touch + `IntersectionObserver`, HTML5 e A11y.
- **PR #3 (Mergeado) — [`chore/github-pages-domain`](https://github.com/dedss22/portfolio-andre/pull/3):**
  - Configuração de `CNAME` (`andrecarvalhodev.com.br`), `.nojekyll`, `robots.txt` e `sitemap.xml` + ativação do GitHub Pages.
- **PR #4 (Draft / Próximo Passo) — `feat/astro4-roadmap`:**
  - Plano completo em [`ROADMAP_ASTRO4.md`](./ROADMAP_ASTRO4.md) para migração modular para Astro 4, imagens AVIF/WebP e adição de cases de automações Python (Paralelo 17).
