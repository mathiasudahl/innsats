export interface OfflineWorkout {
  name: string;
  stravaUrl?: string;
}

// Syklusstart: mandag uke 12 2025
const CYCLE_START = new Date('2025-03-17T00:00:00');

const PROGRAM: Record<number, Record<number, OfflineWorkout>> = {
  1: {
    1: { name: 'No-drop 60km', stravaUrl: 'https://www.strava.com/routes/3352225336858981260' },
    4: { name: 'Swarm ride', stravaUrl: 'https://www.strava.com/routes/3468690405984384200' },
  },
  2: {
    1: { name: 'No-drop 60km', stravaUrl: 'https://www.strava.com/routes/3352225336858981260' },
    4: { name: '5×5min GK', stravaUrl: 'https://www.strava.com/segments/660072' },
  },
  3: {
    1: { name: 'No-drop 60km', stravaUrl: 'https://www.strava.com/routes/3352225336858981260' },
    4: { name: 'TTT 40km', stravaUrl: 'https://www.strava.com/segments/39921716' },
  },
  4: {
    1: { name: 'No-drop 60km', stravaUrl: 'https://www.strava.com/routes/3352225336858981260' },
    4: { name: '2×20 Maridalen-runda', stravaUrl: 'https://www.strava.com/segments/1229519' },
  },
};

export function getOfflineWorkout(date: Date): OfflineWorkout | null {
  const dayOfWeek = (date.getDay() + 6) % 7; // 0=man, 1=tir, ..., 6=søn
  if (dayOfWeek !== 0 && dayOfWeek !== 3) return null; // kun man (0) og tor (3)

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceStart = Math.floor((date.getTime() - CYCLE_START.getTime()) / msPerWeek);
  if (weeksSinceStart < 0) return null;

  const cycleWeek = (weeksSinceStart % 4) + 1; // 1–4
  const programDay = dayOfWeek === 0 ? 1 : 4; // 1=man, 4=tor
  return PROGRAM[cycleWeek]?.[programDay] ?? null;
}
