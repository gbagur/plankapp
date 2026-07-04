import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { usePlankTimer } from '@/features/timer/use-plank-timer';
import { formatDuration } from '@/lib/date';

export default function TimerScreen() {
  const { status, elapsedSeconds, todayAttempt, start, stop } = usePlankTimer();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="title" style={styles.title}>
            Plank Challenge
          </ThemedText>

          <ThemedText type="title" style={styles.timerDisplay}>
            {formatDuration(elapsedSeconds)}
          </ThemedText>

          {status === 'completed' && todayAttempt && (
            <ThemedText themeColor="textSecondary">
              Today&apos;s plank logged: {formatDuration(todayAttempt.durationSeconds)}
            </ThemedText>
          )}

          {status === 'idle' && (
            <Pressable onPress={start} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundSelected" style={styles.actionButton}>
                <ThemedText type="link">Start</ThemedText>
              </ThemedView>
            </Pressable>
          )}

          {status === 'running' && (
            <Pressable onPress={stop} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundSelected" style={styles.actionButton}>
                <ThemedText type="link">Stop</ThemedText>
              </ThemedView>
            </Pressable>
          )}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  title: {
    textAlign: 'center',
  },
  timerDisplay: {
    fontVariant: ['tabular-nums'],
    fontSize: 56,
  },
  actionButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
