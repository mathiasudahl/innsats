import { getActivities, getEvents } from '@/lib/intervals'
import { buildWeekStats, generateInsights, weeklyCalorieSurplus } from '@/lib/coach'
import StatCard from '@/components/StatCard'
import InsightCard from '@/components/InsightCard'
import WeekCard from '@/components/WeekCard'
import UpcomingEvents from '@/components/UpcomingEvents'
import TssChart from '@/components/TssChart'
import FormGauge from '@/components/FormChart'

function getDateStr(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

function isoWeekKey(d: Date): string {
  const thu = new Date(d)
  thu.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3)
  const year = thu.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const week = Math.ceil(((thu.getTime() - jan4.getTime()) / 86400000 + ((jan4.getDay() + 6) % 7) + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

function daysUntilRace(): number {
  const race = new Date('2026-08-08')
  const today = new Date()
  return Math.ceil((race.getTime() - today.getTime()) / 86400000)
}

function programWeek(): number {
  const start = new Date('2026-02-23')
  const today = new Date()
  return Math.max(1, Math.ceil((today.getTime() - start.getTime()) / 86400000 / 7) + 1)
}

function getNextMondaySunday(): { mon: string; sun: string } {
  const now = new Date()
  const dayOfWeek = (now.getDay() + 6) % 7 // 0=Mon
  const mon = new Date(now)
  mon.setDate(now.getDate() - dayOfWeek + 7)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return {
    mon: mon.toISOString().split('T')[0],
    sun: sun.toISOString().split('T')[0],
  }
}

export default async function Home() {
  const now = new Date()
  const todayStr = getDateStr(0)
  const currentWeekKey = isoWeekKey(now)
  const { mon: nextMon, sun: nextSun } = getNextMondaySunday()

  // Finn slutt på inneværende uke (søndag)
  const dayOfWeek = (now.getDay() + 6) % 7
  const thisSunStr = getDateStr(6 - dayOfWeek)

  const [activities, thisWeekEvents, nextWeekEvents] = await Promise.all([
    getActivities(getDateStr(-42), todayStr),
    getEvents(todayStr, thisSunStr),
    getEvents(nextMon, nextSun),
  ])

  const weeks = buildWeekStats(activities)
  const currentWeekActs = activities.filter(a => {
    if (!a.start_date_local) return false
    return isoWeekKey(new Date(a.start_date_local)) === currentWeekKey
  })
  const weekKcal = weeklyCalorieSurplus(currentWeekActs)

  const latestActivity = [...activities].sort((a, b) =>
    b.start_date_local.localeCompare(a.start_date_local)
  )[0]
  const atl = latestActivity?.icu_atl ?? 0
  const ctl = latestActivity?.icu_ctl ?? 0
  const tsb = ctl - atl

  const insights = generateInsights(weeks, { atl, ctl, tsb }, currentWeekKey)

  const todayEvents = thisWeekEvents.filter(e => e.start_date_local.startsWith(todayStr))
  const restOfWeekEvents = thisWeekEvents.filter(e => !e.start_date_local.startsWith(todayStr))

  const daysLeft = daysUntilRace()
  const pWeek = programWeek()

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="border-b border-zinc-800 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Triathlon Coach</h1>
            <p className="text-xs text-zinc-400">Mathias — Olympisk triatlon 8. august 2026</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-400">{daysLeft}</div>
            <div className="text-xs text-zinc-400">dager igjen</div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Toppstats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Programuke" value={`Uke ${pWeek}`} sub="av 24" />
          <StatCard label="Fitness (CTL)" value={ctl.toFixed(0)} sub="kronisk belastning" color="text-blue-400" />
          <StatCard
            label="Form (TSB)"
            value={`${tsb > 0 ? '+' : ''}${tsb.toFixed(0)}`}
            sub={tsb > 5 ? 'Klar for hard økt' : tsb > -5 ? 'Nøytral' : 'Akkumulert fatigue'}
            color={tsb > 5 ? 'text-green-400' : tsb < -10 ? 'text-red-400' : 'text-amber-400'}
          />
          <StatCard
            label="Treningskcal denne uke"
            value={weekKcal.toLocaleString('nb-NO')}
            sub={`+${Math.round(weekKcal / 7)} kcal/dag ekstra`}
            color="text-amber-300"
          />
        </div>

        {/* Coach-analyse */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Coach-vurdering</h2>
          <div className="flex flex-col gap-2">
            {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </section>

        {/* Form */}
        <FormGauge atl={atl} ctl={ctl} tsb={tsb} />

        {/* TSS-graf */}
        <TssChart weeks={weeks} />

        {/* Kalorier */}
        <div className="bg-zinc-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Ernæring denne uken</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-700/50 rounded-lg p-3">
              <div className="text-xs text-zinc-400 mb-1">Treningsforbruk</div>
              <div className="text-xl font-bold text-amber-300">{weekKcal.toLocaleString('nb-NO')} kcal</div>
              <div className="text-xs text-zinc-500">ekstra denne uken</div>
            </div>
            <div className="bg-zinc-700/50 rounded-lg p-3">
              <div className="text-xs text-zinc-400 mb-1">Ekstra per dag</div>
              <div className="text-xl font-bold text-amber-300">+{Math.round(weekKcal / 7)} kcal</div>
              <div className="text-xs text-zinc-500">over basis (~2 800)</div>
            </div>
            <div className="bg-zinc-700/50 rounded-lg p-3">
              <div className="text-xs text-zinc-400 mb-1">Anbefalt totalt/dag</div>
              <div className="text-xl font-bold text-amber-300">{(2800 + Math.round(weekKcal / 7)).toLocaleString('nb-NO')} kcal</div>
              <div className="text-xs text-zinc-500">basis + trening</div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
            Hard økt (I-3+): 60–70 g karbo/time under, recovery-shake innen 30 min (30 g protein + 60 g karbo).
            Rolig økt (I-1/I-2): vanlig kost holder. Ikke spar kalorier kvelden etter stor treningsdag.
          </p>
        </div>

        {/* Dagens økter + resten av uken */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayEvents.length > 0 ? (
            <UpcomingEvents events={todayEvents} title="I dag" />
          ) : (
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">I dag</h3>
              <p className="text-sm text-zinc-400">Ingen planlagte økter — hviledag eller fri økt.</p>
            </div>
          )}
          {restOfWeekEvents.length > 0 && (
            <UpcomingEvents events={restOfWeekEvents} title="Resten av uken" />
          )}
        </div>

        {/* Neste uke */}
        {nextWeekEvents.length > 0 && (
          <UpcomingEvents events={nextWeekEvents} title="Neste uke" />
        )}

        {/* Historikk */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Treningshistorikk</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...weeks].reverse().map(w => (
              <WeekCard key={w.weekKey} week={w} isCurrent={w.weekKey === currentWeekKey} />
            ))}
          </div>
        </section>

        <footer className="text-xs text-zinc-600 text-center pb-4">
          Data fra intervals.icu · Revalideres hvert 5. min · Soner basert på laktatmåling NIMI mai 2025
        </footer>
      </div>
    </main>
  )
}
