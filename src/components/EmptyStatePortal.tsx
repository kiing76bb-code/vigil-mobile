import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../theme/tokens';
import { haptics } from '../lib/haptics';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { RadarPulse } from './RadarPulse';
import { WatchCard } from './WatchCard';
import { StatusBadge } from './StatusBadge';
import type { Product } from '../types';

/**
 * Zeigarnik + Endowment empty state: the radar is already running, three
 * ghosted cards show what the watchlist WILL look like, and one tap
 * populates instant demo data (local only — no Supabase call).
 */

const GHOST_PRODUCT: Product = {
  id: 'ghost-rtx',
  name: 'RTX 4080',
  url: '',
  target_price: 799,
  current_price: 769,
  user_id: null,
  created_at: '',
};

export function EmptyStatePortal(): React.JSX.Element {
  const loadDemo = useWatchlistStore((s) => s.loadDemo);

  const onDemoTap = (): void => {
    haptics.light();
    loadDemo();
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.radarWrap}>
        <RadarPulse size={72} />
        <Text style={styles.scanning}>SCANNING FOR DROPS</Text>
      </View>

      <WatchCard product={GHOST_PRODUCT} onRemove={() => {}} ghost />

      <View style={[styles.ghostCard]}>
        <View style={styles.ghostRow}>
          <Text style={styles.ghostName}>JFK → LAS</Text>
          <StatusBadge status="watching" />
        </View>
        <Text style={styles.ghostMeta}>flight route · target $180</Text>
      </View>

      <View style={[styles.ghostCard]}>
        <View style={styles.ghostRow}>
          <Text style={styles.ghostName}>Marriott NYC</Text>
          <StatusBadge status="watching" />
        </View>
        <Text style={styles.ghostMeta}>hotel · target $240/night</Text>
      </View>

      <Pressable style={styles.demoButton} onPress={onDemoTap}>
        <Text style={styles.demoText}>TAP TO SEE VIGIL IN ACTION</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.background },
  content: { padding: THEME.spacing.xl, paddingBottom: THEME.spacing.xxl },
  radarWrap: { alignItems: 'center', marginVertical: THEME.spacing.xxl },
  scanning: {
    color: THEME.colors.cyan,
    fontSize: THEME.font.sizes.xs,
    letterSpacing: 3,
    marginTop: THEME.spacing.lg,
  },
  ghostCard: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    opacity: 0.3,
  },
  ghostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ghostName: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.base,
    fontWeight: THEME.font.weights.bold,
  },
  ghostMeta: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.sm,
    marginTop: THEME.spacing.xs,
  },
  demoButton: {
    backgroundColor: THEME.colors.green,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.lg,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  demoText: {
    color: THEME.colors.background,
    fontSize: THEME.font.sizes.sm,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 2,
  },
});
