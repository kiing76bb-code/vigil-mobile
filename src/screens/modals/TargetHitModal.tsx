import React, { useEffect } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { THEME } from '../../theme/tokens';
import { haptics } from '../../lib/haptics';
import type { Product } from '../../types';

interface Props {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

const AMAZON_TAG = process.env.EXPO_PUBLIC_AMAZON_TAG ?? 'vigildrop-20';
const PARTICLES = 8;

function Particle({ index, fire }: { index: number; fire: boolean }): React.JSX.Element {
  const progress = useSharedValue(0);
  const angle = (index / PARTICLES) * Math.PI * 2;

  useEffect(() => {
    if (fire) {
      progress.value = 0;
      // 250ms radial spring burst per animation tokens — UI thread only
      progress.value = withDelay(
        50,
        withSpring(1, { damping: 12, stiffness: 180 })
      );
    }
  }, [fire, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: withTiming(fire ? 1 - progress.value * 0.9 : 0, {
      duration: THEME.animation.targetBurstMs,
      easing: Easing.out(Easing.quad),
    }),
    transform: [
      { translateX: Math.cos(angle) * 90 * progress.value },
      { translateY: Math.sin(angle) * 90 * progress.value },
      { scale: 1 - progress.value * 0.5 },
    ],
  }));

  return <Animated.View style={[styles.particle, style]} />;
}

export function TargetHitModal({ visible, product, onClose }: Props): React.JSX.Element {
  useEffect(() => {
    if (visible) {
      haptics.success();
      const timer = setTimeout(onClose, 4000); // auto-dismiss
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, onClose]);

  if (!product) return <></>;

  const savings =
    product.current_price != null ? product.target_price - product.current_price : 0;

  const buyNow = (): void => {
    const sep = product.url.includes('?') ? '&' : '?';
    const url = product.url.includes('amazon.')
      ? `${product.url}${sep}tag=${AMAZON_TAG}`
      : product.url;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.center}>
          {Array.from({ length: PARTICLES }, (_, i) => (
            <Particle key={i} index={i} fire={visible} />
          ))}
          <Text style={styles.title}>TARGET HIT</Text>
          <Text style={styles.product}>{product.name}</Text>
          {savings > 0 ? (
            <Text style={styles.savings}>YOU SAVED ${savings.toFixed(2)}</Text>
          ) : null}
          <Pressable style={styles.buyBtn} onPress={buyNow}>
            <Text style={styles.buyText}>BUY NOW</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 15, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center' },
  particle: {
    position: 'absolute',
    top: '40%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.green,
  },
  title: {
    color: THEME.colors.green,
    fontSize: THEME.font.sizes.xxl,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 4,
  },
  product: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.md,
    marginTop: THEME.spacing.md,
  },
  savings: {
    color: THEME.colors.green,
    fontSize: THEME.font.sizes.lg,
    fontWeight: THEME.font.weights.bold,
    marginTop: THEME.spacing.sm,
  },
  buyBtn: {
    backgroundColor: THEME.colors.green,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xxl,
    marginTop: THEME.spacing.xl,
  },
  buyText: {
    color: THEME.colors.background,
    fontSize: THEME.font.sizes.sm,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 2,
  },
});
