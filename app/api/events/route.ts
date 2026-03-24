import { NextRequest, NextResponse } from "next/server";
import { createEvent, updateEvent, deleteEvent, deleteEventsForDate } from "@/lib/intervals";
import { getAthlete } from "@/lib/athletes";
import { today } from "@/lib/date-utils";

function resolveAthlete(body: { athleteSlug?: string; athleteId?: string; apiKey?: string }) {
  if (body.athleteId && body.apiKey) {
    return { id: body.athleteId, apiKey: body.apiKey };
  }
  if (body.athleteSlug === "mathias" || body.athleteSlug === "karoline") {
    const a = getAthlete(body.athleteSlug);
    return { id: a.id, apiKey: a.apiKey };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const athlete = resolveAthlete(body);
  if (!athlete) return NextResponse.json({ error: "Invalid athlete" }, { status: 400 });

  try {
    const result = await createEvent(athlete.id, athlete.apiKey, body.event);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const athlete = resolveAthlete(body);
  if (!athlete) return NextResponse.json({ error: "Invalid athlete" }, { status: 400 });

  try {
    const result = await updateEvent(athlete.id, athlete.apiKey, body.eventId, body.event);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const athlete = resolveAthlete(body);
  if (!athlete) return NextResponse.json({ error: "Invalid athlete" }, { status: 400 });

  try {
    if (body.sickDay) {
      const count = await deleteEventsForDate(athlete.id, athlete.apiKey, today());
      return NextResponse.json({ deleted: count });
    }
    await deleteEvent(athlete.id, athlete.apiKey, body.eventId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
