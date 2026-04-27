import { useState, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";

/**
 * Tooltip — Bond Design System
 * Lightweight, accessible tooltip using a portal so it never clips inside overflow:hidden containers.
 *
 * Props:
 *  content      — string | ReactNode: tooltip text/content
 *  position     — "top" | "bottom" | "left" | "right"  (default "top")
 *  delay        — number: show delay in ms (default 320)
 *  maxWidth     — number: max width in px (default 220)
 *  disabled     — bool: prevents tooltip from showing
 *  children     — ReactNode: the element the tooltip is attached to
 *  className    — string
 *
 * Usage:
 *  <Tooltip content="View booking details" position="top">
 *    <button>Details</button>
 *  </Tooltip>
 */

const ARROW = 6; // px
const GAP = 8;   // px between trigger and tooltip

function getPosition(triggerRect, tooltipRect, position) {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  let top, left;

  switch (position) {
    case "bottom":
      top  = triggerRect.bottom + scrollY + GAP;
      left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
      break;
    case "left":
      top  = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.left + scrollX - tooltipRect.width - GAP;
      break;
    case "right":
      top  = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.right + scrollX + GAP;
      break;
    case "top":
    default:
      top  = triggerRect.top + scrollY - tooltipRect.height - GAP;
      left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
  }

  // Clamp horizontally to viewport
  const vw = document.documentElement.clientWidth;
  left = Math.max(8 + scrollX, Math.min(left, vw + scrollX - tooltipRect.width - 8));

  return { top, left };
}

export default function Tooltip({
  content,
  position = "top",
  delay = 320,
  maxWidth = 220,
  disabled = false,
  children,
  className = "",
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);
  const tooltipId = useId();

  const show = () => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  // Calculate position whenever visibility or content changes
  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect  = triggerRef.current.getBoundingClientRect();
    const tooltipRect  = tooltipRef.current.getBoundingClientRect();
    const { top, left } = getPosition(triggerRect, tooltipRect, position);
    setCoords({ top, left });
  }, [visible, position, content]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const arrowStyle = {
    top:    { bottom: -ARROW, left: "50%", transform: "translateX(-50%)", borderColor: "#1C3D2E transparent transparent transparent" },
    bottom: { top: -ARROW,   left: "50%", transform: "translateX(-50%)", borderColor: "transparent transparent #1C3D2E transparent" },
    left:   { right: -ARROW, top: "50%",  transform: "translateY(-50%)", borderColor: "transparent transparent transparent #1C3D2E" },
    right:  { left: -ARROW,  top: "50%",  transform: "translateY(-50%)", borderColor: "transparent #1C3D2E transparent transparent" },
  }[position];

  const child = (
    <span
      ref={triggerRef}
      className={`bond-tooltip-trigger ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={visible ? tooltipId : undefined}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      {children}
    </span>
  );

  const tooltip = visible && content ? createPortal(
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      className={`bond-tooltip bond-tooltip--${position}`}
      style={{ top: coords.top, left: coords.left, maxWidth }}
    >
      {content}
      <span className="bond-tooltip-arrow" style={arrowStyle} />
    </div>,
    document.body
  ) : null;

  return (
    <>
      {child}
      {tooltip}
      <style>{`
        .bond-tooltip-trigger {
          cursor: default;
        }
        .bond-tooltip {
          position: absolute;
          z-index: 9999;
          background: #1C3D2E;
          color: #F2EDE4;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          line-height: 1.5;
          padding: 7px 11px;
          border-radius: 8px;
          pointer-events: none;
          white-space: normal;
          word-break: break-word;
          animation: bond-tt-in 0.13s ease;
          letter-spacing: 0.01em;
        }
        @keyframes bond-tt-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .bond-tooltip-arrow {
          position: absolute;
          width: 0;
          height: 0;
          border-width: ${ARROW}px;
          border-style: solid;
        }
      `}</style>
    </>
  );
}