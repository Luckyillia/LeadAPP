import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyLeadsCC } from '@/hooks/useLeads';
import { Table, Th, Td, StatusBadge, Card } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { CheckCircle, Loader2 } from 'lucide-react';

export function CCHistory() {
  const { user } = useAuthStore();
  const { data: leads = [], isLoading } = useMyLeadsCC(user?.id ?? '');
  const done = leads.filter(l => ['approved', 'rejected', 'pending_direct'].includes(l.status));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          Historia obsłużonych
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Leady zamknięte przez Ciebie</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : done.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Brak obsłużonych leadów.</p>
        </Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Kontakt</Th>
              <Th>Firma</Th>
              <Th>Telefon</Th>
              <Th>Status końcowy</Th>
              <Th>Zaktualizowano</Th>
            </tr>
          </thead>
          <tbody>
            {done.map(lead => (
              <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                <Td>
                  <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{lead.email}</p>
                </Td>
                <Td><span className="text-sm">{lead.companyName}</span></Td>
                <Td><span className="font-mono text-sm">{lead.phone}</span></Td>
                <Td><StatusBadge status={lead.status} /></Td>
                <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(lead.updatedAt)}</span></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
