import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-elements';

export default function SiteVerificationScreen() {
  return (
    <View style={styles.container}>
      <Text h4>Site Verification</Text>
      <Text style={styles.text}>If additional verification is required, instructions will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  text: { marginTop: 8, color: '#444' },
});
