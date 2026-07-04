import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { localDateKey, roundToTenth } from '@/lib/date';
import {
  clearActiveSession,
  getActiveSession,
  getAttemptForDate,
  saveAttempt,
  startActiveSession,
} from '@/lib/plank-storage';
import type { PlankAttempt } from '@/types/plank';

type TimerStatus = 'loading' | 'idle' | 'running' | 'completed';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function usePlankTimer() {
  const [status, setStatus] = useState<TimerStatus>('loading');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [todayAttempt, setTodayAttempt] = useState<PlankAttempt | null>(null);
  const startedAtMsRef = useRef<number | null>(null);

  // Keeps the screen on only while a plank is actively being timed (FR-3.9).
  useEffect(() => {
    if (status !== 'running') return;
    activateKeepAwakeAsync('plank-timer');
    return () => {
      deactivateKeepAwake('plank-timer');
    };
  }, [status]);

  const tick = useCallback(() => {
    if (startedAtMsRef.current !== null) {
      setElapsedSeconds((Date.now() - startedAtMsRef.current) / 1000);
    }
  }, []);

  // On mount, recover any in-progress session (app was killed/backgrounded mid-plank)
  // and check whether today's attempt is already logged (FR-3.6, NFR-2).
  useEffect(() => {
    (async () => {
      const existing = await getAttemptForDate(localDateKey());
      if (existing) {
        setTodayAttempt(existing);
        setStatus('completed');
        return;
      }
      const active = await getActiveSession();
      if (active) {
        startedAtMsRef.current = new Date(active.startedAt).getTime();
        tick();
        setStatus('running');
        return;
      }
      setStatus('idle');
    })();
  }, [tick]);

  // Recompute from timestamps (not elapsed ticks) on foreground/interval so accuracy
  // is unaffected by backgrounding or UI-thread lag (FR-3.4, NFR-1, NFR-2).
  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(tick, 100);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') tick();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [status, tick]);

  const start = useCallback(async () => {
    if (status !== 'idle') return;
    const startedAt = new Date();
    startedAtMsRef.current = startedAt.getTime();
    setElapsedSeconds(0);
    await startActiveSession(startedAt.toISOString());
    setStatus('running');
  }, [status]);

  const stop = useCallback(async () => {
    if (status !== 'running' || startedAtMsRef.current === null) return;
    const startedAtMs = startedAtMsRef.current;
    const endedAt = new Date();
    const durationSeconds = roundToTenth((endedAt.getTime() - startedAtMs) / 1000);
    const attempt: PlankAttempt = {
      id: makeId(),
      date: localDateKey(new Date(startedAtMs)),
      durationSeconds,
      startedAt: new Date(startedAtMs).toISOString(),
      endedAt: endedAt.toISOString(),
      createdAt: endedAt.toISOString(),
    };
    await saveAttempt(attempt);
    await clearActiveSession();
    startedAtMsRef.current = null;
    setTodayAttempt(attempt);
    setElapsedSeconds(attempt.durationSeconds);
    setStatus('completed');
  }, [status]);

  return { status, elapsedSeconds, todayAttempt, start, stop };
}
