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
}

export default function DiscoveryMapWrapper({ branches, onSearch, center }: DiscoveryMapWrapperProps) {
  return <DiscoveryMap branches={branches} onSearch={onSearch} center={center} />;
}
