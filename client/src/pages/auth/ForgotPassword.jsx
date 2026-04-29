import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { Button, Input } from "../../components/ui";
import authService from "../../services/authService";
import AuthShell from "./AuthShell";

const HIGHLIGHTS = [
  {
    icon: Mail,
    title: "Inbox first",
    description: "We send reset instructions to the email registered with your account.",
  },
  {
    icon: Clock,
    title: "Time limited",
    description: "Reset links expire automatically to protect your account.",
  },
  {
    icon: LifeBuoy,
    title: "Help is close",
    description: "If the email does not arrive, you can try another address or return to login.",
  },
];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <AuthShell
      kicker="Account recovery"
      title="A reset flow that feels calm, clear, and secure."
      description="Enter your registered email address and Bond will send you a secure password reset link."
      highlights={HIGHLIGHTS}
      note={{
        title: "Remember your password?",
        description: "Return to login and continue managing your journeys.",
      }}
    >
      <Link
        to="/auth/login"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#7A9285] transition hover:text-[#1C3D2E]"
      >
        <ArrowLeft size={15} />
        Back to login
      </Link>

      {sent ? (
        <div className="surface-panel p-7 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4E6DC] text-[#1C3D2E]">
            <CheckCircle size={30} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1A2820]">Check your inbox</h1>
          <p className="mt-3 text-sm leading-6 text-[#7A9285]">
            We sent a password reset link to <span className="font-semibold text-[#1C3D2E]">{email}</span>.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button type="button" full icon={ArrowLeft} onClick={() => setSent(false)} variant="ghost">
              Change email
            </Button>
            <Button type="button" full icon={ShieldCheck} onClick={() => { window.location.href = "/auth/login"; }}>
              Back to login
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase text-[#3E7A58]">Reset password</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1A2820] sm:text-4xl">
              Recover your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#7A9285]">
              Enter your email and we will send reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              name="email"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              autoComplete="email"
              placeholder="you@example.com"
              error={error}
            />

            <Button type="submit" full loading={loading} disabled={!email.trim()}>
              Send reset link
            </Button>

            <p className="text-center text-sm text-[#7A9285]">
              Remembered it?{" "}
              <Link to="/auth/login" className="font-semibold text-[#1C3D2E] underline-offset-2 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </>
      )}
    </AuthShell>
  );
}
