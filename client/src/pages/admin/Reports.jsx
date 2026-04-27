import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, User, Shield, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import PageShell from "../PageShell";
import api from "../../services/api";

const STATUS_META = {
  open:         { label: "Open",         bg: "#fef2f2", text: "#dc2626", dot: "#dc2626", border: "#fecaca" },
  under_review: { label: "Under Review", bg: "#fffbeb", text: "#d97706", dot: "#f59e0b", border: "#fde68a" },
  resolved:     { label: "Resolved",     bg: "#f0fdf4", text: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
  dismissed:    { label: "Dismissed",    bg: "#f8fafc", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0" },
};

const DEFAULT_META = { label: "Unknown", bg: "#f8fafc", text: "#475569", dot: "#94a3b8", border: "#e2e8f0" };

const SEVERITY_COLORS = {
  critical: { bg: "#fef2f2", text: "#991b1b" },
  high:     { bg: "#fff7ed", text: "#c2410c" },
  medium:   { bg: "#fffbeb", text: "#92400e" },
  low:      { bg: "#f0fdf4", text: "#15803d" },
};

const StatusPill = ({ status }) => {
  const m = STATUS_META[status] ?? DEFAULT_META;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "999px",
      fontSize: "11px", fontWeight: "600",
      background: m.bg, color: m.text, border: `1px solid ${m.border}`,
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.dot }} />
      {m.label}
    </span>
  );
};

const ActionBtn = ({ children, onClick, disabled, variant = "default" }) => {
  const [hover, setHover] = useState(false);
  const styles = {
    default: { color: "#1a2e1a", hoverBg: "#f0fdf4" },
    dismiss: { color: "#64748b", hoverBg: "#f1f5f9" },
    resolve: { color: "#15803d", hoverBg: "#f0fdf4" },
    review:  { color: "#1d4ed8", hoverBg: "#eff6ff" },
  };
  const s = styles[variant] ?? styles.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "5px 14px", borderRadius: "8px",
        fontSize: "12px", fontWeight: "500",
        border: `1px solid ${hover ? "transparent" : "#e8d9c4"}`,
        background: hover && !disabled ? s.hoverBg : "transparent",
        color: s.color, opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s, border-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
};

export default function Reports() {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("open");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 20;

  const fetchReports = (currentFilter = filter, currentPage = page) => {
    setLoading(true);
    setError(null);
    api.get(`/reports?${new URLSearchParams({ status: currentFilter, page: currentPage, limit })}`)
      .then((res) => {
        setReports(res.data?.reports ?? []);
        setTotal(res.data?.pagination?.total ?? 0);
      })
      .catch(() => setError("Failed to load reports."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(filter, page); }, [filter, page]);

  const handleFilterChange = (s) => { setFilter(s); setPage(1); };

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      await api.patch(`/reports/${id}/${action}`, {});
      fetchReports();
    } catch {
      alert(`Failed to ${action} report.`);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <PageShell title="Reports" subtitle="Review and action escalated platform reports.">

      {/* ── Status filter tabs ───────────────────────────────────── */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "24px",
        background: "#fef9f0", padding: "4px", borderRadius: "12px",
        border: "1px solid #e8d9c4", width: "fit-content",
      }}>
        {Object.entries(STATUS_META).map(([s, meta]) => {
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              style={{
                padding: "7px 16px", borderRadius: "9px",
                fontSize: "12px", fontWeight: "600",
                border: "none", cursor: "pointer",
                background: active ? "#1a2e1a" : "transparent",
                color: active ? "#fff" : "#8a7560",
                transition: "background 0.15s, color 0.15s",
                display: "flex", alignItems: "center", gap: "5px",
              }}
            >
              <span style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: active ? "#fff" : meta.dot,
                opacity: active ? 0.7 : 1,
              }} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* ── Result count ─────────────────────────────────────────── */}
      {!loading && !error && (
        <p style={{ fontSize: "12px", color: "#8a7560", marginBottom: "12px" }}>
          {total > 0
            ? `${total} report${total !== 1 ? "s" : ""} · showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)}`
            : `No ${STATUS_META[filter]?.label?.toLowerCase()} reports`}
        </p>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              height: "100px", borderRadius: "14px",
              background: "linear-gradient(90deg, #f5ede0 25%, #fdf5ea 50%, #f5ede0 75%)",
              backgroundSize: "200% 100%", animation: `shimmer 1.4s infinite`,
              animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: "12px", padding: "16px",
          color: "#dc2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* ── Reports list ─────────────────────────────────────────── */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {reports.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#8a7560" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", opacity: 0.3 }}><ClipboardList size={48} /></div>
              <p style={{ fontSize: "14px" }}>No {STATUS_META[filter]?.label?.toLowerCase()} reports.</p>
            </div>
          )}

          {reports.map((report) => {
            const sevColors = SEVERITY_COLORS[report.severity?.toLowerCase()] ?? null;
            return (
              <div
                key={report.id}
                style={{
                  background: "#fff", border: "1px solid #e8d9c4",
                  borderRadius: "14px", padding: "18px 20px",
                  display: "flex", flexWrap: "wrap", gap: "16px",
                  alignItems: "flex-start", justifyContent: "space-between",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Content */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <StatusPill status={report.status} />

                    {report.entity_type || report.reported_type ? (
                      <span style={{
                        padding: "3px 10px", borderRadius: "999px",
                        fontSize: "11px", fontWeight: "500",
                        background: "#f8fafc", color: "#64748b",
                        border: "1px solid #e2e8f0",
                        textTransform: "capitalize",
                      }}>
                        {report.entity_type ?? report.reported_type}
                      </span>
                    ) : null}

                    {report.severity && sevColors && (
                      <span style={{
                        padding: "3px 10px", borderRadius: "999px",
                        fontSize: "11px", fontWeight: "700",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        background: sevColors.bg, color: sevColors.text,
                        border: `1px solid ${sevColors.bg}`,
                      }}>
                        {report.severity}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#1a150f", marginBottom: "5px" }}>
                    {report.reason}
                  </p>

                  {report.description && (
                    <p style={{
                      fontSize: "12px", color: "#8a7560", marginBottom: "8px",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {report.description}
                    </p>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {report.reporter_name && (
                      <span style={{ fontSize: "11px", color: "#a89070", display: "flex", alignItems: "center", gap: "4px" }}>
                        <User size={12} /> {report.reporter_name}
                      </span>
                    )}
                    {report.assigned_to_name && (
                      <span style={{ fontSize: "11px", color: "#a89070", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Shield size={12} /> {report.assigned_to_name}
                      </span>
                    )}
                    <span style={{ fontSize: "11px", color: "#a89070", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {new Date(report.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{
                  display: "flex", flexDirection: "column", gap: "6px",
                  flexShrink: 0, alignItems: "stretch",
                }}>
                  {report.status === "open" && (
                    <>
                      <ActionBtn variant="review"   disabled={actionLoading === report.id} onClick={() => handleAction(report.id, "assign")}>
                        Take &amp; Review
                      </ActionBtn>
                      <ActionBtn variant="resolve"  disabled={actionLoading === report.id} onClick={() => handleAction(report.id, "resolve")}>
                        Resolve
                      </ActionBtn>
                      <ActionBtn variant="dismiss"  disabled={actionLoading === report.id} onClick={() => handleAction(report.id, "dismiss")}>
                        Dismiss
                      </ActionBtn>
                    </>
                  )}
                  {report.status === "under_review" && (
                    <>
                      <ActionBtn variant="resolve"  disabled={actionLoading === report.id} onClick={() => handleAction(report.id, "resolve")}>
                        Resolve
                      </ActionBtn>
                      <ActionBtn variant="dismiss"  disabled={actionLoading === report.id} onClick={() => handleAction(report.id, "dismiss")}>
                        Dismiss
                      </ActionBtn>
                    </>
                  )}
                  {actionLoading === report.id && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                      <div style={{
                        width: "14px", height: "14px", borderRadius: "50%",
                        border: "2px solid #e8d9c4", borderTopColor: "#4a6741",
                        animation: "spin 0.7s linear infinite",
                      }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      {!loading && total > limit && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #e8d9c4",
        }}>
          <p style={{ fontSize: "12px", color: "#8a7560" }}>Page {page} of {totalPages}</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "Prev", icon: <ArrowLeft size={16} style={{ marginRight: "4px" }} />, disabled: page === 1,         action: () => setPage(p => p - 1) },
              { label: "Next", icon: <ArrowRight size={16} style={{ marginLeft: "4px" }} />, disabled: page >= totalPages,  action: () => setPage(p => p + 1) },
            ].map(({ label, disabled, action }) => (
              <button
                key={label}
                disabled={disabled}
                onClick={action}
                style={{
                  padding: "8px 18px", borderRadius: "10px", fontSize: "13px",
                  fontWeight: "500", border: "1.5px solid #e8d9c4",
                  background: disabled ? "transparent" : "#fef9f0",
                  color: disabled ? "#e8d9c4" : "#5a4a35",
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {label === "Prev" && icon}
                  {label}
                  {label === "Next" && icon}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageShell>
  );
}