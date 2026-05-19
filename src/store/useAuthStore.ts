import { create } from 'zustand';
import type { Profile } from '@/types';
import { MOCK_PROFILES } from '@/lib/data';

interface AuthStore {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  login: (role: Profile['role']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: MOCK_PROFILES[0], // default: admin for demo
  setUser: (user) => set({ user }),
  login: (role) => {
    const profile = MOCK_PROFILES.find((p) => p.role === role) ?? MOCK_PROFILES[0];
    set({ user: profile });
  },
  logout: () => set({ user: null }),
}));
