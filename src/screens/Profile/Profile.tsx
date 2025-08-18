import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useThemePreference } from '../../hooks/useThemePreference';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useThemePreference();

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="titleLarge">{user?.name ?? 'Guest'}</Text>
      <Text>Theme: {theme}</Text>
      <Button onPress={toggleTheme}>Toggle Theme</Button>
      <Button onPress={signOut}>Logout</Button>
    </View>
  );
}
