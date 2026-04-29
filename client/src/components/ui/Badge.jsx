/**
 * Bond UI — Badge
 *
 * Props:
 *  variant   "eco" | "culture" | "verified" | "new" | "pending"
 *            | "danger" | "info" | "neutral" | "success"
 *            | "warning" | "default" | "outline"
 *  size      "sm" | "md"
 *  icon      Lucide icon component
 *  dot       boolean — show a color dot instead of icon
 *  children  node
 *  className string
 *
 * Usage:
 *  <Badge variant="eco" icon={Leaf}>Eco-friendly</Badge>
 *  <Badge variant="pending" dot>Pending</Badge>
 */

const variants = {
  eco: {
    wrap: "bg-[#D4E6DC] text-[#1C3D2E] border-[#A8CCBA]",
    dot: "bg-[#3E7A58]",
  },
  success: {
    wrap: "bg-[#D4E6DC] text-[#1C3D2E] border-[#A8CCBA]",
    dot: "bg-[#3E7A58]",
  },
  culture: {
    wrap: "bg-[#F5E4CA] text-[#7A4E10] border-[#E8B96A]",
    dot: "bg-[#C8883A]",
  },
  warning: {
    wrap: "bg-[#F5E4CA] text-[#7A4E10] border-[#E8B96A]",
    dot: "bg-[#C8883A]",
  },
  verified: {
    wrap: "bg-[#E8E1D5] text-[#3D5448] border-[#D9D0C2]",
    dot: "bg-[#5C8C72]",
  },
  new: {
    wrap: "bg-[#1C3D2E] text-[#F2EDE4] border-transparent",
    dot: "bg-[#9FE1CB]",
  },
  pending: {
    wrap: "bg-[#F5E4CA] text-[#96601F] border-[#C8883A]",
    dot: "bg-[#C8883A]",
  },
  danger: {
    wrap: "bg-[#FAF0EC] text-[#A04D38] border-[#D4735A]",
    dot: "bg-[#D4735A]",
  },
  info: {
    wrap: "bg-[#D8EEF2] text-[#256D85] border-[#9BCAD4]",
    dot: "bg-[#256D85]",
  },
  neutral: {
    wrap: "bg-[#F2EDE4] text-[#7A9285] border-[#D9D0C2]",
    dot: "bg-[#7A9285]",
  },
  default: {
    wrap: "bg-white text-[#3D5448] border-[#D9D0C2]",
    dot: "bg-[#5C8C72]",
  },
  outline: {
    wrap: "bg-transparent text-current border-current",
    dot: "bg-current",
  },
};

const sizes = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-[11px] px-2.5 py-1 gap-1.5",
};

export default function Badge({
  variant = "neutral",
  size = "md",
  icon: Icon,
  dot = false,
  children,
  className = "",
  ...rest
}) {
  const v = variants[variant] || variants.neutral;

  return (
    <span
      className={[
        "inline-flex items-center border rounded-full font-medium shrink-0",
        "leading-none tracking-[0.01em]",
        v.wrap,
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot}`}
        />
      )}
      {!dot && Icon && (
        <Icon size={size === "sm" ? 10 : 11} strokeWidth={2} />
      )}
      {children}
    </span>
  );
}
