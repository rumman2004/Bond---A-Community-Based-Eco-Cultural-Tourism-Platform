import { useState, useRef } from "react";
import { MapPin, Search, Loader2, LocateFixed } from "lucide-react";
import { gsap } from "gsap";
import mapService from "../../../services/mapService";

export default function LocationPicker({ onChange, initialValue = {} }) {
  const [form, setForm]           = useState({ address: initialValue.address || "", lat: initialValue.lat || "", lng: initialValue.lng || "" });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const suggestRef = useRef(null);

  const handleSearch = async () => {
    if (!form.address.trim()) return;
    setLoading(true);
    try {
      const results = await mapService.geocode(form.address);
      setSuggestions(results.slice(0, 5));
      if (suggestRef.current) {
        gsap.fromTo(suggestRef.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } };

  const pickSuggestion = (s) => {
    const next = { address: s.displayName.split(",").slice(0, 3).join(", "), lat: String(s.lat), lng: String(s.lng) };
    setForm(next);
    setSuggestions([]);
    onChange?.(next);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const name = await mapService.reverseGeocode(latitude, longitude);
        const next = { address: name.split(",").slice(0, 3).join(", "), lat: String(latitude), lng: String(longitude) };
        setForm(next);
        onChange?.(next);
      } catch { /* ignore */ } finally { setGeoLoading(false); }
    }, () => setGeoLoading(false));
  };

  const update = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-3">
      {/* Address search */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">Location</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9285]" />
            <input
              name="address"
              value={form.address}
              onChange={update}
              onKeyDown={handleKeyDown}
              placeholder="Search address or place name…"
              className="w-full rounded-[9px] border border-[#D9D0C2] bg-white pl-9 pr-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
            />
          </div>
          <button type="button" onClick={handleSearch} disabled={loading}
            className="rounded-[9px] bg-[#1C3D2E] px-3 py-2 text-white hover:bg-[#2A5940] transition disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </button>
          <button type="button" onClick={useCurrentLocation} disabled={geoLoading}
            title="Use my location"
            className="rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2 text-[#3E7A58] hover:bg-[#FAF7F2] transition disabled:opacity-60">
            {geoLoading ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div ref={suggestRef} className="mt-1.5 overflow-hidden rounded-[9px] border border-[#D9D0C2] bg-white shadow-card">
            {suggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => pickSuggestion(s)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#1A2820] hover:bg-[#FAF7F2] border-b border-[#F2EDE4] last:border-0 transition">
                <MapPin size={12} className="text-[#7A9285] shrink-0" />
                <span className="truncate">{s.displayName.split(",").slice(0, 4).join(", ")}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lat / Lng */}
      <div className="grid grid-cols-2 gap-3">
        {["lat", "lng"].map((k) => (
          <div key={k}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">{k === "lat" ? "Latitude" : "Longitude"}</label>
            <input
              type="number"
              name={k}
              value={form[k]}
              onChange={update}
              step="any"
              placeholder={k === "lat" ? "26.2006" : "92.9376"}
              className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm font-mono text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}