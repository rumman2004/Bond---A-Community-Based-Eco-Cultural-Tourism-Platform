import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, AlertCircle, Users, Calendar, IndianRupee, Search, Filter } from "lucide-react";
import PageShell from "../PageShell";
import bookingService from "../../services/bookingService";

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

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

function ActionButton({ onClick, label, color, bg, loading, icon: Icon }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-40"
      style={{ background: bg, color }}>
      {loading
        ? <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
        : <Icon size={12} />}
      {label}
    </button>
  );
}

function BookingRow({ booking, onAction }) {
  const [acting, setActing] = useState(null);

  const doAction = async (actionFn, key) => {
    setActing(key);
    try { await actionFn(); }
    catch (err) { console.error(err); }
    finally { setActing(null); }
  };

  const isPending   = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";

  return (
    <div className="rounded-2xl border border-[#E8E1D5] bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#1A2820]">
            {booking.experience_title ?? booking.title ?? "Booking"}
          </p>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#9A9285]">
          <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(booking.date)}</span>
          {booking.guests && <span className="flex items-center gap-1"><Users size={11} />{booking.guests} guest{booking.guests > 1 ? "s" : ""}</span>}
          {booking.total_amount && <span className="flex items-center gap-1"><IndianRupee size={11} />{fmt(booking.total_amount)}</span>}
          {booking.tourist_name && <span>{booking.tourist_name}</span>}
        </div>
        {booking.notes && (
          <p className="text-xs text-[#9A9285] italic mt-1">"{booking.notes}"</p>
        )}
      </div>

      {/* Actions */}
      {(isPending || isConfirmed) && (
        <div className="flex flex-wrap gap-2 shrink-0">
          {isPending && (
            <>
              <ActionButton
                label="Confirm" color="#3E7A58" bg="#EAF3EE" icon={CheckCircle}
                loading={acting === "confirm"}
                onClick={() => doAction(() => bookingService.confirm(booking.id).then(() => onAction(booking.id, "confirmed")), "confirm")}
              />
              <ActionButton
                label="Reject" color="#B94040" bg="#FAEAEA" icon={XCircle}
                loading={acting === "reject"}
                onClick={() => doAction(() => bookingService.reject(booking.id).then(() => onAction(booking.id, "rejected")), "reject")}
              />
            </>
          )}
          {isConfirmed && (
            <ActionButton
              label="Mark complete" color="#1C3D2E" bg="#DFF0E7" icon={CheckCircle}
              loading={acting === "complete"}
              onClick={() => doAction(() => bookingService.complete(booking.id).then(() => onAction(booking.id, "completed")), "complete")}
            />
          )}
        </div>
      )}
    </div>
  );
}

const FILTERS = ["all", "pending", "confirmed", "completed", "rejected", "cancelled"];

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    bookingService.getCommunityBookings()
      .then(res => {
        const list = res?.data?.bookings ?? res?.bookings ?? res ?? [];
        setBookings(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Optimistic status update
  const handleAction = useCallback((id, newStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  }, []);

  const visible = bookings.filter(b => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = !search || (b.experience_title ?? b.title ?? "").toLowerCase().includes(search.toLowerCase())
      || (b.tourist_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "all" ? bookings.length : bookings.filter(b => b.status === f).length;
    return acc;
  }, {});

  return (
    <PageShell title="Manage Bookings" subtitle="Approve, prepare, and track guest visits">

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} />{error}
        </div>
      )}

      {/* ── Search + filter bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8AFA4]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings…"
            className="w-full rounded-xl border border-[#E0D8CE] bg-white pl-9 pr-4 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === f ? "#1C3D2E" : "#F0EBE3",
                color:      filter === f ? "#F2EDE4"  : "#7A9285",
              }}>
              {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#E8E1D5]" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E1D5] bg-white py-20 text-center">
          <Calendar size={32} className="text-[#D4C9BB] mb-3" />
          <p className="text-sm font-medium text-[#9A9285]">
            {bookings.length === 0 ? "No bookings yet" : "No bookings match this filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(b => (
            <BookingRow key={b.id} booking={b} onAction={handleAction} />
          ))}
        </div>
      )}
    </PageShell>
  );
}