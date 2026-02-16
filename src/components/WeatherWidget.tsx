import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { WeatherData } from '../types';
import AppCard from './AppCard';

const iconMap: Record<WeatherData['conditions'], string> = { sunny: 'sunny', cloudy: 'cloudy', overcast: 'cloud', rainy: 'rainy', snow: 'snow' };

export default function WeatherWidget({ weather }: { weather?: WeatherData }) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Weather</Text>
      {weather ? (
        <View accessibilityLabel={`Weather ${weather.conditions}, ${weather.temperature_c} degrees`}>
          <Icon name={iconMap[weather.conditions]} size={22} color="#003d82" />
          <Text>{weather.temperature_c.toFixed(0)}°C • {weather.conditions}</Text>
          <Text style={styles.small}>Cloud cover: {weather.cloud_cover_percent}%</Text>
          <Text style={styles.small}>Forecast: {weather.forecast_generation_kwh.toFixed(1)} kWh</Text>
        </View>
      ) : <Text style={styles.small}>No weather data</Text>}
    </AppCard>
  );
}

const styles = StyleSheet.create({ card: { flex: 1, margin: 0 }, title: { fontWeight: '700', marginBottom: 6, color: '#003d82' }, small: { color: '#666', fontSize: 12, marginTop: 2 } });
