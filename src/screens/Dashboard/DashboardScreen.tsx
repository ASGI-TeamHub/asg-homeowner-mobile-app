import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, Card, Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector } from '../../store';
import {
  useGetSiteDataQuery,
  useGetLiveGenerationQuery,
  useGetPerformanceAlertsQuery,
} from '../../store/api/luxApi';
import GenerationGauge from '../../components/GenerationGauge';
import WeatherWidget from '../../components/WeatherWidget';
import SystemHealthIndicator from '../../components/SystemHealthIndicator';
import QuickActions from '../../components/QuickActions';
import PerformanceAlerts from '../../components/PerformanceAlerts';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width } = Dimensions.get('window');
const ASG_BLUE = '#003d82';
const ASG_LIGHT_BLUE = '#4a90c2';
const GREEN = '#22c55e';
const ORANGE = '#f59e0b';

export default function DashboardScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const siteId = user?.site_reference || '';

  const {
    data: siteData,
    isLoading: siteLoading,
    refetch: refetchSite,
  } = useGetSiteDataQuery(siteId, { skip: !siteId });

  const {
    data: liveData,
    isLoading: liveLoading,
  } = useGetLiveGenerationQuery(siteId, { 
    skip: !siteId,
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const {
    data: alertsData,
    isLoading: alertsLoading,
  } = useGetPerformanceAlertsQuery(siteId, { skip: !siteId });

  const site = siteData?.data;
  const liveGeneration = liveData?.data;
  const alerts = alertsData?.data || [];

  const isLoading = siteLoading || liveLoading || alertsLoading;

  const todayGeneration = liveGeneration?.today_kwh || site?.today_generation_kwh || 0;
  const currentPower = liveGeneration?.current_kw || site?.current_generation_kw || 0;
  const todayEarnings = todayGeneration * (site?.fit_rate_per_kwh || 0.15);

  const systemHealth = site?.system_health || 'good';
  const highPriorityAlerts = alerts.filter((alert) => 
    alert.severity === 'high' || alert.severity === 'critical'
  );

  const handleRefresh = async () => {
    try {
      await refetchSite();
    } catch (error) {
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Greeting */}
      <LinearGradient
        colors={[ASG_BLUE, ASG_LIGHT_BLUE]}
        style={styles.header}
      >
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <Text style={styles.subtitleText}>
          {site?.postcode} • {site?.panel_capacity_kw}kW System
        </Text>
        {site?.last_reading_date && (
          <Text style={styles.lastUpdateText}>
            Last updated: {new Date(site.last_reading_date).toLocaleString()}
          </Text>
        )}
      </LinearGradient>

      {/* Main Generation Display */}
      <Card containerStyle={styles.mainCard}>
        <View style={styles.mainCardContent}>
          <GenerationGauge
            currentPower={currentPower}
            maxPower={site?.panel_capacity_kw || 5}
            todayGeneration={todayGeneration}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {todayGeneration.toFixed(1)} kWh
              </Text>
              <Text style={styles.statLabel}>Generated Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: GREEN }]}>
                £{todayEarnings.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Earned Today</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Weather & System Health Row */}
      <View style={styles.widgetRow}>
        <WeatherWidget weather={site?.current_weather} />
        <SystemHealthIndicator health={systemHealth} />
      </View>

      {/* Performance Alerts */}
      {highPriorityAlerts.length > 0 && (
        <PerformanceAlerts alerts={highPriorityAlerts} />
      )}

      {/* Monthly Summary */}
      <Card containerStyle={styles.summaryCard}>
        <Text style={styles.cardTitle}>This Month</Text>
        <View style={styles.monthlyStats}>
          <View style={styles.monthlyStat}>
            <Icon name="flash" size={24} color={ASG_BLUE} />
            <Text style={styles.monthlyValue}>
              {site?.monthly_generation_kwh?.toFixed(0) || '0'} kWh
            </Text>
            <Text style={styles.monthlyLabel}>Generated</Text>
          </View>
          <View style={styles.monthlyStat}>
            <Icon name="cash" size={24} color={GREEN} />
            <Text style={styles.monthlyValue}>
              £{site?.estimated_monthly_payment?.toFixed(0) || '0'}
            </Text>
            <Text style={styles.monthlyLabel}>FIT Payment</Text>
          </View>
          <View style={styles.monthlyStat}>
            <Icon name="leaf" size={24} color={GREEN} />
            <Text style={styles.monthlyValue}>
              {((site?.monthly_generation_kwh || 0) * 0.4).toFixed(0)} kg
            </Text>
            <Text style={styles.monthlyLabel}>CO₂ Saved</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <QuickActions 
        onBookService={() => {
          // Navigate to maintenance screen
        }}
        onViewPayments={() => {
          // Navigate to history screen
        }}
        onContactSupport={() => {
          Alert.alert(
            'Contact Support',
            'Call ASG Support on 0800 0000 000 or use the chat feature in the Maintenance tab.'
          );
        }}
      />

      {/* Bottom spacing for tab bar */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  lastUpdateText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.7,
    marginTop: 5,
  },
  mainCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  mainCardContent: {
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ASG_BLUE,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  widgetRow: {
    flexDirection: 'row',
    marginHorizontal: 15,
    gap: 10,
  },
  summaryCard: {
    margin: 15,
    borderRadius: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ASG_BLUE,
    marginBottom: 15,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  monthlyStat: {
    alignItems: 'center',
  },
  monthlyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ASG_BLUE,
    marginTop: 5,
  },
  monthlyLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
});