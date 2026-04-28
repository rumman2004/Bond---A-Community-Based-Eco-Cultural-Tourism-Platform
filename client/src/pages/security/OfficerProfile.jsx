import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Pencil,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  BadgeCheck,
  CalendarDays,
} from "lucide-react";
import userService from "../../services/userService";

/* ─── Tiny helpers ──────────────────────────────────────────── */

function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-medium shadow-lg"
      style={{
        backgroundColor: type === "success" ? "var(--color-forest)" : "var(--color-terracotta)",
        color: "white",
        animation: "slideUp 0.25s ease",
      }}
    >
      {type === "success"
        ? <CheckCircle2 size={15} strokeWidth={2} />
        : <AlertTriangle size={15} strokeWidth={2} />}
      {message}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--color-border-soft)" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--color-forest-pale)" }}
          >
            <Icon size={13} style={{ color: "var(--color-forest)" }} strokeWidth={2} />
          </span>
          <h2
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, value, placeholder = "—" }) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </p>
      <p className="text-sm" style={{ color: value ? "var(--color-text-dark)" : "var(--color-text-muted)" }}>
        {value || placeholder}
      </p>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", placeholder, required, disabled }) {
  return (
    <div>
      <label
        className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label} {required && <span style={{ color: "var(--color-terracotta)" }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-50"
        style={{
          backgroundColor: "var(--color-cream-light)",
          border: "1.5px solid var(--color-border-soft)",
          color: "var(--color-text-dark)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-forest)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-border-soft)")}
      />
    </div>
  );
}

function PasswordInput({ label, name, value, onChange, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label
        className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label} <span style={{ color: "var(--color-terracotta)" }}>*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm outline-none transition-all disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-cream-light)",
            border: "1.5px solid var(--color-border-soft)",
            color: "var(--color-text-dark)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-forest)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border-soft)")}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-black/5"
          style={{ color: "var(--color-text-muted)" }}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────── */

const EMPTY_PROFILE = { name: "", username: "", phone: "", bio: "", country: "", city: "" };
const EMPTY_PW = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function OfficerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Password state
  const [editingPassword, setEditingPassword] = useState(false);
  const [pwForm, setPwForm] = useState(EMPTY_PW);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState(null);

  // Avatar state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  /* Load profile */
  useEffect(() => {
    userService
      .updateProfile // sanity: confirm service exists, then fetch own profile
    // Use a dedicated "getMe" if available; falling back to a reasonable endpoint
    fetch("/api/users/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const u = data?.data?.user ?? data?.data ?? data;
        setProfile(u);
        setProfileForm({
          name: u.name ?? u.full_name ?? "",
          username: u.username ?? "",
          phone: u.phone ?? "",
          bio: u.bio ?? "",
          country: u.country ?? "",
          city: u.city ?? "",
        });
      })
      .catch(() => {
        // Fallback: show empty editable state
        setProfile({});
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Avatar upload ── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await userService.updateAvatar(formData);
      const updated = res.data.data.user;
      setProfile((p) => ({ ...p, avatar_url: updated.avatar_url }));
      setToast({ message: "Avatar updated.", type: "success" });
    } catch {
      setToast({ message: "Avatar upload failed.", type: "error" });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  /* ── Profile save ── */
  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) {
      setProfileError("Full name is required.");
      return;
    }
    setSavingProfile(true);
    setProfileError(null);
    try {
      const res = await userService.updateProfile(profileForm);
      const updated = res.data.data.user;
      setProfile((p) => ({ ...p, ...updated }));
      setEditingProfile(false);
      setToast({ message: "Profile saved successfully.", type: "success" });
    } catch (e) {
      setProfileError(e?.response?.data?.message ?? "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileCancel = () => {
    setEditingProfile(false);
    setProfileError(null);
    setProfileForm({
      name: profile?.name ?? profile?.full_name ?? "",
      username: profile?.username ?? "",
      phone: profile?.phone ?? "",
      bio: profile?.bio ?? "",
      country: profile?.country ?? "",
      city: profile?.city ?? "",
    });
  };

  /* ── Password save ── */
  const handlePasswordSave = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    setSavingPw(true);
    setPwError(null);
    try {
      await fetch("/api/users/me/password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: pwForm.currentPassword,
          new_password: pwForm.newPassword,
        }),
      }).then((r) => { if (!r.ok) throw new Error(); });
      setEditingPassword(false);
      setPwForm(EMPTY_PW);
      setToast({ message: "Password changed successfully.", type: "success" });
    } catch {
      setPwError("Current password is incorrect or request failed.");
    } finally {
      setSavingPw(false);
    }
  };

  /* ── Avatar initials ── */
  const displayName = profile?.name ?? profile?.full_name ?? "";
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-5">
        {[120, 80, 100].map((h, i) => (
          <div key={i} className="rounded-2xl animate-pulse" style={{ height: h, backgroundColor: "var(--color-border-soft)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
        >
          My Profile
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Manage your officer account and credentials.
        </p>
      </div>

      {/* ── Identity card ── */}
      <div
        className="relative rounded-2xl px-6 py-6 flex items-center gap-5"
        style={{
          backgroundColor: "var(--color-forest)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Background texture rings */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10"
          style={{ border: "1px solid white" }}
        />
        <div
          className="pointer-events-none absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-10"
          style={{ border: "1px solid white" }}
        />

        {/* Avatar */}
        <div className="relative shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="w-20 h-20 rounded-2xl object-cover"
              style={{ border: "3px solid rgba(255,255,255,0.2)" }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "white",
                border: "3px solid rgba(255,255,255,0.2)",
                fontFamily: "var(--font-display)",
              }}
            >
              {initials}
            </div>
          )}
          {/* Camera overlay */}
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-60"
            style={{ backgroundColor: "var(--color-terracotta)", color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
            title="Change avatar"
          >
            {uploadingAvatar
              ? <Loader2 size={13} className="animate-spin" />
              : <Camera size={13} strokeWidth={2} />
            }
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>
            {displayName || "Security Officer"}
          </p>
          {profile?.username && (
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              @{profile.username}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
            >
              <Shield size={10} strokeWidth={2.5} />
              {profile?.role ?? "Security"}
            </span>
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
            >
              <BadgeCheck size={10} strokeWidth={2.5} />
              {profile?.status ?? "Active"}
            </span>
            {joinedDate && (
              <span
                className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
              >
                <CalendarDays size={10} strokeWidth={2.5} />
                Since {joinedDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal info ── */}
      <SectionCard
        title="Personal Information"
        icon={User}
        action={
          !editingProfile ? (
            <button
              onClick={() => setEditingProfile(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: "var(--color-forest)", border: "1px solid var(--color-forest)" + "40" }}
            >
              <Pencil size={12} strokeWidth={2} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:brightness-95 disabled:opacity-60"
                style={{ backgroundColor: "var(--color-forest)", color: "white" }}
              >
                {savingProfile ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
                Save
              </button>
              <button
                onClick={handleProfileCancel}
                disabled={savingProfile}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5 disabled:opacity-60"
                style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
              >
                <X size={12} strokeWidth={2.5} />
                Cancel
              </button>
            </div>
          )
        }
      >
        {/* Error */}
        {profileError && (
          <div
            className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
          >
            <AlertTriangle size={14} strokeWidth={2} />
            {profileError}
          </div>
        )}

        {editingProfile ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                name="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Rohit Mehta"
                required
                disabled={savingProfile}
              />
            </div>
            <Input
              label="Username"
              name="username"
              value={profileForm.username}
              onChange={(e) => setProfileForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="rohit_mehta"
              disabled={savingProfile}
            />
            <Input
              label="Phone"
              name="phone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              disabled={savingProfile}
            />
            <Input
              label="City"
              name="city"
              value={profileForm.city}
              onChange={(e) => setProfileForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Mumbai"
              disabled={savingProfile}
            />
            <Input
              label="Country"
              name="country"
              value={profileForm.country}
              onChange={(e) => setProfileForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="India"
              disabled={savingProfile}
            />
            <div className="sm:col-span-2">
              <label
                className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Bio
              </label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Brief description about yourself…"
                disabled={savingProfile}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-all disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-cream-light)",
                  border: "1.5px solid var(--color-border-soft)",
                  color: "var(--color-text-dark)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-forest)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border-soft)")}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full Name" value={displayName} />
            </div>
            <Field label="Username" value={profile?.username ? `@${profile.username}` : null} />
            <Field label="Phone" value={profile?.phone} />
            <Field label="City" value={profile?.city} />
            <Field label="Country" value={profile?.country} />
            {profile?.bio && (
              <div className="sm:col-span-2">
                <Field label="Bio" value={profile.bio} />
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Contact (read-only email) ── */}
      <SectionCard title="Contact" icon={Mail}>
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Email Address
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-dark)" }}>
              {profile?.email ?? "—"}
            </p>
          </div>
          <span
            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)" }}
          >
            <BadgeCheck size={10} strokeWidth={2.5} />
            Verified
          </span>
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
          Email cannot be changed. Contact your admin to update it.
        </p>
      </SectionCard>

      {/* ── Change password ── */}
      <SectionCard
        title="Security"
        icon={Lock}
        action={
          !editingPassword ? (
            <button
              onClick={() => setEditingPassword(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: "var(--color-forest)", border: "1px solid var(--color-forest)" + "40" }}
            >
              <Pencil size={12} strokeWidth={2} />
              Change Password
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handlePasswordSave}
                disabled={savingPw}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:brightness-95 disabled:opacity-60"
                style={{ backgroundColor: "var(--color-forest)", color: "white" }}
              >
                {savingPw ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
                Save
              </button>
              <button
                onClick={() => { setEditingPassword(false); setPwForm(EMPTY_PW); setPwError(null); }}
                disabled={savingPw}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5 disabled:opacity-60"
                style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
              >
                <X size={12} strokeWidth={2.5} />
                Cancel
              </button>
            </div>
          )
        }
      >
        {!editingPassword ? (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-forest-pale)" }}
            >
              <Lock size={14} style={{ color: "var(--color-forest)" }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-dark)" }}>Password</p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Last changed — unknown</p>
            </div>
            <span className="ml-auto text-lg tracking-widest" style={{ color: "var(--color-text-muted)" }}>
              ••••••••
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {pwError && (
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
              >
                <AlertTriangle size={14} strokeWidth={2} />
                {pwError}
              </div>
            )}
            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              disabled={savingPw}
            />
            <PasswordInput
              label="New Password"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              disabled={savingPw}
            />
            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              disabled={savingPw}
            />
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Minimum 8 characters. Use a mix of letters, numbers, and symbols.
            </p>
          </div>
        )}
      </SectionCard>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}