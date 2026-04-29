import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin, Mail, Phone, User, Calendar,
  CheckCircle2, XCircle, AlertTriangle, Globe,
  Loader2, Star, Users, Leaf, Shield, ArrowRight,
  BookOpen, ChevronLeft, TrendingUp, Award, Clock,
} from "lucide-react";
import securityService from "../../services/securityService";
import experienceService from "../../services/experienceService";
import communityService from "../../services/communityService";

gsap.registerPlugin(ScrollTrigger);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap');

  .rcd-root {
    font-family: 'DM Sans', sans-serif;
    background: #FAFAF9;
    min-height: 100vh;
    color: #1A1612;
    padding-bottom: 80px;
  }

  /* ── premium hero ── */
  .rcd-hero {
    position: relative;
    height: 520px;
    background: #0A0A0A;
    overflow: hidden;
  }

  .rcd-hero-img { 
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover; 
    opacity: 0.65;
    filter: brightness(0.8) contrast(1.1);
    transform: scale(1.02);
  }

  .rcd-hero-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(10,10,10,0.1) 0%,
      rgba(10,10,10,0.3) 40%,
      rgba(10,10,10,0.9) 100%
    );
  }

  .rcd-top-nav {
    position: absolute; top: 0; left: 0; right: 0;
    padding: 32px 60px;
    z-index: 10;
  }

  .rcd-back-btn {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
    color: white;
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.15);
    padding: 12px 24px; border-radius: 100px;
    cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    text-decoration: none;
  }
  .rcd-back-btn:hover { background: rgba(255,255,255,0.2); transform: translateX(-6px); border-color: rgba(255,255,255,0.3); }

  .rcd-hero-content {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 0 60px 80px;
    max-width: 1320px; margin: 0 auto;
    display: flex; flex-direction: column; gap: 20px;
  }

  .rcd-badge-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }

  .rcd-badge {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 8px 16px; border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .rcd-badge-status-pending   { background: #FBBF24; color: #1A1612; }
  .rcd-badge-status-verified  { background: #10B981; color: white; }
  .rcd-badge-status-rejected  { background: #EF4444; color: white; }
  .rcd-badge-outline           { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); }

  .rcd-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.8rem, 7vw, 4.8rem);
    font-weight: 700;
    color: white;
    line-height: 1;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .rcd-hero-meta {
    display: flex; flex-wrap: wrap; gap: 32px;
    color: rgba(255,255,255,0.6); font-size: 15px; font-weight: 500;
  }
  .rcd-hero-meta span { display: flex; align-items: center; gap: 10px; }

  /* ── container layout ── */
  .rcd-container {
    max-width: 1320px; margin: -60px auto 0;
    padding: 0 60px;
    display: grid; grid-template-columns: 1fr 400px; gap: 48px;
    position: relative; z-index: 5;
  }
  @media (max-width: 1200px) { .rcd-container { grid-template-columns: 1fr; padding: 0 32px; gap: 40px; } }

  /* ── content main ── */
  .rcd-main { display: flex; flex-direction: column; gap: 40px; }

  /* ── premium cards ── */
  .rcd-card {
    background: white;
    border-radius: 32px;
    border: 1px solid #EAEAE2;
    box-shadow: 0 10px 40px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.01);
    overflow: hidden;
  }

  .rcd-card-header {
    padding: 32px 40px;
    border-bottom: 1px solid #F5F5F0;
    display: flex; align-items: center; justify-content: space-between;
  }

  .rcd-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: #9B9B8E;
    margin: 0;
  }

  .rcd-card-body { padding: 40px; }

  /* ── registration checklist ── */
  .rcd-checklist {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;
    margin-top: 32px;
  }
  .rcd-check-item {
    padding: 24px; border-radius: 20px;
    border: 1.5px solid #F1F1EB;
    background: #FAF9F6;
    display: flex; flex-direction: column; gap: 16px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .rcd-check-item.done { background: white; border-color: #D1FAE5; box-shadow: 0 4px 15px rgba(16,185,129,0.04); }
  .rcd-check-icon {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: #E5E7EB; color: #9CA3AF;
  }
  .rcd-check-item.done .rcd-check-icon { background: #10B981; color: white; }
  .rcd-check-label { font-size: 15px; font-weight: 700; color: #1A1612; letter-spacing: -0.01em; }
  .rcd-check-sub   { font-size: 12px; color: #8C8479; line-height: 1.4; }

  /* ── table refinements ── */
  .rcd-table-container { overflow-x: auto; }
  .rcd-table { width: 100%; border-collapse: collapse; }
  .rcd-table th {
    padding: 20px 40px; text-align: left; background: #FAF9F6;
    font-size: 11px; font-weight: 700; color: #9B9B8E; text-transform: uppercase; letter-spacing: 0.1em;
  }
  .rcd-table td { padding: 24px 40px; border-bottom: 1px solid #F5F5F0; font-size: 15px; }

  /* ── documents ── */
  .rcd-doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 768px) { .rcd-doc-grid { grid-template-columns: 1fr; } }
  .rcd-doc-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-radius: 20px; border: 1.5px solid #F1F1EB;
    background: #FAFAF9; transition: all 0.3s;
  }
  .rcd-doc-item:hover { border-color: #1A1612; background: white; }
  .rcd-doc-link {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 100px;
    background: #1A1612; color: white; font-size: 12px; font-weight: 700;
    text-decoration: none; transition: transform 0.2s;
  }
  .rcd-doc-link:hover { transform: translateY(-2px); }

  /* ── sidebar ── */
  .rcd-sidebar { display: flex; flex-direction: column; gap: 32px; }
  .rcd-sidebar-sticky { position: sticky; top: 120px; display: flex; flex-direction: column; gap: 32px; }

  /* ── progress score ── */
  .rcd-progress-card {
    background: white; border-radius: 32px; padding: 40px;
    border: 1px solid #EAEAE2;
    text-align: center;
  }
  .rcd-prog-val { font-family: 'Space Grotesk', sans-serif; font-size: 64px; font-weight: 700; color: #1A1612; line-height: 1; margin-bottom: 8px; }
  .rcd-prog-label { font-size: 11px; font-weight: 700; color: #9B9B8E; text-transform: uppercase; letter-spacing: 0.15em; }
  .rcd-prog-bar-container { margin: 32px 0 24px; }
  .rcd-prog-bar { height: 10px; background: #F1F1EB; border-radius: 100px; overflow: hidden; }
  .rcd-prog-fill { height: 100%; background: #1A1612; border-radius: 100px; transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1); }

  /* ── decision center ── */
  .rcd-decision-card {
    background: #1A1612; border-radius: 32px; color: white; padding: 40px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.15);
  }
  .rcd-decision-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; margin-bottom: 12px; }
  .rcd-decision-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 32px; line-height: 1.6; }

  .rcd-action-btn {
    width: 100%; padding: 18px; border-radius: 14px; border: none;
    font-size: 15px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 12px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .rcd-btn-approve { background: #10B981; color: white; margin-bottom: 16px; }
  .rcd-btn-approve:hover { background: #059669; transform: scale(1.02); }
  .rcd-btn-reject { background: rgba(255,255,255,0.06); color: #FCA5A5; border: 1px solid rgba(255,255,255,0.15); }
  .rcd-btn-reject:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: white; }

  .rcd-textarea {
    width: 100%; padding: 20px; border-radius: 16px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.15);
    color: white; font-family: inherit; font-size: 14px; margin-bottom: 20px;
    outline: none; transition: all 0.3s;
  }
  .rcd-textarea:focus { border-color: #10B981; background: rgba(255,255,255,0.08); }

  /* ── quick stats ── */
  .rcd-stat-row { display: flex; align-items: center; gap: 20px; padding: 20px 0; border-bottom: 1px solid #F5F5F0; }
  .rcd-stat-row:last-child { border-bottom: none; }
  .rcd-stat-icon {
    width: 48px; height: 48px; border-radius: 16px;
    background: #FAF9F6; border: 1.5px solid #F1F1EB;
    display: flex; align-items: center; justify-content: center;
    color: #1A1612;
  }
  .rcd-stat-lbl { font-size: 11px; font-weight: 700; color: #9B9B8E; text-transform: uppercase; letter-spacing: 0.1em; }
  .rcd-stat-val { font-size: 16px; font-weight: 700; color: #1A1612; margin-top: 4px; }

  /* ── skeleton ── */
  .rcd-skeleton {
    border-radius: 20px; animation: skpulse 1.8s ease-in-out infinite;
    background: linear-gradient(90deg, #F5F5F0 25%, #EAEAE2 50%, #F5F5F0 75%);
    background-size: 200% 100%;
  }
  @keyframes skpulse { 0%{background-position:200% 0%} 100%{background-position:-200% 0%} }
`;

function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "rcd-badge-status-pending",  label: "● Under Review" },
    verified: { cls: "rcd-badge-status-verified",  label: "✓ Verified Partner" },
    rejected: { cls: "rcd-badge-status-rejected",  label: "✕ Denied" },
  };
  const s = map[status] || map.pending;
  return <span className={`rcd-badge ${s.cls}`}>{s.label}</span>;
}

function Sk({ w = "100%", h = 20 }) {
  return <div className="rcd-skeleton" style={{ width: w, height: h }} />;
}

export default function ReviewCommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const heroRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (heroRef.current) tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2 });
    if (contentRef.current) tl.fromTo(contentRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, "-=0.8");
    return () => tl.kill();
  }, [loading]);

  useEffect(() => {
    if (!id || id === "undefined") { setError("Invalid community ID."); setLoading(false); return; }
    setLoading(true);
    securityService.getCommunityById(id)
      .then((res) => {
        const raw = res?.data?.community ?? res?.data;
        if (!raw) throw new Error("Community not found");
        setCommunity(raw);
        communityService.getVerificationData(raw.id)
          .then((vRes) => setVerificationData(vRes?.data || null))
          .catch(() => {});
        return experienceService.list(`community_id=${raw.id}&limit=4`);
      })
      .then((res) => {
        const list = res?.data?.experiences || [];
        setExperiences(list.map((e) => ({
          id: e.id, name: e.title,
          price: parseFloat(e.price_per_person) || 0,
          rating: parseFloat(e.avg_rating) || 4.5,
        })));
      })
      .catch((err) => setError(err.message || "Failed to load community"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async () => {
    setSubmitting(true); setActionError(null);
    try {
      await securityService.verifyCommunity(id);
      navigate("/security/verify-communities", { state: { toast: `"${community.name}" verified successfully.` } });
    } catch (e) {
      setActionError(e?.response?.data?.message ?? "Verification failed.");
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { setActionError("A rejection reason is required."); return; }
    setSubmitting(true); setActionError(null);
    try {
      await securityService.rejectCommunity(id, { rejection_reason: rejectionReason.trim() });
      navigate("/security/verify-communities", { state: { toast: `"${community.name}" application rejected.` } });
    } catch (e) {
      setActionError(e?.response?.data?.message ?? "Rejection failed.");
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="rcd-root">
      <style>{STYLES}</style>
      <div style={{ background: "#0A0A0A", height: 520 }} className="rcd-skeleton" />
      <div className="rcd-container">
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <Sk h={400} /><Sk h={300} /><Sk h={300} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <Sk h={300} /><Sk h={400} />
        </div>
      </div>
    </div>
  );

  if (error || !community) return (
    <div className="rcd-root" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 24 }}>
      <style>{STYLES}</style>
      <AlertTriangle size={64} color="#EF4444" strokeWidth={1.5} />
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Unable to load Community</h2>
        <p style={{ color: "#8C8479", fontSize: 16 }}>{error || "The requested community could not be found."}</p>
      </div>
      <button className="rcd-back-btn" style={{ color: "#1A1612", background: "#EAEAE2", border: "none" }} onClick={() => navigate(-1)}>Return to Queue</button>
    </div>
  );

  const location = [community.village || community.city, community.state || community.country].filter(Boolean).join(", ") || "Northeast India";
  const cover = community.images?.[0]?.image_url || community.cover_image_url || "";
  const createdOn = community.created_at ? new Date(community.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A";
  const rating = parseFloat(community.avg_rating) || 0;
  const sustainability = community.sustainability_tags?.map(t => typeof t === "string" ? t : t.label) || ["Community Led", "Eco Friendly"];

  const checklist = [
    { label: "Profile Foundation", done: true, desc: "Basic identity and branding setup." },
    { label: "Team Structure",     done: verificationData?.members?.length > 0, desc: "Leadership and contact network established." },
    { label: "ID Verification",    done: verificationData?.documents?.length > 0, desc: "Government IDs and legal documents uploaded." },
    { label: "Market Readiness",   done: verificationData?.offerings?.length > 0, desc: "Experiences and services ready for listing." },
    { label: "Legal Compliance",   done: !!verificationData?.consent, desc: "Platform terms and safety guidelines accepted." },
  ];
  const completionScore = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);

  return (
    <div className="rcd-root">
      <style>{STYLES}</style>

      {/* ══ PREMIUM HERO ══ */}
      <div ref={heroRef} className="rcd-hero">
        {cover && <img src={cover} alt={community.name} className="rcd-hero-img" />}
        <div className="rcd-hero-gradient" />
        
        <div className="rcd-top-nav">
          <button className="rcd-back-btn" onClick={() => navigate("/security/verify-communities")}>
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
        </div>

        <div className="rcd-hero-content">
          <div className="rcd-badge-row">
            <StatusBadge status={community.status} />
            <span className="rcd-badge rcd-badge-outline"><Shield size={14} /> Security Review Mode</span>
            {completionScore === 100 && <span className="rcd-badge" style={{ background: "#FDF2F8", color: "#DB2777" }}><Award size={14} /> Verified Candidate</span>}
          </div>
          
          <h1 className="rcd-hero-title">{community.name}</h1>
          
          <div className="rcd-hero-meta">
            <span><MapPin size={16} /> {location}</span>
            <span><Users size={16} /> {community.member_count || 1} Registered Members</span>
            <span><Calendar size={16} /> Applied {createdOn}</span>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT GRID ══ */}
      <div ref={contentRef} className="rcd-container">
        
        {/* LEFT COLUMN */}
        <div className="rcd-main">
          
          {/* Integrity Score Explanation */}
          <div className="rcd-card">
            <div className="rcd-card-header">
              <h3 className="rcd-card-title">Registration Integrity</h3>
            </div>
            <div className="rcd-card-body">
              <p style={{ fontSize: 15, color: "#6B5E52", marginBottom: 32, lineHeight: 1.7, maxWidth: "600px" }}>
                Our verification engine evaluates profile completeness across five key safety pillars. 
                A high score represents lower security risk and higher operational readiness.
              </p>
              <div className="rcd-checklist">
                {checklist.map((item, i) => (
                  <div key={i} className={`rcd-check-item ${item.done ? "done" : ""}`}>
                    <div className="rcd-check-icon">
                      {item.done ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <div className="rcd-check-label">{item.label}</div>
                      <div className="rcd-check-sub">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed About */}
          <div className="rcd-card">
            <div className="rcd-card-header">
              <h3 className="rcd-card-title">Community Background</h3>
            </div>
            <div className="rcd-card-body">
              <div style={{ fontSize: 16, lineHeight: 1.9, color: "#3D342B" }}>
                {(community.description || "No detailed background provided for this community.").split("\n\n").map((p, i) => (
                  <p key={i} style={{ marginBottom: 20 }}>{p}</p>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
                {sustainability.map((tag) => (
                  <span key={tag} style={{ fontSize: 11, fontWeight: 700, padding: "8px 18px", borderRadius: 100, background: "#F0FDF4", color: "#166534", textTransform: "uppercase", letterSpacing: "0.08em", border: "1px solid #DCFCE7" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Owner & Team Members Table */}
          <div className="rcd-card">
            <div className="rcd-card-header">
              <h3 className="rcd-card-title">Leadership & Governance</h3>
            </div>
            <div className="rcd-card-body" style={{ padding: 0 }}>
              <div className="rcd-table-container">
                <table className="rcd-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Communication</th>
                      <th>Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700, color: "#1A1612" }}>{community.owner_name}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{community.owner_email}</span>
                          <span style={{ fontSize: 12, color: "#8C8479" }}>{community.owner_phone}</span>
                        </div>
                      </td>
                      <td><span style={{ padding: "6px 14px", borderRadius: 8, background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Primary Point of Contact</span></td>
                    </tr>
                    {verificationData?.members?.filter(m => !m.is_owner).map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{m.full_name}</td>
                        <td>{m.phone}</td>
                        <td style={{ color: "#8C8479" }}>{m.role || "Team Member"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Document Verification Grid */}
          <div className="rcd-card">
            <div className="rcd-card-header">
              <h3 className="rcd-card-title">Legal Documentation</h3>
            </div>
            <div className="rcd-card-body">
              {!verificationData?.documents?.length ? (
                <div style={{ padding: "60px 40px", textAlign: "center", background: "#FAF9F6", borderRadius: 24, border: "2px dashed #E5E7EB" }}>
                  <Shield size={48} color="#D1D5DB" strokeWidth={1} style={{ marginBottom: 16 }} />
                  <p style={{ fontSize: 15, color: "#8C8479", fontWeight: 500 }}>No government ID documents have been submitted for review.</p>
                </div>
              ) : (
                <div className="rcd-doc-grid">
                  {verificationData.documents.map((doc, i) => (
                    <div key={i} className="rcd-doc-item">
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <BookOpen size={20} color="#4B5563" />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{doc.document_type || "Government ID"}</div>
                          <div style={{ fontSize: 12, color: "#8C8479", marginTop: 2 }}>ID Verification Asset</div>
                        </div>
                      </div>
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="rcd-doc-link">View File</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <div className="rcd-sidebar">
          <div className="rcd-sidebar-sticky">
            
            {/* Real-time Completion Score */}
            <div className="rcd-progress-card">
              <div className="rcd-prog-val">{completionScore}%</div>
              <div className="rcd-prog-label">Application Completion</div>
              
              <div className="rcd-prog-bar-container">
                <div className="rcd-prog-bar">
                  <div className="rcd-prog-fill" style={{ width: `${completionScore}%` }} />
                </div>
              </div>
              
              <p style={{ fontSize: 13, color: "#8C8479", lineHeight: 1.6, padding: "0 10px" }}>
                {completionScore < 100 
                  ? "This profile is currently below the required safety threshold. Manual verification is advised with caution."
                  : "Excellent. This partner has provided all required security and business documentation."
                }
              </p>
            </div>

            {/* Decision Command Center */}
            <div className="rcd-decision-card">
              <h3 className="rcd-decision-title">Verdict Center</h3>
              <p className="rcd-decision-sub">Finalize the security status of this community application.</p>

              {actionError && <div style={{ padding: "16px", background: "rgba(239,68,68,0.15)", borderRadius: 12, color: "#FCA5A5", fontSize: 13, marginBottom: 20, border: "1px solid rgba(239,68,68,0.3)" }}>{actionError}</div>}

              {community.status === "pending" ? (
                action === "reject" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <textarea
                      className="rcd-textarea"
                      rows={4}
                      placeholder="Provide a detailed reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: 12 }}>
                      <button className="rcd-action-btn rcd-btn-reject" style={{ flex: 2 }} onClick={handleReject} disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : "Finalize Reject"}
                      </button>
                      <button className="rcd-action-btn" style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "white" }} onClick={() => setAction(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <button className="rcd-action-btn rcd-btn-approve" onClick={handleVerify} disabled={submitting}>
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={20} /> Approve Partnership</>}
                    </button>
                    <button className="rcd-action-btn rcd-btn-reject" onClick={() => setAction("reject")}>
                      <XCircle size={20} /> Deny Application
                    </button>
                  </div>
                )
              ) : (
                <div style={{ 
                  padding: 24, 
                  borderRadius: 20, 
                  background: community.status === "verified" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", 
                  border: `1px solid ${community.status === "verified" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: community.status === "verified" ? "#10B981" : "#FCA5A5",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, opacity: 0.8 }}>Final Decision</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {community.status === "verified" ? "✓ Verified Partner" : "✕ Application Denied"}
                  </div>
                  {community.rejection_reason && (
                    <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                      "{community.rejection_reason}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Context Stats */}
            <div className="rcd-card" style={{ padding: "10px 40px" }}>
              <div className="rcd-stat-row">
                <div className="rcd-stat-icon"><TrendingUp size={20} /></div>
                <div>
                  <div className="rcd-stat-lbl">Portfolio</div>
                  <div className="rcd-stat-val">{experiences.length} Active Experiences</div>
                </div>
              </div>
              <div className="rcd-stat-row">
                <div className="rcd-stat-icon"><Star size={20} /></div>
                <div>
                  <div className="rcd-stat-lbl">Rating</div>
                  <div className="rcd-stat-val">{rating > 0 ? `${rating.toFixed(1)} Trust Score` : "New Candidate"}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
