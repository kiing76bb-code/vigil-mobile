import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { THEME } from '../theme/tokens';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: THEME.colors.background,
    card: THEME.colors.surface,
    border: THEME.colors.border,
    text: THEME.colors.white,
    primary: THEME.colors.green,
  },
};

function Splash(): React.JSX.Element {
  return (
    <View style={styles.splash}>
      <Text style={styles.wordmark}>VIGIL</Text>
      <Text style={styles.tagline}>WATCH · ALERT · WIN</Text>
      <ActivityIndicator color={THEME.colors.cyan} style={styles.spinner} />
    </View>
  );
}

export function AppNavigator(): React.JSX.Element {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <NavigationContainer theme={navTheme}>
      {isLoading ? <Splash /> : session ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.xxl,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 8,
  },
  tagline: {
    color: THEME.colors.cyan,
    fontSize: THEME.font.sizes.sm,
    letterSpacing: 4,
    marginTop: THEME.spacing.sm,
  },
  spinner: { marginTop: THEME.spacing.xl },
});
