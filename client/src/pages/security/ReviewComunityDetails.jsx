import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft, MapPin, Mail, Phone, User, Calendar,
  CheckCircle2, XCircle, AlertTriangle, Globe,
  Loader2, Star, Users, Leaf, Shield, ArrowRight,
  BookOpen, ChevronLeft,
} from "lucide-react";
import securityService from "../../services/securityService";
import experienceService from "../../services/experienceService";

gsap.registerPlugin(ScrollTrigger);

/* ── Sustainability tag colours ── */
const SUSTAIN_COLORS = {
  "Community-led tourism":      { bg: "var(--color-forest-pale)",    color: "var(--color-forest)" },
  "Eco-friendly practices":     { bg: "var(--color-forest-pale)",    color: "var(--color-forest)" },
  "Zero single-use plastics":   { bg: "var(--color-amber-light)",    color: "var(--color-amber)" },
  "Local sourcing":             { bg: "var(--color-forest-pale)",    color: "var(--color-forest)" },
  "Carbon neutral":             { bg: "#D1FAE5",                     color: "#065F46" },
  "Renewable energy":           { bg: "#FEF9C3",                     color: "#854D0E" },
  "Wildlife conservation":      { bg: "#DCFCE7",                     color: "#166534" },
  "Water harvesting":           { bg: "#DBEAFE",                     color: "#1D4ED8" },
};
const defaultSustainStyle = { bg: "var(--color-forest-pale)", color: "var(--color-forest)" };

const DEFAULT_SUSTAINABILITY = [
  "Community-led tourism",
  "Eco-friendly practices",
  "Zero single-use plastics",
  "Local sourcing",
];

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

  return (
    <div
      ref={ref}
      onClick={() => navigate(`/experience/${exp.slug || exp.id}`)}
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
          <h4 className="text-sm font-semibold leading-snug" style={{ color: "var(--color-text-dark)" }}>
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

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    pending:  { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
    verified: { bg: "var(--color-forest-pale)", color: "var(--color-forest)", label: "Verified" },
    rejected: { bg: "#FEF2F2", color: "var(--color-terracotta)", label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════ */
export default function ReviewCommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Decision state
  const [action, setAction] = useState(null); // "verify" | "reject"
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const heroRef = useRef(null);
  const contentRef = useRef(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      .fromTo(contentRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.2");
    return () => tl.kill();
  }, []);

  /* ── Data fetch ── */
  useEffect(() => {
    setLoading(true);
    securityService
      .getCommunityById(id)
      .then((res) => {
        const raw = res?.data?.community ?? res?.data;
        if (!raw) throw new Error("Community not found");
        setCommunity(raw);
        return experienceService.list(`community=${raw.id}&limit=4`);
      })
      .then((res) => {
        const list = res?.data?.experiences || [];
        setExperiences(
          list.map((e) => ({
            id: e.id,
            slug: e.slug,
            name: e.title,
            price: parseFloat(e.price_per_person) || 0,
            duration: e.duration_days
              ? `${e.duration_days} day${e.duration_days > 1 ? "s" : ""}`
              : "1 day",
            rating: parseFloat(e.avg_rating) || 4.5,
            category: e.category || "Cultural",
            img:
              e.cover_image_url ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=75",
          }))
        );
      })
      .catch((err) => setError(err.message || "Failed to load community"))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Actions ── */
  const handleVerify = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await securityService.verifyCommunity(id);
      navigate("/security/verify-communities", {
        state: { toast: `"${community.name}" has been verified.` },
      });
    } catch (e) {
      setActionError(e?.response?.data?.message ?? "Verification failed. Please try again.");
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setActionError("Please provide a rejection reason.");
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      await securityService.rejectCommunity(id, rejectionReason.trim());
      navigate("/security/verify-communities", {
        state: { toast: `"${community.name}" has been rejected.` },
      });
    } catch (e) {
      setActionError(e?.response?.data?.message ?? "Rejection failed. Please try again.");
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
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

  /* ── Error ── */
  if (error || !community) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 min-h-screen"
        style={{ background: "var(--color-cream)" }}
      >
        <AlertTriangle size={40} style={{ color: "var(--color-terracotta)" }} />
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

  /* ── Derived values ── */
  const location =
    [community.village || community.city, community.state || community.country]
      .filter(Boolean)
      .join(", ") || "Northeast India";

  const cover =
    community.cover_image_url ||
    "https://res.cloudinary.com/dtbytfxzs/image/upload/v1777285144/What_Is_Community_Health_and_Why_Is_It_Important__me72mu.jpg";

  const rating = parseFloat(community.avg_rating) || 4.5;

  const sustainability =
    community.sustainability_tags?.map((t) => (typeof t === "string" ? t : t.label)) ||
    DEFAULT_SUSTAINABILITY;

  const createdYear = new Date(community.created_at || Date.now()).getFullYear();
  const createdOn = community.created_at
    ? new Date(community.created_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const isPending = community.status === "pending";

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>

      {/* ══ HERO COVER ══ */}
      <div ref={heroRef} className="relative h-72 md:h-96 overflow-hidden">
        <img src={cover} alt={community.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate("/security/verify-communities")}
          className="absolute top-28 left-5 flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-all duration-200 hover:-translate-x-1"
          style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(8px)" }}
        >
          <ChevronLeft size={15} /> Back to queue
        </button>

        {/* Overlay info */}
        <div className="absolute bottom-6 left-5 right-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={community.status} />
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

      {/* ══ CONTENT GRID ══ */}
      <div
        ref={contentRef}
        className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10"
      >

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 flex flex-col gap-10">

          {/* About */}
          <section className="flex flex-col gap-3">
            <h2
              className="text-xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              About
            </h2>
            {(community.description || "A community pending security review.")
              .split("\n\n")
              .map((p, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {p}
                </p>
              ))}
            {/* Community tags */}
            {community.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {community.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Host / Owner */}
          <section className="flex flex-col gap-4">
            <h2
              className="text-xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
            >
              Host Details
            </h2>
            <div
              className="p-5 rounded-2xl grid gap-4 sm:grid-cols-2"
              style={{
                background: "var(--color-cream-light)",
                border: "1px solid var(--color-border-soft)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {[
                { icon: User,    label: "Host Name",  value: community.owner_name },
                { icon: Mail,    label: "Email",      value: community.owner_email },
                { icon: Phone,   label: "Phone",      value: community.owner_phone },
                { icon: Calendar,label: "Applied On", value: createdOn },
              ]
                .filter((f) => f.value)
                .map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--color-forest-pale)" }}
                    >
                      <Icon size={14} style={{ color: "var(--color-forest)" }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
                        {label}
                      </p>
                      <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-dark)" }}>{value}</p>
                    </div>
                  </div>
                ))}
            </div>
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
              {sustainability.map((item) => {
                const style = SUSTAIN_COLORS[item] || defaultSustainStyle;
                return (
                  <div key={item} className="flex items-start gap-3">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: style.bg }}
                    >
                      <Leaf size={12} style={{ color: style.color }} />
                    </span>
                    <span className="text-sm" style={{ color: "var(--color-text-mid)" }}>{item}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── DECISION PANEL (bottom of left col on mobile, full-width) ── */}
          {isPending && (
            <section className="flex flex-col gap-4">
              <h2
                className="text-xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Security Decision
              </h2>
              <div
                className="rounded-2xl p-6 space-y-5"
                style={{
                  backgroundColor: "var(--color-cream-light)",
                  border: "1px solid var(--color-border-soft)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {actionError && (
                  <div
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                    style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
                  >
                    <AlertTriangle size={14} strokeWidth={2} />
                    {actionError}
                  </div>
                )}

                {!action && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setAction("verify"); setActionError(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-95"
                      style={{ backgroundColor: "var(--color-forest)", color: "white" }}
                    >
                      <CheckCircle2 size={16} strokeWidth={2} /> Approve & Verify
                    </button>
                    <button
                      onClick={() => { setAction("reject"); setActionError(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-95"
                      style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
                    >
                      <XCircle size={16} strokeWidth={2} /> Reject
                    </button>
                  </div>
                )}

                {action === "verify" && (
                  <div className="space-y-4">
                    <p className="text-sm" style={{ color: "var(--color-text-mid)" }}>
                      You are about to <strong>verify</strong> <em>{community.name}</em>. The host will be notified and can begin creating experiences.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleVerify}
                        disabled={submitting}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-95 disabled:opacity-60"
                        style={{ backgroundColor: "var(--color-forest)", color: "white" }}
                      >
                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} strokeWidth={2} />}
                        Confirm Verification
                      </button>
                      <button
                        onClick={() => { setAction(null); setActionError(null); }}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-60"
                        style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {action === "reject" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-widest mb-2"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Rejection Reason <span style={{ color: "var(--color-terracotta)" }}>*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this community is being rejected…"
                        className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                        style={{
                          backgroundColor: "var(--color-cream-light)",
                          border: "1.5px solid var(--color-border-soft)",
                          color: "var(--color-text-dark)",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--color-forest)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--color-border-soft)")}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleReject}
                        disabled={submitting || !rejectionReason.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-95 disabled:opacity-60"
                        style={{ backgroundColor: "var(--color-terracotta)", color: "white" }}
                      >
                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} strokeWidth={2} />}
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => { setAction(null); setRejectionReason(""); setActionError(null); }}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-60"
                        style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Already-processed notice */}
          {!isPending && (
            <div
              className="flex items-start gap-3 rounded-xl px-5 py-4 text-sm"
              style={{
                backgroundColor: community.status === "verified" ? "var(--color-forest-pale)" : "#FEF2F2",
                color: community.status === "verified" ? "var(--color-forest)" : "var(--color-terracotta)",
                border: `1px solid ${community.status === "verified" ? "var(--color-forest-light)" : "#FECACA"}`,
              }}
            >
              {community.status === "verified"
                ? <CheckCircle2 size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
                : <XCircle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
              }
              <span>
                This community has already been <strong>{community.status}</strong>.
                {community.rejection_reason && ` Reason: "${community.rejection_reason}"`}
              </span>
            </div>
          )}
        </div>

        {/* ── RIGHT — sticky info card ── */}
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
              { icon: Calendar, label: "Member since",  value: createdYear },
              { icon: Users,    label: "Team members",  value: community.member_count || 1 },
              { icon: Globe,    label: "Languages",     value: community.languages || "English, Hindi" },
              { icon: MapPin,   label: "Location",      value: location },
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

            {/* Rating */}
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

            {/* Quick decision buttons in sidebar for pending */}
            {isPending && !action && (
              <div className="pt-1 flex flex-col gap-2" style={{ borderTop: "1px solid var(--color-border-soft)" }}>
                <button
                  onClick={() => { setAction("verify"); setActionError(null); document.querySelector("#decision-panel")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 flex items-center justify-center gap-2"
                  style={{ background: "var(--color-forest-deep)", color: "white" }}
                >
                  <CheckCircle2 size={14} /> Approve & Verify
                </button>
                <button
                  onClick={() => { setAction("reject"); setActionError(null); }}
                  className="w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ background: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}

            {!isPending && (
              <div className="pt-1" style={{ borderTop: "1px solid var(--color-border-soft)" }}>
                <button
                  onClick={() => navigate(`/explore?community=${community.id}`)}
                  className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110"
                  style={{ background: "var(--color-forest-deep)", color: "white" }}
                >
                  View All Experiences
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}