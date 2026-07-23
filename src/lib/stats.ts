export function calculateStats(dates: string[], reference = new Date()) {
  const unique = [...new Set(dates)].sort();
  const set = new Set(unique);
  let longest = 0,
    run = 0,
    previous = "";
  for (const date of unique) {
    const gap = previous
      ? (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`)) / 86400000
      : 1;
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  const today = reference.toISOString().slice(0, 10);
  let current = 0;
  let cursor = today;
  while (set.has(cursor)) {
    current++;
    cursor = new Date(Date.parse(`${cursor}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  }
  return { current, longest, total: unique.length, dates: unique };
}
