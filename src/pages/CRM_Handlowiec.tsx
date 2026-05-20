import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyLeadsSales } from '@/hooks/useLeads';
import {
  PageHeader, StatCard, Card, StatusBadge, DuplicateBadge,
  Table, Th, Td, SourceBadge,
} from '@/components/ui';
import { QuickAddLeadForm } from '@/components/QuickAddLeadForm';
import { formatDate } from '@/lib/utils';
import { Users, Briefcase, Loader2 } from 'lucide-react';

const PIPELINE_STAGES = ['Kontakt', 'Prezentacja', 'Oferta', 'Negocjacje', 'Zamknięte'];

export function CRM_Handlowiec() {
  const { user } = useAuthStore();
  const { data: leads = [], isLoading } = useMyLeadsSales(user?.id ?? '');
  const [pipelineStage, setPipelineStage] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const stats = {
    total: leads.length,
    pipeline: leads.filter((l) => l.status === 'pending_direct').length,
    approved: leads.filter((l) => l.status === 'approved').length,
    value: leads.filter((l) => l.status === 'approved').length * 850,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="CRM — Sprzedaż Bezpośrednia" subtitle={`Panel: ${user?.fullName}`}>
        <QuickAddLeadForm />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Moje Kontakty" value={stats.total} />
        <StatCard label="W Pipeline" value={stats.pipeline} accent="text-blue-600" />
        <StatCard label="Zatwierdzone" value={stats.approved} accent="text-emerald-600" />
        <StatCard label="Szac. Wartość" value={`${stats.value.toLocaleString('pl-PL')} zł`} accent="text-violet-600" />
      </div>

      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-violet-500" />
        Pipeline Sprzedażowy
      </h2>
      <div className="grid grid-cols-5 gap-3 mb-6">
        {PIPELINE_STAGES.map((stage, i) => {
          const stageLeads = leads.filter((l) => (pipelineStage[l.id] ?? 0) === i);
          return (
            <div key={stage} className="bg-muted/50 rounded-xl p-3 border border-border min-h-[120px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">{stage}</span>
                <span className="text-xs bg-white border border-border rounded-full px-1.5 py-0.5 font-mono">
                  {stageLeads.length}
                </span>
              </div>
              {stageLeads.map((l) => (
                <div key={l.id} className="bg-white rounded-lg border border-border p-2 mb-2 text-xs shadow-sm">
                  <p className="font-semibold truncate">{l.firstName} {l.lastName}</p>
                  <p className="text-muted-foreground truncate">{l.companyName}</p>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <button
                      onClick={() => setPipelineStage((prev) => ({ ...prev, [l.id]: i + 1 }))}
                      className="mt-1 text-primary hover:underline text-xs"
                    >
                      → Dalej
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-500" />
        Moje Kontakty ({leads.length})
      </h2>
      <Table>
        <thead>
          <tr>
            <Th>Kontakt</Th><Th>Firma</Th><Th>Źródło</Th><Th>Status</Th>
            <Th>Notatka</Th><Th>Dodano</Th><Th>Etap</Th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
              <Td>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{lead.phone}</p>
                  </div>
                  {lead.isDuplicate && <DuplicateBadge />}
                </div>
              </Td>
              <Td><span className="text-sm">{lead.companyName}</span></Td>
              <Td><SourceBadge source={lead.source} /></Td>
              <Td><StatusBadge status={lead.status} /></Td>
              <Td>
                <input
                  className="w-full text-xs border border-input rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Dodaj notatkę..."
                  value={notes[lead.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                />
              </Td>
              <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(lead.createdAt)}</span></Td>
              <Td>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                  {PIPELINE_STAGES[pipelineStage[lead.id] ?? 0]}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
