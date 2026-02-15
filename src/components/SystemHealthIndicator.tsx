import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-elements';
import AppCard from './AppCard';

type Health = 'good' | 'warning' | 'error' | 'offline';
const colors: Record<Health, string> = { good: '#22c55e', warning: '#f59e0b', error: '#dc2626', offline: '#6b7280' };

export default function SystemHealthIndicator({ health }: { health: Health }) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>System Health</Text>
      <View style={styles.row} accessibilityLabel={`System health ${health}`}>
        <View style={[styles.dot, { backgroundColor: colors[health] }]} />
        <Text style={styles.label}>{health.toUpperCase()}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({ card: { flex: 1, margin: 0 }, title: { fontWeight: '700', marginBottom: 8, color: '#003d82' }, row: { flexDirection: 'row', alignItems: 'center', gap: 8 }, dot: { width: 10, height: 10, borderRadius: 5 }, label: { fontWeight: '600' } });
