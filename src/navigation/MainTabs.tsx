import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { colors } from '../constants/colors';

import Bookings from '../screens/Booking/Bookings';
import Profile from '../screens/Profile/Profile';
// Dashboard screen removed
// Stack-pushed screens moved to MainStack

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 2, fontWeight: '600' },
        tabBarItemStyle: { justifyContent: 'center' },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          height: 76,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden',
          borderTopWidth: 0,
          elevation: 8,
        },
      }}
    >
      {/* Home tab removed with Dashboard */}
      <Tab.Screen
        name="Bookings"
        component={Bookings}
        options={{
          headerShown: true,
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              paddingHorizontal: 1,
              paddingVertical: 3,
              borderRadius: 999,
            }}>
              <MaterialIcons name="event" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: true,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              paddingHorizontal: 1,
              paddingVertical: 3,
              borderRadius: 999,
            }}>
              <MaterialIcons name="person" color={color} size={size} />
            </View>
          ),
        }}
      />
      {/* Hidden routes removed; handled in MainStack */}
    </Tab.Navigator>
  );
}
