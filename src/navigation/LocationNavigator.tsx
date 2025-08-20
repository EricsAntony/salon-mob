import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LocationGate from '../screens/Location/LocationGate';
import ManualLocation from '../screens/Location/ManualLocation';

const Stack = createNativeStackNavigator();

export default function LocationNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="LocationGate" component={LocationGate} />
      <Stack.Screen name="ManualLocation" component={ManualLocation} />
    </Stack.Navigator>
  );
}
