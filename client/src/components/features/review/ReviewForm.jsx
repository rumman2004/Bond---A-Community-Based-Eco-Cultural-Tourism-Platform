import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { gsap } from "gsap";
import RatingStars from "./RatingStars";
import reviewService from "../../../services/reviewService";

// Backend fields from reviewController.createReview:
// booking_id (required — only completed bookings)
// rating (1–5), title (optional), body (required)

export default function ReviewForm({ bookingId, experienceTitle, onSuccess, onCancel }) {
  const formRef    = useRef(null);
  const successRef = useRef(null);
  const [form, setForm]       = useState({ rating: 5, title: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.09, ease: "power3.out" }
      );
    }, formRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.body.trim()) { setError("Please write your review."); return; }
    setError("");
    setLoading(true);
    try {
      // reviewService.create → POST /reviews
      await reviewService.create({
        booking_id: bookingId,
        rating:     form.rating,
        title:      form.title || null,
        body:       form.body,
      });
      setSubmitted(true);
      gsap.fromTo(successRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
      );
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div ref={successRef} className="rounded-[14px] border border-[#5C8C72]/30 bg-[#EBF5EF] px-6 py-8 text-center">
        <p className="text-2xl mb-2">🌿</p>
        <h3 className="font-semibold text-[#1C3D2E]" style={{ fontFamily: "var(--font-sans)" }}>Thank you for your review!</h3>
        <p className="mt-1 text-sm text-[#3D5448]">Your feedback helps other travellers discover great communities.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Context */}
      {experienceTitle && (
        <div className="rounded-[9px] bg-[#FAF7F2] border border-[#E8E1D5] px-4 py-2.5">
          <p className="text-xs text-[#7A9285]">Reviewing</p>
          <p className="text-sm font-semibold text-[#1A2820]">{experienceTitle}</p>
        </div>
      )}

      {/* Star rating */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-2">
          Your rating
        </label>
        <RatingStars
          value={form.rating}
          onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
          size={26}
          showLabel
        />
      </div>

      {/* Title (optional) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          Review title <span className="font-normal normal-case text-[#7A9285]">(optional)</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Summarise your experience…"
          maxLength={200}
          className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          Your review
        </label>
        <textarea
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          rows={5}
          placeholder="Tell others about your experience — what was special, what you loved, what to expect…"
          required
          className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition resize-none"
        />
        <p className="mt-1 text-right text-xs text-[#7A9285]">{form.body.length} chars</p>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-[9px] bg-[#FFF0EC] border border-[#D4735A]/30 px-3 py-2 text-sm text-[#D4735A]">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-[9px] border border-[#D9D0C2] py-2.5 text-sm font-medium text-[#3D5448] hover:bg-[#FAF7F2] transition">
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 rounded-[9px] bg-[#1C3D2E] py-2.5 text-sm font-semibold text-white hover:bg-[#2A5940] transition disabled:opacity-60">
          {loading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : <><Send size={14} /> Post review</>}
        </button>
      </div>
    </form>
  );
}