import { useAppDispatch, useAppSelector } from '../store';
import { setTheme, toggleTheme } from '../store/slices/uiSlice';

export function useThemePreference() {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();
  return {
    theme,
    setTheme: (mode: 'light' | 'dark') => dispatch(setTheme(mode)),
    toggleTheme: () => dispatch(toggleTheme()),
  };
}
