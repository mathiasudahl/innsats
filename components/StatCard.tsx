'use client'

type Props = {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export default function StatCard({ label, value, sub, color = 'text-white' }: Props) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-zinc-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  )
}
