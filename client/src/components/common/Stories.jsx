import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import {
  Search, X, BookOpen, Clock, Eye, User, MapPin,
  Grid3X3, List, Tag, ArrowRight, Feather, SlidersHorizontal,
  ChevronLeft, ChevronRight, Sparkles, TrendingUp,
} from "lucide-react";
import storyService from "../../services/storyService";
import { Badge } from "../ui";

/* ── Constants ── */
const TAG_OPTIONS = ["All", "Culture", "Heritage", "Travel", "Food", "Festival", "Nature", "Craft"];
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most Read" },
  { value: "oldest", label: "Oldest" },
];

/* ── Helpers ── */
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function readTime(body) {
  if (!body) return "1 min";
  return `${Math.max(1, Math.ceil((body.trim().split(/\s+/).length) / 200))} min`;
}

/* ── Skeleton ── */
function SkeletonCard({ view }) {
  const base = { background: "var(--color-cream-mid)" };
  if (view === "list") {
    return (
      <div
        className="flex gap-4 rounded-2xl overflow-hidden animate-pulse"
        style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)", height: 140 }}
      >
        <div className="w-44 flex-shrink-0" style={base} />
        <div className="flex flex-col gap-3 py-4 pr-5 flex-1 justify-center">
          <div className="h-3 rounded-lg w-20" style={base} />
          <div className="h-5 rounded-lg w-3/4" style={base} />
          <div className="h-3 rounded-lg w-full" style={base} />
          <div className="h-3 rounded-lg w-1/3" style={base} />
        </div>
      </div>
    );
  }
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)" }}
    >
      <div className="h-52" style={base} />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 rounded-lg w-24" style={base} />
        <div className="h-5 rounded-lg w-3/4" style={base} />
        <div className="h-3 rounded-lg w-full" style={base} />
        <div className="h-3 rounded-lg w-1/2" style={base} />
      </div>
    </div>
  );
}

/* ── Story Card ── */
function StoryCard({ story, view }) {
  const navigate = useNavigate();
  const locationObj = useLocation();
  const inTouristArea = locationObj.pathname.startsWith("/tourist");
  const ref = useRef(null);
  const target = `${inTouristArea ? "/tourist" : ""}/story/${story.slug || story.id}`;
  const location = [story.village, story.state].filter(Boolean).join(", ");

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  }, []);

  /* ── List View ── */
  if (view === "list") {
    return (
      <article
        ref={ref}
        onClick={() => navigate(target)}
        className="group flex gap-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: "var(--color-cream-light)",
          border: "1px solid var(--color-border-soft)",
          boxShadow: "var(--shadow-card)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
      >
        <div className="relative w-44 md:w-56 flex-shrink-0 overflow-hidden">
          {story.cover_image_url ? (
            <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--color-forest-pale)" }}>
              <BookOpen size={28} style={{ color: "var(--color-forest-muted)" }} />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between py-4 px-5 flex-1 min-w-0 gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap gap-2 items-center">
              {story.tags?.slice(0, 2).map((t) => (
                <Badge key={t} variant="eco" size="sm">{t}</Badge>
              ))}
              <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                <Clock size={11} /> {readTime(story.body)}
              </span>
            </div>
            <h3 className="text-lg leading-snug line-clamp-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
              {story.title}
            </h3>
            {story.excerpt && (
              <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {story.excerpt}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span className="flex items-center gap-1"><User size={12} /> {story.author_name || "Community"}</span>
              {location && <span className="flex items-center gap-1"><MapPin size={12} /> {location}</span>}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <Eye size={12} /> {story.view_count || 0}
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ── Grid View ── */
  return (
    <article
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
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {story.cover_image_url ? (
          <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--color-forest-pale)" }}>
            <BookOpen size={36} style={{ color: "var(--color-forest-muted)" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Reading time badge */}
        <div
          className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1"
          style={{ background: "white", color: "var(--color-forest-deep)" }}
        >
          <Clock size={11} /> {readTime(story.body)}
        </div>
        {/* Tags */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {story.tags?.slice(0, 2).map((t) => (
            <span key={t} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "var(--color-forest-pale)", color: "var(--color-forest)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-2.5 flex-1">
        <h3 className="text-base leading-snug line-clamp-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
          {story.title}
        </h3>
        {story.excerpt && (
          <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {story.excerpt}
          </p>
        )}

        {/* Author + Meta */}
        <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: "1px solid var(--color-border-soft)" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--color-forest-pale)" }}
            >
              {story.author_avatar ? (
                <img src={story.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={13} style={{ color: "var(--color-forest)" }} />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold" style={{ color: "var(--color-text-dark)" }}>{story.author_name || "Community"}</span>
              <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{formatDate(story.published_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <Eye size={12} /> {story.view_count || 0}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════
   STORIES PAGE — main export
════════════════════════════════════════════════════════ */
export default function Stories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTag, setActiveTag] = useState("All");
  const [sort, setSort] = useState("latest");
  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });

  const headerRef = useRef(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    gsap.fromTo(
      headerRef.current?.children ? Array.from(headerRef.current.children) : [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: "power2.out" }
    );
  }, []);

  /* ── Fetch stories ── */
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", pagination.page);
    params.set("limit", pagination.limit);
    if (query.trim()) params.set("search", query.trim());

    storyService.list(params.toString())
      .then((res) => {
        const data = res?.data;
        setStories(data?.stories || []);
        if (data?.pagination) setPagination((p) => ({ ...p, total: data.pagination.total }));
      })
      .catch(() => setError("Failed to load stories"))
      .finally(() => setLoading(false));
  }, [pagination.page, query]);

  /* ── Sync URL ── */
  useEffect(() => {
    const p = {};
    if (query) p.q = query;
    setSearchParams(p, { replace: true });
  }, [query]);

  /* ── Client-side filtering & sorting ── */
  const filtered = stories.filter((s) => {
    if (activeTag !== "All") {
      const tags = (s.tags || []).map((t) => t.toLowerCase());
      if (!tags.includes(activeTag.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sort === "popular") return (b.view_count || 0) - (a.view_count || 0);
    if (sort === "oldest") return new Date(a.published_at) - new Date(b.published_at);
    return new Date(b.published_at) - new Date(a.published_at);
  });

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>

      {/* ── HERO HEADER ── */}
      <section className="pt-28 pb-16 px-5 relative overflow-hidden" style={{ background: "var(--color-forest-deep)" }}>
        {/* Ambient circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, var(--color-forest-light), transparent 70%)", transform: "translate(30%, -40%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(circle, var(--color-amber-mid), transparent 70%)", transform: "translate(-30%, 40%)" }} />

        <div ref={headerRef} className="max-w-4xl mx-auto flex flex-col items-center gap-5 text-center relative z-10">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(212,230,220,0.12)", color: "var(--color-forest-soft)", border: "1px solid rgba(212,230,220,0.15)" }}>
            <Feather size={12} /> Community Narratives
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: "var(--color-cream-light)" }}>
            Stories from the Heart of India
          </h1>

          <p className="text-sm max-w-lg leading-relaxed" style={{ color: "var(--color-forest-soft)" }}>
            Discover authentic narratives written by communities across Northeast India — tales of heritage, craft, festivals, and the land itself.
          </p>

          {/* Search bar */}
          <div
            className="w-full max-w-xl flex items-center gap-3 px-5 py-3.5 rounded-full mt-2"
            style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-mid)" }}
          >
            <Search size={17} style={{ color: "var(--color-forest-muted)", flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
              placeholder="Search stories by title…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--color-text-dark)" }}
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={15} style={{ color: "var(--color-text-muted)" }} />
              </button>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 mt-1 text-xs" style={{ color: "var(--color-forest-muted)" }}>
            <span className="flex items-center gap-1"><Sparkles size={12} /> {loading ? "…" : `${pagination.total} stories`}</span>
            <span className="flex items-center gap-1"><TrendingUp size={12} /> Community-authored</span>
          </div>
        </div>
      </section>

      {/* ── CONTENT AREA ── */}
      <div className="max-w-6xl mx-auto px-5 py-10">

        {/* ── TOOLBAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Tag pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={
                  activeTag === tag
                    ? { background: "var(--color-forest-deep)", color: "white" }
                    : { background: "var(--color-cream-light)", color: "var(--color-text-mid)", border: "1px solid var(--color-border-soft)" }
                }
              >
                {tag}
              </button>
            ))}
          </div>

          {/* View + filters toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
              style={
                showFilters
                  ? { background: "var(--color-forest)", color: "white", border: "none" }
                  : { borderColor: "var(--color-border-soft)", color: "var(--color-text-mid)", background: "var(--color-cream-light)" }
              }
            >
              <SlidersHorizontal size={14} /> Sort
            </button>
            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="p-2.5 rounded-xl border transition-all duration-200"
              style={{ borderColor: "var(--color-border-soft)", background: "var(--color-cream-light)", color: "var(--color-text-mid)" }}
            >
              {view === "grid" ? <List size={16} /> : <Grid3X3 size={16} />}
            </button>
          </div>
        </div>

        {/* ── Sort panel ── */}
        {showFilters && (
          <div
            className="mb-6 p-5 rounded-2xl flex flex-wrap gap-4 items-center"
            style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)" }}
          >
            <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Sort by</label>
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setSort(o.value)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={
                  sort === o.value
                    ? { background: "var(--color-forest)", color: "white" }
                    : { background: "transparent", color: "var(--color-text-mid)", border: "1px solid var(--color-border-soft)" }
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>{loading ? "—" : filtered.length}</span>{" "}
            {filtered.length === 1 ? "story" : "stories"} found
          </p>
        </div>

        {/* ── GRID / LIST ── */}
        {error ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <BookOpen size={36} style={{ color: "var(--color-forest-soft)" }} />
            <p style={{ color: "var(--color-text-muted)" }}>{error}</p>
            <button onClick={() => window.location.reload()} className="text-sm underline" style={{ color: "var(--color-forest)" }}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} view={view} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <BookOpen size={40} style={{ color: "var(--color-forest-soft)" }} />
            <p className="text-xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-muted)" }}>
              No stories found
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => { setQuery(""); setActiveTag("All"); }}
              className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: "var(--color-forest)", color: "white" }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
            {filtered.map((s) => <StoryCard key={s.id} story={s} view={view} />)}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="p-2.5 rounded-xl border transition-all duration-200 disabled:opacity-40"
              style={{ borderColor: "var(--color-border-soft)", background: "var(--color-cream-light)", color: "var(--color-text-mid)" }}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setPagination((p) => ({ ...p, page }))}
                  className="w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={
                    pagination.page === page
                      ? { background: "var(--color-forest-deep)", color: "white" }
                      : { background: "var(--color-cream-light)", color: "var(--color-text-mid)", border: "1px solid var(--color-border-soft)" }
                  }
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && <span style={{ color: "var(--color-text-muted)" }}>…</span>}
            <button
              disabled={pagination.page >= totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="p-2.5 rounded-xl border transition-all duration-200 disabled:opacity-40"
              style={{ borderColor: "var(--color-border-soft)", background: "var(--color-cream-light)", color: "var(--color-text-mid)" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
