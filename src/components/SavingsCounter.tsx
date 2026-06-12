import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { THEME } from '../theme/tokens';

interface Props {
  value: number;
}

function formatUSD(n: number): string {
  return (
    '$' +
    n
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );
}

/**
 * Animated rolling counter — the displayed number tweens to the new value,
 * never hard-swaps. Driven by a Reanimated shared value on the UI thread;
 * only the formatted text hop runs on JS.
 */
export function SavingsCounter({ value }: Props): React.JSX.Element {
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState('$0.00');

  useEffect(() => {
    progress.value = withTiming(value, {
      duration: THEME.animation.savingsRollMs,
      easing: Easing.out(Easing.cubic),
    });
    return () => cancelAnimation(progress);
  }, [value, progress]);

  useAnimatedReaction(
    () => progress.value,
    (current) => {
      runOnJS(setDisplay)(formatUSD(Math.max(0, current)));
    }
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>TOTAL SAVED</Text>
      <Animated.Text style={styles.amount}>{display}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.xs,
    letterSpacing: 2,
    marginBottom: THEME.spacing.xs,
  },
  amount: {
    color: THEME.colors.green,
    fontSize: THEME.font.sizes.xl,
    fontWeight: THEME.font.weights.bold,
    fontVariant: ['tabular-nums'],
  },
});
