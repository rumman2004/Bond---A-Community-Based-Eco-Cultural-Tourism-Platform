import { Link } from "react-router-dom";
import { BadgeCheck, Route, UserRoundPlus } from "lucide-react";
import RegisterForm from "../../components/features/auth/RegisterForm";
import AuthShell from "./AuthShell";

const HIGHLIGHTS = [
  {
    icon: UserRoundPlus,
    title: "Pick your role",
    description: "Create a traveller account or register as a community host.",
  },
  {
    icon: BadgeCheck,
    title: "Build trust fast",
    description: "Community profiles can continue into verification after signup.",
  },
  {
    icon: Route,
    title: "Start right away",
    description: "Explore listings, manage bookings, or prepare your first experience.",
  },
];

export default function Register() {
  return (
    <AuthShell
      kicker="Join the network"
      title="Create your account and step into community-led travel."
      description="Bond keeps the signup quick while leaving room for the trust and verification steps hosts need."
      highlights={HIGHLIGHTS}
      note={{
        title: "Community revenue stays with hosts",
        description: "The platform is designed around local ownership, clear records, and transparent participation.",
      }}
      footer={
        <>
          <p className="mt-8 text-center text-sm text-[#7A9285]">
            Already registered?{" "}
            <Link to="/auth/login" className="font-semibold text-[#1C3D2E] underline-offset-2 hover:underline">
              Log in
            </Link>
          </p>
          <p className="mt-4 text-center text-xs leading-5 text-[#A89F91]">
            By creating an account you agree to Bond's Terms and Privacy Policy.
          </p>
        </>
      }
    >
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase text-[#3E7A58]">Get started</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1A2820] sm:text-4xl">
          Join Bond
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#7A9285]">
          Create your tourist or community host account.
        </p>
      </div>
      <RegisterForm />
    </AuthShell>
  );
}
