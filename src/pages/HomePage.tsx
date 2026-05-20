import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useLeads } from '@/hooks/useLeads';
import { useRejections } from '@/hooks/useRejections';
import {
  LayoutDashboard, Phone, Users, ShoppingBag,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Zap,
} from 'lucide-react';
import type { UserRole } from '@/types';

const PANELS: {
  role: UserRole[];
  path: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    role: ['admin'],
    path: '/admin',
    label: 'Dashboard Admina',
    desc: 'Pełny przegląd, raporty, zarządzanie użytkownikami i reklamacjami',
    icon: LayoutDashboard,
    color: 'text-slate-100',
    bg: 'bg-slate-800 hover:bg-slate-700 border-slate-700',
  },
  {
    role: ['admin', 'agent_cc'],
    path: '/cc',
    label: 'CRM Call Center',
    desc: 'Kolejka leadów, dialer, zarządzanie kontaktami przychodzącymi',
    icon: Phone,
    color: 'text-blue-100',
    bg: 'bg-blue-900/50 hover:bg-blue-900/80 border-blue-800',
  },
  {
    role: ['admin', 'sales_direct'],
    path: '/handlowiec',
    label: 'CRM Handlowiec',
    desc: 'Pipeline sprzedażowy, notatki, etapy negocjacji',
    icon: Users,
    color: 'text-emerald-100',
    bg: 'bg-emerald-900/50 hover:bg-emerald-900/80 border-emerald-800',
  },
  {
    role: ['admin', 'buyer'],
    path: '/buyer',
    label: 'Portal Kupującego',
    desc: 'Twoje zatwierdzone leady B2B, reklamacje 48h',
    icon: ShoppingBag,
    color: 'text-violet-100',
    bg: 'bg-violet-900/50 hover:bg-violet-900/80 border-violet-800',
  },
];

export function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: leads } = useLeads();
  const { data: rejections } = useRejections();

  if (!user) return null;

  const visiblePanels = PANELS.filter((p) => p.role.includes(user.role));

  const stats = user.role === 'admin' ? {
    total: leads?.length ?? 0,
    approved: leads?.filter((l) => l.status === 'approved').length ?? 0,
    pending: leads?.filter((l) => ['new_web', 'pending_cc', 'pending_direct'].includes(l.status)).length ?? 0,
    rejections: rejections?.filter((r) => r.status === 'pending').length ?? 0,
  } : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Witaj' : 'Dobry wieczór';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">LEADAPP</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {user.fullName.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Admin stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Wszystkie leady', value: stats.total, icon: TrendingUp, color: 'text-foreground' },
            { label: 'Zatwierdzone', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'W kolejce', value: stats.pending, icon: Clock, color: 'text-blue-600' },
            { label: 'Reklamacje', value: stats.rejections, icon: AlertTriangle, color: 'text-amber-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Panel tiles */}
      <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4">
        Twoje panele
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visiblePanels.map(({ path, label, desc, icon: Icon, color, bg }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`${bg} border rounded-2xl p-6 text-left transition-all duration-200 group`}
          >
            <div className={`${color} flex items-start gap-4`}>
              <div className="p-2.5 rounded-xl bg-white/10">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base">{label}</p>
                <p className="text-sm opacity-60 mt-0.5 leading-snug">{desc}</p>
              </div>
              <span className="opacity-30 group-hover:opacity-70 transition-opacity text-xl">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
