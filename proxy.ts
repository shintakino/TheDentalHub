import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/marketplace/search(.*)", "/search(.*)", "/"]);
const isDashboardRoute = createRouteMatcher([
  "/manage/:tenantId/overview(.*)", 
  "/manage/:tenantId/schedule(.*)", 
  "/manage/:tenantId/patients(.*)", 
  "/manage/:tenantId/analytics(.*)", 
  "/manage/:tenantId/settings(.*)",
  "/manage/:tenantId/branding(.*)"
]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const authObj = await auth();

  if (req.nextUrl.pathname === "/") {
    if (authObj.userId) {
      if (authObj.sessionClaims?.metadata?.role === "super_admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (authObj.orgId) {
        return NextResponse.redirect(new URL(`/manage/${authObj.orgId}/overview`, req.url));
      }
      // If neither super admin nor org member, assume patient
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Public users see the landing page at /
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    if (!authObj.userId) {
      return authObj.redirectToSignIn();
    }

    // Block Patients (no orgId) from /dashboard or /onboarding, unless they are super_admin
    if (isDashboardRoute(req) || isOnboardingRoute(req)) {
      if (!authObj.orgId && authObj.sessionClaims?.metadata?.role !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Block regular users from /admin
    if (isAdminRoute(req)) {
      if (authObj.sessionClaims?.metadata?.role !== "super_admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
