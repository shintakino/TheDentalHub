import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { CommandPalette } from "@/components/layout/CommandPalette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full md:pl-[304px]">
        <div className="pt-6">
          <Navbar />
        </div>
        <main className="flex-1 p-6 md:p-8 mt-2">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
