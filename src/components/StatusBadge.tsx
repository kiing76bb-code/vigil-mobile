import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../theme/tokens';
import type { WatchStatus } from '../types';

interface Props {
  status: WatchStatus;
}

const CONFIG: Record<WatchStatus, { label: string; bg: string }> = {
  watching: { label: 'WATCHING', bg: THEME.colors.cyan },
  target_hit: { label: 'TARGET HIT', bg: THEME.colors.green },
  savings_locked: { label: 'SAVINGS LOCKED', bg: THEME.colors.yellow },
};

export function StatusBadge({ status }: Props): React.JSX.Element {
  const { label, bg } = CONFIG[status];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: THEME.radius.pill,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    color: THEME.colors.background,
    fontSize: THEME.font.sizes.xs,
    fontWeight: THEME.font.weights.semibold,
    letterSpacing: 0.5,
  },
});
