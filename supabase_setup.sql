-- ============================================================
-- LEADAPP — Supabase Setup SQL  (kolejność ma znaczenie!)
-- Uruchom w: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── KROK 1: Typy ENUM ────────────────────────────────────────
CREATE TYPE public.user_role AS ENUM ('admin', 'agent_cc', 'sales_direct', 'buyer');
CREATE TYPE public.lead_source AS ENUM ('web', 'call_center', 'sales_direct');
CREATE TYPE public.lead_status AS ENUM ('pending_cc', 'pending_direct', 'new_web', 'approved', 'rejected');
CREATE TYPE public.rejection_status AS ENUM ('pending', 'accepted', 'declined');

-- ── KROK 2: Funkcja updated_at (potrzebna przez trigger na leads) ──
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── KROK 3: Tabela PROFILES ───────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID NOT NULL,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        public.user_role NOT NULL DEFAULT 'sales_direct'::public.user_role,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_key UNIQUE (email),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- ── KROK 4: Tabela LEADS ──────────────────────────────────────
CREATE TABLE public.leads (
  id                  UUID NOT NULL DEFAULT gen_random_uuid(),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT NOT NULL,
  company_name        TEXT NOT NULL,
  source              public.lead_source NOT NULL,
  status              public.lead_status NOT NULL DEFAULT 'new_web'::public.lead_status,
  assigned_to         UUID NULL,
  buyer_id            UUID NULL,
  consent_timestamp   TIMESTAMP WITH TIME ZONE NOT NULL,
  consent_text        TEXT NOT NULL,
  is_duplicate        BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id),
  CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to)
    REFERENCES public.profiles (id) ON DELETE SET NULL,
  CONSTRAINT leads_buyer_id_fkey FOREIGN KEY (buyer_id)
    REFERENCES public.profiles (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_email_phone  ON public.leads USING btree (email, phone);
CREATE INDEX IF NOT EXISTS idx_leads_status       ON public.leads USING btree (status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to  ON public.leads USING btree (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_buyer_id     ON public.leads USING btree (buyer_id);

CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── KROK 5: Tabela REJECTIONS ─────────────────────────────────
CREATE TABLE public.rejections (
  id         UUID NOT NULL DEFAULT gen_random_uuid(),
  lead_id    UUID NOT NULL,
  buyer_id   UUID NOT NULL,
  reason     TEXT NOT NULL,
  status     public.rejection_status NOT NULL DEFAULT 'pending'::public.rejection_status,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT rejections_pkey PRIMARY KEY (id),
  CONSTRAINT rejections_lead_id_fkey  FOREIGN KEY (lead_id)
    REFERENCES public.leads (id) ON DELETE CASCADE,
  CONSTRAINT rejections_buyer_id_fkey FOREIGN KEY (buyer_id)
    REFERENCES public.profiles (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rejections_lead_id ON public.rejections USING btree (lead_id);

-- ── KROK 6: Trigger — auto-tworzenie profilu po rejestracji ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'agent_cc'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── KROK 7: Row Level Security ────────────────────────────────

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejections ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert_trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- leads — admin
CREATE POLICY "leads_all_admin"
  ON public.leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- leads — agent CC (tylko swoje + może wstawiać)
CREATE POLICY "leads_select_agent_cc"
  ON public.leads FOR SELECT
  USING (
    assigned_to = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'agent_cc')
  );

CREATE POLICY "leads_insert_agent_cc"
  ON public.leads FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'agent_cc')
  );

CREATE POLICY "leads_update_agent_cc"
  ON public.leads FOR UPDATE
  USING (
    assigned_to = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'agent_cc')
  );

-- leads — handlowiec (tylko swoje + może wstawiać)
CREATE POLICY "leads_select_sales"
  ON public.leads FOR SELECT
  USING (
    assigned_to = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'sales_direct')
  );

CREATE POLICY "leads_insert_sales"
  ON public.leads FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'sales_direct')
  );

-- leads — kupujący (tylko zatwierdzone przypisane do niego)
CREATE POLICY "leads_select_buyer"
  ON public.leads FOR SELECT
  USING (
    buyer_id = auth.uid() AND
    status = 'approved' AND
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'buyer')
  );

-- rejections — admin
CREATE POLICY "rejections_all_admin"
  ON public.rejections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- rejections — kupujący (swoje)
CREATE POLICY "rejections_all_buyer"
  ON public.rejections FOR ALL
  USING (buyer_id = auth.uid());

-- ── GOTOWE ────────────────────────────────────────────────────
-- Po uruchomieniu zarejestruj się przez /register w aplikacji,
-- a następnie nadaj sobie rolę admina:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE email = 'twoj@email.pl';