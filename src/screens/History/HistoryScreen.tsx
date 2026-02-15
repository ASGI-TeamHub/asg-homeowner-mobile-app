import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ButtonGroup, Text } from 'react-native-elements';
import AppCard from '../../components/AppCard';
import { LineChart } from 'react-native-chart-kit';
import { useAppSelector } from '../../store';
import { useGetFITPaymentsQuery, useGetGenerationHistoryQuery } from '../../store/api/luxApi';

const periods: Array<'week' | 'month' | 'year'> = ['week', 'month', 'year'];

export default function HistoryScreen() {
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = periods[periodIndex];
  const siteId = useAppSelector((state) => state.auth.user?.site_reference || '');

  const historyQuery = useGetGenerationHistoryQuery({ siteId, period }, { skip: !siteId });
  const paymentsQuery = useGetFITPaymentsQuery({ siteId, page: 1 }, { skip: !siteId });

  const chartData = useMemo(() => {
    const data = historyQuery.data?.data || [];
    return {
      labels: data.slice(-7).map((x) => x.date.slice(5)),
      datasets: [{ data: data.slice(-7).map((x) => x.generation_kwh || 0) }],
    };
  }, [historyQuery.data]);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={historyQuery.isFetching || paymentsQuery.isFetching} onRefresh={() => { void historyQuery.refetch(); void paymentsQuery.refetch(); }} />}>
      <ButtonGroup buttons={['Week', 'Month', 'Year']} selectedIndex={periodIndex} onPress={setPeriodIndex} />

      <AppCard>
        <Text style={styles.cardTitle}>Generation</Text>
        {chartData.datasets[0].data.length > 0 ? (
          <LineChart
            data={chartData}
            width={320}
            height={220}
            yAxisSuffix="kWh"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(0,61,130,${opacity})`,
            }}
          />
        ) : (
          <Text>No generation data yet.</Text>
        )}
      </AppCard>

      <AppCard>
        <Text style={styles.cardTitle}>FIT Payments</Text>
        {(paymentsQuery.data?.data.results || []).map((payment) => (
          <View key={payment.id} style={styles.row}>
            <Text>{new Date(payment.payment_date).toLocaleDateString()}</Text>
            <Text>£{payment.total_payment.toFixed(2)}</Text>
          </View>
        ))}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#003d82', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
});
