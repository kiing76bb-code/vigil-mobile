import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';
import type { FlightRoute, HotelTarget, PricePoint, Product } from '../types';

interface WatchlistState {
  products: Product[];
  flights: FlightRoute[];
  hotels: HotelTarget[];
  totalSavings: number;
  isLoading: boolean;
  isDemo: boolean;
  fetchProducts: (signal?: AbortSignal) => Promise<void>;
  addProduct: (input: { name: string; url: string; target_price: number }) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  fetchFlights: (signal?: AbortSignal) => Promise<void>;
  fetchHotels: (signal?: AbortSignal) => Promise<void>;
  computeSavings: () => void;
  loadDemo: () => void;
}

function savingsOf(target: number, current: number | null): number {
  if (current == null || current > target) return 0;
  return target - current;
}

/** 90 days of plausible mock history trending down to `end`. */
export function mockHistory(start: number, end: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = Date.now();
  for (let d = 90; d >= 0; d -= 3) {
    const t = 1 - d / 90;
    const wobble = Math.sin(d * 1.7) * (start - end) * 0.06;
    const price = start - (start - end) * t * t + wobble;
    points.push({
      date: new Date(now - d * 86400000).toISOString().slice(0, 10),
      price: Math.max(end * 0.97, Math.round(price * 100) / 100),
    });
  }
  return points;
}

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-rtx',
    name: 'RTX 4080 Super',
    url: 'https://www.amazon.com/dp/B0CS3TDV19',
    target_price: 799,
    current_price: 769,
    user_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-xm5',
    name: 'Sony WH-1000XM5',
    url: 'https://www.amazon.com/dp/B09XS7JWHH',
    target_price: 280,
    current_price: 239,
    user_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-airpods',
    name: 'AirPods Pro 2',
    url: 'https://www.amazon.com/dp/B0BDHWDR12',
    target_price: 200,
    current_price: 189,
    user_id: null,
    created_at: new Date().toISOString(),
  },
];

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  products: [],
  flights: [],
  hotels: [],
  totalSavings: 0,
  isLoading: false,
  isDemo: false,

  fetchProducts: async (signal) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    set({ isLoading: true });
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (signal) query = query.abortSignal(signal);
      const { data, error } = await query;
      if (error) throw error;
      set({ products: (data ?? []) as Product[], isDemo: false });
      get().computeSavings();
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        // Surface nothing fatal — empty state handles it; keep demo if active.
        if (!get().isDemo) set({ products: get().products });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (input) => {
    const uid = useAuthStore.getState().user?.id;
    const { data, error } = await supabase
      .from('products')
      .insert({ ...input, user_id: uid ?? null })
      .select()
      .single();
    if (error) throw error;
    const product = data as Product;
    set({ products: [product, ...get().products], isDemo: false });
    get().computeSavings();
    return product;
  },

  removeProduct: async (id) => {
    if (id.startsWith('demo-')) {
      set({ products: get().products.filter((p) => p.id !== id) });
      get().computeSavings();
      return;
    }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    set({ products: get().products.filter((p) => p.id !== id) });
    get().computeSavings();
  },

  fetchFlights: async (signal) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    try {
      let query = supabase
        .from('flight_routes')
        .select('*')
        .eq('user_id', uid)
        .order('last_updated', { ascending: false });
      if (signal) query = query.abortSignal(signal);
      const { data, error } = await query;
      if (error) throw error;
      set({ flights: (data ?? []) as FlightRoute[] });
      get().computeSavings();
    } catch {
      // table may not exist yet — see DECISIONS.md schema drift note
    }
  },

  fetchHotels: async (signal) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    try {
      let query = supabase
        .from('hotel_targets')
        .select('*')
        .eq('user_id', uid)
        .order('last_updated', { ascending: false });
      if (signal) query = query.abortSignal(signal);
      const { data, error } = await query;
      if (error) throw error;
      set({ hotels: (data ?? []) as HotelTarget[] });
      get().computeSavings();
    } catch {
      // table may not exist yet — see DECISIONS.md schema drift note
    }
  },

  computeSavings: () => {
    const { products, flights, hotels } = get();
    const total =
      products.reduce((sum, p) => sum + savingsOf(p.target_price, p.current_price), 0) +
      flights.reduce((sum, f) => sum + savingsOf(f.target_price, f.current_price), 0) +
      hotels.reduce((sum, h) => sum + savingsOf(h.target_price, h.current_price), 0);
    set({ totalSavings: Math.round(total * 100) / 100 });
  },

  loadDemo: () => {
    set({ products: DEMO_PRODUCTS, isDemo: true });
    get().computeSavings();
  },
}));
