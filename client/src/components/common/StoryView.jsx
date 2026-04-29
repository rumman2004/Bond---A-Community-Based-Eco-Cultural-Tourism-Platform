import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import {
  ChevronLeft, Calendar, Eye, Clock, User,
  MapPin, ArrowRight, BookOpen, AlertCircle, Tag, Share2
} from "lucide-react";
import storyService from "../../services/storyService";

/* ── Skeleton ── */
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "var(--color-cream-mid)" }}
    />
  );
}

/* ── Format date ── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/* ── Reading time estimate ── */
function readTime(body) {
  if (!body) return "1 min";
  const words = body.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

/* ── Render body with basic paragraph splitting ── */
function renderBody(body) {
  if (!body) return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No content available.</p>;
  return body.split("\n\n").map((para, i) => {
    const trimmed = para.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) return <h2 key={i} className="text-xl mt-8 mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>{trimmed.slice(3)}</h2>;
    if (trimmed.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--color-text-dark)" }}>{trimmed.slice(4)}</h3>;
    if (trimmed.startsWith("> ")) return (
      <blockquote key={i} className="my-6 p-5 border-l-4 rounded-r-2xl italic" style={{ background: "var(--color-forest-pale)", borderColor: "var(--color-forest)", color: "var(--color-forest)" }}>
        {trimmed.slice(2)}
      </blockquote>
    );
    return <p key={i} className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text-mid)" }}>{trimmed}</p>;
  });
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   Redesigned to resemble ExperienceDetails.jsx
════════════════════════════════════════════════════════ */
export default function StoryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCommunityView = location.pathname.startsWith('/community');

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    if (!loading && story) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(heroRef.current, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.7 })
        .fromTo(contentRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.3")
        .fromTo(sidebarRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.55 }, "-=0.4");
      return () => tl.kill();
    }
  }, [loading, story]);

  /* ── Fetch story ── */
  useEffect(() => {
    if (!id) { setError("Invalid story ID."); setLoading(false); return; }
    setLoading(true);
    storyService.getBySlug(id)
      .then((res) => {
        const raw = res?.data?.story;
        if (!raw) throw new Error("Story not found");
        setStory(raw);
      })
      .catch((err) => setError(err?.response?.data?.message || err.message || "Failed to load story"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: story?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  /* ── Loading ── */
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
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !story) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 min-h-screen px-5 text-center"
        style={{ background: "var(--color-cream)" }}
      >
        <AlertCircle size={40} style={{ color: "var(--color-terracotta)" }} />
        <p className="text-lg font-semibold" style={{ color: "var(--color-text-dark)" }}>
          {error || "Story not found"}
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

  /* ── Derived ── */
  const communityLocation = [story.village, story.state].filter(Boolean).join(", ");
  const inTouristArea = location.pathname.startsWith("/tourist");
  const communityPath = `${inTouristArea ? "/tourist" : ""}/community/${story.community_slug || story.community_id}`;

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      
      {/* ── BACK NAV ── */}
      <div className={`${isCommunityView ? "pt-4" : "pt-24"} pb-4 px-5 max-w-6xl mx-auto`}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm transition-all duration-200 hover:-translate-x-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ChevronLeft size={16} /> {isCommunityView ? "Back to Stories" : "Back"}
        </button>
      </div>

      {/* ── HERO IMAGE ── */}
      <div className="max-w-6xl mx-auto px-5 mb-10">
        <div ref={heroRef} className="rounded-3xl overflow-hidden h-80 md:h-[500px] relative shadow-lg">
          {story.cover_image_url ? (
            <img
              src={story.cover_image_url}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#D4E6DC] text-[#3E7A58]">
              <BookOpen size={64} />
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="max-w-6xl mx-auto px-5 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ── LEFT: Story Content ── */}
          <div ref={contentRef} className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Title block */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "var(--color-forest-pale)", color: "var(--color-forest)" }}
                >
                  Story
                </span>
                {story.tags?.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "var(--color-amber-light)", color: "var(--color-amber)" }}
                  >
                    <Tag size={11} /> {tag}
                  </span>
                ))}
              </div>

              <h1
                className="leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: "var(--color-text-dark)",
                }}
              >
                {story.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <span className="flex items-center gap-1"><User size={14} />{story.author_name || "Community Author"}</span>
                <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(story.published_at)}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{readTime(story.body)}</span>
                <span className="flex items-center gap-1"><Eye size={14} />{story.view_count || 0} views</span>
              </div>
            </div>

            {/* Excerpt */}
            {story.excerpt && (
              <p 
                className="text-lg italic leading-relaxed border-b pb-6" 
                style={{ color: "var(--color-text-mid)", borderColor: "var(--color-border-soft)" }}
              >
                {story.excerpt}
              </p>
            )}

            {/* Body */}
            <div className="story-body-content">
              {renderBody(story.body)}
            </div>

            {/* Bottom Actions */}
            <div className="flex pt-6 border-t" style={{ borderColor: "var(--color-border-soft)" }}>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 hover:bg-black/5"
                style={{ borderColor: "var(--color-border-mid)", color: "var(--color-text-dark)" }}
              >
                <Share2 size={16} /> Share this story
              </button>
            </div>
          </div>

          {/* ── RIGHT: Sidebar (Author/Community Info) ── */}
          <div className="lg:col-span-1">
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
                About the Author
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm" style={{ background: "var(--color-forest-pale)" }}>
                  {story.author_avatar ? (
                    <img src={story.author_avatar} alt={story.author_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} style={{ color: "var(--color-forest)" }} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-base" style={{ color: "var(--color-text-dark)" }}>
                    {story.author_name || "Community Member"}
                  </p>
                  <p className="text-xs uppercase tracking-wider font-semibold mt-0.5" style={{ color: "var(--color-forest-muted)" }}>
                    Contributor
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 py-4 border-y" style={{ borderColor: "var(--color-border-soft)" }}>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-forest)" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--color-text-dark)" }}>Location</p>
                    <p style={{ color: "var(--color-text-muted)" }}>{communityLocation || "Northeast India"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <BookOpen size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-forest)" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--color-text-dark)" }}>Community</p>
                    <p style={{ color: "var(--color-text-muted)" }}>{story.community_name}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(communityPath)}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-105 active:scale-95"
                style={{ background: "var(--color-forest)", color: "white" }}
              >
                Visit Community <ArrowRight size={16} />
              </button>

              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold mb-3 text-center" style={{ color: "var(--color-text-muted)" }}>
                  Story Insights
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl text-center" style={{ background: "var(--color-cream)" }}>
                    <p className="text-[10px] font-bold uppercase" style={{ color: "var(--color-text-muted)" }}>Views</p>
                    <p className="text-lg font-bold" style={{ color: "var(--color-forest-deep)" }}>{story.view_count || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl text-center" style={{ background: "var(--color-cream)" }}>
                    <p className="text-[10px] font-bold uppercase" style={{ color: "var(--color-text-muted)" }}>Read</p>
                    <p className="text-lg font-bold" style={{ color: "var(--color-forest-deep)" }}>{readTime(story.body).split(' ')[0]}m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}