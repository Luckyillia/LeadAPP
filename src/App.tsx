import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Navigation } from '@/components/Navigation';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { HomePage } from '@/pages/HomePage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { CCLayout } from '@/pages/cc/CCLayout';
import { HandlowiecLayout } from '@/pages/handlowiec/HandlowiecLayout';
import { BuyerLayout } from '@/pages/buyer/BuyerLayout';
import { Loader2, Zap } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppLayout() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/admin/*"
            element={user.role === 'admin' ? <AdminLayout /> : <Navigate to="/" replace />}
          />
          <Route
            path="/cc/*"
            element={['admin', 'agent_cc'].includes(user.role) ? <CCLayout /> : <Navigate to="/" replace />}
          />
          <Route
            path="/handlowiec/*"
            element={['admin', 'sales_direct'].includes(user.role) ? <HandlowiecLayout /> : <Navigate to="/" replace />}
          />
          <Route
            path="/buyer/*"
            element={user.role === 'buyer' ? <BuyerLayout /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function InitLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
        <p className="text-white/40 text-xs font-mono mt-3">Ładowanie sesji...</p>
      </div>
    </div>
  );
}

function AuthGate() {
  const { user, loading, init } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    init().then(unsub => { cleanup = unsub; setInitialized(true); });
    return () => cleanup?.();
  }, [init]);

  if (!initialized || loading) return <InitLoader />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/*" element={user ? <AppLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
