'use client'
import { CoachInsight } from '@/lib/coach'

const styles = {
  good: { border: 'border-green-500/40', bg: 'bg-green-500/10', icon: '✓', text: 'text-green-400' },
  warning: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', icon: '!', text: 'text-amber-400' },
  info: { border: 'border-sky-500/40', bg: 'bg-sky-500/10', icon: 'i', text: 'text-sky-400' },
}

export default function InsightCard({ insight }: { insight: CoachInsight }) {
  const s = styles[insight.type]
  return (
    <div className={`border ${s.border} ${s.bg} rounded-lg p-3 flex gap-3 items-start`}>
      <span className={`font-bold text-sm mt-0.5 ${s.text} w-4 shrink-0`}>{s.icon}</span>
      <p className="text-sm text-zinc-200 leading-snug">{insight.text}</p>
    </div>
  )
}
