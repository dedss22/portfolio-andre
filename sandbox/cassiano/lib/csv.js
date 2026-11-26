// Copia sem alteracao de logica (sandbox do portfolio): codigo puro do servidor, roda no navegador.
// CSV para o Excel em portugues: UTF-8 com BOM, separador ";", quebra de linha CRLF, decimal com virgula,
// datas dd/mm/aaaa. Celulas de texto que comecam com = + - @ (ou TAB/CR) levam um apostrofo na frente, para o Excel
// nao interpretar como formula (injecao de formula em planilha).
import { formatarDataBr } from './datas.js';

/** Neutraliza texto que o Excel trataria como formula. Numeros nao passam por aqui. */
export function protegerCelula(valor) {
  const s = String(valor ?? '');
  return /^[\s]*[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

/** Centavos inteiros -> "1234,50" (sem separador de milhar, para o Excel tratar como numero). */
export function moedaCsv(centavos) {
  if (centavos === null || centavos === undefined || centavos === '') return '';
  const n = Math.round(Number(centavos));
  const sinal = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sinal}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, '0')}`;
}

function escapar(s) {
  return /[;"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** Formata uma celula segundo o tipo da coluna: texto | inteiro | moeda | data | sim_nao. */
export function celulaCsv(valor, tipo = 'texto') {
  if (valor === null || valor === undefined || valor === '') return '';
  switch (tipo) {
    case 'inteiro': return String(Math.trunc(Number(valor)));
    case 'moeda': return moedaCsv(valor);
    case 'data': return formatarDataBr(String(valor));
    case 'sim_nao': return valor ? 'Sim' : 'Não';
    default: return escapar(protegerCelula(valor));
  }
}

/**
 * colunas: [{ chave, titulo, tipo? }]; linhas: objetos. Devolve a string completa (com BOM).
 * Os titulos sao fixos do sistema, mas passam pela mesma protecao.
 */
export function gerarCsv(colunas, linhas) {
  const cab = colunas.map((c) => escapar(protegerCelula(c.titulo))).join(';');
  const corpo = linhas.map((l) => colunas.map((c) => celulaCsv(l[c.chave], c.tipo)).join(';'));
  return '﻿' + [cab, ...corpo].join('\r\n') + '\r\n';
}
