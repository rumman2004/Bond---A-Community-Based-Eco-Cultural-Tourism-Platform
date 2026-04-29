import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Coins,
  Home,
  Hourglass,
  Leaf,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import PageShell from "../PageShell";
import api from "../../services/api";
import { Card, MetricCard } from "../../components/ui";

const formatNumber = (value) => Number(value ?? 0).toLocaleString();
const formatMoney = (value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

function InfoPill({ label, value, tone = "text-white" }) {
  return (
    <div className="min-w-[150px] flex-1 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase text-white/50">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [secStats, setSecStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin/stats")
      .then((adminRes) => {
        setStats(adminRes.data);
        return api.get("/security/stats").catch(() => null);
      })
      .then((secRes) => {
        if (secRes) setSecStats(secRes.data);
      })
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      title="Admin Dashboard"
      kicker="Control center"
      subtitle="Platform health, revenue, moderation signals, and review queues at a glance."
      icon={ShieldCheck}
    >
      {error && (
        <Card className="mb-6 border-[#EBB8AA] bg-[#FAF0EC]">
          <div className="flex items-center gap-3 text-sm font-medium text-[#A04D38]">
            <AlertTriangle size={18} />
            {error}
          </div>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Users"
          value={formatNumber(stats?.users?.total)}
          helper={stats?.users?.new_this_month != null ? `+${stats.users.new_this_month} this month` : "All registered accounts"}
          icon={Users}
          tone="river"
          loading={loading}
        />
        <MetricCard
          label="Communities"
          value={formatNumber(stats?.communities?.total)}
          helper={stats?.communities?.verified != null ? `${stats.communities.verified} verified` : "Community profiles"}
          icon={Home}
          tone="forest"
          loading={loading}
        />
        <MetricCard
          label="Experiences"
          value={formatNumber(stats?.experiences?.total)}
          helper={stats?.experiences?.active != null ? `${stats.experiences.active} active` : "All listings"}
          icon={Leaf}
          tone="amber"
          loading={loading}
        />
        <MetricCard
          label="Bookings"
          value={formatNumber(stats?.bookings?.total)}
          helper={stats?.bookings?.this_month != null ? `${stats.bookings.this_month} this month` : "Total bookings"}
          icon={Calendar}
          tone="indigo"
          loading={loading}
        />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card padding="lg" className="overflow-hidden bg-[#173426] text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#A8CCBA]">Revenue</p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
                {loading ? "..." : formatMoney(stats?.total_revenue)}
              </h2>
              <p className="mt-2 text-sm text-white/55">From completed bookings across the platform.</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#F5C842]">
              <Coins size={22} />
            </span>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <InfoPill label="Tourists" value={formatNumber(stats?.users?.tourists)} />
            <InfoPill label="Community Owners" value={formatNumber(stats?.users?.community_owners)} />
            <InfoPill label="Pending Communities" value={formatNumber(stats?.communities?.pending)} tone="text-[#F5C842]" />
            <InfoPill label="Cancelled Bookings" value={formatNumber(stats?.bookings?.cancelled)} />
          </div>
        </Card>

        <Card padding="lg">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-[#3E7A58]">Attention</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-[#1A2820]">Moderation queue</h2>
            </div>
            <ShieldAlert size={22} className="text-[#C8883A]" />
          </div>

          <div className="space-y-3">
            {[
              { label: "Pending Verification", value: stats?.communities?.pending, helper: "Communities awaiting review", icon: Hourglass, tone: "bg-[#F5E4CA] text-[#96601F]" },
              { label: "Open Reports", value: secStats?.open_reports, helper: "Security reports requiring attention", icon: ShieldAlert, tone: "bg-[#FAF0EC] text-[#A04D38]" },
              { label: "Suspended Users", value: secStats?.suspended_users, helper: "Accounts currently on hold", icon: Lock, tone: "bg-[#E6EAF2] text-[#33415C]" },
            ].map(({ label, value, helper, icon: Icon, tone }) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-[#E8E1D5] bg-[#FAF7F2] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                    <Icon size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1A2820]">{label}</p>
                    <p className="text-xs text-[#7A9285]">{helper}</p>
                  </div>
                </div>
                <p className="font-display text-2xl font-semibold text-[#1A2820]">
                  {loading && !stats ? "..." : formatNumber(value)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Completed Bookings"
          value={formatNumber(stats?.bookings?.completed)}
          helper={`${formatNumber(stats?.bookings?.cancelled)} cancelled`}
          icon={CheckCircle}
          tone="forest"
          loading={loading}
        />
        <MetricCard
          label="Security Snapshot"
          value={secStats ? `${formatNumber(secStats.open_reports)} open` : "Optional"}
          helper={secStats ? "Security service connected" : "Security stats unavailable or still loading"}
          icon={ShieldCheck}
          tone={secStats ? "river" : "indigo"}
          loading={loading && !secStats}
        />
      </section>
    </PageShell>
  );
}
