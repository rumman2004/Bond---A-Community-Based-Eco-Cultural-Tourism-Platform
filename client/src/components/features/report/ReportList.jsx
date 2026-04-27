import { useRef, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle, XCircle, Loader2, User } from "lucide-react";
import { gsap } from "gsap";
import { formatDateTime } from "../../../utils/dateUtils";

// Backend report fields from reportController.getReports:
// r.id, r.entity_type, r.entity_id, r.reason, r.description
// r.severity, r.status, r.created_at, r.resolved_at, r.resolution_note
// r.reporter_name, r.reporter_email, r.assigned_to_name

const STATUS_CONFIG = {
  open:         { label: "Open",         icon: <Clock size={12} />,        bg: "bg-[#FFF8EE]", text: "text-[#C8883A]",  dot: "bg-[#C8883A]" },
  under_review: { label: "Under review", icon: <Loader2 size={12} />,      bg: "bg-[#EBF5EF]", text: "text-[#2A5940]",  dot: "bg-[#3E7A58]" },
  resolved:     { label: "Resolved",     icon: <CheckCircle size={12} />,  bg: "bg-[#F2EDE4]", text: "text-[#1C3D2E]",  dot: "bg-[#C8883A]" },
  dismissed:    { label: "Dismissed",    icon: <XCircle size={12} />,      bg: "bg-[#FAF7F2]", text: "text-[#7A9285]",  dot: "bg-[#D9D0C2]" },
};

const SEVERITY_COLOR = {
  low:      "bg-[#EBF5EF] text-[#2A5940]",
  medium:   "bg-[#FFF8EE] text-[#C8883A]",
  high:     "bg-[#FFF0EC] text-[#D4735A]",
  critical: "bg-[#D4735A] text-white",
};

export default function ReportList({ reports = [], loading = false, onAssign, onResolve, onDismiss, showActions = false }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!reports.length || !listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(listRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" }
      );
    }, listRef);
    return () => ctx.revert();
  }, [reports]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-[14px] border border-[#E8E1D5] bg-white p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-48 rounded bg-[#E8E1D5]" />
              <div className="h-5 w-20 rounded-full bg-[#E8E1D5]" />
            </div>
            <div className="h-3 w-full rounded bg-[#E8E1D5]" />
            <div className="h-3 w-3/4 rounded bg-[#E8E1D5]" />
          </div>
        ))}
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#D9D0C2] bg-[#FAF7F2] py-16 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F2EDE4]">
          <AlertTriangle size={24} className="text-[#7A9285]" />
        </div>
        <h3 className="font-semibold text-[#1A2820]" style={{ fontFamily: "var(--font-sans)" }}>No reports found</h3>
        <p className="mt-1 text-sm text-[#7A9285]">Reports will appear here once submitted.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="space-y-3">
      {reports.map((report) => {
        const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.open;
        return (
          <div
            key={report.id}
            className="rounded-[14px] border border-[#D9D0C2] bg-white overflow-hidden shadow-card"
          >
            {/* Severity bar */}
            <div className={`h-0.5 w-full ${
              report.severity === "critical" ? "bg-[#D4735A]" :
              report.severity === "high"     ? "bg-[#EBB8AA]" :
              report.severity === "medium"   ? "bg-[#C8883A]" :
              "bg-[#A8CCBA]"
            }`} />

            <div className="p-5">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${SEVERITY_COLOR[report.severity] || SEVERITY_COLOR.medium}`}>
                      {report.severity}
                    </span>
                    <span className="text-xs text-[#7A9285] capitalize">
                      {report.entity_type} report
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#1A2820] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                    {report.reason}
                  </h3>
                </div>

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Description */}
              {report.description && (
                <p className="mt-2 text-sm text-[#3D5448] line-clamp-2 leading-relaxed">{report.description}</p>
              )}

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#7A9285]">
                {report.reporter_name && (
                  <span className="flex items-center gap-1"><User size={11} /> {report.reporter_name}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {report.created_at ? formatDateTime(report.created_at) : "Recently"}
                </span>
                {report.assigned_to_name && (
                  <span className="text-[#3E7A58]">Assigned to {report.assigned_to_name}</span>
                )}
              </div>

              {/* Resolution note */}
              {report.resolution_note && (
                <div className="mt-3 rounded-[9px] bg-[#FAF7F2] border border-[#E8E1D5] px-3 py-2">
                  <p className="text-xs font-medium text-[#3D5448] mb-0.5">Resolution note</p>
                  <p className="text-xs text-[#7A9285]">{report.resolution_note}</p>
                </div>
              )}

              {/* Action buttons (security team) */}
              {showActions && report.status === "open" && (
                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-[#F2EDE4]">
                  {onAssign && (
                    <button
                      onClick={() => onAssign(report.id)}
                      className="rounded-[9px] border border-[#D9D0C2] px-3 py-1.5 text-xs font-medium text-[#3D5448] hover:bg-[#FAF7F2] transition"
                    >
                      Assign to me
                    </button>
                  )}
                  {onResolve && (
                    <button
                      onClick={() => onResolve(report.id)}
                      className="rounded-[9px] bg-[#1C3D2E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2A5940] transition"
                    >
                      Resolve
                    </button>
                  )}
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(report.id)}
                      className="rounded-[9px] border border-[#D9D0C2] px-3 py-1.5 text-xs font-medium text-[#7A9285] hover:bg-[#FAF7F2] transition"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}