import { useRef, useEffect } from "react";
import { CreditCard, Lock, Info } from "lucide-react";
import { gsap } from "gsap";
import { formatCurrency } from "../../../utils/formatters";

// Payment is not yet implemented on the backend.
// This component shows a placeholder UI with the booking total.
export default function PaymentForm({ amount, onSubmit }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }, cardRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={cardRef} className="space-y-5">
      {/* Coming soon notice */}
      <div className="flex items-start gap-3 rounded-[9px] border border-[#C8883A]/30 bg-[#FFF8EE] px-4 py-3">
        <Info size={16} className="mt-0.5 shrink-0 text-[#C8883A]" />
        <p className="text-sm text-[#C8883A]">
          Online payment is coming soon. Your booking request will be confirmed by the community directly.
        </p>
      </div>

      {/* Amount display */}
      <div className="rounded-[14px] bg-gradient-to-br from-[#1C3D2E] to-[#0F2419] p-6 text-white">
        <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Booking total</p>
        <p className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {formatCurrency(amount)}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <Lock size={11} /> Secure booking — pay on arrival
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={() => onSubmit?.({ amount, provider: "offline" })}
        className="w-full rounded-[9px] bg-[#1C3D2E] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2A5940] flex items-center justify-center gap-2"
      >
        <CreditCard size={16} /> Confirm booking request
      </button>
    </div>
  );
}