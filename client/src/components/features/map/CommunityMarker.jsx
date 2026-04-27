import { useRef } from "react";
import { MapPin } from "lucide-react";
import { gsap } from "gsap";

export default function CommunityMarker({ community, active = false, onClick }) {
  const btnRef = useRef(null);

  const handleEnter = () => {
    gsap.to(btnRef.current, { scale: 1.2, duration: 0.2, ease: "back.out(2)" });
  };
  const handleLeave = () => {
    if (!active) gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });
  };

  // community.latitude / community.longitude used by MapView Leaflet
  // For the CSS fallback mode, we use community.x / community.y (percentages)
  const style = {
    left:       `${community.x ?? 50}%`,
    top:        `${community.y ?? 50}%`,
    background: active ? "var(--color-amber)" : "var(--color-forest)",
    color:      "white",
    transform:  active ? "translate(-50%, -100%) scale(1.2)" : "translate(-50%, -100%)",
    zIndex:     active ? 10 : 1,
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() => onClick?.(community)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="absolute rounded-full p-2 shadow-md transition-colors focus:outline-none"
      style={style}
      title={community.name}
      aria-label={`Select ${community.name}`}
    >
      <MapPin size={18} fill="currentColor" />
      {active && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1C3D2E] px-2.5 py-1 text-[11px] font-semibold text-white shadow-card">
          {community.name}
        </span>
      )}
    </button>
  );
}