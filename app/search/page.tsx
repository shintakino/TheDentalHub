"use client";

import { useState, useEffect, useCallback } from "react";
import ClinicList from "@/components/discovery/ClinicList";
import DiscoveryMapWrapper from "@/components/discovery/DiscoveryMapWrapper";
import { MarketplaceResult } from "@/lib/marketplace/types";
import { useSearchParams, useRouter } from "next/navigation";

import { Suspense } from "react";

function DiscoveryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [branches, setBranches] = useState<MarketplaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: parseFloat(searchParams.get("lat") || "7.0084"),
    lng: parseFloat(searchParams.get("lng") || "125.0139"),
  });

  // Geolocation detection
  useEffect(() => {
    const hasUrlCoords = searchParams.has("lat") && searchParams.has("lng");
    
    if (!hasUrlCoords && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          
          // Update URL to reflect detected location
          const params = new URLSearchParams(window.location.search);
          params.set("lat", latitude.toFixed(4));
          params.set("lng", longitude.toFixed(4));
          router.replace(`/search?${params.toString()}`, { scroll: false });
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        }
      );
    }
  }, [searchParams, router]);

  const fetchBranches = useCallback(async (lat: number, lng: number, q?: string) => {
    setLoading(true);
    try {
      const url = new URL("/api/marketplace/search", window.location.origin);
      url.searchParams.set("lat", lat.toString());
      url.searchParams.set("lng", lng.toString());
      if (q) url.searchParams.set("query", q);
      
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches(coords.lat, coords.lng, query);
  }, [coords.lat, coords.lng, query, fetchBranches]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const q = formData.get("query") as string;
    setQuery(q);
    
    // Update URL without refresh
    const params = new URLSearchParams(window.location.search);
    if (q) params.set("query", q);
    else params.delete("query");
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleMapMove = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("lat", lat.toFixed(4));
    params.set("lng", lng.toFixed(4));
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Side: Search & Listings */}
      <div className="w-full md:w-[450px] lg:w-[550px] flex flex-col border-r bg-background z-10">
        <div className="p-6 border-b space-y-4">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Discover Dental Excellence</h1>
          <form onSubmit={handleSearch} className="relative">
            <input 
              name="query"
              defaultValue={query}
              placeholder="Search by clinic name, city, or service..."
              className="w-full pl-4 pr-10 py-3 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["General", "Cosmetic", "Orthodontics", "Implants", "Pediatric"].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setQuery(cat)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap ${
                  query === cat ? "bg-primary text-white border-primary" : "bg-card hover:bg-primary hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[150px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <ClinicList branches={branches} />
          )}
        </div>
      </div>

      {/* Right Side: Map */}
      <div className="flex-1 relative bg-muted">
        <DiscoveryMapWrapper 
          branches={branches} 
          onSearch={handleMapMove}
          center={[coords.lat, coords.lng]}
        />
      </div>
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading marketplace...</div>}>
      <DiscoveryContent />
    </Suspense>
  );
}
