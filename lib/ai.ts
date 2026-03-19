import Anthropic from "@anthropic-ai/sdk";
import type { Activity, WorkoutEvent, Wellness } from "./types";
import { formatDate, formatTime, formatDistance } from "./date-utils";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function buildSystemPrompt(): string {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const tomorrowIso = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);

  return `Du er en personlig treningscoach for Mathias og Karoline. Du svarer alltid på norsk.
Du har tilgang til deres treningshistorikk, planlagte økter og dagsform (CTL/ATL/TSB).
Gi konkrete, personlige råd basert på dataene du ser.

DAGENS DATO: ${todayIso}
Bruk alltid datoer fra og med ${todayIso} eller senere. Bruk aldri datoer fra fortiden.

## Øktformat
Når du foreslår en treningsøkt, embed alltid et JSON-objekt. Feltet "description" MÅ inneholde strukturert økt i Intervals.icu workout-builder-syntaks.

## Øktnavn
Bruk korte, konsise navn på formatet "Sport: Type (intensitetssone)".
Eksempler: "Løp: Terskel (i4)", "Sykkel: VO2max (i5)", "Løp: Rolig langtur (i2)", "Sykkel: Sweet spot (i3-i4)", "Svøm: Pyramideintervaller", "Løp: Stigningsløp (ramp)".
Aldri generiske navn som "Treningsøkt" eller "Workout".

## Workout-builder-syntaks
- Steg: \`- [varighet] [mål]\`
- Varighet: \`10m\`, \`30s\`, \`1h\`, \`2km\`, \`500mtr\` (merk: \`m\` = minutter, \`mtr\` = meter)
- Watt-mål: \`75%\` (% av FTP), \`220w\` (absolutt), \`Z2\`, \`95-105%\`
- Puls-mål: \`70% HR\`, \`Z2 HR\`, \`95% LTHR\`
- Pace-mål: \`5:00/km Pace\`, \`Z2 Pace\`, \`78-82% Pace\`
- Intervaller: Seksjon med \`Navn Nx\` etterfulgt av steg (tom linje før og etter)
- Ramp (jevn økning): \`- 10m ramp 50%-75%\` — bruk for stigningsløp/oppvarming med progressiv intensitet
- Cue-tekst: legg inn som del av steget

Stigningsløp på løp = ramp-steg i workout-builder: \`- 20s ramp 85%-105% Pace\`

Eksempel løpeøkt med stigningsløp:
\`\`\`
- Oppvarming 15m Z2 Pace

Stigningsløp 6x
- 20s ramp 85%-105% Pace
- 40s Z1 Pace

- Nedkjøring 10m Z2 Pace
\`\`\`

Eksempel terskeløkt løp:
\`\`\`
- Oppvarming 15m Z2 Pace

Terskel 4x
- 6m 92-96% Pace
- 2m 60% Pace

- Nedkjøring 10m Z2 Pace
\`\`\`

Eksempel sykkeløkt:
\`\`\`
- Oppvarming 15m ramp 50%-75% 90rpm

Terskel 3x
- 8m 95-105% 88-92rpm
- 4m 55%

- Nedkjøring 10m 55%
\`\`\`

JSON-format (description er workout-builder-tekst):
\`\`\`json
{"workout_suggestion":true,"start_date_local":"${tomorrowIso}T09:00:00","type":"Run","name":"Løp: Terskel (i4)","moving_time":3600,"icu_training_load":80,"description":"- Oppvarming 15m Z2 Pace\\n\\nTerskel 4x\\n- 6m 92-96% Pace\\n- 2m 60% Pace\\n\\n- Nedkjøring 10m Z2 Pace"}
\`\`\`

Gyldige sport-typer: Run, Ride, Swim, WeightTraining, NordicSki, Rowing.
Hold tekstsvaret kort (2-3 setninger). Øktdetaljene ligger i JSON-blokken.`;
}

export function buildContext(
  athleteName: string,
  activities: Activity[],
  events: WorkoutEvent[],
  wellness: Wellness[]
): string {
  const latest = wellness.length > 0 ? wellness[wellness.length - 1] : null;

  const todayIso = new Date().toISOString().slice(0, 10);
  let ctx = `## ${athleteName} — Treningskontekst (dato: ${todayIso})\n\n`;

  if (latest) {
    ctx += `**Dagsform:** CTL=${Math.round(latest.ctl ?? 0)}, ATL=${Math.round(latest.atl ?? 0)}, TSB=${Math.round(latest.tsb ?? 0)}`;
    if (latest.weight) ctx += `, Vekt=${latest.weight.toFixed(1)}kg`;
    if (latest.readiness) ctx += `, Readiness=${latest.readiness}`;
    ctx += "\n\n";
  }

  const recentActivities = activities.slice(-10);
  if (recentActivities.length > 0) {
    ctx += "**Siste aktiviteter:**\n";
    for (const a of recentActivities) {
      const parts = [
        formatDate(a.start_date_local),
        a.type,
        a.name,
        formatTime(a.moving_time),
      ];
      if (a.distance > 0) parts.push(formatDistance(a.distance));
      if (a.icu_training_load) parts.push(`${Math.round(a.icu_training_load)} TSS`);
      if (a.average_heartrate) parts.push(`${Math.round(a.average_heartrate)} bpm`);
      ctx += `- ${parts.join(" | ")}\n`;
    }
    ctx += "\n";
  }

  const upcomingEvents = events.slice(0, 10);
  if (upcomingEvents.length > 0) {
    ctx += "**Planlagte økter:**\n";
    for (const e of upcomingEvents) {
      const parts = [formatDate(e.start_date_local), e.type, e.name];
      if (e.moving_time) parts.push(formatTime(e.moving_time));
      if (e.icu_training_load) parts.push(`${Math.round(e.icu_training_load)} TSS`);
      ctx += `- ${parts.join(" | ")}\n`;
    }
  }

  return ctx;
}

export function buildShortContext(
  athleteName: string,
  events: WorkoutEvent[],
  wellness: Wellness[]
): string {
  const latest = wellness.length > 0 ? wellness[wellness.length - 1] : null;
  let ctx = `## ${athleteName}\n`;
  if (latest) {
    ctx += `CTL=${Math.round(latest.ctl ?? 0)}, TSB=${Math.round(latest.tsb ?? 0)}\n`;
  }
  const next5 = events.slice(0, 5);
  if (next5.length > 0) {
    ctx += "Neste 5 planlagte: " + next5.map((e) => `${e.type} ${formatDate(e.start_date_local)}`).join(", ") + "\n";
  }
  return ctx;
}
