import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistScreen } from '../screens/tabs/WatchlistScreen';
import { ScanScreen } from '../screens/tabs/ScanScreen';
import { TravelScreen } from '../screens/tabs/TravelScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import { THEME } from '../theme/tokens';

export type MainTabsParamList = {
  Watchlist: undefined;
  Scan: undefined;
  Travel: undefined;
  Profile: undefined;
};

const Tabs = createBottomTabNavigator<MainTabsParamList>();

const TAB_ICONS: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Watchlist: 'eye',
  Scan: 'barcode',
  Travel: 'airplane',
  Profile: 'person',
};

export function MainTabs(): React.JSX.Element {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'fade', // 100ms tab fade per animation tokens
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.border,
        },
        tabBarActiveTintColor: THEME.colors.green,
        tabBarInactiveTintColor: THEME.colors.muted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof MainTabsParamList]} color={color} size={size} />
        ),
        sceneStyle: { backgroundColor: THEME.colors.background },
      })}
    >
      <Tabs.Screen name="Watchlist" component={WatchlistScreen} />
      <Tabs.Screen name="Scan" component={ScanScreen} />
      <Tabs.Screen name="Travel" component={TravelScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
