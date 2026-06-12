import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Tier } from '../types';

interface AuthState {
  session: Session | null;
  user: User | null;
  tier: Tier;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setTier: (tier: Tier) => void;
  signOut: () => Promise<void>;
}

function tierFromUser(user: User | null): Tier {
  // Tier lives in user_metadata until a billing webhook writes it server-side.
  const t = user?.user_metadata?.tier;
  return t === 'pro' || t === 'elite' ? t : 'free';
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  tier: 'free',
  isLoading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      tier: tierFromUser(session?.user ?? null),
      isLoading: false,
    }),

  setTier: (tier) => set({ tier }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, tier: 'free' });
  },
}));

// Hydrate once at module load, then track every auth change.
supabase.auth
  .getSession()
  .then(({ data }) => useAuthStore.getState().setSession(data.session))
  .catch(() => useAuthStore.setState({ isLoading: false }));

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
