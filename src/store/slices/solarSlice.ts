import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SolarSite, GenerationHistory, FITPayment, PerformanceAlert, SolarState } from '../../types';

const initialState: SolarState = {
  currentSite: null,
  generationHistory: [],
  fitPayments: [],
  performanceAlerts: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

export const solarSlice = createSlice({
  name: 'solar',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setSiteData: (state, action: PayloadAction<SolarSite>) => {
      state.currentSite = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateLiveGeneration: (state, action: PayloadAction<{ current_kw: number; today_kwh: number }>) => {
      if (state.currentSite) {
        state.currentSite.current_generation_kw = action.payload.current_kw;
        state.currentSite.today_generation_kwh = action.payload.today_kwh;
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    setGenerationHistory: (state, action: PayloadAction<GenerationHistory[]>) => {
      state.generationHistory = action.payload;
    },
    
    addGenerationData: (state, action: PayloadAction<GenerationHistory>) => {
      const existingIndex = state.generationHistory.findIndex(
        (item) => item.date === action.payload.date
      );
      
      if (existingIndex >= 0) {
        state.generationHistory[existingIndex] = action.payload;
      } else {
        state.generationHistory.push(action.payload);
        // Keep only last 365 days
        state.generationHistory = state.generationHistory
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 365);
      }
    },
    
    setFITPayments: (state, action: PayloadAction<FITPayment[]>) => {
      state.fitPayments = action.payload;
    },
    
    addFITPayment: (state, action: PayloadAction<FITPayment>) => {
      const existingIndex = state.fitPayments.findIndex(
        (payment) => payment.id === action.payload.id
      );
      
      if (existingIndex >= 0) {
        state.fitPayments[existingIndex] = action.payload;
      } else {
        state.fitPayments.unshift(action.payload);
      }
    },
    
    setPerformanceAlerts: (state, action: PayloadAction<PerformanceAlert[]>) => {
      state.performanceAlerts = action.payload;
    },
    
    resolveAlert: (state, action: PayloadAction<string>) => {
      const alertIndex = state.performanceAlerts.findIndex(
        (alert) => alert.id === action.payload
      );
      
      if (alertIndex >= 0) {
        state.performanceAlerts[alertIndex].resolved_at = new Date().toISOString();
      }
    },
    
    removeAlert: (state, action: PayloadAction<string>) => {
      state.performanceAlerts = state.performanceAlerts.filter(
        (alert) => alert.id !== action.payload
      );
    },
    
    updateSystemHealth: (state, action: PayloadAction<'good' | 'warning' | 'error' | 'offline'>) => {
      if (state.currentSite) {
        state.currentSite.system_health = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setSiteData,
  updateLiveGeneration,
  setGenerationHistory,
  addGenerationData,
  setFITPayments,
  addFITPayment,
  setPerformanceAlerts,
  resolveAlert,
  removeAlert,
  updateSystemHealth,
} = solarSlice.actions;