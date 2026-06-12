import * as Haptics from 'expo-haptics';

/**
 * Haptic wrapper — every call is fire-and-forget and fails silently
 * (simulators and some Android devices have no haptic engine).
 */

export const haptics = {
  light(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  success(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};
