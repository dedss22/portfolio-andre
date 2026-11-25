# Roadmap de Migração — Astro 4 & Expansão de Conteúdo

Este documento define o plano técnico para o **PR #4** após a publicação da versão estática estabilizada em **https://andrecarvalhodev.com.br/**.

## 1. Arquitetura de Componentes Astro 4

```text
src/
├── assets/                   # Imagens otimizadas via <Image /> (AVIF/WebP)
├── components/
│   ├── FluidButton.astro     # Esfera líquida com canvas + IntersectionObserver
│   ├── Footer.astro          # Rodapé unificado + relógio BRT
│   ├── MobileDrawer.astro    # Drawer único compartilhado
│   ├── Navbar.astro          # Barra superior com switcher PT | EN e Menu
│   ├── Preloader.astro       # Cortina de entrada controlada por sessionStorage
│   ├── ProjectCard.astro     # Card/Linha de projeto reutilizável
│   └── SeoHead.astro         # Meta tags, OpenGraph, canonical e favicon dinâmicos
├── content/
│   ├── config.ts             # Schema Zod para projetos e automações
│   └── projects/
│       ├── cassiano-imoveis.md
│       └── paralelo17-automacoes.md
├── i18n/
│   └── translations.ts       # Dicionário tipado PT-BR / EN
├── layouts/
│   └── BaseLayout.astro      # Shell único com <ViewTransitions /> nativo
├── pages/
│   ├── index.astro
│   ├── work.astro
│   ├── about.astro
│   ├── contact.astro
│   └── projetos/[slug].astro
└── styles/
    ├── tokens.css            # #0B1220, #162444, #38BDF8, #0284C7
    ├── base.css
    ├── components.css
    └── layout.css
```

## 2. Melhorias Planejadas nesta Etapa

1. **Substituir Barba.js + jQuery por `<ViewTransitions />` nativo do Astro 4:** transições SPA reais entre páginas sem reexecutar o preloader a cada retorno na Home.
2. **Content Collections + Cases de Automação Python (Paralelo 17):** adicionar 2–3 projetos/pipelines de automação operacional para complementar `Cassiano Imóveis` e tornar os filtros (`Todos | Design | Desenvolvimento`) representativos.
3. **Otimização de Mídia (`astro:assets`) e Fontes:** converter `andre_sopro_hd_hero.png` (842 KB) e `andre_workspace.jpg` (381 KB) para AVIF/WebP com `fetchpriority="high"` no LCP, e converter `NeueMontreal-*.otf` para `.woff2`.
4. **Rotas Bilíngues Estáticas (`/` e `/en/`):** SEO multilíngue nativo com `hreflang` e remoção de troca apenas em runtime.
5. **Prova Social & Métricas:** seção de resultados/depoimentos reais de clientes e link público para GitHub (`github.com/dedss22`).
