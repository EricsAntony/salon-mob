import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Dashboard() {
  return (
    <LinearGradient
      colors={['#ffffff', '#f3e8ff', '#ede9fe']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome! Your account is all set.</Text>
        <Text style={styles.helper}>Design to follow. This is a temporary screen.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    minWidth: 280,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1f2937', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#4b5563' },
  helper: { fontSize: 12, color: '#6b7280', marginTop: 8 },
});
