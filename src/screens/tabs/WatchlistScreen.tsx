import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../theme/tokens';
import { useAuthStore } from '../../store/useAuthStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { TIER_LIMITS, productStatus, type Product } from '../../types';
import { WatchCard } from '../../components/WatchCard';
import { RadarPulse } from '../../components/RadarPulse';
import { SavingsCounter } from '../../components/SavingsCounter';
import { EmptyStatePortal } from '../../components/EmptyStatePortal';
import { AddProductModal } from '../modals/AddProductModal';
import { UpgradeModal } from '../modals/UpgradeModal';
import { TargetHitModal } from '../modals/TargetHitModal';

export function WatchlistScreen(): React.JSX.Element {
  const tier = useAuthStore((s) => s.tier);
  const products = useWatchlistStore((s) => s.products);
  const totalSavings = useWatchlistStore((s) => s.totalSavings);
  const fetchProducts = useWatchlistStore((s) => s.fetchProducts);
  const removeProduct = useWatchlistStore((s) => s.removeProduct);

  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [hitProduct, setHitProduct] = useState<Product | null>(null);
  const celebratedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  // Victory screen: fire once per product whose target is hit.
  useEffect(() => {
    const hit = products.find(
      (p) => productStatus(p) === 'target_hit' && !celebratedIds.current.has(p.id)
    );
    if (hit) {
      celebratedIds.current.add(hit.id);
      setHitProduct(hit);
    }
  }, [products]);

  const onAddPress = useCallback((): void => {
    if (products.length >= TIER_LIMITS[tier]) {
      setUpgradeOpen(true);
    } else {
      setAddOpen(true);
    }
  }, [products.length, tier]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <WatchCard product={item} onRemove={removeProduct} />,
    [removeProduct]
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>VIGIL</Text>
        <RadarPulse size={28} />
      </View>

      <View style={styles.savingsBar}>
        <SavingsCounter value={totalSavings} />
      </View>

      {products.length === 0 ? (
        <EmptyStatePortal />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable style={styles.fab} onPress={onAddPress}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <AddProductModal visible={addOpen} onClose={() => setAddOpen(false)} />
      <UpgradeModal visible={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <TargetHitModal
        visible={hitProduct != null}
        product={hitProduct}
        onClose={() => setHitProduct(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
  },
  wordmark: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.lg,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 5,
  },
  savingsBar: {
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  list: { padding: THEME.spacing.xl, paddingBottom: 96 },
  fab: {
    position: 'absolute',
    right: THEME.spacing.xl,
    bottom: THEME.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: THEME.colors.green,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: THEME.colors.background,
    fontSize: THEME.font.sizes.xl,
    fontWeight: THEME.font.weights.bold,
    lineHeight: THEME.font.sizes.xl + 4,
  },
});
