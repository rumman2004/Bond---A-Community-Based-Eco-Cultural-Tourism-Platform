/**
 * Avatar — Bond Design System
 * Displays a user's profile image or initials fallback with role-based color coding.
 *
 * Props:
 *  src          — string: image URL (optional)
 *  name         — string: used to derive initials + aria-label
 *  role         — "tourist" | "community" | "admin" | "security" | "default"
 *  size         — "xs" | "sm" | "md" | "lg" | "xl"  (default "md")
 *  online       — bool: shows green presence dot
 *  verified     — bool: shows forest-green verified badge
 *  className    — string
 *  onClick      — function
 */

const SIZES = {
  xs: { box: 24, font: 9,  badge: 8,  dot: 6  },
  sm: { box: 32, font: 12, badge: 10, dot: 8  },
  md: { box: 40, font: 14, badge: 13, dot: 10 },
  lg: { box: 52, font: 18, badge: 16, dot: 12 },
  xl: { box: 68, font: 24, badge: 20, dot: 14 },
};

const ROLE_COLORS = {
  tourist:   { bg: "#D4E6DC", text: "#1C3D2E", ring: "#5C8C72" },
  community: { bg: "#F5E4CA", text: "#7A4E10", ring: "#C8883A" },
  admin:     { bg: "#E8E1D5", text: "#3D5448", ring: "#7A9285" },
  security:  { bg: "#FAF0EC", text: "#A04D38", ring: "#D4735A" },
  default:   { bg: "#EAF4EE", text: "#2A5940", ring: "#3E7A58" },
};

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Avatar({
  src,
  name = "",
  role = "default",
  size = "md",
  online = false,
  verified = false,
  className = "",
  onClick,
}) {
  const s = SIZES[size] ?? SIZES.md;
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.default;
  const initials = getInitials(name);
  const isClickable = typeof onClick === "function";

  return (
    <span
      className={`bond-avatar-root ${className}`}
      style={{ width: s.box, height: s.box, flexShrink: 0 }}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={name || "User avatar"}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick(e) : undefined}
    >
      {/* Main circle */}
      <span
        className="bond-avatar-circle"
        style={{
          width: s.box,
          height: s.box,
          fontSize: s.font,
          background: src ? "transparent" : colors.bg,
          color: colors.text,
          outline: `2px solid ${colors.ring}22`,
          cursor: isClickable ? "pointer" : "default",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="bond-avatar-img"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="bond-avatar-initials">{initials || "?"}</span>
        )}
      </span>

      {/* Online dot */}
      {online && (
        <span
          className="bond-avatar-dot"
          style={{ width: s.dot, height: s.dot }}
          aria-label="Online"
        />
      )}

      {/* Verified badge */}
      {verified && (
        <span
          className="bond-avatar-verified"
          style={{ width: s.badge, height: s.badge }}
          aria-label="Verified"
          title="Verified"
        >
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "65%", height: "65%" }}>
            <path d="M2 6.5L4.5 9L10 3.5" stroke="#fff" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}

      <style>{`
        .bond-avatar-root {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bond-avatar-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          user-select: none;
          position: relative;
        }
        .bond-avatar-root[role="button"] .bond-avatar-circle:hover {
          transform: scale(1.06);
          box-shadow: 0 2px 8px rgba(28, 61, 46, 0.18);
        }
        .bond-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .bond-avatar-initials {
          line-height: 1;
          letter-spacing: 0.02em;
        }
        .bond-avatar-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          border-radius: 50%;
          background: #3E7A58;
          border: 2px solid #FAF7F2;
        }
        .bond-avatar-verified {
          position: absolute;
          bottom: 0;
          right: 0;
          border-radius: 50%;
          background: #1C3D2E;
          border: 1.5px solid #FAF7F2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </span>
  );
}