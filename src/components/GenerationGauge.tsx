import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import Svg, { Circle, Path } from 'react-native-svg';

interface GenerationGaugeProps {
  currentPower: number; // kW
  maxPower: number; // kW system capacity
  todayGeneration: number; // kWh today
}

const ASG_BLUE = '#003d82';
const GREEN = '#22c55e';
const GAUGE_SIZE = 180;
const STROKE_WIDTH = 12;

export default function GenerationGauge({ 
  currentPower, 
  maxPower, 
  todayGeneration 
}: GenerationGaugeProps) {
  const radius = (GAUGE_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentage of max power (0-100%)
  const powerPercentage = Math.min((currentPower / maxPower) * 100, 100);
  
  // Convert percentage to stroke offset (inverted for clockwise)
  const strokeOffset = circumference - (powerPercentage / 100) * circumference * 0.75; // 270 degree arc
  
  const center = GAUGE_SIZE / 2;
  const startAngle = -225; // Start at 8 o'clock position
  const endAngle = startAngle + 270; // 270 degree arc
  
  // Create the arc path
  const createArcPath = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getGenerationStatus = () => {
    const hour = new Date().getHours();
    if (hour < 6 || hour > 20) return 'Night time';
    if (currentPower === 0) return 'No generation';
    if (currentPower < maxPower * 0.1) return 'Low generation';
    if (currentPower < maxPower * 0.5) return 'Good generation';
    return 'Excellent generation';
  };

  const getStatusColor = () => {
    if (currentPower === 0) return '#666';
    if (currentPower < maxPower * 0.3) return '#f59e0b';
    return GREEN;
  };

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
          {/* Background arc */}
          <Path
            d={createArcPath(startAngle, endAngle, radius)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <Path
            d={createArcPath(startAngle, startAngle + (270 * powerPercentage / 100), radius)}
            fill="none"
            stroke={currentPower > 0 ? GREEN : '#e5e7eb'}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
        </Svg>
        
        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.powerValue, { color: getStatusColor() }]}>
            {currentPower.toFixed(1)}
          </Text>
          <Text style={styles.powerUnit}>kW</Text>
          <Text style={styles.statusText}>{getGenerationStatus()}</Text>
        </View>
      </View>
      
      {/* Bottom stats */}
      <View style={styles.bottomStats}>
        <Text style={styles.capacityText}>
          System Capacity: {maxPower}kW
        </Text>
        <Text style={styles.efficiencyText}>
          Efficiency: {maxPower > 0 ? Math.round((currentPower / maxPower) * 100) : 0}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: GREEN,
  },
  powerUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: -5,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  bottomStats: {
    alignItems: 'center',
    marginTop: 15,
  },
  capacityText: {
    fontSize: 14,
    color: ASG_BLUE,
    fontWeight: '500',
  },
  efficiencyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
});