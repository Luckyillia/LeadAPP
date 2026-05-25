import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import logo from '@/assets/logo.svg';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { login, user, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);
  useEffect(() => { clearError(); }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        
        

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="LEADAPP" className="h-8" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Zaloguj się</h2>
          <p className="text-sm text-muted-foreground mb-6">Wprowadź dane dostępowe do konta</p>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5 mb-5 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@firma.pl"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Hasło</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Logowanie...</>
              ) : 'Zaloguj się'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Nie masz konta?{' '}
              <a href="/register" className="font-medium text-foreground hover:underline underline-offset-4">
                Zarejestruj się
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          LEADAPP v1.0 · Powered by Supabase
        </p>
      </div>
    </div>
  );
}