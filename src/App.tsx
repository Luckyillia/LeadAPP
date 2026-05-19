import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Navigation } from '@/components/Navigation';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardAdmin } from '@/pages/DashboardAdmin';
import { CRM_CallCenter } from '@/pages/CRM_CallCenter';
import { CRM_Handlowiec } from '@/pages/CRM_Handlowiec';
import { PortalBuyer } from '@/pages/PortalBuyer';

function AppLayout() {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  const defaultPath = {
    admin: '/admin',
    agent_cc: '/cc',
    sales_direct: '/handlowiec',
    buyer: '/buyer',
  }[user.role];

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to={defaultPath} replace />} />
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/cc" element={<CRM_CallCenter />} />
          <Route path="/handlowiec" element={<CRM_Handlowiec />} />
          <Route path="/buyer" element={<PortalBuyer />} />
          <Route path="*" element={<Navigate to={defaultPath} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/*" element={user ? <AppLayout /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
