-- ============================================================
-- Vigil mobile — schema alignment migration
-- RUN THIS ONCE in the Supabase SQL Editor (project vqjrwdnffqzwhzjswvic)
-- before using the mobile app against live data.
--
-- WHY THIS EXISTS (see DECISIONS.md): the scaffold ground truth
-- declares a schema that is NOT what is currently live. Live today:
--   products(id, product_name, target_price, current_price,
--            retail_link, last_updated)  — no user_id
--   price_history(...)
-- and price_alerts / flight_routes / hotel_targets do not exist.
-- This migration renames/extends to the declared shape without
-- destroying existing data, creates the missing tables, and
-- restores the anon grants that are currently missing entirely.
-- Idempotent: safe to run twice.
-- ============================================================

-- products: align column names + add user_id/created_at
ALTER TABLE IF EXISTS products RENAME COLUMN product_name TO name;
ALTER TABLE IF EXISTS products RENAME COLUMN retail_link TO url;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL CHECK (alert_type IN ('product', 'flight', 'hotel')),
  reference_id uuid NOT NULL,
  old_price numeric(10,2),
  new_price numeric(10,2),
  savings numeric(10,2),
  alerted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flight_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin text NOT NULL,
  destination text NOT NULL,
  target_price numeric(10,2) NOT NULL,
  current_price numeric(10,2),
  departure_date date,
  return_date date,
  affiliate_link text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hotel_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  hotel_name text NOT NULL,
  target_price numeric(10,2) NOT NULL,
  current_price numeric(10,2),
  check_in date,
  check_out date,
  affiliate_link text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_updated timestamptz DEFAULT now()
);

-- Restore the missing anon/authenticated grants (the June 11 401 issue)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products,
  public.flight_routes, public.hotel_targets TO anon, authenticated;
GRANT SELECT, INSERT ON public.price_alerts TO anon, authenticated;
GRANT SELECT, INSERT ON public.price_history TO anon, authenticated;

-- NOTE: once real users sign up, enable RLS with per-user policies:
--   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "own rows" ON products
--     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- (repeat per table). Left disabled to match the current internal-tool posture.
