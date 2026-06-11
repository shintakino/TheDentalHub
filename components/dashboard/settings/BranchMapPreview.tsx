"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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
  latitude?: string | null;
  longitude?: string | null;
  onCoordsChange: (lat: string, lng: string) => void;
  onAddressChange: (address: string) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 17);
  }, [center, map]);
  return null;
}

export function BranchMapPreview({ 
  address, 
  latitude, 
  longitude, 
  onCoordsChange, 
  onAddressChange 
}: BranchMapPreviewProps) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastResolvedAddress, setLastResolvedAddress] = useState("");
  const markerRef = useRef<L.Marker>(null);

  // Initialize coords from props if they exist
  useEffect(() => {
    if (latitude && longitude) {
      const latVal = parseFloat(latitude);
      const lngVal = parseFloat(longitude);
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        setCoords([latVal, lngVal]);
      }
    }
  }, [latitude, longitude]);

  // Geocode address when user types it
  useEffect(() => {
    if (!address || address.length < 5) return;
    if (address === lastResolvedAddress) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoords([lat, lon]);
          setLastResolvedAddress(address);
          onCoordsChange(lat.toString(), lon.toString());
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [address, lastResolvedAddress, onCoordsChange]);

  // Handle marker dragend
  const eventHandlers = useMemo(
    () => ({
      async dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          const newLat = latLng.lat;
          const newLng = latLng.lng;
          
          setCoords([newLat, newLng]);
          onCoordsChange(newLat.toString(), newLng.toString());

          // Reverse geocode to update address input
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`);
            const data = await response.json();
            if (data && data.display_name) {
              setLastResolvedAddress(data.display_name);
              onAddressChange(data.display_name);
            }
          } catch (e) {
            console.error("Reverse geocoding failed:", e);
          }
        }
      },
    }),
    [onCoordsChange, onAddressChange]
  );

  if (!address || address.length < 5) return null;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center font-outfit text-sm text-slate-500">
          Updating location...
        </div>
      )}
      {coords ? (
        <MapContainer 
          center={coords} 
          zoom={17} 
          className="h-full w-full"
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker 
            position={coords} 
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
          />
          <MapUpdater center={coords} />
        </MapContainer>
      ) : (
        <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-400 font-outfit text-sm">
          {loading ? "Searching..." : "Address not found on map"}
        </div>
      )}
      <div className="absolute bottom-2 left-2 z-[400] bg-white px-2 py-1 rounded-md text-[10px] font-outfit font-medium text-slate-500 shadow-sm border border-slate-100 pointer-events-none">
        Tip: Drag the marker to refine location
      </div>
    </div>
  );
}
