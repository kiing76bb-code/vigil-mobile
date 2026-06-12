import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../theme/tokens';
import { haptics } from '../../lib/haptics';
import { AddProductModal } from '../modals/AddProductModal';

/**
 * Barcode scanning runs through expo-camera (expo-barcode-scanner was
 * merged into it and removed from the SDK). No Amazon Product Advertising
 * API credentials exist yet, so a successful scan pre-fills the
 * AddProductModal with an Amazon search URL for the barcode — see DECISIONS.md.
 */
export function ScanScreen(): React.JSX.Element {
  const [permission, requestPermission] = useCameraPermissions();
  const [modalOpen, setModalOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const lockRef = useRef(false);
  const pop = useSharedValue(1);

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const onScan = useCallback(
    (result: BarcodeScanningResult): void => {
      if (lockRef.current || modalOpen) return;
      lockRef.current = true;

      // 150ms scale pop (cubic-bezier easing) + medium haptic per tokens
      pop.value = withSequence(
        withTiming(1.12, {
          duration: THEME.animation.barcodePopMs / 2,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        }),
        withTiming(1, { duration: THEME.animation.barcodePopMs / 2 })
      );
      haptics.medium();

      setScannedCode(result.data);
      setModalOpen(true);
    },
    [modalOpen, pop]
  );

  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.root, styles.centered]}>
        <Text style={styles.permissionTitle}>CAMERA ACCESS NEEDED</Text>
        <Text style={styles.permissionBody}>
          Vigil scans product barcodes so you can start tracking prices in one move.
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>ENABLE CAMERA</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'],
        }}
        onBarcodeScanned={onScan}
      />

      <Animated.View style={[styles.frame, popStyle]} pointerEvents="none">
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </Animated.View>

      <View style={styles.hint} pointerEvents="none">
        <Text style={styles.hintText}>AIM AT A BARCODE</Text>
      </View>

      <AddProductModal
        visible={modalOpen}
        onClose={() => {
          setModalOpen(false);
          lockRef.current = false;
        }}
        initialName={scannedCode ? `Scanned item ${scannedCode}` : undefined}
        initialUrl={
          scannedCode ? `https://www.amazon.com/s?k=${encodeURIComponent(scannedCode)}` : undefined
        }
      />
    </View>
  );
}

const CORNER = 28;
const BORDER = 3;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.background },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xxl,
  },
  permissionTitle: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.md,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 2,
    marginBottom: THEME.spacing.md,
  },
  permissionBody: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.sm,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  permissionBtn: {
    backgroundColor: THEME.colors.green,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xxl,
  },
  permissionBtnText: {
    color: THEME.colors.background,
    fontWeight: THEME.font.weights.bold,
    fontSize: THEME.font.sizes.sm,
    letterSpacing: 1.5,
  },
  frame: {
    position: 'absolute',
    top: '28%',
    alignSelf: 'center',
    width: 260,
    height: 180,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: THEME.colors.cyan,
  },
  tl: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER },
  tr: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER },
  bl: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  br: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },
  hint: {
    position: 'absolute',
    bottom: 64,
    alignSelf: 'center',
  },
  hintText: {
    color: THEME.colors.cyan,
    fontSize: THEME.font.sizes.xs,
    letterSpacing: 3,
  },
});
