import React from 'react';
import { useRejections, useUpdateRejectionStatus } from '@/hooks/useRejections';
import { useProfiles } from '@/hooks/useProfiles';
import { Table, Th, Td, Button, Card } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';

export function AdminRejections() {
  const { data: rejections = [], isLoading } = useRejections();
  const { data: profiles = [] } = useProfiles();
  const updateRejection = useUpdateRejectionStatus();

  const pending = rejections.filter(r => r.status === 'pending');
  const resolved = rejections.filter(r => r.status !== 'pending');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Reklamacje
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Zarządzanie zgłoszeniami od kupujących</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Oczekujące', value: pending.length, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Przyjęte', value: rejections.filter(r => r.status === 'accepted').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Odrzucone', value: rejections.filter(r => r.status === 'declined').length, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <p className="text-xs font-mono text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pending */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Do rozpatrzenia ({pending.length})
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : pending.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
            <p>Brak reklamacji do rozpatrzenia.</p>
          </Card>
        ) : (
          <Table>
            <thead>
              <tr><Th>Lead</Th><Th>Kupujący</Th><Th>Powód</Th><Th>Data zgłoszenia</Th><Th>Akcje</Th></tr>
            </thead>
            <tbody>
              {pending.map(rej => (
                <tr key={rej.id} className="hover:bg-muted/30 transition-colors">
                  <Td>
                    <p className="font-medium text-sm">{rej.lead?.firstName} {rej.lead?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{rej.lead?.companyName}</p>
                  </Td>
                  <Td>
                    <p className="text-sm">{profiles.find(p => p.id === rej.buyerId)?.fullName ?? '—'}</p>
                  </Td>
                  <Td><p className="text-sm max-w-xs">{rej.reason}</p></Td>
                  <Td><span className="text-xs font-mono text-muted-foreground">{formatDate(rej.createdAt)}</span></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50"
                        onClick={() => updateRejection.mutate({ id: rej.id, status: 'accepted' })}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Akceptuj
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50"
                        onClick={() => updateRejection.mutate({ id: rej.id, status: 'declined' })}>
                        <XCircle className="w-3.5 h-3.5" /> Odrzuć
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* History */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3 text-muted-foreground">Historia rozpatrzonych ({resolved.length})</h2>
          <Table>
            <thead>
              <tr><Th>Lead</Th><Th>Powód</Th><Th>Status</Th><Th>Data</Th></tr>
            </thead>
            <tbody>
              {resolved.map(rej => (
                <tr key={rej.id} className="hover:bg-muted/30 transition-colors opacity-70">
                  <Td>
                    <p className="text-sm font-medium">{rej.lead?.firstName} {rej.lead?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{rej.lead?.companyName}</p>
                  </Td>
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
    </div>
  );
}
