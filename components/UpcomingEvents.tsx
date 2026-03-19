'use client'
import { Event, sportLabel, sportColor } from '@/lib/intervals'

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}t${m > 0 ? `${m}m` : ''}`
  return `${m}min`
}

function dayName(dateStr: string): string {
  const d = new Date(dateStr)
  return ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'][d.getDay()]
}

function dateNum(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()}.${d.getMonth() + 1}`
}

export default function UpcomingEvents({ events, title }: { events: Event[]; title: string }) {
  if (events.length === 0) return null

  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">{title}</h3>
      <div className="flex flex-col gap-2">
        {events.map(e => {
          const done = !!e.paired_activity_id
          const color = sportColor(e.type)
          return (
            <div key={e.id} className={`flex items-start gap-3 p-2.5 rounded-lg ${done ? 'opacity-50' : 'bg-zinc-700/50'}`}>
              <div className="text-center w-10 shrink-0">
                <div className="text-xs text-zinc-400">{dayName(e.start_date_local)}</div>
                <div className="text-sm font-bold text-zinc-200">{dateNum(e.start_date_local)}</div>
              </div>
              <div className="w-1 rounded-full self-stretch shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100 truncate">{e.name}</span>
                  {done && <span className="text-xs text-green-400 shrink-0">✓</span>}
                </div>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-xs text-zinc-400">{sportLabel(e.type)}</span>
                  {e.moving_time > 0 && <span className="text-xs text-zinc-500">{formatTime(e.moving_time)}</span>}
                  {e.icu_training_load > 0 && <span className="text-xs text-zinc-500">TSS {e.icu_training_load}</span>}
                </div>
                {e.description && !done && (
                  <p className="text-xs text-zinc-500 mt-1 leading-snug line-clamp-2">{e.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
