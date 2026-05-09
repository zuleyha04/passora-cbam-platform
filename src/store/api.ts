// ============================================================
// RTK Query API — Supabase REST endpoints
// ============================================================
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase, type DbCalculation, type DbSupplier, type DbEmissionFactor } from '../lib/supabase';

export const passoraApi = createApi({
  reducerPath: 'passoraApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Calculation', 'Supplier', 'EmissionFactor'],

  endpoints: (builder) => ({

    // ── Calculations ──────────────────────────────────────────
    getCalculations: builder.query<DbCalculation[], string>({
      queryFn: async (companyName) => {
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('company_name', companyName)
          .order('created_at', { ascending: false });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: data ?? [] };
      },
      providesTags: ['Calculation'],
    }),

    saveCalculation: builder.mutation<DbCalculation, Omit<DbCalculation, 'id' | 'created_at'>>({
      queryFn: async (payload) => {
        const { data, error } = await supabase
          .from('calculations')
          .insert(payload)
          .select()
          .single();
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data };
      },
      invalidatesTags: ['Calculation'],
    }),

    deleteCalculation: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from('calculations').delete().eq('id', id);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: undefined };
      },
      invalidatesTags: ['Calculation'],
    }),

    // ── Suppliers ─────────────────────────────────────────────
    getSuppliers: builder.query<DbSupplier[], string>({
      queryFn: async (companyName) => {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('company_name', companyName);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: data ?? [] };
      },
      providesTags: ['Supplier'],
    }),

    upsertSuppliers: builder.mutation<void, DbSupplier[]>({
      queryFn: async (suppliers) => {
        const { error } = await supabase.from('suppliers').upsert(suppliers);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: undefined };
      },
      invalidatesTags: ['Supplier'],
    }),

    // ── Emission Factors ──────────────────────────────────────
    getEmissionFactors: builder.query<DbEmissionFactor[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('emission_factors')
          .select('*')
          .eq('is_default', true)
          .order('valid_from', { ascending: false });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: data ?? [] };
      },
      providesTags: ['EmissionFactor'],
    }),

  }),
});

export const {
  useGetCalculationsQuery,
  useSaveCalculationMutation,
  useDeleteCalculationMutation,
  useGetSuppliersQuery,
  useUpsertSuppliersMutation,
  useGetEmissionFactorsQuery,
} = passoraApi;
