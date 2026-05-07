"use client";

import { useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MarketplaceResult } from "@/lib/marketplace/types";
import Link from "next/link";

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface DiscoveryMapProps {
  branches: MarketplaceResult[];
  onSearch: (lat: number, lng: number) => void;
  center?: [number, number];
}

function MapEvents({ onSearch }: { onSearch: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onSearch(center.lat, center.lng);
    },
  });
  return null;
}

function MapUpdater({ branches }: { branches: MarketplaceResult[] }) {
  const map = useMap();

  useEffect(() => {
    if (branches.length > 0) {
      const validBranches = branches.filter(b => b.latitude && b.longitude);
      if (validBranches.length > 0) {
        const bounds = L.latLngBounds(
          validBranches.map((b) => [parseFloat(b.latitude!), parseFloat(b.longitude!)] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [branches, map]);

  return null;
}

export default function DiscoveryMap({ branches, onSearch, center = [7.0084, 125.0139] }: DiscoveryMapProps) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {branches.map(branch => {
          if (!branch.latitude || !branch.longitude) return null;
          return (
            <Marker key={branch.id} position={[parseFloat(branch.latitude), parseFloat(branch.longitude)]}>
              <Popup className="clinic-popup">
                <div className="p-2 min-w-[200px] space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-lg leading-tight">{branch.clinicName}</h3>
                    <p className="text-xs font-medium text-primary">{branch.branchName}</p>
                    <p className="text-xs text-muted-foreground">{branch.address}</p>
                  </div>
                  <Link 
                    href={`/${branch.subdomain}/book?branchId=${branch.id}`}
                    className="block w-full text-center py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Book Appointment
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <MapEvents onSearch={onSearch} />
        <MapUpdater branches={branches} />
      </MapContainer>
      
      {/* Custom Leaflet overrides in style tag because Leaflet's z-index is problematic */}
      <style jsx global>{`
        .leaflet-container {
          z-index: 0 !important;
        }
        .clinic-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
        }
        .clinic-popup .leaflet-popup-content {
          margin: 0;
          width: 240px !important;
        }
        .clinic-popup .leaflet-popup-tip {
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
