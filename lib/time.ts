import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "Europe/Berlin";

export function getDateKey(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

export function todayInTimezone(timezone: string = DEFAULT_TIMEZONE): string {
  return getDateKey(new Date(), timezone);
}

export function zonedDate(dateKey: string, timezone: string = DEFAULT_TIMEZONE): Date {
  return fromZonedTime(`${dateKey}T09:00:00`, timezone);
}

export function monthWindow(baseDate: Date, timezone: string = DEFAULT_TIMEZONE): {
  first: Date;
  keys: string[];
} {
  const zoned = toZonedTime(baseDate, timezone);
  const year = zoned.getFullYear();
  const month = zoned.getMonth();

  const firstDate = new Date(Date.UTC(year, month, 1, 8, 0, 0));
  const keys: string[] = [];

  for (let i = 0; i < 30; i += 1) {
    const cursor = new Date(Date.UTC(year, month, 1 + i, 8, 0, 0));
    keys.push(formatInTimeZone(cursor, timezone, "yyyy-MM-dd"));
  }

  return { first: firstDate, keys };
}
