export interface PlankAttempt {
  id: string;
  /** Local calendar date (YYYY-MM-DD) the attempt counts toward. */
  date: string;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
}
