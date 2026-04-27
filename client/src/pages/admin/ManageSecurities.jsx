import { useEffect, useState } from "react";
import { Plus, ArrowUp, AlertTriangle, Shield, X } from "lucide-react";
import PageShell from "../PageShell";
import api from "../../services/api";

const C = {
  forest: "#1a2e1a", forestMid: "#2d4a2d", forestLight: "#4a6741",
  amber: "#d97706", amberLight: "#fef3c7",
  terra: "#9a3412", terraLight: "#fff1ee",
  muted: "#8a7560", dark: "#1a150f", mid: "#5a4a35",
  border: "#e8d9c4", card: "#fff", cream: "#fffdf8", creamLight: "#fef9f0",
};

const EMPTY_FORM = { full_name: "", email: "", password: "", phone: "" };

const Avatar = ({ user, size = 40 }) => {
  const initial = (user?.full_name ?? user?.email ?? "S")[0].toUpperCase();
  if (user?.avatar_url) {
    return (
      <img src={user.avatar_url} alt="" style={{
        width: size, height: size, borderRadius: "50%",
        objectFit: "cover", border: `2px solid ${C.border}`, flexShrink: 0,
      }} />
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: "700",
      background: "#fff7ed", color: C.amber,
      border: `2px solid ${C.border}`,
    }}>
      {initial}
    </span>
  );
};

const ModalInput = ({ placeholder, type = "text", value, onChange, label }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label style={{
          display: "block", fontSize: "11px", fontWeight: "700",
          letterSpacing: "0.07em", textTransform: "uppercase",
          color: C.muted, marginBottom: "5px",
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
          border: `1.5px solid ${focused ? C.forestLight : C.border}`,
          background: C.creamLight, color: C.dark,
          outline: "none", transition: "border-color 0.15s",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
};

export default function ManageSecurities() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editUserId, setEditUserId] = useState(null);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [formError, setFormError]   = useState(null);
  const [formSaving, setFormSaving] = useState(false);

  const fetchSecurityUsers = () => {
    setLoading(true);
    api.get("/admin/users?role=security&limit=50")
      .then((res) => setUsers(res.data?.users ?? []))
      .catch(() => setError("Failed to load security users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSecurityUsers(); }, []);

  const handleRevoke = async (id, name) => {
    if (!confirm(`Revoke security role from "${name}"? They will become a tourist.`)) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/users/${id}`, { role: "tourist" });
      fetchSecurityUsers();
    } catch { alert("Failed to revoke role."); }
    finally { setActionLoading(null); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const next = currentStatus === "active" ? "suspended" : "active";
    if (!confirm(`${next === "suspended" ? "Suspend" : "Reinstate"} this security user?`)) return;
    setActionLoading(id);
    try {
      await api.patch(`/admin/users/${id}`, { status: next });
      fetchSecurityUsers();
    } catch { alert("Failed to update status."); }
    finally { setActionLoading(null); }
  };

  const handlePromote = async () => {
    if (!promoteEmail.trim()) return;
    setFormSaving(true); setFormError(null);
    try {
      const res  = await api.get(`/admin/users?search=${encodeURIComponent(promoteEmail.trim())}&limit=5`);
      const list = res.data?.users ?? [];
      const found = list.find((u) => u.email.toLowerCase() === promoteEmail.trim().toLowerCase());
      if (!found)                      { setFormError("No user found with that exact email."); return; }
      if (found.role === "security")   { setFormError("Already a security officer."); return; }
      if (found.role === "admin")      { setFormError("Cannot change role of an admin user."); return; }
      await api.patch(`/admin/users/${found.id}`, { role: "security" });
      setModal(null); setPromoteEmail(""); fetchSecurityUsers();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Failed to promote user.");
    } finally { setFormSaving(false); }
  };

  const handleCreate = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("Name, email and password are required."); return;
    }
    setFormSaving(true); setFormError(null);
    try {
      await api.post("/admin/users", { ...form, role: "security" });
      setModal(null); setForm(EMPTY_FORM); fetchSecurityUsers();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Failed to create user.");
    } finally { setFormSaving(false); }
  };

  const openEdit = (user) => {
    setEditUserId(user.id);
    setForm({ full_name: user.full_name ?? "", email: user.email ?? "", phone: user.phone ?? "", password: "" });
    setFormError(null); setModal("edit");
  };

  const handleEdit = async () => {
    setFormSaving(true); setFormError(null);
    try {
      const payload = { full_name: form.full_name, phone: form.phone };
      if (form.password.trim()) payload.password = form.password;
      await api.patch(`/admin/users/${editUserId}`, payload);
      setModal(null); fetchSecurityUsers();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Failed to update user.");
    } finally { setFormSaving(false); }
  };

  const closeModal = () => {
    setModal(null); setForm(EMPTY_FORM); setPromoteEmail("");
    setFormError(null); setEditUserId(null);
  };

  return (
    <PageShell title="Security Team" subtitle="Manage platform security officers.">

      {/* ── Action bar ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => { setModal("create"); setFormError(null); setForm(EMPTY_FORM); }}
          style={{
            padding: "10px 20px", borderRadius: "10px", fontSize: "13px",
            fontWeight: "600", border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${C.forest}, ${C.forestMid})`,
            color: "#fff", display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          <Plus size={16} />
          Create Security User
        </button>
        <button
          onClick={() => { setModal("promote"); setFormError(null); setPromoteEmail(""); }}
          style={{
            padding: "10px 20px", borderRadius: "10px", fontSize: "13px",
            fontWeight: "600", border: `1.5px solid ${C.border}`,
            cursor: "pointer", background: C.creamLight, color: C.mid,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><ArrowUp size={16} /> Promote Existing User</div>
        </button>
      </div>

      {/* ── Loading / Error ──────────────────────────────────────── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height: "72px", borderRadius: "14px",
              background: "linear-gradient(90deg, #f5ede0 25%, #fdf5ea 50%, #f5ede0 75%)",
              backgroundSize: "200% 100%", animation: `shimmer 1.4s infinite`,
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      )}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: "12px", padding: "16px", color: "#dc2626", fontSize: "14px",
          display: "flex", alignItems: "center", gap: "8px"
        }}><AlertTriangle size={18} /> {error}</div>
      )}

      {/* ── User list ────────────────────────────────────────────── */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {users.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", opacity: 0.35 }}><Shield size={40} /></div>
              <p style={{ fontSize: "14px" }}>No security users yet.</p>
            </div>
          )}
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: "14px", padding: "14px 18px",
                display: "flex", flexWrap: "wrap", alignItems: "center",
                justifyContent: "space-between", gap: "12px",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              {/* Left */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar user={user} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: C.dark }}>{user.full_name}</p>
                    <span style={{
                      padding: "2px 8px", borderRadius: "999px",
                      fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      background: user.status === "active" ? "#f0fdf4" : "#fef2f2",
                      color: user.status === "active" ? "#15803d" : "#dc2626",
                    }}>
                      {user.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: C.muted }}>
                    {user.email}{user.phone ? ` · ${user.phone}` : ""}
                  </p>
                </div>
              </div>

              {/* Right: actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                {[
                  { label: "Edit", action: () => openEdit(user), variant: "default" },
                  {
                    label: user.status === "active" ? "Suspend" : "Reinstate",
                    action: () => handleToggleStatus(user.id, user.status),
                    variant: user.status === "active" ? "danger" : "success",
                  },
                  { label: "Revoke Role", action: () => handleRevoke(user.id, user.full_name), variant: "danger" },
                ].map(({ label, action, variant }) => (
                  <button
                    key={label}
                    disabled={actionLoading === user.id}
                    onClick={action}
                    style={{
                      padding: "6px 14px", borderRadius: "8px",
                      fontSize: "12px", fontWeight: "500",
                      border: `1px solid ${C.border}`,
                      background: "transparent",
                      color: variant === "danger" ? C.terra : variant === "success" ? C.forestLight : C.mid,
                      opacity: actionLoading === user.id ? 0.45 : 1,
                      cursor: actionLoading === user.id ? "not-allowed" : "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (actionLoading !== user.id) {
                        e.currentTarget.style.background = variant === "danger" ? C.terraLight : C.creamLight;
                      }
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    {label}
                  </button>
                ))}
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

      {/* ── Modal ────────────────────────────────────────────────── */}
      {modal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
            background: "rgba(10,20,10,0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={{
            width: "100%", maxWidth: "420px",
            background: C.card, borderRadius: "20px", padding: "28px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            animation: "modalIn 0.2s ease",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: C.dark }}>
                {modal === "create"  ? "Create Security User"   :
                 modal === "promote" ? "Promote Existing User"  :
                                      "Edit Security User"}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  border: "none", background: "#f1f5f9", cursor: "pointer",
                  fontSize: "14px", color: "#64748b", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Create form */}
            {modal === "create" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <ModalInput label="Full Name *"      value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
                <ModalInput label="Email *"          type="email"    value={form.email}     onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                <ModalInput label="Password *"       type="password" value={form.password}  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
                <ModalInput label="Phone (optional)" type="tel"      value={form.phone}     onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            )}

            {/* Promote form */}
            {modal === "promote" && (
              <div>
                <p style={{ fontSize: "13px", color: C.muted, marginBottom: "14px", lineHeight: 1.5 }}>
                  Enter the exact email of a tourist or community user to promote them to a security officer.
                </p>
                <ModalInput
                  label="User Email"
                  type="email"
                  placeholder="user@example.com"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                />
              </div>
            )}

            {/* Edit form */}
            {modal === "edit" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <ModalInput label="Full Name" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
                <ModalInput label="Phone"     type="tel"      value={form.phone}    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                <ModalInput label="New Password (leave blank to keep)" type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            )}

            {/* Error */}
            {formError && (
              <div style={{
                marginTop: "12px",
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "8px", padding: "10px 14px",
                color: "#dc2626", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px"
              }}>
                <AlertTriangle size={16} /> {formError}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                disabled={formSaving || (modal === "promote" && !promoteEmail.trim())}
                onClick={modal === "create" ? handleCreate : modal === "promote" ? handlePromote : handleEdit}
                style={{
                  flex: 1, padding: "11px", borderRadius: "10px",
                  fontSize: "14px", fontWeight: "600", border: "none",
                  cursor: (formSaving || (modal === "promote" && !promoteEmail.trim())) ? "not-allowed" : "pointer",
                  background: `linear-gradient(135deg, ${C.forest}, ${C.forestMid})`,
                  color: "#fff", opacity: (formSaving || (modal === "promote" && !promoteEmail.trim())) ? 0.6 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {formSaving && (
                  <span style={{
                    width: "14px", height: "14px", borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                    animation: "spin 0.7s linear infinite", display: "inline-block",
                  }} />
                )}
                {formSaving ? "Working…" :
                  modal === "create"  ? "Create User" :
                  modal === "promote" ? "Promote to Security" :
                  "Save Changes"}
              </button>
              <button
                onClick={closeModal}
                style={{
                  padding: "11px 18px", borderRadius: "10px",
                  fontSize: "14px", fontWeight: "500",
                  border: `1.5px solid ${C.border}`,
                  background: "transparent", color: C.muted, cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </PageShell>
  );
}