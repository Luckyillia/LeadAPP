import React, { useState } from 'react';
import { Button, Textarea, Label, Modal } from '@/components/ui';
import { AlertTriangle, Clock } from 'lucide-react';
import { hoursAgo } from '@/lib/utils';

interface Props {
  leadId: string;
  buyerId: string;
  leadCreatedAt: string;
  leadName: string;
  onSuccess: (reason: string) => Promise<void>;
}

export function RejectionModal({ leadCreatedAt, leadName, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hours = hoursAgo(leadCreatedAt);
  const remaining = Math.max(0, 48 - hours);
  const expired = hours > 48;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Podaj przyczynę reklamacji.'); return; }
    setLoading(true);
    setError('');
    try {
      await onSuccess(reason);
      setOpen(false);
      setReason('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd zgłoszenia reklamacji.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => setOpen(true)}
        disabled={expired}
        title={expired ? 'Czas na reklamację minął' : 'Zgłoś reklamację'}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Reklamacja
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Reklamacja Kontaktu">
        <div className="space-y-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            expired ? 'bg-red-50 text-red-700' : remaining < 12 ? 'bg-amber-50 text-amber-700' : 'bg-muted text-muted-foreground'
          }`}>
            <Clock className="w-4 h-4 shrink-0" />
            {expired ? 'Termin reklamacji upłynął.' : `Pozostało ${remaining.toFixed(1)}h z limitu 48h.`}
          </div>

          <p className="text-sm">Reklamacja dla: <strong>{leadName}</strong></p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label>Powód reklamacji</Label>
              <Textarea
                rows={4}
                placeholder="Błędny numer, brak zgody RODO, nieprawidłowe dane firmy..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={expired}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Anuluj</Button>
              <Button type="submit" variant="destructive" disabled={loading || expired}>
                {loading ? 'Wysyłam...' : 'Wyślij Reklamację'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
