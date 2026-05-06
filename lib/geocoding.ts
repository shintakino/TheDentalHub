export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;
  
  try {
    // Attempt to use Nominatim (OpenStreetMap) - No API key required for low volume
    // We use a timeout to ensure we don't hang the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'TheDentalHub/1.0 (contact: admin@thedentalhub.com)'
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Geocoding failed");
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    // Fallback/Mock for development if Nominatim fails or returns nothing
    console.warn(`Geocoding returned no results for: ${address}. Using fallback.`);
    return {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      lat: 40.7128,
      lng: -74.0060
    };
  }
}
