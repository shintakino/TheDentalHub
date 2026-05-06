export interface MarketplaceResult {
  id: string; // branchId
  clinicId: string;
  clinicName: string;
  clinicLogoUrl: string | null;
  primaryColor: string;
  subdomain: string;
  branchName: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  distance: number;
  nextSlots: string[];
  availabilityUpdatedAt: string | null;
  rating: string | null;
}
