import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  MapPin, Star, Clock, Users, Leaf, Calendar, ChevronLeft,
  ChevronRight, Shield, Heart, Share2, CheckCircle2, AlertCircle,
} from "lucide-react";
import experienceService from "../../services/experienceService";
import reviewService from "../../services/reviewService";
import userService from "../../services/userService";

/* ── Review card ── */
function ReviewCard({ review }) {
  return (
    <div
      className="p-5 rounded-2xl flex flex-col gap-3"
      style={{
        background: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: "var(--color-forest-pale)", color: "var(--color-forest)" }}
        >
          {(review.tourist_name || review.author || "G")[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
            {review.tourist_name || review.author || "Guest"}
          </p>
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: Math.min(5, review.rating || 5) }).map((_, i) => (
              <Star key={i} size={11} fill="var(--color-amber)" color="var(--color-amber)" />
            ))}
          </div>
        </div>
        {review.created_at && (
          <span className="ml-auto text-xs" style={{ color: "var(--color-text-muted)" }}>
            {new Date(review.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {review.body || review.text}
      </p>
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

export default function ExperienceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exp, setExp]           = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [activeImg, setActiveImg] = useState(0);
  const [guests, setGuests]       = useState(2);
  const [date, setDate]           = useState("");
  const [saved, setSaved]         = useState(false);
  const [savingFav, setSavingFav] = useState(false);

  const heroRef    = useRef(null);
  const contentRef = useRef(null);
  const bookingRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(heroRef.current, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.7 })
      .fromTo(contentRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.3")
      .fromTo(bookingRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.55 }, "-=0.4");
    return () => tl.kill();
  }, []);

  useEffect(() => {
    setLoading(true);
    experienceService.getBySlug(id)
      .then(async (res) => {
        const raw = res?.data?.experience;
        if (!raw) throw new Error("Experience not found");

        const images = [
          raw.cover_image_url,
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80",
        ].filter(Boolean);

        setExp({
          id: raw.id,
          name: raw.title,
          community: raw.community_name || "Community",
          communityId: raw.community_id,
          location: [raw.village, raw.state].filter(Boolean).join(", ") || "Northeast India",
          rating: parseFloat(raw.avg_rating) || 4.5,
          reviews: raw.review_count || 0,
          price: parseFloat(raw.price_per_person) || 0,
          duration: raw.duration_days ? `${raw.duration_days} day${raw.duration_days > 1 ? "s" : ""}` : "1 day",
          groupSize: `${raw.min_participants || 1}–${raw.max_participants || 10} people`,
          category: raw.category || "Cultural",
          images,
          about: raw.description || "An immersive cultural experience.",
          highlights: raw.highlights || ["Cultural immersion", "Guided by locals", "Traditional cuisine"],
          includes: raw.included_items || ["Local guide", "Meals", "Accommodation"],
          excludes: raw.excluded_items || ["Transport to site", "Personal expenses"],
        });

        // Fetch reviews
        return reviewService.listForExperience(raw.id);
      })
      .then((res) => {
        setReviews(res?.data?.reviews || []);
      })
      .catch((err) => setError(err.message || "Failed to load experience"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSavingFav(true);
    try {
      if (saved) {
        await userService.removeFavorite("experience", exp.id);
        setSaved(false);
      } else {
        await userService.addFavorite({ targetType: "experience", targetId: exp.id });
        setSaved(true);
      }
    } catch {
      // If unauthenticated, just toggle visually
      setSaved(!saved);
    } finally {
      setSavingFav(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: exp?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
        <div className="pt-24 pb-4 px-5 max-w-6xl mx-auto">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="max-w-6xl mx-auto px-5 mb-10">
          <Skeleton className="w-full h-80 md:h-96 rounded-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !exp) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 min-h-screen"
        style={{ background: "var(--color-cream)" }}
      >
        <AlertCircle size={40} style={{ color: "var(--color-terracotta)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--color-text-dark)" }}>
          {error || "Experience not found"}
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

  const total = exp.price * guests;

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>

      {/* ── BACK NAV ── */}
      <div className="pt-24 pb-4 px-5 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm transition-all duration-200 hover:-translate-x-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ChevronLeft size={16} /> Back to Explore
        </button>
      </div>

      {/* ── IMAGE GALLERY ── */}
      <div className="max-w-6xl mx-auto px-5 mb-10">
        <div ref={heroRef} className="grid grid-cols-3 gap-3 rounded-3xl overflow-hidden h-80 md:h-96">
          {/* Main image */}
          <div className="col-span-2 relative overflow-hidden">
            <img
              src={exp.images[activeImg]}
              alt={exp.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <button
              onClick={() => setActiveImg((p) => (p - 1 + exp.images.length) % exp.images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setActiveImg((p) => (p + 1) % exp.images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {exp.images.slice(1, 3).map((img, i) => (
              <div
                key={i}
                className="flex-1 overflow-hidden cursor-pointer"
                onClick={() => setActiveImg(i + 1)}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-400"
                  style={{ opacity: activeImg === i + 1 ? 1 : 0.75 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-5 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── LEFT ── */}
          <div ref={contentRef} className="lg:col-span-2 flex flex-col gap-8">

            {/* Title block */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "var(--color-amber-light)", color: "var(--color-amber)" }}
                >
                  {exp.category}
                </span>
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "var(--color-forest-pale)", color: "var(--color-forest)" }}
                >
                  <Leaf size={11} /> Eco-certified
                </span>
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "#e8f4fd", color: "#2196f3" }}
                >
                  <Shield size={11} /> Verified
                </span>
              </div>

              <h1
                className="leading-snug"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  color: "var(--color-text-dark)",
                }}
              >
                {exp.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <span className="flex items-center gap-1"><MapPin size={14} />{exp.location}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{exp.duration}</span>
                <span className="flex items-center gap-1"><Users size={14} />{exp.groupSize}</span>
                <span className="flex items-center gap-1">
                  <Star size={13} fill="var(--color-amber)" color="var(--color-amber)" />
                  <strong style={{ color: "var(--color-text-dark)" }}>{exp.rating}</strong>
                  <span>({exp.reviews} reviews)</span>
                </span>
              </div>

              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                By{" "}
                <button
                  onClick={() => navigate(`/community/${exp.communityId}`)}
                  className="font-medium underline-offset-2 hover:underline"
                  style={{ color: "var(--color-forest)" }}
                >
                  {exp.community}
                </button>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={savingFav}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm border transition-all duration-200 hover:scale-[1.02]"
                style={{
                  borderColor: saved ? "var(--color-terracotta)" : "var(--color-border-mid)",
                  color: saved ? "var(--color-terracotta)" : "var(--color-text-muted)",
                  background: saved ? "var(--color-terracotta-light)" : "transparent",
                }}
              >
                <Heart size={15} fill={saved ? "var(--color-terracotta)" : "none"} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm border transition-all duration-200 hover:bg-black/5"
                style={{ borderColor: "var(--color-border-mid)", color: "var(--color-text-muted)" }}
              >
                <Share2 size={15} /> Share
              </button>
            </div>

            {/* About */}
            <div className="flex flex-col gap-3">
              <h2
                className="text-xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                About this experience
              </h2>
              {exp.about.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{para}</p>
              ))}
            </div>

            {/* Highlights */}
            <div className="flex flex-col gap-3">
              <h2
                className="text-xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Highlights
              </h2>
              <ul className="flex flex-col gap-2.5">
                {exp.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm" style={{ color: "var(--color-text-mid)" }}>
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-forest)" }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Includes / Excludes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { title: "What's included", items: exp.includes, positive: true },
                { title: "Not included",    items: exp.excludes, positive: false },
              ].map(({ title, items, positive }) => (
                <div
                  key={title}
                  className="p-5 rounded-2xl flex flex-col gap-3"
                  style={{
                    background: positive ? "var(--color-forest-pale)" : "var(--color-cream-mid)",
                    border: "1px solid var(--color-border-soft)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: positive ? "var(--color-forest)" : "var(--color-text-muted)" }}
                  >
                    {title}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "var(--color-text-mid)" }}
                      >
                        <span style={{ color: positive ? "var(--color-forest)" : "var(--color-text-muted)" }}>
                          {positive ? "✓" : "✗"}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2
                  className="text-xl"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                >
                  Reviews
                </h2>
                <div className="flex items-center gap-1.5">
                  <Star size={16} fill="var(--color-amber)" color="var(--color-amber)" />
                  <span className="font-bold" style={{ color: "var(--color-text-dark)" }}>{exp.rating}</span>
                  <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>({exp.reviews})</span>
                </div>
              </div>
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.slice(0, 6).map((r, i) => <ReviewCard key={r.id || i} review={r} />)}
                </div>
              ) : (
                <div
                  className="py-8 text-center rounded-2xl"
                  style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)" }}
                >
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    No reviews yet. Be the first to experience this!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT — booking panel ── */}
          <div className="lg:col-span-1">
            <div
              ref={bookingRef}
              className="sticky top-24 rounded-3xl p-6 flex flex-col gap-5"
              style={{
                background: "var(--color-cream-light)",
                border: "1px solid var(--color-border-mid)",
                boxShadow: "var(--shadow-modal)",
              }}
            >
              {/* Price */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span
                    className="text-3xl"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-forest-deep)" }}
                  >
                    ₹{exp.price.toLocaleString()}
                  </span>
                  <span className="text-sm ml-1" style={{ color: "var(--color-text-muted)" }}>/ person</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={13} fill="var(--color-amber)" color="var(--color-amber)" />
                  <span className="font-semibold">{exp.rating}</span>
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                  SELECT DATE
                </label>
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border"
                  style={{ borderColor: "var(--color-border-mid)", background: "var(--color-cream)" }}
                >
                  <Calendar size={16} style={{ color: "var(--color-forest-muted)" }} />
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "var(--color-text-dark)" }}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                  GUESTS
                </label>
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl border"
                  style={{ borderColor: "var(--color-border-mid)", background: "var(--color-cream)" }}
                >
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all hover:scale-110"
                    style={{ background: "var(--color-forest-pale)", color: "var(--color-forest)" }}
                  >
                    −
                  </button>
                  <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>
                    {guests} {guests === 1 ? "guest" : "guests"}
                  </span>
                  <button
                    onClick={() => setGuests(Math.min(12, guests + 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all hover:scale-110"
                    style={{ background: "var(--color-forest-pale)", color: "var(--color-forest)" }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div
                className="flex justify-between items-center py-3 px-4 rounded-xl"
                style={{ background: "var(--color-forest-pale)" }}
              >
                <span className="text-sm" style={{ color: "var(--color-text-mid)" }}>Total</span>
                <span
                  className="text-xl"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-forest-deep)" }}
                >
                  ₹{total.toLocaleString()}
                </span>
              </div>

              {/* Book CTA */}
              <button
                onClick={() => navigate(`/booking/${exp.id}`, { state: { date, guests, experienceId: exp.id } })}
                disabled={!date}
                className="w-full py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-forest-deep)", color: "white" }}
              >
                {date ? "Book Now" : "Select a Date to Book"}
              </button>

              <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
                Free cancellation up to 48 hours before the experience.
              </p>

              {/* Trust */}
              <div className="flex items-center justify-center gap-5 pt-1 flex-wrap">
                {[
                  { icon: Shield, text: "Verified community" },
                  { icon: Leaf, text: "Eco-certified" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-forest-muted)" }}>
                    <Icon size={13} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}