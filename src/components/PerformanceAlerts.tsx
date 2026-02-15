import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-elements';
import { PerformanceAlert } from '../types';
import AppCard from './AppCard';

export default function PerformanceAlerts({ alerts }: { alerts: PerformanceAlert[] }) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Performance Alerts</Text>
      {alerts.map((alert) => (
        <View key={alert.id} style={styles.row} accessibilityRole="text" accessibilityLabel={`${alert.severity} ${alert.title}`}>
          <Text style={styles.severity}>{alert.severity.toUpperCase()}</Text>
          <View style={styles.content}>
            <Text style={styles.itemTitle}>{alert.title}</Text>
            <Text>{alert.description}</Text>
            {alert.action_required ? <Text style={styles.action}>Action: {alert.action_required}</Text> : null}
          </View>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({ card: { borderRadius: 12, margin: 15 }, title: { fontSize: 18, fontWeight: '700', color: '#003d82', marginBottom: 10 }, row: { flexDirection: 'row', marginBottom: 10 }, severity: { fontWeight: '700', color: '#dc2626', width: 70 }, content: { flex: 1 }, itemTitle: { fontWeight: '600' }, action: { marginTop: 4, color: '#003d82' } });
