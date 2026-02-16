import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification, NotificationPreferences, NotificationState } from '../../types';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  pushToken: null,
  preferences: {
    maintenance_reminders: true,
    performance_alerts: true,
    payment_notifications: true,
    system_updates: true,
    marketing_emails: false,
  },
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<AppNotification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((notification) => !notification.read).length;
    },
    markRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((item) => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    setPushToken: (state, action: PayloadAction<string | null>) => {
      state.pushToken = action.payload;
    },
    setPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.preferences = action.payload;
    },
  },
});

export const { setNotifications, markRead, setPushToken, setPreferences } = notificationSlice.actions;
