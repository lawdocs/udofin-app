import { create } from 'zustand';

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

export const useOnboardingStore = create<OnboardingState>((set) => ({
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
}));
