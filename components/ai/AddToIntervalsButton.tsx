"use client";

import { useState } from "react";
import type { WorkoutEvent } from "@/lib/types";

const ATHLETE_IDS: Record<string, string> = {
  mathias: "i303639",
  karoline: "i456432",
};

interface AddToIntervalsButtonProps {
  workout: WorkoutEvent;
  athleteSlug: string;
  color: string;
  onAdded: (url: string) => void;
}

export function AddToIntervalsButton({ workout, athleteSlug, color, onAdded }: AddToIntervalsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteSlug, event: workout }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Feil");
      }
      const created: WorkoutEvent = await res.json();
      const dateStr = created.start_date_local ?? workout.start_date_local ?? "";
      const date = dateStr.slice(0, 10);
      const athleteId = ATHLETE_IDS[athleteSlug];
      onAdded(`https://intervals.icu/athlete/${athleteId}/activities?w=${date}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukjent feil");
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={add}
        disabled={loading}
        className="text-xs px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
        style={{
          backgroundColor: `${color}15`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        {loading ? "Legger til..." : "Legg til i Intervals"}
      </button>
      {error && <span className="text-xs" style={{ color: "#dc2626" }}>{error}</span>}
    </div>
  );
}
