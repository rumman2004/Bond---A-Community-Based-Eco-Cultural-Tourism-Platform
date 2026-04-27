import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin, Star, Users, Leaf, Shield, Calendar, ArrowRight,
  Globe, BookOpen, ChevronLeft, AlertCircle,
} from "lucide-react";
import communityService from "../../services/communityService";
import experienceService from "../../services/experienceService";

gsap.registerPlugin(ScrollTrigger);

/* ── Mini experience card ── */
function ExperienceMiniCard({ exp }) {
  const navigate = useNavigate();
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
  const target = `/experience/${exp.slug || exp.id}`;

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
      <div className="w-28 flex-shrink-0 overflow-hidden">
        <img
          src={exp.img}
          alt={exp.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
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

  const [community, setCommunity] = useState(null);
  const [experiences, setExperiences] = useState([]);
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
        // Also fetch its experiences
        return experienceService.list(`community=${raw.id}&limit=4`);
      })
      .then((res) => {
        const list = res?.data?.experiences || [];
        setExperiences(list.map((e) => ({
          id: e.id,
          slug: e.slug,
          name: e.title,
          price: parseFloat(e.price_per_person) || 0,
          duration: e.duration_days ? `${e.duration_days} day${e.duration_days > 1 ? "s" : ""}` : "1 day",
          rating: parseFloat(e.avg_rating) || 4.5,
          category: e.category || "Cultural",
          img: e.cover_image_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=75",
        })));
      })
      .catch((err) => setError(err.message || "Failed to load community"))
      .finally(() => setLoading(false));
  }, [id]);

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

  const location = [community.village, community.state].filter(Boolean).join(", ") || "Northeast India";
  const cover = community.cover_image_url || "https://images.unsplash.com/photo-1623091411395-09e79fdbfcf3?w=1200&q=80";
  const rating = parseFloat(community.avg_rating) || 4.5;
  const sustainability = community.sustainability_tags?.map((t) => t.label) || [
    "Community-led tourism",
    "Eco-friendly practices",
    "Zero single-use plastics",
    "Local sourcing",
  ];

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>

      {/* ── COVER ── */}
      <div ref={heroRef} className="relative h-72 md:h-96 overflow-hidden">
        <img src={cover} alt={community.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-28 left-5 flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all duration-200 hover:-translate-x-1"
          style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(8px)" }}
        >
          <ChevronLeft size={15} /> Back
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
            <span className="flex items-center gap-1"><MapPin size={13} />{location}</span>
            <span className="flex items-center gap-1"><Users size={13} />{community.member_count || 1} members</span>
            <span className="flex items-center gap-1">
              <Star size={13} fill="var(--color-amber)" color="var(--color-amber)" />
              {rating} ({community.review_count || 0} reviews)
            </span>
          </div>
        </div>
      </div>

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

          {/* Sustainability */}
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
              { icon: Calendar, label: "Member since", value: new Date(community.created_at || Date.now()).getFullYear() },
              { icon: Users, label: "Team members", value: community.member_count || 1 },
              { icon: Globe, label: "Languages", value: "English, Hindi" },
              { icon: MapPin, label: "Location", value: location },
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

            {/* Rating summary */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "var(--color-amber-light)" }}
            >
              <Star size={18} fill="var(--color-amber)" style={{ color: "var(--color-amber)" }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--color-text-dark)" }}>
                  {rating} overall rating
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {community.review_count || 0} verified reviews
                </p>
              </div>
            </div>

            <div className="pt-1" style={{ borderTop: "1px solid var(--color-border-soft)" }}>
              <button
                onClick={() => navigate(`/explore?community=${community.id}`)}
                className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110"
                style={{ background: "var(--color-forest-deep)", color: "white" }}
              >
                View All Experiences
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}