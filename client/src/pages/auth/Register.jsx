import { Link } from "react-router-dom";
import RegisterForm from "../../components/features/auth/RegisterForm";
import { Map, Star } from "lucide-react";

const STEPS = [
  { num: "01", title: "Pick your role", desc: "Traveller exploring India or a community wanting to share its culture." },
  { num: "02", title: "Create your profile", desc: "Your name, email, and a secure password — done in under a minute." },
  { num: "03", title: "Start experiencing", desc: "Book, explore, or list your first community experience right away." },
];

export default function Register() {
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
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
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
            Join the community
          </p>
          <h2
            className="text-4xl xl:text-5xl font-semibold text-white leading-[1.1] mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-display, Georgia)" }}
          >
            Two minutes to your first real experience.
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
            Whether you're here to explore India's hidden corners or to share your community's story — you're in the right place.
          </p>

          <div className="flex flex-col gap-5">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4 items-start">
                <span
                  className="text-xs font-bold px-2 py-1 rounded-md shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#8BC4A4" }}
                >
                  {num}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust note */}
        <div
          className="relative z-10 rounded-2xl p-5 flex items-start gap-4"
          style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-white mb-1">Your data stays yours</p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Bond never sells your data. Community revenue goes 100% to the hosts.
            </p>
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

        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2"
              style={{ fontFamily: "var(--font-display, Georgia)", color: "#1A2820" }}
            >
              Join Bond
            </h1>
            <p className="text-sm" style={{ color: "#7A9285" }}>
              Create your tourist or community host account.
            </p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Footer */}
          <p className="mt-8 text-center text-sm" style={{ color: "#7A9285" }}>
            Already registered?{" "}
            <Link
              to="/auth/login"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: "#1C3D2E" }}
            >
              Log in
            </Link>
          </p>
          <p className="mt-4 text-center text-xs" style={{ color: "#B0A898" }}>
            By creating an account you agree to Bond's{" "}
            <a href="#" className="underline">Terms</a> &{" "}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}