import React, { createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useAppSelector } from '../../store';
import { useRegisterPushTokenMutation } from '../../store/api/luxApi';

const NotificationContext = createContext({ ready: false });

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [registerPushToken] = useRegisterPushTokenMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const setup = async () => {
      try {
        await messaging().requestPermission();
        const token = await messaging().getToken();
        if (token) {
          await registerPushToken({
            device_id: 'mobile-device',
            push_token: token,
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
          }).unwrap();
        }
      } catch {
        // Non-blocking notification setup
      }
    };

    void setup();

    const unsubscribe = messaging().onMessage(async () => {
      // Foreground notification handling can be implemented here.
    });

    return unsubscribe;
  }, [isAuthenticated, registerPushToken]);

  return <NotificationContext.Provider value={{ ready: true }}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);
