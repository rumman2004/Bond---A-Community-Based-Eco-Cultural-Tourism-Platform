import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Map, Bell, ChevronDown, LogOut, Shield, User, Settings } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function AdminNav() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef    = useRef(null);
  const dropRef   = useRef(null);
  const wrapRef   = useRef(null);
  const navigate  = useNavigate();

  // ── Real auth ────────────────────────────────────────────────
  const { user, logout } = useAuth();

  const displayName = user?.full_name ?? user?.name ?? "Admin";
  const displayRole = user?.role ?? "admin";
  const avatarUrl   = user?.avatar_url ?? null;
  const initials    = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ── Entrance animation ────────────────────────────────────────
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  // ── Dropdown animation ────────────────────────────────────────
  useEffect(() => {
    if (!dropRef.current || !profileOpen) return;
    gsap.fromTo(
      dropRef.current,
      { opacity: 0, y: -8, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
    );
  }, [profileOpen]);

  // ── Close on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await logout?.();
    } catch (_) {
      // ignore
    }
    navigate("/login");
  };

  return (
    <header
      ref={navRef}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: "64px",
        display: "flex", alignItems: "center",
        background: "linear-gradient(90deg, #0f1f0f 0%, #1a2e1a 60%, #1e331e 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.25)",
      }}
    >
      {/* ── Logo zone — exact sidebar width ───────────────────── */}
      <div style={{
        width: "260px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: "10px",
        padding: "0 20px",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}>
        <Link
          to="/admin"
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            textDecoration: "none",
          }}
        >
          {/* Logo image */}
          <img
            src="/logo.png"
            alt="Bond Logo"
            style={{
              width: "36px", height: "36px",
              objectFit: "contain",
              flexShrink: 0,
              transition: "transform 0.2s",
            }}
          />
          {/* Wordmark */}
          <span style={{
            fontSize: "18px", fontWeight: "700", color: "#fff",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            letterSpacing: "-0.02em",
          }}>
            Bond.
          </span>
        </Link>
        {/* Admin badge */}
        <span style={{
          fontSize: "9px", fontWeight: "800", letterSpacing: "0.12em",
          padding: "3px 7px", borderRadius: "5px",
          background: "rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
        }}>
          ADMIN
        </span>
      </div>

      {/* ── Center breadcrumb ─────────────────────────────────── */}
      <div style={{ flex: 1, padding: "0 28px", display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 6px #4ade80",
          }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontWeight: "500" }}>
            Admin Control Panel
          </span>
        </div>
      </div>

      {/* ── Right actions ─────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "0 20px",
      }}>
        {/* Notification bell — wired but display-only badge */}
        <button
          title="Notifications"
          style={{
            position: "relative",
            width: "38px", height: "38px", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <Bell size={17} strokeWidth={1.8} />
        </button>

        {/* Vertical divider */}
        <div style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

        {/* Profile dropdown trigger */}
        <div ref={wrapRef} style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "5px 10px 5px 6px", borderRadius: "12px",
              background: profileOpen ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!profileOpen) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              if (!profileOpen) e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              />
            ) : (
              <span style={{
                width: "32px", height: "32px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700",
                background: "linear-gradient(135deg, #2d4a2d, #4a6741)",
                color: "#fff", flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.15)",
              }}>
                {initials}
              </span>
            )}

            {/* Name */}
            <span style={{
              fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.85)",
              maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {displayName}
            </span>

            {/* Caret */}
            <ChevronDown
              size={13}
              style={{
                color: "rgba(255,255,255,0.4)",
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}
            />
          </button>

          {/* ── Dropdown ──────────────────────────────────────── */}
          {profileOpen && (
            <div
              ref={dropRef}
              style={{
                position: "absolute", right: 0, top: "calc(100% + 10px)",
                width: "220px", borderRadius: "16px",
                background: "#fff",
                border: "1px solid #e8d9c4",
                boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              {/* User info block */}
              <div style={{
                padding: "14px 16px",
                background: "linear-gradient(135deg, #1a2e1a, #2d4a2d)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}>
                <p style={{
                  fontSize: "13px", fontWeight: "700", color: "#fff",
                  marginBottom: "3px",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {displayName}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: "700", letterSpacing: "0.07em",
                    padding: "2px 7px", borderRadius: "999px", textTransform: "uppercase",
                    background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)",
                  }}>
                    {displayRole}
                  </span>
                </div>
              </div>

              {/* Nav items */}
              <div style={{ padding: "6px" }}>
                {[
                  { icon: User,   label: "My Account",    to: "/admin/account" },
                  { icon: Shield, label: "Activity Logs", to: "/admin/logs"    },
                  { icon: Settings, label: "Settings",    to: "/admin/settings", disabled: true },
                ].map(({ icon: Icon, label, to, disabled }) => (
                  <button
                    key={label}
                    disabled={disabled}
                    onClick={() => { navigate(to); setProfileOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px", borderRadius: "10px",
                      background: "transparent", border: "none",
                      fontSize: "13px", fontWeight: "500",
                      color: disabled ? "#c0b8ae" : "#3a2e20",
                      cursor: disabled ? "not-allowed" : "pointer",
                      transition: "background 0.12s",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled) e.currentTarget.style.background = "#fef9f0";
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <Icon size={14} style={{ color: disabled ? "#c0b8ae" : "#8a7560", flexShrink: 0 }} />
                    {label}
                    {disabled && (
                      <span style={{
                        marginLeft: "auto", fontSize: "10px", fontWeight: "600",
                        color: "#c0b8ae", letterSpacing: "0.05em",
                      }}>
                        SOON
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div style={{ padding: "6px", borderTop: "1px solid #f0e8dc" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 12px", borderRadius: "10px",
                    background: "transparent", border: "none",
                    fontSize: "13px", fontWeight: "600",
                    color: "#9a3412", cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff1ee"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <LogOut size={14} style={{ flexShrink: 0 }} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}