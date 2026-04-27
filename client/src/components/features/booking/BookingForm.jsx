import { useState, useRef, useEffect } from "react";
import { CalendarDays, Users, FileText, IndianRupee } from "lucide-react";
import { gsap } from "gsap";
import { Button, Input } from "../../ui";
import { formatCurrency } from "../../../utils/formatters";

export default function BookingForm({ experience, onSubmit, loading = false }) {
  const formRef = useRef(null);
  const summaryRef = useRef(null);

  // Backend fields: experience_id, booking_date, num_guests, special_requests
  const [form, setForm] = useState({
    booking_date:     "",
    num_guests:       1,
    special_requests: "",
  });

  const pricePerPerson = Number(experience?.price_per_person ?? experience?.price ?? 0);
  const total          = pricePerPerson * Number(form.num_guests || 1);
  const minGuests      = experience?.min_participants ?? 1;
  const maxGuests      = experience?.max_participants ?? 20;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }, formRef);
    return () => ctx.revert();
  }, []);

  // Animate summary on guest/price change
  useEffect(() => {
    gsap.fromTo(summaryRef.current,
      { scale: 0.97, opacity: 0.6 },
      { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }
    );
  }, [form.num_guests]);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      experience_id:    experience?.id,
      booking_date:     form.booking_date,
      num_guests:       Number(form.num_guests),
      special_requests: form.special_requests,
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          Visit date
        </label>
        <div className="relative">
          <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9285]" />
          <input
            type="date"
            name="booking_date"
            value={form.booking_date}
            min={today}
            onChange={update}
            required
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white pl-9 pr-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
          />
        </div>
      </div>

      {/* Guests */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          Number of guests
        </label>
        <div className="relative">
          <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9285]" />
          <input
            type="number"
            name="num_guests"
            value={form.num_guests}
            min={minGuests}
            max={maxGuests}
            onChange={update}
            required
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white pl-9 pr-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
          />
        </div>
        <p className="mt-1 text-xs text-[#7A9285]">{minGuests}–{maxGuests} guests allowed</p>
      </div>

      {/* Special requests */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          Special requests
        </label>
        <div className="relative">
          <FileText size={15} className="absolute left-3 top-3 text-[#7A9285]" />
          <textarea
            name="special_requests"
            value={form.special_requests}
            onChange={update}
            rows={3}
            placeholder="Food preferences, arrival time, accessibility needs…"
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white pl-9 pr-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition resize-none"
          />
        </div>
      </div>

      {/* Price summary */}
      <div
        ref={summaryRef}
        className="rounded-[9px] bg-gradient-to-r from-[#1C3D2E] to-[#2A5940] px-5 py-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 mb-0.5">Estimated total</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {formatCurrency(total)}
            </p>
          </div>
          <div className="text-right text-xs text-white/60">
            <p>{formatCurrency(pricePerPerson)} × {form.num_guests} guest{form.num_guests > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[9px] bg-[#1C3D2E] py-3 text-sm font-semibold text-white transition hover:bg-[#2A5940] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>Request booking</>
        )}
      </button>
    </form>
  );
}