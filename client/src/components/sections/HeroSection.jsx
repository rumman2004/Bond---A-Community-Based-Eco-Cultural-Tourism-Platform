import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { MapPin, Compass, Leaf, Star, ArrowRight, Users } from "lucide-react";
import communityService from "../../services/communityService"; // adjust path as needed

const STATS = [
  { value: "240+", label: "Communities" },
  { value: "18k", label: "Experiences" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "32", label: "States covered" },
];

// Fallback images in case communities have no cover
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=80",
];

export default function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const pillRef = useRef(null);
  const h1Ref = useRef(null);
  const subRef = useRef(null);
  const searchRef = useRef(null);
  const statsRef = useRef(null);
  const heroImgRef = useRef(null);

  const [query, setQuery] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real communities from server
  useEffect(() => {
    communityService
      .list("limit=5&featured=true") // adjust query params to your API
      .then((res) => {
        const data = res.data?.communities || res.data || [];
        if (data.length > 0) setCommunities(data);
      })
      .catch(() => {
        // silently fall back to empty; we handle below
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-cycle hero images
  useEffect(() => {
    if (communities.length === 0) return;
    const interval = setInterval(() => {
      setActiveImg((p) => (p + 1) % communities.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [communities]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(pillRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(h1Ref.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.2")
        .fromTo(subRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.4")
        .fromTo(searchRef.current, { opacity: 0, y: 14, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, "-=0.3")
        .fromTo(
          statsRef.current?.children ? Array.from(statsRef.current.children) : [],
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.09 },
          "-=0.2"
        )
        .fromTo(heroImgRef.current, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }, 0.1);
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  // Resolve image + label for the current slide
  const activeCommunity = communities[activeImg];
  const slideImage =
    activeCommunity?.coverImage ||
    activeCommunity?.cover ||
    FALLBACK_IMAGES[activeImg % FALLBACK_IMAGES.length];
  const slideLabel = activeCommunity?.name || "";
  const slideSub =
    activeCommunity?.location ||
    activeCommunity?.tagline ||
    activeCommunity?.description?.slice(0, 60) ||
    "";

  // Latest reviewer from community, if available
  const latestReview = activeCommunity?.latestReview || activeCommunity?.reviews?.[0] || null;
  const reviewerInitials = latestReview?.author
    ? latestReview.author
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AK";
  const reviewText = latestReview?.text || latestReview?.comment || "Life-changing experience";

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
    >
      {/* Subtle radial tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 60% at 62% 40%, rgba(28,61,46,0.05) 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center py-20">
        {/* ── LEFT ─────────────────────────── */}
        <div className="max-w-xl">
          {/* Pill */}
          <div ref={pillRef} className="inline-flex items-center gap-2 mb-7">
            <span
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "var(--color-forest-pale)",
                color: "var(--color-forest)",
                border: "1px solid var(--color-border-soft)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--color-forest-light)" }}
              />
              Curated by locals, for curious travellers
            </span>
          </div>

          {/* Headline — rewritten to match the community-powered, hidden gems motive */}
          <h1
            ref={h1Ref}
            className="text-5xl sm:text-6xl lg:text-[4rem] leading-[1.08] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
          >
            The Places{" "}
            <span style={{ color: "var(--color-forest)" }}>
              Locals Love
            </span>{" "}
            — That Maps Miss.
          </h1>

          <p
            ref={subRef}
            className="text-lg leading-relaxed mb-9"
            style={{ color: "var(--color-text-mid)" }}
          >
            Every hidden waterfall, ancestral craft village, and century-old
            street food corner has a community behind it. We connect you to
            those insiders — so you experience India beyond the brochure.
          </p>

          {/* Search */}
          <form ref={searchRef} onSubmit={handleSearch}>
            <div
              className="flex items-center gap-2 px-5 py-3.5 rounded-full mb-10 max-w-lg"
              style={{
                backgroundColor: "white",
                boxShadow: "var(--shadow-card)",
                border: "1px solid var(--color-border-soft)",
              }}
            >
              <MapPin size={17} style={{ color: "var(--color-forest-muted)", flexShrink: 0 }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a community, craft or region…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--color-text-dark)" }}
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-md shrink-0"
                style={{
                  backgroundColor: "var(--color-forest-deep)",
                  color: "white",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                <Compass size={14} />
                Explore
              </button>
            </div>
          </form>

          {/* Stats */}
          <div ref={statsRef} className="flex flex-wrap gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p
                  className="text-2xl font-semibold leading-none mb-1"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-forest)" }}
                >
                  {value}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT — hero image ───────────── */}
        <div ref={heroImgRef} className="relative hidden lg:block">
          {/* Main image */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ height: "520px", boxShadow: "var(--shadow-modal)" }}
          >
            {loading ? (
              /* Skeleton while fetching */
              <div
                className="absolute inset-0 animate-pulse"
                style={{ backgroundColor: "var(--color-forest-pale)" }}
              />
            ) : communities.length > 0 ? (
              communities.map((c, i) => (
                <img
                  key={c._id || c.id || i}
                  src={c.coverImage || c.cover || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                  style={{ opacity: i === activeImg ? 1 : 0 }}
                />
              ))
            ) : (
              /* If API returns nothing, show a single fallback */
              <img
                src={FALLBACK_IMAGES[0]}
                alt="Community"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(15,36,25,0.65) 0%, transparent 55%)",
              }}
            />

            {/* Community name & location */}
            {!loading && (slideLabel || slideSub) && (
              <div className="absolute bottom-6 left-6 right-16">
                {slideLabel && (
                  <p
                    className="text-white text-lg font-semibold transition-all duration-500"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {slideLabel}
                  </p>
                )}
                {slideSub && (
                  <p className="text-white/70 text-sm mt-0.5 line-clamp-1">{slideSub}</p>
                )}
                {activeCommunity?.memberCount && (
                  <div className="flex items-center gap-1 mt-1">
                    <Users size={11} className="text-white/50" />
                    <span className="text-white/50 text-xs">
                      {activeCommunity.memberCount} members
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Image nav dots */}
            {communities.length > 1 && (
              <div className="absolute bottom-6 right-6 flex gap-1.5">
                {communities.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === activeImg ? "20px" : "6px",
                      height: "6px",
                      backgroundColor: i === activeImg ? "white" : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Floating review card — uses real review if available */}
          <div
            className="absolute -left-10 top-12 rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{
              backgroundColor: "white",
              boxShadow: "var(--shadow-card-hover)",
              border: "1px solid var(--color-border-soft)",
              minWidth: "210px",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
              style={{ backgroundColor: "var(--color-amber-light)", color: "var(--color-amber)" }}
            >
              {reviewerInitials}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} fill="var(--color-amber)" style={{ color: "var(--color-amber)" }} />
                ))}
              </div>
              <p className="text-xs line-clamp-1" style={{ color: "var(--color-text-mid)", maxWidth: "130px" }}>
                "{reviewText}"
              </p>
            </div>
          </div>

          {/* Eco badge */}
          <div
            className="absolute -right-5 bottom-24 rounded-2xl px-4 py-3 flex items-center gap-2"
            style={{
              backgroundColor: "var(--color-forest-pale)",
              border: "1px solid var(--color-border-mid)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <Leaf size={15} style={{ color: "var(--color-forest)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--color-forest)" }}>
              Community-verified
            </span>
          </div>

          {/* Explore CTA */}
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
              style={{ color: "var(--color-forest)" }}
            >
              Browse all communities <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}