import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { gsap } from "gsap";
import CommunityNav from "./navbars/CommunityNav";
import CommunitySidebar from "./sidebars/CommunitySidebar";

const SIDEBAR_W = 260;
const SIDEBAR_COLLAPSED_W = 72;

export default function CommunityLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef(null);
  const overlayRef = useRef(null);

  // Initial fade-in
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.3 }
      );
    });
    return () => ctx.revert();
  }, []);

  // Desktop sidebar width animation
  useEffect(() => {
    if (!mainRef.current) return;
    if (window.innerWidth < 768) return;
    gsap.to(mainRef.current, {
      paddingLeft: sidebarCollapsed ? `${SIDEBAR_COLLAPSED_W}px` : `${SIDEBAR_W}px`,
      duration: 0.3,
      ease: "power2.inOut",
    });
  }, [sidebarCollapsed]);

  // Mobile overlay animation
  useEffect(() => {
    if (!overlayRef.current) return;
    gsap.to(overlayRef.current, {
      opacity: mobileOpen ? 1 : 0,
      pointerEvents: mobileOpen ? "auto" : "none",
      duration: 0.2,
    });
  }, [mobileOpen]);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="community-layout min-h-screen" style={{ backgroundColor: "var(--color-cream)" }}>
      <style>{`
        .community-layout .mobile-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 40; opacity: 0; pointer-events: none;
          backdrop-filter: blur(2px);
        }
        @media (min-width: 768px) {
          .community-layout .main-content {
            padding-left: ${SIDEBAR_W}px;
          }
        }
        @media (max-width: 767px) {
          .community-layout .main-content {
            padding-left: 0 !important;
          }
        }
      `}</style>

      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        className="mobile-overlay"
        onClick={() => setMobileOpen(false)}
      />

      <CommunityNav
        onMenuToggle={() => {
          if (window.innerWidth < 768) {
            setMobileOpen((v) => !v);
          } else {
            setSidebarCollapsed((v) => !v);
          }
        }}
      />

      <CommunitySidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main
        ref={mainRef}
        className="main-content pt-16 min-h-screen transition-none"
        style={{ paddingLeft: `${SIDEBAR_W}px` }}
      >
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}