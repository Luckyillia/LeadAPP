import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BuyerDashboard } from './BuyerDashboard';
import { BuyerLeads } from './BuyerLeads';
import { BuyerRejections } from './BuyerRejections';
import { BuyerChat } from './BuyerChat';

export function BuyerLayout() {
  return (
    <Routes>
      <Route index element={<BuyerDashboard />} />
      <Route path="leady" element={<BuyerLeads />} />
      <Route path="reklamacje" element={<BuyerRejections />} />
      <Route path="kontakt" element={<BuyerChat />} />
      <Route path="*" element={<Navigate to="/buyer" replace />} />
    </Routes>
  );
}
