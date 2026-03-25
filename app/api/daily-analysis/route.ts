import { NextRequest, NextResponse } from "next/server";
import { makeAnthropic, buildDailyAnalysisPrompt } from "@/lib/ai";
import { fetchActivities, fetchEvents, fetchWellness, fetchActivityStreams } from "@/lib/intervals";
import { getAthlete } from "@/lib/athletes";
import { today, daysAgo, daysFromNow } from "@/lib/date-utils";
import type { DailyAnalysis, WeatherData } from "@/lib/types";

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=59.91&longitude=10.75" +
      "&current_weather=true" +
      "&timezone=Europe%2FOslo" +
      "&forecast_days=1";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const cw = data.current_weather;
    return {
      temperature: Math.round(cw.temperature),
      windspeed: Math.round(cw.windspeed),
      symbol: String(cw.weathercode ?? ""),
      description: "",
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { athleteSlug, athleteId: directAthleteId, apiKey: directApiKey, anthropicKey, athleteName: directName } = body;

  let athleteId: string;
  let apiKey: string;
  let athleteName: string;
  let resolvedSlug: string;

  if (directAthleteId && directApiKey) {
    athleteId = directAthleteId;
    apiKey = directApiKey;
    athleteName = directName ?? "Bruker";
    resolvedSlug = "custom";
  } else if (athleteSlug === "mathias" || athleteSlug === "karoline") {
    const athlete = getAthlete(athleteSlug);
    athleteId = athlete.id;
    apiKey = athlete.apiKey;
    athleteName = athlete.name;
    resolvedSlug = athleteSlug;
  } else {
    return NextResponse.json({ error: "Invalid athlete" }, { status: 400 });
  }

  const client = makeAnthropic(anthropicKey);
  const t = today();
  const sixtyDaysAgo = daysAgo(60);
  const twoWeeksAhead = daysFromNow(14);

  const [activitiesRes, eventsRes, futureEventsRes, wellnessRes, weather] = await Promise.allSettled([
    fetchActivities(athleteId, apiKey, sixtyDaysAgo, t, 60),
    fetchEvents(athleteId, apiKey, t, t),
    fetchEvents(athleteId, apiKey, t, twoWeeksAhead),
    fetchWellness(athleteId, apiKey, sixtyDaysAgo, t),
    fetchWeather(),
  ]);

  const activities = activitiesRes.status === "fulfilled" ? activitiesRes.value : [];
  const events = eventsRes.status === "fulfilled" ? eventsRes.value : [];
  const futureEvents = futureEventsRes.status === "fulfilled" ? futureEventsRes.value : [];
  const wellness = wellnessRes.status === "fulfilled" ? wellnessRes.value : [];
  const weatherData = weather.status === "fulfilled" ? weather.value : null;

  // Fetch HR/watts streams for the most recent activity (today or yesterday)
  const todayStr = t;
  const yesterdayStr = daysAgo(1);
  const recentActivity = activities.find(
    (a) => a.start_date_local.slice(0, 10) === todayStr || a.start_date_local.slice(0, 10) === yesterdayStr
  );
  let activityStreams: Record<string, number[]> = {};
  if (recentActivity?.id) {
    const streamsRes = await fetchActivityStreams(athleteId, apiKey, recentActivity.id).catch(() => ({}));
    activityStreams = streamsRes;
  }

  const prompt = buildDailyAnalysisPrompt(
    athleteName,
    resolvedSlug,
    activities,
    events,
    futureEvents,
    wellness,
    weatherData,
    recentActivity?.id ? { activityId: recentActivity.id, streams: activityStreams } : undefined
  );

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    // Strip potential markdown fences
    const jsonStr = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let analysis: DailyAnalysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
    }

    return NextResponse.json(analysis);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
