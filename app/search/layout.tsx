import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { auth } from "@clerk/nextjs/server";

export default async function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (userId) {
    return (
      <div className="relative flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full md:pl-[304px]">
          <div className="pt-6">
            <Navbar />
          </div>
          <main className="flex-1 flex flex-col mt-2">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b flex items-center px-6 bg-card/80 backdrop-blur-md sticky top-0 z-[1000]">
        <div className="w-full flex items-center justify-between max-w-[1400px] mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-primary">
              The Dental Hub.
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Find a Clinic
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              For Providers
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
