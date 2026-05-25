import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyLeadsCC } from '@/hooks/useLeads';
import { StatCard } from '@/components/ui';
import { BarChart2, Loader2, TrendingUp, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

export function CCStats() {
  const { user } = useAuthStore();
  const { data: leads = [], isLoading } = useMyLeadsCC(user?.id ?? '');

  const total = leads.length;
  const approved = leads.filter(l => l.status === 'approved').length;
  const rejected = leads.filter(l => l.status === 'rejected').length;
  const queue = leads.filter(l => ['new_web', 'pending_cc'].includes(l.status)).length;
  const duplicates = leads.filter(l => l.isDuplicate).length;
  const convRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // By source
  const bySource = [
    { label: 'Formularz WWW', value: leads.filter(l => l.source === 'web').length, color: '#3b82f6' },
    { label: 'Call Center', value: leads.filter(l => l.source === 'call_center').length, color: '#8b5cf6' },
    { label: 'Sprzedaż bezpośrednia', value: leads.filter(l => l.source === 'sales_direct').length, color: '#10b981' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-blue-500" />
          Moje statystyki
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Twoja efektywność w Call Center</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Wszystkie leady" value={total} />
        <StatCard label="Zatwierdzone" value={approved} accent="text-emerald-600" />
        <StatCard label="W kolejce" value={queue} accent="text-blue-600" />
        <StatCard label="Duplikaty" value={duplicates} accent="text-amber-500" />
      </div>

      {/* Conversion */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-4">Konwersja</p>
        <div className="flex items-end gap-4 mb-6">
          <span className="text-5xl font-bold text-emerald-600">{convRate}%</span>
          <span className="text-sm text-muted-foreground mb-1">zatwierdzonych z {total} łącznie</span>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Zatwierdzone', value: approved, color: '#10b981', icon: CheckCircle2 },
            { label: 'Odrzucone / Reklamacje', value: rejected, color: '#ef4444', icon: AlertTriangle },
            { label: 'Duplikaty', value: duplicates, color: '#f59e0b', icon: Copy },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  {label}
                </span>
                <span className="text-xs font-mono font-bold">{value}</span>
              </div>
              <ProgressBar value={value} max={total} color={color} />
            </div>
          ))}
        </div>
      </div>

      {/* By source */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-4">Leady wg źródła</p>
        <div className="space-y-4">
          {bySource.map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{label}</span>
                <span className="text-xs font-mono font-bold">{value}</span>
              </div>
              <ProgressBar value={value} max={total} color={color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
