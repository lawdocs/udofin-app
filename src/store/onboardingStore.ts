import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  language: string;
  setLanguage: (lang: string) => void;
  
  mobileNumber: string;
  setMobileNumber: (num: string) => void;
  
  email: string;
  setEmail: (email: string) => void;
  
  pin: string;
  setPin: (pin: string) => void;
  
  clearState: () => void;
}

import { Platform } from 'react-native';

const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') return localStorage.getItem(name);
      } catch (e) {}
      return null;
    }
    try {
      return await AsyncStorage.getItem(name);
    } catch (e) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
      } catch (e) {}
      return;
    }
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e) {}
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
      } catch (e) {}
      return;
    }
    try {
      await AsyncStorage.removeItem(name);
    } catch (e) {}
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      language: 'English',
      setLanguage: (lang) => set({ language: lang }),
      
      mobileNumber: '',
      setMobileNumber: (num) => set({ mobileNumber: num }),
      
      email: '',
      setEmail: (email) => set({ email }),
      
      pin: '',
      setPin: (pin) => set({ pin }),
      
      clearState: () => set({
        language: 'English',
        mobileNumber: '',
        email: '',
        pin: '',
      })
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => customStorage),
      // Only persist the language so auth state doesn't get messed up if someone logs out
      partialize: (state) => ({ language: state.language }),
    }
  )
);
