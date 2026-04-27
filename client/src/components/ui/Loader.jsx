import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Bond UI — Loader
 *
 * Variants:
 *
 * 1. <Loader />                        — inline spinner (default)
 * 2. <Loader variant="dots" />         — three animated dots
 * 3. <Loader variant="page" />         — full-page overlay with Bond logo pulse
 * 4. <Loader.Skeleton lines={3} />     — text skeleton shimmer
 * 5. <Loader.Card />                   — card-shaped skeleton
 */

export default function Loader({ variant = "spinner", size = "md", label, color = "forest" }) {
  const sizes = { sm: 16, md: 24, lg: 36 };
  const px = sizes[size] || 24;

  const colors = {
    forest: "#1C3D2E",
    amber: "#C8883A",
    cream: "#F2EDE4",
    muted: "#7A9285",
  };
  const c = colors[color] || colors.forest;

  if (variant === "dots") return <Dots color={c} label={label} />;
  if (variant === "page") return <PageLoader />;

  return (
    <span className="inline-flex flex-col items-center gap-2">
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        style={{ animationDuration: "0.75s" }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={c}
          strokeOpacity="0.2"
          strokeWidth="2.5"
        />
        <path
          d="M21 12a9 9 0 0 1-9 9"
          stroke={c}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span className="text-xs text-[#7A9285]">{label}</span>
      )}
    </span>
  );
}

function Dots({ color, label }) {
  const refs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    refs.forEach((r, i) => {
      gsap.to(r.current, {
        y: -5,
        repeat: -1,
        yoyo: true,
        duration: 0.4,
        ease: "power1.inOut",
        delay: i * 0.13,
      });
    });
  }, []);

  return (
    <span className="inline-flex flex-col items-center gap-2">
      <span className="flex items-center gap-1.5">
        {refs.map((r, i) => (
          <span
            key={i}
            ref={r}
            className="block w-2 h-2 rounded-full"
            style={{ background: color }}
          />
        ))}
      </span>
      {label && <span className="text-xs text-[#7A9285]">{label}</span>}
    </span>
  );
}

function PageLoader() {
  const dotRef = useRef(null);

  useEffect(() => {
    gsap.to(dotRef.current, {
      scale: 1.15,
      repeat: -1,
      yoyo: true,
      duration: 0.7,
      ease: "power1.inOut",
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[9998] bg-[#F2EDE4] flex flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-2.5" ref={dotRef}>
        <div className="w-9 h-9 rounded-xl bg-[#1C3D2E] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="7" r="3.5" fill="#F2EDE4" />
            <ellipse cx="8" cy="13.5" rx="2" ry="1.2" fill="#F2EDE4" />
          </svg>
        </div>
        <span className="text-xl font-semibold text-[#1C3D2E] tracking-tight">Bond.</span>
      </div>
      <Loader variant="dots" color="forest" />
    </div>
  );
}

/* ── Skeleton helpers ── */

Loader.Skeleton = function Skeleton({ lines = 3, className = "" }) {
  return (
    <div className={`flex flex-col gap-2.5 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 rounded-full bg-[#E8E1D5] overflow-hidden"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        >
          <div className="h-full w-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-[#E8E1D5] via-[#F2EDE4] to-[#E8E1D5] bg-[length:200%_100%]" />
        </div>
      ))}
    </div>
  );
};

Loader.Card = function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`bg-white border border-[rgba(28,61,46,0.10)] rounded-[14px] overflow-hidden ${className}`}
    >
      <div className="h-40 bg-[#E8E1D5] animate-pulse" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-3/4 rounded-full bg-[#E8E1D5] animate-pulse" />
        <div className="h-3 w-1/2 rounded-full bg-[#E8E1D5] animate-pulse" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-16 rounded-full bg-[#E8E1D5] animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-[#E8E1D5] animate-pulse" />
        </div>
        <div className="h-px w-full bg-[#E8E1D5] mt-1" />
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded-full bg-[#E8E1D5] animate-pulse" />
          <div className="h-4 w-14 rounded-full bg-[#E8E1D5] animate-pulse" />
        </div>
      </div>
    </div>
  );
};