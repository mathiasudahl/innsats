const BASE_URL = process.env.INTERVALS_BASE_URL || 'https://intervals.icu/api/v1'
const ATHLETE_ID = process.env.INTERVALS_ATHLETE_ID || 'i303639'
const API_KEY = process.env.INTERVALS_API_KEY || ''

const auth = Buffer.from(`API_KEY:${API_KEY}`).toString('base64')

async function apiFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Basic ${auth}` },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`intervals.icu ${path} → ${res.status}`)
  return res.json()
}

export type Activity = {
  id: string
  start_date_local: string
  type: string
  name: string
  moving_time: number
  distance: number
  icu_training_load: number
  icu_weighted_avg_watts: number
  average_heartrate: number
  max_heartrate: number
  icu_atl: number
  icu_ctl: number
  trainer: boolean
}

export type Event = {
  id: number
  start_date_local: string
  type: string
  name: string
  moving_time: number
  icu_training_load: number
  icu_atl: number
  icu_ctl: number
  paired_activity_id?: string
  description?: string
}

export type Wellness = {
  id: string
  restingHR?: number
  hrv?: number
  weight?: number
  sleepSecs?: number
}

export async function getActivities(oldest: string, newest: string): Promise<Activity[]> {
  return apiFetch(`/athlete/${ATHLETE_ID}/activities`, { oldest, newest })
}

export async function getEvents(oldest: string, newest: string): Promise<Event[]> {
  return apiFetch(`/athlete/${ATHLETE_ID}/events`, { oldest, newest })
}

export async function getWellness(oldest: string, newest: string): Promise<Wellness[]> {
  return apiFetch(`/athlete/${ATHLETE_ID}/wellness`, { oldest, newest })
}

// Sone basert på sykkelwatt (laktatmåling)
export function bikePowerZone(watt: number): string {
  if (watt <= 0) return '?'
  if (watt < 183) return 'I-1'
  if (watt < 210) return 'I-2'
  if (watt < 229) return 'I-3'
  if (watt <= 260) return 'I-4'
  return 'I-5'
}

// Sone basert på HF (løp/svøm)
export function hrZone(hr: number): string {
  if (hr <= 0) return '?'
  if (hr < 130) return 'I-1'
  if (hr < 151) return 'I-2'
  if (hr < 172) return 'I-3'
  if (hr < 183) return 'I-4'
  return 'I-5'
}

export function activityZone(a: Activity): string {
  const type = a.type
  if ((type === 'Ride' || type === 'VirtualRide') && a.icu_weighted_avg_watts > 0) {
    return bikePowerZone(a.icu_weighted_avg_watts)
  }
  return hrZone(a.average_heartrate)
}

export function sportLabel(type: string): string {
  const map: Record<string, string> = {
    Swim: 'Svøm',
    Ride: 'Sykkel',
    VirtualRide: 'Sykkel',
    Run: 'Løp',
    NordicSki: 'Ski',
    WeightTraining: 'Styrke',
  }
  return map[type] ?? type
}

export function sportColor(type: string): string {
  const map: Record<string, string> = {
    Swim: '#38bdf8',
    Ride: '#f97316',
    VirtualRide: '#f97316',
    Run: '#4ade80',
    NordicSki: '#a78bfa',
    WeightTraining: '#facc15',
  }
  return map[type] ?? '#94a3b8'
}
