import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import gsap from "gsap";

/**
 * Bond UI — Modal
 *
 * Props:
 *  open        boolean — controlled open state
 *  onClose     fn      — called on backdrop click or X button
 *  title       string
 *  description string  (optional subtitle)
 *  size        "sm" | "md" | "lg" | "xl" | "full"
 *  showClose   boolean (default true)
 *  closeOnBackdrop boolean (default true)
 *  children    node    — modal body
 *  footer      node    — rendered below body (buttons, etc.)
 *  className   string  — panel override
 */

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[95vw]",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  showClose = true,
  closeOnBackdrop = true,
  children,
  footer,
  className = "",
}) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!backdropRef.current || !panelRef.current) return;

    if (open) {
      /* lock scroll */
      document.body.style.overflow = "hidden";

      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }
      );
    } else {
      gsap.to(panelRef.current, {
        opacity: 0,
        y: 16,
        scale: 0.97,
        duration: 0.22,
        ease: "power2.in",
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          document.body.style.overflow = "";
        },
      });
    }
  }, [open]);

  /* Keep DOM mounted for exit animation; hide with pointer-events */
  return createPortal(
    <div
      ref={backdropRef}
      onClick={closeOnBackdrop ? onClose : undefined}
      className={[
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-[rgba(15,36,25,0.45)]",
        !open ? "pointer-events-none" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ opacity: open ? undefined : 0 }}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={[
          "relative w-full bg-white rounded-2xl overflow-hidden",
          "border border-[rgba(28,61,46,0.12)]",
          sizes[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-[rgba(28,61,46,0.10)]">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-[#1A2820] leading-snug">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-[#7A9285] leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-lg text-[#7A9285]
                  hover:bg-[#F2EDE4] hover:text-[#1C3D2E]
                  transition-colors duration-150 -mt-0.5 -mr-0.5"
              >
                <X size={17} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 text-sm text-[#3D5448] leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}