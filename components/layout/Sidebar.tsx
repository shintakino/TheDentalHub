"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
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
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth, useOrganization } from "@clerk/nextjs";

const navigation = [
  { name: "Dashboard", href: "/overview", icon: LayoutDashboard },
  { name: "Schedule", href: "/schedule", icon: CalendarDays },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Branding", href: "/branding", icon: Palette },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Find a Clinic", href: "/search", icon: Search, isRoot: true },
];

const patientNavigation = [
  { name: "My Appointments", href: "/dashboard", icon: LayoutDashboard, isRoot: true },
  { name: "Find a Clinic", href: "/search", icon: Search, isRoot: true },
  { name: "Medical Records", href: "/records", icon: FileText, isRoot: true },
  { name: "Notifications", href: "/notifications", icon: Bell, isRoot: true },
  { name: "Settings", href: "/settings", icon: Settings, isRoot: true },
];

function NavLinks({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const params = useParams();
  const { has } = useAuth();
  const { organization } = useOrganization();
  
  const tenantSlug = (params?.tenantSlug as string) || organization?.id || "";
  const isPatientView = !tenantSlug || pathname.startsWith("/dashboard") || pathname.startsWith("/records") || pathname.startsWith("/notifications");
  
  const currentNavigation = !isPatientView ? navigation : patientNavigation;

  return (
    <nav className="flex flex-col gap-6 mt-8 px-6">
      {currentNavigation.map((item) => {
        const isRoot = (item as any).isRoot;
        const fullHref = (!isRoot && tenantSlug) ? `/manage/${tenantSlug}${item.href}` : item.href;
        
        // Exact match for dashboard/overview, startsWith for others to handle sub-routes
        const isActive = (item.href === "/overview" || item.href === "/dashboard") 
          ? pathname === fullHref 
          : pathname.startsWith(fullHref) && fullHref !== "/";
        
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

        if (item.name === "Settings" && tenantSlug && !isRoot) {
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
            <div className="h-full py-8">
              <div className="px-8 font-serif text-2xl font-semibold text-foreground tracking-tight">
                The Dental Hub
              </div>
              <NavLinks onItemClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Floating Pane) */}
      <aside className="hidden md:flex flex-col fixed left-6 top-6 bottom-6 w-64 bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] z-40 py-8 border-transparent">
        <div className="px-8 font-serif text-2xl font-semibold text-foreground tracking-tight mb-2">
          The Dental Hub
        </div>
        <NavLinks />
      </aside>
    </>
  );
}
