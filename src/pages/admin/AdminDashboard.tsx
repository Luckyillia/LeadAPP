import React from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useRejections } from '@/hooks/useRejections';
import { useProfiles } from '@/hooks/useProfiles';
import { StatCard } from '@/components/ui';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Users, Zap } from 'lucide-react';

// Simple bar chart component (no external charting lib needed)
function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[9px] font-mono text-muted-foreground">{d.value}</span>
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${(d.value / max) * 72}px`, background: color, minHeight: d.value > 0 ? 4 : 0 }}
          />
          <span className="text-[9px] font-mono text-muted-foreground truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const r = 36;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        {segments.map((seg) => {
          const dash = (seg.value / total) * circ;
          const gap = circ - dash;
          const rotation = (offset / total) * 360 - 90;
          offset += seg.value;
          return (
            <circle
              key={seg.label}
              cx="45" cy="45" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotation} 45 45)`}
              strokeLinecap="round"
            />
          );
        })}
        <text x="45" y="49" textAnchor="middle" className="font-bold" style={{ fontSize: 14, fill: 'hsl(var(--foreground))' }}>
          {total}
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-muted-foreground font-mono">{seg.label}</span>
            <span className="font-bold ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { data: leads = [] } = useLeads();
  const { data: rejections = [] } = useRejections();
  const { data: profiles = [] } = useProfiles();

  const stats = {
    total: leads.length,
    approved: leads.filter(l => l.status === 'approved').length,
    pending: leads.filter(l => ['new_web', 'pending_cc', 'pending_direct'].includes(l.status)).length,
    rejected: leads.filter(l => l.status === 'rejected').length,
    duplicates: leads.filter(l => l.isDuplicate).length,
    rejectionsPending: rejections.filter(r => r.status === 'pending').length,
    activeAgents: profiles.filter(p => p.role === 'agent_cc' && p.isActive).length,
  };

  // Leads by source
  const bySource = [
    { label: 'WWW', value: leads.filter(l => l.source === 'web').length },
    { label: 'CC', value: leads.filter(l => l.source === 'call_center').length },
    { label: 'Direct', value: leads.filter(l => l.source === 'sales_direct').length },
  ];

  // Last 7 days activity (mock grouping by date)
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
    { label: 'W kolejce', value: stats.pending, color: '#3b82f6' },
    { label: 'Odrzucone', value: stats.rejected, color: '#ef4444' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground font-mono">Przegląd operacyjny agencji</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Wszystkie leady" value={stats.total} />
        <StatCard label="Zatwierdzone" value={stats.approved} accent="text-emerald-600"
          sub={stats.total ? `${Math.round(stats.approved / stats.total * 100)}% konwersja` : '—'} />
        <StatCard label="W kolejce" value={stats.pending} accent="text-blue-600" />
        <StatCard label="Reklamacje" value={stats.rejectionsPending} accent="text-red-500" sub="oczekują" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Aktywność 7 dni */}
        <div className="bg-white rounded-2xl border border-border p-5 lg:col-span-2">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-4">Aktywność — ostatnie 7 dni</p>
          <MiniBarChart data={last7} color="hsl(var(--primary))" />
        </div>

        {/* Statusy donut */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-4">Rozkład statusów</p>
          <DonutChart segments={statusSegments} />
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Źródła */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-4">Leady wg źródła</p>
          <MiniBarChart data={bySource} color="#8b5cf6" />
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl border border-border p-5 lg:col-span-2">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-4">Stan systemu</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: 'Aktywni agenci CC', value: stats.activeAgents, color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: AlertTriangle, label: 'Duplikaty wykryte', value: stats.duplicates, color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: CheckCircle2, label: 'Konwersja', value: `${stats.total ? Math.round(stats.approved / stats.total * 100) : 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Clock, label: 'Reklamacje otwarte', value: stats.rejectionsPending, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent leads mini table */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Ostatnio dodane leady</p>
          <span className="text-xs text-primary font-mono">→ pełna lista w zakładce Leady</span>
        </div>
        <div className="space-y-2">
          {leads.slice(0, 4).map(lead => (
            <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{lead.firstName} {lead.lastName}</p>
                <p className="text-xs text-muted-foreground font-mono">{lead.companyName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  lead.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  lead.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {lead.status === 'approved' ? 'Zatw.' : lead.status === 'rejected' ? 'Rekl.' : 'Kolejka'}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(lead.createdAt).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>
          ))}
          {leads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Brak leadów</p>}
        </div>
      </div>
    </div>
  );
}
