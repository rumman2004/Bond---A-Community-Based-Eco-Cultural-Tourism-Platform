import { Link } from "react-router-dom";
import LoginForm from "../../components/features/auth/LoginForm";
import { Map, Leaf, Star } from "lucide-react";

const HIGHLIGHTS = [
  { icon: "🌿", text: "240+ verified communities" },
  { icon: "⭐", text: "18,000+ curated experiences" },
  { icon: "🗺️", text: "Across 32 states of India" },
];

export default function Login() {
  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: "var(--color-cream, #FAF7F2)" }}
    >
      {/* ── LEFT PANEL (brand) ── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-forest-deep, #1C3D2E)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: "#4CAF82" }}
        />
        <div
          className="absolute bottom-0 -left-16 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: "#8BC4A4" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            <Map size={17} color="white" strokeWidth={1.8} />
          </span>
          <span
            className="text-xl font-semibold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display, Georgia)" }}
          >
            Bond.
          </span>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#8BC4A4" }}>
            Community travel
          </p>
          <h2
            className="text-4xl xl:text-5xl font-semibold text-white leading-[1.1] mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-display, Georgia)" }}
          >
            The places locals love — that maps miss.
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
            Every hidden waterfall, ancestral craft village, and century-old
            street food corner has a community behind it.
          </p>

          <div className="flex flex-col gap-3">
            {HIGHLIGHTS.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div
          className="relative z-10 rounded-2xl p-5"
          style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex gap-0.5 mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={13} fill="#F5C842" style={{ color: "#F5C842" }} />
            ))}
          </div>
          <p className="text-sm leading-relaxed italic mb-3" style={{ color: "rgba(255,255,255,0.75)" }}>
            "Stayed with an Apatani family in Ziro. Cooked bamboo rice, learned about their water conservation — no tour operator could have given me this."
          </p>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "#4CAF82", color: "white" }}
            >
              RK
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Riya Kapoor</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Mumbai · Verified traveller</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-10">
        {/* Mobile-only logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <span
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ backgroundColor: "var(--color-forest-deep, #1C3D2E)" }}
          >
            <Map size={17} color="white" strokeWidth={1.8} />
          </span>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display, Georgia)", color: "var(--color-forest-deep, #1C3D2E)" }}
          >
            Bond.
          </span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2"
              style={{ fontFamily: "var(--font-display, Georgia)", color: "#1A2820" }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "#7A9285" }}>
              Log in to manage bookings, stories, and community experiences.
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <p className="mt-8 text-center text-sm" style={{ color: "#7A9285" }}>
            New to Bond?{" "}
            <Link
              to="/auth/register"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: "#1C3D2E" }}
            >
              Create an account
            </Link>
          </p>
          <p className="mt-4 text-center text-xs" style={{ color: "#B0A898" }}>
            By signing in you agree to Bond's{" "}
            <a href="#" className="underline">Terms</a> &{" "}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}