// Copia sem alteracao de logica (sandbox do portfolio): codigo puro do servidor, roda no navegador.
// Agenda geral da temporada: para um periodo, uma linha por casa com as reservas (recortadas no periodo), os periodos livres
// e quantas casas estao livres em cada noite. Base da tela "Agenda geral", da planilha e do CSV.
// Puro (montarAgenda) + uma consulta parametrizada de leitura (carregarAgenda). Reserva = [entrada, saida): o dia da saida fica livre.
// Convencao do periodo: `de` e `ate` sao DIAS (ambos inclusivos). Cada dia representa a NOITE que comeca nele, entao um periodo
// de 01/01 a 31/01 tem 31 noites (a de 31/01 termina em 01/02). Cancelada nunca entra.
import { ehDataIso, adicionarDias, noites } from './datas.js';
import { feriadoDe } from './feriados.js';

export const MAX_DIAS = 366;
export const MAX_CASAS = 200;
export const TIPOS_AGENDA = ['alugado', 'pre_reserva', 'bloqueio_dono', 'manutencao'];

/** Valida o periodo. Devolve { ok: true, de, ate, dias } ou { ok: false, erro }. */
export function validarPeriodo(de, ate) {
  if (!ehDataIso(de) || !ehDataIso(ate)) return { ok: false, erro: 'periodo_invalido' };
  if (ate < de) return { ok: false, erro: 'periodo_invalido' };
  const dias = noites(de, ate) + 1;
  if (dias > MAX_DIAS) return { ok: false, erro: 'periodo_longo_demais' };
  return { ok: true, de, ate, dias };
}

/** 0 = domingo ... 6 = sabado. */
export function diaDaSemana(iso) {
  return new Date(iso + 'T00:00:00Z').getUTCDay();
}

/**
 * casas: [{ id, codigo, titulo, bairro, cidade }]; reservas: [{ id, imovel_id, entrada, saida, estado, origem, hospede_nome }] (sem canceladas).
 * agora: Date (so para `gerado_em`). Devolve o objeto da API (ver DESIGN / descricao do PR).
 */
export function montarAgenda({ de, ate, casas, reservas, agora = new Date(), truncado = false }) {
  const n = noites(de, ate) + 1;
  const ateEx = adicionarDias(ate, 1);
  const dias = [];
  for (let i = 0; i < n; i++) {
    const data = adicionarDias(de, i);
    const dow = diaDaSemana(data);
    dias.push({ data, dow, fim_de_semana: dow === 0 || dow === 6, feriado: feriadoDe(data) });
  }
  const porCasa = new Map(casas.map((c) => [c.id, []]));
  for (const r of reservas) if (porCasa.has(r.imovel_id) && TIPOS_AGENDA.includes(r.estado)) porCasa.get(r.imovel_id).push(r);

  const livresPorDia = new Array(n).fill(0);
  let noitesLivres = 0, noitesOcupadas = 0;
  const saidaCasas = casas.map((c) => {
    const conta = new Uint8Array(n);
    const lista = porCasa.get(c.id).sort((a, b) => (a.entrada < b.entrada ? -1 : a.entrada > b.entrada ? 1 : Number(a.id) - Number(b.id)));
    const itens = [];
    for (const r of lista) {
      const a = r.entrada > de ? r.entrada : de, b = r.saida < ateEx ? r.saida : ateEx;
      if (b <= a) continue; // nao toca o periodo
      for (let i = noites(de, a), fim = noites(de, b); i < fim; i++) conta[i] = Math.min(conta[i] + 1, 250);
      itens.push({
        id: Number(r.id), entrada: r.entrada, saida: r.saida, estado: r.estado, tipo: r.estado, origem: r.origem,
        hospede: r.hospede_nome || null, noites: noites(r.entrada, r.saida),
        noites_no_periodo: noites(a, b), continua_antes: r.entrada < de, continua_depois: r.saida > ateEx,
      });
    }
    const livres = [], conflitos = [];
    for (let i = 0; i < n; i++) {
      if (conta[i] > 1) conflitos.push(dias[i].data);
      if (conta[i] === 0) { livresPorDia[i]++; noitesLivres++; } else noitesOcupadas++;
    }
    for (let i = 0; i < n;) {
      if (conta[i] !== 0) { i++; continue; }
      let j = i;
      while (j < n && conta[j] === 0) j++;
      livres.push({ de: dias[i].data, ate: adicionarDias(dias[j - 1].data, 1), noites: j - i });
      i = j;
    }
    return { id: Number(c.id), codigo: c.codigo, titulo: c.titulo, unidade: 'Casa inteira', bairro: c.bairro ?? null, cidade: c.cidade ?? null, reservas: itens, livres, conflitos };
  });
  const total = casas.length * n;
  return {
    de, ate, gerado_em: agora.toISOString(), dias, casas: saidaCasas, livres_por_dia: livresPorDia,
    resumo: { casas: casas.length, noites_livres: noitesLivres, noites_ocupadas: noitesOcupadas, ocupacao_percentual: total ? Math.round((noitesOcupadas / total) * 1000) / 10 : 0, ...(truncado ? { truncado: true } : {}) },
  };
}

/**
 * Le casas de temporada ativas (ate MAX_CASAS, por codigo) e as reservas nao canceladas que tocam o periodo; so leitura, tudo parametrizado.
 * casaId: opcional. Devolve { agenda, reservasDetalhe } ou null se a casa pedida nao existe/nao e de temporada.
 * reservasDetalhe traz as linhas cruas (com valores) para a planilha; a API JSON nao as expoe.
 */
export async function carregarAgenda(db, { de, ate, casaId = null, agora = new Date() }) {
  const filtro = casaId != null ? 'AND id = ?1' : '';
  const casasTodas = (await db.prepare(`SELECT id, codigo, titulo, bairro, cidade FROM imoveis WHERE tipo_negocio = 'temporada' AND deleted_at IS NULL ${filtro} ORDER BY codigo, id LIMIT ${MAX_CASAS + 1}`)
    .bind(...(casaId != null ? [casaId] : [])).all()).results;
  if (casaId != null && !casasTodas.length) return null;
  const truncado = casasTodas.length > MAX_CASAS;
  const casas = casasTodas.slice(0, MAX_CASAS);
  const ateEx = adicionarDias(ate, 1);
  const reservas = casas.length
    ? (await db.prepare(`SELECT id, imovel_id, entrada, saida, estado, origem, hospede_nome, total_centavos, sinal_centavos, pago FROM reserva
        WHERE estado <> 'cancelado' AND entrada < ?1 AND saida > ?2 AND imovel_id IN (${casas.map((_, i) => '?' + (i + 3)).join(', ')}) ORDER BY entrada, id`)
      .bind(ateEx, de, ...casas.map((c) => c.id)).all()).results
    : [];
  return { agenda: montarAgenda({ de, ate, casas, reservas, agora, truncado }), reservas, casas };
}
