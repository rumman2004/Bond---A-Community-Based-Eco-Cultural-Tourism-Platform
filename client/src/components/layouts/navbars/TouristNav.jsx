import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Map,
  Search,
  Bell,
  Heart,
  ChevronDown,
  LogOut,
  User,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function TouristNav() {
  const [scrolled, setScrolled]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifCount]                  = useState(3);
  const navRef  = useRef(null);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", delay: 0.05 }
    );
  }, []);

  useEffect(() => {
    if (!dropRef.current) return;
    if (profileOpen) {
      gsap.fromTo(
        dropRef.current,
        { opacity: 0, y: -8, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [profileOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.parentElement.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/auth/login", { replace: true });
  };

  const displayName = user?.name || user?.full_name || "Traveller";
  const initials    = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: scrolled ? "rgba(242,237,228,0.9)" : "var(--color-cream)",
        backdropFilter:  scrolled ? "blur(12px)" : "none",
        borderBottom:    "1px solid var(--color-border-soft)",
        transition:      "background-color 0.3s",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link to="/tourist" className="flex items-center gap-2.5 shrink-0 group mr-2">
          <span
            className="w-8 h-8 rounded-[9px] flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
            style={{ backgroundColor: "var(--color-forest-deep)" }}
          >
            <Map size={15} color="white" strokeWidth={1.8} />
          </span>
          <span
            className="text-lg font-semibold tracking-tight hidden sm:block"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-forest-deep)" }}
          >
            Bond.
          </span>
        </Link>

        {/* Search bar */}
        <div
          className="flex-1 max-w-md hidden md:flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            backgroundColor: "var(--color-cream-mid)",
            border: "1px solid var(--color-border-soft)",
          }}
        >
          <Search size={15} style={{ color: "var(--color-text-muted)" }} />
          <input
            type="text"
            placeholder="Search experiences, communities…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--color-text-dark)" }}
          />
        </div>

        <div className="flex-1 md:hidden" />

        {/* Icon actions */}
        <div className="flex items-center gap-1">

          {/* Explore */}
          <NavLink
            to="/tourist/explore"
            className={({ isActive }) =>
              `hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive ? "" : "hover:bg-black/5"
              }`
            }
            style={({ isActive }) => ({
              color:           isActive ? "var(--color-forest)"      : "var(--color-text-mid)",
              backgroundColor: isActive ? "var(--color-forest-pale)" : "",
            })}
          >
            <Map size={15} />
            Explore
          </NavLink>

          {/* Favorites */}
          <NavLink
            to="/tourist/favorites"
            className={({ isActive }) =>
              `p-2.5 rounded-lg transition-colors duration-200 ${isActive ? "" : "hover:bg-black/5"}`
            }
            style={({ isActive }) => ({
              color:           isActive ? "var(--color-terracotta)"       : "var(--color-text-muted)",
              backgroundColor: isActive ? "var(--color-terracotta-light)" : "",
            })}
            title="Favorites"
          >
            <Heart size={18} />
          </NavLink>

          {/* Bookings */}
          <NavLink
            to="/tourist/bookings"
            className={({ isActive }) =>
              `p-2.5 rounded-lg transition-colors duration-200 ${isActive ? "" : "hover:bg-black/5"}`
            }
            style={({ isActive }) => ({
              color:           isActive ? "var(--color-forest)"      : "var(--color-text-muted)",
              backgroundColor: isActive ? "var(--color-forest-pale)" : "",
            })}
            title="My Bookings"
          >
            <BookOpen size={18} />
          </NavLink>

          {/* Notifications */}
          <NavLink
            to="/tourist/notifications"
            className="relative p-2.5 rounded-lg hover:bg-black/5 transition-colors duration-200"
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
          </NavLink>

          {/* Profile dropdown */}
          <div className="relative ml-1">
            <button
              className="flex items-center gap-2 p-1.5 rounded-xl transition-colors hover:bg-black/5"
              onClick={() => setProfileOpen((v) => !v)}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
              ) : (
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)" }}
                >
                  {initials}
                </span>
              )}
              <ChevronDown
                size={14}
                style={{
                  color:     "var(--color-text-muted)",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {profileOpen && (
              <div
                ref={dropRef}
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden shadow-xl"
                style={{
                  backgroundColor: "var(--color-cream-light)",
                  border:          "1px solid var(--color-border-soft)",
                  boxShadow:       "var(--shadow-modal)",
                }}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border-soft)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
                    {displayName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {user?.email ?? "Tourist"}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {[
                    { icon: User,     label: "My Profile", to: "/tourist/profile"   },
                    { icon: BookOpen, label: "My Bookings", to: "/tourist/bookings" },
                    { icon: Heart,    label: "Favorites",  to: "/tourist/favorites" },
                  ].map(({ icon: Icon, label, to }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                      style={{ color: "var(--color-text-mid)" }}
                      onClick={() => { navigate(to); setProfileOpen(false); }}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t py-1.5" style={{ borderColor: "var(--color-border-soft)" }}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
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
      </nav>
    </header>
  );
}