import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Compass, LogIn, LogOut, Map, Menu, Sparkles, User, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isTourist = user?.role === "tourist";
  const activeLinks = isTourist
    ? [
        { to: "/tourist", label: "Home", end: true },
        { to: "/tourist/explore", label: "Explore", end: false },
        { to: "/tourist/bookings", label: "Bookings", end: false },
      ]
    : NAV_LINKS;

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
  const handleLogout = async () => {
    closeMobile();
    await logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <header ref={navRef} className="fixed left-0 right-0 top-0 z-50 px-3 pt-3">
      <nav
        className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-[12px] px-3.5 sm:px-5"
        style={{
          backgroundColor: scrolled ? "rgba(242,237,228,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          border: scrolled ? "1px solid rgba(28,61,46,0.12)" : "1px solid transparent",
          boxShadow: scrolled ? "0 12px 32px rgba(28,61,46,0.10)" : "none",
          transition: "all 0.4s ease",
        }}
      >

        {/* ── Logo ── */}
        <Link to={isTourist ? "/tourist" : "/"} className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <img
            src="/logo.png"
            alt="Bond Logo"
            className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-forest-deep)" }}
          >
            Bond.
          </span>
        </Link>

        {/* ── Desktop links ── */}
        <ul className="hidden md:flex items-center gap-1 rounded-full bg-white/55 p-1 ring-1 ring-[rgba(28,61,46,0.08)]">
          {activeLinks.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive ? "" : "hover:bg-white/80"}`
                }
                style={({ isActive }) => ({
                  color:      isActive ? "var(--color-forest)" : "var(--color-text-mid)",
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? "white" : "transparent",
                  boxShadow: isActive ? "0 4px 14px rgba(28,61,46,0.08)" : "none",
                })}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Desktop CTA ── */}
        <div className="hidden md:flex items-center gap-3">
          {isTourist ? (
            <>
              <Link
                to="/tourist/profile"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-white/70"
                style={{ color: "var(--color-text-mid)" }}
              >
                <User size={14} /> Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-md"
                style={{
                  background: "linear-gradient(135deg, var(--color-forest-deep), var(--color-river))",
                  color: "var(--color-cream-light)",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-white/70"
                style={{ color: "var(--color-text-mid)" }}
                onMouseEnter={(e) => (e.target.style.color = "var(--color-forest)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--color-text-mid)")}
              >
                <LogIn size={14} /> Log in
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-md"
                style={{
                  background: "linear-gradient(135deg, var(--color-forest-deep), var(--color-river))",
                  color: "var(--color-cream-light)",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                <User size={14} /> Register
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors hover:bg-white/70"
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
          backgroundColor: "rgba(250, 247, 242, 0.97)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--color-border-soft)",
          borderTop: 0,
          borderRadius: "0 0 12px 12px",
          margin: "0 auto",
          maxWidth: "calc(100% - 24px)",
        }}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {activeLinks.map(({ to, label, end }) => (
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
            {isTourist ? (
              <>
                <Link
                  to="/tourist/profile"
                  className="text-sm font-medium text-center py-2.5 rounded-xl transition-colors duration-150"
                  onClick={closeMobile}
                  style={{ color: "var(--color-text-mid)" }}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-center py-2.5 rounded-full"
                  onClick={handleLogout}
                  style={{
                    background: "linear-gradient(135deg, var(--color-forest-deep), var(--color-river))",
                    color: "var(--color-cream-light)",
                    borderRadius: "var(--radius-pill)",
                  }}
                >
                  <Compass size={14} /> Log out
                </button>
              </>
            ) : (
              <>
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
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-center py-2.5 rounded-full"
                  onClick={closeMobile}
                  style={{
                    background: "linear-gradient(135deg, var(--color-forest-deep), var(--color-river))",
                    color: "var(--color-cream-light)",
                    borderRadius: "var(--radius-pill)",
                  }}
                >
                  <Compass size={14} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
