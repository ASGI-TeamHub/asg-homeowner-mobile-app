import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-elements';
import AppCard from './AppCard';

interface Props { onBookService: () => void; onViewPayments: () => void; onContactSupport: () => void; }

export default function QuickActions({ onBookService, onViewPayments, onContactSupport }: Props) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.row}>
        <Button title="Book" onPress={onBookService} buttonStyle={styles.btn} accessibilityLabel="Book service" />
        <Button title="Payments" onPress={onViewPayments} buttonStyle={styles.btn} accessibilityLabel="View payments" />
        <Button title="Support" onPress={onContactSupport} buttonStyle={styles.btn} accessibilityLabel="Contact support" />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({ card: { borderRadius: 12, margin: 15 }, title: { fontSize: 18, fontWeight: '700', color: '#003d82', marginBottom: 8 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, btn: { backgroundColor: '#003d82', paddingHorizontal: 10 } });
