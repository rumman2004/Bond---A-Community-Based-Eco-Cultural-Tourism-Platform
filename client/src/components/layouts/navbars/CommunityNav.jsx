import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Map,
  Bell,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  DollarSign,
  Menu,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import communityService from "../../../services/communityService";

export default function CommunityNav({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifCount] = useState(2);
  const [community, setCommunity] = useState(null);
  const navRef = useRef(null);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  // Fetch the community profile owned by the logged-in user
  useEffect(() => {
    if (!user) return;
    communityService.getOwn()
      .then((res) => setCommunity(res.data?.community ?? null))
      .catch(() => setCommunity(null));
  }, [user]);

  // Nav entrance animation
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
    );
  }, []);

  // Dropdown entrance animation
  useEffect(() => {
    if (!dropRef.current || !profileOpen) return;
    gsap.fromTo(
      dropRef.current,
      { opacity: 0, y: -8, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
    );
  }, [profileOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.parentElement.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/login");
  };

  // Display name: prefer community name, fall back to user's full_name
  const displayName = community?.name ?? user?.full_name ?? "Community";
  const avatarUrl   = community?.logo_url ?? user?.avatar_url ?? null;
  const isVerified  = community?.status === "verified";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
      style={{
        backgroundColor: "var(--color-cream-light)",
        borderBottom: "1px solid var(--color-border-soft)",
      }}
    >
      {/* Logo + mobile sidebar toggle */}
      <div
        className="flex items-center gap-3 px-4 md:px-6 shrink-0"
        style={{ width: "260px" }}
      >
        {/* Hamburger — only visible on mobile */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <Link to="/community" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Bond Logo"
            className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className="text-lg font-semibold tracking-tight hidden sm:block"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-forest-deep)",
            }}
          >
            Bond.
          </span>
        </Link>
      </div>

      {/* Center: page label */}
      <div className="flex-1 px-4 hidden md:flex items-center">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          Community Dashboard
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 px-4 md:px-6 ml-auto">
        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ backgroundColor: "var(--color-amber)", color: "white" }}
            >
              {notifCount}
            </span>
          )}
        </button>

        {/* Earnings shortcut — hidden on very small screens */}
        <NavLink
          to="/community/earnings"
          className={({ isActive }) =>
            `hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? "" : "hover:bg-black/5"
            }`
          }
          style={({ isActive }) => ({
            color: isActive ? "var(--color-amber)" : "var(--color-text-mid)",
            backgroundColor: isActive ? "var(--color-amber-light)" : "",
          })}
        >
          <DollarSign size={15} />
          Earnings
        </NavLink>

        {/* Profile dropdown */}
        <div className="relative ml-1">
          <button
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-black/5 transition-colors"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            <span className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  className="w-8 h-8 rounded-full object-cover"
                  alt={displayName}
                />
              ) : (
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--color-amber-light)",
                    color: "var(--color-amber)",
                  }}
                >
                  {initials}
                </span>
              )}
              {isVerified && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-forest-light)" }}
                >
                  <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                    <path
                      d="M1 3.5L2.8 5.5L6 1.5"
                      stroke="white"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </span>

            {/* Name — hidden on mobile */}
            <span
              className="hidden md:block text-sm font-medium max-w-[120px] truncate"
              style={{ color: "var(--color-text-dark)" }}
            >
              {displayName}
            </span>

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
              ref={dropRef}
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--color-cream-light)",
                border: "1px solid var(--color-border-soft)",
                boxShadow: "var(--shadow-modal)",
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--color-border-soft)" }}
              >
                <div className="flex items-center gap-1.5">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--color-text-dark)" }}
                  >
                    {displayName}
                  </p>
                  {isVerified && (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "var(--color-forest-light)" }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 4L3 5.5L6.5 2"
                          stroke="white"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {user?.full_name ?? "Community Host"}
                </p>
              </div>

              {/* Nav links */}
              <div className="py-1.5">
                {[
                  { icon: LayoutDashboard, label: "Dashboard",     to: "/community" },
                  { icon: User,            label: "Profile Setup",  to: "/community/profile" },
                  { icon: DollarSign,      label: "Earnings",       to: "/community/earnings" },
                ].map(({ icon: Icon, label, to }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                    style={{ color: "var(--color-text-mid)" }}
                    onClick={() => { navigate(to); setProfileOpen(false); }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
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