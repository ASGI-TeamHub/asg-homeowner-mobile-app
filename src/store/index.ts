import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { authSlice } from './slices/authSlice';
import { solarSlice } from './slices/solarSlice';
import { maintenanceSlice } from './slices/maintenanceSlice';
import { notificationSlice } from './slices/notificationSlice';
import { luxApi } from './api/luxApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    solar: solarSlice.reducer,
    maintenance: maintenanceSlice.reducer,
    notifications: notificationSlice.reducer,
    [luxApi.reducerPath]: luxApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(luxApi.middleware),
  devTools: __DEV__,
});

// Enable automatic re-fetching on focus/reconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for React components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;