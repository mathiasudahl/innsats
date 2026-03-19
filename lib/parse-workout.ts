import type { WorkoutEvent } from "./types";

const TYPE_MAP: Record<string, string> = {
  løp: "Run",
  løping: "Run",
  run: "Run",
  sykkel: "Ride",
  sykling: "Ride",
  ride: "Ride",
  svøm: "Swim",
  svømming: "Swim",
  swim: "Swim",
  styrke: "WeightTraining",
  vekttrening: "WeightTraining",
  weighttraining: "WeightTraining",
  ski: "NordicSki",
  langrenn: "NordicSki",
  nordicski: "NordicSki",
  roing: "Rowing",
  rowing: "Rowing",
};

export function parseWorkoutFromText(text: string): WorkoutEvent | null {
  // Primary: JSON block
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[1].trim());
      if (obj.workout_suggestion && obj.start_date_local && obj.type) {
        return {
          start_date_local: obj.start_date_local,
          category: "WORKOUT",
          type: normalizeType(obj.type),
          name: obj.name ?? "Treningsøkt",
          moving_time: obj.moving_time,
          icu_training_load: obj.icu_training_load,
          description: obj.description,
        };
      }
    } catch {
      // fall through to next method
    }
  }

  // Fallback: pipe format DATO | TYPE | MIN | TSS
  const pipeMatch = text.match(/(\d{4}-\d{2}-\d{2})\s*\|\s*(\w+)\s*\|\s*(\d+)\s*\|\s*(\d+)/);
  if (pipeMatch) {
    const [, date, type, minutes, tss] = pipeMatch;
    return {
      start_date_local: `${date}T09:00:00`,
      category: "WORKOUT",
      type: normalizeType(type),
      name: "Treningsøkt",
      moving_time: parseInt(minutes) * 60,
      icu_training_load: parseInt(tss),
    };
  }

  return null;
}

function normalizeType(raw: string): string {
  const lower = raw.toLowerCase();
  return TYPE_MAP[lower] ?? raw;
}
