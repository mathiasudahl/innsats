import { NextRequest, NextResponse } from "next/server";
import { fetchActivities, fetchEvents, fetchWellness } from "@/lib/intervals";
import { getAthlete } from "@/lib/athletes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("athlete");
  const type = searchParams.get("type");
  const oldest = searchParams.get("oldest") ?? "";
  const newest = searchParams.get("newest") ?? "";

  if (slug !== "mathias" && slug !== "karoline") {
    return NextResponse.json({ error: "Invalid athlete" }, { status: 400 });
  }

  const athlete = getAthlete(slug);

  try {
    let data;
    if (type === "activities") {
      const limit = parseInt(searchParams.get("limit") ?? "50");
      data = await fetchActivities(athlete.id, athlete.apiKey, oldest, newest, limit);
    } else if (type === "events") {
      data = await fetchEvents(athlete.id, athlete.apiKey, oldest, newest);
    } else if (type === "wellness") {
      data = await fetchWellness(athlete.id, athlete.apiKey, oldest, newest);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
