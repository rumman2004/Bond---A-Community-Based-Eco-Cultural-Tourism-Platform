import { useState, useEffect } from "react";
import { TrendingUp, Clock, CheckCircle, AlertCircle, ArrowDownCircle } from "lucide-react";
import PageShell from "../PageShell";
import communityService from "../../services/communityService";
import bookingService from "../../services/bookingService";

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

function MetricCard({ label, value, icon: Icon, color, bg, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9285]">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: bg }}>
          <Icon size={15} style={{ color }} />
        </span>
      </div>
      {loading
        ? <div className="h-9 w-28 animate-pulse rounded-lg bg-[#E8E1D5]" />
        : <p className="text-[2rem] font-bold tracking-tight text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
      }
    </div>
  );
}

const STATUS_MAP = {
  pending:   { color: "#C8883A", bg: "#FDF3E7" },
  confirmed: { color: "#3E7A58", bg: "#EAF3EE" },
  completed: { color: "#1C3D2E", bg: "#DFF0E7" },
  rejected:  { color: "#B94040", bg: "#FAEAEA" },
  cancelled: { color: "#9A9285", bg: "#F0EBE3" },
};

export default function Earnings() {
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
        // Only show completed bookings with amounts for earnings ledger
        const completed = Array.isArray(list) ? list.filter(b => b.total_amount > 0) : [];
        setBookings(completed.slice(0, 20));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const s = stats ?? {};

  // Derive payout breakdown from stats or bookings
  const totalRevenue  = s.total_revenue  ?? null;
  const pendingAmount = s.pending_amount ?? null;
  const paidOut       = s.paid_out       ?? null;

  return (
    <PageShell title="Earnings" subtitle="Revenue and payout summary">

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} />{error}
        </div>
      )}

      {/* ── Metric cards ── */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <MetricCard label="Available"  value={fmt(totalRevenue)}  icon={CheckCircle}     color="#3E7A58" bg="#EAF3EE" loading={loading} />
        <MetricCard label="Pending"    value={fmt(pendingAmount)} icon={Clock}           color="#C8883A" bg="#FDF3E7" loading={loading} />
        <MetricCard label="Paid out"   value={fmt(paidOut)}       icon={ArrowDownCircle} color="#1C3D2E" bg="#DFF0E7" loading={loading} />
      </div>

      {/* ── Earnings ledger ── */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F0EBE3]">
          <h2 className="text-sm font-semibold text-[#1A2820]">Transaction History</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-[#F5F2EE]" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp size={32} className="text-[#D4C9BB] mb-3" />
            <p className="text-sm font-medium text-[#9A9285]">No transactions yet</p>
            <p className="text-xs text-[#B8AFA4] mt-1">Completed bookings will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F2EE]">
            {bookings.map(b => {
              const meta = STATUS_MAP[b.status] ?? STATUS_MAP.pending;
              return (
                <div key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1A2820]">
                      {b.experience_title ?? b.title ?? "Booking"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9A9285]">
                      {fmtDate(b.date)}
                      {b.tourist_name ? ` · ${b.tourist_name}` : ""}
                      {b.guests ? ` · ${b.guests} guest${b.guests > 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold text-[#1C3D2E]">{fmt(b.total_amount)}</span>
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: meta.bg, color: meta.color }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}