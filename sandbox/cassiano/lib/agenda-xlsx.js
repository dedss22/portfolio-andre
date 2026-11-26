// Copia sem alteracao de logica (sandbox do portfolio): codigo puro do servidor, roda no navegador.
// Planilha "Agenda geral" (.xlsx) e CSV, a partir dos dados de agenda.mjs. Puro, sem I/O.
// Aba 1 = o modelo impresso: um bloco por mes (titulo, dias com dia da semana, uma linha por casa, reservas como celulas
// mescladas na largura das noites, cor por ORIGEM, linha "Unidades livres") e a legenda uma vez no fim. Depois: Periodos livres,
// Reservas e Ocupacao e receita. Todos os textos fixos estao em TEXTOS (o dono aprova antes do merge).
import { criarEstilos, gerarXlsx, letraColuna } from './xlsx.js';
import { gerarCsv } from './csv.js';
import { formatarDataBr, adicionarDias, noites } from './datas.js';
import { diaDaSemana } from './agenda.js';

export const TEXTOS = {
  aba1: 'Agenda geral', aba2: 'Períodos livres', aba3: 'Reservas', aba4: 'Ocupação e receita',
  titulo: (de, ate) => `Agenda geral · ${formatarDataBr(de)} a ${formatarDataBr(ate)}`,
  propriedade: 'Propriedade', unidade: 'Unidade', unidadesLivres: 'Unidades livres', legenda: 'Legenda',
  nota: 'O nome aparece no dia de entrada. O dia de saída fica livre (check-out exclusivo).',
  continuacao: '(cont.) ',
  rodape: (agoraBr) => `Cassiano Imóveis · Temporada · Gerada em ${agoraBr}`,
  rotulos: { reserva: 'Reserva', pre: 'Pré', bloqueio: 'Bloqueio', canal: 'Bloqueio do canal', manutencao: 'Manutenção', conflito: 'CONFLITO' },
  semana: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
};

/** Categorias de cor: direta, airbnb, booking, site, pre, bloqueio, canal, manutencao, conflito. fundo/texto = contraste minimo de 4,5:1. */
export const CATEGORIAS = {
  direta: { nome: 'Direta', desc: 'Reserva feita direto com você', fundo: '#15805C', texto: '#FFFFFF' },
  airbnb: { nome: 'Airbnb', desc: 'Reserva do Airbnb', fundo: '#C94444', texto: '#FFFFFF' },
  booking: { nome: 'Booking', desc: 'Reserva do Booking', fundo: '#2D5FD0', texto: '#FFFFFF' },
  site: { nome: 'Motor do site', desc: 'Reserva feita pelo motor de reservas do site', fundo: '#7A4FD0', texto: '#FFFFFF' },
  pre: { nome: 'Pré-reserva', desc: 'Pré-reserva ainda sem confirmação', fundo: '#F2C94C', texto: '#1F2937' },
  bloqueio: { nome: 'Bloqueio', desc: 'Data bloqueada no painel', fundo: '#6B7280', texto: '#FFFFFF' },
  canal: { nome: 'Bloqueio do canal', desc: 'Data fechada no Airbnb ou Booking (informativo)', fundo: '#CBD0D6', texto: '#1F2937' },
  manutencao: { nome: 'Manutenção', desc: 'Casa em manutenção', fundo: '#9CA3AF', texto: '#111827' },
  conflito: { nome: 'CONFLITO', desc: 'Duas reservas na mesma noite: resolver', fundo: '#A61B1B', texto: '#FFFFFF' },
};
const COR = { cabecalho: '#0E4D5A', titulo: '#0B5563', propriedade: '#E3F1EF', fimDeSemana: '#EEF0F2', grade: '#C9D1D8', livre: '#FFFFFF' };
export const ROT_ORIGEM = { direto: 'Direto/WhatsApp', airbnb: 'Airbnb', booking: 'Booking', indicacao: 'Outro', site: 'Motor do site' };
export const ROT_ESTADO = { pre_reserva: 'Pré-reserva', alugado: 'Alugado', bloqueio_dono: 'Bloqueio do proprietário', manutencao: 'Manutenção', cancelado: 'Cancelado' };

/** Categoria de cor de uma reserva da agenda ({ estado, origem }). Indicacao conta como Direta. */
export function categoriaDe(r) {
  if (r.estado === 'pre_reserva') return 'pre';
  if (r.estado === 'manutencao') return 'manutencao';
  if (r.estado === 'bloqueio_dono') return r.origem === 'airbnb' || r.origem === 'booking' ? 'canal' : 'bloqueio';
  return r.origem === 'airbnb' ? 'airbnb' : r.origem === 'booking' ? 'booking' : r.origem === 'site' ? 'site' : 'direta';
}
function textoDe(r) {
  const t = TEXTOS.rotulos;
  if (r.estado === 'pre_reserva') return r.hospede ? `${t.pre} · ${r.hospede}` : t.pre;
  if (r.estado === 'manutencao') return t.manutencao;
  if (r.estado === 'bloqueio_dono') return categoriaDe(r) === 'canal' ? t.canal : t.bloqueio;
  return r.hospede || t.reserva;
}

const dataHoraBr = (agora) => { const d = new Date(agora.getTime() - 3 * 3600000).toISOString(); return `${formatarDataBr(d.slice(0, 10))} ${d.slice(11, 16)}`; };
const nomeCasa = (c) => `${c.codigo} ${c.titulo}`;

/** Meses (AAAA-MM) que o periodo toca, cada um com os dias do periodo dentro dele. */
function blocosPorMes(dias) {
  const blocos = [];
  for (const d of dias) {
    const ym = d.data.slice(0, 7);
    if (!blocos.length || blocos[blocos.length - 1].ym !== ym) blocos.push({ ym, dias: [] });
    blocos[blocos.length - 1].dias.push(d);
  }
  return blocos;
}

function aba1(agenda, E, agora) {
  const borda = { cor: COR.grade };
  const st = {
    titulo: E.estilo({ negrito: true, tamanho: 15, cor: COR.titulo, v: 'center' }),
    cab: E.estilo({ negrito: true, tamanho: 9, cor: '#FFFFFF', fundo: COR.cabecalho, h: 'center', v: 'center', borda: { cor: '#FFFFFF' } }),
    cabSem: E.estilo({ negrito: true, tamanho: 8, cor: '#FFFFFF', fundo: COR.cabecalho, h: 'center', v: 'center', borda: { cor: '#FFFFFF' } }),
    cabSemFds: E.estilo({ negrito: true, tamanho: 8, cor: '#F2C94C', fundo: COR.cabecalho, h: 'center', v: 'center', borda: { cor: '#FFFFFF' } }),
    prop: E.estilo({ negrito: true, tamanho: 10, fundo: COR.propriedade, v: 'center', borda, quebra: true }),
    unid: E.estilo({ tamanho: 10, fundo: COR.propriedade, v: 'center', borda }),
    livre: E.estilo({ tamanho: 8, fundo: COR.livre, borda }),
    fds: E.estilo({ tamanho: 8, fundo: COR.fimDeSemana, borda }),
    livresRot: E.estilo({ negrito: true, tamanho: 10, v: 'center', borda: { cor: COR.grade, lados: 't', estilo: 'medium' } }),
    livresNum: E.estilo({ negrito: true, tamanho: 9, h: 'center', v: 'center', borda: { cor: COR.grade, lados: 'tb' } }),
    legTitulo: E.estilo({ negrito: true, tamanho: 11, cor: COR.titulo }),
    legDesc: E.estilo({ tamanho: 9, cor: '#374151', v: 'center' }),
    nota: E.estilo({ italico: true, tamanho: 9, cor: '#4B5563' }),
  };
  const cat = {};
  for (const [k, c] of Object.entries(CATEGORIAS)) cat[k] = E.estilo({ tamanho: 8, cor: c.texto, fundo: c.fundo, v: 'center', h: 'left', borda: { cor: '#FFFFFF' } });
  const catLeg = {};
  for (const [k, c] of Object.entries(CATEGORIAS)) catLeg[k] = E.estilo({ negrito: true, tamanho: 9, cor: c.texto, fundo: c.fundo, v: 'center', borda: { cor: '#FFFFFF' } });
  const legLivre = E.estilo({ negrito: true, tamanho: 9, v: 'center', borda: { cor: COR.grade } });

  const linhas = [], mesclas = [], quebras = [];
  let n = 1;
  const nDiasMax = Math.max(...blocosPorMes(agenda.dias).map((b) => b.dias.length));
  const blocos = blocosPorMes(agenda.dias);
  blocos.forEach((bloco) => {
    const d0 = bloco.dias[0].data, d1 = bloco.dias[bloco.dias.length - 1].data, ateEx = adicionarDias(d1, 1), nb = bloco.dias.length, ultCol = 2 + nb;
    // titulo
    linhas.push({ n, altura: 26, celulas: [{ c: 1, v: TEXTOS.titulo(d0, d1), s: st.titulo }] }); mesclas.push(`A${n}:${letraColuna(ultCol)}${n}`); n++;
    // cabecalho: dia/mes e dia da semana
    const cabDia = [{ c: 1, v: TEXTOS.propriedade, s: st.cab }, { c: 2, v: TEXTOS.unidade, s: st.cab }], cabSem = [{ c: 1, s: st.cab }, { c: 2, s: st.cab }];
    bloco.dias.forEach((d, i) => {
      cabDia.push({ c: 3 + i, v: `${d.data.slice(8, 10)}/${d.data.slice(5, 7)}`, s: st.cab });
      cabSem.push({ c: 3 + i, v: TEXTOS.semana[d.dow], s: d.fim_de_semana ? st.cabSemFds : st.cabSem });
    });
    linhas.push({ n, altura: 15, celulas: cabDia }); linhas.push({ n: n + 1, altura: 13, celulas: cabSem });
    mesclas.push(`A${n}:A${n + 1}`, `B${n}:B${n + 1}`); n += 2;
    // uma linha por casa
    for (const casa of agenda.casas) {
      const noite = new Array(nb).fill(null);
      const conflitoDia = new Set(casa.conflitos);
      for (const r of casa.reservas) {
        const a = r.entrada > d0 ? r.entrada : d0, b = r.saida < ateEx ? r.saida : ateEx;
        if (b <= a) continue;
        const i0 = noites(d0, a), i1 = noites(d0, b);
        for (let i = i0; i < i1; i++) noite[i] = noite[i] ? { ...noite[i], conflito: true } : { rid: r.id, cat: categoriaDe(r), texto: textoDe(r), inicio: i === i0, cont: r.entrada < d0 && i === i0 };
      }
      const cel = [{ c: 1, v: nomeCasa(casa), s: st.prop }, { c: 2, v: casa.unidade, s: st.unid }];
      for (let i = 0; i < nb;) {
        const x = noite[i];
        if (!x) { cel.push({ c: 3 + i, s: bloco.dias[i].fim_de_semana ? st.fds : st.livre }); i++; continue; }
        if (x.conflito || conflitoDia.has(bloco.dias[i].data)) { cel.push({ c: 3 + i, v: TEXTOS.rotulos.conflito, s: cat.conflito }); i++; continue; }
        let j = i + 1;
        while (j < nb && noite[j] && !noite[j].conflito && noite[j].rid === x.rid) j++;
        cel.push({ c: 3 + i, v: (x.cont ? TEXTOS.continuacao : '') + x.texto, s: cat[x.cat] });
        for (let k = i + 1; k < j; k++) cel.push({ c: 3 + k, s: cat[x.cat] });
        if (j - i > 1) mesclas.push(`${letraColuna(3 + i)}${n}:${letraColuna(3 + j - 1)}${n}`);
        i = j;
      }
      linhas.push({ n, altura: 17, celulas: cel }); n++;
    }
    // unidades livres
    const idx0 = noites(agenda.de, d0);
    linhas.push({ n, altura: 18, celulas: [{ c: 1, v: TEXTOS.unidadesLivres, s: st.livresRot }, { c: 2, s: st.livresRot }, ...bloco.dias.map((_, i) => ({ c: 3 + i, v: agenda.livres_por_dia[idx0 + i], t: 'inteiro', s: st.livresNum }))] });
    mesclas.push(`A${n}:B${n}`); n++;
    linhas.push({ n, altura: 12, celulas: [] }); quebras.push(n); n++; // linha em branco; a pagina quebra depois dela
  });
  // legenda (uma vez, no fim)
  quebras.pop(); // sem quebra depois do ultimo bloco: a legenda fica na mesma pagina
  linhas.push({ n, celulas: [{ c: 1, v: TEXTOS.legenda, s: st.legTitulo }] }); n++;
  const ordemFinal = ['direta', 'airbnb', 'booking', 'site', 'pre', 'bloqueio', 'canal', 'manutencao', 'conflito'];
  for (const k of ordemFinal) {
    linhas.push({ n, altura: 15, celulas: [{ c: 1, v: CATEGORIAS[k].nome, s: catLeg[k] }, { c: 2, s: st.legDesc }, { c: 3, v: CATEGORIAS[k].desc, s: st.legDesc }] });
    mesclas.push(`C${n}:${letraColuna(Math.min(3 + 14, 2 + nDiasMax))}${n}`); n++;
  }
  linhas.push({ n, altura: 15, celulas: [{ c: 1, v: 'Livre', s: legLivre }, { c: 3, v: 'Sem reserva (fins de semana em cinza claro)', s: st.legDesc }] });
  mesclas.push(`C${n}:${letraColuna(Math.min(3 + 14, 2 + nDiasMax))}${n}`); n++;
  linhas.push({ n, celulas: [{ c: 1, v: TEXTOS.nota, s: st.nota }] }); mesclas.push(`A${n}:${letraColuna(2 + nDiasMax)}${n}`);
  return {
    nome: TEXTOS.aba1, livre: true, semGrade: true, corAba: COR.cabecalho,
    larguras: [26, 15, ...new Array(nDiasMax).fill(5.9)], linhas, mesclas, congelar: { colunas: 2 },
    impressao: { paisagem: true, ajustarLargura: true, quebras, rodape: TEXTOS.rodape(dataHoraBr(agora)) },
  };
}

function abaTabela(nome, colunas, dados, E, rodape, corAba) {
  const cab = E.estilo({ negrito: true, cor: '#FFFFFF', fundo: COR.cabecalho, v: 'center', borda: { cor: '#FFFFFF' } });
  const base = { v: 'center', borda: { cor: COR.grade } };
  const est = { texto: E.estilo(base), data: E.estilo({ ...base, formato: 'data', h: 'center' }), inteiro: E.estilo({ ...base, formato: 'inteiro', h: 'center' }), moeda: E.estilo({ ...base, formato: 'moeda' }), sim_nao: E.estilo({ ...base, h: 'center' }), decimal: E.estilo({ ...base, formato: '0.0', h: 'center' }) };
  const linhas = [{ n: 1, altura: 22, celulas: colunas.map((c, i) => ({ c: i + 1, v: c.titulo, s: cab })) }];
  dados.forEach((l, r) => linhas.push({ n: r + 2, celulas: colunas.map((c, i) => ({ c: i + 1, v: l[c.chave], t: c.tipo, s: est[c.tipo || 'texto'] || est.texto })) }));
  return {
    nome, livre: true, corAba, larguras: colunas.map((c) => c.largura || 14), linhas, congelar: { linhas: 1 },
    autofiltro: dados.length ? `A1:${letraColuna(colunas.length)}${dados.length + 1}` : undefined,
    impressao: { paisagem: true, ajustarLargura: true, repetirLinhas: [1, 1], rodape },
  };
}

/** Noites do periodo, por casa e mes, em cada situacao (so dentro do periodo). */
function ocupacaoMensal(agenda, detalhe) {
  const out = [];
  const meses = blocosPorMes(agenda.dias);
  for (const casa of agenda.casas) {
    for (const m of meses) {
      const ini = m.dias[0].data, fimEx = adicionarDias(m.dias[m.dias.length - 1].data, 1);
      const cont = { alugado: 0, pre_reserva: 0, bloqueio_dono: 0, manutencao: 0 };
      for (const r of casa.reservas) { const a = r.entrada > ini ? r.entrada : ini, b = r.saida < fimEx ? r.saida : fimEx; if (b > a) cont[r.estado] += noites(a, b); }
      const entradas = detalhe.filter((d) => d.imovel_id === casa.id && d.estado === 'alugado' && d.entrada >= ini && d.entrada < fimEx);
      const soma = (k) => entradas.reduce((s, d) => s + (Number(d[k]) || 0), 0);
      const total = soma('total_centavos'), sinal = soma('sinal_centavos');
      const ocupadas = cont.alugado + cont.pre_reserva + cont.bloqueio_dono + cont.manutencao;
      out.push({ casa: nomeCasa(casa), mes: `${m.ym.slice(5)}/${m.ym.slice(0, 4)}`, noites: m.dias.length, alugado: cont.alugado, pre_reserva: cont.pre_reserva, bloqueio_dono: cont.bloqueio_dono, manutencao: cont.manutencao,
        livres: m.dias.length - ocupadas, ocupacao: Math.round((cont.alugado / m.dias.length) * 1000) / 10, reservas: entradas.length, total_centavos: total, sinal_centavos: sinal, a_receber_centavos: total - sinal });
    }
  }
  return out;
}

/** Monta o .xlsx. dados = resultado de carregarAgenda ({ agenda, reservas, casas }). Devolve Uint8Array. */
export function gerarPlanilhaAgenda({ agenda, reservas }, agora = new Date()) {
  const E = criarEstilos();
  const rodape = TEXTOS.rodape(dataHoraBr(agora));
  const casaPor = Object.fromEntries(agenda.casas.map((c) => [c.id, c]));
  const livres = agenda.casas.flatMap((c) => c.livres.map((l) => ({ casa: nomeCasa(c), de: l.de, ate: l.ate, noites: l.noites })));
  const lista = reservas.map((r) => ({ casa: nomeCasa(casaPor[r.imovel_id]), hospede: r.hospede_nome, entrada: r.entrada, saida: r.saida, noites: noites(r.entrada, r.saida), origem: ROT_ORIGEM[r.origem] || r.origem,
    estado: ROT_ESTADO[r.estado] || r.estado, total_centavos: r.total_centavos, sinal_centavos: r.sinal_centavos, pago: r.pago })).sort((a, b) => (a.entrada < b.entrada ? -1 : a.entrada > b.entrada ? 1 : a.casa < b.casa ? -1 : 1));
  const abas = [
    aba1(agenda, E, agora),
    abaTabela(TEXTOS.aba2, [{ chave: 'casa', titulo: 'Casa', largura: 34 }, { chave: 'de', titulo: 'Livre a partir de', tipo: 'data', largura: 18 }, { chave: 'ate', titulo: 'Até o dia (saída)', tipo: 'data', largura: 18 }, { chave: 'noites', titulo: 'Noites livres', tipo: 'inteiro', largura: 14 }], livres, E, rodape, '#15805C'),
    abaTabela(TEXTOS.aba3, [{ chave: 'casa', titulo: 'Casa', largura: 34 }, { chave: 'hospede', titulo: 'Hóspede', largura: 26 }, { chave: 'entrada', titulo: 'Entrada', tipo: 'data', largura: 12 }, { chave: 'saida', titulo: 'Saída', tipo: 'data', largura: 12 },
      { chave: 'noites', titulo: 'Noites', tipo: 'inteiro', largura: 9 }, { chave: 'origem', titulo: 'Origem', largura: 16 }, { chave: 'estado', titulo: 'Situação', largura: 24 }, { chave: 'total_centavos', titulo: 'Total', tipo: 'moeda', largura: 14 },
      { chave: 'sinal_centavos', titulo: 'Sinal', tipo: 'moeda', largura: 14 }, { chave: 'pago', titulo: 'Pago', tipo: 'sim_nao', largura: 8 }], lista, E, rodape, '#C94444'),
    abaTabela(TEXTOS.aba4, [{ chave: 'casa', titulo: 'Casa', largura: 34 }, { chave: 'mes', titulo: 'Mês', largura: 10 }, { chave: 'noites', titulo: 'Noites no período', tipo: 'inteiro', largura: 17 }, { chave: 'alugado', titulo: 'Alugadas', tipo: 'inteiro', largura: 11 },
      { chave: 'pre_reserva', titulo: 'Pré-reservas', tipo: 'inteiro', largura: 13 }, { chave: 'bloqueio_dono', titulo: 'Bloqueio do proprietário', tipo: 'inteiro', largura: 22 }, { chave: 'manutencao', titulo: 'Manutenção', tipo: 'inteiro', largura: 13 },
      { chave: 'livres', titulo: 'Livres', tipo: 'inteiro', largura: 9 }, { chave: 'ocupacao', titulo: 'Ocupação (%)', tipo: 'decimal', largura: 13 }, { chave: 'reservas', titulo: 'Reservas (entradas)', tipo: 'inteiro', largura: 18 },
      { chave: 'total_centavos', titulo: 'Total', tipo: 'moeda', largura: 14 }, { chave: 'sinal_centavos', titulo: 'Sinal recebido', tipo: 'moeda', largura: 15 }, { chave: 'a_receber_centavos', titulo: 'A receber', tipo: 'moeda', largura: 14 }], ocupacaoMensal(agenda, reservas), E, rodape, '#2D5FD0'),
  ];
  return gerarXlsx(abas, { estilos: E });
}

/** CSV longo: uma linha por casa e por noite do periodo (inclusive as livres). */
export function gerarCsvAgenda({ agenda }) {
  const linhas = [];
  agenda.casas.forEach((c) => {
    const por = new Array(agenda.dias.length).fill(null);
    for (const r of c.reservas) {
      const a = r.entrada > agenda.de ? r.entrada : agenda.de, ateEx = adicionarDias(agenda.ate, 1), b = r.saida < ateEx ? r.saida : ateEx;
      for (let i = noites(agenda.de, a); i < noites(agenda.de, b); i++) por[i] = r;
    }
    agenda.dias.forEach((d, i) => {
      const r = por[i];
      linhas.push({ casa: nomeCasa(c), data: d.data, dia: TEXTOS.semana[diaDaSemana(d.data)], estado: r ? ROT_ESTADO[r.estado] : 'Livre', origem: r && r.estado !== 'manutencao' ? ROT_ORIGEM[r.origem] || r.origem : '', hospede: r?.hospede || '' });
    });
  });
  return gerarCsv([{ chave: 'casa', titulo: 'Casa' }, { chave: 'data', titulo: 'Data', tipo: 'data' }, { chave: 'dia', titulo: 'Dia da semana' }, { chave: 'estado', titulo: 'Situação' }, { chave: 'origem', titulo: 'Origem' }, { chave: 'hospede', titulo: 'Hóspede' }], linhas);
}
