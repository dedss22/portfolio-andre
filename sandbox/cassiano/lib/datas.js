// Copia sem alteracao de logica (sandbox do portfolio): codigo puro do servidor, roda no navegador.
// Datas de calendario como texto ISO AAAA-MM-DD, sem hora e sem fuso (America/Bahia, UTC-3 o ano todo).
// Tudo em aritmetica UTC sobre a meia-noite do proprio dia: nunca depende do fuso do servidor.

const RE_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_DIA = 86400000;

/** true se for uma data de calendario valida no formato AAAA-MM-DD (rejeita 2027-02-30). */
export function ehDataIso(s) {
  if (typeof s !== 'string') return false;
  const m = RE_ISO.exec(s);
  if (!m) return false;
  const [a, me, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (a < 1900 || a > 2200 || me < 1 || me > 12 || d < 1) return false;
  const t = new Date(Date.UTC(a, me - 1, d));
  return t.getUTCFullYear() === a && t.getUTCMonth() === me - 1 && t.getUTCDate() === d;
}

function ms(s) {
  if (!ehDataIso(s)) throw new RangeError('Data invalida: ' + s);
  const m = RE_ISO.exec(s);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Numero de noites entre a entrada e a saida (a saida nao conta). */
export function noites(entrada, saida) {
  return Math.round((ms(saida) - ms(entrada)) / MS_DIA);
}

export function adicionarDias(iso, n) {
  return new Date(ms(iso) + n * MS_DIA).toISOString().slice(0, 10);
}

/** Dois intervalos [entrada, saida) se sobrepoem? Tocar no dia da saida NAO e sobreposicao. */
export function intervalosSeSobrepoem(a, b) {
  return a.entrada < b.saida && b.entrada < a.saida;
}

/** Cada noite do intervalo (a data em que a noite comeca). */
export function listarNoites(entrada, saida) {
  const out = [];
  for (let d = entrada; d < saida; d = adicionarDias(d, 1)) out.push(d);
  return out;
}

/** "Hoje" em America/Bahia (UTC-3) como AAAA-MM-DD. O relogio e injetavel para teste. */
export function hojeBahia(agora = new Date()) {
  return new Date(agora.getTime() - 3 * 3600000).toISOString().slice(0, 10);
}

/** Primeiro e ultimo dia (exclusivo) de um mes: [inicio, fimExclusivo). mes de 1 a 12. */
export function limitesDoMes(ano, mes) {
  const inicio = `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-01`;
  const prox = mes === 12 ? [ano + 1, 1] : [ano, mes + 1];
  return [inicio, `${String(prox[0]).padStart(4, '0')}-${String(prox[1]).padStart(2, '0')}-01`];
}

/** Noites do intervalo [entrada, saida) que caem dentro do mes. */
export function noitesNoMes(entrada, saida, ano, mes) {
  const [ini, fim] = limitesDoMes(ano, mes);
  const a = entrada > ini ? entrada : ini;
  const b = saida < fim ? saida : fim;
  return b > a ? noites(a, b) : 0;
}

/** dd/mm/aaaa para exibicao e planilhas. */
export function formatarDataBr(iso) {
  const m = RE_ISO.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** Numero de serie de data do Excel (dias desde 1899-12-30). 2026-01-01 = 46023. */
export function serialExcel(iso) {
  return Math.round((ms(iso) - Date.UTC(1899, 11, 30)) / MS_DIA);
}
