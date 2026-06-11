"use client";

import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BranchSwitcher } from "@/components/layout/BranchSwitcher";
import { usePathname } from "next/navigation";
import { NotificationCenter } from "./NotificationCenter";

export function Navbar() {
  const pathname = usePathname();
  const isManagePage = pathname.includes("/manage/");

  return (
    <header className="sticky top-6 flex h-16 items-center justify-between bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] px-6 md:px-8 z-30 ml-[88px] md:ml-0 md:mr-6 mr-6 border-transparent">
      
      {/* Left: Brand Name & Switcher */}
      <div className="flex items-center gap-8">
        <div className="font-serif text-2xl font-semibold text-foreground tracking-tight">
          The Dental Hub
        </div>
        {isManagePage && <BranchSwitcher />}
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        <NotificationCenter />

        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "w-10 h-10 border border-border",
            }
          }}
        />
      </div>
    </header>
  );
}
