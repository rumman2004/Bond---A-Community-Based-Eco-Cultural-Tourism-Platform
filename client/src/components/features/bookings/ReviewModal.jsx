import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { X } from "lucide-react";
import ReviewForm from "../review/ReviewForm";

/**
 * ReviewModal
 * Props:
 *   booking   – the booking object (must have .id and .experience_title / .title)
 *   onClose   – called when the modal should be dismissed
 *   onSuccess – called after a review is successfully submitted
 */
export default function ReviewModal({ booking, onClose, onSuccess }) {
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  // Animate in
  useEffect(() => {
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" }
    );
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 32, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.4)" }
    );
  }, []);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const experienceTitle =
    booking.experience_title ?? booking.title ?? booking.experience?.title ?? "Experience";

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(15, 28, 22, 0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-white rounded-[20px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3]">
          <div>
            <h2
              className="text-base font-bold text-[#1A2820]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Rate Your Experience
            </h2>
            <p className="text-xs text-[#9A9285] mt-0.5">Share your honest feedback</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#F0EBE3] transition-colors text-[#7A9285] hover:text-[#1A2820]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <ReviewForm
            bookingId={booking.id}
            experienceTitle={experienceTitle}
            onSuccess={() => {
              onSuccess?.();
              // Auto-close after a short delay so user sees the success state
              setTimeout(onClose, 2200);
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
