/**
 * GET /api/emission-factors
 * Opsiyonel: ?type=steel_bof  veya  ?source=DEFRA
 * Güncel emisyon faktörlerini döndürür — DEFRA/IPCC/TEIAS kaynaklı
 */
import { db } from './_db';
import { ok, err, preflight, type VercelRequest, type VercelResponse } from './_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return preflight(res);
  if (req.method !== 'GET') return err(res, 'Method Not Allowed', 405);

  const type   = req.query.type   as string | undefined;
  const source = req.query.source as string | undefined;

  let query = db.from('emission_factors').select('*').eq('is_default', true);
  if (type)   query = query.eq('material_type', type);
  if (source) query = query.ilike('source', `%${source}%`);
  query = query.order('valid_from', { ascending: false });

  const { data, error } = await query;
  if (error) return err(res, error.message, 500);
  return ok(res, data);
}
