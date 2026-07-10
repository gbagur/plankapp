import { deleteDoc, doc, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { getAttempts, markAttemptSynced } from '@/lib/plank-storage';
import type { PlankAttempt } from '@/types/plank';

function attemptDocId(userId: string, attempt: PlankAttempt): string {
  return `${userId}_${attempt.date}`;
}

/**
 * Removes an attempt from Firestore. Fire-and-forget like {@link syncPendingAttempts}:
 * if offline, Firestore queues the delete and applies it once connectivity returns.
 * Deleting a doc that never synced is a harmless no-op.
 */
export async function deleteRemoteAttempt(userId: string, attempt: PlankAttempt): Promise<void> {
  await deleteDoc(doc(db, 'plankAttempts', attemptDocId(userId, attempt)));
}

/**
 * Pushes any locally-recorded attempts that haven't reached Firestore yet.
 * Safe to call opportunistically (after Stop, on app foreground) — if
 * offline, Firestore queues the writes and this resolves once they land.
 */
export async function syncPendingAttempts(userId: string): Promise<void> {
  const attempts = await getAttempts();
  const pending = attempts.filter((attempt) => !attempt.synced);

  await Promise.allSettled(
    pending.map(async (attempt) => {
      await setDoc(doc(db, 'plankAttempts', attemptDocId(userId, attempt)), {
        userId,
        date: attempt.date,
        durationSeconds: attempt.durationSeconds,
        startedAt: attempt.startedAt,
        endedAt: attempt.endedAt,
        createdAt: attempt.createdAt,
      });
      await markAttemptSynced(attempt.id);
    })
  );
}
