// mapService.js
// NOTE: The Bond server has NO /map/* routes.
// This service calls external APIs directly from the browser:
//   - Geocoding/search → OpenStreetMap Nominatim (free, no API key needed)
//   - Nearby experiences → your own backend /experiences with lat/lng params
// This keeps the server lightweight and avoids proxying public map data.

import api from "./api";

export const DEFAULT_CENTER = { lat: 26.2006, lng: 92.9376 }; // Assam, India
const NOMINATIM = "https://nominatim.openstreetmap.org";

const mapService = {
  /**
   * Geocode a place name → { lat, lng, displayName }
   * Was: GET /map/geocode?q=...  ❌ (no server route)
   * Now: calls Nominatim directly ✓
   *
   * @param {string} query — place name e.g. "Jorhat, Assam"
   */
  async geocode(query) {
    const url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
    const res  = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "BondPlatform/1.0" },
    });
    const results = await res.json();
    return results.map((r) => ({
      lat:         parseFloat(r.lat),
      lng:         parseFloat(r.lon),
      displayName: r.display_name,
    }));
  },

  /**
   * Reverse geocode lat/lng → place name string
   * @param {number} lat
   * @param {number} lng
   */
  async reverseGeocode(lat, lng) {
    const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res  = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "BondPlatform/1.0" },
    });
    const data = await res.json();
    return data.display_name || "";
  },

  /**
   * Get experiences near a coordinate from your own backend.
   * Was: GET /map/nearby?lat=...  ❌ (no server route)
   * Now: GET /experiences?lat=...&lng=...&radius=... ✓
   * (your experienceController can filter by location)
   *
   * @param {{ lat: number, lng: number, radius?: number }} params
   */
  nearby({ lat, lng, radius = 25 }) {
    return api.get(
      `/experiences?lat=${lat}&lng=${lng}&radius=${radius}`
    );
  },

  /**
   * Get all experience locations for map markers.
   * Was: GET /map/locations  ❌ (no server route)
   * Now: GET /experiences?fields=id,title,latitude,longitude ✓
   */
  listLocations() {
    return api.get("/experiences?fields=id,title,latitude,longitude");
  },
};

export default mapService;