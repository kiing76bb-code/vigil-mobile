import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { THEME } from '../../theme/tokens';
import { haptics } from '../../lib/haptics';
import { useWatchlistStore } from '../../store/useWatchlistStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Pre-filled from barcode scan (ScanScreen). */
  initialName?: string;
  initialUrl?: string;
}

export function AddProductModal({ visible, onClose, initialName, initialUrl }: Props): React.JSX.Element {
  const addProduct = useWatchlistStore((s) => s.addProduct);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialName ?? '');
      setUrl(initialUrl ?? '');
      setTarget('');
      setError(null);
    }
  }, [visible, initialName, initialUrl]);

  const submit = async (): Promise<void> => {
    setError(null);
    const targetPrice = parseFloat(target);
    if (!url.trim()) {
      setError('URL is required.');
      return;
    }
    if (isNaN(targetPrice) || targetPrice <= 0) {
      setError('Target price must be a number greater than 0.');
      return;
    }
    setSaving(true);
    try {
      await addProduct({
        name: name.trim() || url.trim(),
        url: url.trim(),
        target_price: targetPrice,
      });
      haptics.success();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save — try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
        pointerEvents="box-none"
      >
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.title}>TRACK A PRODUCT</Text>

          <TextInput
            style={styles.input}
            placeholder="Product name"
            placeholderTextColor={THEME.colors.muted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Product URL (required)"
            placeholderTextColor={THEME.colors.muted}
            autoCapitalize="none"
            keyboardType="url"
            value={url}
            onChangeText={setUrl}
          />
          <TextInput
            style={styles.input}
            placeholder="Target price (e.g. 749.99)"
            placeholderTextColor={THEME.colors.muted}
            keyboardType="decimal-pad"
            value={target}
            onChangeText={setTarget}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={submit} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'SAVING…' : 'START WATCHING'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radius.lg,
    borderTopRightRadius: THEME.radius.lg,
    borderTopWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xl,
    paddingBottom: THEME.spacing.xxl,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
  },
  title: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.md,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 2,
    marginBottom: THEME.spacing.lg,
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.base,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  error: {
    color: THEME.colors.yellow,
    fontSize: THEME.font.sizes.sm,
    marginBottom: THEME.spacing.sm,
  },
  button: {
    backgroundColor: THEME.colors.green,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.lg,
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: THEME.colors.background,
    fontSize: THEME.font.sizes.sm,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 1.5,
  },
});
