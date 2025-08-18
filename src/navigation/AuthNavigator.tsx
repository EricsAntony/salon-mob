import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../screens/Auth/Login';
import Signup from '../screens/Auth/Signup';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import Landing from '../screens/Landing/Landing';
import PhoneInput from '../screens/Auth/PhoneInput';
import OTPInput from '../screens/Auth/OTPInput';

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
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: 'Login', headerShown: true }}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ title: 'Sign Up', headerShown: true }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ title: 'Forgot Password', headerShown: true }}
      />
    </Stack.Navigator>
  );
}
