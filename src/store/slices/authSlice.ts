import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthToken, AuthState } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  biometricEnabled: false,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    loginSuccess: (state, action: PayloadAction<{ user: User; token: AuthToken }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.biometricEnabled = action.payload.user.biometric_enabled;
      state.loading = false;
      state.error = null;
    },
    
    refreshTokenSuccess: (state, action: PayloadAction<AuthToken>) => {
      state.token = action.payload;
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.biometricEnabled = false;
      state.error = null;
    },
    
    enableBiometric: (state) => {
      state.biometricEnabled = true;
      if (state.user) {
        state.user.biometric_enabled = true;
      }
    },
    
    disableBiometric: (state) => {
      state.biometricEnabled = false;
      if (state.user) {
        state.user.biometric_enabled = false;
      }
    },
    
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  refreshTokenSuccess,
  logout,
  enableBiometric,
  disableBiometric,
  updateUserProfile,
} = authSlice.actions;