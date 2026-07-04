import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PlankAttempt } from '@/types/plank';

const ATTEMPTS_KEY = 'plankapp:attempts';
const ACTIVE_SESSION_KEY = 'plankapp:activeSession';

export interface ActiveSession {
  startedAt: string;
}

export async function getAttempts(): Promise<PlankAttempt[]> {
  const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
  return raw ? (JSON.parse(raw) as PlankAttempt[]) : [];
}

export async function getAttemptForDate(dateKey: string): Promise<PlankAttempt | undefined> {
  const attempts = await getAttempts();
  return attempts.find((a) => a.date === dateKey);
}

export async function saveAttempt(attempt: PlankAttempt): Promise<void> {
  const attempts = await getAttempts();
  attempts.push(attempt);
  await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export async function markAttemptSynced(id: string): Promise<void> {
  const attempts = await getAttempts();
  const updated = attempts.map((attempt) => (attempt.id === id ? { ...attempt, synced: true } : attempt));
  await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
  return raw ? (JSON.parse(raw) as ActiveSession) : null;
}

export async function startActiveSession(startedAt: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ startedAt }));
}

export async function clearActiveSession(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
}
