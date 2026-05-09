/**
 * GET /api/emission-factors
 * Opsiyonel: ?type=steel_bof  veya  ?source=DEFRA
 * Güncel emisyon faktörlerini döndürür — DEFRA/IPCC/TEIAS kaynaklı
 */
import type { Handler } from '@netlify/functions';
import { db } from './_db';
import { ok, err, preflight } from './_helpers';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return err('Method Not Allowed', 405);

  const { type, source } = event.queryStringParameters ?? {};

  let query = db.from('emission_factors').select('*').eq('is_default', true);
  if (type)   query = query.eq('material_type', type);
  if (source) query = query.ilike('source', `%${source}%`);
  query = query.order('valid_from', { ascending: false });

  const { data, error } = await query;
  if (error) return err(error.message, 500);
  return ok(data);
};
