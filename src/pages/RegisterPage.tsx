import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';
import { ROLE_LABELS } from '@/types';
import logo from '@/assets/logo.svg';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'agent_cc' as UserRole,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) { setError('Hasła nie są identyczne.'); return; }
    if (form.password.length < 8)               { setError('Hasło musi mieć minimum 8 znaków.'); return; }
    if (form.fullName.trim().length < 3)         { setError('Podaj pełne imię i nazwisko (min. 3 znaki).'); return; }

    setLoading(true);
    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName, role: form.role } },
      });

      if (signUpErr) throw signUpErr;
      if (!data.user) throw new Error('Błąd rejestracji.');
      if (data.user.identities && data.user.identities.length === 0)
        throw new Error('Ten adres email jest już zarejestrowany.');

      if (data.session) {
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: data.user.id, email: form.email,
          full_name: form.fullName, role: form.role, is_active: true,
        });
        if (profileErr) throw profileErr;
      }
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd rejestracji';
      const friendly = msg.includes('already registered')
        ? 'Ten adres email jest już zarejestrowany.'
        : msg.includes('rate limit')
        ? 'Zbyt wiele prób rejestracji. Spróbuj za godzinę.'
        : msg;
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8 w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Konto utworzone!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sprawdź skrzynkę email i potwierdź rejestrację, a następnie zaloguj się.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-2 rounded-lg text-sm transition-all shadow-sm"
          >
            Przejdź do logowania
          </button>
        </div>
      </div>
    );
  }

  /* ── Register form ── */
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="LEADAPP" className="h-8" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Rejestracja konta</h2>
          <p className="text-sm text-muted-foreground mb-6">Wypełnij dane aby dołączyć do systemu</p>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5 mb-5 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Imię i Nazwisko</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Jan Kowalski"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jan@firma.pl"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Rola</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Hasło</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="min. 8 znaków"
                  required
                  className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Potwierdź hasło</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Tworzę konto...</> : 'Utwórz konto'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Masz już konto?{' '}
              <a href="/login" className="font-medium text-foreground hover:underline underline-offset-4">
                Zaloguj się
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}