"use client";

import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-6 flex h-16 items-center justify-between bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] px-6 md:px-8 z-30 ml-[88px] md:ml-0 md:mr-6 mr-6 border-transparent">
      
      {/* Left: Brand Name */}
      <div className="font-serif text-2xl font-semibold text-foreground tracking-tight">
        The Dental Hub
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full h-10 w-10">
          <Bell className="w-5 h-5" />
          <span className="sr-only">Notifications</span>
        </Button>

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
