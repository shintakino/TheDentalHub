import { auth } from "@clerk/nextjs/server";

export type Role = "org:admin" | "org:dentist" | "org:receptionist";

export async function hasPermission(role: Role): Promise<boolean> {
  const { has } = await auth();
  return has({ role });
}

export async function isSuperAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "super_admin";
}

export async function checkRole(role: Role): Promise<boolean> {
  const { has } = await auth();
  return has({ role });
}
