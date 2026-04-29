import { useRef, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, Star, MapPin, Compass, BookOpen, Leaf,
  ChevronRight, Shield, Users, AlertCircle, RefreshCw,
} from "lucide-react";
import communityService from "../../services/communityService";
import storyService from "../../services/storyService";
import { Badge, Card, Loader, Avatar, Tooltip } from "../ui";
import { Toast, ToastContainer } from "../ui";
import { useAuth } from "../../context/AuthContext";

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

function CommunityCard({ c }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const prefix = user?.role === "tourist" ? "/tourist" : "";
  const target = c.slug ? `${prefix}/community/${c.slug}` : `${prefix}/community/${c.id || c._id}`;
  const [hovered, setHovered] = useState(false);

  const badgeLabel = c.badge || (c.is_eco_certified ? "Eco-certified" : c.status === "verified" ? "Verified" : null);
  const rating = c.rating || parseFloat(c.avg_rating) || null;
  const reviewCount = c.reviews || c.review_count || 0;
  const location = c.location || [c.village, c.state].filter(Boolean).join(", ") || null;
  const tagLine = c.tag || (c.description ? c.description.slice(0, 60) + (c.description.length > 60 ? "…" : "") : null);

  const getBadgeVariant = (label) => {
    if (label === "Eco-certified") return "success";
    if (label === "Top Rated") return "warning";
    return "default";
  };

  return (
    <div
      onClick={() => navigate(target)}
      className="group block rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        backgroundColor: "var(--color-cream-light)",
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        border: "1px solid var(--color-border-soft)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image */}
      <div className="relative h-52 overflow-hidden" style={{ backgroundColor: "var(--color-cream-mid)" }}>
        {(c.images?.[0]?.image_url || c.cover_image_url || c.coverImage || c.cover) ? (
          <img
            src={c.images?.[0]?.image_url || c.cover_image_url || c.coverImage || c.cover}
            alt={c.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: "var(--color-forest-pale)" }}>
            <MapPin size={28} style={{ color: "var(--color-forest-muted)" }} />
            <span className="text-xs" style={{ color: "var(--color-forest-muted)" }}>No photo yet</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(15,36,25,0.5) 0%, transparent 60%)",
            opacity: hovered ? 1 : 0,
          }}
        />

        {badgeLabel && (
          <div className="absolute top-4 left-4">
            <Badge variant={getBadgeVariant(badgeLabel)} size="sm">
              {badgeLabel === "Eco-certified" ? "🌿" : badgeLabel === "Top Rated" ? "⭐" : "✓"} {badgeLabel}
            </Badge>
          </div>
        )}

        {rating && (
          <div
            className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
          >
            <Star size={12} fill="var(--color-amber)" style={{ color: "var(--color-amber)" }} />
            <span className="text-xs font-bold" style={{ color: "var(--color-text-dark)" }}>{rating}</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-base leading-snug" style={{ color: "var(--color-text-dark)" }}>
            {c.name}
          </h3>
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
            className="flex items-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2"
            style={{ color: "var(--color-forest)" }}
          >
            Explore <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

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
        <div className="h-3 rounded-lg w-2/3 animate-pulse" style={{ backgroundColor: "var(--color-cream-mid)" }} />
      </div>
    </div>
  );
}

function StorySkeleton() {
  return (
    <div
      className="flex gap-5 p-5 rounded-2xl"
      style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="w-24 h-24 rounded-xl animate-pulse shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
      <div className="flex-1 flex flex-col gap-3 py-1">
        <div className="h-3 rounded w-1/3 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div className="h-4 rounded w-4/5 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div className="h-3 rounded w-full animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div className="h-3 rounded w-3/4 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, sub, action, actionLabel }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "var(--color-forest-pale)" }}>
        <Icon size={28} style={{ color: "var(--color-forest-muted)" }} />
      </div>
      <p className="font-semibold text-base" style={{ color: "var(--color-text-dark)" }}>{message}</p>
      {sub && <p className="text-sm max-w-xs" style={{ color: "var(--color-text-muted)" }}>{sub}</p>}
      {action && (
        <button
          onClick={action}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80 hover:-translate-y-0.5"
          style={{ backgroundColor: "var(--color-forest)", color: "white" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "var(--color-terracotta-light)" }}>
        <AlertCircle size={28} style={{ color: "var(--color-terracotta)" }} />
      </div>
      <p className="font-semibold" style={{ color: "var(--color-text-dark)" }}>Couldn't load communities</p>
      <p className="text-sm max-w-xs" style={{ color: "var(--color-text-muted)" }}>
        A network hiccup occurred. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-1 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80"
        style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)", border: "1px solid var(--color-border-mid)" }}
      >
        <RefreshCw size={14} /> Try again
      </button>
    </div>
  );
}

export default function CommunitiesSection() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [stories, setStories] = useState([]);
  const [loadingC, setLoadingC] = useState(true);
  const [loadingS, setLoadingS] = useState(true);
  const [errorC, setErrorC] = useState(false);
  const [errorS, setErrorS] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const fetchCommunities = useCallback(() => {
    setLoadingC(true);
    setErrorC(false);
    communityService
      .list("limit=6&featured=true")
      .then((res) => {
        const data = res.data?.communities || res.data || [];
        setCommunities(data);
        if (data.length > 0) addToast({ type: "success", message: `Loaded ${data.length} communities` });
      })
      .catch(() => {
        setErrorC(true);
        addToast({ type: "error", message: "Failed to load communities" });
      })
      .finally(() => setLoadingC(false));
  }, []);

  const fetchStories = useCallback(() => {
    setLoadingS(true);
    setErrorS(false);
    storyService
      .list("limit=4&published=true")
      .then((res) => {
        const data = res.data?.stories || res.data || [];
        setStories(data);
      })
      .catch(() => {
        setErrorS(true);
      })
      .finally(() => setLoadingS(false));
  }, []);

  useEffect(() => {
    fetchCommunities();
    fetchStories();
  }, []);

  return (
    <>
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6" style={{ backgroundColor: "var(--color-cream-mid)" }}>
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <span
                className="text-xs uppercase tracking-widest font-semibold"
                style={{ color: "var(--color-forest-muted)" }}
              >
                How it works
              </span>
              <h2
                className="text-4xl sm:text-5xl mt-3 tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Three steps to somewhere{" "}
                <em style={{ fontStyle: "italic", color: "var(--color-forest)" }}>real.</em>
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px"
              style={{ backgroundColor: "var(--color-border-mid)" }}
            />
            <div
              className="hidden md:block absolute top-10 left-2/3 right-8 h-px"
              style={{ backgroundColor: "var(--color-border-mid)" }}
            />

            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeUp key={step.step} delay={i * 0.12}>
                  <Card
                    className="p-8 rounded-2xl flex flex-col gap-5 relative group hover:-translate-y-1 transition-transform duration-300"
                    style={{
                      background: "var(--color-cream-light)",
                      border: "1px solid var(--color-border-soft)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {/* Step number */}
                    <div
                      className="text-6xl font-black leading-none select-none"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-border-mid)",
                        position: "absolute",
                        top: "16px",
                        right: "20px",
                      }}
                    >
                      {step.step}
                    </div>

                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300"
                      style={{ backgroundColor: "var(--color-forest-pale)" }}
                    >
                      <Icon size={24} style={{ color: "var(--color-forest)" }} />
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-xl mb-2"
                        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        {step.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/explore")}
                      className="flex items-center gap-1.5 text-xs font-semibold mt-auto transition-all duration-200 hover:gap-2.5 group"
                      style={{ color: "var(--color-forest)" }}
                    >
                      Get started <ChevronRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Card>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED COMMUNITIES ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: "var(--color-forest-muted)" }}
                >
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
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 duration-200 group"
                style={{ color: "var(--color-forest)" }}
              >
                View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
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
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: "var(--color-forest-muted)" }}
                >
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
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 duration-200 group"
                style={{ color: "var(--color-forest-soft)" }}
              >
                All stories <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </FadeUp>

          {loadingS ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StorySkeleton />
              <StorySkeleton />
            </div>
          ) : errorS ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <AlertCircle size={28} style={{ color: "rgba(255,255,255,0.3)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Couldn't load stories right now.
              </p>
              <button
                onClick={fetchStories}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold border transition-colors hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}
              >
                <RefreshCw size={13} /> Try again
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.09)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
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
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {s.communityName && (
                          <Badge size="sm" variant="outline" className="text-xs border-white/20 text-white/60">
                            {s.communityName}
                          </Badge>
                        )}
                        {s.readTime && (
                          <span className="text-xs" style={{ color: "var(--color-forest-muted)" }}>
                            · {s.readTime} read
                          </span>
                        )}
                      </div>
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
      <section
        className="py-14 px-6 border-y"
        style={{ backgroundColor: "var(--color-cream-mid)", borderColor: "var(--color-border-soft)" }}
      >
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 text-center">
              {[
                { icon: Shield, label: "Verified communities only" },
                { icon: Leaf, label: "Eco-sustainability ratings" },
                { icon: Users, label: "100% revenue to locals" },
                { icon: Star, label: "Curated & quality-checked" },
              ].map(({ icon: Icon, label }) => (
                <Tooltip key={label} content={label}>
                  <div className="flex items-center gap-2.5 group cursor-default">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
                      style={{ backgroundColor: "var(--color-forest-pale)" }}
                    >
                      <Icon size={16} style={{ color: "var(--color-forest)" }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--color-text-mid)" }}>
                      {label}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
