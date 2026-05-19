import React, { useState } from 'react';
import { MOCK_LEADS, MOCK_PROFILES, MOCK_REJECTIONS } from '@/lib/data';
import {
  PageHeader, StatCard, Card, StatusBadge, RoleBadge, SourceBadge,
  DuplicateBadge, Table, Th, Td, Button,
} from '@/components/ui';
import { QuickAddLeadForm } from '@/components/QuickAddLeadForm';
import { formatDate } from '@/lib/utils';
import {
  TrendingUp, Users, AlertCircle, Copy, CheckCircle2, Clock, Filter,
} from 'lucide-react';
import type { LeadStatus, LeadSource } from '@/types';

export function DashboardAdmin() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');

  const leads = MOCK_LEADS.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
    return true;
  });

  const stats = {
    total: MOCK_LEADS.length,
    approved: MOCK_LEADS.filter(l => l.status === 'approved').length,
    duplicates: MOCK_LEADS.filter(l => l.isDuplicate).length,
    rejections: MOCK_REJECTIONS.length,
    agents: MOCK_PROFILES.filter(p => p.role === 'agent_cc' && p.isActive).length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Dashboard Administratora" subtitle="Pełen przegląd operacji agencji">
        <QuickAddLeadForm />
      </PageHeader>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Wszystkie Leady" value={stats.total} sub="łącznie w systemie" />
        <StatCard label="Zatwierdzone" value={stats.approved} accent="text-emerald-600"
          sub={`${Math.round(stats.approved / stats.total * 100)}% konwersja`} />
        <StatCard label="Duplikaty" value={stats.duplicates} accent="text-amber-500"
          sub="wykryte przez silnik" />
        <StatCard label="Reklamacje" value={stats.rejections} accent="text-red-500"
          sub="do rozpatrzenia" />
        <StatCard label="Aktywni Agenci CC" value={stats.agents} accent="text-blue-600"
          sub="dostępni w kolejce" />
      </div>

      {/* Source breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['web', 'call_center', 'sales_direct'] as LeadSource[]).map(src => {
          const count = MOCK_LEADS.filter(l => l.source === src).length;
          return (
            <Card key={src} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {src === 'web' ? <TrendingUp className="w-5 h-5 text-primary" /> :
                 src === 'call_center' ? <Clock className="w-5 h-5 text-primary" /> :
                 <Users className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <p className="text-lg font-bold">{count}</p>
                <SourceBadge source={src} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtry:</span>
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
        <span className="ml-auto text-sm text-muted-foreground font-mono">{leads.length} rekordów</span>
      </Card>

      {/* Leads Table */}
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
          {leads.map(lead => {
            const profile = MOCK_PROFILES.find(p => p.id === lead.assignedTo);
            return (
              <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                <Td>
                  <div>
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{lead.email}</p>
                    <p className="text-xs text-muted-foreground font-mono">{lead.phone}</p>
                  </div>
                </Td>
                <Td><span className="text-sm">{lead.companyName}</span></Td>
                <Td><SourceBadge source={lead.source} /></Td>
                <Td><StatusBadge status={lead.status} /></Td>
                <Td>
                  {profile ? (
                    <div>
                      <p className="text-xs font-medium">{profile.fullName}</p>
                      <RoleBadge role={profile.role} />
                    </div>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </Td>
                <Td>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDate(lead.createdAt)}
                  </span>
                </Td>
                <Td>
                  {lead.isDuplicate && <DuplicateBadge />}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Rejections panel */}
      {MOCK_REJECTIONS.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Reklamacje do Rozpatrzenia
          </h2>
          <Table>
            <thead>
              <tr>
                <Th>Lead</Th>
                <Th>Kupujący</Th>
                <Th>Powód</Th>
                <Th>Status</Th>
                <Th>Data zgłoszenia</Th>
                <Th>Akcje</Th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REJECTIONS.map(rej => {
                const lead = MOCK_LEADS.find(l => l.id === rej.leadId);
                const buyer = MOCK_PROFILES.find(p => p.id === rej.buyerId);
                return (
                  <tr key={rej.id} className="hover:bg-muted/30 transition-colors">
                    <Td>
                      <p className="font-medium text-sm">{lead?.firstName} {lead?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{lead?.companyName}</p>
                    </Td>
                    <Td><span className="text-sm">{buyer?.fullName}</span></Td>
                    <Td><p className="text-sm max-w-xs truncate">{rej.reason}</p></Td>
                    <Td>
                      <span className={`status-badge ${
                        rej.status === 'pending' ? 'status-pending_cc' :
                        rej.status === 'accepted' ? 'status-approved' : 'status-rejected'
                      }`}>
                        {rej.status === 'pending' ? 'Oczekuje' : rej.status === 'accepted' ? 'Przyjęta' : 'Odrzucona'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatDate(rej.createdAt)}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Akceptuj
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                          Odrzuć
                        </Button>
                      </div>
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
