import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import {
  ChevronLeft, Calendar, Eye, Clock, User,
  MapPin, ArrowRight, BookOpen, AlertCircle, Tag,
} from "lucide-react";
import storyService from "../../services/storyService";

/* ─── Scoped styles ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sv-root {
    font-family: 'DM Sans', sans-serif;
    background: #F5F2EE;
    min-height: 100vh;
    color: #1A1612;
  }

  /* ── hero ── */
  .sv-hero {
    position: relative;
    height: 480px;
    overflow: hidden;
  }
  @media (max-width: 768px) { .sv-hero { height: 340px; } }

  .sv-hero img {
    width: 100%; height: 100%; object-fit: cover;
  }

  .sv-hero-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(
      180deg,
      rgba(10,8,5,0.08) 0%,
      rgba(10,8,5,0.0) 30%,
      rgba(10,8,5,0.55) 70%,
      rgba(10,8,5,0.88) 100%
    );
  }

  .sv-hero-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: #1C3D2E; color: #A8CCBA;
  }

  .sv-back-btn {
    position: absolute; top: 28px; left: 28px;
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 500; letter-spacing: 0.02em;
    color: rgba(255,255,255,0.88);
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.18);
    padding: 8px 16px; border-radius: 100px;
    cursor: pointer; transition: all 0.2s;
  }
  .sv-back-btn:hover { background: rgba(255,255,255,0.22); transform: translateX(-3px); }

  .sv-hero-info {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 36px 40px;
    display: flex; flex-direction: column; gap: 12px;
  }
  @media (max-width: 768px) { .sv-hero-info { padding: 24px 20px; } }

  .sv-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 5vw, 3.2rem);
    font-weight: 700;
    color: white;
    line-height: 1.1;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 24px rgba(0,0,0,0.4);
    margin: 0;
  }

  .sv-hero-meta {
    display: flex; flex-wrap: wrap; gap: 18px;
    color: rgba(255,255,255,0.75); font-size: 13px;
  }
  .sv-hero-meta span { display: flex; align-items: center; gap: 5px; }

  /* ── stat bar ── */
  .sv-stat-bar {
    background: white;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    padding: 0 40px;
    display: flex; align-items: stretch; gap: 0;
    overflow-x: auto;
  }
  @media (max-width: 768px) { .sv-stat-bar { padding: 0 20px; } }

  .sv-stat-item {
    display: flex; flex-direction: column; align-items: flex-start;
    padding: 18px 28px 18px 0;
    border-right: 1px solid rgba(0,0,0,0.07);
    min-width: 110px; flex-shrink: 0;
  }
  .sv-stat-item:first-child { padding-left: 0; }
  .sv-stat-item:last-child { border-right: none; }
  .sv-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #9B8E82; margin-bottom: 4px; }
  .sv-stat-value { font-size: 20px; font-weight: 600; color: #1A1612; letter-spacing: -0.02em; }

  /* ── layout ── */
  .sv-layout {
    max-width: 900px; margin: 0 auto;
    padding: 48px 40px;
  }
  @media (max-width: 768px) { .sv-layout { padding: 32px 20px; } }

  /* ── body ── */
  .sv-body {
    font-size: 16px; line-height: 1.85; color: #3D342B;
    max-width: 720px;
  }
  .sv-body p { margin-bottom: 20px; }
  .sv-body h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #1A1612; margin: 32px 0 12px; }
  .sv-body h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 600; color: #1A1612; margin: 24px 0 10px; }
  .sv-body blockquote {
    margin: 24px 0; padding: 16px 24px;
    border-left: 3px solid #2D6A4F;
    background: #EDFAF2; border-radius: 0 12px 12px 0;
    font-style: italic; color: #1B4332;
  }
  .sv-body ul, .sv-body ol { margin: 12px 0 20px 24px; }
  .sv-body li { margin-bottom: 8px; }

  /* ── tags ── */
  .sv-tags {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-top: 32px; padding-top: 24px;
    border-top: 1px solid rgba(0,0,0,0.08);
  }
  .sv-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 500;
    padding: 5px 14px; border-radius: 100px;
    background: #EDFAF2; color: #166534;
    border: 1px solid rgba(0,0,0,0.06);
  }

  /* ── author card ── */
  .sv-author-card {
    margin-top: 40px; padding: 24px;
    background: white; border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
    display: flex; align-items: center; gap: 16px;
  }
  .sv-author-avatar {
    width: 52px; height: 52px; border-radius: 16px;
    overflow: hidden; flex-shrink: 0;
    background: #D4E6DC;
    display: flex; align-items: center; justify-content: center;
  }
  .sv-author-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .sv-author-name { font-size: 15px; font-weight: 600; color: #1A1612; }
  .sv-author-sub { font-size: 12px; color: #9B8E82; margin-top: 2px; display: flex; align-items: center; gap: 4px; }

  .sv-community-link {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; color: #2D6A4F;
    background: none; border: none; cursor: pointer;
    padding: 0; margin-top: 6px;
    transition: gap 0.2s;
  }
  .sv-community-link:hover { gap: 10px; }

  /* ── skeleton ── */
  .sv-skeleton {
    border-radius: 12px; animation: svpulse 1.4s ease-in-out infinite;
    background: linear-gradient(90deg, #EDE9E3 25%, #E5E0D8 50%, #EDE9E3 75%);
    background-size: 200% 100%;
  }
  @keyframes svpulse { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
`;

/* ── Skeleton ── */
function Sk({ w = "100%", h = 20 }) {
  return <div className="sv-skeleton" style={{ width: w, height: h }} />;
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
  if (!body) return <p>No content available.</p>;
  return body.split("\n\n").map((para, i) => {
    const trimmed = para.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) return <h2 key={i}>{trimmed.slice(3)}</h2>;
    if (trimmed.startsWith("### ")) return <h3 key={i}>{trimmed.slice(4)}</h3>;
    if (trimmed.startsWith("> ")) return <blockquote key={i}>{trimmed.slice(2)}</blockquote>;
    return <p key={i}>{trimmed}</p>;
  });
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function StoryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heroRef = useRef(null);
  const contentRef = useRef(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.55 })
      .fromTo(contentRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    return () => tl.kill();
  }, []);

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

  /* ── Loading ── */
  if (loading) return (
    <div className="sv-root">
      <style>{STYLES}</style>
      <div style={{ background: "#D4CFC8", height: 480 }} className="sv-skeleton" />
      <div className="sv-layout">
        <Sk h={36} w="70%" />
        <div style={{ marginTop: 16 }}><Sk h={16} /></div>
        <div style={{ marginTop: 12 }}><Sk h={16} w="85%" /></div>
        <div style={{ marginTop: 12 }}><Sk h={16} w="60%" /></div>
        <div style={{ marginTop: 24 }}><Sk h={200} /></div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !story) return (
    <div className="sv-root" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <style>{STYLES}</style>
      <AlertCircle size={40} color="#DC2626" />
      <p style={{ fontSize: 16, fontWeight: 600 }}>{error || "Story not found"}</p>
      <button
        onClick={() => navigate(-1)}
        style={{ padding: "12px 24px", borderRadius: 100, background: "#2D6A4F", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
      >
        Go back
      </button>
    </div>
  );

  /* ── Derived ── */
  const communityLocation = [story.village, story.state].filter(Boolean).join(", ");
  const inTouristArea = location.pathname.startsWith("/tourist");
  const communityPath = `${inTouristArea ? "/tourist" : ""}/community/${story.community_slug || story.community_id}`;

  return (
    <div className="sv-root">
      <style>{STYLES}</style>

      {/* ═══ HERO ═══ */}
      <div ref={heroRef} className="sv-hero">
        {story.cover_image_url ? (
          <img src={story.cover_image_url} alt={story.title} />
        ) : (
          <div className="sv-hero-placeholder">
            <BookOpen size={64} />
          </div>
        )}
        <div className="sv-hero-gradient" />

        <button className="sv-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={14} /> Back
        </button>

        <div className="sv-hero-info">
          <h1 className="sv-hero-title">{story.title}</h1>
          <div className="sv-hero-meta">
            {story.author_name && (
              <span><User size={13} />{story.author_name}</span>
            )}
            {story.community_name && (
              <span><MapPin size={13} />{story.community_name}</span>
            )}
            {story.published_at && (
              <span><Calendar size={13} />{formatDate(story.published_at)}</span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ STAT BAR ═══ */}
      <div className="sv-stat-bar">
        <div className="sv-stat-item">
          <span className="sv-stat-label">Views</span>
          <span className="sv-stat-value">{story.view_count || 0}</span>
        </div>
        <div className="sv-stat-item">
          <span className="sv-stat-label">Read Time</span>
          <span className="sv-stat-value">{readTime(story.body)}</span>
        </div>
        {story.published_at && (
          <div className="sv-stat-item">
            <span className="sv-stat-label">Published</span>
            <span className="sv-stat-value">{formatDate(story.published_at)}</span>
          </div>
        )}
        {communityLocation && (
          <div className="sv-stat-item">
            <span className="sv-stat-label">Location</span>
            <span className="sv-stat-value">{communityLocation}</span>
          </div>
        )}
      </div>

      {/* ═══ CONTENT ═══ */}
      <div ref={contentRef} className="sv-layout">
        {/* Excerpt */}
        {story.excerpt && (
          <p style={{
            fontSize: 18, lineHeight: 1.7, color: "#5C4F43",
            fontStyle: "italic", marginBottom: 32,
            paddingBottom: 24,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}>
            {story.excerpt}
          </p>
        )}

        {/* Body */}
        <div className="sv-body">
          {renderBody(story.body)}
        </div>

        {/* Tags */}
        {story.tags?.length > 0 && (
          <div className="sv-tags">
            {story.tags.map((tag) => (
              <span key={tag} className="sv-tag">
                <Tag size={11} />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author card */}
        <div className="sv-author-card">
          <div className="sv-author-avatar">
            {story.author_avatar ? (
              <img src={story.author_avatar} alt={story.author_name} />
            ) : (
              <User size={22} color="#3E7A58" />
            )}
          </div>
          <div>
            <div className="sv-author-name">{story.author_name || "Community Author"}</div>
            <div className="sv-author-sub">
              <MapPin size={11} />
              {story.community_name || "Community"}
              {communityLocation && ` · ${communityLocation}`}
            </div>
            <button
              className="sv-community-link"
              onClick={() => navigate(communityPath)}
            >
              Visit community <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}