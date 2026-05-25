import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CRM_CallCenter } from '../CRM_CallCenter';
import { CCHistory } from './CCHistory';
import { CCStats } from './CCStats';

export function CCLayout() {
  return (
    <Routes>
      <Route index element={<CRM_CallCenter />} />
      <Route path="historia" element={<CCHistory />} />
      <Route path="statystyki" element={<CCStats />} />
      <Route path="*" element={<Navigate to="/cc" replace />} />
    </Routes>
  );
}
