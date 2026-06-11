"use client";

import dynamic from "next/dynamic";
import { MarketplaceResult } from "@/lib/marketplace/types";

const DiscoveryMap = dynamic(
  () => import("./DiscoveryMap"),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse" />
  }
);

interface DiscoveryMapWrapperProps {
  branches: MarketplaceResult[];
  onSearch: (lat: number, lng: number) => void;
  center?: [number, number];
  searchTrigger?: number;
}

export default function DiscoveryMapWrapper({ branches, onSearch, center, searchTrigger }: DiscoveryMapWrapperProps) {
  return <DiscoveryMap branches={branches} onSearch={onSearch} center={center} searchTrigger={searchTrigger} />;
}
