import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  FuelInput, ElectricityInput, PrecursorInput, TransportInput,
  SupplierShare, SteelEmissionResult, SimulationResult, Recommendation,
} from '../engine/cbam';
import {
  DEFAULT_FUELS, DEFAULT_ELECTRICITY, DEFAULT_PRECURSORS,
  DEFAULT_TRANSPORT, DEFAULT_SUPPLIERS,
  calculateSteelEmissions, simulateSupplierMix, generateRecommendations,
  ETS_PRICE_EUR,
} from '../engine/cbam';

// ── State ─────────────────────────────────────────────────────────────────────
interface AppState {
  company: { name: string; taxNo: string; city: string; sector: string };
  production: number;       // ton
  period: string;           // e.g. "2026-Q1"
  fuels: FuelInput[];
  electricity: ElectricityInput;
  precursors: PrecursorInput[];
  transport: TransportInput[];
  suppliers: SupplierShare[];
  etsPrice: number;
  result: SteelEmissionResult | null;
  simulationResult: SimulationResult | null;
  recommendations: Recommendation[];
  currentStep: number;
  activeTab: 'dashboard' | 'calculator' | 'simulation' | 'recommendations' | 'reports';
  isCalculated: boolean;
}

const initialState: AppState = {
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
  simulationResult: null,
  recommendations: [],
  currentStep: 0,
  activeTab: 'dashboard',
  isCalculated: false,
};

// ── Actions ───────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_COMPANY'; payload: Partial<AppState['company']> }
  | { type: 'SET_PRODUCTION'; payload: number }
  | { type: 'SET_PERIOD'; payload: string }
  | { type: 'UPDATE_FUEL'; index: number; payload: Partial<FuelInput> }
  | { type: 'ADD_FUEL' }
  | { type: 'REMOVE_FUEL'; index: number }
  | { type: 'SET_ELECTRICITY'; payload: Partial<ElectricityInput> }
  | { type: 'UPDATE_PRECURSOR'; index: number; payload: Partial<PrecursorInput> }
  | { type: 'ADD_PRECURSOR' }
  | { type: 'REMOVE_PRECURSOR'; index: number }
  | { type: 'UPDATE_TRANSPORT'; index: number; payload: Partial<TransportInput> }
  | { type: 'UPDATE_SUPPLIER'; index: number; payload: Partial<SupplierShare> }
  | { type: 'SET_ETS_PRICE'; payload: number }
  | { type: 'CALCULATE' }
  | { type: 'RUN_SIMULATION' }
  | { type: 'SET_TAB'; payload: AppState['activeTab'] }
  | { type: 'SET_STEP'; payload: number };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_COMPANY':
      return { ...state, company: { ...state.company, ...action.payload } };
    case 'SET_PRODUCTION':
      return { ...state, production: action.payload };
    case 'SET_PERIOD':
      return { ...state, period: action.payload };
    case 'UPDATE_FUEL': {
      const fuels = [...state.fuels];
      fuels[action.index] = { ...fuels[action.index], ...action.payload };
      return { ...state, fuels };
    }
    case 'ADD_FUEL':
      return { ...state, fuels: [...state.fuels, { name: '', amount: 0, unit: 'Nm³', ncv: 0, ef: 0, oxidation: 1, biomassShare: 0 }] };
    case 'REMOVE_FUEL':
      return { ...state, fuels: state.fuels.filter((_, i) => i !== action.index) };
    case 'SET_ELECTRICITY':
      return { ...state, electricity: { ...state.electricity, ...action.payload } };
    case 'UPDATE_PRECURSOR': {
      const precursors = [...state.precursors];
      precursors[action.index] = { ...precursors[action.index], ...action.payload };
      return { ...state, precursors };
    }
    case 'ADD_PRECURSOR':
      return { ...state, precursors: [...state.precursors, { name: '', amountTon: 0, ef: 0 }] };
    case 'REMOVE_PRECURSOR':
      return { ...state, precursors: state.precursors.filter((_, i) => i !== action.index) };
    case 'UPDATE_TRANSPORT': {
      const transport = [...state.transport];
      transport[action.index] = { ...transport[action.index], ...action.payload };
      return { ...state, transport };
    }
    case 'UPDATE_SUPPLIER': {
      const suppliers = [...state.suppliers];
      suppliers[action.index] = { ...suppliers[action.index], ...action.payload };
      return { ...state, suppliers };
    }
    case 'SET_ETS_PRICE':
      return { ...state, etsPrice: action.payload };
    case 'CALCULATE': {
      try {
        const result = calculateSteelEmissions(
          state.production, state.fuels, state.electricity,
          state.precursors, state.transport, state.etsPrice,
        );
        const recommendations = generateRecommendations(result, state.production, state.suppliers);
        return { ...state, result, recommendations, isCalculated: true };
      } catch { return state; }
    }
    case 'RUN_SIMULATION': {
      try {
        const simulationResult = simulateSupplierMix(state.suppliers, state.production, state.etsPrice);
        return { ...state, simulationResult };
      } catch { return state; }
    }
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
