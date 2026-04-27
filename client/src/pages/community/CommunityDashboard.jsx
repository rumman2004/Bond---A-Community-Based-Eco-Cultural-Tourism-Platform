import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Star, Layers, ArrowUpRight, Clock, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";
import PageShell from "../PageShell";
import communityService from "../../services/communityService";
import bookingService from "../../services/bookingService";

const card = "bg-white rounded-2xl border border-[#E8E1D5] p-5";

function StatCard({ label, value, icon: Icon, accent = "#1C3D2E", sub }) {
  return (
    <div className={card + " flex flex-col gap-3"}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9285]">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: accent + "18" }}>
          <Icon size={15} style={{ color: accent }} />
        </span>
      </div>
      <p className="text-[2rem] font-bold tracking-tight text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
        {value ?? <span className="inline-block h-9 w-24 animate-pulse rounded-lg bg-[#E8E1D5]" />}
      </p>
      {sub && <p className="text-xs text-[#9A9285]">{sub}</p>}
    </div>
  );
}

const STATUS_META = {
  pending:   { label: "Pending",   color: "#C8883A", bg: "#FDF3E7", Icon: Clock },
  confirmed: { label: "Confirmed", color: "#3E7A58", bg: "#EAF3EE", Icon: CheckCircle },
  completed: { label: "Completed", color: "#1C3D2E", bg: "#DFF0E7", Icon: CheckCircle },
  rejected:  { label: "Rejected",  color: "#B94040", bg: "#FAEAEA", Icon: XCircle },
  cancelled: { label: "Cancelled", color: "#9A9285", bg: "#F0EBE3", Icon: AlertCircle },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: m.bg, color: m.color }}>
      <m.Icon size={11} />{m.label}
    </span>
  );
}

export default function CommunityDashboard() {
  const [stats,    setStats]    = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    Promise.all([
      communityService.getStats(),
      bookingService.getCommunityBookings(),
    ])
      .then(([sRes, bRes]) => {
        setStats(sRes?.data ?? sRes);
        const list = bRes?.data?.bookings ?? bRes?.bookings ?? bRes ?? [];
        setBookings(Array.isArray(list) ? list.slice(0, 5) : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const s = stats ?? {};

  const fmt = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <PageShell title="Dashboard" subtitle="Overview of your hosting activity">

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* ── Stat grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Bookings" icon={Calendar}
          value={loading ? null : (s.total_bookings ?? "—")}
          accent="#1C3D2E" sub="All time" />
        <StatCard label="Revenue" icon={TrendingUp}
          value={loading ? null : fmt(s.total_revenue)}
          accent="#3E7A58" sub="Net earnings" />
        <StatCard label="Experiences" icon={Layers}
          value={loading ? null : (s.total_experiences ?? "—")}
          accent="#C8883A" sub="Live listings" />
        <StatCard label="Avg Rating" icon={Star}
          value={loading ? null : s.avg_rating != null ? Number(s.avg_rating).toFixed(1) : "—"}
          accent="#B94040"
          sub={s.total_reviews ? `${s.total_reviews} reviews` : "No reviews yet"} />
      </div>

      {/* ── Recent bookings ── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[#1A2820]">Recent Bookings</h2>
          <a href="/community/bookings"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#3E7A58] hover:underline">
            View all <ArrowUpRight size={12} />
          </a>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F5F2EE]" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Users size={32} className="text-[#D4C9BB] mb-3" />
            <p className="text-sm font-medium text-[#9A9285]">No bookings yet</p>
            <p className="text-xs text-[#B8AFA4] mt-1">Traveller bookings will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F2EE]">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1A2820]">
                    {b.experience_title ?? b.title ?? "Booking"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#9A9285]">
                    {fmtDate(b.date)}{b.guests ? ` · ${b.guests} guest${b.guests > 1 ? "s" : ""}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {b.total_amount != null && (
                    <span className="text-sm font-semibold text-[#1C3D2E]">{fmt(b.total_amount)}</span>
                  )}
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}