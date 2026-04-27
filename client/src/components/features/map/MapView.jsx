import { useRef, useEffect, useState } from "react";
import { Map, Search, Loader2 } from "lucide-react";
import { gsap } from "gsap";
import mapService from "../../../services/mapService";
import CommunityMarker from "./CommunityMarker";

// MapView renders an OSM tile map via Leaflet (loaded from CDN) or
// falls back to a styled placeholder if Leaflet isn't available.
// mapService.nearby({ lat, lng }) → calls GET /experiences?lat=&lng=

export default function MapView({ communities = [], onSelect, center }) {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);  // Leaflet map instance
  const searchRef     = useRef(null);
  const [activeId, setActiveId]     = useState(null);
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching]   = useState(false);
  const [useLeaflet, setUseLeaflet] = useState(false);

  // Initial entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  // Try to init Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.L) { initLeaflet(); return; }
    const link   = document.createElement("link");
    link.rel     = "stylesheet";
    link.href    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initLeaflet;
    document.head.appendChild(script);
  }, []);

  const initLeaflet = () => {
    if (mapRef.current || !document.getElementById("bond-map")) return;
    const L = window.L;
    const defaultCenter = center || mapService.DEFAULT_CENTER || { lat: 26.2, lng: 92.9 };
    const map = L.map("bond-map", { zoomControl: false }).setView(
      [defaultCenter.lat, defaultCenter.lng], 6
    );
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
    setUseLeaflet(true);

    // Add markers
    communities.forEach((c) => {
      if (!c.latitude || !c.longitude) return;
      const marker = L.circleMarker([c.latitude, c.longitude], {
        radius: 10, fillColor: "#1C3D2E", fillOpacity: 0.9,
        color: "#fff", weight: 2,
      }).addTo(map);
      marker.bindPopup(`<strong>${c.name}</strong><br/>${c.village || ""}`);
      marker.on("click", () => { setActiveId(c.id); onSelect?.(c); });
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await mapService.geocode(query);
      setSuggestions(results.slice(0, 4));
      gsap.fromTo(searchRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    } catch { /* ignore */ } finally {
      setSearching(false);
    }
  };

  const handleSuggestionClick = (result) => {
    setSuggestions([]);
    setQuery(result.displayName.split(",")[0]);
    if (mapRef.current) {
      mapRef.current.setView([result.lat, result.lng], 10, { animate: true });
    }
  };

  const handleSelect = (community) => {
    setActiveId(community.id);
    onSelect?.(community);
    if (mapRef.current && community.latitude && community.longitude) {
      mapRef.current.setView([community.latitude, community.longitude], 12, { animate: true });
    }
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-[14px] border border-[#D9D0C2] bg-[#D4E6DC]" style={{ minHeight: 420 }}>
      {/* Search bar */}
      <div className="absolute left-4 top-4 z-[1000] w-72 max-w-[calc(100%-2rem)]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9285]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location…"
              className="w-full rounded-[9px] border border-[#D9D0C2] bg-white pl-9 pr-3 py-2 text-sm shadow-card focus:border-[#3E7A58] focus:outline-none transition"
            />
          </div>
          <button type="submit" disabled={searching}
            className="rounded-[9px] bg-[#1C3D2E] px-3 py-2 text-white shadow-card hover:bg-[#2A5940] transition disabled:opacity-60">
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Map size={14} />}
          </button>
        </form>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div ref={searchRef} className="mt-1.5 overflow-hidden rounded-[9px] border border-[#D9D0C2] bg-white shadow-modal">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSuggestionClick(s)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#1A2820] hover:bg-[#FAF7F2] border-b border-[#F2EDE4] last:border-0 transition">
                <Map size={12} className="text-[#7A9285] shrink-0" />
                <span className="truncate">{s.displayName.split(",").slice(0, 3).join(", ")}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet map container */}
      <div id="bond-map" className="h-full w-full" style={{ minHeight: 420 }} />

      {/* Fallback markers (shown when Leaflet isn't loaded) */}
      {!useLeaflet && (
        <>
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "linear-gradient(30deg, rgba(28,61,46,.15) 12%, transparent 12.5%, transparent 87%, rgba(28,61,46,.15) 87.5%), linear-gradient(150deg, rgba(28,61,46,.15) 12%, transparent 12.5%, transparent 87%, rgba(28,61,46,.15) 87.5%)", backgroundSize: "54px 94px" }}
          />
          {communities.map((c) => (
            <CommunityMarker key={c.id} community={c} active={activeId === c.id} onClick={handleSelect} />
          ))}
        </>
      )}

      {/* Community count pill */}
      <div className="absolute bottom-4 left-4 z-[999] flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1C3D2E] shadow-card backdrop-blur-sm">
        <Map size={12} /> {communities.length} communities
      </div>
    </div>
  );
}