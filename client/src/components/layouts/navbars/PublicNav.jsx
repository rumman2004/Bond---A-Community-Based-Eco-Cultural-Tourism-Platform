import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { gsap } from "gsap";
import { Map, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/",        label: "Home",    end: true  },
  { to: "/explore", label: "Explore", end: false },
  { to: "/about",   label: "About",   end: false },
];

export default function PublicNav() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const navRef        = useRef(null);
  const mobileMenuRef = useRef(null);

  /* ── scroll glass effect ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── entrance animation ── */
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  /* ── mobile menu animation ── */
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (mobileOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [mobileOpen]);

  /* ── close mobile menu on route change ── */
  const closeMobile = () => setMobileOpen(false);

  const navStyle = {
    backgroundColor: scrolled ? "rgba(242, 237, 228, 0.88)" : "transparent",
    backdropFilter:  scrolled ? "blur(12px)" : "none",
    borderBottom:    scrolled ? "1px solid var(--color-border-soft)" : "1px solid transparent",
    transition: "background-color 0.3s, border-color 0.3s, backdrop-filter 0.3s",
  };

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50" style={navStyle}>
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <span
            className="w-8 h-8 rounded-[9px] flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: "var(--color-forest-deep)" }}
          >
            <Map size={15} color="white" strokeWidth={1.8} />
          </span>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-forest-deep)" }}
          >
            Bond.
          </span>
        </Link>

        {/* ── Desktop links ── */}
        <ul className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${isActive ? "" : "hover:opacity-70"}`
                }
                style={({ isActive }) => ({
                  color:      isActive ? "var(--color-forest)" : "var(--color-text-mid)",
                  fontWeight: isActive ? 600 : 500,
                })}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Desktop CTA ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/auth/login"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: "var(--color-text-mid)" }}
            onMouseEnter={(e) => (e.target.style.color = "var(--color-forest)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--color-text-mid)")}
          >
            Log in
          </Link>
          <Link
            to="/auth/register"
            className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-md"
            style={{
              backgroundColor: "var(--color-forest-deep)",
              color: "var(--color-cream-light)",
              borderRadius: "var(--radius-pill)",
            }}
          >
            Register
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ color: "var(--color-forest)" }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      <div
        ref={mobileMenuRef}
        className="md:hidden overflow-hidden"
        style={{
          height: 0,
          opacity: 0,
          backgroundColor: "rgba(242, 237, 228, 0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-soft)",
        }}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMobile}
              className="text-sm font-medium py-2.5 px-3 rounded-xl transition-colors duration-150"
              style={({ isActive }) => ({
                color:           isActive ? "var(--color-forest)"      : "var(--color-text-mid)",
                fontWeight:      isActive ? 600 : 500,
                backgroundColor: isActive ? "var(--color-forest-pale)" : "transparent",
              })}
            >
              {label}
            </NavLink>
          ))}

          <div
            className="mt-3 pt-4 flex flex-col gap-2 border-t"
            style={{ borderColor: "var(--color-border-soft)" }}
          >
            <Link
              to="/auth/login"
              className="text-sm font-medium text-center py-2.5 rounded-xl transition-colors duration-150"
              onClick={closeMobile}
              style={{ color: "var(--color-text-mid)" }}
            >
              Log in
            </Link>
            <Link
              to="/auth/register"
              className="text-sm font-semibold text-center py-2.5 rounded-full"
              onClick={closeMobile}
              style={{
                backgroundColor: "var(--color-forest-deep)",
                color: "var(--color-cream-light)",
                borderRadius: "var(--radius-pill)",
              }}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}