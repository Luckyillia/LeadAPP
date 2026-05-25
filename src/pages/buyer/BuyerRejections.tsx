import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBuyerRejections } from '@/hooks/useRejections';
import { Table, Th, Td, Card } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Loader2, Clock } from 'lucide-react';

export function BuyerRejections() {
  const { user } = useAuthStore();
  const { data: rejections = [], isLoading } = useBuyerRejections(user?.id ?? '');

  const pending = rejections.filter(r => r.status === 'pending');
  const resolved = rejections.filter(r => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Moje reklamacje
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Historia zgłoszonych reklamacji</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Oczekujące', value: pending.length, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', icon: Clock },
          { label: 'Przyjęte', value: rejections.filter(r => r.status === 'accepted').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
          { label: 'Odrzucone', value: rejections.filter(r => r.status === 'declined').length, color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: AlertTriangle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-3 ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Oczekujące ({pending.length})
          </h2>
          <Table>
            <thead>
              <tr><Th>Lead ID</Th><Th>Powód</Th><Th>Status</Th><Th>Data zgłoszenia</Th></tr>
            </thead>
            <tbody>
              {pending.map(rej => (
                <tr key={rej.id} className="hover:bg-muted/30 transition-colors">
                  <Td><p className="text-sm font-mono text-muted-foreground">{rej.leadId.slice(0, 8)}…</p></Td>
                  <Td><p className="text-sm max-w-xs">{rej.reason}</p></Td>
                  <Td>
                    <span className="text-xs font-mono font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      ⏳ Oczekuje
                    </span>
                  </Td>
                  <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(rej.createdAt)}</span></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* History */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Rozpatrzone ({resolved.length})</h2>
          <Table>
            <thead>
              <tr><Th>Lead ID</Th><Th>Powód</Th><Th>Status</Th><Th>Data</Th></tr>
            </thead>
            <tbody>
              {resolved.map(rej => (
                <tr key={rej.id} className="hover:bg-muted/30 transition-colors opacity-70">
                  <Td><p className="text-sm font-mono text-muted-foreground">{rej.leadId.slice(0, 8)}…</p></Td>
                  <Td><p className="text-sm max-w-xs">{rej.reason}</p></Td>
                  <Td>
                    <span className={`text-xs font-mono font-semibold ${rej.status === 'accepted' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {rej.status === 'accepted' ? '✓ Przyjęta' : '✕ Odrzucona'}
                    </span>
                  </Td>
                  <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(rej.createdAt)}</span></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {rejections.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
          <p>Nie masz żadnych reklamacji.</p>
        </Card>
      )}
    </div>
  );
}
