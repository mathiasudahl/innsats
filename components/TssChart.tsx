'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { WeekStats } from '@/lib/coach'

const TARGET_TSS = 350

export default function TssChart({ weeks }: { weeks: WeekStats[] }) {
  const data = weeks.map(w => ({
    name: w.weekKey.split('-W')[1] ? `U${w.weekKey.split('-W')[1]}` : w.weekKey,
    label: w.weekLabel,
    swim: w.swim.tss,
    bike: w.bike.tss,
    run: w.run.tss,
    other: w.other.tss,
    total: w.totalTss,
  }))

  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">TSS per uke</h3>
        <span className="text-xs text-zinc-500">Mål ~{TARGET_TSS}</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ background: '#27272a', border: 'none', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#a1a1aa' }}
            formatter={(v, name) => [v, name === 'swim' ? 'Svøm' : name === 'bike' ? 'Sykkel' : name === 'run' ? 'Løp' : 'Andre']}
            labelFormatter={(_: unknown, payload: readonly { payload?: { label: string } }[]) => payload?.[0]?.payload?.label ?? ''}
          />
          <Bar dataKey="swim" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} />
          <Bar dataKey="bike" stackId="a" fill="#f97316" />
          <Bar dataKey="run" stackId="a" fill="#4ade80" />
          <Bar dataKey="other" stackId="a" fill="#a78bfa" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} opacity={entry.total < TARGET_TSS ? 0.7 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2">
        {[['Svøm', '#38bdf8'], ['Sykkel', '#f97316'], ['Løp', '#4ade80'], ['Andre', '#a78bfa']].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
            <span className="text-xs text-zinc-500">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
