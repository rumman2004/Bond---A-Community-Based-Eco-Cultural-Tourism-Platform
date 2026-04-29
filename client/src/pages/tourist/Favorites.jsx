import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { MapPin, Star, Trash2, Compass, Users, AlertCircle } from "lucide-react";
import userService from "../../services/userService";
import PageShell from "../PageShell";

// ─── Skeleton ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] border border-[#E0DAD0] overflow-hidden animate-pulse">
      <div className="h-[130px] bg-[#E8E3DA]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-[#EDE8E0]" />
        <div className="h-3 w-1/2 rounded bg-[#EDE8E0]" />
        <div className="h-3 w-full rounded bg-[#F5F2EE]" />
        <div className="h-3 w-4/5 rounded bg-[#F5F2EE]" />
      </div>
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────
function FavoriteCard({ item, type, onRemove, index }) {
  const ref      = useRef(null);
  const navigate = useNavigate();
  const isExp    = type === "experience";

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, delay: index * 0.07, ease: "power3.out" }
    );
  }, [index]);

  const handleRemove = (e) => {
    e.stopPropagation();
    gsap.to(ref.current, {
      opacity: 0, scale: 0.94, duration: 0.28, ease: "power3.in",
      onComplete: () => onRemove(item.target_id, type),
    });
  };

  const title = item.name ?? `${isExp ? "Experience" : "Community"} #${String(item.target_id).slice(0, 6)}`;
  const place = item.location ?? null;

  return (
    <div
      ref={ref}
      onClick={() => navigate(isExp ? `/tourist/experience/${item.slug}` : `/tourist/community/${item.slug}`)}
      className="group bg-white rounded-[16px] border border-[#E0DAD0] overflow-hidden
                 hover:border-[#A8C4B0] transition-colors duration-200 cursor-pointer"
    >
      {/* Image / placeholder */}
      <div
        className="h-[130px] relative flex items-center justify-center overflow-hidden"
        style={{ background: isExp ? "#D4E6DC" : "#EBD9C0" }}
      >
        {item.cover_image_url ? (
          <img
            src={item.cover_image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="opacity-40">
            {isExp
              ? <Compass size={36} color="#2D6A4A" strokeWidth={1.5} />
              : <Users   size={36} color="#A0622A" strokeWidth={1.5} />
            }
          </div>
        )}

        {/* Type badge */}
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-medium
                     uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{
            background: isExp ? "rgba(28,61,46,.82)" : "rgba(124,74,20,.82)",
            color:      isExp ? "#D6EDE0" : "#F5E4CC",
          }}
        >
          {isExp ? <Compass size={10} /> : <Users size={10} />}
          {isExp ? "Experience" : "Community"}
        </div>

        {/* Remove */}
        <button
          onClick={handleRemove}
          title="Remove from favorites"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center
                     justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     hover:scale-110 active:scale-95"
          style={{ background: "rgba(255,255,255,.92)" }}
        >
          <Trash2 size={13} color="#B45C5C" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className="text-[14px] font-medium text-[#111D17] leading-snug mb-1.5 line-clamp-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {title}
        </h3>

        {place && (
          <p className="flex items-center gap-1 text-[12px] text-[#8A8278] mb-2">
            <MapPin size={11} className="shrink-0" />
            {place}
          </p>
        )}

        {item.description && (
          <p className="text-[12px] text-[#8A8278] leading-relaxed line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-2.5 mt-auto"
          style={{ borderTop: "0.5px solid #EDE8E0" }}
        >
          <div className="flex items-center gap-1.5">
            {item.rating ? (
              <>
                <Star size={12} fill="#C4893F" color="#C4893F" />
                <span className="text-[12px] font-medium text-[#5A3D10]">
                  {Number(item.rating).toFixed(1)}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-[#B0A89A]">No rating yet</span>
            )}
          </div>
          <span className="text-[11px] text-[#9A9285]">
            {isExp ? "View experience" : "View community"} →
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section ───────────────────────────────────────────────────
function Section({ label, items, type, onRemove, visible }) {
  if (!visible || items.length === 0) return null;
  return (
    <div className="mb-8">
      <p
        className="text-[11px] font-medium uppercase tracking-widest mb-3.5"
        style={{ color: "#9A9285" }}
      >
        {label}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <FavoriteCard
            key={`${item.target_type}-${item.target_id}`}
            item={item}
            type={type}
            onRemove={onRemove}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Empty ─────────────────────────────────────────────────────
function EmptyAll() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#EDE8DE" }}
      >
        <Star size={24} color="#B09070" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-medium text-[#111D17] mb-1">Nothing saved yet</p>
      <p className="text-[13px] text-[#9A9285] max-w-[200px] leading-relaxed">
        Explore and save experiences or communities you love
      </p>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",        label: "All"          },
  { key: "experience", label: "Experiences"  },
  { key: "community",  label: "Communities"  },
];

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [filter,    setFilter]    = useState("all");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    userService
      .getFavorites()
      .then((res) => {
        const data = res?.data?.favorites ?? res?.favorites ?? [];
        setFavorites(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message || "Failed to load favorites."))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = useCallback(async (targetId, targetType) => {
    try {
      await userService.removeFavorite(targetType, targetId);
      setFavorites((prev) =>
        prev.filter((f) => !(f.target_id === targetId && f.target_type === targetType))
      );
    } catch (err) {
      console.error("Remove favorite failed:", err);
    }
  }, []);

  const experiences = favorites.filter((f) => f.target_type === "experience");
  const communities = favorites.filter((f) => f.target_type === "community");
  const total       = favorites.length;

  return (
    <PageShell>
      <div className="min-h-screen px-6 py-10" style={{ background: "#F7F4EF" }}>
        <div className="max-w-5xl mx-auto">

          {/* ── Hero header ── */}
          <div ref={headerRef} className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <p
                className="text-[11px] font-medium uppercase tracking-[.1em] mb-2"
                style={{ color: "#7A8C80" }}
              >
                My collection
              </p>
              <h1
                className="text-[32px] leading-[1.1] font-medium text-[#111D17]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Your saved{" "}
                <span style={{ color: "#2D6A4A" }}>places</span>
              </h1>

              {!loading && total > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {experiences.length > 0 && (
                    <span
                      className="text-[12px] font-medium px-3 py-1 rounded-full"
                      style={{ background: "#D6EDE0", color: "#1C5C38" }}
                    >
                      {experiences.length} experience{experiences.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {communities.length > 0 && (
                    <span
                      className="text-[12px] font-medium px-3 py-1 rounded-full"
                      style={{ background: "#F0E8DA", color: "#7A4F1E" }}
                    >
                      {communities.length} {communities.length !== 1 ? "communities" : "community"}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="text-[12px] font-medium px-4 py-1.5 rounded-full border transition-all duration-200"
                  style={{
                    background:   filter === f.key ? "#1C3D2E" : "#fff",
                    color:        filter === f.key ? "#F2EDE4" : "#5A6360",
                    borderColor:  filter === f.key ? "#1C3D2E" : "#D1CBC0",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: "0.5px", background: "#E3DDD5", marginBottom: "28px" }} />

          {/* ── Content ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "#FEF2F2" }}
              >
                <AlertCircle size={20} color="#B45C5C" />
              </div>
              <p className="text-[14px] font-medium text-[#111D17]">Something went wrong</p>
              <p className="text-[12px] mt-1" style={{ color: "#9A9285" }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-[12px] font-medium px-4 py-2 rounded-full"
                style={{ background: "#1C3D2E", color: "#F2EDE4" }}
              >
                Try again
              </button>
            </div>
          ) : total === 0 ? (
            <EmptyAll />
          ) : (
            <>
              <Section
                label="Experiences"
                items={experiences}
                type="experience"
                onRemove={handleRemove}
                visible={filter === "all" || filter === "experience"}
              />
              <Section
                label="Communities"
                items={communities}
                type="community"
                onRemove={handleRemove}
                visible={filter === "all" || filter === "community"}
              />
              {/* Edge case: filter active but that type is empty */}
              {((filter === "experience" && experiences.length === 0) ||
                (filter === "community"  && communities.length  === 0)) && (
                <EmptyAll />
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}