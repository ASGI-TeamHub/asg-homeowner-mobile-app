import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginSuccess, logout, setLoading } from '../../store/slices/authSlice';
import { useRefreshTokenMutation } from '../../store/api/luxApi';
import { AuthToken, User } from '../../types';
import { clearTokens, getTokens, storeTokens } from './tokenStorage';
import LoadingScreen from '../../components/LoadingScreen';

interface AuthContextValue {
  login: (user: User, token: AuthToken) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const { token, user, loading } = useAppSelector((state) => state.auth);

  const refreshSession = async (): Promise<void> => {
    const existingTokens = await getTokens();
    if (!existingTokens || !user) {
      return;
    }

    const response = await refreshTokenMutation(existingTokens.refresh).unwrap();
    const refreshed = response.data;
    await storeTokens(refreshed);
    dispatch(loginSuccess({ user, token: refreshed }));
  };

  useEffect(() => {
    const bootstrap = async () => {
      dispatch(setLoading(true));
      try {
        const tokens = await getTokens();
        if (!tokens) {
          dispatch(setLoading(false));
          return;
        }

        try {
          const refreshed = await refreshTokenMutation(tokens.refresh).unwrap();
          await storeTokens(refreshed.data);
          dispatch(loginSuccess({
            user: {
              id: '',
              email: '',
              site_reference: '',
              first_name: 'Homeowner',
              last_name: '',
              postcode: '',
              biometric_enabled: false,
              notification_preferences: {
                maintenance_reminders: true,
                performance_alerts: true,
                payment_notifications: true,
                system_updates: true,
                marketing_emails: false,
              },
            },
            token: refreshed.data,
          }));
        } catch {
          await clearTokens();
          dispatch(logout());
          dispatch(setLoading(false));
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    void bootstrap();
  }, [dispatch, refreshTokenMutation]);

  const contextValue = useMemo<AuthContextValue>(() => ({
    login: async (nextUser: User, nextToken: AuthToken) => {
      await storeTokens(nextToken);
      dispatch(loginSuccess({ user: nextUser, token: nextToken }));
    },
    logout: async () => {
      await clearTokens();
      dispatch(logout());
    },
    refreshSession,
  }), [dispatch, refreshSession]);

  if (loading && !token) {
    return <LoadingScreen message="Checking your saved session..." />;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
