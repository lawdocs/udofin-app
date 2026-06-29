import { create } from 'zustand';

interface AuthState {
  isAppLocked: boolean;
  setAppLocked: (locked: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAppLocked: true, // Default to locked on app boot to prevent bypass
  setAppLocked: (locked) => set({ isAppLocked: locked }),
}));
