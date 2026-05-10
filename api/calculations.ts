/**
 * GET  /api/calculations?company=Demo Çelik A.Ş.
 * POST /api/calculations          { ...calculation payload }
 * DELETE /api/calculations?id=uuid
 */
import { db } from './_db';
import { ok, err, preflight, parseBody, type VercelRequest, type VercelResponse } from './_helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return preflight(res);

  // ── GET ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const company = req.query.company as string | undefined;
    if (!company) return err(res, 'company query parametresi gerekli', 400);

    const { data, error } = await db
      .from('calculations')
      .select('*')
      .eq('company_name', company)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return err(res, error.message, 500);
    return ok(res, data);
  }

  // ── POST ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const payload = parseBody(req);

    const required = ['company_name', 'period', 'production_ton', 'total_embedded_tco2', 'cbam_cost_eur'];
    const missing  = required.filter(k => !(k in (payload as object)));
    if (missing.length) return err(res, `Eksik alanlar: ${missing.join(', ')}`, 400);

    const { data, error } = await db
      .from('calculations')
      .insert(payload)
      .select()
      .single();

    if (error) return err(res, error.message, 500);
    return ok(res, data, 201);
  }

  // ── DELETE ───────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const id = req.query.id as string | undefined;
    if (!id) return err(res, 'id query parametresi gerekli', 400);

    const { error } = await db.from('calculations').delete().eq('id', id);
    if (error) return err(res, error.message, 500);
    return ok(res, { deleted: id });
  }

  return err(res, 'Method Not Allowed', 405);
}
