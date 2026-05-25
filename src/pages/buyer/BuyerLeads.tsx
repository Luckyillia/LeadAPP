import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBuyerLeads } from '@/hooks/useLeads';
import { useBuyerRejections, useAddRejection } from '@/hooks/useRejections';
import { StatusBadge, Table, Th, Td, Card } from '@/components/ui';
import { RejectionModal } from '@/components/RejectionModal';
import { formatDate, maskEmail, maskPhone, hoursAgo } from '@/lib/utils';
import { ShoppingBag, Eye, Lock, Loader2 } from 'lucide-react';

export function BuyerLeads() {
  const { user } = useAuthStore();
  const { data: leads = [], isLoading } = useBuyerLeads(user?.id ?? '');
  const { data: rejections = [] } = useBuyerRejections(user?.id ?? '');
  const addRejection = useAddRejection();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const rejectedIds = new Set(rejections.map(r => r.leadId));

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRejection = async (leadId: string, reason: string) => {
    if (!user) return;
    await addRejection.mutateAsync({ leadId, buyerId: user.id, reason });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-violet-500" />
          Moje Kontakty
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Wszystkie zatwierdzone leady ({leads.length})
        </p>
      </div>

      {leads.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Brak zatwierdzonych kontaktów.</p>
        </Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Kontakt</Th>
              <Th>Firma</Th>
              <Th>Dane kontaktowe</Th>
              <Th>Status</Th>
              <Th>Dostarczone</Th>
              <Th>Czas na rekl.</Th>
              <Th>Reklamacja</Th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => {
              const isRevealed = revealed.has(lead.id);
              const isRejected = rejectedIds.has(lead.id);
              const hours = hoursAgo(lead.createdAt);
              const expired = hours > 48;
              const remainingH = Math.max(0, 48 - hours).toFixed(0);

              return (
                <tr key={lead.id} className={`hover:bg-muted/30 transition-colors ${isRejected ? 'opacity-50' : ''}`}>
                  <Td>
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    {isRejected && <span className="text-xs text-red-600 font-mono">⚠ Reklamacja</span>}
                  </Td>
                  <Td><span className="text-sm">{lead.companyName}</span></Td>
                  <Td>
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono">{isRevealed ? lead.email : maskEmail(lead.email)}</div>
                      <div className="text-xs font-mono">{isRevealed ? lead.phone : maskPhone(lead.phone)}</div>
                      <button
                        onClick={() => toggleReveal(lead.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {isRevealed ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {isRevealed ? 'Ukryj' : 'Pokaż dane'}
                      </button>
                    </div>
                  </Td>
                  <Td><StatusBadge status={isRejected ? 'rejected' : lead.status} /></Td>
                  <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(lead.createdAt)}</span></Td>
                  <Td>
                    {!expired && !isRejected
                      ? <span className="text-xs text-amber-600 font-mono font-semibold">{remainingH}h</span>
                      : <span className="text-xs text-muted-foreground font-mono">—</span>
                    }
                  </Td>
                  <Td>
                    {isRejected ? (
                      <span className="text-xs text-red-500 font-mono">Złożona</span>
                    ) : (
                      <RejectionModal
                        leadId={lead.id}
                        buyerId={user?.id ?? ''}
                        leadCreatedAt={lead.createdAt}
                        leadName={`${lead.firstName} ${lead.lastName}`}
                        onSuccess={reason => handleRejection(lead.id, reason)}
                      />
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
