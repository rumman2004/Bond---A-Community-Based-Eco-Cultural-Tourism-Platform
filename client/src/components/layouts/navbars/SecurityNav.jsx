import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Bell, ChevronDown, LogOut, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function SecurityNav() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifCount] = useState(4);
  const navRef = useRef(null);
  const dropRef = useRef(null);
  const profileWrapRef = useRef(null);
  const navigate = useNavigate();

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  // Callback ref — fires after the dropdown is mounted, so GSAP always
  // has a real DOM node (not null like a useEffect on the same tick would).
  const animateDropRef = useCallback((el) => {
    dropRef.current = el;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: -8, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
    );
  }, []);

  // Outside-click against the stable wrapper div, never dropRef.parentElement
  useEffect(() => {
    const handler = (e) => {
      if (profileWrapRef.current && !profileWrapRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Always redirect — even if the server call fails the local state is cleared
      navigate("/login", { replace: true });
    }
  };

  // Normalise field names: backend returns full_name, frontend profile
  // may have already mapped it to name — handle both.
  const displayName = user?.name ?? user?.full_name ?? "Security Officer";
  const displayRole = user?.role ?? "Security";
  const avatarUrl   = user?.avatar_url ?? null;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
      style={{
        backgroundColor: "var(--color-cream-light)",
        borderBottom: "1px solid var(--color-border-soft)",
      }}
    >
      {/* Logo — aligned with sidebar width */}
      <div
        className="flex items-center gap-3 px-6 shrink-0"
        style={{ width: "260px" }}
      >
        <Link to="/security" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Bond Logo"
            className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-forest-deep)",
            }}
          >
            Bond.
          </span>
        </Link>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: "var(--color-forest-pale)",
            color: "var(--color-forest)",
          }}
        >
          SECURITY
        </span>
      </div>

      {/* Center label */}
      <div className="flex-1 px-6 hidden md:flex items-center">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Security Dashboard
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 px-6">
        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          title="Notifications"
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ backgroundColor: "var(--color-terracotta)", color: "white" }}
            >
              {notifCount}
            </span>
          )}
        </button>

        {/* Profile dropdown — profileWrapRef on the wrapper for reliable outside-click */}
        <div className="relative ml-1" ref={profileWrapRef}>
          <button
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-black/5 transition-colors"
            onClick={() => setProfileOpen((v) => !v)}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="w-8 h-8 rounded-full object-cover"
                alt="avatar"
              />
            ) : (
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{
                  backgroundColor: "var(--color-forest-pale)",
                  color: "var(--color-forest)",
                }}
              >
                {initials}
              </span>
            )}
            <ChevronDown
              size={14}
              style={{
                color: "var(--color-text-muted)",
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {profileOpen && (
            <div
              ref={animateDropRef}
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--color-cream-light)",
                border: "1px solid var(--color-border-soft)",
                boxShadow: "var(--shadow-modal)",
              }}
            >
              {/* User info */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--color-border-soft)" }}
              >
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--color-text-dark)" }}
                >
                  {displayName}
                </p>
                <p
                  className="text-xs mt-0.5 capitalize"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {displayRole}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                  style={{ color: "var(--color-text-mid)" }}
                  onClick={() => {
                    navigate("/security/account");
                    setProfileOpen(false);
                  }}
                >
                  <User size={15} />
                  My Account
                </button>
              </div>

              {/* Logout */}
              <div
                className="border-t py-1.5"
                style={{ borderColor: "var(--color-border-soft)" }}
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors"
                  style={{ color: "var(--color-terracotta)" }}
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}