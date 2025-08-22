import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../screens/Dashboard/Dashboard';
import SalonDetail from '../screens/Salon/SalonDetail';
import SelectServices from '../screens/Booking/SelectServices';
import SelectDateTime from '../screens/Booking/SelectDateTime';
import ReviewConfirm from '../screens/Booking/ReviewConfirm';
import BookingSuccess from '../screens/Booking/BookingSuccess';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="SalonDetail" component={SalonDetail} />
      <Stack.Screen name="SelectServices" component={SelectServices} />
      <Stack.Screen name="SelectDateTime" component={SelectDateTime} />
      <Stack.Screen name="ReviewConfirm" component={ReviewConfirm} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccess} />
    </Stack.Navigator>
  );
}
