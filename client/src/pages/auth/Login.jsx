import { Link } from "react-router-dom";
import { Compass, MapPin, ShieldCheck } from "lucide-react";
import LoginForm from "../../components/features/auth/LoginForm";
import AuthShell from "./AuthShell";

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Verified communities",
    description: "Hosts, IDs, and consent details are reviewed before listings go live.",
  },
  {
    icon: Compass,
    title: "Local-first journeys",
    description: "Discover places, food, craft, and stories that regular maps usually miss.",
  },
  {
    icon: MapPin,
    title: "Designed for India",
    description: "Search, book, and manage trips across community-led destinations.",
  },
];

export default function Login() {
  return (
    <AuthShell
      kicker="Community travel"
      title="The places locals love, ready when you are."
      description="Log in to manage bookings, stories, and the community experiences that make each journey feel personal."
      highlights={HIGHLIGHTS}
      note={{
        title: "Secure by default",
        description: "Your account connects travellers, community hosts, security reviewers, and admins through role-based access.",
      }}
      footer={
        <>
          <p className="mt-8 text-center text-sm text-[#7A9285]">
            New to Bond?{" "}
            <Link to="/auth/register" className="font-semibold text-[#1C3D2E] underline-offset-2 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-4 text-center text-xs leading-5 text-[#A89F91]">
            By signing in you agree to Bond's Terms and Privacy Policy.
          </p>
        </>
      }
    >
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase text-[#3E7A58]">Welcome back</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1A2820] sm:text-4xl">
          Sign in to Bond
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#7A9285]">
          Continue to your dashboard without changing how anything works.
        </p>
      </div>
      <LoginForm />
    </AuthShell>
  );
}
