// Copia sem alteracao de logica (sandbox do portfolio): codigo puro do servidor, roda no navegador.
// Regras de reserva de temporada: validacao, preco por noite, estadia minima e insercao sem sobreposicao.
// Puro (sem I/O proprio). A insercao recebe um "db" com a interface prepare().bind().first()/all()/run().
import { ehDataIso, noites, listarNoites, hojeBahia, noitesNoMes } from './datas.js';
const ehConflitoDeDatas = () => false; // sandbox: sem banco

export const ESTADOS = ['pre_reserva', 'alugado', 'bloqueio_dono', 'manutencao', 'cancelado'];
// 'site' = motor de reservas do proprio site (futuro): so ele cria; o painel nao oferece manualmente. Exige a migracao 0005.
export const ORIGENS = ['direto', 'airbnb', 'booking', 'indicacao', 'site'];
const ESTADOS_COM_HOSPEDE = ['alugado', 'pre_reserva'];

const soDigitos = (s) => String(s || '').replace(/\D/g, '');

/**
 * Valida os dados de uma reserva vindos do painel. Nada e gravado aqui.
 * Retorna { ok, erros: { campo: mensagem }, valor } (valor ja normalizado).
 * Opcoes: hoje (AAAA-MM-DD, injetavel), permitirPassado (padrao false para novas reservas).
 */
export function validarReserva(entrada, opcoes = {}) {
  const erros = {};
  const v = {};
  const hoje = opcoes.hoje || hojeBahia();

  if (!ehDataIso(entrada?.entrada)) erros.entrada = 'Informe a data de entrada.';
  else v.entrada = entrada.entrada;
  if (!ehDataIso(entrada?.saida)) erros.saida = 'Informe a data de saída.';
  else v.saida = entrada.saida;
  if (v.entrada && v.saida && v.saida <= v.entrada) erros.saida = 'A data de saída precisa ser depois da entrada.';
  if (v.entrada && !erros.saida && !opcoes.permitirPassado && v.saida <= hoje) erros.entrada = 'As datas já passaram.';

  if (!ESTADOS.includes(entrada?.estado)) erros.estado = 'Escolha o tipo da reserva.';
  else v.estado = entrada.estado;

  v.origem = entrada?.origem || 'direto';
  if (!ORIGENS.includes(v.origem)) erros.origem = 'Origem inválida.';

  const nome = String(entrada?.hospede_nome ?? '').replace(/\s+/g, ' ').trim();
  const fone = String(entrada?.hospede_fone ?? '').trim();
  if (nome.length > 100) erros.hospede_nome = 'O nome é grande demais.';
  if (fone && !/^\+?[\d\s().-]{6,24}$/.test(fone)) erros.hospede_fone = 'Confira o telefone.';
  if (v.estado === 'alugado' && !nome) erros.hospede_nome = 'Informe o nome do hóspede.';
  if (v.estado && !ESTADOS_COM_HOSPEDE.includes(v.estado)) {
    // bloqueios e manutencao nao guardam dados de hospede (minimizacao LGPD)
    v.hospede_nome = null; v.hospede_fone = null; v.pessoas = null;
  } else {
    v.hospede_nome = nome || null;
    v.hospede_fone = fone ? (fone.startsWith('+') ? '+' + soDigitos(fone) : soDigitos(fone)) : null;
    if (entrada?.pessoas === undefined || entrada?.pessoas === null || entrada?.pessoas === '') v.pessoas = null;
    else if (!Number.isInteger(Number(entrada.pessoas)) || Number(entrada.pessoas) < 1 || Number(entrada.pessoas) > 99) erros.pessoas = 'Informe o número de pessoas.';
    else v.pessoas = Number(entrada.pessoas);
  }

  for (const [campo, rotulo] of [['diaria_centavos', 'diária'], ['total_centavos', 'total'], ['sinal_centavos', 'sinal']]) {
    const x = entrada?.[campo];
    if (x === undefined || x === null || x === '') { v[campo] = campo === 'sinal_centavos' ? 0 : null; continue; }
    if (!Number.isInteger(x) || x < 0) erros[campo] = `Confira o valor da ${rotulo}.`;
    else v[campo] = x;
  }
  if (v.total_centavos != null && v.sinal_centavos > v.total_centavos) erros.sinal_centavos = 'O sinal não pode ser maior que o total.';

  v.notas = entrada?.notas ? String(entrada.notas).slice(0, 500) : null;
  v.pago = entrada?.pago ? 1 : 0;
  v.lead_id = Number.isInteger(entrada?.lead_id) ? entrada.lead_id : null;
  v.expira_em = v.estado === 'pre_reserva' && entrada?.expira_em ? String(entrada.expira_em) : null;
  return { ok: Object.keys(erros).length === 0, erros, valor: v };
}

/** Temporada que vale para uma noite: a mais especifica (menor intervalo; empate: a que comeca por ultimo). */
function temporadaDaNoite(noite, temporadas) {
  let melhor = null;
  for (const t of temporadas || []) {
    if (noite < t.de || noite >= t.ate) continue;
    if (!melhor) { melhor = t; continue; }
    const tam = noites(t.de, t.ate), tamMelhor = noites(melhor.de, melhor.ate);
    if (tam < tamMelhor || (tam === tamMelhor && t.de > melhor.de)) melhor = t;
  }
  return melhor;
}

/** Preco por noite e total. diariaBase em centavos; temporadas: [{ de, ate (exclusivo), diaria_centavos }]. */
export function calcularPreco({ entrada, saida, diariaBase, temporadas = [] }) {
  const porNoite = listarNoites(entrada, saida).map((noite) => {
    const t = temporadaDaNoite(noite, temporadas);
    return { noite, diaria_centavos: t ? t.diaria_centavos : diariaBase ?? 0, temporada: t ? t.nome : null };
  });
  return { noites: porNoite.length, total_centavos: porNoite.reduce((s, n) => s + n.diaria_centavos, 0), porNoite };
}

/** Estadia minima: vale a maior entre a da casa e a da temporada da noite de entrada. */
export function estadiaMinima({ entrada, minimoCasa = 1, temporadas = [] }) {
  const t = temporadaDaNoite(entrada, temporadas);
  return Math.max(minimoCasa || 1, t?.estadia_min || 1);
}

export function violaEstadiaMinima({ entrada, saida, minimoCasa, temporadas, estado }) {
  if (estado && estado !== 'alugado' && estado !== 'pre_reserva') return null; // bloqueios ignoram a regra
  const min = estadiaMinima({ entrada, minimoCasa, temporadas });
  const n = noites(entrada, saida);
  return n < min ? { minimo: min, noites: n } : null;
}

/**
 * SQL de insercao atomica: so insere se nao houver reserva ativa sobreposta. 0 linhas = conflito.
 * Os casts sao obrigatorios no banco: num INSERT ... SELECT os parametros nao herdam o tipo da coluna de destino.
 * Pre-reserva expirada nao bloqueia aqui; o gatilho do banco a marca como 'cancelado' ao gravar a nova reserva.
 * Se duas pessoas gravarem ao mesmo tempo, a restricao de exclusao do banco (23P01) barra a segunda: inserirReserva trata.
 */
export const SQL_INSERIR_RESERVA = `
INSERT INTO reserva (imovel_id, entrada, saida, estado, hospede_nome, hospede_fone, pessoas, origem, lead_id,
                     diaria_centavos, total_centavos, sinal_centavos, pago, notas, grupo_id, expira_em)
SELECT ?1::bigint, ?2::date, ?3::date, ?4::text, ?5::text, ?6::text, ?7::integer, ?8::text, ?9::bigint,
       ?10::bigint, ?11::bigint, ?12::bigint, ?13::smallint, ?14::text, ?15::text, ?16::timestamptz
WHERE ?4::text = 'cancelado' OR NOT EXISTS (
  SELECT 1 FROM reserva r
  WHERE r.imovel_id = ?1::bigint AND r.estado <> 'cancelado'
    AND NOT (r.estado = 'pre_reserva' AND r.expira_em IS NOT NULL AND r.expira_em < now())
    AND r.entrada < ?3::date AND ?2::date < r.saida)
RETURNING id`;

export const SQL_RESERVA_CONFLITANTE = `
SELECT id, entrada, saida, estado, hospede_nome FROM reserva r
WHERE r.imovel_id = ?1::bigint AND r.estado <> 'cancelado'
  AND NOT (r.estado = 'pre_reserva' AND r.expira_em IS NOT NULL AND r.expira_em < now())
  AND r.entrada < ?3::date AND ?2::date < r.saida
ORDER BY r.entrada LIMIT 1`;

/** Grava uma reserva ja validada. Retorna { ok: true, id } ou { ok: false, conflito }. */
export async function inserirReserva(db, imovelId, v, grupoId = null) {
  let linha;
  try {
    linha = await db.prepare(SQL_INSERIR_RESERVA).bind(
      imovelId, v.entrada, v.saida, v.estado, v.hospede_nome ?? null, v.hospede_fone ?? null, v.pessoas ?? null,
      v.origem ?? 'direto', v.lead_id ?? null, v.diaria_centavos ?? null, v.total_centavos ?? null, v.sinal_centavos ?? 0,
      v.pago ?? 0, v.notas ?? null, grupoId, v.expira_em ?? null,
    ).first();
  } catch (e) {
    if (!ehConflitoDeDatas(e)) throw e; // corrida: outra gravacao ocupou as datas entre a checagem e o INSERT
  }
  if (linha && linha.id) return { ok: true, id: linha.id };
  const conflito = await db.prepare(SQL_RESERVA_CONFLITANTE).bind(imovelId, v.entrada, v.saida).first();
  return { ok: false, conflito: conflito || null };
}

/** Mapa de ocupacao: noites ocupadas por mes (reservas ativas: alugado e pre_reserva; bloqueios contam a parte). */
export function resumoDoMes(reservas, ano, mes) {
  const r = { alugado: 0, pre_reserva: 0, bloqueio_dono: 0, manutencao: 0 };
  for (const x of reservas) {
    if (x.estado === 'cancelado') continue;
    r[x.estado] += noitesNoMes(x.entrada, x.saida, ano, mes);
  }
  return r;
}
