export interface PlankAttempt {
  id: string;
  /** Local calendar date (YYYY-MM-DD) the attempt counts toward. */
  date: string;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  /** Whether this attempt has been written to Firestore yet (NFR-3/4: offline queueing). */
  synced: boolean;
}
