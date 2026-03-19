"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";
import type { WeatherData } from "@/lib/types";

const WEATHER_CODES: Record<number, string> = {
  0: "Klart",
  1: "Nesten klart", 2: "Delvis skyet", 3: "Overskyet",
  45: "Tåke", 48: "Tåke",
  51: "Yr", 53: "Yr", 55: "Yr",
  61: "Regn", 63: "Regn", 65: "Kraftig regn",
  71: "Snø", 73: "Snø", 75: "Kraftig snø",
  80: "Regnbyger", 81: "Regnbyger", 82: "Kraftige byger",
  95: "Tordenvær",
};

function weatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

export function Header() {
  const { theme, toggle } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then(setWeather)
      .catch(() => {});
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg tracking-tight" style={{ color: "var(--text)" }}>
          Innsats
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {weather && (
            <span style={{ color: "var(--text-subtle)" }}>
              {weatherIcon(weather.weathercode)} {Math.round(weather.temperature)}°C
            </span>
          )}
          <button
            onClick={toggle}
            className="text-lg"
            title="Bytt tema"
            aria-label="Bytt tema"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
}
