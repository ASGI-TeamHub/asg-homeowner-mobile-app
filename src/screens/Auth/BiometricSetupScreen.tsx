import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Text } from 'react-native-elements';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useSetupBiometricsMutation } from '../../store/api/luxApi';
import { AuthStackParamList } from '../../types';

export default function BiometricSetupScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'BiometricSetup'>) {
  const [setup] = useSetupBiometricsMutation();

  const enable = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const result = await rnBiometrics.createKeys();
      await setup({ device_id: 'mobile-device', biometric_key: result.publicKey }).unwrap();
      navigation.replace('SiteVerification');
    } catch {
      Alert.alert('Biometrics unavailable', 'You can enable biometrics later from settings.');
      navigation.replace('SiteVerification');
    }
  };

  return (
    <View style={styles.container}>
      <Text h4>Enable Face ID / Fingerprint?</Text>
      <Text style={styles.text}>Use biometrics for faster secure sign in.</Text>
      <Button title="Enable" onPress={enable} accessibilityLabel="Enable biometrics" />
      <Button title="Skip" type="clear" onPress={() => navigation.replace('SiteVerification')} accessibilityLabel="Skip biometrics" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, gap: 12 },
  text: { color: '#444' },
});
