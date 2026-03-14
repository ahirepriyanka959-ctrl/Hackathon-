import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@ims_theme';

const light = {
  mode: 'light',
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  card: '#ffffff',
  shadow: '#00000015',
};

const dark = {
  mode: 'dark',
  primary: '#38bdf8',
  primaryDark: '#0ea5e9',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  card: '#1e293b',
  shadow: '#00000040',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState('system'); // 'light' | 'dark' | 'system'
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved) setThemePreferenceState(saved);
      setLoaded(true);
    });
  }, []);

  const setThemePreference = (value) => {
    setThemePreferenceState(value);
    AsyncStorage.setItem(THEME_KEY, value);
  };

  const effectiveMode = themePreference === 'system' ? (system || 'light') : themePreference;
  const theme = effectiveMode === 'dark' ? dark : light;

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
