import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../../theme/tokens';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import type { FlightRoute, HotelTarget, WatchStatus } from '../../types';
import { TierGate } from '../../components/TierGate';
import { StatusBadge } from '../../components/StatusBadge';
import { RadarPulse } from '../../components/RadarPulse';

type Section = 'flights' | 'hotels';

function statusOf(target: number, current: number | null): WatchStatus {
  return current != null && current <= target ? 'target_hit' : 'watching';
}

function TravelInner(): React.JSX.Element {
  const [section, setSection] = useState<Section>('flights');
  const flights = useWatchlistStore((s) => s.flights);
  const hotels = useWatchlistStore((s) => s.hotels);
  const fetchFlights = useWatchlistStore((s) => s.fetchFlights);
  const fetchHotels = useWatchlistStore((s) => s.fetchHotels);

  useEffect(() => {
    const controller = new AbortController();
    fetchFlights(controller.signal);
    fetchHotels(controller.signal);
    return () => controller.abort();
  }, [fetchFlights, fetchHotels]);

  const renderFlight = ({ item }: { item: FlightRoute }): React.JSX.Element => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>
          {item.origin} → {item.destination}
        </Text>
        <Text style={styles.rowMeta}>
          ${item.current_price ?? '—'} now · target ${item.target_price}
        </Text>
      </View>
      <StatusBadge status={statusOf(item.target_price, item.current_price)} />
    </View>
  );

  const renderHotel = ({ item }: { item: HotelTarget }): React.JSX.Element => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{item.hotel_name}</Text>
        <Text style={styles.rowMeta}>
          {item.city} · {item.check_in} → {item.check_out} · ${item.current_price ?? '—'} vs $
          {item.target_price}
        </Text>
      </View>
      <StatusBadge status={statusOf(item.target_price, item.current_price)} />
    </View>
  );

  const empty = (label: string): React.JSX.Element => (
    <View style={styles.empty}>
      <RadarPulse size={56} />
      <Text style={styles.emptyText}>No {label} tracked yet</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Text style={styles.header}>TRAVEL</Text>

      <View style={styles.segment}>
        {(['flights', 'hotels'] as Section[]).map((s) => (
          <Pressable
            key={s}
            style={[styles.segmentBtn, section === s && styles.segmentActive]}
            onPress={() => setSection(s)}
          >
            <Text style={[styles.segmentText, section === s && styles.segmentTextActive]}>
              {s.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {section === 'flights' ? (
        <FlatList
          data={flights}
          keyExtractor={(item) => item.id}
          renderItem={renderFlight}
          ListEmptyComponent={empty('flights')}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={(item) => item.id}
          renderItem={renderHotel}
          ListEmptyComponent={empty('hotels')}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

export function TravelScreen(): React.JSX.Element {
  return (
    <TierGate requiredTier="pro">
      <TravelInner />
    </TierGate>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.background },
  header: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.lg,
    fontWeight: THEME.font.weights.bold,
    letterSpacing: 5,
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
  },
  segment: {
    flexDirection: 'row',
    marginHorizontal: THEME.spacing.xl,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
  },
  segmentActive: { backgroundColor: THEME.colors.background },
  segmentText: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.xs,
    fontWeight: THEME.font.weights.semibold,
    letterSpacing: 2,
  },
  segmentTextActive: { color: THEME.colors.cyan },
  list: { padding: THEME.spacing.xl, paddingTop: THEME.spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  rowMain: { flex: 1 },
  rowTitle: {
    color: THEME.colors.white,
    fontSize: THEME.font.sizes.base,
    fontWeight: THEME.font.weights.bold,
  },
  rowMeta: {
    color: THEME.colors.muted,
    fontSize: THEME.font.sizes.sm,
    marginTop: THEME.spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingTop: THEME.spacing.xxl * 2,
    gap: THEME.spacing.lg,
  },
  emptyText: { color: THEME.colors.muted, fontSize: THEME.font.sizes.sm },
});
