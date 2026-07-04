import { View } from 'react-native';
import { Rect, Svg } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ChartPoint } from '@/features/stats/chart-data';
import { useTheme } from '@/hooks/use-theme';

export function BarChart({ data, height = 160 }: { data: ChartPoint[]; height?: number }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((point) => point.value));
  const slot = 100 / Math.max(data.length, 1);
  const barWidthPct = slot * 0.6;

  return (
    <View>
      <View style={{ height }}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {data.map((point, index) => {
            const barHeight = (point.value / max) * 92;
            const x = index * slot + (slot - barWidthPct) / 2;
            return (
              <Rect
                key={index}
                x={`${x}%`}
                y={`${100 - barHeight}%`}
                width={`${barWidthPct}%`}
                height={`${barHeight}%`}
                rx={1}
                fill={theme.text}
              />
            );
          })}
        </Svg>
      </View>
      {data.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.one }}>
          <ThemedText type="small" themeColor="textSecondary">
            {data[0].label}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {data[data.length - 1].label}
          </ThemedText>
        </View>
      )}
    </View>
  );
}
