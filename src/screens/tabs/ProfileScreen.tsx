import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../theme/tokens';
import { useAuthStore } from '../../store/useAuthStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { SavingsCounter } from '../../components/SavingsCounter';
import { UpgradeModal } from '../modals/UpgradeModal';
import type { Tier } from '../../types';

const TIER_COLORS: Record<Tier, string> = {
  free: THEME.colors.muted,
  pro: THEME.colors.green,
  elite: THEME.colors.cyan,
};

export function ProfileScreen(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);
  const signOut = useAuthStore((s) => s.signOut);
  const totalSavings = useWatchlistStore((s) => s.totalSavings);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>PROFILE</Text>

        <View style={styles.card}>
          <Text style={styles.email}>{user?.email ?? '—'}</Text>
          <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[tier] }]}>
            <Text style={styles.tierText}>{tier.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <SavingsCounter value={totalSavings} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
          {tier === 'elite' ? (
            <Text style={styles.planLine}>Elite — all features unlocked. Nothing to upsell.</Text>
          ) : (
            <>
              <Text style={styles.planLine}>
                Current plan: {tier.toUpperCase()}
                {tier === 'free' ? ' — 5 product limit' : ' — 25 product limit'}
              </Text>
              <Pressable style={styles.upgradeBtn} onPress={() => setUpgradeOpen(true)}>
                <Text style={styles.upgradeText}>
                  {tier === 'free' ? 'SEE PRO + ELITE PLANS' : 'UPGRADE TO ELITE'}
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <Pressable style={styles.signOut} onPress={() => signOut()}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.footer}>v1.0.0 · Vigil by Axis Creative LLC</Text>
      </ScrollView>

      <UpgradeModal visible={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.background },
  content: { padding: THEME.spacing.xl, paddingBottom: THEME.spacing.xxl },
  header: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.lg,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 5,
    marginBottom: THEME.spacing.lg,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  email: { color: THEME.colors.white, fontSize: THEME.font.sizes.base },
  tierBadge: {
    borderRadius: THEME.radius.pill,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xs,
  },
  tierText: {
    color: THEME.colors.background,
    fontSize: THEME.font.sizes.xs,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 2,
  },
  sectionTitle: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.xs,
    letterSpacing: 2,
    alignSelf: 'flex-start',
  },
  planLine: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.sm,
    alignSelf: 'flex-start',
  },
  upgradeBtn: {
    backgroundColor: THEME.colors.green,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    marginTop: THEME.spacing.sm,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  upgradeText: {
    color: THEME.colors.background,
    fontSize: THEME.font.sizes.sm,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 1.5,
  },
  signOut: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.lg,
  },
  signOutText: { color: THEME.colors.muted, fontSize: THEME.font.sizes.sm },
  footer: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.xs,
    textAlign: 'center',
    marginTop: THEME.spacing.lg,
  },
});
