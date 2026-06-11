"use client";

import { useState, useEffect, useCallback } from "react";
import ClinicList from "@/components/discovery/ClinicList";
import DiscoveryMapWrapper from "@/components/discovery/DiscoveryMapWrapper";
import { MarketplaceResult } from "@/lib/marketplace/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Map as MapIcon, List as ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [searchTrigger, setSearchTrigger] = useState(0);
  
  // Mobile view toggle state ("list" or "map")
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Geolocation detection
  useEffect(() => {
    const hasUrlCoords = searchParams.has("lat") && searchParams.has("lng");
    
    if (!hasUrlCoords && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const roundedLat = parseFloat(latitude.toFixed(4));
          const roundedLng = parseFloat(longitude.toFixed(4));
          setCoords({ lat: roundedLat, lng: roundedLng });
          setSearchTrigger((prev) => prev + 1);
          
          // Update URL to reflect detected location
          const params = new URLSearchParams(window.location.search);
          params.set("lat", roundedLat.toString());
          params.set("lng", roundedLng.toString());
          router.replace(`/search?${params.toString()}`, { scroll: false });
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        }
      );
    }
  }, [searchParams, router]);

  // Sync state with URL parameter changes
  useEffect(() => {
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const queryParam = searchParams.get("query") || "";

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      setCoords((prev) => {
        if (prev.lat !== lat || prev.lng !== lng) {
          setSearchTrigger((prevTrigger) => prevTrigger + 1);
          return { lat, lng };
        }
        return prev;
      });
    }

    setQuery((prev) => {
      if (prev !== queryParam) {
        setSearchTrigger((prevTrigger) => prevTrigger + 1);
        return queryParam;
      }
      return prev;
    });
  }, [searchParams]);

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

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrigger((prev) => prev + 1);
    if (!query.trim()) {
      updateUrlQuery("");
      return;
    }

    setLoading(true);
    try {
      // Try to geocode the query (e.g. check if it's a city or location)
      const response = await fetch(`/api/marketplace/geocode?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.coords) {
          const roundedLat = parseFloat(data.coords.lat.toFixed(4));
          const roundedLng = parseFloat(data.coords.lng.toFixed(4));
          setCoords({ lat: roundedLat, lng: roundedLng });
          
          const params = new URLSearchParams(window.location.search);
          params.set("query", query);
          params.set("lat", roundedLat.toString());
          params.set("lng", roundedLng.toString());
          router.push(`/search?${params.toString()}`, { scroll: false });
          return;
        }
      }
    } catch (err) {
      console.error("Geocoding failed for search:", err);
    } finally {
      setLoading(false);
    }

    // Fallback if geocoding fails or returns no results (run a standard keyword query on current location)
    updateUrlQuery(query);
  };

  const updateUrlQuery = (q: string) => {
    const params = new URLSearchParams(window.location.search);
    if (q) params.set("query", q);
    else params.delete("query");
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleCategoryClick = (cat: string) => {
    const newQuery = query === cat ? "" : cat;
    setQuery(newQuery);
    setSearchTrigger((prev) => prev + 1);
    updateUrlQuery(newQuery);
  };

  const handleMapMove = (lat: number, lng: number) => {
    const roundedLat = parseFloat(lat.toFixed(4));
    const roundedLng = parseFloat(lng.toFixed(4));
    setCoords({ lat: roundedLat, lng: roundedLng });
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("lat", roundedLat.toString());
    params.set("lng", roundedLng.toString());
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
      {/* Left Side: Search & Listings */}
      <div className={cn(
        "w-full md:w-[450px] lg:w-[550px] flex flex-col border-r bg-background z-10",
        viewMode === "list" ? "flex h-full" : "hidden md:flex"
      )}>
        <div className="p-6 border-b space-y-4">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Discover Dental Excellence</h1>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input 
              name="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap",
                  query === cat 
                    ? "bg-primary text-white border-primary shadow-sm" 
                    : "bg-card hover:bg-primary hover:text-white border-slate-200"
                )}
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
      <div className={cn(
        "flex-1 relative bg-muted",
        viewMode === "map" ? "block h-full" : "hidden md:block"
      )}>
        <DiscoveryMapWrapper 
          branches={branches} 
          onSearch={handleMapMove}
          center={[coords.lat, coords.lng]}
          searchTrigger={searchTrigger}
        />
      </div>

      {/* Floating Action Mobile Toggle Button */}
      <button
        onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary hover:bg-primary/95 text-white font-outfit font-semibold px-6 py-3 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 transition-all duration-300"
      >
        {viewMode === "list" ? (
          <>
            <MapIcon className="w-4 h-4" />
            Show Map
          </>
        ) : (
          <>
            <ListIcon className="w-4 h-4" />
            Show List
          </>
        )}
      </button>
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
