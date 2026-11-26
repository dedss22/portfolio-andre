// Copia sem alteracao de logica (sandbox do portfolio): codigo puro do servidor, roda no navegador.
// Feriados nacionais do Brasil (so informativo): fixos + os que dependem da Pascoa (Sexta-feira Santa e Carnaval).
// Mesma lista que o calendario do painel usa no navegador (public/admin/calendario.js). Puro, sem I/O.
import { adicionarDias } from './datas.js';

const FIXOS = [['01-01', 'Confraternização Universal'], ['04-21', 'Tiradentes'], ['05-01', 'Dia do Trabalho'], ['09-07', 'Independência'], ['10-12', 'Nossa Senhora Aparecida'],
  ['11-02', 'Finados'], ['11-15', 'Proclamação da República'], ['11-20', 'Consciência Negra'], ['12-25', 'Natal']];

/** Domingo de Pascoa (algoritmo gregoriano anonimo) como AAAA-MM-DD. */
export function pascoa(ano) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

const cache = new Map();
/** Mapa { 'AAAA-MM-DD': nome } dos feriados do ano. */
export function feriadosDoAno(ano) {
  if (cache.has(ano)) return cache.get(ano);
  const f = {};
  for (const [md, nome] of FIXOS) f[`${String(ano).padStart(4, '0')}-${md}`] = nome;
  const p = pascoa(ano);
  f[adicionarDias(p, -2)] = 'Sexta-feira Santa';
  f[adicionarDias(p, -47)] = 'Carnaval';
  f[adicionarDias(p, -48)] = 'Carnaval';
  cache.set(ano, f);
  return f;
}

/** Nome do feriado da data (AAAA-MM-DD) ou null. */
export function feriadoDe(iso) {
  return feriadosDoAno(Number(iso.slice(0, 4)))[iso] || null;
}
