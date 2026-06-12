import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { THEME } from '../theme/tokens';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Continuous "system is monitoring" indicator — a rotating cyan arc.
 * Reanimated runs this entirely on the UI thread (the Reanimated
 * equivalent of useNativeDriver: true).
 */
export function RadarPulse({ size = 40, color = THEME.colors.cyan }: Props): React.JSX.Element {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const spin = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ring = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: Math.max(2, size * 0.06),
  };

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.base, ring, { borderColor: color, opacity: 0.18 }]} />
      <Animated.View
        style={[
          styles.base,
          ring,
          spin,
          {
            borderColor: 'transparent',
            borderTopColor: color, // visible arc = the sweep
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: size * 0.09,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  base: { position: 'absolute' },
  dot: { position: 'absolute' },
});
