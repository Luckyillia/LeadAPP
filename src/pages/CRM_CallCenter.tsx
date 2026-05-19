import React, { useState } from 'react';
import { MOCK_LEADS, MOCK_PROFILES } from '@/lib/data';
import { useAuthStore } from '@/store/useAuthStore';
import {
  PageHeader, StatCard, Card, StatusBadge, DuplicateBadge,
  Table, Th, Td, Button,
} from '@/components/ui';
import { QuickAddLeadForm } from '@/components/QuickAddLeadForm';
import { formatDate } from '@/lib/utils';
import { Phone, PhoneCall, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { LeadStatus } from '@/types';

export function CRM_CallCenter() {
  const { user } = useAuthStore();
  const [calledLeads, setCalledLeads] = useState<Set<string>>(new Set());

  // CC sees only leads assigned to them
  const myLeads = MOCK_LEADS.filter(l =>
    l.assignedTo === user?.id ||
    (user?.role === 'admin') // admin sees all in preview
  );

  const queue = myLeads.filter(l => ['new_web', 'pending_cc'].includes(l.status));
  const done = myLeads.filter(l => ['approved', 'rejected'].includes(l.status));

  const markCalled = (id: string) => setCalledLeads(prev => new Set([...prev, id]));

  const stats = {
    queue: queue.length,
    called: calledLeads.size,
    approved: myLeads.filter(l => l.status === 'approved').length,
    duplicates: myLeads.filter(l => l.isDuplicate).length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="CRM — Call Center" subtitle={`Zalogowany jako: ${user?.fullName}`}>
        <QuickAddLeadForm />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="W kolejce" value={stats.queue} accent="text-blue-600" />
        <StatCard label="Wybrane dziś" value={stats.called} accent="text-emerald-600" />
        <StatCard label="Zatwierdzone" value={stats.approved} accent="text-emerald-600" />
        <StatCard label="Duplikaty" value={stats.duplicates} accent="text-amber-500" />
      </div>

      {/* Queue */}
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" />
        Kolejka do Kontaktu ({queue.length})
      </h2>

      {queue.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
          <p className="font-medium">Kolejka pusta — wszystkie leady obsłużone!</p>
        </Card>
      ) : (
        <Table className="mb-6">
          <thead>
            <tr>
              <Th>Kontakt</Th>
              <Th>Firma</Th>
              <Th>Telefon</Th>
              <Th>Status</Th>
              <Th>Dodano</Th>
              <Th>Akcje</Th>
            </tr>
          </thead>
          <tbody>
            {queue.map(lead => (
              <tr key={lead.id} className={`hover:bg-muted/30 transition-colors ${
                lead.isDuplicate ? 'bg-amber-50/50' : ''
              }`}>
                <Td>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{lead.email}</p>
                    </div>
                    {lead.isDuplicate && <DuplicateBadge />}
                  </div>
                </Td>
                <Td><span className="text-sm">{lead.companyName}</span></Td>
                <Td>
                  <span className="font-mono text-sm font-medium text-primary">
                    {lead.phone}
                  </span>
                </Td>
                <Td><StatusBadge status={lead.status} /></Td>
                <Td>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {calledLeads.has(lead.id) ? (
                      <Button size="sm" variant="ghost" className="text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" /> Wybrano
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => markCalled(lead.id)}>
                        <Phone className="w-3.5 h-3.5" /> Wybierz
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50">
                      <XCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Obsłużone ({done.length})
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Kontakt</Th>
                <Th>Firma</Th>
                <Th>Status końcowy</Th>
                <Th>Zaktualizowano</Th>
              </tr>
            </thead>
            <tbody>
              {done.map(lead => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors opacity-70">
                  <Td>
                    <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{lead.email}</p>
                  </Td>
                  <Td><span className="text-sm">{lead.companyName}</span></Td>
                  <Td><StatusBadge status={lead.status} /></Td>
                  <Td>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatDate(lead.updatedAt)}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}
