import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-elements';
import Svg, { Path } from 'react-native-svg';

interface GenerationGaugeProps {
  currentPower: number;
  maxPower: number;
  todayGeneration: number;
}

const ASG_BLUE = '#003d82';
const GREEN = '#22c55e';
const GAUGE_SIZE = 180;
const STROKE_WIDTH = 12;

export default function GenerationGauge({ currentPower, maxPower, todayGeneration }: GenerationGaugeProps) {
  const safeMax = maxPower > 0 ? maxPower : 1;
  const powerPercentage = Math.max(0, Math.min((currentPower / safeMax) * 100, 100));
  const center = GAUGE_SIZE / 2;
  const startAngle = -225;
  const endAngle = startAngle + 270;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return { x: centerX + (radius * Math.cos(angleInRadians)), y: centerY + (radius * Math.sin(angleInRadians)) };
  };

  const createArcPath = (start: number, end: number, radius: number) => {
    const pathStart = polarToCartesian(center, center, radius, end);
    const pathEnd = polarToCartesian(center, center, radius, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return `M ${pathStart.x} ${pathStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${pathEnd.x} ${pathEnd.y}`;
  };

  const status = currentPower === 0 ? 'No generation' : currentPower < safeMax * 0.3 ? 'Low generation' : 'Good generation';
  const efficiency = Math.round((currentPower / safeMax) * 100);
  const radius = (GAUGE_SIZE - STROKE_WIDTH) / 2;

  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel={`Current generation ${currentPower.toFixed(1)} kilowatts, ${efficiency}% efficiency, ${todayGeneration.toFixed(1)} kilowatt hours today`}
    >
      <View style={styles.gaugeContainer}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
          <Path d={createArcPath(startAngle, endAngle, radius)} fill="none" stroke="#e5e7eb" strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
          <Path d={createArcPath(startAngle, startAngle + (270 * powerPercentage / 100), radius)} fill="none" stroke={currentPower > 0 ? GREEN : '#e5e7eb'} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
        </Svg>
        <View style={styles.centerContent}>
          <Text style={[styles.powerValue, { color: currentPower > 0 ? GREEN : '#666' }]}>{currentPower.toFixed(1)}</Text>
          <Text style={styles.powerUnit}>kW</Text>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.bottomStats}>
        <Text style={styles.capacityText}>System Capacity: {maxPower}kW</Text>
        <Text style={styles.efficiencyText}>Efficiency: {efficiency}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20 },
  gaugeContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  centerContent: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  powerValue: { fontSize: 36, fontWeight: 'bold', color: GREEN },
  powerUnit: { fontSize: 16, color: '#666', marginTop: -5 },
  statusText: { fontSize: 12, color: '#666', marginTop: 5, textAlign: 'center' },
  bottomStats: { alignItems: 'center', marginTop: 15 },
  capacityText: { fontSize: 14, color: ASG_BLUE, fontWeight: '500' },
  efficiencyText: { fontSize: 12, color: '#666', marginTop: 3 },
});
