import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Camera, Save, User, Mail, Phone, MapPin, FileText, CheckCircle, AlertCircle, Lock, AtSign, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import authService from "../../services/authService";
import PageShell from "../PageShell";

// ─── Country codes ────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { label: "🇮🇳 +91",  code: "91",  digits: 10 },
  { label: "🇺🇸 +1",   code: "1",   digits: 10 },
  { label: "🇬🇧 +44",  code: "44",  digits: 10 },
  { label: "🇦🇺 +61",  code: "61",  digits: 9  },
  { label: "🇨🇦 +1",   code: "1",   digits: 10 },
  { label: "🇩🇪 +49",  code: "49",  digits: 10 },
  { label: "🇫🇷 +33",  code: "33",  digits: 9  },
  { label: "🇯🇵 +81",  code: "81",  digits: 10 },
  { label: "🇨🇳 +86",  code: "86",  digits: 11 },
  { label: "🇧🇷 +55",  code: "55",  digits: 11 },
  { label: "🇿🇦 +27",  code: "27",  digits: 9  },
  { label: "🇸🇬 +65",  code: "65",  digits: 8  },
  { label: "🇦🇪 +971", code: "971", digits: 9  },
  { label: "🇳🇬 +234", code: "234", digits: 10 },
  { label: "🇵🇰 +92",  code: "92",  digits: 10 },
  { label: "🇧🇩 +880", code: "880", digits: 10 },
  { label: "🇲🇾 +60",  code: "60",  digits: 10 },
  { label: "🇮🇩 +62",  code: "62",  digits: 10 },
  { label: "🇵🇭 +63",  code: "63",  digits: 10 },
  { label: "🇰🇷 +82",  code: "82",  digits: 10 },
  { label: "🇮🇹 +39",  code: "39",  digits: 10 },
  { label: "🇷🇺 +7",   code: "7",   digits: 10 },
  { label: "🇲🇽 +52",  code: "52",  digits: 10 },
  { label: "🇳🇱 +31",  code: "31",  digits: 9  },
  { label: "🇹🇷 +90",  code: "90",  digits: 10 },
];

// ─── Countries ───────────────────────────────────────────────────────────────
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin",
  "Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile","China",
  "Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Ethiopia",
  "Finland","France","Gabon","Georgia","Germany","Ghana","Greece","Guatemala","Guinea",
  "Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos",
  "Latvia","Lebanon","Liberia","Libya","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova",
  "Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal",
  "Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway",
  "Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia",
  "Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Sweden",
  "Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tunisia",
  "Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a stored e.164-like string (e.g. "+919876543210") into { countryCode, number } */
function parsePhone(raw = "") {
  const digits = raw.replace(/\D/g, "");
  for (const cc of [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)) {
    if (digits.startsWith(cc.code)) {
      return { countryCode: cc.code, number: digits.slice(cc.code.length) };
    }
  }
  return { countryCode: "91", number: digits };
}

/** Validate local phone number length against the selected country */
function validatePhone(number, countryCode) {
  const cc = COUNTRY_CODES.find(c => c.code === countryCode);
  if (!cc) return null;
  if (!number) return null;
  if (number.length !== cc.digits)
    return `Phone must be ${cc.digits} digits for +${countryCode} (got ${number.length})`;
  return null;
}

/** Validate username: 3-30 chars, alphanumeric + underscores only, no leading/trailing underscore */
function validateUsername(value) {
  if (!value) return null;
  if (value.length < 3)  return "Username must be at least 3 characters";
  if (value.length > 30) return "Username must be 30 characters or fewer";
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers, and underscores allowed";
  if (/^_|_$/.test(value)) return "Username can't start or end with an underscore";
  return null;
}

// ─── CountryField ─────────────────────────────────────────────────────────────
function CountryField({ value, onChange }) {
  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Country</label>
      <div className="relative">
        <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8AFA4] group-focus-within:text-[#3E7A58] transition-colors pointer-events-none" />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-[12px] border border-[#E0D8CE] bg-white pl-9 pr-4 py-3 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all appearance-none"
        >
          <option value="">Select your country</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {/* Chevron */}
        <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="#9A9285" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ─── UsernameField ────────────────────────────────────────────────────────────
function UsernameField({ value, onChange }) {
  const [dirty, setDirty] = useState(false);
  const error = validateUsername(value);

  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Username</label>
      <div className="relative">
        <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8AFA4] group-focus-within:text-[#3E7A58] transition-colors pointer-events-none" />
        <input
          type="text"
          value={value}
          maxLength={30}
          placeholder="e.g. john_doe"
          onBlur={() => setDirty(true)}
          onChange={e => {
            // lowercase, strip spaces
            onChange(e.target.value.toLowerCase().replace(/\s/g, ""));
            setDirty(true);
          }}
          className={`w-full rounded-[12px] border py-3 pl-9 pr-4 text-sm text-[#1A2820] focus:outline-none focus:ring-2 transition-all placeholder:text-[#C4B8A8] ${
            dirty && error
              ? "border-red-400 focus:border-red-400 focus:ring-red-100"
              : dirty && value && !error
              ? "border-emerald-400 focus:border-[#3E7A58] focus:ring-[#3E7A58]/10"
              : "border-[#E0D8CE] focus:border-[#3E7A58] focus:ring-[#3E7A58]/10"
          }`}
        />
        {/* Tick / cross indicator */}
        {dirty && value && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs">
            {error
              ? <AlertCircle size={14} className="text-red-400" />
              : <CheckCircle size={14} className="text-emerald-500" />
            }
          </span>
        )}
      </div>
      {dirty && error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} />{error}
        </p>
      )}
      {dirty && value && !error && (
        <p className="mt-1.5 text-xs text-[#9A9285]">Looks good!</p>
      )}
    </div>
  );
}


function PhoneField({ countryCode, number, onCountryChange, onNumberChange }) {
  const error = validatePhone(number, countryCode);
  const dirty = number.length > 0;

  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">
        Phone
      </label>

      <div className="flex gap-2">
        {/* Country code selector */}
        <select
          value={countryCode}
          onChange={e => onCountryChange(e.target.value)}
          className="rounded-[12px] border border-[#E0D8CE] bg-white px-2 py-3 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all"
          style={{ minWidth: "110px" }}
        >
          {COUNTRY_CODES.map(cc => (
            <option key={`${cc.code}-${cc.label}`} value={cc.code}>
              {cc.label}
            </option>
          ))}
        </select>

        {/* Number input */}
        <div className="relative flex-1">
          <Phone
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8AFA4] group-focus-within:text-[#3E7A58] transition-colors pointer-events-none"
          />
          <input
            type="tel"
            value={number}
            onChange={e => {
              // strip non-digits, limit to 12 chars
              const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
              onNumberChange(cleaned);
            }}
            placeholder={`${COUNTRY_CODES.find(c => c.code === countryCode)?.digits ?? 10} digits`}
            className={`w-full rounded-[12px] border py-3 pl-9 pr-4 text-sm text-[#1A2820] focus:outline-none focus:ring-2 transition-all placeholder:text-[#C4B8A8] ${
              dirty && error
                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                : "border-[#E0D8CE] focus:border-[#3E7A58] focus:ring-[#3E7A58]/10"
            }`}
          />
        </div>
      </div>

      {/* Inline error */}
      {dirty && error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} />
          {error}
        </p>
      )}

      {/* Preview of the full number */}
      {dirty && !error && (
        <p className="mt-1.5 text-xs text-[#9A9285]">
          Saves as: +{countryCode}{number}
        </p>
      )}
    </div>
  );
}

// ─── Generic Field ────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, type = "text", icon: Icon, multiline = false, disabled = false }) {
  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8AFA4] group-focus-within:text-[#3E7A58] transition-colors pointer-events-none" />
        )}
        {multiline ? (
          <textarea
            name={name} value={value} onChange={onChange} rows={3}
            className="w-full rounded-[12px] border border-[#E0D8CE] bg-white px-4 py-3 text-sm text-[#1A2820] resize-none focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]"
          />
        ) : (
          <input
            type={type} name={name} value={value} onChange={onChange} disabled={disabled}
            className="w-full rounded-[12px] border border-[#E0D8CE] bg-white py-3 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8] disabled:bg-[#F5F2EE] disabled:text-[#9A9285]"
            style={{ paddingLeft: Icon ? "2.5rem" : "1rem", paddingRight: "1rem" }}
          />
        )}
      </div>
    </div>
  );
}

// ─── AvatarUploader ───────────────────────────────────────────────────────────
function AvatarUploader({ name, avatarUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const ringRef  = useRef(null);

  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    gsap.to(ringRef.current, { rotation: 360, duration: 1, repeat: -1, ease: "none" });
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await userService.updateAvatar(formData);
      const url = res?.data?.user?.avatar_url ?? res?.user?.avatar_url;
      if (url) onUploaded(url);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
      gsap.killTweensOf(ringRef.current);
      gsap.to(ringRef.current, { rotation: 0, duration: 0.3 });
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#D4E6DC] bg-[#E8F0EC] flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-[#3E7A58]" style={{ fontFamily: "'Playfair Display', serif" }}>{initials}</span>
          )}
        </div>
        {uploading && (
          <div ref={ringRef} className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#3E7A58]" />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1C3D2E] flex items-center justify-center hover:bg-[#2D5C42] transition-colors shadow-md"
        >
          <Camera size={13} color="#F2EDE4" />
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      <div>
        <p className="font-semibold text-[#1A2820] text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>{name || "Your Name"}</p>
        <p className="text-xs text-[#9A9285] mt-0.5">Tourist · Click the camera to update photo</p>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ type, message, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" })
      .to(ref.current, { y: 20, opacity: 0, duration: 0.4, ease: "power3.in", delay: 2.5, onComplete: onDone });
  }, []);
  const isOk = type === "success";
  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-[12px] px-4 py-3 shadow-xl text-sm font-medium"
      style={{ background: isOk ? "#1C3D2E" : "#5C1A1A", color: "#F2EDE4" }}>
      {isOk ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TouristProfile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", bio: "", location: "", username: "", country: "", city: "",
  });

  // Phone stored separately so we can split code + number
  const [phoneCountryCode, setPhoneCountryCode] = useState("91");
  const [phoneNumber, setPhoneNumber]           = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);
  const [tab, setTab]       = useState("profile");
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
  }, []);

  const seedForm = (u) => {
    setForm({
      name:     u.name || u.full_name || "",
      email:    u.email || "",
      bio:      u.bio || "",
      location: u.location || "",
      username: u.username || "",
      country:  u.country || "",
      city:     u.city || "",
    });
    setAvatar(u.avatar_url || "");
    const { countryCode, number } = parsePhone(u.phone || "");
    setPhoneCountryCode(countryCode);
    setPhoneNumber(number);
  };

  useEffect(() => {
    if (user) seedForm(user);
    authService.getMe().then(u => { if (u) seedForm(u); }).catch(() => {});
  }, [user]);

  const update   = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const updatePw = e => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const showToast = (type, message) => setToast({ type, message, key: Date.now() });

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validate phone before sending
    const phoneError = validatePhone(phoneNumber, phoneCountryCode);
    if (phoneNumber && phoneError) {
      showToast("error", phoneError);
      return;
    }

    // Validate username before sending
    if (form.username && usernameError) {
      showToast("error", usernameError);
      return;
    }

    setSaving(true);
    try {
      const fullPhone = phoneNumber ? `+${phoneCountryCode}${phoneNumber}` : "";
      const res = await userService.updateProfile({
        name:     form.name,
        username: form.username,
        phone:    fullPhone,
        bio:      form.bio,
        location: form.location,
        country:  form.country,
        city:     form.city,
      });
      const updated = res?.data?.user ?? res?.user;
      if (updated && setUser) setUser(u => ({ ...u, ...updated }));
      showToast("success", "Profile saved!");
    } catch (err) {
      showToast("error", err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast("error", "Passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      showToast("success", "Password updated!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showToast("error", err.message || "Password change failed.");
    } finally {
      setSaving(false);
    }
  };

  // Disable save if phone or username has a validation error
  const phoneError    = validatePhone(phoneNumber, phoneCountryCode);
  const phoneInvalid  = phoneNumber.length > 0 && !!phoneError;
  const usernameError = validateUsername(form.username);
  const formInvalid   = phoneInvalid || (!!form.username && !!usernameError);

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] px-4 py-8">
        <div ref={cardRef} className="max-w-xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
              My Profile
            </h1>
            <p className="text-sm text-[#9A9285] mt-0.5">Keep your traveller details up to date</p>
          </div>

          {/* Avatar */}
          <div className="bg-white rounded-[18px] border border-[#E8E1D5] p-5 mb-4">
            <AvatarUploader name={form.name} avatarUrl={avatar} onUploaded={setAvatar} />
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-[12px] bg-[#F0EBE3] p-1 mb-4">
            {[["profile", "Personal info"], ["password", "Password"]].map(([key, label]) => (
              <button key={key} type="button" onClick={() => setTab(key)}
                className="flex-1 py-2 rounded-[9px] text-sm font-medium transition-all duration-200"
                style={{
                  background: tab === key ? "#1C3D2E" : "transparent",
                  color:      tab === key ? "#F2EDE4"  : "#7A9285",
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Profile form */}
          {tab === "profile" && (
            <form onSubmit={handleSaveProfile} className="bg-white rounded-[18px] border border-[#E8E1D5] p-5 space-y-4">
              <Field label="Full name" name="name"     value={form.name}     onChange={update} icon={User} />
              <UsernameField value={form.username} onChange={val => setForm(f => ({ ...f, username: val }))} />
              <Field label="Email"     name="email"    value={form.email}    onChange={update} icon={Mail} disabled />

              {/* Phone with country code + validation */}
              <PhoneField
                countryCode={phoneCountryCode}
                number={phoneNumber}
                onCountryChange={setPhoneCountryCode}
                onNumberChange={setPhoneNumber}
              />

              <CountryField value={form.country} onChange={val => setForm(f => ({ ...f, country: val }))} />
              <Field label="City"     name="city"     value={form.city}     onChange={update} icon={MapPin} />
              <Field label="Bio"      name="bio"      value={form.bio}      onChange={update} icon={FileText} multiline />

              <button
                type="submit"
                disabled={saving || formInvalid}
                className="w-full flex items-center justify-center gap-2 rounded-[12px] py-3 text-sm font-semibold text-[#F2EDE4] transition-all disabled:opacity-60 hover:opacity-90"
                style={{ background: "#1C3D2E" }}
              >
                {saving
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <><Save size={15} /> Save changes</>
                }
              </button>
            </form>
          )}

          {/* Password form */}
          {tab === "password" && (
            <form onSubmit={handleChangePassword} className="bg-white rounded-[18px] border border-[#E8E1D5] p-5 space-y-4">
              <Field label="Current password" name="currentPassword" value={pwForm.currentPassword} onChange={updatePw} icon={Lock} type="password" />
              <Field label="New password"     name="newPassword"     value={pwForm.newPassword}     onChange={updatePw} icon={Lock} type="password" />
              <Field label="Confirm password" name="confirmPassword" value={pwForm.confirmPassword} onChange={updatePw} icon={Lock} type="password" />
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-[12px] py-3 text-sm font-semibold text-[#F2EDE4] transition-all disabled:opacity-60 hover:opacity-90"
                style={{ background: "#1C3D2E" }}>
                {saving
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <><Lock size={15} /> Update password</>
                }
              </button>
            </form>
          )}
        </div>

        {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onDone={() => setToast(null)} />}
      </div>
    </PageShell>
  );
}