import { useEffect, useState } from "react";
import { Users, Home, Leaf, Calendar, Coins, CheckCircle, Hourglass, ShieldAlert, Lock, AlertTriangle } from "lucide-react";
import PageShell from "../PageShell";
import api from "../../services/api";

const StatCard = ({ label, value, sub, highlight, icon }) => (
  <div
    style={{
      background: highlight
        ? "linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)"
        : "linear-gradient(135deg, #fff8f0 0%, #fef3e2 100%)",
      border: highlight ? "none" : "1px solid #e8d9c4",
      borderRadius: "16px",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {/* Decorative circle */}
    <div style={{
      position: "absolute", top: "-20px", right: "-20px",
      width: "80px", height: "80px", borderRadius: "50%",
      background: highlight ? "rgba(255,255,255,0.08)" : "rgba(74,93,65,0.07)",
    }} />
    <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
    <p style={{
      fontSize: "12px", fontWeight: "600", letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: highlight ? "rgba(255,220,190,0.85)" : "#8a7560",
      marginBottom: "6px",
    }}>
      {label}
    </p>
    <p style={{
      fontSize: "32px", fontWeight: "700", lineHeight: 1,
      fontFamily: "'Georgia', serif",
      color: highlight ? "#fff" : "#1a2e1a",
      marginBottom: "6px",
    }}>
      {value}
    </p>
    {sub && (
      <p style={{
        fontSize: "11px",
        color: highlight ? "rgba(255,220,190,0.7)" : "#a89070",
      }}>
        {sub}
      </p>
    )}
  </div>
);

const SectionDivider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
    <div style={{ flex: 1, height: "1px", background: "#e8d9c4" }} />
    <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a89070" }}>
      {label}
    </span>
    <div style={{ flex: 1, height: "1px", background: "#e8d9c4" }} />
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [secStats, setSecStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch admin stats first (required), security stats are optional
    api.get("/admin/stats")
      .then((adminRes) => {
        setStats(adminRes.data);
        // Try security stats but don't fail if unavailable
        return api.get("/security/stats").catch(() => null);
      })
      .then((secRes) => {
        if (secRes) setSecStats(secRes.data);
      })
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  const primaryCards = stats ? [
    {
      label: "Total Users",
      value: Number(stats.users?.total ?? 0).toLocaleString(),
      sub: stats.users?.new_this_month != null ? `+${stats.users.new_this_month} this month` : null,
      icon: <Users size={24} />,
      highlight: false,
    },
    {
      label: "Communities",
      value: Number(stats.communities?.total ?? 0).toLocaleString(),
      sub: stats.communities?.verified != null ? `${stats.communities.verified} verified` : null,
      icon: <Home size={24} />,
      highlight: false,
    },
    {
      label: "Experiences",
      value: Number(stats.experiences?.total ?? 0).toLocaleString(),
      sub: stats.experiences?.active != null ? `${stats.experiences.active} active` : null,
      icon: <Leaf size={24} />,
      highlight: false,
    },
    {
      label: "Total Bookings",
      value: Number(stats.bookings?.total ?? 0).toLocaleString(),
      sub: stats.bookings?.this_month != null ? `${stats.bookings.this_month} this month` : null,
      icon: <Calendar size={24} />,
      highlight: false,
    },
  ] : [];

  const revenueCards = stats ? [
    {
      label: "Total Revenue",
      value: "₹" + Number(stats.total_revenue ?? 0).toLocaleString("en-IN"),
      sub: "from completed bookings",
      icon: <Coins size={24} />,
      highlight: false,
    },
    {
      label: "Completed Bookings",
      value: Number(stats.bookings?.completed ?? 0).toLocaleString(),
      sub: `${stats.bookings?.cancelled ?? 0} cancelled`,
      icon: <CheckCircle size={24} />,
      highlight: false,
    },
  ] : [];

  const alertCards = [
    ...(stats ? [{
      label: "Pending Verification",
      value: stats.communities?.pending ?? "0",
      sub: "communities awaiting review",
      icon: <Hourglass size={24} />,
      highlight: (parseInt(stats.communities?.pending) || 0) > 0,
    }] : []),
    ...(secStats ? [{
      label: "Open Reports",
      value: secStats.open_reports ?? "0",
      sub: "require attention",
      icon: <ShieldAlert size={24} />,
      highlight: (parseInt(secStats.open_reports) || 0) > 0,
    }, {
      label: "Suspended Users",
      value: secStats.suspended_users ?? "0",
      sub: "accounts on hold",
      icon: <Lock size={24} />,
      highlight: false,
    }] : []),
  ];

  return (
    <PageShell title="Admin Dashboard" subtitle="Platform health at a glance.">
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "40px 0" }}>
          <div style={{
            width: "20px", height: "20px", borderRadius: "50%",
            border: "2px solid #e8d9c4", borderTopColor: "#4a5d41",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: "14px", color: "#8a7560" }}>Loading dashboard…</span>
        </div>
      )}

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: "12px", padding: "16px",
          color: "#dc2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!loading && !error && stats && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Platform Overview */}
          <div>
            <SectionDivider label="Platform Overview" />
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}>
              {primaryCards.map((c) => <StatCard key={c.label} {...c} />)}
            </div>
          </div>

          {/* Revenue */}
          <div>
            <SectionDivider label="Revenue" />
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}>
              {revenueCards.map((c) => <StatCard key={c.label} {...c} />)}
            </div>
          </div>

          {/* Alerts & Moderation */}
          {alertCards.length > 0 && (
            <div>
              <SectionDivider label="Alerts & Moderation" />
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "16px",
                marginTop: "16px",
              }}>
                {alertCards.map((c) => <StatCard key={c.label} {...c} />)}
              </div>
            </div>
          )}

          {/* Quick info bar */}
          <div style={{
            background: "linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%)",
            borderRadius: "16px",
            padding: "20px 28px",
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            alignItems: "center",
          }}>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                Tourists
              </p>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#fff", fontFamily: "Georgia, serif" }}>
                {Number(stats.users?.tourists ?? 0).toLocaleString()}
              </p>
            </div>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                Community Owners
              </p>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#fff", fontFamily: "Georgia, serif" }}>
                {Number(stats.users?.community_owners ?? 0).toLocaleString()}
              </p>
            </div>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                Pending Communities
              </p>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#f97316", fontFamily: "Georgia, serif" }}>
                {Number(stats.communities?.pending ?? 0).toLocaleString()}
              </p>
            </div>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                Cancelled Bookings
              </p>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#fff", fontFamily: "Georgia, serif" }}>
                {Number(stats.bookings?.cancelled ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}