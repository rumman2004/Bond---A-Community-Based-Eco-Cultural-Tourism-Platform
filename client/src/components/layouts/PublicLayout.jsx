import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { gsap } from "gsap";
import PublicNav from "./navbars/PublicNav";

export default function PublicLayout() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.45, ease: "power2.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="app-shell-bg min-h-screen flex flex-col"
      style={{ color: "var(--color-text-dark)" }}
    >
      <PublicNav />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "var(--color-forest-deep)",
          color: "var(--color-forest-pale)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--color-forest-light)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.5-2-4.5-4.5-4.5zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
                      fill="white"
                    />
                  </svg>
                </span>
                <span
                  className="text-lg font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-cream-light)" }}
                >
                  Bond.
                </span>
              </div>
              <p
                className="text-sm leading-relaxed max-w-xs"
                style={{ color: "var(--color-forest-soft)" }}
              >
                Connecting curious travellers with authentic local communities across the world.
              </p>
            </div>

            {/* Explore links */}
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--color-forest-muted)" }}
              >
                Explore
              </p>
              <ul className="space-y-2 text-sm" style={{ color: "var(--color-forest-soft)" }}>
                {["Home", "About", "Experiences", "Communities", "Stories"].map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: "var(--color-forest-muted)" }}
              >
                Company
              </p>
              <ul className="space-y-2 text-sm" style={{ color: "var(--color-forest-soft)" }}>
                {["Privacy Policy", "Terms of Use", "Contact Us", "Careers"].map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-white transition-colors duration-200 inline-block">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="border-t mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              color: "var(--color-forest-muted)",
            }}
          >
            <span>© {new Date().getFullYear()} Bond. All rights reserved.</span>
            <div className="flex items-center gap-4">
              {["Privacy", "Terms", "Cookies"].map((l) => (
                <a key={l} href="#" className="hover:text-white transition-colors duration-200">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
