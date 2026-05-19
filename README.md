# LEADAPP — CRM & Portal B2B Lead Generation

System operacyjny CRM dla agencji B2B Lead Generation. Zbudowany na React + Vite + TypeScript + Tailwind CSS.

## Szybki Start

```bash
npm install
npm run dev
```

Otwórz http://localhost:5173 i wybierz rolę demo.

## Struktura Projektu

```
src/
├── components/
│   ├── ui/index.tsx         # Komponenty UI (Button, Card, Table, Modal...)
│   ├── Navigation.tsx       # Sidebar nawigacja + przełącznik ról demo
│   ├── QuickAddLeadForm.tsx # Formularz szybkiego dodawania leada
│   └── RejectionModal.tsx   # Modal reklamacji z licznikiem 48h
├── pages/
│   ├── LoginPage.tsx        # Strona logowania (demo role switcher)
│   ├── DashboardAdmin.tsx   # Panel Administratora
│   ├── CRM_CallCenter.tsx   # Panel Call Center
│   ├── CRM_Handlowiec.tsx   # Panel Handlowca (pipeline kanban)
│   └── PortalBuyer.tsx      # Portal Kupującego B2B
├── store/
│   └── useAuthStore.ts      # Zustand store sesji użytkownika
├── lib/
│   ├── data.ts              # Mock dane + placeholder Supabase client
│   └── utils.ts             # Helpery (formatDate, maskEmail, hoursAgo...)
└── types.ts                 # TypeScript typy (Lead, Profile, Rejection...)
```

## Podłączenie Supabase

1. Skopiuj `.env.example` do `.env.local`
2. Uzupełnij `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`
3. W `src/lib/data.ts` odkomentuj blok `createClient`
4. Zastąp mock dane rzeczywistymi zapytaniami Supabase

## Role Użytkowników

| Rola | Dostęp |
|------|--------|
| `admin` | Pełny dostęp — wszystkie panele, raporty, zarządzanie reklamacjami |
| `agent_cc` | Tylko CRM Call Center — kolejka, wybieranie numerów |
| `sales_direct` | Tylko CRM Handlowiec — pipeline, kontakty bezpośrednie |
| `buyer` | Portal Kupującego — odbiór leadów, reklamacje 48h |

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript 5
- **Styling:** Tailwind CSS 3
- **State:** Zustand
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth)
- **Fonty:** Syne (sans) + JetBrains Mono
