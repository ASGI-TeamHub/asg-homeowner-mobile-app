import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-elements';
import AppCard from '../../components/AppCard';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useAppSelector } from '../../store';
import {
  useGetLiveGenerationQuery,
  useGetPerformanceAlertsQuery,
  useGetSiteDataQuery,
} from '../../store/api/luxApi';
import GenerationGauge from '../../components/GenerationGauge';
import WeatherWidget from '../../components/WeatherWidget';
import SystemHealthIndicator from '../../components/SystemHealthIndicator';
import QuickActions from '../../components/QuickActions';
import PerformanceAlerts from '../../components/PerformanceAlerts';
import LoadingSpinner from '../../components/LoadingSpinner';

const ASG_BLUE = '#003d82';
const GREEN = '#22c55e';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.auth);
  const siteId = user?.site_reference || '';
  const [isActive, setIsActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => setIsActive(next === 'active'));
    return () => sub.remove();
  }, []);

  const siteQuery = useGetSiteDataQuery(siteId, { skip: !siteId });
  const liveQuery = useGetLiveGenerationQuery(siteId, {
    skip: !siteId,
    pollingInterval: isActive ? 30000 : 0,
  });
  const alertsQuery = useGetPerformanceAlertsQuery(siteId, { skip: !siteId });

  const site = siteQuery.data?.data;
  const liveGeneration = liveQuery.data?.data;
  const alerts = alertsQuery.data?.data || [];
  const isLoading = siteQuery.isLoading || liveQuery.isLoading || alertsQuery.isLoading;

  const todayGeneration = liveGeneration?.today_kwh || site?.today_generation_kwh || 0;
  const currentPower = liveGeneration?.current_kw || site?.current_generation_kw || 0;
  const todayEarnings = todayGeneration * (site?.fit_rate_per_kwh || 0.15);
  const highPriorityAlerts = alerts.filter((alert) => alert.severity === 'high' || alert.severity === 'critical');

  const handleRefresh = async () => {
    try {
      await Promise.all([siteQuery.refetch(), liveQuery.refetch(), alertsQuery.refetch()]);
    } catch {
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.first_name || 'Homeowner';
    if (hour < 12) return `Good morning, ${firstName}`;
    if (hour < 17) return `Good afternoon, ${firstName}`;
    return `Good evening, ${firstName}`;
  };

  if (!site && isLoading) {
    return <LoadingSpinner message="Loading your solar dashboard..." />;
  }

  if (!site && siteQuery.isError) {
    return <LoadingSpinner message="Unable to load site data. Pull to retry." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={siteQuery.isFetching || liveQuery.isFetching || alertsQuery.isFetching} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={[ASG_BLUE, '#4a90c2']} style={styles.header}>
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <Text style={styles.subtitleText}>{site?.postcode} • {site?.panel_capacity_kw}kW System</Text>
      </LinearGradient>

      <AppCard style={styles.mainCard}>
        <GenerationGauge currentPower={currentPower} maxPower={site?.panel_capacity_kw || 5} todayGeneration={todayGeneration} />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayGeneration.toFixed(1)} kWh</Text>
            <Text style={styles.statLabel}>Generated Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: GREEN }]}>£{todayEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Earned Today</Text>
          </View>
        </View>
      </AppCard>

      <View style={styles.widgetRow}>
        <WeatherWidget weather={site?.current_weather} />
        <SystemHealthIndicator health={site?.system_health || 'good'} />
      </View>

      {alertsQuery.isError ? <AppCard><Text>Could not load alerts.</Text></AppCard> : null}
      {highPriorityAlerts.length > 0 ? <PerformanceAlerts alerts={highPriorityAlerts} /> : null}

      <AppCard style={styles.summaryCard}>
        <Text style={styles.cardTitle}>This Month</Text>
        <View style={styles.monthlyStats}>
          <View style={styles.monthlyStat}>
            <Icon name="flash" size={24} color={ASG_BLUE} />
            <Text style={styles.monthlyValue}>{site?.monthly_generation_kwh?.toFixed(0) || '0'} kWh</Text>
            <Text style={styles.monthlyLabel}>Generated</Text>
          </View>
          <View style={styles.monthlyStat}>
            <Icon name="cash" size={24} color={GREEN} />
            <Text style={styles.monthlyValue}>£{site?.estimated_monthly_payment?.toFixed(0) || '0'}</Text>
            <Text style={styles.monthlyLabel}>FIT Payment</Text>
          </View>
        </View>
      </AppCard>

      <QuickActions
        onBookService={() => navigation.navigate('Maintenance' as never)}
        onViewPayments={() => navigation.navigate('History' as never)}
        onContactSupport={() => {
          Alert.alert('Contact Support', `Call ASG Support on ${(Constants.expoConfig?.extra?.supportPhone as string | undefined) || 'N/A'}`);
        }}
      />
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, paddingTop: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitleText: { fontSize: 16, color: 'white', opacity: 0.9 },
  mainCard: { margin: 15, borderRadius: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: ASG_BLUE },
  statLabel: { fontSize: 14, color: '#666', marginTop: 5 },
  widgetRow: { flexDirection: 'row', marginHorizontal: 15, gap: 10 },
  summaryCard: { margin: 15, borderRadius: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: ASG_BLUE, marginBottom: 15 },
  monthlyStats: { flexDirection: 'row', justifyContent: 'space-around' },
  monthlyStat: { alignItems: 'center' },
  monthlyValue: { fontSize: 18, fontWeight: 'bold', color: ASG_BLUE, marginTop: 5 },
  monthlyLabel: { fontSize: 12, color: '#666', marginTop: 3 },
});
