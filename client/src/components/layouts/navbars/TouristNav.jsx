import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  BookOpen,
  ChevronDown,
  Compass,
  Heart,
  LogOut,
  Map,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const NAV_LINKS = [
  { to: "/tourist", label: "Home", end: true },
  { to: "/tourist/explore", label: "Explore", end: false },
  { to: "/tourist/stories", label: "Stories", end: false },
  { to: "/tourist/bookings", label: "Bookings", end: false },
];

export default function TouristNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const dropRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 });
  }, []);

  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (mobileOpen) {
      gsap.fromTo(mobileMenuRef.current, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(mobileMenuRef.current, { height: 0, opacity: 0, duration: 0.25, ease: "power2.in" });
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!dropRef.current || !profileOpen) return;
    gsap.fromTo(dropRef.current, { opacity: 0, y: -8, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" });
  }, [profileOpen]);

  useEffect(() => {
    const handler = (event) => {
      if (dropRef.current && !dropRef.current.parentElement.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeMobile = () => setMobileOpen(false);
  const displayName = user?.name || user?.full_name || "Traveller";
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/auth/login", { replace: true });
  };

  const menuItems = [
    { icon: User, label: "My Profile", to: "/tourist/profile" },
    { icon: BookOpen, label: "My Bookings", to: "/tourist/bookings" },
    { icon: Heart, label: "Favorites", to: "/tourist/favorites" },
  ];

  return (
    <header ref={navRef} className="fixed left-0 right-0 top-0 z-50 px-3 pt-3">
      <nav
        className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-[12px] px-3.5 sm:px-5"
        style={{
          backgroundColor: scrolled ? "rgba(250,247,242,0.92)" : "rgba(250,247,242,0.76)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(28,61,46,0.12)",
          boxShadow: scrolled ? "0 12px 32px rgba(28,61,46,0.10)" : "0 6px 20px rgba(28,61,46,0.06)",
          transition: "background-color 0.25s, box-shadow 0.25s",
        }}
      >
        <Link to="/tourist" className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <img
            src="/logo.png"
            alt="Bond Logo"
            className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-display text-lg font-semibold tracking-tight text-[#1C3D2E]">Bond.</span>
        </Link>

        <ul className="hidden items-center gap-1 rounded-full bg-white/55 p-1 ring-1 ring-[rgba(28,61,46,0.08)] md:flex">
          {NAV_LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive ? "" : "hover:bg-white/80"}`
                }
                style={({ isActive }) => ({
                  color: isActive ? "var(--color-forest)" : "var(--color-text-mid)",
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

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/tourist/explore"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[#3D5448] transition-colors duration-200 hover:bg-white/70 hover:text-[#1C3D2E]"
          >
            <Search size={14} />
            Search
          </Link>
          <NavLink
            to="/tourist/favorites"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#7A9285] transition hover:bg-white/70 hover:text-[#A04D38]"
            title="Favorites"
          >
            <Heart size={17} />
          </NavLink>

          <div className="relative">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-white/60 py-1 pl-1 pr-2 text-sm font-medium text-[#3D5448] ring-1 ring-[rgba(28,61,46,0.08)] transition hover:bg-white"
              onClick={() => setProfileOpen((value) => !value)}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} className="h-8 w-8 rounded-full object-cover" alt={displayName} />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4E6DC] text-xs font-semibold text-[#1C3D2E]">
                  {initials}
                </span>
              )}
              <ChevronDown size={14} className={`transition ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div
                ref={dropRef}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] shadow-xl"
              >
                <div className="border-b border-[#E8E1D5] px-4 py-3">
                  <p className="text-sm font-semibold text-[#1A2820]">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs text-[#7A9285]">{user?.email || "Tourist"}</p>
                </div>
                <div className="py-1.5">
                  {menuItems.map(({ icon: Icon, label, to }) => (
                    <button
                      key={label}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#3D5448] transition hover:bg-white/70"
                      onClick={() => {
                        navigate(to);
                        setProfileOpen(false);
                      }}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#E8E1D5] py-1.5">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#A04D38] transition hover:bg-[#FAF0EC]"
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

        <button
          className="rounded-lg p-2 text-[#1C3D2E] transition-colors hover:bg-white/70 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        className="overflow-hidden md:hidden"
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
        <div className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMobile}
              className="rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150"
              style={({ isActive }) => ({
                color: isActive ? "var(--color-forest)" : "var(--color-text-mid)",
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? "var(--color-forest-pale)" : "transparent",
              })}
            >
              {label}
            </NavLink>
          ))}
          <div className="mt-3 flex flex-col gap-1 border-t border-[#E8E1D5] pt-4">
            {menuItems.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={closeMobile}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#3D5448]"
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <button
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-[#F2EDE4]"
              style={{ background: "linear-gradient(135deg, var(--color-forest-deep), var(--color-river))" }}
              onClick={handleLogout}
            >
              <Compass size={14} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
