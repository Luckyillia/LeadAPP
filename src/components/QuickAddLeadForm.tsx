import React, { useState } from 'react';
import { Button, Input, Textarea, Label, Modal, Select } from '@/components/ui';
import { useAddLead } from '@/hooks/useLeads';
import { useAuthStore } from '@/store/useAuthStore';
import { Plus, CheckCircle, Loader2 } from 'lucide-react';
import type { LeadSource } from '@/types';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  consentText: string;
  source: LeadSource;
}

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '', companyName: '',
  consentText: 'Wyrażam zgodę na kontakt w celach handlowych i przetwarzanie moich danych osobowych.',
  source: 'web',
};

export function QuickAddLeadForm({ onAdded }: { onAdded?: () => void }) {
  const { user } = useAuthStore();
  const addLead = useAddLead();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [success, setSuccess] = useState(false);

  const validate = (): Partial<FormData> => {
    const e: Partial<FormData> = {};
    if (form.firstName.length < 2) e.firstName = 'Min. 2 znaki';
    if (form.lastName.length < 2) e.lastName = 'Min. 2 znaki';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Nieprawidłowy email';
    if (!/^\+?[0-9]{9,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Nieprawidłowy numer';
    if (form.companyName.length < 2) e.companyName = 'Min. 2 znaki';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await addLead.mutateAsync({
        ...form,
        assignedTo: user?.role === 'sales_direct' ? user.id : null,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        setForm(EMPTY);
        onAdded?.();
      }, 1500);
    } catch (err: unknown) {
      setErrors({ email: err instanceof Error ? err.message : 'Błąd zapisu' });
    }
  };

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  // Handlowiec zawsze dodaje jako sales_direct
  const defaultSource: LeadSource = user?.role === 'sales_direct' ? 'sales_direct' : 'web';
  if (form.source !== defaultSource && user?.role === 'sales_direct') {
    setForm((f) => ({ ...f, source: 'sales_direct' }));
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> Dodaj Lead
      </Button>

      <Modal open={open} onClose={() => { setOpen(false); setForm(EMPTY); }} title="Szybkie Dodanie Kontaktu">
        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-emerald-600">
            <CheckCircle className="w-12 h-12" />
            <p className="font-semibold text-lg">Lead zapisany!</p>
            <p className="text-sm text-muted-foreground">
              {addLead.data?.isDuplicate
                ? '⚠ Wykryto duplikat — przypisano do aktualnego opiekuna.'
                : 'Kontakt przypisany do kolejki.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Imię</Label>
                <Input placeholder="Jan" {...field('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-1">
                <Label>Nazwisko</Label>
                <Input placeholder="Kowalski" {...field('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="jan@firma.pl" {...field('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label>Telefon</Label>
              <Input placeholder="+48 600 000 000" {...field('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1">
              <Label>Firma</Label>
              <Input placeholder="Nazwa Sp. z o.o." {...field('companyName')} />
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
            </div>
            {user?.role !== 'sales_direct' && (
              <div className="space-y-1">
                <Label>Źródło</Label>
                <Select {...field('source')}>
                  <option value="web">Formularz WWW</option>
                  <option value="call_center">Call Center</option>
                  <option value="sales_direct">Sprzedaż Bezpośrednia</option>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label>Treść zgody marketingowej</Label>
              <Textarea rows={3} {...field('consentText')} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => { setOpen(false); setForm(EMPTY); }}>Anuluj</Button>
              <Button type="submit" disabled={addLead.isPending}>
                {addLead.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Zapisuję...</> : 'Zapisz Lead'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
