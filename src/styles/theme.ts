import { colors } from '../constants/colors';

export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#111111',
    primary: colors.primary,
    accent: colors.accent,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#000000',
    surface: '#121212',
    text: '#FFFFFF',
  },
};
