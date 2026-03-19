'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { WeekStats } from '@/lib/coach'

type Props = {
  atl: number
  ctl: number
  tsb: number
}

export default function FormGauge({ atl, ctl, tsb }: Props) {
  const tsbColor = tsb > 5 ? '#4ade80' : tsb < -10 ? '#f87171' : '#facc15'
  const tsbLabel = tsb > 10 ? 'Klar for hard økt' : tsb > 0 ? 'God form' : tsb > -10 ? 'Nøytral' : 'Akkumulert fatigue'

  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-3">Form (ATL/CTL/TSB)</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400 mb-1">Fitness (CTL)</div>
          <div className="text-xl font-bold text-blue-400">{ctl.toFixed(0)}</div>
          <div className="text-xs text-zinc-500">Base</div>
        </div>
        <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400 mb-1">Fatigue (ATL)</div>
          <div className="text-xl font-bold text-orange-400">{atl.toFixed(0)}</div>
          <div className="text-xs text-zinc-500">Siste dager</div>
        </div>
        <div className="bg-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400 mb-1">Form (TSB)</div>
          <div className="text-xl font-bold" style={{ color: tsbColor }}>{tsb > 0 ? '+' : ''}{tsb.toFixed(0)}</div>
          <div className="text-xs text-zinc-500">{tsbLabel}</div>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-3 leading-snug">
        TSB = CTL − ATL. Positiv = frisk og klar. Negativ = fatigue. Ideell racedagsTSB: +5 til +20.
      </p>
    </div>
  )
}
