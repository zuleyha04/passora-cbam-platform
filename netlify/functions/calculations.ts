/**
 * GET  /api/calculations?company=Demo Çelik A.Ş.
 * POST /api/calculations          { ...calculation payload }
 * DELETE /api/calculations?id=uuid
 */
import type { Handler } from '@netlify/functions';
import { db } from './_db';
import { ok, err, preflight, parseBody } from './_helpers';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  // ── GET ──────────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const company = event.queryStringParameters?.company;
    if (!company) return err('company query parametresi gerekli', 400);

    const { data, error } = await db
      .from('calculations')
      .select('*')
      .eq('company_name', company)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return err(error.message, 500);
    return ok(data);
  }

  // ── POST ─────────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    const payload = parseBody(event.body);

    // Basic validation
    const required = ['company_name', 'period', 'production_ton', 'total_embedded_tco2', 'cbam_cost_eur'];
    const missing  = required.filter(k => !(k in payload));
    if (missing.length) return err(`Eksik alanlar: ${missing.join(', ')}`, 400);

    const { data, error } = await db
      .from('calculations')
      .insert(payload)
      .select()
      .single();

    if (error) return err(error.message, 500);
    return ok(data, 201);
  }

  // ── DELETE ───────────────────────────────────────────────────
  if (event.httpMethod === 'DELETE') {
    const id = event.queryStringParameters?.id;
    if (!id) return err('id query parametresi gerekli', 400);

    const { error } = await db.from('calculations').delete().eq('id', id);
    if (error) return err(error.message, 500);
    return ok({ deleted: id });
  }

  return err('Method Not Allowed', 405);
};
