import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoding";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const coords = await geocodeAddress(q, { useFallback: false });
    return NextResponse.json({ coords });
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
