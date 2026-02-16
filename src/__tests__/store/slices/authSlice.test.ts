import { authSlice, loginSuccess, logout } from '../../../store/slices/authSlice';

describe('authSlice', () => {
  it('has initial state', () => {
    expect(authSlice.reducer(undefined, { type: 'unknown' })).toMatchObject({ isAuthenticated: false });
  });

  it('handles login and logout', () => {
    const loggedIn = authSlice.reducer(undefined, loginSuccess({ user: {
      id: '1', email: 'a@b.com', site_reference: 'S1', first_name: 'A', last_name: 'B', postcode: 'P', biometric_enabled: false,
      notification_preferences: { maintenance_reminders: true, performance_alerts: true, payment_notifications: true, system_updates: true, marketing_emails: false },
    }, token: { access: 'a', refresh: 'r', expires_at: 1 } }));
    expect(loggedIn.isAuthenticated).toBe(true);
    expect(authSlice.reducer(loggedIn, logout()).isAuthenticated).toBe(false);
  });
});
