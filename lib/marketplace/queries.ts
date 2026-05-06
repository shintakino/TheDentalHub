import { db } from "@/lib/db";
import { branches, clinics } from "@/lib/db/schema";
import { sql, and, or, ilike, eq } from "drizzle-orm";

export async function searchMarketplace({
  lat,
  lng,
  radius = 25,
  query,
}: {
  lat: number;
  lng: number;
  radius?: number;
  query?: string;
}) {
  const distanceSql = sql`
    6371 * acos(
      cos(radians(${lat})) * cos(radians(${branches.latitude})) *
      cos(radians(${branches.longitude}) - radians(${lng})) +
      sin(radians(${lat})) * sin(radians(${branches.latitude}))
    )
  `;

  const results = await db
    .select({
      id: branches.id,
      clinicId: clinics.id,
      clinicName: clinics.name,
      clinicLogoUrl: clinics.logoUrl,
      primaryColor: clinics.primaryColor,
      subdomain: clinics.subdomain,
      branchName: branches.name,
      address: branches.address,
      latitude: branches.latitude,
      longitude: branches.longitude,
      distance: distanceSql.as("distance"),
      nextSlots: branches.nextSlots,
      availabilityUpdatedAt: branches.availabilityUpdatedAt,
      rating: branches.rating,
    })
    .from(branches)
    .innerJoin(clinics, eq(branches.tenantId, clinics.tenantId))
    .where(
      and(
        sql`${distanceSql} <= ${radius}`,
        query ? or(ilike(clinics.name, `%${query}%`), ilike(branches.address, `%${query}%`)) : undefined
      )
    )
    .orderBy(sql`distance`);

  return results;
}
