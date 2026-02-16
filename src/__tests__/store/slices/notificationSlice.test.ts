import { notificationSlice, setNotifications } from '../../../store/slices/notificationSlice';

describe('notificationSlice', () => {
  it('counts unread notifications', () => {
    const state = notificationSlice.reducer(undefined, setNotifications([
      { id: '1', type: 'info', title: 't', body: 'b', read: false, created_at: '2026-01-01' },
      { id: '2', type: 'info', title: 't2', body: 'b2', read: true, created_at: '2026-01-01' },
    ]));
    expect(state.unreadCount).toBe(1);
  });
});
