import React from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../theme/tokens';
import type { Tier } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  highlightTier?: Exclude<Tier, 'free'>;
  /** When true, renders as a plain view (for TierGate full-screen takeover). */
  inline?: boolean;
}

const PRO_LINK = process.env.EXPO_PUBLIC_STRIPE_PRO_LINK ?? '';
const ELITE_LINK = process.env.EXPO_PUBLIC_STRIPE_ELITE_LINK ?? '';

const PLANS: Array<{
  tier: Exclude<Tier, 'free'>;
  name: string;
  price: string;
  bullets: string[];
  link: string;
}> = [
  {
    tier: 'pro',
    name: 'PRO',
    price: '$9/mo',
    bullets: ['25 tracked products', 'Flights + hotels tracking', 'Discord + email alerts', 'Priority scans'],
    link: PRO_LINK,
  },
  {
    tier: 'elite',
    name: 'ELITE',
    price: '$29/mo',
    bullets: ['Unlimited products', 'SMS + Discord + email', 'API access', 'Everything in Pro'],
    link: ELITE_LINK,
  },
];

export function UpgradeModal({ visible, onClose, highlightTier, inline }: Props): React.JSX.Element {
  const openCheckout = (link: string): void => {
    if (link && !link.includes('PLACEHOLDER')) {
      Linking.openURL(link).catch(() => {});
    }
  };

  const body = (
    <View style={styles.overlay}>
      <Pressable style={styles.close} onPress={onClose} hitSlop={12}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>UNLOCK MORE WITH VIGIL PRO</Text>
        {PLANS.map((plan) => (
          <View
            key={plan.tier}
            style={[styles.planCard, highlightTier === plan.tier && styles.planHighlight]}
          >
            <View style={styles.planTop}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>
            {plan.bullets.map((b) => (
              <Text key={b} style={styles.bullet}>
                ✓ {b}
              </Text>
            ))}
            <Pressable style={styles.upgradeBtn} onPress={() => openCheckout(plan.link)}>
              <Text style={styles.upgradeText}>UPGRADE NOW</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  if (inline) {
    return visible ? body : <View style={styles.overlay} />;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {body}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  close: {
    position: 'absolute',
    top: THEME.spacing.xxl + 16,
    right: THEME.spacing.xl,
    zIndex: 2,
  },
  closeText: { color: THEME.colors.muted, fontSize: THEME.font.sizes.lg },
  content: {
    paddingTop: 96,
    paddingHorizontal: THEME.spacing.xl,
    paddingBottom: THEME.spacing.xxl,
  },
  header: {
    color: THEME.colors.green,
    fontSize: THEME.font.sizes.lg,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  planCard: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
  },
  planHighlight: { borderColor: THEME.colors.green },
  planTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: THEME.spacing.md,
  },
  planName: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.md,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 3,
  },
  planPrice: {
    color: THEME.colors.green,
    fontSize: THEME.font.sizes.lg,
    fontWeight: THEME.font.weights.bold,
  },
  bullet: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.sm,
    paddingVertical: THEME.spacing.xs,
  },
  upgradeBtn: {
    backgroundColor: THEME.colors.green,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  upgradeText: {
    color: THEME.colors.background,
    fontSize: THEME.font.sizes.sm,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 1.5,
  },
});
