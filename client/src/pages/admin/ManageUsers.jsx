import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, User, Search, ArrowLeft, ArrowRight } from "lucide-react";
import PageShell from "../PageShell";
import api from "../../services/api";

// ── Design tokens (inline, no external deps) ─────────────────
const C = {
  bg: "#fffdf8",
  card: "#fff",
  border: "#e8d9c4",
  forest: "#1a2e1a",
  forestMid: "#2d4a2d",
  forestLight: "#4a6741",
  amber: "#d97706",
  amberLight: "#fef3c7",
  terra: "#9a3412",
  terraLight: "#fff1ee",
  muted: "#8a7560",
  midText: "#5a4a35",
  dark: "#1a150f",
  cream: "#fffdf8",
  creamLight: "#fef9f0",
};

const roleColors = {
  admin:     { bg: "#fef2f2", text: "#991b1b", dot: "#dc2626" },
  security:  { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
  community: { bg: "#f0fdf4", text: "#14532d", dot: "#22c55e" },
  tourist:   { bg: "#eff6ff", text: "#1e3a8a", dot: "#3b82f6" },
};

const statusColors = {
  active:    { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
  suspended: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
  banned:    { bg: "#fef2f2", text: "#991b1b", dot: "#dc2626" },
};

const Pill = ({ label, colors }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "3px 10px", borderRadius: "999px", fontSize: "11px",
    fontWeight: "600", letterSpacing: "0.04em",
    background: colors?.bg ?? "#f5f5f5",
    color: colors?.text ?? "#555",
  }}>
    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors?.dot ?? "#999", flexShrink: 0 }} />
    {label}
  </span>
);

const Avatar = ({ user, size = 36 }) => {
  const initials = (user?.full_name ?? user?.email ?? "?")[0].toUpperCase();
  if (user?.avatar_url) {
    return (
      <img src={user.avatar_url} alt="" style={{
        width: size, height: size, borderRadius: "50%",
        objectFit: "cover", flexShrink: 0,
        border: `2px solid ${C.border}`,
      }} />
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: "700",
      background: C.amberLight, color: C.amber,
      border: `2px solid ${C.border}`,
    }}>
      {initials}
    </span>
  );
};

const ActionBtn = ({ children, onClick, disabled, variant = "default" }) => {
  const [hover, setHover] = useState(false);
  const styles = {
    default: { color: C.forestLight, hoverBg: "#f0fdf4" },
    danger:  { color: C.terra,       hoverBg: C.terraLight },
    muted:   { color: C.muted,       hoverBg: "#f5f5f0" },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "5px 12px", borderRadius: "8px", fontSize: "12px",
        fontWeight: "500", border: "none", cursor: disabled ? "not-allowed" : "pointer",
        color: s.color, opacity: disabled ? 0.45 : 1,
        background: hover && !disabled ? s.hoverBg : "transparent",
        transition: "background 0.15s, opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
};

const inputBaseStyle = {
  padding: "9px 14px", borderRadius: "10px", fontSize: "13px",
  border: `1.5px solid ${C.border}`, outline: "none",
  background: C.creamLight, color: C.dark,
  transition: "border-color 0.15s",
};

export default function ManageUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [role, setRole]         = useState("");
  const [status, setStatus]     = useState("");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 20;

  // ── Core fetch — all params passed directly, no stale closure ─
  const fetchUsers = useCallback((params = {}) => {
    const currentPage   = params.page   ?? page;
    const currentRole   = params.role   !== undefined ? params.role   : role;
    const currentStatus = params.status !== undefined ? params.status : status;
    const currentSearch = params.search !== undefined ? params.search : search;

    setLoading(true);
    setError(null);

    const qs = new URLSearchParams({ page: currentPage, limit });
    if (currentSearch.trim()) qs.set("search", currentSearch.trim());
    if (currentRole)          qs.set("role",   currentRole);
    if (currentStatus)        qs.set("status", currentStatus);

    api.get(`/admin/users?${qs}`)
      .then((res) => {
        setUsers(res.data?.users ?? []);
        setTotal(res.data?.pagination?.total ?? 0);
      })
      .catch(() => setError("Failed to load users. Please try again."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — always pass explicit params

  // Initial load and re-load when page changes via pagination buttons only
  useEffect(() => {
    fetchUsers({ page, role, status, search });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Filter handlers — always reset page to 1 ─────────────────
  const applyRole = (val) => {
    setRole(val);
    setPage(1);
    fetchUsers({ role: val, status, search, page: 1 });
  };

  const applyStatus = (val) => {
    setStatus(val);
    setPage(1);
    fetchUsers({ role, status: val, search, page: 1 });
  };

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers({ role, status, search, page: 1 });
  };

  const handleUpdateUser = async (id, payload) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/users/${id}`, payload);
      fetchUsers({ page, role, status, search });
    } catch (err) {
      alert(err.response?.data?.message ?? "Failed to update user.");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <PageShell title="Manage Users" subtitle="Review accounts and access levels.">

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <form
        onSubmit={applySearch}
        style={{
          display: "flex", flexWrap: "wrap", gap: "10px",
          marginBottom: "24px", alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={14} color={C.dark} strokeWidth={2.5} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputBaseStyle, width: "100%", paddingLeft: "36px", boxSizing: "border-box" }}
            onFocus={(e) => e.target.style.borderColor = C.forestLight}
            onBlur={(e) => e.target.style.borderColor = C.border}
          />
        </div>

        {[
          { val: role, set: applyRole, label: "All roles", options: [
            { value: "", label: "All roles" },
            { value: "tourist", label: "Tourist" },
            { value: "community", label: "Community" },
            { value: "security", label: "Security" },
            { value: "admin", label: "Admin" },
          ]},
          { val: status, set: applyStatus, label: "All statuses", options: [
            { value: "", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
            { value: "banned", label: "Banned" },
          ]},
        ].map((sel, i) => (
          <select
            key={i}
            value={sel.val}
            onChange={(e) => sel.set(e.target.value)}
            style={{
              ...inputBaseStyle, padding: "9px 32px 9px 14px",
              appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a7560' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
              cursor: "pointer", minWidth: "140px",
            }}
          >
            {sel.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}

        <button
          type="submit"
          style={{
            padding: "9px 20px", borderRadius: "10px", fontSize: "13px",
            fontWeight: "600", border: "none", cursor: "pointer",
            background: C.forest, color: "#fff",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.target.style.background = C.forestMid}
          onMouseLeave={(e) => e.target.style.background = C.forest}
        >
          Search
        </button>
      </form>

      {/* ── Result summary ───────────────────────────────────────── */}
      {!loading && !error && (
        <p style={{ fontSize: "12px", color: C.muted, marginBottom: "12px" }}>
          {total > 0
            ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} users`
            : "No users found"}
        </p>
      )}

      {/* ── Loading ──────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1,2,3,4,5].map((i) => (
            <div key={i} style={{
              height: "72px", borderRadius: "14px",
              background: "linear-gradient(90deg, #f5ede0 25%, #fdf5ea 50%, #f5ede0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }} />
          ))}
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: "12px", padding: "16px 20px",
          color: "#dc2626", fontSize: "14px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <AlertTriangle size={18} /> {error}
          <button
            onClick={() => fetchUsers({ page, role, status, search })}
            style={{ marginLeft: "auto", fontSize: "12px", color: "#dc2626", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── User list ────────────────────────────────────────────── */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {users.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              color: C.muted, fontSize: "14px",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", opacity: 0.4 }}><User size={40} /></div>
              No users match your filters.
            </div>
          )}

          {users.map((user) => (
            <div
              key={user.id}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              {/* Left: avatar + info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <Avatar user={user} />
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontSize: "14px", fontWeight: "600", color: C.dark,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    marginBottom: "3px",
                  }}>
                    {user.full_name || "—"}
                  </p>
                  <p style={{ fontSize: "12px", color: C.muted }}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Right: badges + controls */}
              <div style={{
                display: "flex", flexWrap: "wrap", alignItems: "center",
                gap: "8px", flexShrink: 0,
              }}>
                <Pill label={user.role}   colors={roleColors[user.role]}     />
                <Pill label={user.status} colors={statusColors[user.status]} />

                {/* Role selector */}
                {user.role !== "admin" && (
                  <select
                    value={user.role}
                    disabled={actionLoading === user.id}
                    onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                    style={{
                      padding: "4px 24px 4px 10px", borderRadius: "8px",
                      fontSize: "12px", border: `1px solid ${C.border}`,
                      background: C.creamLight, color: C.dark,
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238a7560' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat", backgroundPosition: "right 7px center",
                      cursor: actionLoading === user.id ? "not-allowed" : "pointer",
                      opacity: actionLoading === user.id ? 0.5 : 1,
                    }}
                  >
                    <option value="tourist">Tourist</option>
                    <option value="community">Community</option>
                    <option value="security">Security</option>
                  </select>
                )}

                {/* Divider */}
                <div style={{ width: "1px", height: "20px", background: C.border }} />

                {/* Status toggle */}
                {user.status === "active" ? (
                  <ActionBtn
                    variant="danger"
                    disabled={actionLoading === user.id}
                    onClick={() => handleUpdateUser(user.id, { status: "suspended" })}
                  >
                    Suspend
                  </ActionBtn>
                ) : (
                  <ActionBtn
                    variant="default"
                    disabled={actionLoading === user.id}
                    onClick={() => handleUpdateUser(user.id, { status: "active" })}
                  >
                    Reinstate
                  </ActionBtn>
                )}

                {/* Loading spinner for this row */}
                {actionLoading === user.id && (
                  <div style={{
                    width: "14px", height: "14px", borderRadius: "50%",
                    border: `2px solid ${C.border}`, borderTopColor: C.forestLight,
                    animation: "spin 0.7s linear infinite",
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      {!loading && total > limit && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "28px", paddingTop: "20px", borderTop: `1px solid ${C.border}`,
        }}>
          <p style={{ fontSize: "12px", color: C.muted }}>
            Page {page} of {totalPages}
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "Prev", icon: <ArrowLeft size={16} style={{ marginRight: "4px" }} />, disabled: page === 1,          action: () => setPage(p => p - 1) },
              { label: "Next", icon: <ArrowRight size={16} style={{ marginLeft: "4px" }} />,  disabled: page >= totalPages,  action: () => setPage(p => p + 1) },
            ].map(({ label, disabled, action }) => (
              <button
                key={label}
                disabled={disabled}
                onClick={action}
                style={{
                  padding: "8px 18px", borderRadius: "10px", fontSize: "13px",
                  fontWeight: "500", border: `1.5px solid ${C.border}`,
                  background: disabled ? "transparent" : C.creamLight,
                  color: disabled ? C.border : C.midText,
                  cursor: disabled ? "not-allowed" : "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {label === "Prev" && icon}
                  {label}
                  {label === "Next" && icon}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageShell>
  );
}