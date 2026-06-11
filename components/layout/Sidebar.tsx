"use client";

import Link from "next/link";
import { usePathname, useParams, useSearchParams } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { 
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Menu,
  Search,
  FileText,
  Bell,
  Palette,
  Package,
  Megaphone,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth, useOrganization } from "@clerk/nextjs";
import useSWR from "swr";
import type { BranchStatus } from "@/app/api/clinics/[id]/branches/status/route";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  isRoot?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/overview", icon: LayoutDashboard },
  { name: "Schedule", href: "/schedule", icon: CalendarDays },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Staff Roster", href: "/roster", icon: Users },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Branding", href: "/branding", icon: Palette },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Find a Clinic", href: "/search", icon: Search, isRoot: true },
];

const patientNavigation: NavItem[] = [
  { name: "My Appointments", href: "/dashboard", icon: LayoutDashboard, isRoot: true },
  { name: "Find a Clinic", href: "/search", icon: Search, isRoot: true },
  { name: "Medical Records", href: "/records", icon: FileText, isRoot: true },
  { name: "Notifications", href: "/notifications", icon: Bell, isRoot: true },
  { name: "Settings", href: "/settings", icon: Settings, isRoot: true },
];

const branchSpecificRoutes = ["/overview", "/schedule", "/inventory"];

function NavLinks({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const params = useParams();
  const { has } = useAuth();
  const { organization } = useOrganization();

  const tenantSlug = (params?.tenantSlug as string) || organization?.id || "";
  const branchSlug = params.branchSlug as string | undefined;
  const isPatientView = !tenantSlug || pathname.startsWith("/dashboard") || pathname.startsWith("/records") || pathname.startsWith("/notifications");

  const currentNavigation = !isPatientView ? navigation : patientNavigation;

  return (
    <nav className="flex flex-col gap-6 mt-8 px-6">
      {currentNavigation.map((item) => {
        const isRoot = item.isRoot;
        let fullHref = item.href;
        
        if (!isRoot && tenantSlug) {
          if (branchSlug && branchSpecificRoutes.includes(item.href)) {
            fullHref = `/manage/${tenantSlug}/branch/${branchSlug}${item.href}`;
          } else {
            fullHref = `/manage/${tenantSlug}${item.href}`;
          }
        }

        // Exact match for dashboard/overview, startsWith for others to handle sub-routes
        const pathOnly = fullHref.split("?")[0];
        const isActive = (item.href === "/overview" || item.href === "/dashboard") 
          ? pathname === pathOnly 
          : pathname.startsWith(pathOnly) && pathOnly !== "/";
        
        const link = (
          <Link
            key={item.name}
            href={fullHref}
            onClick={onItemClick}
            className={cn(
              "group flex items-center gap-4 py-2 text-[15px] transition-all duration-300 relative",
              isActive 
                ? "text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground hover:translate-x-1"
            )}
          >
            {/* Active Dot Indicator */}
            <div 
              className={cn(
                "absolute -left-4 w-1.5 h-1.5 rounded-full bg-primary transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-0"
              )} 
            />
            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            {item.name}
          </Link>
        );

        const adminOnlyTabs = ["Settings", "Marketing", "Analytics", "Branding", "Inventory"];
        if (adminOnlyTabs.includes(item.name) && tenantSlug && !isRoot) {
          const isAdmin = has && has({ role: "org:admin" });
          if (!isAdmin) return null;
          return link;
        }

        return link;
      })}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const branchSlug = params.branchSlug as string | undefined;

  const { data: branches } = useSWR<BranchStatus[]>(
    tenantSlug ? `/api/clinics/${tenantSlug}/branches/status` : null,
    fetcher
  );

  const activeBranch = Array.isArray(branches) && branchSlug ? branches.find(b => b.slug === branchSlug) : undefined;

  return (
    <>
      {/* Mobile Hamburger Trigger (Only visible on small screens) */}
      <div className="md:hidden fixed top-6 left-6 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger 
            render={
              <Button variant="ghost" size="icon" className="bg-card shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl w-16 h-16 border-transparent" />
            }
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card border-none p-0">
            <VisuallyHidden>
              <SheetTitle>Navigation Menu</SheetTitle>
            </VisuallyHidden>
            <div className="h-full flex flex-col py-8">
              <div className="px-8 font-serif text-2xl font-semibold text-foreground tracking-tight">
                The Dental Hub
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavLinks onItemClick={() => setOpen(false)} />
              </div>
              
              {/* Active Context Indicator (Mobile) */}
              {tenantSlug && (
                <div className="px-6 py-4 border-t bg-muted/30">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                    Managing
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium truncate">
                      {activeBranch ? activeBranch.name : "All Branches"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Floating Pane) */}
      <aside className="hidden md:flex flex-col fixed left-6 top-6 bottom-6 w-64 bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] z-40 py-8 border-transparent">
        <div className="px-8 font-serif text-2xl font-semibold text-foreground tracking-tight mb-2">
          The Dental Hub
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>

        {/* Active Context Indicator (Desktop) */}
        {tenantSlug && (
          <div className="mt-auto px-6 pt-4 border-t border-border/50 mx-4">
            <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                Active Context
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  activeBranch?.status === "open" ? "bg-emerald-500" : 
                  activeBranch?.status === "emergency" ? "bg-red-500 animate-pulse" :
                  activeBranch?.status === "near_capacity" ? "bg-amber-500" :
                  "bg-slate-400"
                )} />
                <span className="text-xs font-medium truncate">
                  {activeBranch ? activeBranch.name : "All Branches"}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
