import { NextRequest, NextResponse } from "next/server";
import { createEvent, updateEvent, deleteEvent, deleteEventsForDate } from "@/lib/intervals";
import { getAthlete } from "@/lib/athletes";
import { today } from "@/lib/date-utils";

function getAthleteFromSlug(slug: string) {
  if (slug !== "mathias" && slug !== "karoline") {
    return null;
  }
  return getAthlete(slug);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { athleteSlug, event } = body;
  const athlete = getAthleteFromSlug(athleteSlug);
  if (!athlete) return NextResponse.json({ error: "Invalid athlete" }, { status: 400 });

  try {
    const result = await createEvent(athlete.id, athlete.apiKey, event);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { athleteSlug, eventId, event } = body;
  const athlete = getAthleteFromSlug(athleteSlug);
  if (!athlete) return NextResponse.json({ error: "Invalid athlete" }, { status: 400 });

  try {
    const result = await updateEvent(athlete.id, athlete.apiKey, eventId, event);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { athleteSlug, eventId, sickDay } = body;
  const athlete = getAthleteFromSlug(athleteSlug);
  if (!athlete) return NextResponse.json({ error: "Invalid athlete" }, { status: 400 });

  try {
    if (sickDay) {
      const count = await deleteEventsForDate(athlete.id, athlete.apiKey, today());
      return NextResponse.json({ deleted: count });
    }
    await deleteEvent(athlete.id, athlete.apiKey, eventId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
