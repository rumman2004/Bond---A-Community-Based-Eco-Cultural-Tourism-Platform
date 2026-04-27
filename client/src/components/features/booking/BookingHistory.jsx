import { useRef, useEffect } from "react";
import { CalendarX } from "lucide-react";
import { gsap } from "gsap";
import BookingCard from "./BookingCard";

export default function BookingHistory({ bookings = [], onCancel, onView }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!bookings.length || !listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(listRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }, listRef);
    return () => ctx.revert();
  }, [bookings]);

  if (!bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#D9D0C2] bg-[#FAF7F2] py-16 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F2EDE4]">
          <CalendarX size={26} className="text-[#7A9285]" />
        </div>
        <h3 className="font-semibold text-[#1A2820]" style={{ fontFamily: "var(--font-sans)" }}>No bookings yet</h3>
        <p className="mt-1 text-sm text-[#7A9285]">Your booking history will appear here.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="grid gap-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={onCancel}
          onView={onView}
        />
      ))}
    </div>
  );
}