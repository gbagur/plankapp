import { Alert, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { usePlankTimer } from '@/features/timer/use-plank-timer';
import { formatDuration } from '@/lib/date';

export default function TimerScreen() {
  const { user } = useAuth();
  const { status, elapsedSeconds, todayAttempt, start, stop, deleteToday } = usePlankTimer(user?.uid);

  const confirmDelete = () => {
    Alert.alert(
      "Delete today's plank?",
      'This removes the attempt you logged today. You can record a new one afterwards.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void deleteToday() },
      ]
    );
  };

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
            <>
              <ThemedText themeColor="textSecondary">
                Today&apos;s plank logged: {formatDuration(todayAttempt.durationSeconds)}
              </ThemedText>

              <Pressable onPress={confirmDelete} style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="backgroundSelected" style={styles.actionButton}>
                  <ThemedText type="link" style={styles.deleteText}>
                    Delete
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </>
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
  deleteText: {
    color: '#E5484D',
  },
});
