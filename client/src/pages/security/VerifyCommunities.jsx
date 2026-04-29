import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  ShieldCheck, Users, FileText, Gift, Lock,
  MapPin, ChevronRight, Loader2, RefreshCw, AlertTriangle,
  Search, Building2,
} from "lucide-react";
import securityService from "../../services/securityService";
import communityService from "../../services/communityService";

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG = {
  pending:  { label: "Pending",  bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  verified: { label: "Verified", bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  rejected: { label: "Rejected", bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

// ── Chip helper ───────────────────────────────────────────────
function Chip({ ok, label, icon: Icon }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 99,
      fontSize: 10, fontWeight: 600,
      background: ok ? "#ECFDF5" : "#F3F4F6",
      color: ok ? "#065F46" : "#9CA3AF",
    }}>
      <Icon size={9} />
      {label}
    </span>
  );
}

export default function VerifyCommunities() {
  const navigate = useNavigate();

  const [communities,     setCommunities]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [search,          setSearch]          = useState("");
  const [filter,          setFilter]          = useState("all");
  const [verificationMap, setVerificationMap] = useState({});

  const cardsRef = useRef([]);

  // ── Fetch ──────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    securityService.getPendingCommunities()
      .then((res) => {
        // FIX: unwrap axios response correctly
        // res.data is the ApiResponse body: { communities: [...] }
        const list = res?.data?.communities ?? res?.data ?? [];
        const safeList = Array.isArray(list) ? list : [];
        setCommunities(safeList);

        // FIX: only fetch verification for ids that are real non-empty strings
        const ids = safeList
          .map((c) => c?.id)
          .filter((id) => id && typeof id === "string" && id !== "undefined");

        if (ids.length === 0) return;

        Promise.allSettled(
          ids.map((id) =>
            communityService
              .getVerificationData(id)
              .then((r) => ({ id, data: r?.data ?? null }))
              .catch(() => ({ id, data: null }))
          )
        ).then((results) => {
          const map = {};
          results.forEach((r) => {
            if (r.status === "fulfilled" && r.value?.id) {
              map[r.value.id] = r.value.data;
            }
          });
          setVerificationMap(map);
        });
      })
      .catch((err) => {
        console.error("getPendingCommunities error:", err);
        setError("Failed to load communities.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── GSAP animate cards ─────────────────────────────────────
  useEffect(() => {
    if (communities.length === 0) return;
    const els = cardsRef.current.filter(Boolean);
    if (els.length === 0) return;
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.06, delay: 0.15 }
    );
  }, [communities]);

  // ── Filter + search ────────────────────────────────────────
  const filtered = communities.filter((c) => {
    const status = c.status ?? "pending";
    if (filter !== "all" && status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (c.name    ?? "").toLowerCase().includes(q) ||
        (c.village ?? "").toLowerCase().includes(q) ||
        (c.state   ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Chips for a community ─────────────────────────────────
  const getChips = (c) => {
    const v = verificationMap[c.id];
    const membersCount   = v?.members?.length   ?? 0;
    const docsCount      = v?.documents?.length ?? 0;
    const offeringsCount = v?.offerings?.length ?? 0;
    const consentOk      = !!c.consent_accepted_at;
    const regStep        = c.registration_step ?? 1;

    const checks = [regStep > 1, membersCount > 0, docsCount > 0, offeringsCount > 0, consentOk];
    const pct    = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    return { membersCount, docsCount, offeringsCount, consentOk, pct };
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 10 }}>
      <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-forest)" }} />
      <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>Loading communities…</span>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
      <AlertTriangle size={36} style={{ color: "#C0533A", margin: "0 auto 12px" }} />
      <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Error</h2>
      <p style={{ fontSize: 14, color: "#7A8E84", marginBottom: 20 }}>{error}</p>
      <button onClick={load} style={{ padding: "10px 20px", borderRadius: 10, background: "#2D4A3E", color: "#fff", border: "none", cursor: "pointer", fontSize: 14 }}>
        Try again
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-dark)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={22} style={{ color: "var(--color-forest)" }} />
              Verify Communities
            </h1>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "4px 0 0" }}>
              Review and approve community registration applications.
            </p>
          </div>
          <button
            onClick={load}
            style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500,
              padding: "8px 16px", borderRadius: 10, border: "1px solid var(--color-border-soft)",
              background: "#fff", cursor: "pointer", color: "var(--color-text-mid)",
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: 12, color: "var(--color-text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, village, or state…"
            style={{
              width: "100%", padding: "10px 12px 10px 34px", borderRadius: 12,
              border: "1px solid var(--color-border-soft)", fontSize: 13,
              background: "#fff", outline: "none", color: "var(--color-text-dark)",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", "pending", "verified", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: filter === f ? "1.5px solid var(--color-forest)" : "1px solid var(--color-border-soft)",
                background: filter === f ? "var(--color-forest-pale)" : "#fff",
                color: filter === f ? "var(--color-forest)" : "var(--color-text-mid)",
                cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total",    count: communities.length,                                             color: "var(--color-forest)" },
          { label: "Pending",  count: communities.filter((c) => (c.status ?? "pending") === "pending").length, color: "#F59E0B" },
          { label: "Verified", count: communities.filter((c) => c.status === "verified").length,      color: "#10B981" },
          { label: "Rejected", count: communities.filter((c) => c.status === "rejected").length,      color: "#EF4444" },
        ].map((s) => (
          <div key={s.label} style={{
            flex: "1 1 100px", padding: "14px 18px", borderRadius: 14,
            border: "1px solid var(--color-border-soft)", background: "#fff",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 20px", borderRadius: 20,
          border: "1px dashed var(--color-border-soft)", background: "#fff",
        }}>
          <Building2 size={36} style={{ color: "var(--color-text-muted)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-mid)", margin: 0 }}>
            {search ? "No communities match your search." : "No communities found."}
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
            Communities will appear here once they submit their registration.
          </p>
        </div>
      )}

      {/* Community cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((c, idx) => {
          // FIX: skip rendering cards with no valid id
          if (!c?.id || c.id === "undefined") return null;

          const status = c.status ?? "pending";
          const cfg    = STATUS_CFG[status] ?? STATUS_CFG.pending;
          const { membersCount, docsCount, offeringsCount, consentOk, pct } = getChips(c);
          const place  = [c.village, c.district, c.state].filter(Boolean).join(", ");

          return (
            <div
              key={c.id}
              ref={(el) => (cardsRef.current[idx] = el)}
              onClick={() => navigate(`/security/verify-communities/${c.id}`)}
              style={{
                opacity: 0,
                display: "flex", alignItems: "center", gap: 16,
                padding: "18px 22px", borderRadius: 16,
                border: "1px solid var(--color-border-soft)", background: "#fff",
                cursor: "pointer",
                transition: "box-shadow 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(45,74,62,0.1)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: 64, height: 64, borderRadius: 14, flexShrink: 0, overflow: "hidden",
                background: "var(--color-forest-pale)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {c.cover_image_url
                  ? <img src={c.cover_image_url} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Building2 size={24} style={{ color: "var(--color-forest)" }} />
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--color-text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.name}
                  </h3>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: cfg.bg, color: cfg.text, textTransform: "uppercase", letterSpacing: "0.05em",
                    display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: cfg.dot }} />
                    {cfg.label}
                  </span>
                </div>

                {place && (
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} /> {place}
                  </p>
                )}

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Chip ok={membersCount > 0}   label={`${membersCount} Member${membersCount !== 1 ? "s" : ""}`}   icon={Users} />
                  <Chip ok={docsCount > 0}       label={`${docsCount} Doc${docsCount !== 1 ? "s" : ""}`}           icon={FileText} />
                  <Chip ok={offeringsCount > 0}  label={`${offeringsCount} Offering${offeringsCount !== 1 ? "s" : ""}`} icon={Gift} />
                  <Chip ok={consentOk}           label={consentOk ? "Consent ✓" : "No Consent"}                   icon={Lock} />
                </div>
              </div>

              {/* Progress + Arrow */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{
                  fontSize: 18, fontWeight: 700,
                  color: pct === 100 ? "#10B981" : pct >= 60 ? "#F59E0B" : "var(--color-text-muted)",
                }}>
                  {pct}%
                </span>
                <div style={{ width: 48, height: 5, borderRadius: 99, background: "#F0EBE3", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99, width: `${pct}%`,
                    background: pct === 100 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#D1C9BF",
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>

              <ChevronRight size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}