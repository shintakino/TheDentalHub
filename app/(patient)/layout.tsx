import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

import { Sidebar } from "@/components/layout/Sidebar";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="relative flex min-h-screen w-full bg-gray-50 dark:bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full md:pl-[304px]">
        <div className="pt-6">
          <Navbar />
        </div>
        <main className="flex-1 p-6 md:p-8 mt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
