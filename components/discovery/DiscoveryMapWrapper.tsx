"use client";

import dynamic from "next/dynamic";
import { ClinicConfig, BranchConfig } from "@/lib/db/mock-db";

const DiscoveryMap = dynamic(
  () => import("./DiscoveryMap"),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse" />
  }
);

interface DiscoveryMapWrapperProps {
  clinics: (ClinicConfig & { branches: BranchConfig[] })[];
}

export default function DiscoveryMapWrapper({ clinics }: DiscoveryMapWrapperProps) {
  return <DiscoveryMap clinics={clinics} />;
}
