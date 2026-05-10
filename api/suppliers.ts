/**
 * GET  /api/suppliers?company=Demo Çelik A.Ş.
 * POST /api/suppliers   { company_name, suppliers: [...] }  (upsert toplu)
 */
import { db } from './_db';
import { ok, err, preflight, parseBody, type VercelRequest, type VercelResponse } from './_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return preflight(res);

  if (req.method === 'GET') {
    const company = req.query.company as string | undefined;
    if (!company) return err(res, 'company parametresi gerekli', 400);

    const { data, error } = await db
      .from('suppliers')
      .select('*')
      .eq('company_name', company);

    if (error) return err(res, error.message, 500);
    return ok(res, data);
  }

  if (req.method === 'POST') {
    const { suppliers } = parseBody<{ suppliers: unknown[] }>(req);
    if (!suppliers || !Array.isArray(suppliers)) return err(res, 'suppliers[] gerekli', 400);

    const { data, error } = await db.from('suppliers').upsert(suppliers).select();
    if (error) return err(res, error.message, 500);
    return ok(res, data, 201);
  }

  return err(res, 'Method Not Allowed', 405);
}
