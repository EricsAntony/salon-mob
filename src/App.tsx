import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store, persistor } from './store';
import AppNavigator from './navigation/AppNavigator';
import { paperDarkTheme, paperLightTheme } from './styles/paperTheme';
import Loader from './components/Loader';
import { useAppSelector } from './store';

function ThemedApp() {
  const themeMode = useAppSelector((s) => s.ui.theme);
  const paperTheme = themeMode === 'dark' ? paperDarkTheme : paperLightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PersistGate loading={<Loader />} persistor={persistor}>
          <ThemedApp />
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
