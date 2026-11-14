/** Parses a YYYY-MM-DD week start as a calendar date (no time-zone shift). */
function parseDay(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

const dayMonth = new Intl.DateTimeFormat("bg-BG", { day: "numeric", month: "long", timeZone: "UTC" });
const dayOnly = new Intl.DateTimeFormat("bg-BG", { day: "numeric", timeZone: "UTC" });

/** "9 – 15 ноември 2026" for the Monday–Sunday week that starts on `weekStart`. */
export function formatMemeWeek(weekStart: string): string {
  const start = parseDay(weekStart);
  if (!start) return weekStart;
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  const year = end.getUTCFullYear();
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${dayOnly.format(start)} – ${dayMonth.format(end)} ${year}`;
  }
  return `${dayMonth.format(start)} – ${dayMonth.format(end)} ${year}`;
}

/** Whole days left until voting closes (0 on the last day), or null when unknown. */
export function daysLeftToVote(votingEndsAt: string | null | undefined, now: Date = new Date()): number | null {
  if (!votingEndsAt) return null;
  const end = new Date(votingEndsAt);
  if (Number.isNaN(end.getTime())) return null;
  const msLeft = end.getTime() - now.getTime();
  if (msLeft <= 0) return 0;
  return Math.floor(msLeft / (24 * 60 * 60 * 1000));
}

export function votingDeadlineText(votingEndsAt: string | null | undefined, now: Date = new Date()): string {
  const days = daysLeftToVote(votingEndsAt, now);
  const base = "Гласуването приключва в неделя в 23:59";
  if (days === null) return `${base}.`;
  if (days === 0) return `${base} — днес е последният ден!`;
  return `${base} (остават ${days} ${days === 1 ? "ден" : "дни"}).`;
}
