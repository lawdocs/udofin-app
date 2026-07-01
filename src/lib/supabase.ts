import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Warn loudly in dev if env vars are missing — but do NOT throw at module level.
// A top-level throw crashes the JS engine before any error boundary can catch it.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Udofin] Supabase environment variables are missing. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env or EAS environment.'
  );
}

// Safe storage wrapper to prevent crashes if native module is not built
class SafeStorage {
  memoryStore = new Map<string, string>();

  async getItem(key: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return this.memoryStore.get(key) || null;
    }
  }
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.setItem(key, value);
      }
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      this.memoryStore.set(key, value);
    }
  }
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.removeItem(key);
      }
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      this.memoryStore.delete(key);
    }
  }
}

const customStorage = new SafeStorage();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
