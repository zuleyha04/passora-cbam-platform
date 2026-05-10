/**
 * Vercel API Routes — Response/Request helpers
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function ok(res: VercelResponse, data: unknown, status = 200): void {
  res.setHeader('Content-Type', 'application/json');
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.status(status).json({ ok: true, data });
}

export function err(res: VercelResponse, message: string, status = 400): void {
  res.setHeader('Content-Type', 'application/json');
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.status(status).json({ ok: false, error: message });
}

export function preflight(res: VercelResponse): void {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.status(204).end();
}

export function parseBody<T = Record<string, unknown>>(req: VercelRequest): T {
  try {
    if (typeof req.body === 'string') return JSON.parse(req.body) as T;
    return (req.body ?? {}) as T;
  } catch {
    return {} as T;
  }
}

export type { VercelRequest, VercelResponse };
