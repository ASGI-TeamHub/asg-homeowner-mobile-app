import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import AppCard from '../../components/AppCard';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useGetUserProfileQuery, useUpdateNotificationPreferencesMutation, useUpdateUserProfileMutation } from '../../store/api/luxApi';
import { clearTokens } from '../../services/auth/tokenStorage';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const profileQuery = useGetUserProfileQuery();
  const [updateUser] = useUpdateUserProfileMutation();
  const [updatePrefs] = useUpdateNotificationPreferencesMutation();

  const user = profileQuery.data?.data;
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [marketing, setMarketing] = useState(user?.notification_preferences.marketing_emails || false);

  const save = async () => {
    try {
      await updateUser({ first_name: firstName, last_name: lastName }).unwrap();
      if (user) {
        await updatePrefs({ ...user.notification_preferences, marketing_emails: marketing }).unwrap();
      }
      Alert.alert('Saved', 'Settings updated.');
    } catch {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const signOut = async () => {
    await clearTokens();
    dispatch(logout());
  };

  return (
    <ScrollView style={styles.container}>
      <AppCard>
        <Text style={styles.cardTitle}>Profile</Text>
        <Input label="First Name" value={firstName} onChangeText={setFirstName} accessibilityLabel="First name" />
        <Input label="Last Name" value={lastName} onChangeText={setLastName} accessibilityLabel="Last name" />
        <Input label="Email" value={user?.email || ''} disabled accessibilityLabel="Email" />
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Notifications</Text>
        <View style={styles.switchRow}>
          <Text>Marketing emails</Text>
          <Switch value={marketing} onValueChange={setMarketing} accessibilityLabel="Marketing emails toggle" />
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>Support</Text>
        <Text>{(Constants.expoConfig?.extra?.supportPhone as string | undefined) || 'Support unavailable'}</Text>
        <Text>Version: {Constants.expoConfig?.version || '1.0.0'}</Text>
      </AppCard>

      <Button title="Save" onPress={save} containerStyle={styles.button} accessibilityLabel="Save settings" />
      <Button title="Logout" type="outline" onPress={() => void signOut()} containerStyle={styles.button} accessibilityLabel="Logout" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#003d82', marginBottom: 10 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  button: { marginHorizontal: 15, marginBottom: 10 },
});
