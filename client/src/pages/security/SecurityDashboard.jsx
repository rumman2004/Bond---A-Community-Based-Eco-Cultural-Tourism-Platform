import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  AlertTriangle,
  UserX,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import securityService from "../../services/securityService";

function StatCard({ icon: Icon, label, value, sub, accent, to }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        backgroundColor: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Icon chip */}
      <span
        className="inline-flex w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: accent + "18" }}
      >
        <Icon size={18} style={{ color: accent }} strokeWidth={1.8} />
      </span>

      {/* Value */}
      <div>
        <p
          className="text-4xl font-bold tracking-tight"
          style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
        >
          {value ?? "—"}
        </p>
        <p
          className="mt-1 text-sm font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
            {sub}
          </p>
        )}
      </div>

      {/* Arrow on hover */}
      <ArrowRight
        size={15}
        className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
        style={{ color: accent }}
      />
    </Link>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2
        className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    securityService
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      icon: ShieldCheck,
      label: "Pending Verifications",
      value: stats?.pending_communities,
      sub: "Communities awaiting review",
      accent: "var(--color-forest)",
      to: "/security/verify-communities",
    },
    {
      icon: AlertTriangle,
      label: "Open Complaints",
      value: stats?.open_reports,
      sub: "Reports needing triage",
      accent: "var(--color-terracotta)",
      to: "/security/complaints",
    },
    {
      icon: UserX,
      label: "Suspended Users",
      value: stats?.suspended_users,
      sub: "Accounts under restriction",
      accent: "#C8883A",
      to: "/security/suspended-users",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
          >
            Security Overview
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Platform safety queue — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--color-forest)" }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: "var(--color-forest)" }} />
          </span>
          On Duty
        </span>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
        >
          {error}
        </div>
      )}

      {/* Stat cards */}
      <Section title="Queue Summary">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl animate-pulse"
                style={{ backgroundColor: "var(--color-border-soft)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {cards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>
        )}
      </Section>

      {/* Quick links */}
      <Section title="Quick Actions">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: CheckCircle2, label: "Review next pending community", to: "/security/verify-communities", accent: "var(--color-forest)" },
            { icon: Clock, label: "Triage open complaints", to: "/security/complaints", accent: "var(--color-terracotta)" },
            { icon: UserX, label: "Manage suspended accounts", to: "/security/suspended-users", accent: "#C8883A" },
            { icon: TrendingUp, label: "Monitor platform activity", to: "/security/monitor-users", accent: "var(--color-text-mid)" },
          ].map(({ icon: Icon, label, to, accent }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-black/5"
              style={{ border: "1px solid var(--color-border-soft)" }}
            >
              <Icon size={16} style={{ color: accent }} strokeWidth={1.8} />
              <span className="flex-1 text-sm font-medium" style={{ color: "var(--color-text-dark)" }}>
                {label}
              </span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}