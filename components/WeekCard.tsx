'use client'
import { WeekStats } from '@/lib/coach'

const zoneColors: Record<string, string> = {
  'I-1': 'bg-blue-400',
  'I-2': 'bg-green-400',
  'I-3': 'bg-yellow-400',
  'I-4': 'bg-orange-400',
  'I-5': 'bg-red-500',
}

function MinBadge({ label, count, minutes, tss, color }: { label: string; count: number; minutes: number; tss: number; color: string }) {
  if (count === 0 && minutes === 0) return null
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-zinc-300 w-10">{label}</span>
      <span className="text-xs text-zinc-400">{count > 0 ? `${count}x` : ''} {Math.round(minutes / 60)}t{minutes % 60 > 0 ? `${minutes % 60}m` : ''}</span>
      <span className="text-xs text-zinc-500 ml-auto">TSS {tss}</span>
    </div>
  )
}

export default function WeekCard({ week, isCurrent }: { week: WeekStats; isCurrent: boolean }) {
  const totalZones = Object.values(week.zones).reduce((s, n) => s + n, 0)
  const zones = ['I-1', 'I-2', 'I-3', 'I-4', 'I-5']

  return (
    <div className={`bg-zinc-800 rounded-xl p-4 flex flex-col gap-3 ${isCurrent ? 'ring-2 ring-orange-500/60' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-500 uppercase tracking-wide">{week.weekKey}</span>
          {isCurrent && <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">Denne uken</span>}
          <div className="text-sm text-zinc-300 font-medium">{week.weekLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white">{week.totalTss}</div>
          <div className="text-xs text-zinc-500">TSS</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <MinBadge label="Svøm" count={week.swim.count} minutes={week.swim.minutes} tss={week.swim.tss} color="bg-sky-400" />
        <MinBadge label="Sykkel" count={week.bike.count} minutes={week.bike.minutes} tss={week.bike.tss} color="bg-orange-400" />
        <MinBadge label="Løp" count={week.run.count} minutes={week.run.minutes} tss={week.run.tss} color="bg-green-400" />
        {week.other.minutes > 0 && (
          <MinBadge label="Andre" count={0} minutes={week.other.minutes} tss={week.other.tss} color="bg-purple-400" />
        )}
      </div>

      {totalZones > 0 && (
        <div>
          <div className="text-xs text-zinc-500 mb-1">Sonefordeling</div>
          <div className="flex gap-1 h-3 rounded overflow-hidden">
            {zones.map(z => {
              const count = week.zones[z] || 0
              if (count === 0) return null
              const pct = (count / totalZones) * 100
              return <div key={z} className={`${zoneColors[z]} h-full`} style={{ width: `${pct}%` }} title={`${z}: ${count}`} />
            })}
          </div>
          <div className="flex gap-2 mt-1">
            {zones.filter(z => week.zones[z]).map(z => (
              <span key={z} className="text-xs text-zinc-500">{z}:{week.zones[z]}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
