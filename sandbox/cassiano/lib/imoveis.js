// Copia sem alteracao de logica (sandbox do portfolio): codigo puro do servidor, roda no navegador.
// Regras de cadastro de imoveis (venda, aluguel e temporada): validacao e normalizacao do que vem do painel.
// A descricao e escrita como texto simples (paragrafos separados por linha em branco) e e GUARDADA como HTML ja
// escapado, para o site publico nunca receber HTML arbitrario. Listas fechadas para destino, tipo e estilos.

export const NEGOCIOS = ['venda', 'aluguel', 'temporada'];
export const STATUS_IMOVEL = ['rascunho', 'publicado', 'vendido', 'alugado', 'arquivado'];
export const DESTINOS = ['arraial', 'trancoso', 'cabralia', 'portoseguro', 'caraiva'];
export const TIPOS_IMOVEL = ['casa', 'apartamento', 'terreno'];
export const ESTILOS = ['pe-na-areia', 'condominio', 'vista-mar', 'alto-padrao', 'praia'];

const RE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RE_CODIGO = /^CS-\d{3,4}$/;
const RE_ICONE = /^fa-[a-z0-9-]{2,30}$/;
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "Apartamento de Alto Padrão 137m²" -> "apartamento-de-alto-padrao-137m". */
export function slugificar(texto, max = 70) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/, '');
}

const escapar = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Texto simples -> HTML so com <p class="cassiano-desc-text"> (tudo escapado). Paragrafos separados por linha em branco. */
export function paragrafosParaHtml(texto) {
  return String(texto || '').replace(/\r/g, '').split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean)
    .map((p) => `<p class="cassiano-desc-text">${escapar(p)}</p>`).join('');
}

/** O caminho inverso, para editar no painel: tira as tags e restaura o texto, um paragrafo por bloco. */
export function htmlParaParagrafos(html) {
  return String(html || '').split(/<\/p>\s*/i).map((p) => p.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim()).filter(Boolean).join('\n\n');
}

const limparTexto = (v) => String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();

/**
 * Valida a entrada do painel. Retorna { ok, erros: { campo: mensagem }, valor } com colunas prontas para a tabela.
 * Os campos de preco dependem do tipo de negocio. Campos ausentes em "venda" e "aluguel" que so existem em temporada ficam nulos.
 */
export function validarImovel(e, { tipo_negocio } = {}) {
  const erros = {}, v = {};
  const negocio = tipo_negocio || e?.tipo_negocio;
  if (!NEGOCIOS.includes(negocio)) return { ok: false, erros: { tipo_negocio: 'Escolha venda, aluguel ou temporada.' }, valor: {} };
  v.tipo_negocio = negocio;
  e = e || {};

  const texto = (campo, { obrigatorio = false, min = 0, max = 200, rotulo = campo } = {}) => {
    const bruto = e[campo];
    if (bruto === undefined || bruto === null || bruto === '') { if (obrigatorio) erros[campo] = `Informe ${rotulo}.`; v[campo] = null; return; }
    if (typeof bruto !== 'string') { erros[campo] = `Confira ${rotulo}.`; return; }
    const t = limparTexto(bruto);
    if (t.length < min) { erros[campo] = `Informe ${rotulo}.`; return; }
    if (t.length > max) { erros[campo] = `${rotulo[0].toUpperCase() + rotulo.slice(1)} pode ter até ${max} caracteres.`; return; }
    v[campo] = t || null;
  };
  const inteiro = (campo, { obrigatorio = false, min = 0, max = 2147483647, rotulo = campo } = {}) => {
    const x = e[campo];
    if (x === undefined || x === null || x === '') { if (obrigatorio) erros[campo] = `Informe ${rotulo}.`; v[campo] = null; return; }
    if (!Number.isInteger(x) || x < min || x > max) { erros[campo] = `Confira ${rotulo}.`; return; }
    v[campo] = x;
  };
  const real = (campo, rotulo) => {
    const x = e[campo];
    if (x === undefined || x === null || x === '') { v[campo] = null; return; }
    if (typeof x !== 'number' || !Number.isFinite(x) || x < 0 || x > 1000000) { erros[campo] = `Confira ${rotulo}.`; return; }
    v[campo] = x;
  };
  const sim = (campo) => { v[campo] = e[campo] === true || e[campo] === 1 ? 1 : 0; };

  texto('titulo', { obrigatorio: true, min: 3, max: 150, rotulo: 'o título' });
  texto('titulo_card', { max: 150, rotulo: 'o título do cartão' });
  texto('badge_destaque', { max: 40, rotulo: 'o selo' });
  texto('bairro', { max: 80, rotulo: 'o bairro' });
  texto('cidade', { max: 80, rotulo: 'a cidade' });
  if (e.uf === undefined || e.uf === null || e.uf === '') v.uf = 'BA';
  else if (typeof e.uf === 'string' && /^[A-Za-z]{2}$/.test(e.uf.trim())) v.uf = e.uf.trim().toUpperCase();
  else erros.uf = 'Informe a sigla do estado.';
  texto('preco_label', { max: 60, rotulo: 'o rótulo do preço' });
  texto('preco_secundario_label', { max: 60, rotulo: 'o rótulo do segundo preço' });
  texto('condominio_texto', { max: 120, rotulo: 'o condomínio' });
  texto('iptu_texto', { max: 120, rotulo: 'o IPTU' });
  texto('caucao_texto', { max: 120, rotulo: 'a caução' });
  texto('vagas_texto', { max: 60, rotulo: 'as vagas' });
  texto('resumo_card', { max: 300, rotulo: 'o resumo' });
  texto('seo_title', { max: 70, rotulo: 'o título para o Google' });
  texto('seo_description', { max: 200, rotulo: 'a descrição para o Google' });
  texto('seo_keywords', { max: 200, rotulo: 'as palavras-chave' });

  if (!DESTINOS.includes(e.destino_slug)) erros.destino_slug = 'Escolha o destino.'; else v.destino_slug = e.destino_slug;
  if (!TIPOS_IMOVEL.includes(e.tipo_imovel)) erros.tipo_imovel = 'Escolha o tipo do imóvel.'; else v.tipo_imovel = e.tipo_imovel;
  const estilos = Array.isArray(e.estilos) ? e.estilos : [];
  if (estilos.length > 10 || estilos.some((s) => !ESTILOS.includes(s))) erros.estilos = 'Estilo inválido.'; else v.estilos_json = JSON.stringify([...new Set(estilos)]);

  if (e.slug !== undefined && e.slug !== null && e.slug !== '') {
    if (typeof e.slug !== 'string' || !RE_SLUG.test(e.slug) || e.slug.length < 3 || e.slug.length > 80) erros.slug = 'Endereço inválido: use letras minúsculas, números e hífens.'; else v.slug = e.slug;
  }
  if (e.codigo !== undefined && e.codigo !== null && e.codigo !== '') {
    if (typeof e.codigo !== 'string' || !RE_CODIGO.test(e.codigo)) erros.codigo = 'O código segue o formato CS-123.'; else v.codigo = e.codigo;
  }

  // precos por tipo de negocio
  sim('preco_sob_consulta'); sim('noindex'); sim('destaque');
  inteiro('preco_secundario_centavos', { rotulo: 'o segundo preço' });
  if (negocio === 'temporada') {
    inteiro('diaria_centavos', { obrigatorio: true, min: 1, rotulo: 'a diária' });
    inteiro('minimo_noites', { min: 1, max: 365, rotulo: 'o mínimo de noites' }); if (v.minimo_noites == null) v.minimo_noites = 1;
    inteiro('capacidade_hospedes', { min: 1, max: 99, rotulo: 'a capacidade' });
    inteiro('taxa_limpeza_centavos', { rotulo: 'a taxa de limpeza' });
    for (const c of ['checkin_hora', 'checkout_hora']) {
      if (e[c] === undefined || e[c] === null || e[c] === '') v[c] = null;
      else if (typeof e[c] !== 'string' || !RE_HORA.test(e[c])) erros[c] = 'Use o formato HH:MM.'; else v[c] = e[c];
    }
    inteiro('preco_centavos', { rotulo: 'o preço' });
  } else {
    v.diaria_centavos = null; v.minimo_noites = 1; v.capacidade_hospedes = null; v.taxa_limpeza_centavos = null; v.checkin_hora = null; v.checkout_hora = null;
    inteiro('preco_centavos', { obrigatorio: !v.preco_sob_consulta, rotulo: negocio === 'aluguel' ? 'o aluguel mensal' : 'o preço' });
  }

  real('area_privativa_m2', 'a área privativa'); real('area_total_m2', 'a área total');
  for (const [c, r] of [['quartos', 'os quartos'], ['suites', 'as suítes'], ['banheiros', 'os banheiros'], ['vagas', 'as vagas']]) inteiro(c, { max: 99, rotulo: r });

  // listas
  const espec = Array.isArray(e.especificacoes) ? e.especificacoes : [];
  if (espec.length > 12) erros.especificacoes = 'No máximo 12 itens.';
  else {
    const ok = [];
    for (const x of espec) {
      const titulo = typeof x?.titulo === 'string' ? limparTexto(x.titulo) : '', valor = typeof x?.valor === 'string' ? limparTexto(x.valor) : '';
      if (!titulo || !valor || titulo.length > 40 || valor.length > 60 || !RE_ICONE.test(String(x.icone || ''))) { erros.especificacoes = 'Confira os itens: ícone, título e valor.'; break; }
      ok.push({ icone: x.icone, titulo, valor });
    }
    if (!erros.especificacoes) v.especificacoes_json = JSON.stringify(ok);
  }
  const dif = Array.isArray(e.diferenciais) ? e.diferenciais : [];
  if (dif.length > 30 || dif.some((d) => typeof d !== 'string' || !limparTexto(d) || limparTexto(d).length > 200)) erros.diferenciais = 'Cada diferencial deve ter de 1 a 200 caracteres (máximo 30).';
  else v.diferenciais_json = JSON.stringify(dif.map(limparTexto));

  if (e.descricao !== undefined && e.descricao !== null) {
    if (typeof e.descricao !== 'string' || e.descricao.length > 6000) erros.descricao = 'A descrição pode ter até 6000 caracteres.';
    else v.descricao_html = paragrafosParaHtml(e.descricao) || null;
  } else v.descricao_html = null;

  return { ok: Object.keys(erros).length === 0, erros, valor: v };
}

/** Todas as colunas editaveis (lista fechada usada para montar INSERT e UPDATE; nenhum nome de coluna vem do usuario). */
export const COLUNAS_EDITAVEIS = ['codigo', 'slug', 'tipo_negocio', 'titulo', 'titulo_card', 'badge_destaque', 'destino_slug', 'tipo_imovel', 'estilos_json', 'bairro', 'cidade', 'uf',
  'preco_sob_consulta', 'preco_centavos', 'preco_label', 'preco_secundario_centavos', 'preco_secundario_label', 'condominio_texto', 'iptu_texto', 'caucao_texto',
  'diaria_centavos', 'minimo_noites', 'capacidade_hospedes', 'checkin_hora', 'checkout_hora', 'taxa_limpeza_centavos', 'area_privativa_m2', 'area_total_m2',
  'quartos', 'suites', 'banheiros', 'vagas', 'vagas_texto', 'especificacoes_json', 'resumo_card', 'descricao_html', 'diferenciais_json', 'seo_title', 'seo_description',
  'seo_keywords', 'noindex', 'destaque'];
