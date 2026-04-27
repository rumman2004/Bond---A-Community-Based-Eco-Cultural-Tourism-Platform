import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { Button, Input } from "../../ui";
import { useAuth } from "../../../context/AuthContext";
import { validateRegister } from "../../../utils/validators";

// Only tourist + community can self-register.
// Admin and security accounts are created by an admin.
const ROLES = [
  {
    value: "tourist",
    label: "Tourist",
    description: "Explore & book experiences",
  },
  {
    value: "community",
    label: "Community host",
    description: "Share your culture & earn",
  },
];

// Maps server-returned role → dashboard route
const ROLE_REDIRECT = {
  tourist:   "/tourist",
  community: "/community",
  security:  "/security",
  admin:     "/admin",
};

export default function RegisterForm() {
  const navigate  = useNavigate();
  const { register } = useAuth();

  const [form, setForm]         = useState({ name: "", email: "", password: "", role: "tourist" });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const update = (e) => {
    setApiError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectRole = (role) => {
    setApiError("");
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validateRegister(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setApiError("");

    try {
      // authService.register() calls POST /auth/register
      // payload: { name, email, password, role }
      // returns { token, user: { id, name, email, role } }
      const data = await register(form);

      // Always redirect based on what the SERVER says the role is,
      // not what the user selected — server is the source of truth
      const role     = data?.user?.role;
      const redirect = ROLE_REDIRECT[role] || "/";
      navigate(redirect, { replace: true });

    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const serverErrors = {};
        err.errors.forEach(e => {
          serverErrors[e.field] = e.message;
        });
        setErrors(prev => ({ ...prev, ...serverErrors }));
        setApiError("Please fix the errors below.");
      } else {
        setApiError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Server-side error banner */}
      {apiError && (
        <div className="flex items-center gap-2 rounded-[9px] border border-[#EBB8AA] bg-[#FAF0EC] px-4 py-3 text-sm text-[#A04D38]">
          <AlertCircle size={15} className="shrink-0" />
          {apiError}
        </div>
      )}

      <Input
        label="Full name"
        name="name"
        icon={User}
        value={form.name}
        onChange={update}
        error={errors.name}
        autoComplete="name"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        icon={Mail}
        value={form.email}
        onChange={update}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        icon={Lock}
        value={form.password}
        onChange={update}
        error={errors.password}
        autoComplete="new-password"
      />

      {/* Role selector */}
      <div className="space-y-2">
        <span className="text-[13px] font-medium text-[#1A2820]">I am a</span>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((role) => {
            const active = form.role === role.value;
            return (
              <button
                type="button"
                key={role.value}
                onClick={() => selectRole(role.value)}
                className="flex flex-col rounded-[10px] border px-4 py-3 text-left transition-all duration-150"
                style={{
                  background:   active ? "#1C3D2E" : "#FAF7F2",
                  borderColor:  active ? "#1C3D2E" : "rgba(28,61,46,0.2)",
                  color:        active ? "#F2EDE4" : "#3D5448",
                }}
              >
                <span className="text-sm font-medium">{role.label}</span>
                <span
                  className="mt-0.5 text-xs"
                  style={{ color: active ? "rgba(242,237,228,0.7)" : "#7A9285" }}
                >
                  {role.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" full loading={loading}>
        Create account
      </Button>

    </form>
  );
}