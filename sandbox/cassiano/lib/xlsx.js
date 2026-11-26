// Copia sem alteracao de logica (sandbox do portfolio): codigo puro do servidor, roda no navegador.
// Gerador de .xlsx sem dependencias, para rodar em qualquer ambiente JS (so Uint8Array e TextEncoder).
// Um .xlsx e um ZIP de XMLs. Usamos ZIP "stored" (sem compressao), CRC32 por tabela e texto "inlineStr"
// (sem sharedStrings). Celulas de texto sao neutralizadas contra injecao de formula.
import { serialExcel } from './datas.js';
import { protegerCelula } from './csv.js';

const enc = new TextEncoder();

// ---------------------------------------------------------------- CRC32 e ZIP
const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** files: [{ nome, dados: Uint8Array }]. Devolve o ZIP (metodo 0, sem compressao). */
export function zipStored(files) {
  const partes = [];
  const central = [];
  let offset = 0;
  const u16 = (v) => new Uint8Array([v & 0xff, (v >>> 8) & 0xff]);
  const u32 = (v) => new Uint8Array([v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff]);
  const junta = (...a) => { const n = a.reduce((s, x) => s + x.length, 0); const o = new Uint8Array(n); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
  const DATA_DOS = 0x5a21; // 2025-01-01 (valor fixo: o arquivo nao depende do relogio)
  for (const f of files) {
    const nome = enc.encode(f.nome);
    const crc = crc32(f.dados);
    const local = junta(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(DATA_DOS), u32(crc), u32(f.dados.length), u32(f.dados.length), u16(nome.length), u16(0), nome, f.dados);
    central.push(junta(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(DATA_DOS), u32(crc), u32(f.dados.length), u32(f.dados.length), u16(nome.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nome));
    partes.push(local);
    offset += local.length;
  }
  const dirCentral = junta(...central);
  const fim = junta(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(dirCentral.length), u32(offset), u16(0));
  return junta(...partes, dirCentral, fim);
}

// ---------------------------------------------------------------- XML
/** Escapa texto para XML e remove caracteres de controle proibidos. */
export function xmlEscapar(s) {
  return String(s)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** 1 -> A, 26 -> Z, 27 -> AA. */
export function letraColuna(n) {
  let s = '';
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

/** Nome de aba valido: ate 31 caracteres, sem [ ] : * ? / \ ; unico na pasta. */
export function nomeDeAba(nome, usados = new Set()) {
  let base = String(nome || 'Planilha').replace(/[\[\]:*?\/\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 31) || 'Planilha';
  let n = base, i = 2;
  while (usados.has(n.toLowerCase())) { const suf = ' ' + i++; n = base.slice(0, 31 - suf.length) + suf; }
  usados.add(n.toLowerCase());
  return n;
}

const ESTILO = { padrao: 0, cabecalho: 1, data: 2, moeda: 3, inteiro: 4 };

function celula(ref, valor, tipo) {
  if (valor === null || valor === undefined || valor === '') return '';
  if (tipo === 'inteiro' || tipo === 'numero') return `<c r="${ref}" s="${ESTILO.inteiro}"><v>${Math.trunc(Number(valor))}</v></c>`;
  if (tipo === 'moeda') return `<c r="${ref}" s="${ESTILO.moeda}"><v>${(Math.round(Number(valor)) / 100).toFixed(2)}</v></c>`;
  if (tipo === 'data') return `<c r="${ref}" s="${ESTILO.data}"><v>${serialExcel(String(valor))}</v></c>`;
  const texto = tipo === 'sim_nao' ? (valor ? 'Sim' : 'Não') : protegerCelula(valor);
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscapar(texto)}</t></is></c>`;
}

function xmlDaAba(aba) {
  const cols = aba.colunas;
  const larguras = cols.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.largura || 16}" customWidth="1"/>`).join('');
  const cab = cols.map((c, i) => `<c r="${letraColuna(i + 1)}1" s="${ESTILO.cabecalho}" t="inlineStr"><is><t>${xmlEscapar(protegerCelula(c.titulo))}</t></is></c>`).join('');
  const linhas = aba.linhas.map((l, r) => {
    const cs = cols.map((c, i) => celula(`${letraColuna(i + 1)}${r + 2}`, l[c.chave], c.tipo)).join('');
    return `<row r="${r + 2}">${cs}</row>`;
  }).join('');
  const ultima = `${letraColuna(Math.max(cols.length, 1))}${aba.linhas.length + 1}`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`
    + `<dimension ref="A1:${ultima}"/>`
    + `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    + `<cols>${larguras}</cols><sheetData><row r="1">${cab}</row>${linhas}</sheetData></worksheet>`;
}

// ---------------------------------------------------------------- estilos (styles.xml gerado a partir de um registro)
const hexCor = (c) => 'FF' + String(c).replace('#', '').toUpperCase();
const BASE_FMTS = [['dd/mm/yyyy', 164], ['"R$"\\ #,##0.00', 165]];

/**
 * Registro de estilos. Os 5 primeiros estilos (0 a 4: padrao, cabecalho, data, moeda, inteiro) sao os do gerador antigo e nunca mudam de indice.
 * estilo({ negrito, italico, tamanho, cor, fundo, borda: { cor, estilo?, lados? }, h, v, quebra, reduzir, recuo, formato }) devolve o indice do estilo
 * (cores como '#RRGGBB'; lados = letras de 'ltrb'; formato = codigo do Excel ou 'data' | 'moeda' | 'inteiro').
 */
export function criarEstilos() {
  const fontes = ['<font><sz val="11"/><name val="Calibri"/></font>', '<font><b/><sz val="11"/><name val="Calibri"/></font>'];
  const preench = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
  const bordas = ['<border><left/><right/><top/><bottom/><diagonal/></border>'];
  const fmts = BASE_FMTS.map((f) => [...f]);
  const xfs = [
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>',
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>',
    '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>',
    '<xf numFmtId="1" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>',
  ];
  const acha = (lista, xml) => { const i = lista.indexOf(xml); if (i >= 0) return i; lista.push(xml); return lista.length - 1; };
  const lado = (tag, e, cor) => (e ? `<${tag} style="${e}"><color rgb="${hexCor(cor)}"/></${tag}>` : `<${tag}/>`);
  return {
    estilo(o = {}) {
      const fonte = acha(fontes, `<font>${o.negrito ? '<b/>' : ''}${o.italico ? '<i/>' : ''}<sz val="${o.tamanho || 11}"/>${o.cor ? `<color rgb="${hexCor(o.cor)}"/>` : ''}<name val="Calibri"/></font>`);
      const fundo = o.fundo ? acha(preench, `<fill><patternFill patternType="solid"><fgColor rgb="${hexCor(o.fundo)}"/><bgColor indexed="64"/></patternFill></fill>`) : 0;
      let borda = 0;
      if (o.borda) {
        const l = o.borda.lados || 'ltrb', e = o.borda.estilo || 'thin', c = o.borda.cor || '#BFC5CC';
        borda = acha(bordas, `<border>${lado('left', l.includes('l') && e, c)}${lado('right', l.includes('r') && e, c)}${lado('top', l.includes('t') && e, c)}${lado('bottom', l.includes('b') && e, c)}<diagonal/></border>`);
      }
      let fmt = 0;
      if (o.formato) {
        const cod = { data: 'dd/mm/yyyy', moeda: '"R$"\\ #,##0.00', inteiro: '0' }[o.formato] || o.formato;
        if (cod === '0') fmt = 1;
        else { let f = fmts.find((x) => x[0] === cod); if (!f) { f = [cod, 164 + fmts.length]; fmts.push(f); } fmt = f[1]; }
      }
      const al = (o.h || o.v || o.quebra || o.reduzir || o.recuo)
        ? `<alignment${o.h ? ` horizontal="${o.h}"` : ''}${o.v ? ` vertical="${o.v}"` : ''}${o.quebra ? ' wrapText="1"' : ''}${o.reduzir ? ' shrinkToFit="1"' : ''}${o.recuo ? ` indent="${o.recuo}"` : ''}/>` : '';
      const attrs = `numFmtId="${fmt}" fontId="${fonte}" fillId="${fundo}" borderId="${borda}" xfId="0"${fmt ? ' applyNumberFormat="1"' : ''}${fonte ? ' applyFont="1"' : ''}${fundo ? ' applyFill="1"' : ''}${borda ? ' applyBorder="1"' : ''}${al ? ' applyAlignment="1"' : ''}`;
      return acha(xfs, al ? `<xf ${attrs}>${al}</xf>` : `<xf ${attrs}/>`);
    },
    xml() {
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
        + `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`
        + `<numFmts count="${fmts.length}">${fmts.map(([c, id]) => `<numFmt numFmtId="${id}" formatCode="${xmlEscapar(c)}"/>`).join('')}</numFmts>`
        + `<fonts count="${fontes.length}">${fontes.join('')}</fonts><fills count="${preench.length}">${preench.join('')}</fills><borders count="${bordas.length}">${bordas.join('')}</borders>`
        + `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>`
        + `<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
    },
  };
}

// ---------------------------------------------------------------- abas "livres" (celulas posicionadas, estilos, mesclas, impressao)
/** Texto de cabecalho/rodape de impressao: '&' vira '&&'. */
const hf = (t) => xmlEscapar(String(t).replace(/&/g, '&&'));

function celulaLivre(ref, c) {
  const s = c.s ? ` s="${c.s}"` : '';
  const v = c.v;
  if (v === null || v === undefined || v === '') return c.s ? `<c r="${ref}"${s}/>` : '';
  if (c.t === 'decimal') return `<c r="${ref}"${s}><v>${Number(v)}</v></c>`;
  if (c.t === 'inteiro' || c.t === 'numero') return `<c r="${ref}"${s}><v>${Math.trunc(Number(v))}</v></c>`;
  if (c.t === 'moeda') return `<c r="${ref}"${s}><v>${(Math.round(Number(v)) / 100).toFixed(2)}</v></c>`;
  if (c.t === 'data') return `<c r="${ref}"${s}><v>${serialExcel(String(v))}</v></c>`;
  const texto = c.t === 'sim_nao' ? (v ? 'Sim' : 'Não') : protegerCelula(v);
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${xmlEscapar(texto)}</t></is></c>`;
}

/**
 * Aba livre: { nome, livre: true, larguras: [numero por coluna], linhas: [{ n, altura?, celulas: [{ c (coluna, de 1), v?, t?, s? }] }], mesclas: ['A1:C1'],
 *   congelar?: { linhas?, colunas? }, semGrade?, corAba?, autofiltro?: 'A1:J9',
 *   impressao?: { paisagem?, ajustarLargura?, repetirLinhas?: [ini, fim], quebras?: [linha apos a qual quebra a pagina], rodape?: 'texto', centralizar? } }
 */
function xmlDaAbaLivre(a) {
  const linhas = [...a.linhas].sort((x, y) => x.n - y.n);
  let maxC = a.larguras?.length || 1, maxR = 1;
  for (const l of linhas) { maxR = Math.max(maxR, l.n); for (const c of l.celulas) maxC = Math.max(maxC, c.c); }
  const cols = (a.larguras || []).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
  const dados = linhas.map((l) => {
    const cs = [...l.celulas].sort((x, y) => x.c - y.c).map((c) => celulaLivre(`${letraColuna(c.c)}${l.n}`, c)).join('');
    return `<row r="${l.n}"${l.altura ? ` ht="${l.altura}" customHeight="1"` : ''}>${cs}</row>`;
  }).join('');
  const f = a.congelar;
  let painel = '';
  if (f && (f.linhas || f.colunas)) {
    const x = f.colunas || 0, y = f.linhas || 0;
    painel = `<pane${x ? ` xSplit="${x}"` : ''}${y ? ` ySplit="${y}"` : ''} topLeftCell="${letraColuna(x + 1)}${y + 1}" activePane="${x && y ? 'bottomRight' : x ? 'topRight' : 'bottomLeft'}" state="frozen"/>`;
  }
  const im = a.impressao;
  const mesclas = a.mesclas?.length ? `<mergeCells count="${a.mesclas.length}">${a.mesclas.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
  const quebras = im?.quebras?.length ? `<rowBreaks count="${im.quebras.length}" manualBreakCount="${im.quebras.length}">${im.quebras.map((r) => `<brk id="${r}" max="16383" man="1"/>`).join('')}</rowBreaks>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`
    + `<sheetPr>${a.corAba ? `<tabColor rgb="${hexCor(a.corAba)}"/>` : ''}${im?.ajustarLargura ? '<pageSetUpPr fitToPage="1"/>' : ''}</sheetPr>`
    + `<dimension ref="A1:${letraColuna(maxC)}${maxR}"/>`
    + `<sheetViews><sheetView${a.semGrade ? ' showGridLines="0"' : ''} workbookViewId="0">${painel}</sheetView></sheetViews>`
    + `<sheetFormatPr defaultRowHeight="15"/>`
    + (cols ? `<cols>${cols}</cols>` : '') + `<sheetData>${dados}</sheetData>`
    + (a.autofiltro ? `<autoFilter ref="${a.autofiltro}"/>` : '') + mesclas
    + (im ? `${im.centralizar ? '<printOptions horizontalCentered="1"/>' : ''}<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.6" header="0.3" footer="0.3"/>`
      + `<pageSetup paperSize="9" orientation="${im.paisagem ? 'landscape' : 'portrait'}"${im.ajustarLargura ? ' fitToWidth="1" fitToHeight="0"' : ''}/>`
      + (im.rodape ? `<headerFooter><oddFooter>&amp;L${hf(im.rodape)}&amp;RPágina &amp;P de &amp;N</oddFooter></headerFooter>` : '') + quebras : '')
    + `</worksheet>`;
}

/**
 * abas: [{ nome, colunas: [{ chave, titulo, tipo?, largura? }], linhas: [objetos] }]
 * tipos: texto (padrao) | inteiro | moeda (centavos) | data (AAAA-MM-DD) | sim_nao.
 * Devolve um Uint8Array com o arquivo .xlsx.
 */
export function gerarXlsx(abas, opcoes = {}) {
  if (!abas.length) throw new RangeError('Informe ao menos uma aba.');
  const estilos = opcoes.estilos || criarEstilos();
  const usados = new Set();
  const nomes = abas.map((a) => nomeDeAba(a.nome, usados));
  const arquivos = [];
  const titulos = [];
  abas.forEach((a, i) => { const r = a.impressao?.repetirLinhas; if (a.livre && r) titulos.push(`<definedName name="_xlnm.Print_Titles" localSheetId="${i}">'${nomes[i].replace(/'/g, "''")}'!$${r[0]}:$${r[1]}</definedName>`); });
  const add = (nome, xml) => arquivos.push({ nome, dados: enc.encode(xml) });
  add('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
    + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
    + `<Default Extension="xml" ContentType="application/xml"/>`
    + `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>`
    + abas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
    + `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>`
    + `</Types>`);
  add('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
    + `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  add('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">`
    + `<sheets>${nomes.map((n, i) => `<sheet name="${xmlEscapar(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>`
    + (titulos.length ? `<definedNames>${titulos.join('')}</definedNames>` : '') + `</workbook>`);
  add('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
    + abas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
    + `<Relationship Id="rId${abas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  add('xl/styles.xml', estilos.xml());
  abas.forEach((a, i) => add(`xl/worksheets/sheet${i + 1}.xml`, a.livre ? xmlDaAbaLivre(a) : xmlDaAba(a)));
  return zipStored(arquivos);
}
