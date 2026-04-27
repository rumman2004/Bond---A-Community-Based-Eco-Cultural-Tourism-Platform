import { useState, useRef, useEffect, useId } from "react";

/**
 * Dropdown — Bond Design System
 * Accessible, keyboard-navigable dropdown menu attached to any trigger element.
 *
 * Props:
 *  trigger      — ReactNode: the element that opens the menu (button, avatar, etc.)
 *  items        — Array of item objects (see below)
 *  align        — "left" | "right"  (default "left") — menu alignment to trigger
 *  width        — number: menu width in px (default 200)
 *  className    — string
 *
 * Item shape:
 *  { label, icon?, onClick?, href?, divider?, danger?, disabled? }
 *    divider: true  → renders a separator line (label ignored)
 *    danger: true   → renders label in terracotta/red
 *    icon: string   → raw emoji or SVG string shown before label
 */

export default function Dropdown({
  trigger,
  items = [],
  align = "left",
  width = 200,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const keyHandler = (e) => {
      if (e.key === "Escape") { setOpen(false); }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [open]);

  // Focus first item when menu opens
  useEffect(() => {
    if (open) setFocusedIdx(-1);
  }, [open]);

  const actionItems = items.filter((i) => !i.divider);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    const navigable = items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => !item.divider && !item.disabled);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = navigable.find(({ idx }) => idx > focusedIdx);
      if (next) setFocusedIdx(next.idx);
      else setFocusedIdx(navigable[0]?.idx ?? -1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = [...navigable].reverse().find(({ idx }) => idx < focusedIdx);
      if (prev) setFocusedIdx(prev.idx);
      else setFocusedIdx(navigable[navigable.length - 1]?.idx ?? -1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const focused = items[focusedIdx];
      if (focused && !focused.disabled) {
        focused.onClick?.();
        setOpen(false);
      }
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.disabled) return;
    item.onClick?.();
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`bond-dd-root ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        className="bond-dd-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        tabIndex={0}
      >
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className={`bond-dd-menu bond-dd-menu--${align}`}
          style={{ width }}
          aria-label="Dropdown menu"
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={idx} className="bond-dd-divider" role="separator" />;
            }

            const Tag = item.href ? "a" : "button";
            const isFocused = focusedIdx === idx;

            return (
              <Tag
                key={idx}
                role="menuitem"
                href={item.href}
                className={`bond-dd-item ${item.danger ? "bond-dd-item--danger" : ""} ${
                  item.disabled ? "bond-dd-item--disabled" : ""
                } ${isFocused ? "bond-dd-item--focused" : ""}`}
                onClick={() => handleItemClick(item)}
                tabIndex={-1}
                aria-disabled={item.disabled}
              >
                {item.icon && (
                  <span className="bond-dd-item-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="bond-dd-item-label">{item.label}</span>
              </Tag>
            );
          })}
        </div>
      )}

      <style>{`
        .bond-dd-root {
          position: relative;
          display: inline-block;
        }
        .bond-dd-trigger {
          cursor: pointer;
          outline: none;
          display: inline-flex;
          align-items: center;
        }
        .bond-dd-menu {
          position: absolute;
          top: calc(100% + 6px);
          z-index: 200;
          background: #ffffff;
          border: 1px solid rgba(28, 61, 46, 0.14);
          border-radius: 12px;
          padding: 5px;
          box-shadow: 0 4px 20px rgba(28, 61, 46, 0.1), 0 1px 4px rgba(28, 61, 46, 0.06);
          animation: bond-dd-in 0.14s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @keyframes bond-dd-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        .bond-dd-menu--left  { left: 0; }
        .bond-dd-menu--right { right: 0; }

        .bond-dd-item {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          text-align: left;
          font-size: 13px;
          font-weight: 400;
          color: #1A2820;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.12s ease, color 0.12s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .bond-dd-item:hover:not(.bond-dd-item--disabled),
        .bond-dd-item--focused:not(.bond-dd-item--disabled) {
          background: #F2EDE4;
          color: #1C3D2E;
        }
        .bond-dd-item--danger {
          color: #A04D38;
        }
        .bond-dd-item--danger:hover:not(.bond-dd-item--disabled),
        .bond-dd-item--focused.bond-dd-item--danger {
          background: #FAF0EC;
          color: #7A2E1C;
        }
        .bond-dd-item--disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .bond-dd-item-icon {
          font-size: 15px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          width: 18px;
        }
        .bond-dd-item-label {
          flex: 1;
          line-height: 1.3;
        }
        .bond-dd-divider {
          height: 1px;
          background: rgba(28, 61, 46, 0.1);
          margin: 4px 6px;
        }
      `}</style>
    </div>
  );
}