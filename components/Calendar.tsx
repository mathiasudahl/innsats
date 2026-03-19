'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { addDays, format, isToday, isBefore, startOfDay } from 'date-fns';
import { nb } from 'date-fns/locale';
import type { Activity, WorkoutEvent } from '@/lib/types';

// ─── Sport metadata ───────────────────────────────────────────────────────────

const SPORT_ICON: Record<string, string> = {
  Run: '🏃',
  Ride: '🚴',
  Swim: '🏊',
  WeightTraining: '🏋️',
  NordicSki: '⛷️',
  Rowing: '🚣',
  VirtualRide: '🚴',
  VirtualRun: '🏃',
  Walk: '🚶',
  Hike: '🥾',
};

const SPORT_LABEL: Record<string, string> = {
  Run: 'Løp', Ride: 'Sykkel', Swim: 'Svøm',
  WeightTraining: 'Styrke', NordicSki: 'Ski', Rowing: 'Roing',
  VirtualRide: 'Virtuell sykkel', VirtualRun: 'Virtuell løp',
  Walk: 'Gåtur', Hike: 'Fjellttur',
};

function sportIcon(type: string) { return SPORT_ICON[type] ?? '⚡'; }
function sportLabel(type: string) { return SPORT_LABEL[type] ?? type; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}t ${m > 0 ? `${m}m` : ''}`.trim();
  return `${m}m`;
}

function formatDist(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function shortName(name: string | undefined): string {
  if (!name) return '—';
  return name.replace(/^(Zwift|Garmin|Wahoo|Polar)\s*[-–]\s*/i, '').trim();
}

function buildDays(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = startOfDay(addDays(now, diffToMon));
  return Array.from({ length: 14 }, (_, i) => addDays(monday, i));
}

const DAY_SHORT = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarProps {
  mathiasActivities: Activity[];
  mathiasEvents: WorkoutEvent[];
  karolineActivities: Activity[];
  karolineEvents: WorkoutEvent[];
  preview?: { workout: WorkoutEvent; athleteSlug: 'mathias' | 'karoline' } | null;
}

interface WorkoutChip {
  icon: string;
  name: string;
  meta: string;
  done: boolean;
  preview?: boolean;
  // Rich data for tooltip
  detail: ChipDetail;
}

interface ChipDetail {
  name: string;
  type: string;
  done: boolean;
  preview?: boolean;
  duration?: number;       // seconds
  distance?: number;       // meters
  tss?: number;
  hr?: number;             // avg bpm
  watts?: number;          // avg watts
  elevation?: number;      // meters gain
  intensity?: number;      // 0-1
  description?: string;    // workout builder text
}

// ─── Chip builder ─────────────────────────────────────────────────────────────

function getChips(
  date: Date,
  activities: Activity[],
  events: WorkoutEvent[],
  previewEvent?: WorkoutEvent | null
): WorkoutChip[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayActivities = activities.filter((a) => a.start_date_local.slice(0, 10) === dateStr);
  const dayEvents = events.filter((e) => e.start_date_local.slice(0, 10) === dateStr);
  const chips: WorkoutChip[] = [];

  for (const a of dayActivities) {
    const meta: string[] = [];
    if (a.moving_time) meta.push(formatDuration(a.moving_time));
    if (a.distance > 0) meta.push(formatDist(a.distance));
    if (a.icu_training_load) meta.push(`${Math.round(a.icu_training_load)} TSS`);
    chips.push({
      icon: sportIcon(a.type),
      name: shortName(a.name),
      meta: meta.join(' · '),
      done: true,
      detail: {
        name: shortName(a.name),
        type: a.type,
        done: true,
        duration: a.moving_time,
        distance: a.distance > 0 ? a.distance : undefined,
        tss: a.icu_training_load ? Math.round(a.icu_training_load) : undefined,
        hr: a.average_heartrate ? Math.round(a.average_heartrate) : undefined,
        watts: a.average_watts ? Math.round(a.average_watts) : undefined,
        elevation: a.total_elevation_gain ? Math.round(a.total_elevation_gain) : undefined,
        intensity: a.icu_intensity,
      },
    });
  }

  for (const e of dayEvents) {
    const alreadyCovered = dayActivities.some((a) => a.type === e.type);
    if (alreadyCovered) continue;
    const meta: string[] = [];
    if (e.moving_time) meta.push(formatDuration(e.moving_time));
    if (e.icu_training_load) meta.push(`${Math.round(e.icu_training_load)} TSS`);
    chips.push({
      icon: sportIcon(e.type),
      name: shortName(e.name),
      meta: meta.join(' · '),
      done: false,
      detail: {
        name: shortName(e.name),
        type: e.type,
        done: false,
        duration: e.moving_time,
        tss: e.icu_training_load ? Math.round(e.icu_training_load) : undefined,
        description: e.description,
      },
    });
  }

  if (previewEvent && previewEvent.start_date_local.slice(0, 10) === dateStr) {
    const meta: string[] = [];
    if (previewEvent.moving_time) meta.push(formatDuration(previewEvent.moving_time));
    if (previewEvent.icu_training_load) meta.push(`${Math.round(previewEvent.icu_training_load)} TSS`);
    chips.push({
      icon: sportIcon(previewEvent.type),
      name: shortName(previewEvent.name),
      meta: meta.join(' · '),
      done: false,
      preview: true,
      detail: {
        name: shortName(previewEvent.name),
        type: previewEvent.type,
        done: false,
        preview: true,
        duration: previewEvent.moving_time,
        tss: previewEvent.icu_training_load ? Math.round(previewEvent.icu_training_load) : undefined,
        description: previewEvent.description,
      },
    });
  }

  return chips;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

// ─── Chip (single workout pill) ───────────────────────────────────────────────

const CELL_HEIGHT = 52; // px — fixed height for every chip slot
const TOOLTIP_WIDTH = 220;

function Chip({ chip, color }: { chip: WorkoutChip; color: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseEnter() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: r.left + r.width / 2,
      y: r.top + window.scrollY,
    });
  }

  const rows: { label: string; value: string }[] = [];
  if (chip.detail.duration) rows.push({ label: 'Varighet', value: formatDuration(chip.detail.duration) });
  if (chip.detail.distance) rows.push({ label: 'Distanse', value: formatDist(chip.detail.distance) });
  if (chip.detail.tss) rows.push({ label: 'TSS', value: String(chip.detail.tss) });
  if (chip.detail.hr) rows.push({ label: 'Puls (snitt)', value: `${chip.detail.hr} bpm` });
  if (chip.detail.watts) rows.push({ label: 'Watt (snitt)', value: `${chip.detail.watts} W` });
  if (chip.detail.elevation) rows.push({ label: 'Høydemeter', value: `${chip.detail.elevation} m` });
  if (chip.detail.intensity) rows.push({ label: 'Intensitet', value: `${Math.round(chip.detail.intensity * 100)}%` });

  const tooltip = pos ? createPortal(
    <div
      style={{
        position: 'absolute',
        top: pos.y - 8,
        left: Math.max(8, Math.min(pos.x - TOOLTIP_WIDTH / 2, window.innerWidth - TOOLTIP_WIDTH - 8)),
        transform: 'translateY(-100%)',
        width: `${TOOLTIP_WIDTH}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'var(--surface)',
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.18), 0 0 0 1px ${color}15`,
        fontSize: '11px',
      }}
    >
      {/* Header */}
      <div style={{ backgroundColor: `${color}12`, borderBottom: `1px solid ${color}20`, padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{sportIcon(chip.detail.type)}</span>
          <span style={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{chip.detail.name}</span>
        </div>
        <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ backgroundColor: `${color}20`, color, fontSize: '9px', padding: '1px 6px', borderRadius: '999px', fontWeight: 500 }}>
            {sportLabel(chip.detail.type)}
          </span>
          {chip.detail.preview && <span style={{ color, fontSize: '9px' }}>✦ Forslag</span>}
          {chip.detail.done && <span style={{ color, fontSize: '9px' }}>✓ Gjennomført</span>}
          {!chip.detail.done && !chip.detail.preview && <span style={{ color: 'var(--text-subtle)', fontSize: '9px' }}>Planlagt</span>}
        </div>
      </div>

      {/* Stats */}
      {rows.length > 0 && (
        <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          {rows.map((r) => (
            <div key={r.label}>
              <div style={{ color: 'var(--text-subtle)', fontSize: '9px' }}>{r.label}</div>
              <div style={{ color: 'var(--text)', fontSize: '11px', fontWeight: 600 }}>{r.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {chip.detail.description && (
        <div style={{ borderTop: `1px solid ${color}15`, padding: '8px 12px' }}>
          <div style={{ color: 'var(--text-subtle)', fontSize: '9px', marginBottom: '3px' }}>Øktstruktur</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: 'var(--text)', fontSize: '9px', lineHeight: 1.5, margin: 0 }}>
            {chip.detail.description}
          </pre>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div
      ref={ref}
      style={{ height: `${CELL_HEIGHT}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setPos(null)}
    >
      <div
        className="rounded-md px-1.5 py-1 h-full flex flex-col justify-start cursor-default"
        style={{
          backgroundColor: chip.preview ? 'transparent' : chip.done ? `${color}18` : `${color}0d`,
          borderLeft: `2px ${chip.preview ? 'dashed' : 'solid'} ${chip.done ? color : color + '55'}`,
          opacity: chip.preview ? 0.75 : 1,
          outline: chip.preview ? `1px dashed ${color}35` : undefined,
        }}
      >
        <div className="flex items-start gap-0.5 min-w-0">
          <span style={{ fontSize: '10px', flexShrink: 0, lineHeight: '1.4' }}>{chip.icon}</span>
          <span
            className="font-medium"
            style={{
              fontSize: '10px',
              lineHeight: '1.3',
              color: chip.done ? color : chip.preview ? color : 'var(--text)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {chip.preview ? `✦ ${chip.name}` : chip.name}
          </span>
        </div>
        {chip.meta && (
          <div style={{ color: 'var(--text-subtle)', fontSize: '9px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {chip.meta}
          </div>
        )}
      </div>

      {tooltip}
    </div>
  );
}

// ─── Day column ───────────────────────────────────────────────────────────────

// How many chip slots to always reserve (uniform row height)
const SLOTS = 3;

function DayCol({ date, chips, color, isWeekStart }: { date: Date; chips: WorkoutChip[]; color: string; isWeekStart: boolean }) {
  const today = isToday(date);
  const past = isBefore(date, startOfDay(new Date())) && !today;
  const dayOfWeek = (date.getDay() + 6) % 7;

  // Pad to SLOTS so all columns are the same height
  const slots = Array.from({ length: Math.max(SLOTS, chips.length) });

  return (
    <div
      className="flex flex-col"
      style={{
        borderLeft: isWeekStart ? '2px solid var(--border)' : '1px solid var(--border)',
        backgroundColor: today ? `${color}06` : 'transparent',
      }}
    >
      {/* Header */}
      <div
        className="px-2 py-1.5 text-center border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)', backgroundColor: today ? `${color}10` : 'transparent' }}
      >
        <div style={{ color: today ? color : 'var(--text-subtle)', fontSize: '10px', fontWeight: 500 }}>
          {DAY_SHORT[dayOfWeek]}
        </div>
        <div style={{ color: today ? color : 'var(--text-subtle)', fontSize: '11px', fontWeight: today ? 700 : 500 }}>
          {format(date, 'd', { locale: nb })}
        </div>
      </div>

      {/* Fixed-height chip slots */}
      <div className="flex flex-col gap-1 p-1.5">
        {slots.map((_, i) => {
          const chip = chips[i];
          if (!chip) {
            return (
              <div
                key={i}
                style={{ height: `${CELL_HEIGHT}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {i === 0 && past && (
                  <span style={{ color: 'var(--border)', fontSize: '10px' }}>—</span>
                )}
              </div>
            );
          }
          return <Chip key={i} chip={chip} color={color} />;
        })}
      </div>
    </div>
  );
}

// ─── Athlete row ──────────────────────────────────────────────────────────────

function AthleteRow({
  name, color, days, activities, events, previewEvent, borderBottom,
}: {
  name: string; color: string; days: Date[];
  activities: Activity[]; events: WorkoutEvent[];
  previewEvent?: WorkoutEvent | null; borderBottom?: boolean;
}) {
  return (
    <div className="flex" style={{ borderBottom: borderBottom ? '1px solid var(--border)' : undefined }}>
      <div
        className="flex items-center justify-center font-semibold flex-shrink-0"
        style={{
          color, fontSize: '11px', writingMode: 'vertical-rl',
          transform: 'rotate(180deg)', width: '28px',
          borderRight: '1px solid var(--border)', padding: '8px 4px',
        }}
      >
        {name}
      </div>
      <div className="grid flex-1" style={{ gridTemplateColumns: 'repeat(14, minmax(72px, 1fr))' }}>
        {days.map((date, i) => {
          const dayOfWeek = (date.getDay() + 6) % 7;
          return (
            <DayCol
              key={i}
              date={date}
              chips={getChips(date, activities, events, previewEvent)}
              color={color}
              isWeekStart={dayOfWeek === 0 && i > 0}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export function Calendar({ mathiasActivities, mathiasEvents, karolineActivities, karolineEvents, preview }: CalendarProps) {
  const days = buildDays();
  const mathiasPreview = preview?.athleteSlug === 'mathias' ? preview.workout : null;
  const karolinePreview = preview?.athleteSlug === 'karoline' ? preview.workout : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="px-4 py-2 text-xs font-medium border-b" style={{ color: 'var(--text-subtle)', borderColor: 'var(--border)' }}>
        {format(days[0], 'MMMM', { locale: nb })} – {format(days[13], 'MMMM yyyy', { locale: nb })}
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: '1050px' }}>
          <AthleteRow name="Mathias" color="#16a34a" days={days} activities={mathiasActivities} events={mathiasEvents} previewEvent={mathiasPreview} borderBottom />
          <AthleteRow name="Karoline" color="#2563eb" days={days} activities={karolineActivities} events={karolineEvents} previewEvent={karolinePreview} />
        </div>
      </div>
    </div>
  );
}
