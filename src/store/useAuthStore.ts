import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { mapProfile } from '@/lib/mappers';
import type { Profile } from '@/types';

interface AuthStore {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  init: () => Promise<() => void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  clearError: () => set({ error: null }),

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      set({
        user: profile ? mapProfile(profile as Record<string, unknown>) : null,
        loading: false,
      });
    } else {
      set({ user: null, loading: false });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          set({
            user: profile ? mapProfile(profile as Record<string, unknown>) : null,
            loading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Brak danych użytkownika.');

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileErr) throw new Error('Nie znaleziono profilu użytkownika.');

      const mapped = mapProfile(profile as Record<string, unknown>);
      if (!mapped.isActive) throw new Error('Konto jest nieaktywne. Skontaktuj się z administratorem.');

      set({ user: mapped, loading: false, error: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd logowania';
      const friendly = msg.includes('Invalid login') ? 'Nieprawidłowy email lub hasło.' : msg;
      set({ error: friendly, loading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, error: null });
  },
}));
