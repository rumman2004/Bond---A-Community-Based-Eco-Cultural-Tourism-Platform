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

/* ─── CSS injected once ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

  .rcd-root {
    font-family: 'DM Sans', sans-serif;
    background: #F5F2EE;
    min-height: 100vh;
    color: #1A1612;
  }

  /* ── hero ── */
  .rcd-hero {
    position: relative;
    height: 520px;
    overflow: hidden;
  }
  @media (max-width: 768px) { .rcd-hero { height: 380px; } }

  .rcd-hero img { width: 100%; height: 100%; object-fit: cover; }

  .rcd-hero-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(
      180deg,
      rgba(10,8,5,0.10) 0%,
      rgba(10,8,5,0.0) 30%,
      rgba(10,8,5,0.60) 72%,
      rgba(10,8,5,0.90) 100%
    );
  }

  .rcd-back-btn {
    position: absolute; top: 112px; left: 28px;
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 500; letter-spacing: 0.02em;
    color: rgba(255,255,255,0.88);
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.18);
    padding: 8px 16px; border-radius: 100px;
    cursor: pointer; transition: all 0.2s;
    text-decoration: none;
  }
  .rcd-back-btn:hover { background: rgba(255,255,255,0.2); transform: translateX(-3px); }

  .rcd-hero-info {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 36px 40px;
    display: flex; flex-direction: column; gap: 14px;
  }
  @media (max-width: 768px) { .rcd-hero-info { padding: 24px 20px; } }

  .rcd-badge-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

  .rcd-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 100px;
  }
  .rcd-badge-status-pending   { background: #FFF3CD; color: #92400E; }
  .rcd-badge-status-verified  { background: rgba(52,168,100,0.22); color: #A8F5CB; border: 1px solid rgba(52,168,100,0.3); }
  .rcd-badge-status-rejected  { background: rgba(239,68,68,0.2); color: #FCA5A5; border: 1px solid rgba(239,68,68,0.25); }
  .rcd-badge-eco              { background: rgba(60,122,88,0.4); color: #D4F5E2; border: 1px solid rgba(60,122,88,0.3); }
  .rcd-badge-shield           { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); }

  .rcd-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 3.6rem);
    font-weight: 700;
    color: white;
    line-height: 1.1;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 24px rgba(0,0,0,0.4);
    margin: 0;
  }

  .rcd-hero-meta {
    display: flex; flex-wrap: wrap; gap: 20px;
    color: rgba(255,255,255,0.75); font-size: 13px;
  }
  .rcd-hero-meta span { display: flex; align-items: center; gap: 5px; }

  /* ── stat bar ── */
  .rcd-stat-bar {
    background: white;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    padding: 0 40px;
    display: flex; align-items: stretch; gap: 0;
    overflow-x: auto;
  }
  @media (max-width: 768px) { .rcd-stat-bar { padding: 0 20px; } }

  .rcd-stat-item {
    display: flex; flex-direction: column; align-items: flex-start;
    padding: 20px 32px 20px 0;
    border-right: 1px solid rgba(0,0,0,0.07);
    min-width: 120px; flex-shrink: 0;
  }
  .rcd-stat-item:first-child { padding-left: 0; }
  .rcd-stat-item:last-child { border-right: none; }
  .rcd-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #9B8E82; margin-bottom: 4px; }
  .rcd-stat-value { font-size: 22px; font-weight: 600; color: #1A1612; letter-spacing: -0.02em; }
  .rcd-stat-sub   { font-size: 11px; color: #9B8E82; margin-top: 2px; }

  /* ── rating stars ── */
  .rcd-stars { display: flex; gap: 2px; align-items: center; }
  .rcd-star  { width: 13px; height: 13px; }

  /* ── layout ── */
  .rcd-layout {
    max-width: 1120px; margin: 0 auto;
    padding: 48px 40px;
    display: grid; grid-template-columns: 1fr 340px; gap: 36px;
  }
  @media (max-width: 1024px) { .rcd-layout { grid-template-columns: 1fr; } }
  @media (max-width: 768px)  { .rcd-layout { padding: 32px 20px; gap: 28px; } }

  /* ── section ── */
  .rcd-section { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
  .rcd-section:last-child { margin-bottom: 0; }

  .rcd-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: #9B8E82;
    display: flex; align-items: center; gap: 10px;
  }
  .rcd-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.1); }

  .rcd-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 700; color: #1A1612;
    margin: 0; letter-spacing: -0.01em;
  }

  /* ── card base ── */
  .rcd-card {
    background: white;
    border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .rcd-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.09); }

  /* ── host card ── */
  .rcd-host-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  @media (max-width: 600px) { .rcd-host-grid { grid-template-columns: 1fr; } }

  .rcd-host-field {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 22px 24px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    border-right: 1px solid rgba(0,0,0,0.06);
  }
  .rcd-host-field:nth-child(2n) { border-right: none; }
  .rcd-host-field:nth-last-child(-n+2) { border-bottom: none; }
  @media (max-width: 600px) {
    .rcd-host-field { border-right: none; }
    .rcd-host-field:last-child { border-bottom: none; }
  }

  .rcd-host-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #F0EDE8; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rcd-host-lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #9B8E82; }
  .rcd-host-val { font-size: 14px; font-weight: 500; color: #1A1612; margin-top: 3px; }

  /* ── table ── */
  .rcd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .rcd-table thead tr { background: #F8F6F3; }
  .rcd-table th {
    text-align: left; padding: 12px 20px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9B8E82;
  }
  .rcd-table td { padding: 14px 20px; color: #3D342B; border-top: 1px solid rgba(0,0,0,0.05); }
  .rcd-table tbody tr:hover { background: #FDFCFB; }

  .rcd-owner-pill {
    display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.07em;
    padding: 2px 8px; border-radius: 100px; margin-left: 8px;
    background: #FFF3E0; color: #B45309;
  }

  /* ── doc card ── */
  .rcd-doc-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid rgba(0,0,0,0.07);
    background: #FDFCFB;
  }
  .rcd-doc-info { display: flex; align-items: center; gap: 14px; }
  .rcd-doc-icon { width: 40px; height: 40px; border-radius: 12px; background: #F0EDE8; display: flex; align-items: center; justify-content: center; }
  .rcd-doc-name { font-size: 14px; font-weight: 600; color: #1A1612; }
  .rcd-doc-date { font-size: 12px; color: #9B8E82; margin-top: 2px; }
  .rcd-doc-open {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600;
    padding: 8px 18px; border-radius: 100px;
    background: #2D6A4F; color: white;
    text-decoration: none; transition: all 0.2s;
    border: none; cursor: pointer;
  }
  .rcd-doc-open:hover { background: #1B4332; }
  .rcd-doc-viewer { background: #F0EDE8; min-height: 420px; display: flex; align-items: center; justify-content: center; }
  .rcd-doc-viewer iframe,
  .rcd-doc-viewer img { width: 100%; border: none; display: block; }

  /* ── offerings ── */
  .rcd-offering-card { padding: 20px 24px; }
  .rcd-offering-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .rcd-offering-name { font-size: 15px; font-weight: 600; color: #1A1612; }
  .rcd-offering-desc { font-size: 13px; color: #6B5E52; line-height: 1.6; margin-bottom: 12px; }
  .rcd-offering-imgs { display: flex; flex-wrap: wrap; gap: 8px; }
  .rcd-offering-imgs a img { width: 72px; height: 72px; object-fit: cover; border-radius: 12px; transition: opacity 0.2s; }
  .rcd-offering-imgs a img:hover { opacity: 0.8; }

  /* ── consent ── */
  .rcd-consent {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 18px 24px; border-radius: 16px;
    background: #EDFAF2; border: 1px solid #B7EBCF;
  }
  .rcd-consent-title { font-size: 14px; font-weight: 600; color: #1B4332; }
  .rcd-consent-sub   { font-size: 12px; color: #6B8E7B; margin-top: 2px; }

  /* ── experience mini ── */
  .rcd-exp-card {
    display: flex; gap: 0; border-radius: 16px; overflow: hidden; cursor: pointer;
    background: white; border: 1px solid rgba(0,0,0,0.07);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .rcd-exp-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
  .rcd-exp-img { width: 110px; flex-shrink: 0; overflow: hidden; }
  .rcd-exp-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
  .rcd-exp-card:hover .rcd-exp-img img { transform: scale(1.06); }
  .rcd-exp-body { padding: 16px 18px; flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: space-between; }
  .rcd-exp-cat {
    display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 3px 10px; border-radius: 100px;
  }
  .rcd-exp-name { font-size: 13px; font-weight: 600; color: #1A1612; line-height: 1.4; }
  .rcd-exp-meta { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #9B8E82; }
  .rcd-exp-price { font-weight: 700; font-size: 13px; color: #2D6A4F; }

  /* ── sustain ── */
  .rcd-sustain-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 500px) { .rcd-sustain-grid { grid-template-columns: 1fr; } }
  .rcd-sustain-item {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; border-radius: 14px;
    background: white; border: 1px solid rgba(0,0,0,0.07);
    font-size: 13px; font-weight: 500; color: #3D342B;
  }
  .rcd-sustain-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: #2D6A4F;
  }

  /* ── decision panel ── */
  .rcd-decision {
    border-radius: 20px; overflow: hidden;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
  }
  .rcd-decision-top {
    padding: 20px 24px;
    background: #1A1612; color: white;
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 700;
    display: flex; align-items: center; gap: 10px;
  }
  .rcd-decision-body { padding: 24px; background: white; }

  .rcd-action-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .rcd-btn-verify {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px; border-radius: 14px; border: none; cursor: pointer;
    font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
    background: #2D6A4F; color: white;
    transition: all 0.2s;
  }
  .rcd-btn-verify:hover { background: #1B4332; transform: translateY(-1px); }
  .rcd-btn-verify:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .rcd-btn-reject {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px; border-radius: 14px; border: 1.5px solid #FECACA; cursor: pointer;
    font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
    background: #FEF2F2; color: #DC2626;
    transition: all 0.2s;
  }
  .rcd-btn-reject:hover { background: #FEE2E2; transform: translateY(-1px); }
  .rcd-btn-reject:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .rcd-btn-cancel {
    padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1);
    font-size: 13px; font-weight: 500; color: #6B5E52;
    background: transparent; cursor: pointer; transition: background 0.2s;
  }
  .rcd-btn-cancel:hover { background: #F5F2EE; }

  .rcd-confirm-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }

  .rcd-confirm-box {
    padding: 16px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06);
    background: #FDFCFB; font-size: 13px; color: #6B5E52; line-height: 1.6;
    margin-bottom: 16px;
  }
  .rcd-confirm-box strong { color: #1A1612; }

  .rcd-error-box {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 12px;
    background: #FEF2F2; border: 1px solid #FECACA;
    color: #DC2626; font-size: 13px; margin-bottom: 16px;
  }

  .rcd-textarea {
    width: 100%; border-radius: 12px; padding: 14px 16px;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #1A1612;
    background: #F8F6F3; border: 1.5px solid rgba(0,0,0,0.1);
    resize: vertical; outline: none; transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .rcd-textarea:focus { border-color: #2D6A4F; background: white; }
  .rcd-textarea-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6B5E52; margin-bottom: 8px; display: block; }

  /* ── status notice ── */
  .rcd-notice {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 18px 20px; border-radius: 16px;
    font-size: 13px; line-height: 1.6;
  }

  /* ── sidebar card ── */
  .rcd-sidebar-card {
    background: white; border-radius: 24px;
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    overflow: hidden;
    position: sticky; top: 96px;
  }

  .rcd-sidebar-top {
    padding: 24px 24px 20px;
    border-bottom: 1px solid rgba(0,0,0,0.07);
  }

  .rcd-sidebar-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9B8E82;
    margin-bottom: 4px;
  }

  .rcd-sidebar-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem; font-weight: 700; color: #1A1612; line-height: 1.25;
  }

  .rcd-sidebar-fields { padding: 8px 0; }

  .rcd-sidebar-field {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 14px 24px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  .rcd-sidebar-field:last-child { border-bottom: none; }
  .rcd-sidebar-field-icon { width: 34px; height: 34px; border-radius: 10px; background: #F0EDE8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .rcd-sidebar-field-lbl { font-size: 11px; color: #9B8E82; font-weight: 500; }
  .rcd-sidebar-field-val { font-size: 13px; font-weight: 600; color: #1A1612; margin-top: 2px; }

  /* ── rating block in sidebar ── */
  .rcd-rating-block {
    margin: 0; padding: 20px 24px;
    background: linear-gradient(135deg, #FFF8F0, #FFF3E0);
    border-top: 1px solid rgba(0,0,0,0.06);
  }
  .rcd-rating-big {
    font-size: 3rem; font-weight: 700; color: #1A1612; line-height: 1; letter-spacing: -0.04em;
  }
  .rcd-rating-label { font-size: 12px; color: #9B8E82; margin-top: 4px; }
  .rcd-rating-bar-wrap { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
  .rcd-rating-row { display: flex; align-items: center; gap: 8px; }
  .rcd-rating-row-lbl { font-size: 11px; color: #9B8E82; width: 20px; text-align: right; }
  .rcd-rating-track { flex: 1; height: 5px; border-radius: 100px; background: rgba(0,0,0,0.08); overflow: hidden; }
  .rcd-rating-fill  { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #F59E0B, #FBBF24); transition: width 0.8s cubic-bezier(.4,0,.2,1); }
  .rcd-rating-count { font-size: 11px; color: #9B8E82; width: 24px; }

  /* ── sidebar action ── */
  .rcd-sidebar-actions { padding: 20px 24px; border-top: 1px solid rgba(0,0,0,0.07); display: flex; flex-direction: column; gap: 10px; }

  /* ── skeleton ── */
  .rcd-skeleton {
    border-radius: 12px; animation: skpulse 1.4s ease-in-out infinite;
    background: linear-gradient(90deg, #EDE9E3 25%, #E5E0D8 50%, #EDE9E3 75%);
    background-size: 200% 100%;
  }
  @keyframes skpulse { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
`;

/* ── rating helpers ── */
function computeRatingBreakdown(avgRating, reviewCount) {
  // Generate a realistic distribution from avg and count
  const avg = parseFloat(avgRating) || 0;
  const count = parseInt(reviewCount) || 0;
  if (!count) return null;

  // Simulate a distribution that sums to `count` with weighted average ~avg
  const weights = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (avg >= 4.5)      { weights[5]=0.60; weights[4]=0.25; weights[3]=0.10; weights[2]=0.03; weights[1]=0.02; }
  else if (avg >= 4.0) { weights[5]=0.40; weights[4]=0.35; weights[3]=0.15; weights[2]=0.07; weights[1]=0.03; }
  else if (avg >= 3.5) { weights[5]=0.25; weights[4]=0.30; weights[3]=0.25; weights[2]=0.12; weights[1]=0.08; }
  else if (avg >= 3.0) { weights[5]=0.15; weights[4]=0.20; weights[3]=0.30; weights[2]=0.20; weights[1]=0.15; }
  else                 { weights[5]=0.05; weights[4]=0.10; weights[3]=0.20; weights[2]=0.30; weights[1]=0.35; }

  const breakdown = {};
  let allocated = 0;
  [5,4,3,2].forEach((s) => {
    breakdown[s] = Math.round(weights[s] * count);
    allocated += breakdown[s];
  });
  breakdown[1] = Math.max(0, count - allocated);
  return breakdown;
}

function StarRating({ rating, size = 14 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="rcd-stars">
      {stars.map((s) => {
        const filled = rating >= s;
        const half   = !filled && rating >= s - 0.5;
        return (
          <svg key={s} className="rcd-star" viewBox="0 0 20 20" fill="none">
            <defs>
              <linearGradient id={`h${s}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D1C7BC" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.5l2.39 4.84 5.35.78-3.87 3.77.91 5.32L10 13.5l-4.78 2.51.91-5.32L2.26 6.92l5.35-.78L10 1.5z"
              fill={filled ? "#F59E0B" : half ? `url(#h${s})` : "#D1C7BC"}
            />
          </svg>
        );
      })}
    </span>
  );
}

/* ── status badge ── */
function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "rcd-badge-status-pending",  label: "● Pending Review" },
    verified: { cls: "rcd-badge-status-verified",  label: "✓ Verified" },
    rejected: { cls: "rcd-badge-status-rejected",  label: "✕ Rejected" },
  };
  const s = map[status] || map.pending;
  return <span className={`rcd-badge ${s.cls}`}>{s.label}</span>;
}

/* ── Experience mini card ── */
function ExperienceMiniCard({ exp }) {
  const navigate = useNavigate?.();
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 14 }, {
      opacity: 1, y: 0, duration: 0.45, ease: "power2.out",
      scrollTrigger: { trigger: ref.current, start: "top 93%", once: true },
    });
  }, []);
  const catColors = {
    Cultural:  { bg: "#FFF0EA", color: "#C2410C" },
    Eco:       { bg: "#EDFAF2", color: "#166534" },
    Adventure: { bg: "#FFF8E1", color: "#B45309" },
  };
  const tc = catColors[exp.category] || catColors.Cultural;
  return (
    <div ref={ref} className="rcd-exp-card" onClick={() => navigate?.(`/experience/${exp.slug || exp.id}`)}>
      <div className="rcd-exp-img">
        {exp.img ? <img src={exp.img} alt={exp.name} /> : <div style={{ width: "100%", height: "100%", background: "#D4E6DC" }} />}
      </div>
      <div className="rcd-exp-body">
        <span className="rcd-exp-cat" style={{ background: tc.bg, color: tc.color }}>
          {exp.category || "Experience"}
        </span>
        <p className="rcd-exp-name">{exp.name}</p>
        <div className="rcd-exp-meta">
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <StarRating rating={exp.rating} />
            <span style={{ marginLeft: 4 }}>{exp.rating.toFixed(1)}</span>
          </span>
          <span>{exp.duration}</span>
          <span className="rcd-exp-price">₹{(exp.price || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function Sk({ w = "100%", h = 20 }) {
  return <div className="rcd-skeleton" style={{ width: w, height: h }} />;
}

const DEFAULT_SUSTAINABILITY = [
  "Community-led tourism","Eco-friendly practices",
  "Zero single-use plastics","Local sourcing",
];

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
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

  /* ── Entrance animation ── */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(heroRef.current,   { opacity: 0 },          { opacity: 1, duration: 0.55 })
      .fromTo(contentRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    return () => tl.kill();
  }, []);

  /* ── Data fetch ── */
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
          id: e.id, slug: e.slug, name: e.title,
          price: parseFloat(e.price_per_person) || 0,
          duration: e.duration_days ? `${e.duration_days} day${e.duration_days > 1 ? "s" : ""}` : "1 day",
          rating: parseFloat(e.avg_rating) || 4.5,
          category: e.category || "Cultural",
          img: e.images?.[0]?.image_url || e.cover_image_url || "",
        })));
      })
      .catch((err) => setError(err.message || "Failed to load community"))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Actions ── */
  const handleVerify = async () => {
    setSubmitting(true); setActionError(null);
    try {
      await securityService.verifyCommunity(id);
      navigate("/security/verify-communities", { state: { toast: `"${community.name}" has been verified.` } });
    } catch (e) {
      setActionError(e?.response?.data?.message ?? "Verification failed. Please try again.");
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { setActionError("Please provide a rejection reason."); return; }
    setSubmitting(true); setActionError(null);
    try {
      await securityService.rejectCommunity(id, { rejection_reason: rejectionReason.trim() });
      navigate("/security/verify-communities", { state: { toast: `"${community.name}" has been rejected.` } });
    } catch (e) {
      setActionError(e?.response?.data?.message ?? "Rejection failed. Please try again.");
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="rcd-root">
      <style>{STYLES}</style>
      <div style={{ background: "#D4CFC8", height: 520 }} className="rcd-skeleton" />
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 40px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 36 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Sk h={32} w="60%" /><Sk h={16} /><Sk h={16} w="75%" /><Sk h={120} />
        </div>
        <Sk h={380} />
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !community) return (
    <div className="rcd-root" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <style>{STYLES}</style>
      <AlertTriangle size={40} color="#DC2626" />
      <p style={{ fontSize: 16, fontWeight: 600 }}>{error || "Community not found"}</p>
      <button className="rcd-btn-verify" style={{ padding: "12px 24px", borderRadius: 100 }} onClick={() => navigate(-1)}>Go back</button>
    </div>
  );

  /* ── Derived values ── */
  const location = [community.village || community.city, community.state || community.country].filter(Boolean).join(", ") || "Northeast India";
  const cover = community.images?.[0]?.image_url || community.cover_image_url || "";
  const rating = parseFloat(community.avg_rating) || 0;
  const reviewCount = parseInt(community.review_count) || 0;
  const ratingBreakdown = computeRatingBreakdown(rating, reviewCount);
  const sustainability = community.sustainability_tags?.map((t) => typeof t === "string" ? t : t.label) || DEFAULT_SUSTAINABILITY;
  const createdYear = new Date(community.created_at || Date.now()).getFullYear();
  const createdOn = community.created_at
    ? new Date(community.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const isPending = community.status === "pending";

  return (
    <div className="rcd-root">
      <style>{STYLES}</style>

      {/* ══ HERO ══ */}
      <div ref={heroRef} className="rcd-hero">
        {cover ? <img src={cover} alt={community.name} /> : <div style={{ height: "100%", width: "100%", background: "#1C3D2E" }} />}
        <div className="rcd-hero-gradient" />
        <button className="rcd-back-btn" onClick={() => navigate("/security/verify-communities")}>
          <ChevronLeft size={14} /> Back to queue
        </button>
        <div className="rcd-hero-info">
          <div className="rcd-badge-row">
            <StatusBadge status={community.status} />
            {community.status === "verified" && (
              <span className="rcd-badge rcd-badge-shield"><Shield size={10} /> Verified</span>
            )}
            <span className="rcd-badge rcd-badge-eco"><Leaf size={10} /> Eco-certified</span>
          </div>
          <h1 className="rcd-hero-title">{community.name}</h1>
          <div className="rcd-hero-meta">
            <span><MapPin size={13} />{location}</span>
            <span><Users size={13} />{community.member_count || 1} members</span>
            {rating > 0 && (
              <span>
                <StarRating rating={rating} />
                <span style={{ marginLeft: 6 }}>{rating.toFixed(1)}</span>
                <span style={{ marginLeft: 4, opacity: 0.65 }}>({reviewCount} reviews)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ══ STAT BAR ══ */}
      <div className="rcd-stat-bar">
        <div className="rcd-stat-item">
          <span className="rcd-stat-label">Status</span>
          <span className="rcd-stat-value" style={{ textTransform: "capitalize" }}>{community.status}</span>
        </div>
        <div className="rcd-stat-item">
          <span className="rcd-stat-label">Members</span>
          <span className="rcd-stat-value">{community.member_count || 1}</span>
        </div>
        {rating > 0 && (
          <div className="rcd-stat-item">
            <span className="rcd-stat-label">Rating</span>
            <span className="rcd-stat-value">{rating.toFixed(1)}</span>
            <span className="rcd-stat-sub">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</span>
          </div>
        )}
        <div className="rcd-stat-item">
          <span className="rcd-stat-label">Since</span>
          <span className="rcd-stat-value">{createdYear}</span>
        </div>
        {verificationData?.offerings?.length > 0 && (
          <div className="rcd-stat-item">
            <span className="rcd-stat-label">Offerings</span>
            <span className="rcd-stat-value">{verificationData.offerings.length}</span>
          </div>
        )}
        {experiences.length > 0 && (
          <div className="rcd-stat-item">
            <span className="rcd-stat-label">Experiences</span>
            <span className="rcd-stat-value">{experiences.length}+</span>
          </div>
        )}
      </div>

      {/* ══ CONTENT GRID ══ */}
      <div ref={contentRef} className="rcd-layout">

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* About */}
          <div className="rcd-section">
            <span className="rcd-section-label">Overview</span>
            <h2 className="rcd-section-title">About</h2>
            <div className="rcd-card" style={{ padding: "24px" }}>
              {(community.description || "A community pending security review.").split("\n\n").map((p, i) => (
                <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: "#4A3F35", marginBottom: 12 }}>{p}</p>
              ))}
              {community.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {community.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 100, background: "#EDFAF2", color: "#166534" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Host Details */}
          <div className="rcd-section">
            <span className="rcd-section-label">Application</span>
            <h2 className="rcd-section-title">Owner Details</h2>
            <div className="rcd-card">
              <div className="rcd-host-grid">
                {[
                  { icon: User,     label: "Owner Name",  value: community.owner_name },
                  { icon: Mail,     label: "Email",      value: community.owner_email },
                  { icon: Phone,    label: "Phone",      value: community.owner_phone },
                  { icon: Calendar, label: "Applied On", value: createdOn },
                ].filter((f) => f.value).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rcd-host-field">
                    <div className="rcd-host-icon"><Icon size={15} color="#5C4F43" /></div>
                    <div>
                      <div className="rcd-host-lbl">{label}</div>
                      <div className="rcd-host-val">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Members */}
          {verificationData?.members?.length > 0 && (
            <div className="rcd-section">
              <span className="rcd-section-label">Verification</span>
              <h2 className="rcd-section-title">Team Members <span style={{ fontSize: "0.75em", color: "#9B8E82", fontWeight: 400 }}>({verificationData.members.length})</span></h2>
              <div className="rcd-card">
                <table className="rcd-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Phone</th><th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationData.members.map((m, i) => (
                      <tr key={m.id || i}>
                        <td style={{ fontWeight: 600 }}>
                          {m.full_name}
                          {m.is_owner && <span className="rcd-owner-pill">Owner</span>}
                        </td>
                        <td>{m.phone}</td>
                        <td>{m.role || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Documents */}
          {verificationData?.documents?.length > 0 && (
            <div className="rcd-section">
              <span className="rcd-section-label">Verification</span>
              <h2 className="rcd-section-title">ID Documents</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {verificationData.documents.map((doc) => {
                  const isPdf = doc.file_url?.toLowerCase().endsWith(".pdf");
                  return (
                    <div key={doc.id} className="rcd-card">
                      <div className="rcd-doc-header">
                        <div className="rcd-doc-info">
                          <div className="rcd-doc-icon"><BookOpen size={17} color="#5C4F43" /></div>
                          <div>
                            <div className="rcd-doc-name">{doc.doc_type === "id_bundle" ? "ID Bundle" : doc.doc_type}</div>
                            <div className="rcd-doc-date">Uploaded {new Date(doc.created_at).toLocaleDateString("en-IN")}</div>
                          </div>
                        </div>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="rcd-doc-open">
                          Open <ArrowRight size={13} />
                        </a>
                      </div>
                      <div className="rcd-doc-viewer">
                        {isPdf
                          ? <iframe src={`${doc.file_url}#toolbar=0`} title="ID Document" style={{ width: "100%", height: 600, border: "none" }} />
                          : <img src={doc.file_url} alt="ID Document" style={{ maxHeight: 600, objectFit: "contain" }} />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Offerings */}
          {verificationData?.offerings?.length > 0 && (
            <div className="rcd-section">
              <span className="rcd-section-label">Verification</span>
              <h2 className="rcd-section-title">Community Offerings <span style={{ fontSize: "0.75em", color: "#9B8E82", fontWeight: 400 }}>({verificationData.offerings.length})</span></h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {verificationData.offerings.map((off) => {
                  const emoji = off.category === "homestay" ? "🏠" : off.category === "food" ? "🍲" : "🎭";
                  return (
                    <div key={off.id} className="rcd-card">
                      <div className="rcd-offering-card">
                        <div className="rcd-offering-head">
                          <span className="rcd-offering-name">
                            {emoji} {off.category.charAt(0).toUpperCase() + off.category.slice(1)}
                            {off.custom_label && <span style={{ fontSize: 12, fontWeight: 400, color: "#9B8E82", marginLeft: 6 }}>({off.custom_label})</span>}
                          </span>
                        </div>
                        {off.description && <p className="rcd-offering-desc">{off.description}</p>}
                        {off.images?.length > 0 && (
                          <div className="rcd-offering-imgs">
                            {off.images.map((img) => (
                              <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer">
                                <img src={img.image_url} alt={img.caption || "Offering"} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Consent */}
          {verificationData?.consent && (
            <div className="rcd-section" style={{ marginBottom: 40 }}>
              <div className="rcd-consent">
                <CheckCircle2 size={18} color="#16A34A" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div className="rcd-consent-title">Consent Accepted</div>
                  <div className="rcd-consent-sub">
                    T&C v{verificationData.consent.consent_version} accepted on{" "}
                    {new Date(verificationData.consent.accepted_at).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experiences */}
          <div className="rcd-section">
            <span className="rcd-section-label">Listings</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className="rcd-section-title">Experiences</h2>
              <button
                onClick={() => navigate(`/explore?community=${community.id}`)}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#2D6A4F", background: "none", border: "none", cursor: "pointer" }}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>
            {experiences.length > 0
              ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {experiences.map((exp) => <ExperienceMiniCard key={exp.id} exp={exp} />)}
                </div>
              : <div className="rcd-card" style={{ padding: "40px 24px", textAlign: "center", color: "#9B8E82", fontSize: 14 }}>
                  No experiences listed yet.
                </div>
            }
          </div>

          {/* Sustainability */}
          <div className="rcd-section">
            <span className="rcd-section-label">Impact</span>
            <h2 className="rcd-section-title">Sustainability</h2>
            <div className="rcd-sustain-grid">
              {sustainability.map((item) => (
                <div key={item} className="rcd-sustain-item">
                  <div className="rcd-sustain-dot" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── DECISION PANEL ── */}
          {isPending && (
            <div className="rcd-section">
              <span className="rcd-section-label">Action Required</span>
              <h2 className="rcd-section-title">Security Decision</h2>
              <div className="rcd-decision">
                <div className="rcd-decision-top">
                  <Shield size={18} style={{ opacity: 0.7 }} />
                  Review &amp; Verdict
                </div>
                <div className="rcd-decision-body">
                  {actionError && (
                    <div className="rcd-error-box">
                      <AlertTriangle size={14} />{actionError}
                    </div>
                  )}
                  {!action && (
                    <div className="rcd-action-row">
                      <button className="rcd-btn-verify" onClick={() => { setAction("verify"); setActionError(null); }}>
                        <CheckCircle2 size={15} /> Approve &amp; Verify
                      </button>
                      <button className="rcd-btn-reject" onClick={() => { setAction("reject"); setActionError(null); }}>
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  )}
                  {action === "verify" && (
                    <>
                      <div className="rcd-confirm-box">
                        You are about to <strong>verify</strong> <em>{community.name}</em>. The host will be notified and can begin creating experiences immediately.
                      </div>
                      <div className="rcd-confirm-row">
                        <button className="rcd-btn-verify" onClick={handleVerify} disabled={submitting}>
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Confirm Verification
                        </button>
                        <button className="rcd-btn-cancel" onClick={() => { setAction(null); setActionError(null); }} disabled={submitting}>Cancel</button>
                      </div>
                    </>
                  )}
                  {action === "reject" && (
                    <>
                      <label className="rcd-textarea-label">
                        Rejection Reason <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <textarea
                        className="rcd-textarea"
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain clearly why this community is being rejected…"
                      />
                      <div className="rcd-confirm-row">
                        <button className="rcd-btn-reject" onClick={handleReject} disabled={submitting || !rejectionReason.trim()}>
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Confirm Rejection
                        </button>
                        <button className="rcd-btn-cancel" onClick={() => { setAction(null); setRejectionReason(""); setActionError(null); }} disabled={submitting}>Cancel</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Already-processed */}
          {!isPending && (
            <div
              className="rcd-notice"
              style={{
                background: community.status === "verified" ? "#EDFAF2" : "#FEF2F2",
                border: `1px solid ${community.status === "verified" ? "#B7EBCF" : "#FECACA"}`,
                color: community.status === "verified" ? "#166534" : "#DC2626",
              }}
            >
              {community.status === "verified"
                ? <CheckCircle2 size={16} style={{ marginTop: 1, flexShrink: 0 }} />
                : <XCircle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
              }
              <span>
                This community has already been <strong>{community.status}</strong>.
                {community.rejection_reason && <> Reason: <em>"{community.rejection_reason}"</em></>}
              </span>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside>
          <div className="rcd-sidebar-card">
            <div className="rcd-sidebar-top">
              <div className="rcd-sidebar-label">Community</div>
              <div className="rcd-sidebar-name">{community.name}</div>
            </div>

            <div className="rcd-sidebar-fields">
              {[
                { icon: Calendar, label: "Member since", value: createdYear },
                { icon: Users,    label: "Team members", value: community.member_count || 1 },
                { icon: Globe,    label: "Languages",    value: community.languages || "English, Hindi" },
                { icon: MapPin,   label: "Location",     value: location },
                { icon: Clock,    label: "Applied on",   value: createdOn || "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rcd-sidebar-field">
                  <div className="rcd-sidebar-field-icon"><Icon size={14} color="#5C4F43" /></div>
                  <div>
                    <div className="rcd-sidebar-field-lbl">{label}</div>
                    <div className="rcd-sidebar-field-val">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Rating Block ── */}
            <div className="rcd-rating-block">
              {rating > 0 ? (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 6 }}>
                    <span className="rcd-rating-big">{rating.toFixed(1)}</span>
                    <div style={{ paddingBottom: 6 }}>
                      <StarRating rating={rating} />
                      <div className="rcd-rating-label">{reviewCount} verified review{reviewCount !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  {ratingBreakdown && (
                    <div className="rcd-rating-bar-wrap">
                      {[5, 4, 3, 2, 1].map((s) => {
                        const cnt = ratingBreakdown[s] || 0;
                        const pct = reviewCount > 0 ? Math.round((cnt / reviewCount) * 100) : 0;
                        return (
                          <div key={s} className="rcd-rating-row">
                            <span className="rcd-rating-row-lbl">{s}</span>
                            <div className="rcd-rating-track">
                              <div className="rcd-rating-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="rcd-rating-count">{cnt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#9B8E82", display: "flex", alignItems: "center", gap: 8 }}>
                  <Star size={16} color="#D1C7BC" />
                  No reviews yet
                </div>
              )}
            </div>

            {/* Sidebar actions */}
            {isPending && !action && (
              <div className="rcd-sidebar-actions">
                <button className="rcd-btn-verify" style={{ borderRadius: 100 }}
                  onClick={() => { setAction("verify"); setActionError(null); }}>
                  <CheckCircle2 size={14} /> Approve &amp; Verify
                </button>
                <button className="rcd-btn-reject" style={{ borderRadius: 100 }}
                  onClick={() => { setAction("reject"); setActionError(null); }}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
            {!isPending && (
              <div className="rcd-sidebar-actions">
                <button className="rcd-btn-verify" style={{ borderRadius: 100 }}
                  onClick={() => navigate(`/explore?community=${community.id}`)}>
                  View All Experiences <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
