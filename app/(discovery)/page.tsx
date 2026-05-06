import { mockDb } from "@/lib/db/mock-db";
import ClinicList from "@/components/discovery/ClinicList";
import DiscoveryMapWrapper from "@/components/discovery/DiscoveryMapWrapper";

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const clinics = await mockDb.searchClinics(query);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Side: Search & Listings */}
      <div className="w-full md:w-[450px] lg:w-[550px] flex flex-col border-r bg-background z-10">
        <div className="p-6 border-b space-y-4">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Discover Dental Excellence</h1>
          <form className="relative">
            <input 
              name="query"
              defaultValue={query}
              placeholder="Search by clinic name, city, or service..."
              className="w-full pl-4 pr-10 py-3 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["General", "Cosmetic", "Orthodontics", "Implants", "Pediatric"].map((cat) => (
              <button key={cat} className="px-3 py-1.5 rounded-full border bg-card text-xs font-medium hover:bg-primary hover:text-white transition-all whitespace-nowrap">
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ClinicList clinics={clinics} />
        </div>
      </div>

      {/* Right Side: Map */}
      <div className="flex-1 relative bg-muted">
        <DiscoveryMapWrapper clinics={clinics} />
      </div>
    </div>
  );
}
