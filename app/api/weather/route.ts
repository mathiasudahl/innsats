import { NextResponse } from "next/server";
import type { WeatherData } from "@/lib/types";

const WMO_DESCRIPTION: Record<number, string> = {
  0: "Klart", 1: "Stort sett klart", 2: "Delvis skyet", 3: "Overskyet",
  45: "Tåke", 48: "Rimtåke",
  51: "Lett yr", 53: "Yr", 55: "Tett yr",
  61: "Lett regn", 63: "Regn", 65: "Kraftig regn",
  71: "Lett snø", 73: "Snø", 75: "Kraftig snø",
  80: "Lett regnbyger", 81: "Regnbyger", 82: "Kraftige regnbyger",
  85: "Snøbyger", 86: "Kraftige snøbyger",
  95: "Tordenvær", 96: "Tordenvær med hagl", 99: "Tordenvær med kraftig hagl",
};

export async function GET() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=59.91&longitude=10.75" +
    "&current_weather=true" +
    "&hourly=temperature_2m,weathercode,windspeed_10m" +
    "&timezone=Europe%2FOslo" +
    "&forecast_days=1";

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
    const data = await res.json();
    const cw = data.current_weather;
    const weather: WeatherData = {
      temperature: Math.round(cw.temperature),
      windspeed: Math.round(cw.windspeed),
      weathercode: cw.weathercode,
      description: WMO_DESCRIPTION[cw.weathercode as number] ?? "Ukjent",
    };
    return NextResponse.json(weather);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
