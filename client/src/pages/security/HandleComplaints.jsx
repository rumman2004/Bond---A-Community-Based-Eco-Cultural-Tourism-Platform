import { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldAlert,
  Info,
  UserX,
  ArrowRight,
  ShieldCheck,
  Search,
  X,
} from "lucide-react";
import securityService from "../../services/securityService";
import api from "../../services/api";

const STATUS_CONFIG = {
  open: { label: "Open", bg: "#FEF3C7", color: "#92400E", icon: ShieldAlert },
  under_review: { label: "In Review", bg: "#EFF6FF", color: "#1D4ED8", icon: Search },
  resolved: { label: "Resolved", bg: "var(--color-forest-pale)", color: "var(--color-forest)", icon: ShieldCheck },
  dismissed: { label: "Dismissed", bg: "#F3F4F6", color: "#6B7280", icon: Info },
};

const REASON_ICONS = {
  misleading: { icon: Info, color: "#3B82F6" },
  safety: { icon: ShieldAlert, color: "var(--color-terracotta)" },
  scam: { icon: UserX, color: "#EF4444" },
  other: { icon: AlertTriangle, color: "#F59E0B" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function ReportCard({ report, onStatusChange, onInspectCommunity }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { id, reason, description, status, created_at, reporter_name, reported_name } = report;
  const reasonCfg = REASON_ICONS[reason?.toLowerCase()] ?? REASON_ICONS.other;
  const ReasonIcon = reasonCfg.icon;

  const age = created_at
    ? Math.floor((Date.now() - new Date(created_at)) / 86400000)
    : null;

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const actionMap = {
        "under_review": "assign",
        "resolved":  "resolve",
        "dismissed": "dismiss",
      };
      const action = actionMap[newStatus];
      if (!action) throw new Error(`Unknown status: ${newStatus}`);
      await api.patch(`/reports/${id}/${action}`, {});
      onStatusChange(id, newStatus);
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={`group rounded-2xl border transition-all duration-300 ${expanded ? 'shadow-lg border-forest/20' : 'hover:shadow-md border-border-soft'}`}
      style={{ backgroundColor: "var(--color-white)" }}
    >
      <button
        className="w-full flex items-center gap-5 px-6 py-5 text-left transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${reasonCfg.color}15`, color: reasonCfg.color }}
        >
          <ReasonIcon size={20} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold capitalize text-text-dark truncate">
              {reason || "General Issue"}
            </h3>
            <StatusBadge status={status} />
          </div>
          
          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <span className="font-medium text-text-mid">{reporter_name}</span>
            <span>reported</span>
            <span className="font-bold text-forest">{reported_name || "Community"}</span>
            {age !== null && (
              <span className="ml-auto flex items-center gap-1 opacity-60">
                <Clock size={12} />
                {age === 0 ? "Just now" : `${age}d ago`}
              </span>
            )}
          </div>
        </div>

        <div className={`p-1.5 rounded-full bg-cream transition-transform duration-300 ${expanded ? 'rotate-180 bg-forest/10 text-forest' : 'text-text-muted'}`}>
          <ChevronDown size={18} />
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
          <div className="h-[1px] w-full bg-border-soft mb-5" />
          
          <div className="space-y-4">
            <div className="bg-cream-light p-4 rounded-xl border border-border-soft/50">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Report Details</p>
              <p className="text-sm leading-relaxed text-text-mid italic">
                "{description || "No additional details provided."}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                {status === "open" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatus("under_review"); }}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    Begin Review
                  </button>
                )}
                
                {status !== "resolved" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatus("resolved"); }}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-forest text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    Resolve
                  </button>
                )}

                {status !== "dismissed" && status !== "resolved" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatus("dismissed"); }}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-border-soft text-text-muted hover:bg-black/5 transition-colors disabled:opacity-50"
                  >
                    Dismiss Report
                  </button>
                )}
              </div>
          </div>
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

  useEffect(() => {
    securityService
      .getReports()
      .then((res) => setReports(res.data?.reports ?? []))
      .catch(() => setError("Unable to reach security systems."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
  };

  const stats = useMemo(() => {
    return {
      open: reports.filter(r => r.status === "open").length,
      under_review: reports.filter(r => r.status === "under_review").length,
      resolved: reports.filter(r => r.status === "resolved").length,
    };
  }, [reports]);

  const filters = ["open", "under_review", "resolved", "dismissed"];
  const filtered = reports.filter((r) => r.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-text-dark font-display">
          Incident Response
        </h1>
        <p className="text-base text-text-muted">
          Manage and resolve platform reports to ensure community safety.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "New Alerts", count: stats.open, color: "var(--color-terracotta)", bg: "#FFF5F5", icon: ShieldAlert },
          { label: "Active Investigations", count: stats.under_review, color: "#3B82F6", bg: "#F0F7FF", icon: Search },
          { label: "Resolved Cases", count: stats.resolved, color: "var(--color-forest)", bg: "#F2F9F2", icon: ShieldCheck },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-3xl border border-border-soft flex items-center justify-between group hover:border-forest/20 transition-all cursor-default">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-text-dark">{stat.count}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Navigation & Filters */}
        <div className="flex items-center justify-between border-b border-border-soft pb-4">
          <div className="flex gap-4">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative px-2 py-2 text-sm font-bold capitalize transition-all duration-200 ${
                  filter === f ? "text-forest" : "text-text-muted hover:text-text-dark"
                }`}
              >
                {f.replace("_", " ")}
                {filter === f && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest rounded-full" />
                )}
                {reports.filter(r => r.status === f).length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-black/5 rounded-md text-[10px] text-text-muted">
                    {reports.filter(r => r.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List Logic */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-3xl animate-pulse bg-border-soft/20" />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center bg-red-50 rounded-3xl border border-red-100">
              <ShieldAlert size={40} className="mx-auto text-terracotta mb-4" />
              <p className="text-text-dark font-bold">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-sm text-terracotta underline">Retry Connection</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 bg-cream-light rounded-3xl border border-dashed border-border-soft">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Inbox size={24} className="text-text-muted opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text-dark">All clear!</p>
                <p className="text-sm text-text-muted">No {filter.replace("_", " ")} reports found.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((r) => (
                <ReportCard 
                  key={r.id} 
                  report={r} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}