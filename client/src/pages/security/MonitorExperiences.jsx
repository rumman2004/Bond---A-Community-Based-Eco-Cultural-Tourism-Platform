import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import {
  Search, Filter, ChevronDown, RefreshCw,
  Star, MapPin, Eye, Flag, CheckCircle, XCircle,
  Compass, TrendingUp, AlertOctagon, Clock,
  ArrowUpRight, Loader2, Leaf,
} from "lucide-react";
import securityService from "../../services/securityService";

/* ── Style maps ── */
const STATUS_STYLE = {
  live:         { bg: "#DCFCE7", color: "#166534",                      dot: "#22C55E",  label: "Live" },
  under_review: { bg: "#EFF6FF", color: "#1D4ED8",                      dot: "#3B82F6",  label: "Under Review" },
  flagged:      { bg: "#FEF3C7", color: "#92400E",                      dot: "#F59E0B",  label: "Flagged" },
  suspended:    { bg: "#FEF2F2", color: "var(--color-terracotta)",      dot: "#EF4444",  label: "Suspended" },
};
const CAT_STYLE = {
  Cultural:  { bg: "var(--color-terracotta-light)", color: "var(--color-terracotta)" },
  Eco:       { bg: "var(--color-forest-pale)",      color: "var(--color-forest)" },
  Adventure: { bg: "var(--color-amber-light)",      color: "var(--color-amber)" },
  Wellness:  { bg: "#F0FDF4",                       color: "#166534" },
  Culinary:  { bg: "#FFF7ED",                       color: "#C2410C" },
};

/* ── Skeleton row ── */
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
      {[56, 24, 32, 20, 20, 20, 12, 12, 20].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="animate-pulse rounded-lg h-4"
            style={{ width: `${w * 3}px`, background: "var(--color-cream-mid)" }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, delta, icon: Icon, color, loading }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
    );
  }, []);
  return (
    <div ref={ref} className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
        <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon size={15} style={{ color }} />
        </span>
      </div>
      {loading ? (
        <div className="animate-pulse h-8 w-24 rounded-lg" style={{ background: "var(--color-cream-mid)" }} />
      ) : (
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}>
            {value ?? "—"}
          </span>
          {delta != null && (
            <span className="text-xs font-semibold pb-1" style={{ color: "var(--color-forest)" }}>
              {delta} <ArrowUpRight size={10} style={{ display: "inline" }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Action confirm modal ── */
function ConfirmModal({ exp, actionType, onConfirm, onCancel, submitting }) {
  const [reason, setReason] = useState("");
  const needsReason = actionType === "flag" || actionType === "suspend";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-5"
        style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div>
          <h3 className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
            {actionType === "approve"  ? "Approve Experience" :
             actionType === "flag"     ? "Flag Experience" : "Suspend Experience"}
          </h3>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {actionType === "approve" && `Approve "${exp.title}"? It will go live on the platform.`}
            {actionType === "flag"    && `Flag "${exp.title}" for review.`}
            {actionType === "suspend" && `Suspend "${exp.title}"? It will be hidden from travellers.`}
          </p>
        </div>
        {needsReason && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-text-muted)" }}>
              Reason <span style={{ color: "var(--color-terracotta)" }}>*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason…"
              className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
              style={{
                background: "var(--color-cream)",
                border: "1.5px solid var(--color-border-soft)",
                color: "var(--color-text-dark)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-forest)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border-soft)")}
            />
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
            disabled={submitting || (needsReason && !reason.trim())}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all hover:brightness-95"
            style={{
              background: actionType === "approve" ? "var(--color-forest)" : "var(--color-terracotta)",
              color: "white",
            }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Confirm
          </button>
          <button onClick={onCancel} disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:bg-black/5 disabled:opacity-60"
            style={{ border: "1px solid var(--color-border-soft)", color: "var(--color-text-muted)" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Experience row ── */
function ExperienceRow({ exp, index, onAction }) {
  const ref = useRef(null);
  const ss = STATUS_STYLE[exp.status] || STATUS_STYLE.live;
  const cs = CAT_STYLE[exp.category] || CAT_STYLE.Cultural;

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", delay: 0.1 + index * 0.03 }
    );
  }, []);

  const location = [exp.village, exp.state].filter(Boolean).join(", ") || exp.location || "—";
  const rating   = parseFloat(exp.avg_rating) || null;
  const price    = parseFloat(exp.price_per_person) || null;
  const duration = exp.duration_days
    ? `${exp.duration_days}d`
    : null;

  return (
    <tr ref={ref} className="group transition-colors duration-150"
      style={{ borderBottom: "1px solid var(--color-border-soft)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-cream-mid)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Experience */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
            style={{ background: "var(--color-cream-mid)" }}>
            {exp.cover_image_url
              ? <img src={exp.cover_image_url} alt={exp.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <Compass size={16} style={{ color: "var(--color-text-muted)" }} />
                </div>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate max-w-52" style={{ color: "var(--color-text-dark)" }}>
              {exp.title}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {exp.id} · {exp.host_name || exp.community_name || "—"}
            </p>
          </div>
        </div>
      </td>
      {/* Category */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cs.bg, color: cs.color }}>
          {exp.category || "Cultural"}
        </span>
      </td>
      {/* Location */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <MapPin size={11} />{location}
        </span>
      </td>
      {/* Status */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.dot }} />
          <span className="text-[11px] font-bold" style={{ color: ss.color }}>{ss.label}</span>
        </div>
      </td>
      {/* Rating */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        {rating ? (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-text-dark)" }}>
            <Star size={11} fill="var(--color-amber)" color="var(--color-amber)" />
            {rating.toFixed(1)}
            <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
              ({exp.review_count || 0})
            </span>
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>No ratings</span>
        )}
      </td>
      {/* Price */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        {price ? (
          <>
            <span className="text-xs font-semibold" style={{ color: "var(--color-forest-deep)" }}>
              ₹{price.toLocaleString()}
            </span>
            {duration && (
              <span className="text-xs ml-1" style={{ color: "var(--color-text-muted)" }}>
                · {duration}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>—</span>
        )}
      </td>
      {/* Bookings */}
      <td className="px-4 py-3.5 hidden xl:table-cell">
        <span className="text-xs font-semibold" style={{ color: "var(--color-text-dark)" }}>
          {exp.booking_count ?? "—"}
        </span>
      </td>
      {/* Reports */}
      <td className="px-4 py-3.5">
        {exp.report_count > 0 ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#FEF2F2", color: "var(--color-terracotta)" }}>
            {exp.report_count}
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>—</span>
        )}
      </td>
      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {exp.status === "under_review" && (
            <button title="Approve" onClick={() => onAction("approve", exp)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
              style={{ color: "var(--color-forest)" }}>
              <CheckCircle size={14} />
            </button>
          )}
          {(exp.status === "live" || exp.status === "under_review") && (
            <button title="Flag" onClick={() => onAction("flag", exp)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
              style={{ color: "#F59E0B" }}>
              <Flag size={14} />
            </button>
          )}
          {(exp.status === "flagged" || exp.status === "under_review") && (
            <button title="Suspend" onClick={() => onAction("suspend", exp)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
              style={{ color: "var(--color-terracotta)" }}>
              <XCircle size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function MonitorExperiences() {
  const headerRef = useRef(null);

  const [experiences, setExperiences]   = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]               = useState(null);

  const [search, setSearch]                 = useState("");
  const [statusFilter, setStatusFilter]     = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [modal, setModal]         = useState(null); // { type, exp }
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  /* ── Fetch stats ── */
  useEffect(() => {
    setStatsLoading(true);
    securityService.getStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  /* ── Fetch experiences ── */
  const fetchExperiences = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (statusFilter !== "all")   params.set("status", statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (search)                   params.set("search", search);

    securityService.getAllExperiences(params.toString())
      .then((res) => {
        const list = res?.data?.experiences ?? res?.data ?? [];
        setExperiences(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err?.response?.data?.message ?? "Failed to load experiences."))
      .finally(() => setLoading(false));
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchExperiences, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchExperiences]);

  /* ── Actions ── */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirm = async (reason) => {
    if (!modal) return;
    setSubmitting(true);
    try {
      const { type, exp } = modal;
      if (type === "approve") await securityService.approveExperience(exp.id);
      if (type === "flag")    await securityService.flagExperience(exp.id, reason);
      if (type === "suspend") await securityService.suspendExperience(exp.id, reason);

      showToast(
        type === "approve" ? `"${exp.title}" is now live.` :
        type === "flag"    ? `"${exp.title}" flagged for review.` :
                             `"${exp.title}" has been suspended.`
      );
      setModal(null);
      fetchExperiences();
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Action failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Derived stats ── */
  const statCards = [
    { label: "Total Experiences", value: stats?.total_experiences,    delta: stats?.exp_delta,      icon: Compass,       color: "var(--color-forest)" },
    { label: "Live Now",          value: stats?.live_experiences,      delta: stats?.live_delta,     icon: TrendingUp,    color: "#10B981" },
    { label: "Under Review",      value: stats?.review_experiences,    delta: null,                  icon: Clock,         color: "#6366F1" },
    { label: "Flagged",           value: stats?.flagged_experiences,   delta: null,                  icon: AlertOctagon,  color: "var(--color-terracotta)" },
  ];

  const CATEGORIES = ["Cultural", "Eco", "Adventure", "Wellness", "Culinary"];

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: "var(--color-cream)" }}>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
          style={{ background: "var(--color-forest)", color: "white" }}>
          {toast}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <ConfirmModal
          exp={modal.exp}
          actionType={modal.type}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          submitting={submitting}
        />
      )}

      {/* ── Header ── */}
      <div ref={headerRef} className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
              Monitor Experiences
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Oversee listings, review flags, and manage experience quality across the platform.
            </p>
          </div>
          <button
            onClick={fetchExperiences}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:brightness-95 disabled:opacity-60"
            style={{ background: "var(--color-forest)", color: "white" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => <StatCard key={s.label} {...s} loading={statsLoading} />)}
      </div>

      {/* ── Table card ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-cream-light)",
          border: "1px solid var(--color-border-soft)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Toolbar */}
        <div className="px-5 py-4 flex flex-wrap items-center gap-3"
          style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3.5 py-2 rounded-xl"
            style={{ background: "var(--color-cream)", border: "1px solid var(--color-border-soft)" }}>
            <Search size={14} style={{ color: "var(--color-text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, host, ID…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--color-text-dark)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: "var(--color-text-muted)" }}>×</button>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
            style={{ background: "var(--color-cream)", border: "1px solid var(--color-border-soft)" }}>
            <Filter size={13} style={{ color: "var(--color-text-muted)" }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none text-sm appearance-none pr-4"
              style={{ color: "var(--color-text-dark)" }}>
              <option value="all">All Status</option>
              <option value="live">Live</option>
              <option value="under_review">Under Review</option>
              <option value="flagged">Flagged</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown size={12} style={{ color: "var(--color-text-muted)" }} />
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
            style={{ background: "var(--color-cream)", border: "1px solid var(--color-border-soft)" }}>
            <Leaf size={13} style={{ color: "var(--color-text-muted)" }} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent outline-none text-sm appearance-none pr-4"
              style={{ color: "var(--color-text-dark)" }}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} style={{ color: "var(--color-text-muted)" }} />
          </div>
          {!loading && (
            <span className="ml-auto text-xs" style={{ color: "var(--color-text-muted)" }}>
              {experiences.length} experiences
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}>
            <AlertOctagon size={14} /> {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
                {[
                  { h: "Experience", cls: "px-5" },
                  { h: "Category",   cls: "px-4 hidden sm:table-cell" },
                  { h: "Location",   cls: "px-4 hidden md:table-cell" },
                  { h: "Status",     cls: "px-4" },
                  { h: "Rating",     cls: "px-4 hidden lg:table-cell" },
                  { h: "Price",      cls: "px-4 hidden lg:table-cell" },
                  { h: "Bookings",   cls: "px-4 hidden xl:table-cell" },
                  { h: "Reports",    cls: "px-4" },
                  { h: "",           cls: "px-4" },
                ].map(({ h, cls }) => (
                  <th key={h} className={`py-3 text-left text-[11px] font-semibold uppercase tracking-widest ${cls}`}
                    style={{ color: "var(--color-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : experiences.length > 0
                  ? experiences.map((exp, i) => (
                      <ExperienceRow key={exp.id} exp={exp} index={i}
                        onAction={(type, e) => setModal({ type, exp: e })} />
                    ))
                  : (
                    <tr>
                      <td colSpan={9} className="text-center py-16">
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                          No experiences match your filters.
                        </p>
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between text-xs"
          style={{ borderTop: "1px solid var(--color-border-soft)", color: "var(--color-text-muted)" }}>
          <span>{loading ? "Loading…" : `${experiences.length} experiences loaded`}</span>
          <span>Filters: {statusFilter} · {categoryFilter}</span>
        </div>
      </div>
    </div>
  );
}