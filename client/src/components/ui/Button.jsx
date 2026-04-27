import { useRef } from "react";
import gsap from "gsap";

/**
 * Bond UI — Button
 *
 * Props:
 *  variant   "primary" | "outline" | "ghost" | "amber" | "danger"
 *  size      "sm" | "md" | "lg"
 *  icon      Lucide icon component (optional, renders left)
 *  iconRight Lucide icon component (optional, renders right)
 *  loading   boolean
 *  disabled  boolean
 *  full      boolean — full width
 *  onClick   fn
 *  children  node
 */

const variants = {
  primary:
    "bg-[#1C3D2E] text-[#F2EDE4] border-transparent hover:bg-[#2A5940] active:bg-[#0F2419]",
  outline:
    "bg-transparent text-[#1C3D2E] border-[#1C3D2E] hover:bg-[#D4E6DC] active:bg-[#A8CCBA]",
  ghost:
    "bg-[#F2EDE4] text-[#3D5448] border-[#D9D0C2] hover:bg-[#E8E1D5] active:bg-[#D9D0C2]",
  amber:
    "bg-[#C8883A] text-white border-transparent hover:bg-[#96601F] active:bg-[#7A4E10]",
  danger:
    "bg-transparent text-[#A04D38] border-[#D4735A] hover:bg-[#FAF0EC] active:bg-[#EBB8AA]",
};

const sizes = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-5 py-2.5 gap-2 rounded-[9px]",
  lg: "text-base px-7 py-3.5 gap-2.5 rounded-xl",
};

const iconSizes = { sm: 13, md: 15, lg: 17 };

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  full = false,
  onClick,
  children,
  className = "",
  ...rest
}) {
  const btnRef = useRef(null);
  const rippleRef = useRef(null);

  const handleClick = (e) => {
    if (disabled || loading) return;

    /* GSAP press pulse */
    gsap.fromTo(
      btnRef.current,
      { scale: 0.96 },
      { scale: 1, duration: 0.35, ease: "elastic.out(1.2, 0.5)" }
    );

    /* ripple */
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:6px; height:6px; left:${x}px; top:${y}px;
      background:rgba(255,255,255,0.35); transform:translate(-50%,-50%) scale(0);
    `;
    btnRef.current.appendChild(ripple);
    gsap.to(ripple, {
      scale: 30,
      opacity: 0,
      duration: 0.55,
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    });

    onClick?.(e);
  };

  const iSize = iconSizes[size];
  const isDisabled = disabled || loading;

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={isDisabled}
      className={[
        "relative overflow-hidden inline-flex items-center justify-center",
        "border font-medium tracking-[-0.01em] select-none",
        "transition-colors duration-150 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        full ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? (
        <Spinner size={iSize} />
      ) : (
        Icon && <Icon size={iSize} strokeWidth={2} />
      )}
      {children && <span>{children}</span>}
      {!loading && IconRight && <IconRight size={iSize} strokeWidth={2} />}
    </button>
  );
}

function Spinner({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className="animate-spin"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 1-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
