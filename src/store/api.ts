/**
 * RTK Query API — Netlify Functions backend'ine bağlanır
 * Client asla Supabase key'i görmez, her istek /api/* üzerinden gider
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { DbCalculation } from '../lib/supabase';

// Dev'de localhost:8888 (netlify dev), prod'da aynı domain
const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8888/api'
  : '/api';

export const passoraApi = createApi({
  reducerPath: 'passoraApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Calculation', 'Supplier', 'EmissionFactor'],

  endpoints: (builder) => ({

    // ── POST /api/calculate ───────────────────────────────────
    serverCalculate: builder.mutation<
      { ok: boolean; data: Record<string, number | string | boolean | null> },
      {
        production: number;
        fuels: unknown[];
        electricity: unknown;
        precursors: unknown[];
        transport: unknown[];
        etsPrice: number;
        company: { name: string; taxNo: string; city: string; sector: string };
        period: string;
        saveToDb?: boolean;
      }
    >({
      queryFn: async (arg, _api, _extra, baseQuery) => {
        const result = await baseQuery({ url: 'calculate', method: 'POST', body: arg });
        if (result.error) return { error: result.error };
        return { data: result.data as { ok: boolean; data: Record<string, number | string | boolean | null> } };
      },
      invalidatesTags: (_, __, arg) => arg.saveToDb ? ['Calculation'] : [],
    }),

    // ── GET /api/calculations?company=X ──────────────────────
    getCalculations: builder.query<DbCalculation[], string>({
      query: (company) => `calculations?company=${encodeURIComponent(company)}`,
      transformResponse: (res: { ok: boolean; data: DbCalculation[] }) => res.data ?? [],
      providesTags: ['Calculation'],
    }),

    // ── POST /api/calculations ────────────────────────────────
    saveCalculation: builder.mutation<DbCalculation, Omit<DbCalculation, 'id' | 'created_at'>>({
      query: (body) => ({ url: 'calculations', method: 'POST', body }),
      transformResponse: (res: { ok: boolean; data: DbCalculation }) => res.data,
      invalidatesTags: ['Calculation'],
    }),

    // ── DELETE /api/calculations?id=X ────────────────────────
    deleteCalculation: builder.mutation<void, string>({
      query: (id) => ({ url: `calculations?id=${id}`, method: 'DELETE' }),
      invalidatesTags: ['Calculation'],
    }),

    // ── GET /api/suppliers?company=X ─────────────────────────
    getSuppliers: builder.query<unknown[], string>({
      query: (company) => `suppliers?company=${encodeURIComponent(company)}`,
      transformResponse: (res: { ok: boolean; data: unknown[] }) => res.data ?? [],
      providesTags: ['Supplier'],
    }),

    // ── POST /api/suppliers ───────────────────────────────────
    upsertSuppliers: builder.mutation<void, { company_name: string; suppliers: unknown[] }>({
      query: (body) => ({ url: 'suppliers', method: 'POST', body }),
      invalidatesTags: ['Supplier'],
    }),

    // ── GET /api/emission-factors ─────────────────────────────
    getEmissionFactors: builder.query<unknown[], { type?: string; source?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.type)   q.set('type', params.type);
        if (params?.source) q.set('source', params.source);
        return `emission-factors${q.toString() ? '?' + q.toString() : ''}`;
      },
      transformResponse: (res: { ok: boolean; data: unknown[] }) => res.data ?? [],
      providesTags: ['EmissionFactor'],
    }),

  }),
});

export const {
  useServerCalculateMutation,
  useGetCalculationsQuery,
  useSaveCalculationMutation,
  useDeleteCalculationMutation,
  useGetSuppliersQuery,
  useUpsertSuppliersMutation,
  useGetEmissionFactorsQuery,
} = passoraApi;
