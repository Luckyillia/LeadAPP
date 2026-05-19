import React, { useState } from 'react';
import { Button, Input, Textarea, Label, Modal } from '@/components/ui';
import { Plus, CheckCircle } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  consentText: string;
}

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '', companyName: '',
  consentText: 'Wyrażam zgodę na kontakt w celach handlowych i przetwarzanie moich danych osobowych.',
};

export function QuickAddLeadForm({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
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

    setLoading(true);
    // Simulate API call to POST /functions/v1/intake-lead
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setOpen(false);
      setForm(EMPTY);
      onAdded?.();
    }, 1500);
  };

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> Dodaj Lead
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Szybkie Dodanie Kontaktu">
        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-emerald-600">
            <CheckCircle className="w-12 h-12" />
            <p className="font-semibold text-lg">Lead zapisany!</p>
            <p className="text-sm text-muted-foreground">Kontakt przypisany do kolejki CC.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fn">Imię</Label>
                <Input id="fn" placeholder="Jan" {...field('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="ln">Nazwisko</Label>
                <Input id="ln" placeholder="Kowalski" {...field('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jan@firma.pl" {...field('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" placeholder="+48 600 000 000" {...field('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="company">Firma</Label>
              <Input id="company" placeholder="Nazwa Sp. z o.o." {...field('companyName')} />
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="consent">Treść zgody marketingowej</Label>
              <Textarea id="consent" rows={3} {...field('consentText')} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Anuluj</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Zapisuję...' : 'Zapisz Lead'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
