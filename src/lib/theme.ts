import { useColorScheme, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

type ThemePreference = 'light' | 'dark' | 'system';

export const lightColors = {
  background: '#FEF8F4',
  surface: '#FFFFFF',
  surfaceBorder: '#EAEAEA',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  primary: '#E47656',
  primaryLight: '#FFF5F2',
  primaryBorder: '#FBECE8',
  danger: '#EF4444',
  dangerLight: '#FFF1F1',
  dangerBorder: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  successBorder: '#A7F3D0',
  divider: '#F3F4F6',
  white: '#FFFFFF', // always white
  black: '#000000', // always black
};

export const darkColors = {
  // Warm dark palette
  background: '#161412',
  surface: '#201D1A',
  surfaceBorder: '#302C28',
  text: '#F3F4F6',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  primary: '#E47656',
  primaryLight: '#3D221A', // Darker warm tint
  primaryBorder: '#4F2D23',
  danger: '#F87171',
  dangerLight: '#3D1B1B',
  dangerBorder: '#5C2222',
  success: '#34D399',
  successLight: '#064E3B',
  successBorder: '#065F46',
  divider: '#302C28',
  white: '#FFFFFF',
  black: '#000000',
};

// Global theme state manager (simple pub/sub)
let currentThemePreference: ThemePreference = 'system';
const listeners = new Set<() => void>();

const getSystemTheme = () => {
  // We can't synchronously read the system theme outside a component hook without native modules,
  // but we can pass it in via the useTheme hook.
  return 'light'; // Default fallback
};

export const setThemePreference = async (pref: ThemePreference) => {
  currentThemePreference = pref;
  listeners.forEach(l => l());
  try {
    if (Platform.OS !== 'web') {
      await AsyncStorage.setItem('theme_preference', pref);
    } else {
      if (typeof localStorage !== 'undefined') localStorage.setItem('theme_preference', pref);
    }
  } catch (e) {}
  
  // Try to sync with Supabase if logged in
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ theme: pref }).eq('id', user.id);
    }
  } catch (e) {
    // Ignore error
  }
};

export const loadThemePreference = async () => {
  try {
    let stored: string | null = null;
    if (Platform.OS !== 'web') {
      stored = await AsyncStorage.getItem('theme_preference');
    } else {
      if (typeof localStorage !== 'undefined') stored = localStorage.getItem('theme_preference');
    }
    
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      currentThemePreference = stored;
      listeners.forEach(l => l());
    }
  } catch (e) {
    // Ignore error
  }
};

// Initialize
loadThemePreference();

/**
 * Hook to get the current theme colors based on preference and system settings.
 */
export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [pref, setPref] = useState<ThemePreference>(currentThemePreference);

  useEffect(() => {
    const listener = () => setPref(currentThemePreference);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const isDark = pref === 'dark' || (pref === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  return { colors, isDark, themePreference: pref, setThemePreference };
}
