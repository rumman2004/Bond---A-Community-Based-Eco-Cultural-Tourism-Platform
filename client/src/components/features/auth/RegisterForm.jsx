import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { useAuth } from "../../../context/AuthContext";
import { Button, Input } from "../../ui";

const ROLE_REDIRECT = {
  admin:     "/admin",
  security:  "/security",
  community: "/community",
  tourist:   "/tourist",
};

export default function RegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tourist",
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const setRole = (role) => {
    setError("");
    setForm((f) => ({ ...f, role }));
  };

  const shakeForm = () =>
    gsap.fromTo(formRef.current, { x: -7 }, { x: 0, duration: 0.4, ease: "elastic.out(1,0.3)" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      shakeForm();
      return;
    }

    setLoading(true);
    try {
      const { user } = await register(form);
      const from = location.state?.from;
      let targetPath = from?.pathname || from || ROLE_REDIRECT[user?.role] || "/tourist";
      
      if (user?.role === "tourist" && (targetPath.startsWith("/community") || targetPath.startsWith("/admin") || targetPath.startsWith("/security"))) {
        targetPath = "/tourist";
      }
      if (user?.role === "community" && targetPath.startsWith("/tourist")) {
        targetPath = "/community";
      }

      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      shakeForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Role Selection */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5448] block mb-2">
          Register as a
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("tourist")}
            className={`rounded-[9px] py-3 text-sm font-semibold border transition-all ${
              form.role === "tourist"
                ? "bg-[#1C3D2E] text-[#F2EDE4] border-[#1C3D2E]"
                : "bg-white text-[#1A2820] border-[#D9D0C2] hover:border-[#3E7A58]"
            }`}
          >
            Traveller
          </button>
          <button
            type="button"
            onClick={() => setRole("community")}
            className={`rounded-[9px] py-3 text-sm font-semibold border transition-all ${
              form.role === "community"
                ? "bg-[#1C3D2E] text-[#F2EDE4] border-[#1C3D2E]"
                : "bg-white text-[#1A2820] border-[#D9D0C2] hover:border-[#3E7A58]"
            }`}
          >
            Community Host
          </button>
        </div>
      </div>

      <Input
        label="Full Name"
        type="text"
        name="name"
        icon={User}
        value={form.name}
        onChange={update}
        required
        placeholder="John Doe"
      />

      <Input
        label="Email address"
        type="email"
        name="email"
        icon={Mail}
        value={form.email}
        onChange={update}
        required
        autoComplete="email"
        placeholder="you@example.com"
      />

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5448] block mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9285]" />
          <input
            type={showPass ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={update}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white py-2.5 pl-9 pr-10 text-sm text-[#1A2820] transition focus:border-[#2A5940] focus:outline-none focus:shadow-[0_0_0_3px_rgba(28,61,46,0.12)]"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A9285] transition hover:text-[#1C3D2E]"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-[9px] border border-[#D4735A]/30 bg-[#FFF0EC] px-3 py-2.5 text-sm text-[#D4735A]">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" full loading={loading} iconRight={ArrowRight}>
        Create Account
      </Button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t" style={{ borderColor: "#E8E1D5" }} />
        <span className="text-xs" style={{ color: "#7A9285" }}>or</span>
        <div className="flex-1 border-t" style={{ borderColor: "#E8E1D5" }} />
      </div>
    </form>
  );
}
