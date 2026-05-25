import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyLeadsSales } from '@/hooks/useLeads';
import { StatCard } from '@/components/ui';
import { TrendingUp, Loader2, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';

const AVG_LEAD_VALUE = 850;

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

export function HandlowiecStats() {
  const { user } = useAuthStore();
  const { data: leads = [], isLoading } = useMyLeadsSales(user?.id ?? '');

  const total = leads.length;
  const approved = leads.filter(l => l.status === 'approved').length;
  const pipeline = leads.filter(l => l.status === 'pending_direct').length;
  const rejected = leads.filter(l => l.status === 'rejected').length;
  const value = approved * AVG_LEAD_VALUE;
  const convRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const PIPELINE_STAGES = ['Kontakt', 'Prezentacja', 'Oferta', 'Negocjacje', 'Zamknięte'];
  const stageData = PIPELINE_STAGES.map((label, i) => ({
    label,
    value: i === 4 ? approved : Math.floor(pipeline / PIPELINE_STAGES.length),
    color: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'][i],
  }));

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
          <TrendingUp className="w-6 h-6 text-violet-500" />
          Moje statystyki
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Twoja efektywność sprzedażowa</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Kontakty" value={total} />
        <StatCard label="Zatwierdzone" value={approved} accent="text-emerald-600" />
        <StatCard label="W pipeline" value={pipeline} accent="text-blue-600" />
        <StatCard label="Szac. wartość" value={`${value.toLocaleString('pl-PL')} zł`} accent="text-violet-600" />
      </div>

      {/* Conversion */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-4">Konwersja sprzedażowa</p>
        <div className="flex items-end gap-4 mb-6">
          <span className="text-5xl font-bold text-emerald-600">{convRate}%</span>
          <div className="mb-1">
            <p className="text-sm text-muted-foreground">zatwierdzonych z {total} kontaktów</p>
            <p className="text-xs text-muted-foreground font-mono">≈ {AVG_LEAD_VALUE} zł / lead</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Zatwierdzone', value: approved, color: '#10b981', icon: CheckCircle2 },
            { label: 'W pipeline', value: pipeline, color: '#3b82f6', icon: TrendingUp },
            { label: 'Reklamacje', value: rejected, color: '#ef4444', icon: AlertTriangle },
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

      {/* Pipeline funnel */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-4">Lejek sprzedażowy</p>
        <div className="space-y-3">
          {stageData.map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{label}</span>
                <span className="text-xs font-mono font-bold">{value}</span>
              </div>
              <ProgressBar value={value} max={Math.max(...stageData.map(s => s.value), 1)} color={color} />
            </div>
          ))}
        </div>
      </div>

      {/* Value card */}
      <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-5 h-5 opacity-70" />
          <p className="text-sm font-mono opacity-70 uppercase tracking-wide">Szacowana wartość portfela</p>
        </div>
        <p className="text-4xl font-bold">{value.toLocaleString('pl-PL')} zł</p>
        <p className="text-sm opacity-60 mt-1">{approved} zatwierdzone × {AVG_LEAD_VALUE} zł avg</p>
      </div>
    </div>
  );
}
