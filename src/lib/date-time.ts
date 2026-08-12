export const SITE_TIME_ZONE = "Europe/Sofia";

type DateValue = Date | number | string;

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

const DEFAULT_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DEFAULT_DATE_OPTIONS,
  hour: "2-digit",
  minute: "2-digit",
};

function asValidDate(value: DateValue): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatSiteDate(
  value: DateValue,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
): string {
  const date = asValidDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("bg-BG", {
    ...options,
    timeZone: SITE_TIME_ZONE,
  }).format(date);
}

export function formatSiteDateTime(
  value: DateValue,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_TIME_OPTIONS,
): string {
  return formatSiteDate(value, options);
}

export function siteDateKey(value: DateValue): string {
  const date = asValidDate(value);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: SITE_TIME_ZONE,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function toSiteCalendarDate(value: DateValue): Date | null {
  const key = siteDateKey(value);
  if (!key) return null;
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
