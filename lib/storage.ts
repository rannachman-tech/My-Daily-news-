"use client";

import type { ThemeMode, TimeWindow, TopicId } from "./types";
import { ALL_TOPIC_IDS } from "./topics";

const KEY = "daily-news-prefs:v1";

export interface Prefs {
  topics: TopicId[];
  theme: ThemeMode;
  window: TimeWindow;
  hideRead: boolean;
  readIds: string[];
}

const DEFAULT_PREFS: Prefs = {
  topics: ALL_TOPIC_IDS,
  theme: "system",
  window: "24h",
  hideRead: false,
  readIds: [],
};

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota / privacy mode failures
  }
}

export function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const prefs = loadPrefs();
  if (prefs.theme === "light") return "light";
  if (prefs.theme === "dark") return "dark";
  // system
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
