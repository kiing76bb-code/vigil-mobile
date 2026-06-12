/**
 * Shared row types matching the Supabase schema declared in the scaffold
 * ground truth. See supabase-migration.sql + DECISIONS.md for the schema
 * drift between this shape and what is currently live in the project.
 */

export type Tier = 'free' | 'pro' | 'elite';

export interface Product {
  id: string;
  name: string;
  url: string;
  target_price: number;
  current_price: number | null;
  user_id: string | null;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  alert_type: 'product' | 'flight' | 'hotel';
  reference_id: string;
  old_price: number;
  new_price: number;
  savings: number;
  alerted_at: string;
}

export interface FlightRoute {
  id: string;
  origin: string;
  destination: string;
  target_price: number;
  current_price: number | null;
  departure_date: string;
  return_date: string | null;
  affiliate_link: string | null;
  user_id: string | null;
  last_updated: string;
}

export interface HotelTarget {
  id: string;
  city: string;
  hotel_name: string;
  target_price: number;
  current_price: number | null;
  check_in: string;
  check_out: string;
  affiliate_link: string | null;
  user_id: string | null;
  last_updated: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export type WatchStatus = 'watching' | 'target_hit' | 'savings_locked';

export function productStatus(p: Product): WatchStatus {
  if (p.current_price != null && p.current_price <= p.target_price) {
    return 'target_hit';
  }
  return 'watching';
}

export const TIER_LIMITS: Record<Tier, number> = {
  free: 5,
  pro: 25,
  elite: Number.POSITIVE_INFINITY,
};

export const TIER_RANK: Record<Tier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
};
