import { useEffect, useState, useMemo } from "react";
import {
  UserX,
  UserCheck,
  RefreshCw,
  Inbox,
  Loader2,
  Mail,
  ShieldOff,
  Calendar,
  Search,
  X,
  Plus,
  AlertCircle
} from "lucide-react";
import securityService from "../../services/securityService";

function SuspendModal({ isOpen, onClose, onSuspend }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspending, setSuspending] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await securityService.getAllUsers(`search=${search}&status=active`);
        setResults(res.data?.users || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  const handleSuspend = async () => {
    if (!selectedUser || !reason.trim()) return;
    setSuspending(true);
    try {
      await securityService.suspendUser(selectedUser.id, reason);
      onSuspend({ ...selectedUser, status: 'suspended', suspended_at: new Date().toISOString() });
      onClose();
      setSelectedUser(null);
      setReason("");
    } catch (err) {
      console.error("Suspension failed", err);
    } finally {
      setSuspending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border-soft flex items-center justify-between">
          <h3 className="font-bold text-text-dark flex items-center gap-2">
            <UserX size={18} className="text-terracotta" /> Restrict User Access
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-cream rounded-full"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {!selectedUser ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-cream-light rounded-xl border-none text-sm focus:ring-2 focus:ring-forest/20 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-forest/20" /></div>
                ) : results.length > 0 ? (
                  results.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-cream-light rounded-xl transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-forest/5 flex items-center justify-center text-forest font-bold text-xs uppercase">
                        {u.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-dark">{u.name}</p>
                        <p className="text-[10px] text-text-muted">{u.email}</p>
                      </div>
                    </button>
                  ))
                ) : search && (
                  <p className="text-center py-8 text-xs text-text-muted">No active users found.</p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 p-3 bg-terracotta/5 rounded-xl border border-terracotta/10">
                <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center text-terracotta font-bold text-sm uppercase">
                  {selectedUser.name?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-dark">{selectedUser.name}</p>
                  <p className="text-[10px] text-text-muted">{selectedUser.email}</p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-[10px] font-bold text-terracotta hover:underline">Change</button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Reason for Restriction</label>
                <textarea 
                  className="w-full p-4 bg-cream-light rounded-xl border-none text-sm focus:ring-2 focus:ring-terracotta/20 outline-none h-24 resize-none"
                  placeholder="Explain why this account is being restricted..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button 
                onClick={handleSuspend}
                disabled={suspending || !reason.trim()}
                className="w-full py-4 bg-text-dark text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
              >
                {suspending ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
                Confirm Restriction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserCard({ user, onUnsuspend }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const { id, full_name, name, email, role, status, suspended_at } = user;
  const displayName = full_name || name || "Unknown User";

  const suspendedDate = suspended_at
    ? new Date(suspended_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Recently";

  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleUnsuspend = async () => {
    setLoading(true);
    try {
      await securityService.unsuspendUser(id);
      onUnsuspend(id);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div
      className="flex items-start gap-5 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border border-border-soft"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 shadow-inner"
        style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)" }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-base font-bold text-text-dark">{displayName}</p>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"
            style={{
              backgroundColor: status === "banned" ? "#450a0a" : "#FEF2F2",
              color: status === "banned" ? "#fca5a5" : "var(--color-terracotta)",
            }}
          >
            {status}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5"><Mail size={12} strokeWidth={2} /> {email}</span>
          <span className="flex items-center gap-1.5 capitalize"><ShieldOff size={12} strokeWidth={2} /> {role || "Member"}</span>
          <span className="flex items-center gap-1.5"><Calendar size={12} strokeWidth={2} /> Restricted {suspendedDate}</span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-forest/5 text-forest hover:bg-forest hover:text-white"
          >
            <UserCheck size={14} />
            Reinstate
          </button>
        ) : (
          <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
            <button
              onClick={handleUnsuspend}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-forest text-white shadow-lg shadow-forest/20 disabled:opacity-60"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="p-2 rounded-xl bg-cream hover:bg-black/5 text-text-muted"
            >
              <X size={16} />
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    securityService
      .getSuspendedUsers()
      .then((res) => setUsers(res.data?.users ?? []))
      .catch(() => setError("Failed to load restricted database."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUnsuspend = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleNewSuspension = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-text-dark font-display">
            Restricted Accounts
          </h1>
          <p className="mt-2 text-base text-text-muted">
            Manage users with limited or revoked access to the Bond ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="p-3 rounded-2xl bg-white border border-border-soft text-text-muted hover:bg-cream-light transition-all"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-text-dark text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-black transition-all"
          >
            <Plus size={18} /> Restrict User
          </button>
        </div>
      </div>

      {/* Overview Card */}
      {!loading && !error && (
        <div className="p-8 rounded-[2rem] bg-terracotta/[0.03] border border-terracotta/10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-terracotta/10 flex items-center justify-center text-terracotta">
            <ShieldOff size={32} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-dark">{users.length} Active Suspensions</p>
            <p className="text-sm text-text-muted mt-1">Users currently blocked from login and platform activities.</p>
          </div>
          <div className="ml-auto hidden sm:block">
            <AlertCircle size={40} className="text-terracotta/20" />
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-[2rem] animate-pulse bg-border-soft/20" />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-terracotta/5 rounded-[2rem] border border-terracotta/10">
            <AlertCircle size={48} className="mx-auto text-terracotta mb-4" />
            <p className="text-text-dark font-bold text-lg">{error}</p>
            <button onClick={load} className="mt-4 text-sm font-bold text-terracotta underline">Try Again</button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 bg-cream-light rounded-[2.5rem] border border-dashed border-border-soft">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Inbox size={32} className="text-text-muted opacity-30" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-text-dark">Clean Slate</p>
              <p className="text-sm text-text-muted mt-1">No accounts are currently restricted.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((u) => (
              <UserCard key={u.id} user={u} onUnsuspend={handleUnsuspend} />
            ))}
          </div>
        )}
      </div>

      <SuspendModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuspend={handleNewSuspension} 
      />
    </div>
  );
}