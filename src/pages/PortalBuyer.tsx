import React, { useState } from 'react';
import { MOCK_LEADS, MOCK_REJECTIONS } from '@/lib/data';
import { useAuthStore } from '@/store/useAuthStore';
import {
  PageHeader, StatCard, Card, StatusBadge,
  Table, Th, Td, Button,
} from '@/components/ui';
import { RejectionModal } from '@/components/RejectionModal';
import { formatDate, maskEmail, maskPhone, hoursAgo } from '@/lib/utils';
import {
  ShoppingBag, CheckCircle, AlertTriangle, Clock, Lock, Eye,
} from 'lucide-react';

export function PortalBuyer() {
  const { user } = useAuthStore();
  const [rejections, setRejections] = useState(MOCK_REJECTIONS);
  const [revealedLeads, setRevealedLeads] = useState<Set<string>>(new Set());

  // Buyer sees only approved leads assigned to them
  const myLeads = MOCK_LEADS.filter(l =>
    l.status === 'approved' &&
    (l.buyerId === user?.id || user?.role === 'admin')
  );

  const rejectedIds = new Set(rejections.map(r => r.leadId));

  const stats = {
    received: myLeads.length,
    available: myLeads.filter(l => !rejectedIds.has(l.id)).length,
    rejected: rejections.length,
    pending: rejections.filter(r => r.status === 'pending').length,
  };

  const handleRejectionSuccess = (leadId: string) => {
    setRejections(prev => [...prev, {
      id: `rej-${Date.now()}`, leadId, buyerId: user?.id ?? '',
      reason: '...', status: 'pending', createdAt: new Date().toISOString(),
    }]);
  };

  const toggleReveal = (id: string) => {
    setRevealedLeads(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Portal Kupującego"
        subtitle={`Witaj, ${user?.fullName} — Twoje zatwierdzone kontakty B2B`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Dostarczone" value={stats.received} />
        <StatCard label="Dostępne" value={stats.available} accent="text-emerald-600" />
        <StatCard label="Reklamacje" value={stats.rejected} accent="text-red-500" />
        <StatCard label="Oczekuje" value={stats.pending} accent="text-amber-500" />
      </div>

      {/* 48h info */}
      <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Limit reklamacyjny: 48 godzin</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Reklamacje można składać wyłącznie przez 48h od momentu dostarczenia leada.
              Po upływie tego czasu dane są blokowane do rozliczeń i faktura staje się wiążąca.
            </p>
          </div>
        </div>
      </Card>

      {/* Leads feed */}
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-violet-500" />
        Twoje Kontakty ({myLeads.length})
      </h2>

      {myLeads.length === 0 ? (
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
              <Th>Dane Kontaktowe</Th>
              <Th>Status</Th>
              <Th>Czas</Th>
              <Th>Reklamacja</Th>
            </tr>
          </thead>
          <tbody>
            {myLeads.map(lead => {
              const revealed = revealedLeads.has(lead.id);
              const isRejected = rejectedIds.has(lead.id);
              const hours = hoursAgo(lead.createdAt);
              const expired = hours > 48;
              const remainingH = Math.max(0, 48 - hours).toFixed(0);

              return (
                <tr key={lead.id} className={`hover:bg-muted/30 transition-colors ${
                  isRejected ? 'opacity-50' : ''
                }`}>
                  <Td>
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    {isRejected && (
                      <span className="text-xs text-red-600 font-mono">⚠ Reklamacja złożona</span>
                    )}
                  </Td>
                  <Td><span className="text-sm">{lead.companyName}</span></Td>
                  <Td>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {revealed ? (
                          <span className="text-xs font-mono text-foreground">{lead.email}</span>
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground">{maskEmail(lead.email)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {revealed ? (
                          <span className="text-xs font-mono text-foreground">{lead.phone}</span>
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground">{maskPhone(lead.phone)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleReveal(lead.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {revealed ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {revealed ? 'Ukryj' : 'Pokaż dane'}
                      </button>
                    </div>
                  </Td>
                  <Td>
                    <StatusBadge status={isRejected ? 'rejected' : lead.status} />
                  </Td>
                  <Td>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">{formatDate(lead.createdAt)}</p>
                      {!expired && !isRejected && (
                        <p className="text-xs text-amber-600 font-mono">{remainingH}h na reklamację</p>
                      )}
                      {expired && (
                        <p className="text-xs text-muted-foreground font-mono">Termin minął</p>
                      )}
                    </div>
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
                        onSuccess={() => handleRejectionSuccess(lead.id)}
                      />
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Rejections history */}
      {rejections.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Historia Reklamacji
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Lead</Th>
                <Th>Powód</Th>
                <Th>Status</Th>
                <Th>Data</Th>
              </tr>
            </thead>
            <tbody>
              {rejections.map(rej => {
                const lead = MOCK_LEADS.find(l => l.id === rej.leadId);
                return (
                  <tr key={rej.id} className="hover:bg-muted/30 transition-colors">
                    <Td>
                      <p className="font-medium text-sm">{lead?.firstName} {lead?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{lead?.companyName}</p>
                    </Td>
                    <Td><p className="text-sm max-w-xs">{rej.reason}</p></Td>
                    <Td>
                      <span className={`status-badge ${
                        rej.status === 'pending' ? 'status-pending_cc' :
                        rej.status === 'accepted' ? 'status-approved' : 'status-rejected'
                      }`}>
                        {rej.status === 'pending' ? 'Oczekuje' :
                         rej.status === 'accepted' ? 'Przyjęta' : 'Odrzucona'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatDate(rej.createdAt)}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
