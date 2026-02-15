import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MaintenanceBooking, MaintenanceState, ServiceHistory } from '../../types';

const initialState: MaintenanceState = {
  bookings: [],
  history: [],
  availableSlots: [],
  loading: false,
  error: null,
};

export const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setBookings: (state, action: PayloadAction<MaintenanceBooking[]>) => {
      state.bookings = action.payload;
    },
    addBooking: (state, action: PayloadAction<MaintenanceBooking>) => {
      state.bookings.push(action.payload);
    },
    updateBooking: (state, action: PayloadAction<MaintenanceBooking>) => {
      const index = state.bookings.findIndex((booking) => booking.id === action.payload.id);
      if (index >= 0) {
        state.bookings[index] = action.payload;
      }
    },
    removeBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter((booking) => booking.id !== action.payload);
    },
    setHistory: (state, action: PayloadAction<ServiceHistory[]>) => {
      state.history = action.payload;
    },
    setAvailableSlots: (state, action: PayloadAction<string[]>) => {
      state.availableSlots = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setBookings,
  addBooking,
  updateBooking,
  removeBooking,
  setHistory,
  setAvailableSlots,
} = maintenanceSlice.actions;
