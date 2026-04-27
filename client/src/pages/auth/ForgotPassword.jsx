import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Map, CheckCircle } from "lucide-react";
import { Button, Input } from "../../components/ui";
import authService from "../../services/authService";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: "var(--color-cream, #FAF7F2)" }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-forest-deep, #1C3D2E)" }}
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10" style={{ backgroundColor: "#4CAF82" }} />
        <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: "#8BC4A4" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            <Map size={17} color="white" strokeWidth={1.8} />
          </span>
          <span className="text-xl font-semibold text-white tracking-tight" style={{ fontFamily: "var(--font-display, Georgia)" }}>
            Bond.
          </span>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#8BC4A4" }}>
            Account recovery
          </p>
          <h2
            className="text-4xl xl:text-5xl font-semibold text-white leading-[1.1] mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-display, Georgia)" }}
          >
            Happens to everyone. We've got you.
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Enter your registered email address and we'll send you a secure link to reset your password. It takes less than a minute.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            {[
              { icon: "📧", text: "Check your inbox within 2 minutes" },
              { icon: "🔐", text: "Link expires after 30 minutes for security" },
              { icon: "💬", text: "Still stuck? Reach us at help@bond.in" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div
          className="relative z-10 rounded-2xl p-5"
          style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-sm font-semibold text-white mb-1">Remember your password?</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Head back to{" "}
            <Link to="/auth/login" className="underline" style={{ color: "#8BC4A4" }}>
              Log in
            </Link>{" "}
            and continue your journey.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <span className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "var(--color-forest-deep, #1C3D2E)" }}>
            <Map size={17} color="white" strokeWidth={1.8} />
          </span>
          <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display, Georgia)", color: "#1C3D2E" }}>
            Bond.
          </span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Back link */}
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm mb-8 transition-opacity hover:opacity-60"
            style={{ color: "#7A9285" }}
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>

          {sent ? (
            /* ── Success state ── */
            <div className="text-center py-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "#D4E6DC" }}
              >
                <CheckCircle size={30} style={{ color: "#1C3D2E" }} />
              </div>
              <h1
                className="text-3xl font-semibold tracking-tight mb-3"
                style={{ fontFamily: "var(--font-display, Georgia)", color: "#1A2820" }}
              >
                Check your inbox
              </h1>
              <p className="text-sm leading-relaxed mb-2" style={{ color: "#7A9285" }}>
                We've sent a password reset link to
              </p>
              <p className="text-sm font-semibold mb-8" style={{ color: "#1C3D2E" }}>
                {email}
              </p>
              <p className="text-xs mb-6" style={{ color: "#B0A898" }}>
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="underline"
                  style={{ color: "#1C3D2E" }}
                >
                  try a different email
                </button>.
              </p>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: "#1C3D2E", color: "white" }}
              >
                Back to login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-8">
                <h1
                  className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2"
                  style={{ fontFamily: "var(--font-display, Georgia)", color: "#1A2820" }}
                >
                  Reset password
                </h1>
                <p className="text-sm" style={{ color: "#7A9285" }}>
                  Enter your email and we'll send reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#3D5448" }}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7A9285" }} />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-[9px] border pl-9 pr-3 py-2.5 text-sm transition focus:outline-none focus:ring-2"
                      style={{
                        borderColor: error ? "#D4735A" : "#D9D0C2",
                        backgroundColor: "#FAF7F2",
                        color: "#1A2820",
                        "--tw-ring-color": "rgba(62,122,88,0.2)",
                      }}
                    />
                  </div>
                  {error && (
                    <p className="mt-1.5 text-xs" style={{ color: "#D4735A" }}>{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-[9px] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#1C3D2E" }}
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    "Send reset link"
                  )}
                </button>

                <p className="text-center text-sm" style={{ color: "#7A9285" }}>
                  Remembered it?{" "}
                  <Link to="/auth/login" className="font-semibold hover:underline underline-offset-2" style={{ color: "#1C3D2E" }}>
                    Log in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}