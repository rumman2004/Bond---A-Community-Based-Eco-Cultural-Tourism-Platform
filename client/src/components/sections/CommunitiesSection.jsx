import { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, Star, MapPin, Compass, BookOpen, Leaf,
  ChevronRight, Shield, Users, AlertCircle,
} from "lucide-react";
import communityService from "../../services/communityService";
import storyService from "../../services/storyService";

gsap.registerPlugin(ScrollTrigger);

const HOW_IT_WORKS = [
  {
    icon: Compass,
    step: "01",
    title: "Discover",
    desc: "Browse verified local communities across India — filtered by culture, region, or experience type.",
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Book",
    desc: "Pick an experience package directly with the community. No middlemen, fair pricing, real impact.",
  },
  {
    icon: Leaf,
    step: "03",
    title: "Experience",
    desc: "Arrive, immerse, and leave having contributed directly to the people who call that place home.",
  },
];

/* ── Animated scroll wrapper ── */
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0, duration: 0.7, delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}

/* ── Community card ── */
function CommunityCard({ c }) {
  const navigate = useNavigate();
  const target = c.slug ? `/community/${c.slug}` : `/community/${c.id || c._id}`;

  const badgeLabel = c.badge || (c.is_eco_certified ? "Eco-certified" : c.status === "verified" ? "Verified" : null);
  const badgeStyle = {
    "Eco-certified": { bg: "var(--color-forest-pale)", color: "var(--color-forest)", icon: "🌿" },
    "Top Rated":    { bg: "var(--color-amber-light)", color: "var(--color-amber)", icon: "⭐" },
    "Verified":     { bg: "white", color: "var(--color-forest)", icon: "✓" },
  };
  const bs = badgeLabel ? (badgeStyle[badgeLabel] || badgeStyle["Verified"]) : null;

  const rating = c.rating || parseFloat(c.avg_rating) || null;
  const reviewCount = c.reviews || c.review_count || 0;
  const location =
    c.location ||
    [c.village, c.state].filter(Boolean).join(", ") ||
    null;
  const tagLine =
    c.tag ||
    (c.description ? c.description.slice(0, 60) + (c.description.length > 60 ? "…" : "") : null);

  return (
    <div
      onClick={() => navigate(target)}
      className="group block rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--color-cream-light)",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border-soft)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
    >
      {/* Cover image */}
      <div className="relative h-52 overflow-hidden" style={{ backgroundColor: "var(--color-cream-mid)" }}>
        {(c.cover_image_url || c.coverImage || c.cover) ? (
          <img
            src={c.cover_image_url || c.coverImage || c.cover}
            alt={c.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* No image placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: "var(--color-forest-pale)" }}>
            <MapPin size={28} style={{ color: "var(--color-forest-muted)" }} />
            <span className="text-xs" style={{ color: "var(--color-forest-muted)" }}>No photo yet</span>
          </div>
        )}
        {bs && (
          <span
            className="absolute top-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: bs.bg, color: bs.color }}
          >
            {bs.icon} {badgeLabel}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-base leading-snug" style={{ color: "var(--color-text-dark)" }}>
            {c.name}
          </h3>
          {rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={13} fill="var(--color-amber)" style={{ color: "var(--color-amber)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
                {rating}
              </span>
            </div>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            <MapPin size={11} />
            {location}
          </div>
        )}

        {tagLine && (
          <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-mid)" }}>
            {tagLine}
          </p>
        )}

        <div
          className="mt-4 pt-4 border-t flex items-center justify-between"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {reviewCount > 0 ? `${reviewCount} reviews` : "New community"}
          </span>
          <span
            className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all duration-200"
            style={{ color: "var(--color-forest)" }}
          >
            Explore <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton loader ── */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)" }}
    >
      <div className="h-52 animate-pulse" style={{ backgroundColor: "var(--color-cream-mid)" }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 rounded-lg w-3/4 animate-pulse" style={{ backgroundColor: "var(--color-cream-mid)" }} />
        <div className="h-3 rounded-lg w-1/2 animate-pulse" style={{ backgroundColor: "var(--color-cream-mid)" }} />
        <div className="h-3 rounded-lg w-full animate-pulse" style={{ backgroundColor: "var(--color-cream-mid)" }} />
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ icon: Icon, message, sub, action, actionLabel }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "var(--color-forest-pale)" }}>
        <Icon size={26} style={{ color: "var(--color-forest-muted)" }} />
      </div>
      <p className="font-semibold text-base" style={{ color: "var(--color-text-dark)" }}>{message}</p>
      {sub && <p className="text-sm max-w-xs" style={{ color: "var(--color-text-muted)" }}>{sub}</p>}
      {action && (
        <button
          onClick={action}
          className="mt-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: "var(--color-forest-deep)", color: "white" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ── Error state ── */
function ErrorState({ onRetry }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-center">
      <AlertCircle size={32} style={{ color: "var(--color-forest-muted)" }} />
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Couldn't load communities right now.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-full text-xs font-semibold border transition-colors hover:bg-white"
        style={{ borderColor: "var(--color-border-mid)", color: "var(--color-text-mid)" }}
      >
        Try again
      </button>
    </div>
  );
}

/* ── Story skeleton ── */
function StorySkeleton() {
  return (
    <div className="flex gap-5 p-5 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
      <div className="w-24 h-24 rounded-xl shrink-0 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <div className="h-3 rounded w-1/3 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div className="h-4 rounded w-4/5 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div className="h-3 rounded w-full animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function CommunitiesSection() {
  const navigate = useNavigate();

  const [communities, setCommunities]   = useState([]);
  const [loadingC, setLoadingC]         = useState(true);
  const [errorC, setErrorC]             = useState(false);

  const [stories, setStories]           = useState([]);
  const [loadingS, setLoadingS]         = useState(true);
  const [errorS, setErrorS]             = useState(false);

  const fetchCommunities = () => {
    setLoadingC(true);
    setErrorC(false);
    communityService
      .list("limit=3&status=verified")
      .then((res) => {
        const list = res?.data?.communities || res?.data || [];
        setCommunities(list.slice(0, 3));
      })
      .catch(() => setErrorC(true))
      .finally(() => setLoadingC(false));
  };

  const fetchStories = () => {
    setLoadingS(true);
    setErrorS(false);
    storyService
      .list("limit=2&published=true")
      .then((res) => {
        const list = res?.data?.stories || res?.data || [];
        const mapped = list.slice(0, 2).map((s) => ({
          ...s,
          communityName: s.community_name || s.community?.name || "Community",
          excerpt: s.excerpt || (s.body ? s.body.slice(0, 120) + "…" : ""),
          coverImg: s.cover_image_url || s.coverImage || s.cover || null,
          readTime: s.read_time ||
            `${Math.max(2, Math.ceil((s.body?.split(" ")?.length || 200) / 200))} min`,
        }));
        setStories(mapped);
      })
      .catch(() => setErrorS(true))
      .finally(() => setLoadingS(false));
  };

  useEffect(() => {
    fetchCommunities();
    fetchStories();
  }, []);

  return (
    <>
      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6" style={{ backgroundColor: "var(--color-cream-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--color-forest-muted)" }}>
                The way it works
              </span>
              <h2
                className="text-4xl sm:text-5xl mt-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Simpler than you think.
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }, i) => (
              <FadeUp key={step} delay={i * 0.1}>
                <div
                  className="relative p-8 rounded-2xl h-full"
                  style={{
                    backgroundColor: "var(--color-cream-light)",
                    border: "1px solid var(--color-border-soft)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <span
                    className="absolute top-6 right-6 text-5xl font-semibold select-none"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-forest-pale)" }}
                  >
                    {step}
                  </span>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: "var(--color-forest-pale)" }}
                  >
                    <Icon size={20} style={{ color: "var(--color-forest)" }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-dark)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-mid)" }}>{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COMMUNITIES ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--color-forest-muted)" }}>
                  Communities
                </span>
                <h2
                  className="text-4xl sm:text-5xl mt-3 tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                >
                  Places worth the detour.
                </h2>
              </div>
              <Link
                to="/explore"
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 duration-200"
                style={{ color: "var(--color-forest)" }}
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingC ? (
              [1, 2, 3].map((k) => (
                <FadeUp key={k} delay={k * 0.08}>
                  <SkeletonCard />
                </FadeUp>
              ))
            ) : errorC ? (
              <ErrorState onRetry={fetchCommunities} />
            ) : communities.length === 0 ? (
              <EmptyState
                icon={MapPin}
                message="No communities yet"
                sub="Communities will appear here once they're verified."
                action={() => navigate("/explore")}
                actionLabel="Browse all"
              />
            ) : (
              communities.map((c, i) => (
                <FadeUp key={c._id || c.id} delay={i * 0.08}>
                  <CommunityCard c={c} />
                </FadeUp>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── STORIES ── */}
      <section className="py-24 px-6" style={{ backgroundColor: "var(--color-forest-deep)" }}>
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--color-forest-muted)" }}>
                  Cultural stories
                </span>
                <h2
                  className="text-4xl sm:text-5xl mt-3 tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-cream-light)" }}
                >
                  Told by the people there.
                </h2>
              </div>
              <Link
                to="/stories"
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 duration-200"
                style={{ color: "var(--color-forest-soft)" }}
              >
                All stories <ArrowRight size={15} />
              </Link>
            </div>
          </FadeUp>

          {loadingS ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StorySkeleton />
              <StorySkeleton />
            </div>
          ) : errorS ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle size={28} style={{ color: "rgba(255,255,255,0.3)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Couldn't load stories right now.
              </p>
              <button
                onClick={fetchStories}
                className="px-4 py-2 rounded-full text-xs font-semibold border transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}
              >
                Try again
              </button>
            </div>
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <BookOpen size={28} style={{ color: "rgba(255,255,255,0.3)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                No stories published yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stories.map((s, i) => (
                <FadeUp key={s._id || s.id || s.slug} delay={i * 0.1}>
                  <div
                    onClick={() => navigate(`/story/${s.slug || s.id || s._id}`)}
                    className="group flex gap-5 p-5 rounded-2xl transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.09)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0"
                      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                      {s.coverImg ? (
                        <img
                          src={s.coverImg}
                          alt={s.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={20} style={{ color: "rgba(255,255,255,0.2)" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs mb-2" style={{ color: "var(--color-forest-muted)" }}>
                        {s.communityName} · {s.readTime} read
                      </p>
                      <h3
                        className="font-semibold text-base leading-snug mb-2"
                        style={{ fontFamily: "var(--font-display)", color: "var(--color-cream-light)" }}
                      >
                        {s.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed line-clamp-2"
                        style={{ color: "var(--color-forest-soft)" }}
                      >
                        {s.excerpt}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="py-16 px-6" style={{ backgroundColor: "var(--color-cream-mid)" }}>
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="flex flex-wrap items-center justify-center gap-10 text-center">
              {[
                { icon: Shield, label: "Verified communities only" },
                { icon: Leaf,   label: "Eco-sustainability ratings" },
                { icon: Users,  label: "100% revenue to locals" },
                { icon: Star,   label: "Curated & quality-checked" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon size={18} style={{ color: "var(--color-forest)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-text-mid)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}