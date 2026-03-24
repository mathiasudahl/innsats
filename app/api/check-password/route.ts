import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (password !== sitePassword) {
    return NextResponse.json({ error: "Feil passord" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
