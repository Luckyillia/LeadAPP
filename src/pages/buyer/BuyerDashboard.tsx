import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBuyerLeads } from '@/hooks/useLeads';
import { useBuyerRejections } from '@/hooks/useRejections';
import { StatCard, Card } from '@/components/ui';
import { ShoppingBag, Clock, AlertTriangle, CheckCircle2, Eye, Lock, TrendingUp } from 'lucide-react';
import { formatDate, maskEmail, maskPhone, hoursAgo } from '@/lib/utils';

export function BuyerDashboard() {
  const { user } = useAuthStore();
  const { data: leads = [] } = useBuyerLeads(user?.id ?? '');
  const { data: rejections = [] } = useBuyerRejections(user?.id ?? '');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const rejectedIds = new Set(rejections.map(r => r.leadId));
  const recentLeads = leads.slice(0, 4);
  const recentRejections = rejections.slice(0, 3);

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Witaj' : 'Dobry wieczór';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {user?.fullName.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Dostarczone" value={leads.length} />
        <StatCard
          label="Dostępne"
          value={leads.filter(l => !rejectedIds.has(l.id)).length}
          accent="text-emerald-600"
        />
        <StatCard label="Reklamacje" value={rejections.length} accent="text-red-500" />
        <StatCard
          label="Oczekują"
          value={rejections.filter(r => r.status === 'pending').length}
          accent="text-amber-500"
        />
      </div>

      {/* 48h reminder */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Limit reklamacyjny: 48 godzin</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Reklamacje można składać wyłącznie przez 48h od momentu dostarczenia leada.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent leads */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-violet-500" />
              Ostatnie kontakty
            </p>
            <a href="/buyer/leady" className="text-xs text-primary font-mono hover:underline">
              Zobacz wszystkie →
            </a>
          </div>
          <div className="space-y-3">
            {recentLeads.map(lead => {
              const isRevealed = revealed.has(lead.id);
              const isRejected = rejectedIds.has(lead.id);
              const hours = hoursAgo(lead.createdAt);
              const remaining = Math.max(0, 48 - hours).toFixed(0);

              return (
                <div key={lead.id} className={`border border-border rounded-xl p-3 ${isRejected ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                      <p className="text-xs text-muted-foreground">{lead.companyName}</p>
                    </div>
                    {!isRejected && hours <= 48 && (
                      <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        {remaining}h
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-xs font-mono text-muted-foreground">
                      {isRevealed ? lead.email : maskEmail(lead.email)}
                    </p>
                    <button
                      onClick={() => toggleReveal(lead.id)}
                      className="text-[10px] text-primary flex items-center gap-0.5 hover:underline"
                    >
                      {isRevealed ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {isRevealed ? 'Ukryj' : 'Pokaż'}
                    </button>
                  </div>
                </div>
              );
            })}
            {leads.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Brak kontaktów</p>
            )}
          </div>
        </div>

        {/* Recent rejections */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Historia reklamacji
            </p>
            <a href="/buyer/reklamacje" className="text-xs text-primary font-mono hover:underline">
              Zobacz wszystkie →
            </a>
          </div>
          <div className="space-y-3">
            {recentRejections.map(rej => (
              <div key={rej.id} className="border border-border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-muted-foreground">{rej.leadId.slice(0, 8)}…</p>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    rej.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    rej.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {rej.status === 'pending' ? 'Oczekuje' : rej.status === 'accepted' ? 'Przyjęta' : 'Odrzucona'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{rej.reason}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">{formatDate(rej.createdAt)}</p>
              </div>
            ))}
            {rejections.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Brak reklamacji</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
