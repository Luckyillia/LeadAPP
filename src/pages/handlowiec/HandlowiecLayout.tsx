import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CRM_Handlowiec } from '../CRM_Handlowiec';
import { HandlowiecKontakty } from './HandlowiecKontakty';
import { HandlowiecStats } from './HandlowiecStats';

export function HandlowiecLayout() {
  return (
    <Routes>
      <Route index element={<CRM_Handlowiec />} />
      <Route path="kontakty" element={<HandlowiecKontakty />} />
      <Route path="statystyki" element={<HandlowiecStats />} />
      <Route path="*" element={<Navigate to="/handlowiec" replace />} />
    </Routes>
  );
}
