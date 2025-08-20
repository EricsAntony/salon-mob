import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Landing from '../screens/Landing/Landing';
import PhoneInput from '../screens/Auth/PhoneInput';
import OTPInput from '../screens/Auth/OTPInput';
import UserDetails from '../screens/Auth/UserDetails';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen
        name="PhoneInput"
        component={PhoneInput}
        options={{ title: 'Phone Number', headerShown: false }}
      />
      <Stack.Screen name="OTPInput" component={OTPInput} options={{ headerShown: false }} />
      <Stack.Screen name="UserDetails" component={UserDetails} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
