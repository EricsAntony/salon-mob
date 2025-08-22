import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Search() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.subtitle}>Find salons, services and more</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#141118', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#756388', marginTop: 6 },
});
