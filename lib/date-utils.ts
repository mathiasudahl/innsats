import { format, subDays, addDays, startOfWeek, endOfWeek } from "date-fns";
import { nb } from "date-fns/locale";

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function daysAgo(n: number): string {
  return format(subDays(new Date(), n), "yyyy-MM-dd");
}

export function daysFromNow(n: number): string {
  return format(addDays(new Date(), n), "yyyy-MM-dd");
}

export function formatDate(dateStr: string, fmt = "d. MMM"): string {
  return format(new Date(dateStr), fmt, { locale: nb });
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}t ${m}m`;
  return `${m}m`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export function weekDays(): Date[] {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = start;
  while (d <= end) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

export function isSameDay(dateA: string, dateB: string): boolean {
  return dateA.slice(0, 10) === dateB.slice(0, 10);
}
