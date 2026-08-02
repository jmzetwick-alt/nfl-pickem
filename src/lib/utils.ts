import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatKickoff(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

export function isGameLocked(lockTime: string): boolean {
  return new Date(lockTime) <= new Date();
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
