import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { THEME } from '../theme/tokens';
import { haptics } from '../lib/haptics';
import { productStatus, type PricePoint, type Product } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriceChart } from './PriceChart';
import { mockHistory } from '../store/useWatchlistStore';

interface Props {
  product: Product;
  onRemove: (id: string) => void;
  ghost?: boolean;
  priceHistory?: PricePoint[];
}

export function WatchCard({ product, onRemove, ghost, priceHistory }: Props): React.JSX.Element {
  const status = productStatus(product);
  const [expanded, setExpanded] = useState(false);
  const borderFlash = useSharedValue(0);
  const announcedHit = useRef(false);

  useEffect(() => {
    if (status === 'target_hit' && !announcedHit.current && !ghost) {
      announcedHit.current = true;
      haptics.success();
      borderFlash.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.4, { duration: 600 })
      );
    }
  }, [status, ghost, borderFlash]);

  const flashStyle = useAnimatedStyle(() => ({
    borderColor:
      status === 'target_hit'
        ? THEME.colors.green
        : THEME.colors.border,
    shadowOpacity: borderFlash.value * 0.6,
  }));

  const savings =
    product.current_price != null && product.current_price <= product.target_price
      ? product.target_price - product.current_price
      : 0;

  const history =
    priceHistory ??
    mockHistory(product.target_price * 1.25, product.current_price ?? product.target_price);

  const card = (
    <Animated.View style={[styles.card, flashStyle, ghost && styles.ghost]}>
      <Pressable onPress={() => !ghost && setExpanded((e) => !e)}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <StatusBadge status={status} />
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>
            {product.current_price != null ? `$${product.current_price.toFixed(2)}` : '—'}
          </Text>
          <Text style={styles.targetPrice}>target ${product.target_price.toFixed(2)}</Text>
          {savings > 0 ? (
            <Text style={styles.savings}>+${savings.toFixed(2)} saved</Text>
          ) : null}
        </View>
        {expanded ? <PriceChart priceHistory={history} targetPrice={product.target_price} /> : null}
      </Pressable>
    </Animated.View>
  );

  if (ghost) return card;

  return (
    <Swipeable
      renderRightActions={() => (
        <RectButton style={styles.deleteAction} onPress={() => onRemove(product.id)}>
          <Text style={styles.deleteText}>REMOVE</Text>
        </RectButton>
      )}
      overshootRight={false}
    >
      {card}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    shadowColor: THEME.colors.green,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
  },
  ghost: { opacity: 0.3 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
  },
  name: {
    flex: 1,
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.base,
    fontWeight: THEME.font.weights.bold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
  },
  currentPrice: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.lg,
    fontWeight: THEME.font.weights.bold,
    fontVariant: ['tabular-nums'],
  },
  targetPrice: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.sm,
  },
  savings: {
    color: THEME.colors.green,
    fontSize: THEME.font.sizes.sm,
    fontWeight: THEME.font.weights.semibold,
    marginLeft: 'auto',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    marginBottom: THEME.spacing.md,
  },
  deleteText: {
    color: THEME.colors.yellow,
    fontSize: THEME.font.sizes.xs,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 1,
  },
});
