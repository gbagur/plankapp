/** Returns the device's local calendar date as YYYY-MM-DD (per NFR-9: daily boundaries use local timezone). */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function roundToTenth(seconds: number): number {
  return Math.round(seconds * 10) / 10;
}

/** Formats seconds as mm:ss.d for the live timer and history displays. */
export function formatDuration(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${seconds.toFixed(1).padStart(4, '0')}`;
}
