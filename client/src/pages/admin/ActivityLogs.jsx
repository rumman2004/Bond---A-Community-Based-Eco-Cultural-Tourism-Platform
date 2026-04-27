import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, Settings, RefreshCw, Lock, Unlock, CheckCircle, XCircle, Edit, Pin, ArrowLeft, ArrowRight } from "lucide-react";
import PageShell from "../PageShell";
import api from "../../services/api";

const ACTION_LABELS = {
  user_status_changed: "User Status Changed",
  user_role_changed:   "User Role Changed",
  user_suspended:      "User Suspended",
  user_unsuspended:    "User Reinstated",
  community_verified:  "Community Verified",
  community_rejected:  "Community Rejected",
  user_profile_updated: "Profile Updated",
};

const ACTION_ICONS = {
  user_status_changed:  <Settings size={18} />,
  user_role_changed:    <RefreshCw size={18} />,
  user_suspended:       <Lock size={18} />,
  user_unsuspended:     <Unlock size={18} />,
  community_verified:   <CheckCircle size={18} />,
  community_rejected:   <XCircle size={18} />,
  user_profile_updated: <Edit size={18} />,
};

const ACTION_COLORS = {
  user_status_changed:  { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  user_role_changed:    { bg: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce" },
  user_suspended:       { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
  user_unsuspended:     { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  community_verified:   { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  community_rejected:   { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
  user_profile_updated: { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" },
};

const DEFAULT_COLOR = { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ActivityLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/logs?page=${page}&limit=20`)
      .then((res) => {
        const data = res.data?.logs ?? [];
        setLogs(data);
        setHasMore(data.length === 20);
      })
      .catch(() => setError("Failed to load activity logs."))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <PageShell title="Activity Logs" subtitle="Audit trail of recent platform events.">

      {/* ── Loading skeleton ─────────────────────────────────────── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              height: "68px", borderRadius: "12px",
              background: "linear-gradient(90deg, #f5ede0 25%, #fdf5ea 50%, #f5ede0 75%)",
              backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
              animationDelay: `${i * 0.06}s`,
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

      {/* ── Empty ────────────────────────────────────────────────── */}
      {!loading && !error && logs.length === 0 && (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          color: "#8a7560", fontSize: "14px",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", opacity: 0.3 }}>
            <ClipboardList size={48} />
          </div>
          No activity logs found.
        </div>
      )}

      {/* ── Log entries ──────────────────────────────────────────── */}
      {!loading && !error && logs.length > 0 && (
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div style={{
            position: "absolute", left: "19px", top: "8px",
            bottom: "8px", width: "2px",
            background: "linear-gradient(to bottom, #e8d9c4, #f5ede0)",
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {logs.map((log, idx) => {
              const colors = ACTION_COLORS[log.action] ?? DEFAULT_COLOR;
              const icon   = ACTION_ICONS[log.action]  ?? <Pin size={18} />;
              const label  = ACTION_LABELS[log.action] ?? log.action;

              return (
                <div
                  key={log.id}
                  style={{
                    display: "flex", gap: "16px", alignItems: "flex-start",
                    animation: `fadeIn 0.2s ease ${idx * 0.03}s both`,
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    flexShrink: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px",
                    background: colors.bg, border: `2px solid ${colors.border}`,
                    position: "relative", zIndex: 1,
                  }}>
                    {icon}
                  </div>

                  {/* Card */}
                  <div style={{
                    flex: 1, background: "#fff",
                    border: `1px solid #e8d9c4`,
                    borderRadius: "12px", padding: "12px 16px",
                    marginBottom: "4px",
                    transition: "box-shadow 0.15s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 10px", borderRadius: "999px",
                          fontSize: "11px", fontWeight: "600",
                          background: colors.bg, color: colors.text,
                          border: `1px solid ${colors.border}`,
                          marginBottom: "6px",
                        }}>
                          {label}
                        </span>
                        {log.actor_name && (
                          <p style={{ fontSize: "13px", color: "#1a150f" }}>
                            <span style={{ fontWeight: "500" }}>{log.actor_name}</span>
                            <span style={{ color: "#8a7560", fontSize: "12px" }}> · {log.actor_email}</span>
                          </p>
                        )}
                        {log.entity_type && log.entity_id && (
                          <p style={{ fontSize: "11px", color: "#a89070", marginTop: "3px" }}>
                            Target: {log.entity_type} #{String(log.entity_id).slice(0, 8)}…
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "12px", color: "#8a7560", whiteSpace: "nowrap" }}>
                          {formatRelativeTime(log.created_at)}
                        </p>
                        <p style={{ fontSize: "10px", color: "#bba88a", whiteSpace: "nowrap", marginTop: "2px" }}>
                          {new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      {!loading && (logs.length > 0 || page > 1) && (
        <div style={{
          display: "flex", gap: "10px", marginTop: "28px",
          paddingTop: "20px", borderTop: "1px solid #e8d9c4",
          justifyContent: "center",
        }}>
          {page > 1 && (
            <button
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: "8px 20px", borderRadius: "10px", fontSize: "13px",
                fontWeight: "500", border: "1.5px solid #e8d9c4",
                background: "#fffdf8", color: "#5a4a35", cursor: "pointer",
              }}
            >
              <ArrowLeft size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Previous
            </button>
          )}
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: "8px 20px", borderRadius: "10px", fontSize: "13px",
                fontWeight: "500", border: "1.5px solid #e8d9c4",
                background: "#fffdf8", color: "#5a4a35", cursor: "pointer",
              }}
            >
              Next <ArrowRight size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: "4px" }} />
            </button>
          )}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </PageShell>
  );
}