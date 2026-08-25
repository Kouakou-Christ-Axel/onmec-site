"use client";

import { useEffect } from "react";

const STORAGE_KEY = "mec-theme";
const MODES = ["auto", "light", "dark"] as const;
type Mode = (typeof MODES)[number];

function readMode(): Mode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return (MODES as readonly string[]).includes(stored ?? "") ? (stored as Mode) : "auto";
  } catch {
    return "auto";
  }
}

function applyMode(mode: Mode) {
  const html = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const dark = mode === "dark" || (mode === "auto" && prefersDark);
  html.setAttribute("data-mec-mode", mode);
  if (dark) html.setAttribute("data-mec-theme", "dark");
  else html.removeAttribute("data-mec-theme");
}

function setMode(mode: Mode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // stockage indisponible (navigation privée) : le thème reste actif pour la session en cours
  }
  applyMode(mode);
}

export function ThemeToggle() {
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = () => {
      if (readMode() === "auto") applyMode("auto");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setMode(MODES[(MODES.indexOf(readMode()) + 1) % MODES.length])}
      title="Thème : automatique, clair, sombre"
      aria-label="Changer de thème"
      data-mec-theme-toggle=""
      className="flex size-9 flex-none items-center justify-center rounded-sm border border-border-subtle bg-surface-card text-text-muted transition-colors hover:border-border-strong hover:text-ink"
    >
      <span data-mec-icon="auto">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      </span>
      <span data-mec-icon="light">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </span>
      <span data-mec-icon="dark">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
    </button>
  );
}
