import type { Lead, Profile, Rejection } from '@/types';

// ─── Mock Profiles ──────────────────────────────────────────────────────────
export const MOCK_PROFILES: Profile[] = [
  { id: 'admin-1', email: 'admin@leadapp.pl', fullName: 'Anna Kowalska', role: 'admin', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cc-1', email: 'cc1@leadapp.pl', fullName: 'Piotr Nowak', role: 'agent_cc', isActive: true, createdAt: '2026-01-05T00:00:00Z' },
  { id: 'cc-2', email: 'cc2@leadapp.pl', fullName: 'Marta Wiśniewska', role: 'agent_cc', isActive: true, createdAt: '2026-01-05T00:00:00Z' },
  { id: 'sd-1', email: 'sd1@leadapp.pl', fullName: 'Tomasz Lewandowski', role: 'sales_direct', isActive: true, createdAt: '2026-01-10T00:00:00Z' },
  { id: 'sd-2', email: 'sd2@leadapp.pl', fullName: 'Karolina Zając', role: 'sales_direct', isActive: true, createdAt: '2026-01-10T00:00:00Z' },
  { id: 'buyer-1', email: 'buyer@techcorp.pl', fullName: 'Marek Dąbrowski', role: 'buyer', isActive: true, createdAt: '2026-01-15T00:00:00Z' },
];

// ─── Mock Leads ─────────────────────────────────────────────────────────────
export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1', firstName: 'Jakub', lastName: 'Kowalczyk', email: 'j.kowalczyk@firma.pl',
    phone: '+48601234567', companyName: 'Firma Budowlana Kowalczyk Sp. z o.o.',
    source: 'web', status: 'approved', assignedTo: 'cc-1', buyerId: 'buyer-1',
    consentTimestamp: '2026-05-18T10:00:00Z', consentText: 'Wyrażam zgodę na kontakt w celach handlowych.',
    isDuplicate: false, createdAt: '2026-05-18T10:00:00Z', updatedAt: '2026-05-18T12:00:00Z',
  },
  {
    id: 'lead-2', firstName: 'Agnieszka', lastName: 'Wójcik', email: 'a.wojcik@innowacje.pl',
    phone: '+48602345678', companyName: 'Innowacje Cyfrowe Wójcik',
    source: 'call_center', status: 'pending_cc', assignedTo: 'cc-1', buyerId: 'buyer-1',
    consentTimestamp: '2026-05-19T08:30:00Z', consentText: 'Zgoda na przetwarzanie danych osobowych.',
    isDuplicate: false, createdAt: '2026-05-19T08:30:00Z', updatedAt: '2026-05-19T08:30:00Z',
  },
  {
    id: 'lead-3', firstName: 'Rafał', lastName: 'Kaczmarek', email: 'r.kaczmarek@protech.pl',
    phone: '+48603456789', companyName: 'ProTech Solutions',
    source: 'sales_direct', status: 'approved', assignedTo: 'sd-1', buyerId: 'buyer-1',
    consentTimestamp: '2026-05-17T14:00:00Z', consentText: 'Zgoda na kontakt telefoniczny i email.',
    isDuplicate: false, createdAt: '2026-05-17T14:00:00Z', updatedAt: '2026-05-18T09:00:00Z',
  },
  {
    id: 'lead-4', firstName: 'Monika', lastName: 'Piotrowska', email: 'm.piotrowska@eco.pl',
    phone: '+48604567890', companyName: 'EcoSystem Piotrowska',
    source: 'web', status: 'new_web', assignedTo: 'cc-2', buyerId: null,
    consentTimestamp: '2026-05-19T11:00:00Z', consentText: 'Wyrażam zgodę na kontakt w celach handlowych.',
    isDuplicate: false, createdAt: '2026-05-19T11:00:00Z', updatedAt: '2026-05-19T11:00:00Z',
  },
  {
    id: 'lead-5', firstName: 'Grzegorz', lastName: 'Mazur', email: 'g.mazur@firma.pl',
    phone: '+48601234567', companyName: 'GM Consulting',
    source: 'web', status: 'pending_cc', assignedTo: 'cc-1', buyerId: null,
    consentTimestamp: '2026-05-19T09:00:00Z', consentText: 'Zgoda marketingowa.',
    isDuplicate: true, createdAt: '2026-05-19T09:00:00Z', updatedAt: '2026-05-19T09:00:00Z',
  },
  {
    id: 'lead-6', firstName: 'Beata', lastName: 'Jankowska', email: 'b.jankowska@start.pl',
    phone: '+48605678901', companyName: 'StartUp Hub Jankowska',
    source: 'sales_direct', status: 'rejected', assignedTo: 'sd-2', buyerId: 'buyer-1',
    consentTimestamp: '2026-05-15T10:00:00Z', consentText: 'Zgoda na przetwarzanie danych.',
    isDuplicate: false, createdAt: '2026-05-15T10:00:00Z', updatedAt: '2026-05-16T08:00:00Z',
  },
  {
    id: 'lead-7', firstName: 'Paweł', lastName: 'Szymański', email: 'p.szymanski@logistic.pl',
    phone: '+48606789012', companyName: 'LogiTrans Szymański',
    source: 'call_center', status: 'approved', assignedTo: 'cc-2', buyerId: 'buyer-1',
    consentTimestamp: '2026-05-14T13:00:00Z', consentText: 'Wyrażam zgodę na kontakt handlowy.',
    isDuplicate: false, createdAt: '2026-05-14T13:00:00Z', updatedAt: '2026-05-15T10:00:00Z',
  },
];

// ─── Mock Rejections ─────────────────────────────────────────────────────────
export const MOCK_REJECTIONS: Rejection[] = [
  {
    id: 'rej-1', leadId: 'lead-6', buyerId: 'buyer-1',
    reason: 'Numer telefonu jest błędny – nie można skontaktować się z osobą.',
    status: 'pending', createdAt: '2026-05-16T07:00:00Z',
  },
];

// ─── Supabase placeholder (replace with real client) ─────────────────────────
// import { createClient } from '@supabase/supabase-js';
// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );
