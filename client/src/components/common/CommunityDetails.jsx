import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin, Star, Users, Leaf, Shield, Calendar, ArrowRight,
  Globe, BookOpen, ChevronLeft, AlertCircle, Heart, Clock,
} from "lucide-react";
import communityService from "../../services/communityService";
import experienceService from "../../services/experienceService";
import storyService from "../../services/storyService";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

gsap.registerPlugin(ScrollTrigger);

/* ── Mini experience card ── */
function ExperienceMiniCard({ exp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: 0.5, ease: "power2.out",
      scrollTrigger: { trigger: ref.current, start: "top 92%", once: true },
    });
  }, []);

  const tagColors = {
    Cultural:  { bg: "var(--color-terracotta-light)", color: "var(--color-terracotta)" },
    Eco:       { bg: "var(--color-forest-pale)",      color: "var(--color-forest)" },
    Adventure: { bg: "var(--color-amber-light)",      color: "var(--color-amber)" },
  };
  const tc = tagColors[exp.category] || tagColors.Cultural;
  const inTouristArea = location.pathname.startsWith("/tourist");
  const target = `${inTouristArea ? "/tourist" : ""}/experience/${exp.slug || exp.id}`;

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
      <div className="w-28 flex-shrink-0 overflow-hidden bg-[#D4E6DC]">
        {exp.img ? (
          <img
            src={exp.img}
            alt={exp.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#3E7A58]">
            <BookOpen size={22} />
          </div>
        )}
      </div>
      <div className="py-4 pr-4 flex flex-col justify-between flex-1 gap-2">
        <div className="flex flex-col gap-1.5">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full self-start"
            style={{ background: tc.bg, color: tc.color }}
          >
            {exp.category || "Experience"}
          </span>
          <h4
            className="text-sm font-semibold leading-snug"
            style={{ color: "var(--color-text-dark)" }}
          >
            {exp.name}
          </h4>
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span className="flex items-center gap-1">
            <Star size={11} fill="var(--color-amber)" color="var(--color-amber)" />
            {exp.rating}
          </span>
          <span>{exp.duration}</span>
          <span className="font-semibold" style={{ color: "var(--color-forest-deep)" }}>
            ₹{(exp.price || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "var(--color-cream-mid)" }}
    />
  );
}

export default function CommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [stories, setStories] = useState([]);
  const [verificationData, setVerificationData] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heroRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      .fromTo(contentRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.2");
    return () => tl.kill();
  }, []);

  useEffect(() => {
    setLoading(true);
    communityService.getBySlug(id)
      .then((res) => {
        const raw = res?.data?.community;
        if (!raw) throw new Error("Community not found");
        setCommunity(raw);
        // Offerings and members now come from the public endpoint (raw.offerings, raw.members)
        setVerificationData({ offerings: raw.offerings || [], members: raw.members || [] });
        return Promise.all([
          experienceService.list(`community_id=${raw.id}&limit=4`),
          storyService.list(`community_id=${raw.id}&limit=4`).catch(() => ({ data: { stories: [] } })),
          user ? userService.getFavorites().catch(() => ({ data: { favorites: [] } })) : Promise.resolve(null),
        ]);
      })
      .then(([expRes, storyRes, favRes]) => {
        const list = expRes?.data?.experiences || [];
        setExperiences(list.map((e) => ({
          id: e.id, slug: e.slug, name: e.title,
          price: parseFloat(e.price_per_person) || 0,
          duration: e.duration_days ? `${e.duration_days} day${e.duration_days > 1 ? "s" : ""}` : "1 day",
          rating: parseFloat(e.avg_rating) || 4.5,
          category: e.category || "Cultural",
          img: e.images?.[0]?.image_url || e.cover_image_url || "",
        })));
        setStories(storyRes?.data?.stories || []);
        if (favRes) {
          const favs = favRes?.data?.favorites ?? [];
          const commId = community?.id;
          setIsFavorited(favs.some((f) => f.target_type === "community" && String(f.target_id) === String(commId)));
        }
      })
      .catch((err) => setError(err.message || "Failed to load community"))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) {
    return (
      <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
        <div className="h-72 md:h-96 animate-pulse" style={{ background: "var(--color-cream-mid)" }} />
        <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 min-h-screen"
        style={{ background: "var(--color-cream)" }}
      >
        <AlertCircle size={40} style={{ color: "var(--color-terracotta)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--color-text-dark)" }}>
          {error || "Community not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: "var(--color-forest)", color: "white" }}
        >
          Go back
        </button>
      </div>
    );
  }

  const communityLocation = [community.village, community.state].filter(Boolean).join(", ") || "Northeast India";
  const coverImages = [
    ...(community.images || []).map((image) => image.image_url).filter(Boolean),
    community.cover_image_url,
  ].filter(Boolean);
  const cover = coverImages[0] || "";
  const rating = parseFloat(community.avg_rating) || 0;
  const reviewCount = parseInt(community.review_count) || 0;
  const sustainability = (community.tags || community.sustainability_tags || []).map((t) => typeof t === "string" ? t : t.label).filter(Boolean);
  const offerings = community.offerings || verificationData?.offerings || [];
  const members = community.members || verificationData?.members || [];
  const languages = community.languages || "English, Hindi";
  const createdYear = new Date(community.created_at || Date.now()).getFullYear();
  const inTouristArea = location.pathname.startsWith("/tourist");

  /* Rating breakdown */
  const ratingBreakdown = (() => {
    if (!reviewCount) return null;
    const avg = rating;
    const w = avg >= 4.5 ? [0.60,0.25,0.10,0.03,0.02]
            : avg >= 4.0 ? [0.40,0.35,0.15,0.07,0.03]
            : avg >= 3.5 ? [0.25,0.30,0.25,0.12,0.08]
            : [0.15,0.20,0.30,0.20,0.15];
    const b = {}; let alloc = 0;
    [5,4,3,2].forEach((s, i) => { b[s] = Math.round(w[i] * reviewCount); alloc += b[s]; });
    b[1] = Math.max(0, reviewCount - alloc);
    return b;
  })();

  /* Favorite toggle */
  const toggleFavorite = async () => {
    if (!user) { navigate("/auth/login"); return; }
    try {
      if (isFavorited) {
        await userService.removeFavorite("community", community.id);
        setIsFavorited(false);
      } else {
        await userService.addFavorite({ target_type: "community", target_id: community.id });
        setIsFavorited(true);
      }
    } catch (err) { console.error("Favorite toggle failed:", err); }
  };

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>

      {/* ── COVER ── */}
      <div ref={heroRef} className="relative h-72 md:h-96 overflow-hidden">
        {cover ? (
          <img src={cover} alt={community.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#1C3D2E] text-[#D4E6DC]">
            <Globe size={54} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-28 left-5 flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all duration-200 hover:-translate-x-1"
          style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(8px)" }}
        >
          <ChevronLeft size={15} /> Back
        </button>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
          className="absolute top-28 right-5 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
          style={{ background: isFavorited ? "rgba(220,38,38,0.85)" : "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={17} color="white" fill={isFavorited ? "white" : "none"} />
        </button>

        {/* Info overlay */}
        <div className="absolute bottom-6 left-5 right-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {community.status === "verified" && (
              <span
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(8px)" }}
              >
                <Shield size={11} /> Verified
              </span>
            )}
            <span
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: "rgba(60,122,88,0.45)", color: "white", backdropFilter: "blur(8px)" }}
            >
              <Leaf size={11} /> Eco-certified
            </span>
          </div>
          <h1
            className="text-white"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              textShadow: "0 2px 16px rgba(0,0,0,0.35)",
            }}
          >
            {community.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 mt-2">
            <span className="flex items-center gap-1"><MapPin size={13} />{communityLocation}</span>
            <span className="flex items-center gap-1"><Users size={13} />{community.member_count || 1} members</span>
            <span className="flex items-center gap-1">
              <Star size={13} fill="var(--color-amber)" color="var(--color-amber)" />
              {rating} ({community.review_count || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      {coverImages.length > 1 && (
        <div className="mx-auto mt-4 grid max-w-5xl grid-cols-2 gap-3 px-5 sm:grid-cols-4">
          {coverImages.slice(1, 5).map((image) => (
            <img key={image} src={image} alt={`${community.name} gallery`} className="h-24 w-full rounded-xl object-cover" />
          ))}
        </div>
      )}

      {/* ── CONTENT ── */}
      <div ref={contentRef} className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── LEFT ── */}
        <div className="lg:col-span-2 flex flex-col gap-10">

          {/* About */}
          <section className="flex flex-col gap-3">
            <h2
              className="text-xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              About
            </h2>
            {(community.description || "A verified community welcoming travellers.")
              .split("\n\n")
              .map((p, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {p}
                </p>
              ))}
          </section>

          {/* Experiences */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Experiences
              </h2>
              <button
                onClick={() => navigate(`/explore?community=${community.id}`)}
                className="flex items-center gap-1 text-sm font-medium"
                style={{ color: "var(--color-forest)" }}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            {experiences.length > 0 ? (
              <div className="flex flex-col gap-3">
                {experiences.map((exp) => (
                  <ExperienceMiniCard key={exp.id} exp={exp} />
                ))}
              </div>
            ) : (
              <div
                className="py-8 text-center rounded-2xl"
                style={{
                  background: "var(--color-cream-light)",
                  border: "1px solid var(--color-border-soft)",
                }}
              >
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No experiences listed yet.
                </p>
              </div>
            )}
          </section>

          {/* Stories */}
          {stories.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2
                  className="text-xl"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                >
                  Stories
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {stories.map((s) => {
                  const inTouristArea = location.pathname.startsWith("/tourist");
                  const storyPath = `${inTouristArea ? "/tourist" : ""}/story/${s.slug || s.id}`;
                  return (
                    <div
                      key={s.id}
                      onClick={() => navigate(storyPath)}
                      className="group flex gap-4 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: "var(--color-cream-light)",
                        border: "1px solid var(--color-border-soft)",
                        boxShadow: "var(--shadow-card)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
                    >
                      <div className="w-28 flex-shrink-0 overflow-hidden bg-[#D4E6DC]">
                        {s.cover_image_url ? (
                          <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#3E7A58]">
                            <BookOpen size={22} />
                          </div>
                        )}
                      </div>
                      <div className="py-4 pr-4 flex flex-col justify-between flex-1 gap-2">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-semibold leading-snug" style={{ color: "var(--color-text-dark)" }}>
                            {s.title}
                          </h4>
                          {s.excerpt && (
                            <p className="text-xs line-clamp-2" style={{ color: "var(--color-text-muted)" }}>{s.excerpt}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {s.author_name && <span>{s.author_name}</span>}
                          {s.published_at && <span>{new Date(s.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {offerings.length > 0 && (
  <section className="flex flex-col gap-4">
    <h2 className="text-xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
      Community Offerings{" "}
      <span className="text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>
        ({offerings.length})
      </span>
    </h2>
    <div className="flex flex-col gap-3">
      {offerings.map((off) => {
        const categoryMeta = {
          homestay:   { emoji: "🏠", bg: "#EFF6FF", color: "#1D4ED8", label: "Homestay" },
          food:       { emoji: "🍲", bg: "#FFF7ED", color: "#C2410C", label: "Food" },
          experience: { emoji: "🎭", bg: "#F5F3FF", color: "#6D28D9", label: "Experience" },
          craft:      { emoji: "🪡", bg: "#FDF4FF", color: "#A21CAF", label: "Craft" },
          tour:       { emoji: "🗺️", bg: "#F0FDF4", color: "#15803D", label: "Tour" },
        };
        const meta = categoryMeta[off.category] ?? {
          emoji: "🎁", bg: "var(--color-cream-mid)",
          color: "var(--color-text-mid)", label: off.category ?? "Offering",
        };
        const displayLabel = off.custom_label || meta.label;

        return (
          <div
            key={off.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-cream-light)",
              border: "1px solid var(--color-border-soft)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="p-5">
              {/* Header row */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: meta.bg }}
                >
                  {meta.emoji}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold" style={{ color: "var(--color-text-dark)" }}>
                    {displayLabel}
                  </h4>
                  <span
                    className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>

              {/* Description */}
              {off.description && (
                <p
                  className="text-xs leading-relaxed mb-3 pl-[52px]"
                  style={{ color: "var(--color-text-mid)" }}
                >
                  {off.description}
                </p>
              )}

              {/* Images */}
              {off.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-[52px]">
                  {off.images.map((img) => (
                    <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={img.image_url}
                        alt={img.caption || displayLabel}
                        className="w-16 h-16 object-cover rounded-xl hover:opacity-80 transition-opacity duration-200"
                        style={{ border: "1px solid var(--color-border-soft)" }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </section>
)}

{/* Team Members */}
{members.length > 0 && (
  <section className="flex flex-col gap-4">
    <h2 className="text-xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
      Team Members{" "}
      <span className="text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>
        ({members.length})
      </span>
    </h2>
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {members.map((m, i) => {
        // Initials avatar
        const initials = (m.full_name || "?")
          .split(" ").slice(0, 2)
          .map((w) => w[0]?.toUpperCase()).join("");

        // Deterministic color from first char of name
        const paletteBg   = ["#D1FAE5","#DBEAFE","#FEF3C7","#FCE7F3","#EDE9FE","#FEE2E2"];
        const paletteText = ["#065F46","#1D4ED8","#92400E","#9D174D","#5B21B6","#991B1B"];
        const idx = (m.full_name?.charCodeAt(0) ?? 0) % paletteBg.length;

        return (
          <div
            key={m.id}
            className="flex items-center gap-4 px-5 py-4"
            style={{
              borderBottom: i < members.length - 1
                ? "1px solid var(--color-border-soft)"
                : "none",
            }}
          >
            {/* Initials avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ background: paletteBg[idx], color: paletteText[idx] }}
            >
              {initials}
            </div>

            {/* Name + phone */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--color-text-dark)" }}
                >
                  {m.full_name}
                </span>
                {m.is_owner && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #C8883A, #A06B2D)", color: "white" }}
                  >
                    Owner
                  </span>
                )}
              </div>
              {m.phone && (
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {m.phone}
                </p>
              )}
            </div>

            {/* Role chip */}
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
              style={{
                background: "var(--color-forest-pale)",
                color: "var(--color-forest)",
              }}
            >
              {m.role || "Member"}
            </span>
          </div>
        );
      })}
    </div>
  </section>
)}

          {/* Sustainability */}
          {sustainability.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2
              className="text-xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              Sustainability Commitments
            </h2>
            <div
              className="p-5 rounded-2xl flex flex-col gap-3"
              style={{
                background: "var(--color-forest-pale)",
                border: "1px solid var(--color-border-soft)",
              }}
            >
              {sustainability.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm" style={{ color: "var(--color-text-mid)" }}>
                  <Leaf size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-forest)" }} />
                  {item}
                </div>
              ))}
            </div>
          </section>
          )}
        </div>

        {/* ── RIGHT — sticky info ── */}
        <aside>
          <div
            className="sticky top-24 rounded-3xl p-6 flex flex-col gap-5"
            style={{
              background: "var(--color-cream-light)",
              border: "1px solid var(--color-border-mid)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3
              className="text-lg"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              Community Info
            </h3>

            {[
              { icon: Calendar, label: "Member since", value: createdYear },
              { icon: Users, label: "Team members", value: members.length || community.member_count || 1 },
              { icon: Globe, label: "Languages", value: languages },
              { icon: MapPin, label: "Location", value: communityLocation },
              { icon: Clock, label: "Status", value: community.status === "verified" ? "✓ Verified" : community.status },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-forest-pale)" }}
                >
                  <Icon size={15} style={{ color: "var(--color-forest)" }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "var(--color-text-dark)" }}>{value}</p>
                </div>
              </div>
            ))}

            {/* Rating block */}
            <div className="pt-4" style={{ borderTop: "1px solid var(--color-border-soft)" }}>
              {rating > 0 ? (
                <>
                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-3xl font-bold" style={{ color: "var(--color-text-dark)", letterSpacing: "-0.02em" }}>{rating.toFixed(1)}</span>
                    <div className="pb-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={14} fill={s <= Math.round(rating) ? "var(--color-amber)" : "var(--color-border-mid)"} color={s <= Math.round(rating) ? "var(--color-amber)" : "var(--color-border-mid)"} />
                        ))}
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: "var(--color-text-muted)" }}>{reviewCount} verified review{reviewCount !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  {ratingBreakdown && (
                    <div className="flex flex-col gap-1.5">
                      {[5,4,3,2,1].map((s) => {
                        const cnt = ratingBreakdown[s] || 0;
                        const pct = reviewCount > 0 ? Math.round((cnt / reviewCount) * 100) : 0;
                        return (
                          <div key={s} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-right font-medium" style={{ color: "var(--color-text-muted)" }}>{s}</span>
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border-soft)" }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "var(--color-amber)" }} />
                            </div>
                            <span className="w-5 text-right" style={{ color: "var(--color-text-muted)" }}>{cnt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  <Star size={16} color="var(--color-border-mid)" /> No reviews yet
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-3" style={{ borderTop: "1px solid var(--color-border-soft)" }}>
              <button
                onClick={() => navigate(`/explore?community=${community.id}`)}
                className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110"
                style={{ background: "var(--color-forest-deep)", color: "white" }}
              >
                View All Experiences
              </button>
              <button
                onClick={toggleFavorite}
                className="w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: isFavorited ? "rgba(220,38,38,0.08)" : "var(--color-cream-mid)",
                  color: isFavorited ? "#DC2626" : "var(--color-text-mid)",
                  border: `1px solid ${isFavorited ? "rgba(220,38,38,0.2)" : "var(--color-border-soft)"}`,
                }}
              >
                <Heart size={14} fill={isFavorited ? "currentColor" : "none"} />
                {isFavorited ? "Saved to Favorites" : "Add to Favorites"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
