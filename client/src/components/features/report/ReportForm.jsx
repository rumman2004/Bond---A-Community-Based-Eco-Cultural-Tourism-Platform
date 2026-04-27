import { useState, useRef, useEffect } from "react";
import { AlertTriangle, FileText, Tag, Link2 } from "lucide-react";
import { gsap } from "gsap";
import reportService from "../../../services/reportService";

// Backend fields from reportController.createReport:
// entity_type: 'community' | 'experience' | 'user' | 'review' | 'story'
// entity_id: UUID of the target
// reason: short reason string
// description: longer details

const ENTITY_TYPES = [
  { value: "community",  label: "Community" },
  { value: "experience", label: "Experience" },
  { value: "user",       label: "User" },
  { value: "review",     label: "Review" },
  { value: "story",      label: "Story" },
];

const REASONS = [
  "Misleading information",
  "Inappropriate content",
  "Fraud or scam",
  "Safety concern",
  "Harassment",
  "Spam",
  "Other",
];

export default function ReportForm({
  // Pre-fill when reporting from a specific page
  defaultEntityType = "",
  defaultEntityId   = "",
  onSuccess,
  onCancel,
}) {
  const formRef    = useRef(null);
  const successRef = useRef(null);
  const [form, setForm] = useState({
    entity_type: defaultEntityType,
    entity_id:   defaultEntityId,
    reason:      "",
    description: "",
  });
  const [loading,  setLoading]  = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" }
      );
    }, formRef);
    return () => ctx.revert();
  }, []);

  const update = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.entity_type) { setError("Please select what you are reporting."); return; }
    if (!form.reason)      { setError("Please select a reason."); return; }

    setLoading(true);
    try {
      // reportService.create → POST /reports
      await reportService.create(form);
      setSubmitted(true);
      gsap.fromTo(successRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
      );
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div ref={successRef} className="flex flex-col items-center justify-center rounded-[14px] border border-[#5C8C72]/30 bg-[#EBF5EF] px-6 py-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#3E7A58]/10">
          <AlertTriangle size={26} className="text-[#3E7A58]" />
        </div>
        <h3 className="font-semibold text-[#1C3D2E]" style={{ fontFamily: "var(--font-sans)" }}>
          Report submitted
        </h3>
        <p className="mt-2 text-sm text-[#3D5448]">
          Our security team will review this and take appropriate action.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Warning header */}
      <div className="flex items-start gap-3 rounded-[9px] bg-[#FFF8EE] border border-[#C8883A]/30 px-4 py-3">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#C8883A]" />
        <p className="text-sm text-[#C8883A]">
          Reports are taken seriously. Please only submit if you genuinely believe there is a violation.
        </p>
      </div>

      {/* Entity type */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          <span className="flex items-center gap-1.5"><Tag size={12} /> What are you reporting?</span>
        </label>
        <select
          name="entity_type"
          value={form.entity_type}
          onChange={update}
          required
          className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
        >
          <option value="">Select type…</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Entity ID — only shown if not pre-filled */}
      {!defaultEntityId && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
            <span className="flex items-center gap-1.5"><Link2 size={12} /> ID of the item being reported</span>
          </label>
          <input
            type="text"
            name="entity_id"
            value={form.entity_id}
            onChange={update}
            placeholder="Paste the UUID or URL of the item…"
            required
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm font-mono text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
          />
        </div>
      )}

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          Reason
        </label>
        <select
          name="reason"
          value={form.reason}
          onChange={update}
          required
          className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
        >
          <option value="">Select reason…</option>
          {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          <span className="flex items-center gap-1.5"><FileText size={12} /> Additional details</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={update}
          rows={4}
          placeholder="Describe the issue in detail. Include dates, links, or screenshots if relevant…"
          className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-[9px] bg-[#FFF0EC] border border-[#D4735A]/30 px-3 py-2 text-sm text-[#D4735A]">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[9px] border border-[#D9D0C2] py-2.5 text-sm font-medium text-[#3D5448] hover:bg-[#FAF7F2] transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-[9px] bg-[#D4735A] py-2.5 text-sm font-semibold text-white hover:bg-[#C8603F] transition disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Submit report"}
        </button>
      </div>
    </form>
  );
}