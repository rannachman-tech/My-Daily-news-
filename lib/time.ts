/**
 * Time helpers — all in user's local timezone.
 */

export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now.getTime() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  return `${wk}w ago`;
}

export function withinWindow(
  iso: string,
  windowKey: "12h" | "24h" | "week",
  now: Date = new Date(),
): boolean {
  const then = new Date(iso).getTime();
  const diff = now.getTime() - then;
  const hours = diff / (1000 * 60 * 60);
  if (windowKey === "12h") return hours <= 12;
  if (windowKey === "24h") return hours <= 24;
  return hours <= 24 * 7;
}

export function formatLocalTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function formatLocalDate(d: Date = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
