import { useRef } from "react";
import gsap from "gsap";

/**
 * Bond UI — Card
 *
 * Props:
 *  variant    "surface" | "elevated" | "flat" | "experience"
 *  hover      boolean  — enable lift-on-hover GSAP animation
 *  onClick    fn
 *  padding    "none" | "sm" | "md" | "lg"
 *  className  string
 *  children   node
 *
 * Sub-components (named exports):
 *  Card.Header  — top section with optional border
 *  Card.Body    — main content area
 *  Card.Footer  — bottom action strip
 *  Card.Image   — image slot at top of card (overflow hidden)
 */

const variants = {
  surface:
    "bg-[#F2EDE4] border border-[rgba(28,61,46,0.12)] rounded-[14px]",
  elevated:
    "bg-white border border-[rgba(28,61,46,0.12)] rounded-[14px]",
  flat:
    "bg-transparent border border-[rgba(28,61,46,0.10)] rounded-[14px]",
  experience:
    "bg-white border border-[rgba(28,61,46,0.12)] rounded-[14px] overflow-hidden",
};

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export default function Card({
  variant = "elevated",
  hover = false,
  onClick,
  padding = "md",
  className = "",
  children,
  ...rest
}) {
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    if (!hover) return;
    gsap.to(cardRef.current, {
      y: -4,
      boxShadow: "0 12px 32px rgba(28,61,46,0.10)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!hover) return;
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: "0 0px 0px rgba(28,61,46,0)",
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleMouseDown = () => {
    if (!hover || !onClick) return;
    gsap.to(cardRef.current, { scale: 0.985, duration: 0.1 });
  };

  const handleMouseUp = () => {
    if (!hover || !onClick) return;
    gsap.to(cardRef.current, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={[
        variants[variant],
        paddings[padding],
        hover ? "cursor-pointer" : "",
        "transition-colors duration-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

Card.Image = function CardImage({ src, alt = "", height = "h-44", className = "", children }) {
  return (
    <div
      className={`relative w-full ${height} bg-[#D4E6DC] overflow-hidden ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#5C8C72]">
          {children}
        </div>
      )}
    </div>
  );
};

Card.Header = function CardHeader({ border = false, className = "", children }) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-3",
        border ? "pb-4 mb-4 border-b border-[rgba(28,61,46,0.10)]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className = "", children }) {
  return (
    <div className={`text-[#3D5448] text-sm leading-relaxed ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ border = true, className = "", children }) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-3 pt-4 mt-4",
        border ? "border-t border-[rgba(28,61,46,0.10)]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
};