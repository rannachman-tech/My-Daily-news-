"use client";

import type { ThemeMode, TimeWindow, TopicId } from "./types";

const KEY = "daily-news-prefs:v2";

export interface Prefs {
  topics: TopicId[];
  theme: ThemeMode;
  window: TimeWindow;
  hideRead: boolean;
  readIds: string[];
}

const DEFAULT_PREFS: Prefs = {
  topics: [],
  theme: "light",
  window: "24h",
  hideRead: false,
  readIds: [],
};

function detectSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return { ...DEFAULT_PREFS, theme: detectSystemTheme() };
    }
    const parsed = JSON.parse(raw);
    if (parsed.theme === "system" || !parsed.theme) {
      parsed.theme = detectSystemTheme();
    }
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {}
}
