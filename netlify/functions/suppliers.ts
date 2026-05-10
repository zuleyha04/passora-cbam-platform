/**
 * GET  /api/suppliers?company=Demo Çelik A.Ş.
 * POST /api/suppliers   { company_name, suppliers: [...] }  (upsert toplu)
 */
import type { Handler } from '@netlify/functions';
import { db } from './_db';
import { ok, err, preflight, parseBody } from './_helpers';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  if (event.httpMethod === 'GET') {
    const company = event.queryStringParameters?.company;
    if (!company) return err('company parametresi gerekli', 400);

    const { data, error } = await db
      .from('suppliers')
      .select('*')
      .eq('company_name', company);

    if (error) return err(error.message, 500);
    return ok(data);
  }

  if (event.httpMethod === 'POST') {
    const { suppliers } = parseBody<{ suppliers: unknown[] }>(event.body);
    if (!suppliers || !Array.isArray(suppliers)) return err('suppliers[] gerekli', 400);

    const { data, error } = await db.from('suppliers').upsert(suppliers).select();
    if (error) return err(error.message, 500);
    return ok(data, 201);
  }

  return err('Method Not Allowed', 405);
};
