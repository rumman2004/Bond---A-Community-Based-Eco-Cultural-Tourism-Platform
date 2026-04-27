import { useEffect, useState } from "react";
import { AlertTriangle, Coins, Target, Calendar } from "lucide-react";
import PageShell from "../PageShell";
import api from "../../services/api";

const C = {
  forest: "#1a2e1a", forestMid: "#2d4a2d", forestLight: "#4a6741",
  amber: "#d97706", amberLight: "#fef3c7",
  terra: "#9a3412", terraLight: "#fff1ee",
  muted: "#8a7560", dark: "#1a150f",
  border: "#e8d9c4", card: "#fff", bg: "#fffdf8", cream: "#fef9f0",
};

const KpiCard = ({ label, value, icon }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: "16px", padding: "24px",
    transition: "transform 0.2s, box-shadow 0.2s",
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
    <p style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: C.muted, marginBottom: "6px" }}>
      {label}
    </p>
    <p style={{ fontSize: "28px", fontWeight: "700", color: C.forest, fontFamily: "Georgia, serif", lineHeight: 1 }}>
      {value}
    </p>
  </div>
);

const SectionHeader = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
    <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.dark, whiteSpace: "nowrap" }}>{title}</h2>
    <div style={{ flex: 1, height: "1px", background: C.border }} />
  </div>
);

const SmallCard = ({ title, sub, badge }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: "12px", padding: "16px",
    transition: "box-shadow 0.15s",
  }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
  >
    {badge && (
      <span style={{
        display: "inline-block", marginBottom: "8px",
        padding: "2px 10px", borderRadius: "999px",
        fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase",
        background: C.amberLight, color: C.amber,
      }}>{badge}</span>
    )}
    <p style={{ fontSize: "13px", fontWeight: "600", color: C.dark, marginBottom: "4px" }}>{title}</p>
    <p style={{ fontSize: "12px", color: C.muted }}>{sub}</p>
  </div>
);

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => Number(d.revenue ?? 0)), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px", padding: "0 4px" }}>
      {data.map((row) => {
        const h = Math.max((Number(row.revenue ?? 0) / max) * 80, 2);
        return (
          <div key={row.month} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: "4px",
          }}>
            <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
              <div
                title={`₹${Number(row.revenue ?? 0).toLocaleString("en-IN")}`}
                style={{
                  width: "80%", height: `${h}px`, borderRadius: "4px 4px 2px 2px",
                  background: `linear-gradient(to top, ${C.forest}, ${C.forestLight})`,
                  opacity: 0.85, cursor: "default",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.85}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [trend, setTrend]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/admin/analytics"),
      api.get("/admin/booking-trend"),
    ])
      .then(([aRes, tRes]) => {
        setAnalytics(aRes.data);
        setTrend(tRes.data?.trend ?? []);
      })
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue  = trend.reduce((s, m) => s + Number(m.revenue ?? 0), 0);
  const totalBookings = trend.reduce((s, m) => s + Number(m.total_bookings ?? 0), 0);
  const avgOrder      = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  return (
    <PageShell title="Analytics" subtitle="Platform trends and top performers.">
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: "110px", borderRadius: "16px",
                background: "linear-gradient(90deg, #f5ede0 25%, #fdf5ea 50%, #f5ede0 75%)",
                backgroundSize: "200% 100%", animation: `shimmer 1.4s infinite`,
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
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

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>

          {/* ── KPI cards ────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
            <KpiCard label="Total Revenue (12 mo)" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={<Coins size={24} />} />
            <KpiCard label="Avg Order Value"         value={`₹${avgOrder.toLocaleString("en-IN")}`}    icon={<Target size={24} />} />
            <KpiCard label="Bookings (12 mo)"        value={totalBookings.toLocaleString()}            icon={<Calendar size={24} />} />
          </div>

          {/* ── Revenue bar chart ─────────────────────────────────── */}
          {trend.length > 0 && (
            <div>
              <SectionHeader title="Monthly Revenue" />
              <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: "16px", padding: "24px",
              }}>
                <BarChart data={trend} />
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginTop: "8px", paddingTop: "8px",
                  borderTop: `1px solid ${C.border}`,
                }}>
                  {trend.map((row) => (
                    <span key={row.month} style={{
                      flex: 1, textAlign: "center", fontSize: "10px",
                      color: C.muted, letterSpacing: "0.02em",
                    }}>
                      {new Date(row.month).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Category breakdown ───────────────────────────────── */}
          {analytics?.category_breakdown?.length > 0 && (
            <div>
              <SectionHeader title="Experiences by Category" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                {analytics.category_breakdown.map((c) => (
                  <SmallCard
                    key={c.category}
                    title={c.category ?? "Uncategorised"}
                    sub={`${c.total} experiences · ★ ${Number(c.avg_rating).toFixed(1)}`}
                    badge={c.category}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Top communities ──────────────────────────────────── */}
          {analytics?.top_communities?.length > 0 && (
            <div>
              <SectionHeader title="Top Communities" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                {analytics.top_communities.map((c, i) => (
                  <div key={c.id} style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: "12px", padding: "16px",
                    display: "flex", gap: "12px", alignItems: "flex-start",
                    transition: "box-shadow 0.15s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                  >
                    <span style={{
                      width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: "700",
                      background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : "#fef9f0",
                      color: i === 0 ? "#92400e" : i === 1 ? "#475569" : C.muted,
                    }}>
                      #{i + 1}
                    </span>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: C.dark, marginBottom: "3px" }}>{c.name}</p>
                      <p style={{ fontSize: "11px", color: C.muted }}>
                        {c.state} · ★ {c.avg_rating} · {c.total_bookings} bookings
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Top experiences ──────────────────────────────────── */}
          {analytics?.top_experiences?.length > 0 && (
            <div>
              <SectionHeader title="Top Experiences" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                {analytics.top_experiences.map((e, i) => (
                  <div key={e.id} style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: "12px", padding: "16px",
                    display: "flex", gap: "12px", alignItems: "flex-start",
                    transition: "box-shadow 0.15s",
                  }}
                    onMouseEnter={(el) => el.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
                    onMouseLeave={(el) => el.currentTarget.style.boxShadow = "none"}
                  >
                    <span style={{
                      width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: "700",
                      background: i === 0 ? "#fef3c7" : "#fef9f0",
                      color: i === 0 ? "#92400e" : C.muted,
                    }}>
                      #{i + 1}
                    </span>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: C.dark, marginBottom: "3px" }}>{e.title}</p>
                      <p style={{ fontSize: "11px", color: C.muted }}>
                        {e.community_name} · ★ {e.avg_rating} · {e.total_bookings} bookings
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Monthly trend table ──────────────────────────────── */}
          {trend.length > 0 && (
            <div>
              <SectionHeader title="Monthly Booking Trend" />
              <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: "16px", overflow: "hidden",
              }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#fef9f0" }}>
                        {["Month", "Bookings", "Completed", "Revenue (₹)"].map((h, i) => (
                          <th key={h} style={{
                            padding: "12px 16px",
                            textAlign: i === 0 ? "left" : "right",
                            fontSize: "11px", fontWeight: "700",
                            letterSpacing: "0.06em", textTransform: "uppercase",
                            color: C.muted,
                            borderBottom: `1px solid ${C.border}`,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trend.map((row, i) => (
                        <tr
                          key={row.month}
                          style={{ background: i % 2 === 0 ? C.card : "#fefcf8" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#fef9f0"}
                          onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? C.card : "#fefcf8"}
                        >
                          <td style={{ padding: "12px 16px", color: C.dark, fontWeight: "500" }}>
                            {new Date(row.month).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: C.muted }}>{row.total_bookings}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: "#15803d" }}>{row.completed}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: C.forest, fontWeight: "600" }}>
                            {Number(row.revenue ?? 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}