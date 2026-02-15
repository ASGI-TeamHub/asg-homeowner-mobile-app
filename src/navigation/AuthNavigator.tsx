import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import LoginScreen from '../screens/Auth/LoginScreen';
import BiometricSetupScreen from '../screens/Auth/BiometricSetupScreen';
import SiteVerificationScreen from '../screens/Auth/SiteVerificationScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} options={{ title: 'Biometric Setup' }} />
      <Stack.Screen name="SiteVerification" component={SiteVerificationScreen} options={{ title: 'Verify Site' }} />
    </Stack.Navigator>
  );
}
