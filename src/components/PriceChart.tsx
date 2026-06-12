import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';
import { THEME } from '../theme/tokens';
import type { PricePoint } from '../types';

interface Props {
  priceHistory: PricePoint[];
  targetPrice: number;
}

export function PriceChart({ priceHistory, targetPrice }: Props): React.JSX.Element {
  const data = priceHistory.map((p) => ({ x: p.date.slice(5), y: p.price }));
  const targetLine = data.map((d) => ({ x: d.x, y: targetPrice }));
  const tickValues = data
    .filter((_, i) => i % Math.max(1, Math.floor(data.length / 4)) === 0)
    .map((d) => d.x);

  return (
    <View style={styles.wrap}>
      <VictoryChart height={160} padding={{ top: 12, bottom: 28, left: 48, right: 12 }}>
        <VictoryAxis
          tickValues={tickValues}
          style={{
            axis: { stroke: THEME.colors.border },
            tickLabels: { fill: THEME.colors.muted, fontSize: 9 },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t: number) => `$${Math.round(t)}`}
          style={{
            axis: { stroke: 'transparent' },
            grid: { stroke: THEME.colors.border, strokeDasharray: '2,6' },
            tickLabels: { fill: THEME.colors.muted, fontSize: 9 },
          }}
        />
        <VictoryLine
          data={targetLine}
          style={{ data: { stroke: THEME.colors.green, strokeDasharray: '6,4', strokeWidth: 1 } }}
        />
        <VictoryLine
          data={data}
          style={{ data: { stroke: THEME.colors.cyan, strokeWidth: 2 } }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: 'transparent' },
});
