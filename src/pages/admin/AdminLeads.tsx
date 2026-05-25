import React, { useState } from 'react';
import { useLeads, useUpdateLeadStatus } from '@/hooks/useLeads';
import {
  StatusBadge, SourceBadge, RoleBadge, DuplicateBadge,
  Table, Th, Td, Button, Card,
} from '@/components/ui';
import { QuickAddLeadForm } from '@/components/QuickAddLeadForm';
import { formatDate } from '@/lib/utils';
import { Filter, Loader2, Plus, TrendingUp } from 'lucide-react';
import type { LeadStatus, LeadSource } from '@/types';

export function AdminLeads() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data: leads = [], isLoading } = useLeads(
    statusFilter !== 'all' || sourceFilter !== 'all'
      ? {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          source: sourceFilter !== 'all' ? sourceFilter : undefined,
        }
      : undefined
  );

  const filtered = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.firstName.toLowerCase().includes(q) ||
      l.lastName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.companyName.toLowerCase().includes(q) ||
      l.phone.includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Leady
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">Wszystkie kontakty w systemie</p>
        </div>
        <QuickAddLeadForm />
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <input
          className="text-sm border border-input rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
          placeholder="Szukaj po imieniu, emailu, firmie..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="text-sm border border-input rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as LeadStatus | 'all')}
        >
          <option value="all">Wszystkie statusy</option>
          <option value="new_web">Nowy (WWW)</option>
          <option value="pending_cc">W kolejce CC</option>
          <option value="pending_direct">Handlowiec</option>
          <option value="approved">Zatwierdzony</option>
          <option value="rejected">Reklamacja</option>
        </select>
        <select
          className="text-sm border border-input rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value as LeadSource | 'all')}
        >
          <option value="all">Wszystkie źródła</option>
          <option value="web">Formularz WWW</option>
          <option value="call_center">Call Center</option>
          <option value="sales_direct">Sprzedaż Bezpośrednia</option>
        </select>
        <span className="ml-auto text-sm text-muted-foreground font-mono">{filtered.length} rekordów</span>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Kontakt</Th>
              <Th>Firma</Th>
              <Th>Źródło</Th>
              <Th>Status</Th>
              <Th>Opiekun</Th>
              <Th>Dodano</Th>
              <Th>Flagi</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                <Td>
                  <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{lead.email}</p>
                  <p className="text-xs text-muted-foreground font-mono">{lead.phone}</p>
                </Td>
                <Td><span className="text-sm">{lead.companyName}</span></Td>
                <Td><SourceBadge source={lead.source} /></Td>
                <Td><StatusBadge status={lead.status} /></Td>
                <Td>
                  {lead.assignedProfile ? (
                    <div>
                      <p className="text-xs font-medium">{lead.assignedProfile.fullName}</p>
                      <RoleBadge role={lead.assignedProfile.role} />
                    </div>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </Td>
                <Td><span className="text-xs text-muted-foreground font-mono">{formatDate(lead.createdAt)}</span></Td>
                <Td>{lead.isDuplicate && <DuplicateBadge />}</Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  Brak leadów spełniających kryteria
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
