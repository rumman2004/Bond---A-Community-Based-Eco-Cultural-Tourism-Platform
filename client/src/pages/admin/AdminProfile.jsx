import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import PageShell from "../PageShell";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import { setStoredUser } from "../../utils/tokenUtils";

const C = {
  forest: "#1a2e1a", forestMid: "#2d4a2d", forestLight: "#4a6741",
  amber: "#d97706", amberLight: "#fef3c7",
  muted: "#8a7560", dark: "#1a150f", mid: "#5a4a35",
  border: "#e8d9c4", card: "#fff", cream: "#fffdf8", creamLight: "#fef9f0",
};

const Field = ({ label, name, type = "text", value, onChange, rows }) => {
  const [focused, setFocused] = useState(false);
  const baseStyle = {
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
    border: `1.5px solid ${focused ? C.forestLight : C.border}`,
    background: C.creamLight, color: C.dark,
    outline: "none", transition: "border-color 0.15s",
    fontFamily: "inherit",
  };
  return (
    <div>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: "700",
        letterSpacing: "0.07em", textTransform: "uppercase",
        color: C.muted, marginBottom: "6px",
      }}>
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          rows={rows ?? 3}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...baseStyle, resize: "vertical" }}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={baseStyle}
        />
      )}
    </div>
  );
};

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name:     user?.name ?? "",
    username: user?.username  ?? "",
    phone:    user?.phone     ?? "",
    bio:      user?.bio       ?? "",
    city:     user?.city      ?? "",
    country:  user?.country   ?? "",
  });

  // Sync form when user profile data is loaded/updated
  useEffect(() => {
    if (user) {
      setForm({
        name:     user.name     ?? "",
        username: user.username ?? "",
        phone:    user.phone    ?? "",
        bio:      user.bio      ?? "",
        city:     user.city     ?? "",
        country:  user.country  ?? "",
      });
    }
  }, [user]);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    setSuccess(false);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await userService.updateProfile(form);
      const updatedUser = res.data?.user;
      setUser((prev) => {
        const merged = { ...prev, ...updatedUser };
        setStoredUser(merged); // keep localStorage in sync
        return merged;
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name ?? user?.email ?? "A")[0].toUpperCase();

  return (
    <PageShell title="Admin Profile" subtitle="Manage your account information.">
      <div style={{ maxWidth: "560px" }}>

        {/* ── Profile header card ─────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
          borderRadius: "16px", padding: "24px",
          display: "flex", alignItems: "center", gap: "20px",
          marginBottom: "20px",
        }}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{
              width: "72px", height: "72px", borderRadius: "50%",
              objectFit: "cover", border: "3px solid rgba(255,255,255,0.25)",
            }} />
          ) : (
            <span style={{
              width: "72px", height: "72px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: "700",
              background: "rgba(255,255,255,0.12)",
              color: "#fde68a", flexShrink: 0,
              border: "3px solid rgba(255,255,255,0.2)",
            }}>
              {initials}
            </span>
          )}
          <div>
            <p style={{
              fontSize: "18px", fontWeight: "700", color: "#fff",
              fontFamily: "Georgia, serif", marginBottom: "4px",
            }}>
              {user?.name ?? "Admin"}
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>
              {user?.email}
            </p>
            <span style={{
              display: "inline-block",
              padding: "3px 12px", borderRadius: "999px",
              fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: C.amberLight, color: C.amber,
            }}>
              {user?.role ?? "admin"}
            </span>
          </div>
        </div>

        {/* ── Form card ───────────────────────────────────────────── */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: "16px", padding: "28px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Full Name"    name="name"     value={form.name}     onChange={handleChange} />
            </div>
            <Field label="Username"  name="username" value={form.username} onChange={handleChange} />
            <Field label="Phone"     name="phone"    type="tel" value={form.phone} onChange={handleChange} />
            <Field label="City"      name="city"     value={form.city}    onChange={handleChange} />
            <Field label="Country"   name="country"  value={form.country} onChange={handleChange} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Bio" name="bio" type="textarea" rows={3} value={form.bio} onChange={handleChange} />
            </div>
          </div>

          {/* ── Status messages ──────────────────────────────────── */}
          {error && (
            <div style={{
              marginTop: "16px",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "10px", padding: "12px 16px",
              color: "#dc2626", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px"
            }}>
              <AlertTriangle size={18} /> {error}
            </div>
          )}
          {success && (
            <div style={{
              marginTop: "16px",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "10px", padding: "12px 16px",
              color: "#15803d", fontSize: "13px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <CheckCircle size={18} /> Profile saved successfully!
            </div>
          )}

          {/* ── Save button ──────────────────────────────────────── */}
          <div style={{ marginTop: "24px" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "11px 28px", borderRadius: "10px",
                fontSize: "14px", fontWeight: "600",
                border: "none", cursor: saving ? "not-allowed" : "pointer",
                background: saving
                  ? "#94a3b8"
                  : `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
                color: "#fff",
                transition: "opacity 0.15s, transform 0.15s",
                display: "flex", alignItems: "center", gap: "8px",
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {saving && (
                <span style={{
                  width: "14px", height: "14px", borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                  animation: "spin 0.7s linear infinite", display: "inline-block",
                }} />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageShell>
  );
}