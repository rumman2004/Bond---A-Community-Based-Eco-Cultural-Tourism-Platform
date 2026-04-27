import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import {
  Search, Filter, MoreHorizontal, UserCheck, UserX,
  ShieldAlert, Eye, ChevronDown, RefreshCw, Download,
  Users, TrendingUp, AlertOctagon, Clock, MapPin,
  ArrowUpRight, Loader2,
} from "lucide-react";
import securityService from "../../services/securityService";

/* ── Style maps ── */
const STATUS_STYLE = {
  active:    { bg: "#DCFCE7", color: "#166534",                         dot: "#22C55E" },
  flagged:   { bg: "#FEF3C7", color: "#92400E",                         dot: "#F59E0B" },
  suspended: { bg: "#FEF2F2", color: "var(--color-terracotta)",         dot: "#EF4444" },
  inactive:  { bg: "var(--color-cream-mid)", color: "var(--color-text-muted)", dot: "#9CA3AF" },
};
const ROLE_STYLE = {
  traveller: { bg: "#EFF6FF", color: "#1D4ED8" },
  host:      { bg: "var(--color-forest-pale)", color: "var(--color-forest)" },
};

/* ── Skeleton row ── */
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
      {[48, 24, 32, 20, 16, 12, 12, 20].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="animate-pulse rounded-lg h-4"
            style={{ width: `${w * 3}px`, background: "var(--color-cream-mid)" }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, delta, icon: Icon, color, loading }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
    );
  }, []);
  return (
    <div
      ref={ref}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
        <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon size={15} style={{ color }} />
        </span>
      </div>
      {loading ? (
        <div className="animate-pulse h-8 w-24 rounded-lg" style={{ background: "var(--color-cream-mid)" }} />
      ) : (
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}>
            {value ?? "—"}
          </span>
          {delta != null && (
            <span className="text-xs font-semibold pb-1" style={{ color: "var(--color-forest)" }}>
              {delta} <ArrowUpRight size={10} style={{ display: "inline" }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Action confirm modal ── */
function ConfirmModal({ user, actionType, onConfirm, onCancel, submitting }) {
  const [reason, setReason] = useState("");
  const needsReason = actionType === "suspend" || actionType === "flag";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-5"
        style={{ background: "var(--color-cream-light)", border: "1px solid var(--color-border-soft)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div>
          <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
            {actionType === "suspend" ? "Suspend User" : actionType === "reinstate" ? "Reinstate User" : "Flag User"}
          </h3>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {actionType === "suspend" && `You're about to suspend ${user.name}. They will lose platform access.`}
            {actionType === "reinstate" && `Reinstate ${user.name}? They will regain full platform access.`}
            {actionType === "flag" && `Flag ${user.name}'s account for review.`}
          </p>
        </div>
        {needsReason && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-text-muted)" }}>
              Reason <span style={{ color: "var(--color-terracotta)" }}>*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason…"
              className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
              style={{
                background: "var(--color-cream)",
                border: "1.5px solid var(--color-border-soft)",
                color: "var(--color-text-dark)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-forest)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border-soft)")}
            />
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
            disabled={submitting || (needsReason && !reason.trim())}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all hover:brightness-95"
            style={{
              background: actionType === "reinstate" ? "var(--color-forest)" : "var(--color-terracotta)",
              color: "white",
            }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Confirm
          </button>
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors disabled:opacity-60"
            style={{ border: "1px solid var(--color-border-soft)", color: "var(--color-text-muted)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── User row ── */
function UserRow({ user, index, onAction }) {
  const ref = useRef(null);
  const ss = STATUS_STYLE[user.status] || STATUS_STYLE.inactive;
  const rs = ROLE_STYLE[user.role] || ROLE_STYLE.traveller;

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", delay: 0.1 + index * 0.03 }
    );
  }, []);

  return (
    <tr ref={ref} className="group transition-colors duration-150"
      style={{ borderBottom: "1px solid var(--color-border-soft)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-cream-mid)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--color-forest-pale)", color: "var(--color-forest)" }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: ss.dot, borderColor: "var(--color-cream-light)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>{user.name}</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
          style={{ background: rs.bg, color: rs.color }}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <MapPin size={11} />{user.location || "—"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.dot }} />
          <span className="text-[11px] font-bold capitalize" style={{ color: ss.color }}>{user.status}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {user.last_active
            ? new Date(user.last_active).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "—"}
        </span>
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span className="text-xs font-semibold" style={{ color: "var(--color-text-dark)" }}>
          {user.booking_count ?? "—"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        {user.report_count > 0 ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#FEF2F2", color: "var(--color-terracotta)" }}>
            {user.report_count}
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>—</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {user.status === "active" && (
            <button title="Suspend" onClick={() => onAction("suspend", user)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
              style={{ color: "var(--color-terracotta)" }}>
              <UserX size={14} />
            </button>
          )}
          {user.status === "suspended" && (
            <button title="Reinstate" onClick={() => onAction("reinstate", user)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
              style={{ color: "var(--color-forest)" }}>
              <UserCheck size={14} />
            </button>
          )}
          {user.status === "flagged" && (
            <button title="Review flag" onClick={() => onAction("flag", user)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
              style={{ color: "#F59E0B" }}>
              <ShieldAlert size={14} />
            </button>
          )}
          {user.status === "active" && (
            <button title="Flag" onClick={() => onAction("flag", user)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/8 transition-colors"
              style={{ color: "var(--color-text-muted)" }}>
              <ShieldAlert size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function MonitorUsers() {
  const headerRef = useRef(null);

  const [users, setUsers]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]           = useState(null);

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter]     = useState("all");

  const [modal, setModal]       = useState(null); // { type, user }
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  /* ── Fetch stats ── */
  useEffect(() => {
    setStatsLoading(true);
    securityService.getStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  /* ── Fetch users ── */
  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (roleFilter !== "all")   params.set("role", roleFilter);
    if (search)                 params.set("search", search);

    securityService.getAllUsers(params.toString())
      .then((res) => {
        const list = res?.data?.users ?? res?.data ?? [];
        setUsers(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err?.response?.data?.message ?? "Failed to load users."))
      .finally(() => setLoading(false));
  }, [statusFilter, roleFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  /* ── Actions ── */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirm = async (reason) => {
    if (!modal) return;
    setSubmitting(true);
    try {
      const { type, user } = modal;
      if (type === "suspend")   await securityService.suspendUser(user.id, reason);
      if (type === "reinstate") await securityService.unsuspendUser(user.id);
      if (type === "flag")      await securityService.flagUser(user.id, reason);

      showToast(
        type === "suspend"   ? `${user.name} has been suspended.` :
        type === "reinstate" ? `${user.name} has been reinstated.` :
                               `${user.name} has been flagged for review.`
      );
      setModal(null);
      fetchUsers();
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Action failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Derived stats ── */
  const statCards = [
    { label: "Total Users",    value: stats?.total_users,    delta: stats?.user_delta,    icon: Users,         color: "var(--color-forest)" },
    { label: "Active Today",   value: stats?.active_today,   delta: stats?.active_delta,  icon: TrendingUp,    color: "var(--color-amber)" },
    { label: "Flagged",        value: stats?.flagged_users,  delta: null,                 icon: ShieldAlert,   color: "var(--color-terracotta)" },
    { label: "Suspended",      value: stats?.suspended_users, delta: null,                icon: Clock,         color: "#6366F1" },
  ];

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: "var(--color-cream)" }}>

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
          style={{ background: "var(--color-forest)", color: "white" }}
        >
          {toast}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <ConfirmModal
          user={modal.user}
          actionType={modal.type}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          submitting={submitting}
        />
      )}

      {/* ── Header ── */}
      <div ref={headerRef} className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
              Monitor Users
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Review activity, flags, and account health across all platform users.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:brightness-95 disabled:opacity-60"
            style={{ background: "var(--color-forest)", color: "white" }}
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} loading={statsLoading} />
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-cream-light)",
          border: "1px solid var(--color-border-soft)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Toolbar */}
        <div className="px-5 py-4 flex flex-wrap items-center gap-3"
          style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3.5 py-2 rounded-xl"
            style={{ background: "var(--color-cream)", border: "1px solid var(--color-border-soft)" }}>
            <Search size={14} style={{ color: "var(--color-text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--color-text-dark)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: "var(--color-text-muted)" }}>
                ×
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
            style={{ background: "var(--color-cream)", border: "1px solid var(--color-border-soft)" }}>
            <Filter size={13} style={{ color: "var(--color-text-muted)" }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none text-sm appearance-none pr-4"
              style={{ color: "var(--color-text-dark)" }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={12} style={{ color: "var(--color-text-muted)" }} />
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
            style={{ background: "var(--color-cream)", border: "1px solid var(--color-border-soft)" }}>
            <Users size={13} style={{ color: "var(--color-text-muted)" }} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent outline-none text-sm appearance-none pr-4"
              style={{ color: "var(--color-text-dark)" }}>
              <option value="all">All Roles</option>
              <option value="tourist">Tourist</option>
              <option value="community">Community</option>
            </select>
            <ChevronDown size={12} style={{ color: "var(--color-text-muted)" }} />
          </div>
          {!loading && (
            <span className="ml-auto text-xs" style={{ color: "var(--color-text-muted)" }}>
              {users.length} users
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}>
            <AlertOctagon size={14} /> {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
                {[
                  { h: "User",        cls: "px-5" },
                  { h: "Role",        cls: "px-4" },
                  { h: "Location",    cls: "px-4 hidden md:table-cell" },
                  { h: "Status",      cls: "px-4" },
                  { h: "Last Active", cls: "px-4 hidden lg:table-cell" },
                  { h: "Bookings",    cls: "px-4 hidden lg:table-cell" },
                  { h: "Reports",     cls: "px-4" },
                  { h: "",            cls: "px-4" },
                ].map(({ h, cls }) => (
                  <th key={h} className={`py-3 text-left text-[11px] font-semibold uppercase tracking-widest ${cls}`}
                    style={{ color: "var(--color-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : users.length > 0
                  ? users.map((user, i) => (
                      <UserRow key={user.id} user={user} index={i}
                        onAction={(type, u) => setModal({ type, user: u })} />
                    ))
                  : (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                          No users match your filters.
                        </p>
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between text-xs"
          style={{ borderTop: "1px solid var(--color-border-soft)", color: "var(--color-text-muted)" }}>
          <span>{loading ? "Loading…" : `${users.length} users loaded`}</span>
          <span>Filters: {statusFilter} · {roleFilter}</span>
        </div>
      </div>
    </div>
  );
}