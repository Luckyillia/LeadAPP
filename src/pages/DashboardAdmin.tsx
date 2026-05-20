import React, { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useRejections, useUpdateRejectionStatus } from '@/hooks/useRejections';
import { useProfiles, useCreateUser, useUpdateProfile } from '@/hooks/useProfiles';
import {
  PageHeader, StatCard, Card, StatusBadge, RoleBadge, SourceBadge,
  DuplicateBadge, Table, Th, Td, Button, Modal, Input, Label, Select,
} from '@/components/ui';
import { QuickAddLeadForm } from '@/components/QuickAddLeadForm';
import { formatDate } from '@/lib/utils';
import {
  TrendingUp, Users, AlertCircle, CheckCircle2, Clock, Filter,
  UserPlus, Loader2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import type { LeadStatus, LeadSource, UserRole } from '@/types';
import { ROLE_LABELS, SOURCE_LABELS } from '@/types';

export function DashboardAdmin() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [tab, setTab] = useState<'leads' | 'rejections' | 'users'>('leads');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'agent_cc' as UserRole });
  const [userFormErr, setUserFormErr] = useState('');

  const { data: leads = [], isLoading: leadsLoading } = useLeads(
    statusFilter !== 'all' || sourceFilter !== 'all'
      ? { status: statusFilter !== 'all' ? statusFilter : undefined, source: sourceFilter !== 'all' ? sourceFilter : undefined }
      : undefined
  );
  const { data: rejections = [], isLoading: rejLoading } = useRejections();
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();

  const updateRejection = useUpdateRejectionStatus();
  const createUser = useCreateUser();
  const updateProfile = useUpdateProfile();

  const stats = {
    total: leads.length,
    approved: leads.filter((l) => l.status === 'approved').length,
    duplicates: leads.filter((l) => l.isDuplicate).length,
    rejections: rejections.filter((r) => r.status === 'pending').length,
    agents: profiles.filter((p) => p.role === 'agent_cc' && p.isActive).length,
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormErr('');
    if (newUser.password.length < 8) { setUserFormErr('Hasło min. 8 znaków.'); return; }
    try {
      await createUser.mutateAsync(newUser);
      setAddUserOpen(false);
      setNewUser({ email: '', password: '', fullName: '', role: 'agent_cc' });
    } catch (err: unknown) {
      setUserFormErr(err instanceof Error ? err.message : 'Błąd tworzenia użytkownika');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Dashboard Administratora" subtitle="Pełen przegląd operacji agencji">
        <QuickAddLeadForm />
      </PageHeader>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Wszystkie Leady" value={stats.total} sub="łącznie w systemie" />
        <StatCard label="Zatwierdzone" value={stats.approved} accent="text-emerald-600"
          sub={stats.total ? `${Math.round(stats.approved / stats.total * 100)}% konwersja` : '—'} />
        <StatCard label="Duplikaty" value={stats.duplicates} accent="text-amber-500" sub="wykryte" />
        <StatCard label="Reklamacje" value={stats.rejections} accent="text-red-500" sub="oczekuje" />
        <StatCard label="Agenci CC" value={stats.agents} accent="text-blue-600" sub="aktywni" />
      </div>

      {/* Source breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['web', 'call_center', 'sales_direct'] as LeadSource[]).map((src) => {
          const count = leads.filter((l) => l.source === src).length;
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

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-muted/50 rounded-xl p-1 w-fit">
        {[
          { key: 'leads', label: `Leady (${leads.length})` },
          { key: 'rejections', label: `Reklamacje (${rejections.length})` },
          { key: 'users', label: `Użytkownicy (${profiles.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Leads tab ── */}
      {tab === 'leads' && (
        <>
          <Card className="p-4 mb-4 flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtry:</span>
            <select
              className="text-sm border border-input rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
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
              onChange={(e) => setSourceFilter(e.target.value as LeadSource | 'all')}
            >
              <option value="all">Wszystkie źródła</option>
              <option value="web">Formularz WWW</option>
              <option value="call_center">Call Center</option>
              <option value="sales_direct">Sprzedaż Bezpośrednia</option>
            </select>
            <span className="ml-auto text-sm text-muted-foreground font-mono">{leads.length} rekordów</span>
          </Card>

          {leadsLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Kontakt</Th><Th>Firma</Th><Th>Źródło</Th><Th>Status</Th>
                  <Th>Opiekun</Th><Th>Dodano</Th><Th>Flagi</Th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
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
              </tbody>
            </Table>
          )}
        </>
      )}

      {/* ── Rejections tab ── */}
      {tab === 'rejections' && (
        rejLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : rejections.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
            <p>Brak reklamacji do rozpatrzenia.</p>
          </Card>
        ) : (
          <Table>
            <thead>
              <tr><Th>Lead</Th><Th>Kupujący</Th><Th>Powód</Th><Th>Status</Th><Th>Data</Th><Th>Akcje</Th></tr>
            </thead>
            <tbody>
              {rejections.map((rej) => (
                <tr key={rej.id} className="hover:bg-muted/30 transition-colors">
                  <Td>
                    <p className="font-medium text-sm">{rej.lead?.firstName} {rej.lead?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{rej.lead?.companyName}</p>
                  </Td>
                  <Td>
                    <p className="text-sm">{profiles.find((p) => p.id === rej.buyerId)?.fullName ?? '—'}</p>
                  </Td>
                  <Td><p className="text-sm max-w-xs">{rej.reason}</p></Td>
                  <Td>
                    <span className={`status-badge ${
                      rej.status === 'pending' ? 'status-pending_cc' :
                      rej.status === 'accepted' ? 'status-approved' : 'status-rejected'
                    }`}>
                      {rej.status === 'pending' ? 'Oczekuje' : rej.status === 'accepted' ? 'Przyjęta' : 'Odrzucona'}
                    </span>
                  </Td>
                  <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(rej.createdAt)}</span></Td>
                  <Td>
                    {rej.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50"
                          onClick={() => updateRejection.mutate({ id: rej.id, status: 'accepted' })}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Akceptuj
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50"
                          onClick={() => updateRejection.mutate({ id: rej.id, status: 'declined' })}>
                          Odrzuć
                        </Button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}

      {/* ── Users tab ── */}
      {tab === 'users' && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setAddUserOpen(true)}>
              <UserPlus className="w-4 h-4" /> Dodaj użytkownika
            </Button>
          </div>
          {profilesLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <thead>
                <tr><Th>Użytkownik</Th><Th>Email</Th><Th>Rola</Th><Th>Status</Th><Th>Dołączył</Th><Th>Akcje</Th></tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {p.fullName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-sm">{p.fullName}</span>
                      </div>
                    </Td>
                    <Td><span className="text-sm font-mono">{p.email}</span></Td>
                    <Td>
                      <select
                        className="text-xs border border-input rounded px-2 py-1 bg-white"
                        value={p.role}
                        onChange={(e) => updateProfile.mutate({ id: p.id, role: e.target.value as UserRole })}
                      >
                        {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </Td>
                    <Td>
                      <span className={`text-xs font-mono font-semibold ${p.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {p.isActive ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </Td>
                    <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(p.createdAt)}</span></Td>
                    <Td>
                      <button
                        onClick={() => updateProfile.mutate({ id: p.id, isActive: !p.isActive })}
                        className={`text-xs flex items-center gap-1 transition-colors ${p.isActive ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-800'}`}
                      >
                        {p.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {p.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      {/* Add User Modal */}
      <Modal open={addUserOpen} onClose={() => { setAddUserOpen(false); setUserFormErr(''); }} title="Nowy użytkownik">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-1">
            <Label>Imię i Nazwisko</Label>
            <Input placeholder="Jan Kowalski" value={newUser.fullName}
              onChange={(e) => setNewUser((u) => ({ ...u, fullName: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" placeholder="jan@firma.pl" value={newUser.email}
              onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label>Rola</Label>
            <Select value={newUser.role} onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value as UserRole }))}>
              {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Hasło (min. 8 znaków)</Label>
            <Input type="password" placeholder="••••••••" value={newUser.password}
              onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))} required />
          </div>
          {userFormErr && <p className="text-xs text-destructive">{userFormErr}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setAddUserOpen(false)}>Anuluj</Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Tworzę...</> : 'Utwórz konto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
