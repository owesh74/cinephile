export function formatRuntime(minutes: number | null) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatYear(releaseDate: string | Date | null) {
  if (!releaseDate) return null;
  const d = new Date(releaseDate);
  return Number.isNaN(d.getFullYear()) ? null : d.getFullYear();
}

export function formatScore(score: string | number | null | undefined) {
  if (score === null || score === undefined) return null;
  const n = typeof score === "string" ? parseFloat(score) : score;
  return Number.isNaN(n) ? null : n.toFixed(1);
}