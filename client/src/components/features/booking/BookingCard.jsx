import { useEffect, useRef } from "react";
import { CalendarDays, MapPin, Users, Eye, X, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { Button, Card } from "../../ui";
import { formatCurrency } from "../../../utils/formatters";
import { formatDate } from "../../../utils/dateUtils";
import BookingStatus from "./BookingStatus";

export default function BookingCard({ booking, onCancel, onView }) {
  const cardRef = useRef(null);
  const metaRef = useRef(null);
  const actionsRef = useRef(null);

  // booking fields from bookingService / backend:
  // booking.experience_title, booking.community_name, booking.village, booking.state
  // booking.booking_date, booking.num_guests, booking.total_amount, booking.status
  const title    = booking.experience_title || booking.title || "Experience";
  const location = booking.community_name
    ? `${booking.village ? booking.village + ", " : ""}${booking.state || booking.community_name}`
    : booking.location || "—";
  const date     = booking.booking_date || booking.date;
  const guests   = booking.num_guests   ?? booking.guests ?? 1;
  const amount   = booking.total_amount ?? booking.amount ?? 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }
      );
      gsap.fromTo(metaRef.current.children,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, delay: 0.2, ease: "power2.out" }
      );
      gsap.fromTo(actionsRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, delay: 0.45, ease: "power2.out" }
      );
    }, cardRef);
    return () => ctx.revert();
  }, []);

  const handleHoverEnter = () => {
    gsap.to(cardRef.current, { y: -4, boxShadow: "0 16px 40px rgba(28,61,46,0.13)", duration: 0.3, ease: "power2.out" });
  };
  const handleHoverLeave = () => {
    gsap.to(cardRef.current, { y: 0, boxShadow: "0 4px 20px rgba(28,61,46,0.08)", duration: 0.3, ease: "power2.out" });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      className="rounded-[14px] border border-[#D9D0C2] bg-white shadow-card overflow-hidden"
    >
      {/* Accent bar based on status */}
      <div className={`h-1 w-full ${
        booking.status === "confirmed" ? "bg-[#3E7A58]" :
        booking.status === "completed" ? "bg-[#C8883A]" :
        booking.status === "cancelled" ? "bg-[#D4735A]" :
        "bg-[#A8CCBA]"
      }`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1A2820] text-base leading-snug truncate"
                style={{ fontFamily: "var(--font-sans)" }}>
              {title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#7A9285]">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          </div>
          <BookingStatus status={booking.status} />
        </div>

        {/* Meta */}
        <div ref={metaRef} className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col gap-0.5 rounded-[9px] bg-[#FAF7F2] px-3 py-2">
            <span className="text-[10px] uppercase tracking-wider text-[#7A9285] font-medium">Date</span>
            <span className="flex items-center gap-1 font-semibold text-[#1C3D2E]">
              <CalendarDays size={13} className="shrink-0" />
              {formatDate(date)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-[9px] bg-[#FAF7F2] px-3 py-2">
            <span className="text-[10px] uppercase tracking-wider text-[#7A9285] font-medium">Guests</span>
            <span className="flex items-center gap-1 font-semibold text-[#1C3D2E]">
              <Users size={13} className="shrink-0" />
              {guests}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-[9px] bg-[#F2EDE4] px-3 py-2">
            <span className="text-[10px] uppercase tracking-wider text-[#7A9285] font-medium">Total</span>
            <span className="font-bold text-[#1C3D2E] text-sm">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div ref={actionsRef} className="mt-4 flex items-center justify-between gap-2 pt-4 border-t border-[#F2EDE4]">
          <button
            onClick={() => onView?.(booking)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#3E7A58] hover:text-[#1C3D2E] transition-colors"
          >
            <Eye size={14} /> View details <ArrowRight size={13} />
          </button>
          {["pending", "confirmed"].includes(booking.status) && (
            <button
              onClick={() => onCancel?.(booking)}
              className="flex items-center gap-1.5 rounded-[9px] border border-[#D4735A]/40 px-3 py-1.5 text-sm font-medium text-[#D4735A] hover:bg-[#FAF0EC] transition-colors"
            >
              <X size={13} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}