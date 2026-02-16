import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { useLoginMutation } from '../../store/api/luxApi';
import { useAuth } from '../../services/auth/AuthProvider';

export default function LoginScreen() {
  const [siteReference, setSiteReference] = useState('');
  const [postcode, setPostcode] = useState('');
  const [meterSerial, setMeterSerial] = useState('');
  const [loginMutation, { isLoading }] = useLoginMutation();
  const { login } = useAuth();

  const onSubmit = async () => {
    try {
      const response = await loginMutation({
        site_reference: siteReference.trim(),
        postcode: postcode.trim(),
        meter_serial: meterSerial.trim() || undefined,
      }).unwrap();
      await login(response.data.user, response.data.token);
    } catch (error: unknown) {
      const message = typeof error === 'object' && error && 'data' in error
        ? 'Login failed. Check your details and try again.'
        : 'Unexpected error during login.';
      Alert.alert('Unable to login', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>ASG Solar</Text>
      <Input placeholder="Site reference" value={siteReference} onChangeText={setSiteReference} autoCapitalize="characters" accessibilityLabel="Site reference" />
      <Input placeholder="Postcode" value={postcode} onChangeText={setPostcode} autoCapitalize="characters" accessibilityLabel="Postcode" />
      <Input placeholder="Meter serial (optional)" value={meterSerial} onChangeText={setMeterSerial} accessibilityLabel="Meter serial" />
      <Button title="Login" onPress={onSubmit} loading={isLoading} accessibilityRole="button" accessibilityLabel="Login" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { textAlign: 'center', color: '#003d82', marginBottom: 20 },
});
