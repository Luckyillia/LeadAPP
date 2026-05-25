import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyLeadsSales } from '@/hooks/useLeads';
import { Table, Th, Td, StatusBadge, SourceBadge, DuplicateBadge, Card } from '@/components/ui';
import { QuickAddLeadForm } from '@/components/QuickAddLeadForm';
import { formatDate } from '@/lib/utils';
import { Users, Loader2, Search } from 'lucide-react';

const PIPELINE_STAGES = ['Kontakt', 'Prezentacja', 'Oferta', 'Negocjacje', 'Zamknięte'];

export function HandlowiecKontakty() {
  const { user } = useAuthStore();
  const { data: leads = [], isLoading } = useMyLeadsSales(user?.id ?? '');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pipelineStage, setPipelineStage] = useState<Record<string, number>>({});

  const filtered = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.firstName.toLowerCase().includes(q) ||
      l.lastName.toLowerCase().includes(q) ||
      l.companyName.toLowerCase().includes(q) ||
      l.phone.includes(q)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Moje Kontakty
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Pełna lista przypisanych leadów ({leads.length})
          </p>
        </div>
        <QuickAddLeadForm />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Szukaj kontaktu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Brak kontaktów.</p>
        </Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Kontakt</Th>
              <Th>Firma</Th>
              <Th>Źródło</Th>
              <Th>Status</Th>
              <Th>Etap pipeline</Th>
              <Th>Notatka</Th>
              <Th>Dodano</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
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
                  <select
                    className="text-xs border border-input rounded px-2 py-1 bg-white"
                    value={pipelineStage[lead.id] ?? 0}
                    onChange={e => setPipelineStage(prev => ({ ...prev, [lead.id]: Number(e.target.value) }))}
                  >
                    {PIPELINE_STAGES.map((s, i) => (
                      <option key={s} value={i}>{s}</option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <input
                    className="w-full text-xs border border-input rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Dodaj notatkę..."
                    value={notes[lead.id] ?? ''}
                    onChange={e => setNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                  />
                </Td>
                <Td>
                  <span className="text-xs font-mono text-muted-foreground">{formatDate(lead.createdAt)}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
