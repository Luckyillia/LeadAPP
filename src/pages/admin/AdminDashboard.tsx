import React from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useRejections } from '@/hooks/useRejections';
import { useProfiles } from '@/hooks/useProfiles';
import { StatCard } from '@/components/ui';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Users, Zap } from 'lucide-react';

/* ── Mini bar chart ─────────────────────────────────────────────────────── */
function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map(d => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[10px] text-muted-foreground tabular-nums">{d.value}</span>
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${(d.value / max) * 72}px`, background: color, minHeight: d.value > 0 ? 4 : 0 }}
          />
          <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Donut chart ────────────────────────────────────────────────────────── */
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const r = 36;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-5">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
        {segments.map(seg => {
          const dash = (seg.value / total) * circ;
          const gap  = circ - dash;
          const rot  = (offset / total) * 360 - 90;
          offset += seg.value;
          return (
            <circle key={seg.label} cx="45" cy="45" r={r}
              fill="none" stroke={seg.color} strokeWidth="10"
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rot} 45 45)`}
              strokeLinecap="round"
            />
          );
        })}
        <text x="45" y="50" textAnchor="middle" style={{ fontSize: 14, fontWeight: 600, fill: 'hsl(var(--foreground))' }}>
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-semibold ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────────────── */
export function AdminDashboard() {
  const { data: leads      = [] } = useLeads();
  const { data: rejections = [] } = useRejections();
  const { data: profiles   = [] } = useProfiles();

  const stats = {
    total:            leads.length,
    approved:         leads.filter(l => l.status === 'approved').length,
    pending:          leads.filter(l => ['new_web', 'pending_cc', 'pending_direct'].includes(l.status)).length,
    rejected:         leads.filter(l => l.status === 'rejected').length,
    duplicates:       leads.filter(l => l.isDuplicate).length,
    rejectionsPending: rejections.filter(r => r.status === 'pending').length,
    activeAgents:     profiles.filter(p => p.role === 'agent_cc' && p.isActive).length,
  };

  const bySource = [
    { label: 'WWW',    value: leads.filter(l => l.source === 'web').length },
    { label: 'CC',     value: leads.filter(l => l.source === 'call_center').length },
    { label: 'Direct', value: leads.filter(l => l.source === 'sales_direct').length },
  ];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    return {
      label: d.toLocaleDateString('pl-PL', { weekday: 'short' }),
      value: leads.filter(l => l.createdAt.startsWith(dayStr)).length,
    };
  });

  const statusSegments = [
    { label: 'Zatwierdzone', value: stats.approved, color: '#10b981' },
    { label: 'W kolejce',    value: stats.pending,  color: '#3b82f6' },
    { label: 'Odrzucone',    value: stats.rejected,  color: '#ef4444' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
          <Zap className="w-4 h-4 text-background" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Przegląd operacyjny agencji</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Wszystkie leady" value={stats.total} />
        <StatCard label="Zatwierdzone"    value={stats.approved} accent="text-emerald-600"
          sub={stats.total ? `${Math.round(stats.approved / stats.total * 100)}% konwersja` : '—'} />
        <StatCard label="W kolejce"       value={stats.pending}           accent="text-blue-600" />
        <StatCard label="Reklamacje"      value={stats.rejectionsPending} accent="text-red-500" sub="oczekują" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 lg:col-span-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Aktywność — ostatnie 7 dni
          </p>
          <MiniBarChart data={last7} color="hsl(var(--foreground))" />
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Rozkład statusów
          </p>
          <DonutChart segments={statusSegments} />
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Leady wg źródła
          </p>
          <MiniBarChart data={bySource} color="#6366f1" />
        </div>

        <div className="bg-white rounded-xl border border-border p-5 lg:col-span-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Stan systemu
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users,         label: 'Aktywni agenci CC',  value: stats.activeAgents,     color: 'text-blue-600',    bg: 'bg-blue-50    border-blue-100' },
              { icon: AlertTriangle, label: 'Duplikaty wykryte',  value: stats.duplicates,        color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-100' },
              { icon: CheckCircle2,  label: 'Konwersja',          value: `${stats.total ? Math.round(stats.approved / stats.total * 100) : 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              { icon: Clock,         label: 'Reklamacje otwarte', value: stats.rejectionsPending, color: 'text-red-600',     bg: 'bg-red-50     border-red-100' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`rounded-xl border p-4 flex items-center gap-3 ${bg}`}>
                <Icon className={`w-4 h-4 ${color} shrink-0`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-semibold ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-medium">Ostatnio dodane leady</p>
          <span className="text-xs text-muted-foreground">→ pełna lista w zakładce Leady</span>
        </div>
        <div className="divide-y divide-border">
          {leads.slice(0, 4).map(lead => (
            <div key={lead.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-xs text-muted-foreground">{lead.companyName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                  lead.status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' :
                  lead.status === 'rejected' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' :
                  'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                }`}>
                  {lead.status === 'approved' ? 'Zatw.' : lead.status === 'rejected' ? 'Rekl.' : 'Kolejka'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>
          ))}
          {leads.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Brak leadów</p>
          )}
        </div>
      </div>
    </div>
  );
}