import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (): Promise<void> => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) setError(err.message);
    // success: onAuthStateChange flips AppNavigator to MainTabs
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.wordmark}>VIGIL</Text>
      <Text style={styles.tagline}>WATCH · ALERT · WIN</Text>

      <TextInput
        style={[styles.input, focused === 'email' && styles.inputFocused]}
        placeholder="Email"
        placeholderTextColor={THEME.colors.muted}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setFocused('email')}
        onBlur={() => setFocused(null)}
      />
      <TextInput
        style={[styles.input, focused === 'password' && styles.inputFocused]}
        placeholder="Password"
        placeholderTextColor={THEME.colors.muted}
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        onFocus={() => setFocused('password')}
        onBlur={() => setFocused(null)}
        onSubmitEditing={submit}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={THEME.colors.background} />
        ) : (
          <Text style={styles.buttonText}>LOG IN</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Create account</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.xxl,
  },
  wordmark: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.xxl,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 8,
    textAlign: 'center',
  },
  tagline: {
    color: THEME.colors.cyan,
    fontSize: THEME.font.sizes.sm,
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xxl,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.base,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  inputFocused: { borderColor: THEME.colors.cyan },
  error: {
    color: THEME.colors.yellow,
    fontSize: THEME.font.sizes.sm,
    marginBottom: THEME.spacing.md,
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
    fontSize: THEME.font.sizes.base,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 1,
  },
  link: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.sm,
    textAlign: 'center',
    marginTop: THEME.spacing.xl,
  },
});
