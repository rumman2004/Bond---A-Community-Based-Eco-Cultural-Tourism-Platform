import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Inbox,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import securityService from "../../services/securityService";
import api from "../../services/api";

const STATUS_CONFIG = {
  open: { label: "Open", bg: "#FEF3C7", color: "#92400E" },
  "in-review": { label: "In Review", bg: "#EFF6FF", color: "#1D4ED8" },
  resolved: { label: "Resolved", bg: "var(--color-forest-pale)", color: "var(--color-forest)" },
  dismissed: { label: "Dismissed", bg: "#F3F4F6", color: "#6B7280" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function ReportCard({ report, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { id, subject, details, status, created_at, reporter_name, reported_name } = report;

  const age = created_at
    ? Math.floor((Date.now() - new Date(created_at)) / 86400000)
    : null;

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      // Backend has separate action routes: /assign (→ under_review), /resolve, /dismiss
      // There is no generic /status route.
      const actionMap = {
        "in-review": "assign",
        "resolved":  "resolve",
        "dismissed": "dismiss",
      };
      const action = actionMap[newStatus];
      if (!action) throw new Error(`Unknown status: ${newStatus}`);
      await api.patch(`/reports/${id}/${action}`, {});
      onStatusChange(id, newStatus);
    } catch {
      // silent
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Row */}
      <button
        className="w-full flex items-start gap-4 px-6 py-5 text-left hover:bg-black/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: status === "open" ? "#FEF3C7" : "var(--color-forest-pale)" }}
        >
          <AlertTriangle
            size={14}
            strokeWidth={2}
            style={{ color: status === "open" ? "#92400E" : "var(--color-forest)" }}
          />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
              {subject || "Untitled report"}
            </p>
            <StatusBadge status={status} />
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
            {reporter_name && <span>By {reporter_name}</span>}
            {reported_name && <span>· Against {reported_name}</span>}
            {age !== null && (
              <span className="flex items-center gap-1">
                <Clock size={11} strokeWidth={1.8} />
                {age === 0 ? "Today" : `${age}d ago`}
              </span>
            )}
          </div>
        </div>

        {expanded
          ? <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} className="mt-1 shrink-0" />
          : <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} className="mt-1 shrink-0" />
        }
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div
          className="px-6 pb-5 space-y-4 border-t"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          {details && (
            <p className="pt-4 text-sm leading-relaxed" style={{ color: "var(--color-text-mid)" }}>
              {details}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {status !== "in-review" && status !== "resolved" && (
              <button
                onClick={() => handleStatus("in-review")}
                disabled={updating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors hover:brightness-95 disabled:opacity-60"
                style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}
              >
                {updating ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} strokeWidth={2} />}
                Mark In Review
              </button>
            )}
            {status !== "resolved" && (
              <button
                onClick={() => handleStatus("resolved")}
                disabled={updating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors hover:brightness-95 disabled:opacity-60"
                style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)" }}
              >
                {updating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} strokeWidth={2} />}
                Resolve
              </button>
            )}
            {status !== "dismissed" && status !== "resolved" && (
              <button
                onClick={() => handleStatus("dismissed")}
                disabled={updating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-black/5 disabled:opacity-60"
                style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HandleComplaints() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("open");

  const load = () => {
    setLoading(true);
    setError(null);
    securityService
      .getReports()
      .then((res) => setReports(res.data?.reports ?? []))
      .catch(() => setError("Failed to load complaints."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = (id, newStatus) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
  };

  const filters = ["open", "in-review", "resolved", "dismissed"];
  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
          >
            Complaints
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Triage and resolve platform safety reports.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:bg-black/5"
          style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
        >
          <RefreshCw size={13} strokeWidth={1.8} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--color-border-soft)" }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150"
            style={{
              backgroundColor: filter === f ? "var(--color-cream-light)" : "transparent",
              color: filter === f ? "var(--color-text-dark)" : "var(--color-text-muted)",
              boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {f.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
        >
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: "var(--color-border-soft)" }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-16 rounded-2xl"
          style={{ border: "1px dashed var(--color-border-soft)" }}
        >
          <Inbox size={28} style={{ color: "var(--color-text-muted)" }} strokeWidth={1.4} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No {filter} reports.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}