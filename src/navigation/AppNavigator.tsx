import React, { Suspense } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store';
import Loader from '../components/Loader';

const AuthNavigator = React.lazy(() => import('./AuthNavigator'));
const MainTabs = React.lazy(() => import('./MainTabs'));

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const token = useAppSelector((s) => s.auth.token);
  const themeMode = useAppSelector((s) => s.ui.theme);
  const navTheme = themeMode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Suspense fallback={<Loader />}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {token ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}
