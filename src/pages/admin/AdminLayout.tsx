import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { AdminLeads } from './AdminLeads';
import { AdminRejections } from './AdminRejections';
import { AdminUsers } from './AdminUsers';
import { AdminChat } from './AdminChat';

export function AdminLayout() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="leady" element={<AdminLeads />} />
      <Route path="reklamacje" element={<AdminRejections />} />
      <Route path="uzytkownicy" element={<AdminUsers />} />
      <Route path="czat" element={<AdminChat />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
