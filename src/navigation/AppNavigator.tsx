import React, { Suspense, useEffect, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store';
import Loader from '../components/Loader';

const AuthNavigator = React.lazy(() => import('./AuthNavigator'));
const MainStack = React.lazy(() => import('./MainStack'));
const LocationNavigator = React.lazy(() => import('./LocationNavigator'));

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const token = useAppSelector((s) => s.auth.token);
  const isLocationSet = useAppSelector((s) => s.location.isLocationSet);
  const detectedAt = useAppSelector((s) => s.location.detectedAt);
  const themeMode = useAppSelector((s) => s.ui.theme);
  const navTheme = themeMode === 'dark' ? DarkTheme : DefaultTheme;
  // Force Location flow on each fresh app start. We only switch to Main after
  // location is detected this session (setLocation dispatched).
  const [bootLocationCheck, setBootLocationCheck] = useState(false);
  // Only consider it complete when location becomes set during this session
  const prevLocSet = useRef(isLocationSet);
  const bootStartedAt = useRef<number>(Date.now());
  useEffect(() => {
    if (!prevLocSet.current && isLocationSet) {
      setBootLocationCheck(true);
    }
    prevLocSet.current = isLocationSet;
  }, [isLocationSet]);
  // If we already had isLocationSet = true from persistence, wait for a fresh detection
  useEffect(() => {
    if (detectedAt && detectedAt >= bootStartedAt.current) {
      setBootLocationCheck(true);
    }
  }, [detectedAt]);
  useEffect(() => {
    // When auth token changes (logout/login), restart the location check flow
    setBootLocationCheck(false);
    bootStartedAt.current = Date.now();
  }, [token]);

  return (
    <NavigationContainer theme={navTheme}>
      <Suspense fallback={<Loader />}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {!token ? (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : !bootLocationCheck ? (
            <Stack.Screen name="Location" component={LocationNavigator} />
          ) : (
            <Stack.Screen name="Main" component={MainStack} />
          )}
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}
