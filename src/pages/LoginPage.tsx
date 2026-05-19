import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui';
import { Zap, LayoutDashboard, Phone, Users, ShoppingBag } from 'lucide-react';
import type { UserRole } from '@/types';

const DEMO_ROLES: { role: UserRole; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { role: 'admin', label: 'Administrator', desc: 'Pełen dostęp, dashboardy, raporty', icon: LayoutDashboard, color: 'bg-slate-900 hover:bg-slate-800 text-white' },
  { role: 'agent_cc', label: 'Konsultant CC', desc: 'Kolejka, dialer, leady Call Center', icon: Phone, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { role: 'sales_direct', label: 'Handlowiec', desc: 'Pipeline, spotkania, kontakty bezpośrednie', icon: Users, color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { role: 'buyer', label: 'Kupujący B2B', desc: 'Odbiór leadów, reklamacje 48h', icon: ShoppingBag, color: 'bg-violet-600 hover:bg-violet-700 text-white' },
];

export function LoginPage() {
  const { login } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">LEADAPP</h1>
          <p className="text-blue-300 mt-2 font-mono text-sm">CRM & Portal B2B Lead Generation</p>
        </div>

        {/* Demo Login */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <p className="text-white/60 text-sm text-center mb-5 font-mono">
            DEMO — wybierz rolę, aby zalogować się
          </p>
          <div className="space-y-3">
            {DEMO_ROLES.map(({ role, label, desc, icon: Icon, color }) => (
              <button
                key={role}
                onClick={() => login(role)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-150 ${color}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs opacity-75">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6 font-mono">
          Wersja demo · Dane testowe · LEADAPP v0.1
        </p>
      </div>
    </div>
  );
}
