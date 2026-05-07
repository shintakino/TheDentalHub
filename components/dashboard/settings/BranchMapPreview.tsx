"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface BranchMapPreviewProps {
  address: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export function BranchMapPreview({ address }: BranchMapPreviewProps) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || address.length < 5) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [address]);

  if (!address || address.length < 5) return null;

  return (
    <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-200 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center font-outfit text-sm text-slate-500">
          Updating location...
        </div>
      )}
      {coords ? (
        <MapContainer 
          center={coords} 
          zoom={15} 
          className="h-full w-full"
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={coords} />
          <MapUpdater center={coords} />
        </MapContainer>
      ) : (
        <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-400 font-outfit text-sm">
          {loading ? "Searching..." : "Address not found on map"}
        </div>
      )}
    </div>
  );
}
