/**
 * Netlify Functions — Response/Request helpers
 */
import type { HandlerResponse } from '@netlify/functions';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export function ok(data: unknown, status = 200): HandlerResponse {
  return { statusCode: status, headers: CORS, body: JSON.stringify({ ok: true, data }) };
}

export function err(message: string, status = 400): HandlerResponse {
  return { statusCode: status, headers: CORS, body: JSON.stringify({ ok: false, error: message }) };
}

export function preflight(): HandlerResponse {
  return { statusCode: 204, headers: CORS, body: '' };
}

export function parseBody<T = Record<string, unknown>>(body: string | null): T {
  try { return JSON.parse(body ?? '{}') as T; }
  catch { return {} as T; }
}
