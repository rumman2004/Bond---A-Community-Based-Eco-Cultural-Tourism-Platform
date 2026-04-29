import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { gsap } from "gsap";
import {
  Search, MapPin, Star, SlidersHorizontal, X, Leaf,
  Globe, Grid3X3, List, ChevronDown,
} from "lucide-react";
import experienceService from "../../services/experienceService";

const CATEGORIES = ["All", "Cultural", "Eco", "Homestay", "Adventure", "Culinary"];
const REGIONS    = ["All Regions", "Assam", "Arunachal Pradesh", "Nagaland", "Meghalaya", "Manipur", "Mizoram", "Sikkim"];

/* ── Tag chip ── */
function Tag({ label, color = "forest" }) {
  const styles = {
    amber:      { bg: "var(--color-amber-light)",      color: "var(--color-amber)" },
    forest:     { bg: "var(--color-forest-pale)",      color: "var(--color-forest)" },
    terracotta: { bg: "var(--color-terracotta-light)", color: "var(--color-terracotta)" },
  };
  const s = styles[color] || styles.forest;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  );
}

/* ── Skeleton card ── */
function SkeletonCard({ view }) {
  if (view === "list") {
    return (
      <div
        className="flex gap-4 rounded-2xl overflow-hidden animate-pulse"
        style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)", height: "120px" }}
      >
        <div className="w-40 flex-shrink-0" style={{ background: "var(--color-cream-mid)" }} />
        <div className="flex flex-col gap-3 py-4 pr-5 flex-1 justify-center">
          <div className="h-4 rounded-lg w-2/3" style={{ background: "var(--color-cream-mid)" }} />
          <div className="h-3 rounded-lg w-1/2" style={{ background: "var(--color-cream-mid)" }} />
          <div className="h-3 rounded-lg w-1/3" style={{ background: "var(--color-cream-mid)" }} />
        </div>
      </div>
    );
  }
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)" }}
    >
      <div className="h-48" style={{ background: "var(--color-cream-mid)" }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 rounded-lg w-3/4" style={{ background: "var(--color-cream-mid)" }} />
        <div className="h-3 rounded-lg w-1/2" style={{ background: "var(--color-cream-mid)" }} />
        <div className="h-3 rounded-lg w-1/4" style={{ background: "var(--color-cream-mid)" }} />
      </div>
    </div>
  );
}

/* ── Experience card ── */
function ExploreCard({ exp, view }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
  }, []);

  const inTouristArea = location.pathname.startsWith("/tourist");
  const target = `${inTouristArea ? "/tourist" : ""}/experience/${exp.slug || exp.id}`;

  if (view === "list") {
    return (
      <div
        ref={ref}
        onClick={() => navigate(target)}
        className="group flex gap-4 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: "var(--color-cream-light)",
          border: "1px solid var(--color-border-soft)",
          boxShadow: "var(--shadow-card)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
      >
        <div className="relative w-40 flex-shrink-0 overflow-hidden">
          {exp.img ? (
            <img
              src={exp.img}
              alt={exp.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#D4E6DC] text-[#3E7A58]">
              <Leaf size={24} />
            </div>
          )}
          {exp.eco && (
            <div
              className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-forest)" }}
            >
              <Leaf size={12} color="white" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between py-4 pr-5 flex-1 min-w-0 gap-2">
          <div className="flex flex-col gap-1">
            <Tag label={exp.tag} color={exp.tagColor} />
            <h3
              className="text-lg mt-1 leading-snug"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              {exp.name}
            </h3>
            <div className="flex items-center gap-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              <MapPin size={12} /><span>{exp.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <Star size={13} fill="var(--color-amber)" color="var(--color-amber)" />
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>{exp.rating}</span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>({exp.reviews})</span>
            </div>
            <div>
              <span className="font-bold text-base" style={{ color: "var(--color-forest-deep)" }}>
                ₹{exp.price.toLocaleString()}
              </span>
              <span className="text-xs ml-1" style={{ color: "var(--color-text-muted)" }}>/ person</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onClick={() => navigate(target)}
      className="group rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
    >
      <div className="relative h-48 overflow-hidden">
        {exp.img ? (
          <img
            src={exp.img}
            alt={exp.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#D4E6DC] text-[#3E7A58]">
            <Leaf size={34} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2 items-center">
          <Tag label={exp.tag} color={exp.tagColor} />
          {exp.eco && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-forest)" }}
            >
              <Leaf size={11} color="white" />
            </div>
          )}
        </div>
        <div
          className="absolute bottom-3 right-3 text-sm font-bold px-2.5 py-1 rounded-lg"
          style={{ background: "white", color: "var(--color-forest-deep)" }}
        >
          ₹{exp.price.toLocaleString()}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3
          className="text-base leading-snug"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
        >
          {exp.name}
        </h3>
        <div className="flex items-center gap-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <MapPin size={12} /><span>{exp.location}</span>
        </div>
        <div
          className="flex items-center justify-between pt-3 mt-auto"
          style={{ borderTop: "1px solid var(--color-border-soft)" }}
        >
          <div className="flex items-center gap-1">
            <Star size={12} fill="var(--color-amber)" color="var(--color-amber)" />
            <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>{exp.rating}</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>({exp.reviews})</span>
          </div>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{exp.duration}</span>
        </div>
      </div>
    </div>
  );
}

const TAG_COLOR_MAP = { Cultural: "terracotta", Eco: "forest", Adventure: "amber" };

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]               = useState(searchParams.get("q") || "");
  const communityId                     = searchParams.get("community");
  const [activeCategory, setCategory]   = useState("All");
  const [activeRegion, setRegion]       = useState("All Regions");
  const [priceMax, setPriceMax]         = useState(10000);
  const [ecoOnly, setEcoOnly]           = useState(false);
  const [view, setView]                 = useState("grid");
  const [showFilters, setShowFilters]   = useState(false);

  const [experiences, setExperiences]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current?.children ? Array.from(headerRef.current.children) : [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    const queryStr = communityId ? `community_id=${communityId}` : "";
    experienceService.list(queryStr)
      .then((res) => {
        const list = res?.data?.experiences || [];
        const mapped = list.map((e) => ({
          id: e.id,
          slug: e.slug,
          name: e.title,
          location: [e.village, e.state].filter(Boolean).join(", ") || "Northeast India",
          category: e.category || "Cultural",
          tag: e.category || "Cultural",
          tagColor: TAG_COLOR_MAP[e.category] || "forest",
          rating: e.avg_rating ? parseFloat(e.avg_rating).toFixed(1) : "0.0",
          reviews: parseInt(e.total_reviews) || 0,
          price: parseFloat(e.price_per_person) || 0,
          duration: e.duration_days ? `${e.duration_days} day${e.duration_days > 1 ? "s" : ""}` : (e.duration_hours ? `${e.duration_hours} hr` : "N/A"),
          eco: e.eco_certified ?? true,
          img: e.images?.[0]?.image_url || e.cover_image_url || "",
        }));
        setExperiences(mapped);
      })
      .catch(() => setError("Failed to load experiences"))
      .finally(() => setLoading(false));
  }, [communityId]);

  // Sync URL query
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    setSearchParams(params, { replace: true });
  }, [query]);

  const filtered = experiences.filter((e) => {
    const q = query.toLowerCase();
    return (
      (!q || e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) &&
      (activeCategory === "All" || e.category === activeCategory) &&
      (activeRegion === "All Regions" || e.location.includes(activeRegion)) &&
      e.price <= priceMax &&
      (!ecoOnly || e.eco)
    );
  });

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <section className="pt-28 pb-14 px-5" style={{ background: "var(--color-forest-deep)" }}>
        <div ref={headerRef} className="max-w-4xl mx-auto flex flex-col items-center gap-5 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-forest-muted)" }}>
            Verified Experiences
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              color: "var(--color-cream-light)",
            }}
          >
            Explore Experiences
          </h1>
          <p className="text-sm" style={{ color: "var(--color-forest-soft)" }}>
            {loading ? "Loading…" : `${experiences.length} verified community experiences across Northeast India`}
          </p>

          {/* Search bar */}
          <div
            className="w-full max-w-xl flex items-center gap-3 px-5 py-3.5 rounded-full"
            style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-mid)" }}
          >
            <Search size={17} style={{ color: "var(--color-forest-muted)", flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places, communities, experiences..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--color-text-dark)" }}
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={15} style={{ color: "var(--color-text-muted)" }} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 py-10">

        {/* ── TOOLBAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={
                  activeCategory === cat
                    ? { background: "var(--color-forest-deep)", color: "white" }
                    : {
                        background: "var(--color-cream-light)",
                        color: "var(--color-text-mid)",
                        border: "1px solid var(--color-border-soft)",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View + filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
              style={
                showFilters
                  ? { background: "var(--color-forest)", color: "white", border: "none" }
                  : {
                      borderColor: "var(--color-border-soft)",
                      color: "var(--color-text-mid)",
                      background: "var(--color-cream-light)",
                    }
              }
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="p-2.5 rounded-xl border transition-all duration-200"
              style={{
                borderColor: "var(--color-border-soft)",
                background: "var(--color-cream-light)",
                color: "var(--color-text-mid)",
              }}
            >
              {view === "grid" ? <List size={16} /> : <Grid3X3 size={16} />}
            </button>
          </div>
        </div>

        {/* ── FILTERS ── */}
        {showFilters && (
          <div
            className="mb-6 p-5 rounded-2xl flex flex-wrap gap-6 items-center"
            style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)" }}
          >
            {/* Region */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Region</label>
              <select
                value={activeRegion}
                onChange={(e) => setRegion(e.target.value)}
                className="text-sm px-3 py-2 rounded-xl outline-none border cursor-pointer"
                style={{
                  borderColor: "var(--color-border-soft)",
                  color: "var(--color-text-dark)",
                  background: "var(--color-cream)",
                }}
              >
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                Max Price:{" "}
                <span style={{ color: "var(--color-forest)" }}>₹{priceMax.toLocaleString()}</span>
              </label>
              <input
                type="range" min={500} max={25000} step={500} value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-40"
                style={{ accentColor: "var(--color-forest)" }}
              />
            </div>

            {/* Eco toggle */}
            <button
              onClick={() => setEcoOnly(!ecoOnly)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
              style={
                ecoOnly
                  ? { background: "var(--color-forest)", color: "white", border: "none" }
                  : {
                      borderColor: "var(--color-border-soft)",
                      color: "var(--color-text-mid)",
                      background: "transparent",
                    }
              }
            >
              <Leaf size={13} /> Eco-certified only
            </button>

            <button
              onClick={() => {
                setRegion("All Regions");
                setPriceMax(10000);
                setEcoOnly(false);
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("community");
                setSearchParams(newParams);
              }}
              className="text-xs underline ml-auto"
              style={{ color: "var(--color-text-muted)" }}
            >
              Reset
            </button>
          </div>
        )}

        {/* ── RESULTS COUNT ── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>
              {loading ? "—" : filtered.length}
            </span>{" "}
            experience{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* ── GRID / LIST ── */}
        {error ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <Globe size={36} style={{ color: "var(--color-forest-soft)" }} />
            <p style={{ color: "var(--color-text-muted)" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm underline"
              style={{ color: "var(--color-forest)" }}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} view={view} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <Globe size={40} style={{ color: "var(--color-forest-soft)" }} />
            <p
              className="text-xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-muted)" }}
            >
              No experiences found
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Try adjusting your filters or search term.
            </p>
            <button
              onClick={() => { setQuery(""); setCategory("All"); setRegion("All Regions"); setEcoOnly(false); }}
              className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: "var(--color-forest)", color: "white" }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {filtered.map((exp) => (
              <ExploreCard key={exp.id} exp={exp} view={view} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
