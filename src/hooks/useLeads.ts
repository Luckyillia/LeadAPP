import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mapLead } from '@/lib/mappers';
import type { Lead, LeadStatus, LeadSource } from '@/types';

export function useLeads(filters?: { status?: LeadStatus; source?: LeadSource }) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*, profiles!leads_assigned_to_fkey(id, email, full_name, role, is_active, created_at)')
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.source) query = query.eq('source', filters.source);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((r) => mapLead(r as Record<string, unknown>));
    },
  });
}

export function useMyLeadsCC(userId: string) {
  return useQuery({
    queryKey: ['leads', 'cc', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => mapLead(r as Record<string, unknown>));
    },
    enabled: !!userId,
  });
}

export function useMyLeadsSales(userId: string) {
  return useQuery({
    queryKey: ['leads', 'sales', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => mapLead(r as Record<string, unknown>));
    },
    enabled: !!userId,
  });
}

export function useBuyerLeads(userId: string) {
  return useQuery({
    queryKey: ['leads', 'buyer', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('buyer_id', userId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => mapLead(r as Record<string, unknown>));
    },
    enabled: !!userId,
  });
}

export function useAddLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      companyName: string;
      consentText: string;
      source: LeadSource;
      assignedTo?: string | null;
    }) => {
      const cleanPhone = payload.phone.replace(/[^0-9+]/g, '');

      const { data: dupes } = await supabase
        .from('leads')
        .select('id, assigned_to')
        .or(`email.eq.${payload.email},phone.eq.${cleanPhone}`)
        .limit(1);

      const isDuplicate = (dupes?.length ?? 0) > 0;
      const existingOwner = dupes?.[0]?.assigned_to ?? null;

      let assignedTo = payload.assignedTo ?? null;
      if (!assignedTo && payload.source !== 'sales_direct') {
        const { data: agents } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'agent_cc')
          .eq('is_active', true);

        if (agents && agents.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const loads = await Promise.all(
            agents.map(async (a) => {
              const { count } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_to', a.id)
                .gte('created_at', today);
              return { id: a.id, count: count ?? 0 };
            })
          );
          loads.sort((a, b) => a.count - b.count);
          assignedTo = loads[0].id;
        }
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email,
          phone: cleanPhone,
          company_name: payload.companyName,
          source: payload.source,
          status: payload.source === 'sales_direct' ? 'pending_direct' : 'new_web',
          assigned_to: isDuplicate ? existingOwner : assignedTo,
          consent_timestamp: new Date().toISOString(),
          consent_text: payload.consentText,
          is_duplicate: isDuplicate,
        })
        .select()
        .single();

      if (error) throw error;
      return mapLead(data as Record<string, unknown>);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
