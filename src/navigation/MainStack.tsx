import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ManualLocation from '../screens/Location/ManualLocation';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="ManualLocation" component={ManualLocation} />
    </Stack.Navigator>
  );
}
