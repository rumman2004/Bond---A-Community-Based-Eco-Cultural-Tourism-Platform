import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  MapPin, Star, Users, Leaf, Shield, Calendar, ArrowRight,
  Globe, BookOpen, ChevronLeft, AlertCircle, Heart, Clock,
  Share2, CheckCircle2, ChevronRight, User, Loader2
} from "lucide-react";
import communityService from "../../services/communityService";
import experienceService from "../../services/experienceService";
import storyService from "../../services/storyService";
import userService from "../../services/userService";
import securityService from "../../services/securityService";
import { useAuth } from "../../context/AuthContext";

/* ── Mini experience card ── */
function ExperienceMiniCard({ exp }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const inTouristArea = location.pathname.startsWith("/tourist");
  const target = `${inTouristArea ? "/tourist" : ""}/experience/${exp.slug || exp.id}`;

  return (
    <div
      onClick={() => navigate(target)}
      className="group flex gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-black/5"
      style={{
        background: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
      }}
    >
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#D4E6DC]">
        {exp.img ? (
          <img
            src={exp.img}
            alt={exp.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#3E7A58]">
            <BookOpen size={20} />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between flex-1 py-1">
        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-amber-light)", color: "var(--color-amber)" }}
          >
            {exp.category}
          </span>
          <h4 className="text-sm font-semibold mt-1.5 leading-snug" style={{ color: "var(--color-text-dark)" }}>
            {exp.name}
          </h4>
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5"><Star size={11} fill="var(--color-amber)" color="var(--color-amber)" />{exp.rating}</span>
            <span>·</span>
            <span>{exp.duration}</span>
          </div>
          <span className="font-bold" style={{ color: "var(--color-forest)" }}>₹{exp.price.toLocaleString()}</span>
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
  const { user, isAuthenticated } = useAuth();

  const [community, setCommunity] = useState(null);
  useEffect(() => {
    if (community) console.log("Community Data Loaded:", community);
  }, [community]);
  const [experiences, setExperiences] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Report States ── */
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportText, setReportText] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!loading && community) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(heroRef.current, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.7 })
        .fromTo(contentRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.3")
        .fromTo(sidebarRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.55 }, "-=0.4");
      return () => tl.kill();
    }
  }, [loading, community]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch everything in parallel using the slug
    Promise.all([
      communityService.getBySlug(id),
      experienceService.list(`community_slug=${id}&limit=4`),
      storyService.list(`community_slug=${id}&limit=4`).catch(() => ({ data: { stories: [] } })),
      isAuthenticated ? userService.getFavorites().catch(() => ({ data: { favorites: [] } })) : Promise.resolve(null),
    ])
    .then(([commRes, expRes, storyRes, favRes]) => {
      const raw = commRes?.data?.community;
      if (!raw) throw new Error("Community not found");
      setCommunity(raw);

      const list = expRes?.data?.experiences || [];
      setExperiences(list.map((e) => ({
        id: e.id, slug: e.slug, name: e.title,
        price: parseFloat(e.price_per_person) || 0,
        duration: e.duration_days ? `${e.duration_days} day${e.duration_days > 1 ? "s" : ""}` : (e.duration_hours ? `${e.duration_hours} hr` : "N/A"),
        rating: e.avg_rating ? parseFloat(e.avg_rating).toFixed(1) : "0.0",
        category: e.category || "Cultural",
        img: e.images?.[0]?.image_url || e.cover_image_url || "",
      })));

      setStories(storyRes?.data?.stories || []);

      if (favRes) {
        const favs = favRes?.data?.favorites ?? [];
        setIsFavorited(favs.some((f) => f.target_type === "community" && String(f.target_id) === String(raw.id)));
      }
    })
    .catch((err) => {
      console.error("Failed to load community data:", err);
      setError(err.message || "Failed to load community");
    })
    .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) { navigate("/auth/login", { state: { from: location.pathname } }); return; }
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: community?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReportSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated) { navigate("/auth/login", { state: { from: location.pathname } }); return; }
    if (!reportReason) return;

    setSubmittingReport(true);
    try {
      console.log("Submitting report...", {
        report_type: "community",
        target_id: community.id,
        target_user_id: community.owner_id,
        reason: reportReason,
        description: reportText
      });
      
      const response = await securityService.submitReport({
        report_type: "community",
        target_id: community.id,
        target_user_id: community.user_id,
        reason: reportReason,
        description: reportText
      });
      
      console.log("Report response:", response);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportReason("");
        setReportText("");
      }, 2000);
    } catch (err) {
      console.error("Report submission failed:", err);
      alert("Failed to submit report. Please try again later.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
        <div className="pt-24 pb-4 px-5 max-w-7xl mx-auto">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="max-w-7xl mx-auto px-5 mb-10">
          <Skeleton className="w-full h-80 md:h-96 rounded-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 min-h-screen px-5 text-center"
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

  const images = Array.from(new Set([
    community.cover_image_url,
    ...(community.images || []).map((img) => img.image_url),
  ].filter(Boolean)));

  const rating = parseFloat(community.avg_rating) || 0;
  const reviewCount = parseInt(community.review_count) || 0;
  const locationStr = [community.village, community.state].filter(Boolean).join(", ") || "Northeast India";
  
  const sustainability = (community.tags || community.sustainability_tags || [])
    .map((t) => typeof t === "string" ? t : t.label)
    .filter(Boolean);
  
  const members = community.members || [];
  const offerings = community.offerings || [];

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      <style>{`
        .rcd-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px); z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .rcd-modal {
          background: white; width: 100%; max-width: 480px;
          border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          position: relative;
        }
        .rcd-report-btn {
          width: 100%; padding: 12px; border-radius: 12px;
          font-size: 12px; font-weight: 700; color: #8C8479;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; cursor: pointer; border: 1.5px solid #F1F1EB;
          background: transparent; margin-top: 16px;
        }
        .rcd-report-btn:hover { background: #FEF2F2; color: #DC2626; border-color: #FEE2E2; }
        
        .rcd-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid #F1F1EB; font-size: 14px; margin-bottom: 16px;
          outline: none; transition: border-color 0.2s;
        }
        .rcd-input:focus { border-color: var(--color-forest); }
      `}</style>
      
      {/* ── BACK NAV ── */}
      <div className="pt-24 pb-4 px-5 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm transition-all duration-200 hover:-translate-x-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ChevronLeft size={16} /> Back to Communities
        </button>
      </div>

      {/* ── HERO IMAGE ── */}
      <div className="max-w-7xl mx-auto px-5 mb-10">
        <div ref={heroRef} className="rounded-3xl overflow-hidden h-80 md:h-[500px] relative shadow-lg bg-[#D4E6DC]">
          {images.length ? (
            <img
              src={images[0]}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#3E7A58]">
              <Globe size={64} />
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="max-w-7xl mx-auto px-5 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ── LEFT: Community Details ── */}
          <div ref={contentRef} className="lg:col-span-2 flex flex-col gap-10">
            
            {/* Title block */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {community.status === "verified" && (
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "var(--color-forest-pale)", color: "var(--color-forest)" }}
                  >
                    <Shield size={11} /> Verified Community
                  </span>
                )}
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "var(--color-amber-light)", color: "var(--color-amber)" }}
                >
                  <Leaf size={11} /> Eco-tourism
                </span>
              </div>

              <h1
                className="leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: "var(--color-text-dark)",
                }}
              >
                {community.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <span className="flex items-center gap-1"><MapPin size={14} />{locationStr}</span>
                <span className="flex items-center gap-1"><Users size={14} />{members.length || community.member_count || 1} members</span>
                <span className="flex items-center gap-1">
                  <Star size={14} fill="var(--color-amber)" color="var(--color-amber)" />
                  <strong style={{ color: "var(--color-text-dark)" }}>{rating.toFixed(1)}</strong>
                  <span>({reviewCount} reviews)</span>
                </span>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200"
                  style={{
                    borderColor: isFavorited ? "var(--color-terracotta)" : "var(--color-border-mid)",
                    background: isFavorited ? "var(--color-terracotta-light)" : "transparent",
                    color: isFavorited ? "var(--color-terracotta)" : "var(--color-text-muted)",
                  }}
                >
                  <Heart size={16} fill={isFavorited ? "var(--color-terracotta)" : "none"} />
                  {isFavorited ? "Saved" : "Save Community"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 hover:bg-black/5"
                  style={{ borderColor: "var(--color-border-mid)", color: "var(--color-text-dark)" }}
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            {/* About */}
            <section className="flex flex-col gap-4 pt-4">
              <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                About the Community
              </h2>
              <div className="text-base leading-relaxed space-y-4" style={{ color: "var(--color-text-mid)" }}>
                {community.description?.split("\n\n").map((p, i) => <p key={i}>{p}</p>) || "Welcome to our community."}
              </div>
            </section>

            {/* Experiences */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  Experiences
                </h2>
                <button
                  onClick={() => navigate(`/explore?community=${community.id}`)}
                  className="text-sm font-semibold flex items-center gap-1 group"
                  style={{ color: "var(--color-forest)" }}
                >
                  View all <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              {experiences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {experiences.map((exp) => (
                    <ExperienceMiniCard key={exp.id} exp={exp} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-3xl border border-dashed border-border-mid" style={{ background: "var(--color-cream-light)" }}>
                  <p style={{ color: "var(--color-text-muted)" }}>No experiences listed yet.</p>
                </div>
              )}
            </section>

            {/* Stories */}
            {stories.length > 0 && (
              <section className="flex flex-col gap-6">
                <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  Latest Stories
                </h2>
                <div className="flex flex-col gap-4">
                  {stories.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/story/${s.slug || s.id}`)}
                      className="group flex gap-5 p-4 rounded-3xl cursor-pointer transition-all duration-200 border border-transparent hover:border-border-soft hover:bg-white/50 hover:shadow-sm"
                      style={{ background: "var(--color-cream-light)" }}
                    >
                      <div className="w-20 h-20 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-forest-pale" style={{ background: "var(--color-forest-pale)" }}>
                        {s.cover_image_url ? (
                          <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-forest">
                            <BookOpen size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h4 className="text-lg font-bold leading-tight mb-2 group-hover:text-forest transition-colors" style={{ color: "var(--color-text-dark)" }}>
                          {s.title}
                        </h4>
                        <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--color-text-muted)" }}>{s.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                          <span className="flex items-center gap-1"><User size={12} />{s.author_name}</span>
                          <span>·</span>
                          <span>{new Date(s.published_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Offerings & Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {offerings.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h2 className="text-xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                    Community Offerings
                  </h2>
                  <div className="flex flex-col gap-3">
                    {offerings.slice(0, 3).map((off) => (
                      <div key={off.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-border-soft">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-forest-pale text-forest text-lg" style={{ background: "var(--color-forest-pale)" }}>
                          {off.category === 'homestay' ? '🏠' : (off.category === 'food' ? '🍲' : '🎁')}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>{off.custom_label || off.category}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {members.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h2 className="text-xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                    Meet the Team
                  </h2>
                  <div className="flex flex-col gap-3">
                    {members.slice(0, 3).map((m) => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-border-soft">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-amber-light text-amber" style={{ background: "var(--color-amber-light)", color: "var(--color-amber)" }}>
                          {m.full_name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>{m.full_name}</span>
                          <span className="text-[10px] uppercase font-bold" style={{ color: "var(--color-text-muted)" }}>{m.role || 'Member'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="lg:col-span-1">
            <div
              ref={sidebarRef}
              className="sticky top-24 rounded-3xl p-6 flex flex-col gap-6"
              style={{
                background: "var(--color-cream-light)",
                border: "1px solid var(--color-border-mid)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Community Snapshot
              </h3>

              <div className="flex flex-col gap-4">
                {[
                  { icon: Shield, label: "Status", value: community.status === "verified" ? "Verified Partner" : "Community Member" },
                  { icon: Globe, label: "Languages", value: community.languages || "English, Local Dialects" },
                  { icon: Calendar, label: "Established", value: new Date(community.created_at).getFullYear() },
                  { icon: Clock, label: "Response Time", value: "Within 24 hours" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-forest-pale" style={{ background: "var(--color-forest-pale)" }}>
                      <Icon size={16} style={{ color: "var(--color-forest)" }} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--color-text-muted)" }}>{label}</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-text-dark)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sustainability Section */}
              {sustainability.length > 0 && (
                <div className="pt-6 border-t" style={{ borderColor: "var(--color-border-soft)" }}>
                  <p className="text-[10px] uppercase font-bold tracking-wider mb-3 text-center" style={{ color: "var(--color-text-muted)" }}>
                    Sustainability
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sustainability.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-forest-pale text-forest" style={{ background: "var(--color-forest-pale)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating block */}
              <div className="pt-6 border-t" style={{ borderColor: "var(--color-border-soft)" }}>
                {rating > 0 ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-3xl font-bold" style={{ color: "var(--color-text-dark)" }}>{rating.toFixed(1)}</span>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={12} fill={s <= Math.round(rating) ? "var(--color-amber)" : "var(--color-border-soft)"} color={s <= Math.round(rating) ? "var(--color-amber)" : "var(--color-border-soft)"} />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold" style={{ color: "var(--color-text-dark)" }}>{reviewCount} reviews</p>
                        <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Verified travellers</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/explore?community=${community.id}`)}
                      className="w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-95"
                      style={{ background: "var(--color-forest-deep)", color: "white" }}
                    >
                      Book an Experience
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-center">
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>No reviews yet.</p>
                    <button
                      onClick={() => navigate(`/explore?community=${community.id}`)}
                      className="w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200"
                      style={{ background: "var(--color-forest)", color: "white" }}
                    >
                      Explore Community
                    </button>
                  </div>
                )}
              </div>

              {/* ── SIDEBAR POPOVER REPORT WINDOW ── */}
              <div className="pt-4 border-t relative" style={{ borderColor: "var(--color-border-soft)" }}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/auth/login", { state: { from: location.pathname } });
                    } else {
                      setShowReportModal(true);
                    }
                  }}
                  className="rcd-report-btn"
                  style={{ margin: 0 }}
                >
                  <AlertCircle size={14} /> Report this Community
                </button>

                {showReportModal && (
                  <div 
                    className="absolute bottom-0 right-full mr-4 p-6 bg-white rounded-2xl shadow-2xl border border-border-soft z-[100] animate-in slide-in-from-right-4 duration-300 w-[320px]"
                    style={{ filter: "drop-shadow(-10px 10px 30px rgba(0,0,0,0.1))" }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-text-dark flex items-center gap-2">
                        <Shield size={16} className="text-terracotta" /> Report Community
                      </h4>
                      <button 
                        onClick={() => setShowReportModal(false)}
                        className="p-1 hover:bg-black/5 rounded-full transition-colors"
                      >
                        <AlertCircle size={18} className="rotate-45 text-text-muted" />
                      </button>
                    </div>

                    {reportSuccess ? (
                      <div className="py-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-forest-pale text-forest flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 size={24} />
                        </div>
                        <p className="text-sm font-bold text-text-dark">Report Submitted</p>
                        <p className="text-xs text-text-muted mt-1">Thank you for your feedback.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                            Reason
                          </label>
                          <select 
                            className="w-full p-3 bg-cream-light border border-border-soft rounded-12 text-sm outline-none focus:border-forest transition-colors"
                            required 
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                          >
                            <option value="" disabled>Choose a reason...</option>
                            <option value="misleading">Misleading Information</option>
                            <option value="safety">Safety Concerns</option>
                            <option value="scam">Potential Scam</option>
                            <option value="other">Other Issue</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">
                            Details
                          </label>
                          <textarea
                            className="w-full p-3 bg-cream-light border border-border-soft rounded-12 text-sm outline-none focus:border-forest transition-colors resize-none"
                            rows={3}
                            required
                            placeholder="Tell us more..."
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingReport || !reportReason}
                          className="w-full py-3.5 font-bold text-sm bg-forest text-white rounded-16 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          {submittingReport ? <Loader2 className="animate-spin" size={16} /> : "Submit Report"}
                        </button>
                      </form>
                    )}
                    
                    {/* Popover Arrow */}
                    <div 
                      className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-t border-r border-border-soft rotate-45"
                      style={{ boxShadow: "5px -5px 10px rgba(0,0,0,0.02)" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
