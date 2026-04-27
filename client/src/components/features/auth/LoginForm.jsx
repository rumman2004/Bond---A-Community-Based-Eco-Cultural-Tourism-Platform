import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { useAuth } from "../../../context/AuthContext";

const ROLE_REDIRECT = {
  admin:     "/admin",
  security:  "/security",
  community: "/community",
  tourist:   "/tourist",
};

export default function LoginForm() {
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const formRef     = useRef(null);

  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      Array.from(formRef.current.children),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }
    );
  }, []);

  const update = (e) => {
    setError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const shakeForm = () =>
    gsap.fromTo(formRef.current, { x: -7 }, { x: 0, duration: 0.4, ease: "elastic.out(1,0.3)" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login(form);
      navigate(ROLE_REDIRECT[user?.role] || "/tourist", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
      shakeForm();
    } finally {
      setLoading(false);
    }
  };

  const inputCls   = "w-full rounded-[9px] border pl-9 pr-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 focus:border-[#3E7A58] focus:bg-white";
  const inputStyle = { borderColor: "#D9D0C2", backgroundColor: "#FAF7F2", color: "#1A2820" };
  const iconStyle  = { color: "#7A9285" };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
          Email address
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={iconStyle} />
          <input
            type="email" name="email" value={form.email} onChange={update}
            required autoComplete="email" placeholder="you@example.com"
            className={inputCls} style={inputStyle}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5448]">
            Password
          </label>
          <Link to="/auth/forgot-password" className="text-xs hover:underline underline-offset-2" style={{ color: "#3E7A58" }}>
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={iconStyle} />
          <input
            type={showPass ? "text" : "password"} name="password" value={form.password} onChange={update}
            required autoComplete="current-password" placeholder="••••••••"
            className={`${inputCls} pr-10`} style={inputStyle}
          />
          <button
            type="button" onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
            style={iconStyle}
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[9px] border border-[#D4735A]/30 bg-[#FFF0EC] px-3 py-2.5 text-sm text-[#D4735A]">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit" disabled={loading}
        className="group w-full flex items-center justify-center gap-2 rounded-[9px] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-55"
        style={{ backgroundColor: "#1C3D2E" }}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            Sign in
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t" style={{ borderColor: "#E8E1D5" }} />
        <span className="text-xs" style={{ color: "#7A9285" }}>or</span>
        <div className="flex-1 border-t" style={{ borderColor: "#E8E1D5" }} />
      </div>

      {/* Register link */}
      <Link
        to="/auth/register"
        className="block w-full rounded-[9px] border py-2.5 text-center text-sm font-medium transition hover:border-[#A8CCBA]"
        style={{ borderColor: "#D9D0C2", color: "#3D5448", backgroundColor: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAF7F2")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        Create an account
      </Link>
    </form>
  );
}