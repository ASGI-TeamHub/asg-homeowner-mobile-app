import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-elements';

export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.container} accessibilityLabel="Loading screen" accessibilityRole="progressbar">
      <Text style={styles.title}>ASG Solar</Text>
      <ActivityIndicator size="large" color="#003d82" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16, color: '#003d82' },
  message: { marginTop: 12, color: '#444' },
});
