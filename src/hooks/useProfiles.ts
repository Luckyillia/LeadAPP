import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mapProfile } from '@/lib/mappers';
import type { UserRole } from '@/types';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => mapProfile(r as Record<string, unknown>));
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      fullName: string;
      role: UserRole;
    }) => {
      // Admin tworzy konto przez Supabase Auth Admin API
      // W kliencie używamy signUp – nowe konto musi być potwierdzone lub auto-confirm włączony w Supabase
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: { full_name: payload.fullName, role: payload.role },
        },
      });
      if (error) throw error;

      // Profil tworzony przez trigger w Supabase lub ręcznie:
      if (data.user) {
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: payload.email,
          full_name: payload.fullName,
          role: payload.role,
          is_active: true,
        });
        if (profileErr) throw profileErr;
      }
      return data.user;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; role?: UserRole; isActive?: boolean; fullName?: string }) => {
      const update: Record<string, unknown> = {};
      if (payload.role !== undefined) update.role = payload.role;
      if (payload.isActive !== undefined) update.is_active = payload.isActive;
      if (payload.fullName !== undefined) update.full_name = payload.fullName;
      const { error } = await supabase.from('profiles').update(update).eq('id', payload.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}
