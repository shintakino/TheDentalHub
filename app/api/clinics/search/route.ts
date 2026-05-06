import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/db/mock-db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || undefined;
    
    // In a real implementation, we'd use lat/lng for geospatial sorting
    // For the mock, we just filter by text query
    const results = await mockDb.searchClinics(query);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching clinics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
