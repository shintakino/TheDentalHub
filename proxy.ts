import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isDashboardRoute = createRouteMatcher(["/", "/schedule(.*)", "/patients(.*)", "/analytics(.*)", "/settings(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const authObj = await auth();

  if (req.nextUrl.pathname === "/") {
    if (authObj.userId) {
      if (authObj.sessionClaims?.metadata?.role === "super_admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (authObj.orgId) {
        // Dashboard is now at the root (/) within (dashboard) route group
        return NextResponse.next();
      }
      // If neither super admin nor org member, assume patient
      return NextResponse.redirect(new URL("/patient/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (!isPublicRoute(req)) {
    if (!authObj.userId) {
      return authObj.redirectToSignIn();
    }

    // Block Patients (no orgId) from /dashboard, unless they are super_admin
    if (isDashboardRoute(req)) {
      if (!authObj.orgId && authObj.sessionClaims?.metadata?.role !== "super_admin") {
        return NextResponse.redirect(new URL("/patient/dashboard", req.url));
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
