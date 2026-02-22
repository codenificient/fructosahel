"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return <div className="h-8 w-[3.75rem]" aria-hidden />;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="theme-toggle group"
      data-state={isDark ? "dark" : "light"}
    >
      {/* Track icons */}
      <Sun
        className="theme-toggle-sun"
        strokeWidth={2.5}
        aria-hidden
      />
      <Moon
        className="theme-toggle-moon"
        strokeWidth={2.5}
        aria-hidden
      />

      {/* Sliding thumb */}
      <span className="theme-toggle-thumb" aria-hidden>
        <span className="theme-toggle-thumb-glow" />
      </span>
    </button>
  );
}
