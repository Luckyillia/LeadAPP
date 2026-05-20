import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mapRejection } from '@/lib/mappers';
import type { RejectionStatus } from '@/types';

export function useRejections() {
  return useQuery({
    queryKey: ['rejections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rejections')
        .select('*, leads(id, first_name, last_name, company_name, email, phone, source, status, assigned_to, buyer_id, consent_timestamp, consent_text, is_duplicate, created_at, updated_at)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => mapRejection(r as Record<string, unknown>));
    },
  });
}

export function useBuyerRejections(buyerId: string) {
  return useQuery({
    queryKey: ['rejections', 'buyer', buyerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rejections')
        .select('*')
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => mapRejection(r as Record<string, unknown>));
    },
    enabled: !!buyerId,
  });
}

export function useAddRejection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { leadId: string; buyerId: string; reason: string }) => {
      const { data: lead, error: leadErr } = await supabase
        .from('leads')
        .select('created_at, status, buyer_id')
        .eq('id', payload.leadId)
        .single();

      if (leadErr) throw new Error('Lead nie znaleziony.');
      if (lead.buyer_id !== payload.buyerId) throw new Error('Brak dostępu do tego leada.');
      if (lead.status !== 'approved') throw new Error('Reklamować można tylko zatwierdzone leady.');

      const hoursAgo = (Date.now() - new Date(lead.created_at).getTime()) / 3_600_000;
      if (hoursAgo > 48) throw new Error('Czas na reklamację minął (limit 48h).');

      const { error: rejErr } = await supabase
        .from('rejections')
        .insert({ lead_id: payload.leadId, buyer_id: payload.buyerId, reason: payload.reason });
      if (rejErr) throw rejErr;

      const { error: updateErr } = await supabase
        .from('leads')
        .update({ status: 'rejected' })
        .eq('id', payload.leadId);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rejections'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateRejectionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RejectionStatus }) => {
      const { error } = await supabase.from('rejections').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rejections'] }),
  });
}
