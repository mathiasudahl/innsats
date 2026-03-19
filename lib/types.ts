export interface Athlete {
  id: string;
  apiKey: string;
  name: string;
  color: string;
  slug: "mathias" | "karoline";
  goals?: AthleteGoals;
  prs?: AthletePRs;
}

export interface AthleteGoals {
  runWeeklyKm?: number;
  rideWeeklyKm?: number;
  swimWeeklyKm?: number;
  targetRace?: string;
  targetDate?: string;
  ctlTarget?: number;
}

export interface AthletePRs {
  run5k?: string;
  run10k?: string;
  runHalf?: string;
  runMarathon?: string;
  swim100m?: string;
  swim1500m?: string;
  rideFTP?: number;
  rideMaxHour?: number;
}

export interface Activity {
  id: number;
  start_date_local: string;
  type: string;
  name: string;
  moving_time: number;
  distance: number;
  icu_training_load?: number;
  average_heartrate?: number;
  average_watts?: number;
  total_elevation_gain?: number;
  icu_intensity?: number;
}

export interface WorkoutEvent {
  id?: number;
  start_date_local: string;
  category: string;
  type: string;
  name: string;
  moving_time?: number;
  icu_training_load?: number;
  description?: string;
}

export interface Wellness {
  id: string; // date YYYY-MM-DD
  ctl?: number;
  atl?: number;
  tsb?: number;
  weight?: number;
  restingHR?: number;
  hrv?: number;
  sleepSecs?: number;
  sleepScore?: number;
  readiness?: number;
  form?: number;
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  description: string;
}

export interface FitnessPoint {
  date: string;
  ctl: number;
  atl: number;
  tsb: number;
}
