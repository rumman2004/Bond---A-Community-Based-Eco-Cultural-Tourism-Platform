import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Calendar, MapPin, Users, IndianRupee, Clock, CheckCircle,
  XCircle, AlertCircle, Hourglass, ChevronRight, Inbox, FileText,
  Star
} from "lucide-react";
import bookingService from "../../services/bookingService";
import PageShell from "../PageShell";
import ReviewModal from "../../components/features/bookings/ReviewModal";

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", icon: CheckCircle,  bg: "#E5EEE8", text: "#2A4D32", dot: "#4A8B5C" },
  pending:   { label: "Pending",   icon: Hourglass,    bg: "#F0EDE5", text: "#5C4A2A", dot: "#B48A3C" },
  completed: { label: "Completed", icon: CheckCircle,  bg: "#E8E5F0", text: "#2A2A5C", dot: "#5C5CB4" },
  cancelled: { label: "Cancelled", icon: XCircle,      bg: "#F0E8E8", text: "#5C2A2A", dot: "#B45C5C" },
  rejected:  { label: "Rejected",  icon: AlertCircle,  bg: "#F0E8E8", text: "#5C2A2A", dot: "#B45C5C" },
};

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

function BookingCard({ booking, index, onCancel, onReviewOpen }) {
  const ref = useRef(null);
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      await bookingService.cancel(booking.id);
      if (onCancel) onCancel(booking.id);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, delay: index * 0.08, ease: "power3.out" }
    );
  }, []);

  const handleMouseEnter = () => gsap.to(ref.current, { x: 4, duration: 0.2, ease: "power2.out" });
  const handleMouseLeave = () => gsap.to(ref.current, { x: 0, duration: 0.2, ease: "power2.out" });

  const dateStr = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : booking.date;

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group bg-white rounded-[16px] border border-[#E8E1D5] p-4 hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Status pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: cfg.bg, color: cfg.text }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {cfg.label}
            </span>
          </div>

          <h3 className="font-semibold text-[#1A2820] text-sm leading-snug truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
            {booking.experience_title ?? booking.title ?? booking.experience?.title ?? "Experience"}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#9A9285]">
            {(booking.location ?? booking.experience?.community?.village) && (
              <span className="flex items-center gap-1"><MapPin size={11} />{booking.location ?? booking.experience?.community?.village}</span>
            )}
            {dateStr && (
              <span className="flex items-center gap-1"><Calendar size={11} />{dateStr}</span>
            )}
            {booking.num_guests && (
              <span className="flex items-center gap-1"><Users size={11} />{booking.num_guests} guest{booking.num_guests !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>

        {/* Right: amount */}
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-0.5">
            <IndianRupee size={13} className="text-[#1A2820]" />
            <span className="text-base font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {(booking.total_amount ?? booking.total_price ?? booking.amount)?.toLocaleString("en-IN") ?? "—"}
            </span>
          </div>
          <p className="text-xs text-[#C4B8A8] mt-0.5">total</p>
        </div>
      </div>

      {/* Special requests */}
      {booking.special_requests && (
        <p className="mt-2 text-xs text-[#9A9285] italic border-t border-[#F0EBE3] pt-2">
          "{booking.special_requests}"
        </p>
      )}

      {/* ID Proof Visibility */}
      {booking.id_document_url && (
        <div className="mt-2 text-xs border-t border-[#F0EBE3] pt-2 flex items-center gap-1.5 text-[#3E7A58]">
          <FileText size={12} />
          <a href={booking.id_document_url} target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-[#1C3D2E] transition-colors">
            View Attached ID Proof
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 border-t border-[#F0EBE3] pt-3 flex justify-end gap-2">
        {/* Rate Action for Completed */}
        {booking.status?.toLowerCase() === 'completed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onReviewOpen(booking); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all bg-[#3E7A58] text-[#F2EDE4] hover:bg-[#2A4D32] shadow-sm"
          >
            <Star size={12} className="fill-current" />
            Rate Experience
          </button>
        )}

        {/* Cancel Action for Pending/Confirmed */}
        {['pending', 'confirmed'].includes(booking.status) && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all border border-[#B45C5C] text-[#B45C5C] hover:bg-[#FAEAEA] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings]   = useState([]);
  const [filter, setFilter]       = useState("all");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const headerRef = useRef(null);
  const filterRef = useRef(null);

  const handleCancelSuccess = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  const handleReviewSuccess = () => {
    // Optionally update local state if we want to hide the button
    // For now, refreshing or showing a toast is fine.
    alert("Thank you for your review!");
  };

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
      .fromTo(filterRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, "-=0.3");
  }, []);

  useEffect(() => {
    bookingService.getMyBookings()
      .then(res => {
        const data = res?.data?.bookings ?? res?.bookings ?? res?.data ?? [];
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(err => setError(err.message || "Failed to load bookings."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "all" ? bookings.length : bookings.filter(b => b.status === f).length;
    return acc;
  }, {});

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="mb-6">
            <h1 className="text-2xl font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
              My Bookings
            </h1>
            <p className="text-sm text-[#9A9285] mt-0.5">Track upcoming and past experiences</p>
          </div>

          {/* Filter tabs */}
          <div ref={filterRef} className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 capitalize"
                style={{
                  background: filter === f ? "#1C3D2E" : "#F0EBE3",
                  color:      filter === f ? "#F2EDE4" : "#7A9285",
                }}>
                {f}
                {counts[f] > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[10px]"
                    style={{ background: filter === f ? "rgba(255,255,255,0.2)" : "#E0D8CE", color: filter === f ? "#F2EDE4" : "#9A9285" }}>
                    {counts[f]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-[16px] border border-[#E8E1D5] h-28 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-center">
              <AlertCircle size={36} className="text-[#B45C5C] mb-2" />
              <p className="text-sm text-[#9A9285]">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Inbox size={40} className="text-[#C4B8A8] mb-3" />
              <p className="text-sm text-[#9A9285]">
                {filter === "all" ? "No bookings yet. Start exploring!" : `No ${filter} bookings.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((b, i) => (
                <BookingCard 
                  key={b.id} 
                  booking={b} 
                  index={i} 
                  onCancel={handleCancelSuccess} 
                  onReviewOpen={setSelectedBooking}
                />
              ))}
            </div>
          )}

          {selectedBooking && (
            <ReviewModal 
              booking={selectedBooking} 
              onClose={() => setSelectedBooking(null)} 
              onSuccess={handleReviewSuccess}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}