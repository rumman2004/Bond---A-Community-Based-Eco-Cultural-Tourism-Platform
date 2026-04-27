import { useEffect, useState } from "react";
import {
  UserX,
  UserCheck,
  RefreshCw,
  Inbox,
  Loader2,
  Mail,
  ShieldOff,
  Calendar,
} from "lucide-react";
import securityService from "../../services/securityService";

function UserCard({ user, onUnsuspend }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const { id, full_name, email, role, status, suspended_at } = user;

  const suspendedDate = suspended_at
    ? new Date(suspended_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const initials = full_name
    ? full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleUnsuspend = async () => {
    setLoading(true);
    try {
      await securityService.unsuspendUser(id);
      onUnsuspend(id);
    } catch {
      // silent — add toast if desired
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div
      className="flex items-start gap-4 rounded-2xl px-6 py-5 transition-all duration-200"
      style={{
        backgroundColor: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Avatar */}
      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)" }}
      >
        {initials}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
            {full_name || "Unknown User"}
          </p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{
              backgroundColor: status === "banned" ? "#450a0a" : "#FEF2F2",
              color: status === "banned" ? "#fca5a5" : "var(--color-terracotta)",
            }}
          >
            {status}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
          {email && (
            <span className="flex items-center gap-1">
              <Mail size={11} strokeWidth={1.8} /> {email}
            </span>
          )}
          {role && (
            <span className="flex items-center gap-1">
              <ShieldOff size={11} strokeWidth={1.8} /> {role}
            </span>
          )}
          {suspendedDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} strokeWidth={1.8} /> Suspended {suspendedDate}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="shrink-0">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors hover:brightness-95"
            style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)" }}
          >
            <UserCheck size={13} strokeWidth={2} />
            Reinstate
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Sure?</span>
            <button
              onClick={handleUnsuspend}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:brightness-95 disabled:opacity-60"
              style={{ backgroundColor: "var(--color-forest)", color: "white" }}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} strokeWidth={2} />}
              Yes
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 transition-colors"
              style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuspendedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    securityService
      .getSuspendedUsers()
      .then((res) => setUsers(res.data?.users ?? []))
      .catch(() => setError("Failed to load suspended users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUnsuspend = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
          >
            Suspended Users
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Accounts restricted from platform access.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:bg-black/5"
          style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
        >
          <RefreshCw size={13} strokeWidth={1.8} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Count */}
      {!loading && !error && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)" }}
        >
          <UserX size={13} strokeWidth={2} />
          {users.length} {users.length === 1 ? "account" : "accounts"} restricted
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
        >
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: "var(--color-border-soft)" }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && users.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-16 rounded-2xl"
          style={{ border: "1px dashed var(--color-border-soft)" }}
        >
          <Inbox size={28} style={{ color: "var(--color-text-muted)" }} strokeWidth={1.4} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            No suspended users at the moment.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && users.length > 0 && (
        <div className="space-y-3">
          {users.map((u) => (
            <UserCard key={u.id} user={u} onUnsuspend={handleUnsuspend} />
          ))}
        </div>
      )}
    </div>
  );
}