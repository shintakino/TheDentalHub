import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    
    const results = await db.query.clinics.findMany({
      where: query ? or(
        ilike(clinics.name, `%${query}%`),
        ilike(clinics.subdomain, `%${query}%`)
      ) : undefined,
      with: {
        branches: true,
      },
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching clinics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
