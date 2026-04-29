import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  ChevronRight,
  Compass,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Shield,
  Leaf,
  Globe,
  ArrowRight,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import communityService from "../../services/communityService";

function getCommunityImage(c) {
  return c.cover_image_url || c.images?.[0]?.image_url || c.image_url || "";
}

export default function TouristDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    communityService.list("status=verified&limit=6")
      .then((res) => {
        const data = res?.data?.communities ?? res?.communities ?? [];
        setCommunities(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(heroRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
      if (gridRef.current) {
        tl.fromTo(gridRef.current.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, "-=0.3");
      }
    });
    return () => ctx.revert();
  }, [loading]);

  const firstName = user?.name?.split(" ")[0] || "Traveller";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ═══ HERO GREETING ═══ */}
      <div
        ref={heroRef}
        className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mb-8"
        style={{
          background: "linear-gradient(135deg, #1C3D2E 0%, #2D6A4F 50%, #256D85 100%)",
          padding: "clamp(32px, 5vw, 56px) clamp(24px, 4vw, 48px)",
        }}
      >
        {/* Ambient pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.3), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} color="#A8CCBA" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "#A8CCBA" }}>
                Traveller Dashboard
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight text-white mb-3"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
            >
              {greeting}, {firstName}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              Discover verified communities, explore their stories, and plan your next authentic journey through Northeast India.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/tourist/explore")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              style={{ background: "white", color: "#1C3D2E" }}
            >
              <Search size={15} />
              Explore
            </button>
            <button
              onClick={() => navigate("/tourist/bookings")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              <Compass size={15} />
              My Bookings
            </button>
          </div>
        </div>
      </div>

      {/* ═══ COMMUNITIES SECTION ═══ */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} style={{ color: "var(--color-forest)" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--color-forest)" }}>
                Discover
              </span>
            </div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              Communities to explore
            </h2>
          </div>
          <button
            onClick={() => navigate("/tourist/explore")}
            className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 hover:gap-2.5"
            style={{ color: "var(--color-forest)" }}
          >
            See all <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl" style={{ background: "var(--color-cream-mid)", border: "1px solid var(--color-border-soft)" }} />
            ))}
          </div>
        ) : communities.length ? (
          <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {communities.map((c) => {
              const img = getCommunityImage(c);
              const loc = [c.village, c.state].filter(Boolean).join(", ") || "Northeast India";
              const rating = parseFloat(c.avg_rating);

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/tourist/community/${c.slug || c.id}`)}
                  className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "white",
                    border: "1px solid var(--color-border-soft)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(28,61,46,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)")}
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden" style={{ background: "var(--color-forest-pale)" }}>
                    {img ? (
                      <img src={img} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ color: "var(--color-forest-muted)" }}>
                        <Globe size={42} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {c.status === "verified" && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(255,255,255,0.9)", color: "#166534", backdropFilter: "blur(8px)" }}>
                          <Shield size={10} /> Verified
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {rating > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(255,255,255,0.9)", color: "#1A2820", backdropFilter: "blur(8px)" }}>
                        <Star size={11} fill="#C8883A" color="#C8883A" />
                        {rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3
                      className="text-base font-semibold leading-snug mb-2 transition-colors duration-200 group-hover:text-[#3E7A58]"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                    >
                      {c.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {loc}
                      </span>
                      {c.member_count && (
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {c.member_count} members
                        </span>
                      )}
                    </div>

                    {c.description && (
                      <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--color-text-muted)" }}>
                        {c.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--color-border-soft)" }}>
                      <div className="flex items-center gap-1.5">
                        <Leaf size={12} style={{ color: "var(--color-forest)" }} />
                        <span className="text-[11px] font-medium" style={{ color: "var(--color-forest)" }}>Community</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2" style={{ color: "var(--color-forest)" }}>
                        View <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
            style={{ background: "var(--color-cream-light)", border: "1px dashed var(--color-border-mid)" }}
          >
            <Compass size={40} style={{ color: "var(--color-text-muted)", marginBottom: 12 }} />
            <p className="text-base font-semibold mb-1" style={{ color: "var(--color-text-dark)" }}>
              No communities available right now
            </p>
            <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
              Verified communities will appear here as soon as they are approved.
            </p>
            <button
              onClick={() => navigate("/tourist/explore")}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition hover:brightness-110"
              style={{ background: "var(--color-forest-deep)", color: "white" }}
            >
              Explore
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
