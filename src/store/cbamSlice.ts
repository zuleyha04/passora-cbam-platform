import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  FuelInput, ElectricityInput, PrecursorInput, TransportInput,
  SupplierShare, SteelEmissionResult, Recommendation,
} from '../engine/cbam';
import {
  DEFAULT_FUELS, DEFAULT_ELECTRICITY, DEFAULT_PRECURSORS,
  DEFAULT_TRANSPORT, DEFAULT_SUPPLIERS, ETS_PRICE_EUR,
} from '../engine/cbam';

// ── State Interface ───────────────────────────────────────────
interface CbamState {
  company: { name: string; taxNo: string; city: string; sector: string };
  production: number;
  period: string;
  fuels: FuelInput[];
  electricity: ElectricityInput;
  precursors: PrecursorInput[];
  transport: TransportInput[];
  suppliers: SupplierShare[];
  etsPrice: number;
  result: SteelEmissionResult | null;
  recommendations: Recommendation[];
  isCalculated: boolean;
  lastSavedId: string | null;
}

const initialState: CbamState = {
  company: { name: 'Demo Çelik A.Ş.', taxNo: '1234567890', city: 'Karabük', sector: 'Demir-Çelik' },
  production: 1000,
  period: '2026-Q1',
  fuels: DEFAULT_FUELS,
  electricity: DEFAULT_ELECTRICITY,
  precursors: DEFAULT_PRECURSORS,
  transport: DEFAULT_TRANSPORT,
  suppliers: DEFAULT_SUPPLIERS,
  etsPrice: ETS_PRICE_EUR,
  result: null,
  recommendations: [],
  isCalculated: false,
  lastSavedId: null,
};

// ── Slice ─────────────────────────────────────────────────────
const cbamSlice = createSlice({
  name: 'cbam',
  initialState,
  reducers: {
    setCompany: (s, a: PayloadAction<Partial<CbamState['company']>>) => {
      s.company = { ...s.company, ...a.payload };
    },
    setProduction: (s, a: PayloadAction<number>) => { s.production = a.payload; },
    setPeriod:     (s, a: PayloadAction<string>) => { s.period = a.payload; },
    setEtsPrice:   (s, a: PayloadAction<number>) => { s.etsPrice = a.payload; },

    updateFuel: (s, a: PayloadAction<{ index: number; data: Partial<FuelInput> }>) => {
      s.fuels[a.payload.index] = { ...s.fuels[a.payload.index], ...a.payload.data };
    },
    addFuel: (s) => {
      s.fuels.push({ name: '', amount: 0, unit: 'Nm³', ncv: 0, ef: 0, oxidation: 1, biomassShare: 0 });
    },
    removeFuel: (s, a: PayloadAction<number>) => {
      s.fuels.splice(a.payload, 1);
    },

    setElectricity: (s, a: PayloadAction<Partial<ElectricityInput>>) => {
      s.electricity = { ...s.electricity, ...a.payload };
    },

    updatePrecursor: (s, a: PayloadAction<{ index: number; data: Partial<PrecursorInput> }>) => {
      s.precursors[a.payload.index] = { ...s.precursors[a.payload.index], ...a.payload.data };
    },
    addPrecursor: (s) => {
      s.precursors.push({ name: '', amountTon: 0, ef: 0 });
    },
    removePrecursor: (s, a: PayloadAction<number>) => {
      s.precursors.splice(a.payload, 1);
    },

    updateTransport: (s, a: PayloadAction<{ index: number; data: Partial<TransportInput> }>) => {
      s.transport[a.payload.index] = { ...s.transport[a.payload.index], ...a.payload.data };
    },

    updateSupplier: (s, a: PayloadAction<{ index: number; data: Partial<SupplierShare> }>) => {
      s.suppliers[a.payload.index] = { ...s.suppliers[a.payload.index], ...a.payload.data };
    },

    setResult: (s, a: PayloadAction<{ result: SteelEmissionResult; recommendations: Recommendation[] }>) => {
      s.result = a.payload.result;
      s.recommendations = a.payload.recommendations;
      s.isCalculated = true;
    },

    setLastSavedId: (s, a: PayloadAction<string>) => { s.lastSavedId = a.payload; },

    resetCalculation: (s) => {
      s.result = null;
      s.recommendations = [];
      s.isCalculated = false;
    },
  },
});

export const {
  setCompany, setProduction, setPeriod, setEtsPrice,
  updateFuel, addFuel, removeFuel,
  setElectricity,
  updatePrecursor, addPrecursor, removePrecursor,
  updateTransport, updateSupplier,
  setResult, setLastSavedId, resetCalculation,
} = cbamSlice.actions;

export default cbamSlice.reducer;
