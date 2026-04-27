import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, Shield, Leaf, Users, ArrowRight, MapPin } from "lucide-react";
import { Button, Card } from "../../components/ui";

gsap.registerPlugin(ScrollTrigger);

const VALUES = [
  {
    icon: Heart,
    title: "Community First",
    desc: "Every rupee spent goes directly to local communities. No middlemen, no corporate chains — just authentic connections that create lasting impact.",
    color: "terracotta",
  },
  {
    icon: Leaf,
    title: "Eco-Responsible",
    desc: "We verify that each community partner follows sustainable tourism practices before listing them on Bond.",
    color: "forest",
  },
  {
    icon: Shield,
    title: "Verified & Safe",
    desc: "Our security team manually verifies every community profile. Travel with confidence, knowing every listing is genuine.",
    color: "amber",
  },
  {
    icon: Users,
    title: "Built Together",
    desc: "Bond is co-designed with the communities it serves. Their feedback shapes every feature we ship.",
    color: "forest",
  },
];

const TEAM = [
  { name: "Rumman Ahmed", role: "Founder & CEO", region: "Assam", initials: "RA" },
  { name: "Ashis Chetia", role: "Community Lead", region: "Assam", initials: "AC" },
  { name: "Naman Burakia", role: "Head of Trust & Safety", region: "Assam", initials: "NB" },
];

const STATS = [
  { label: "Communities verified", value: "120+" },
  { label: "Travellers served", value: "8,400+" },
  { label: "Cultural stories shared", value: "640+" },
];

function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0, duration: 0.65, delay, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 87%", once: true },
      }
    );
  }, [delay]);
  return <div ref={ref}>{children}</div>;
}

function ValueCard({ item, index }) {
  const ref = useRef(null);
  const colorMap = {
    terracotta: { bg: "var(--color-terracotta-light)", icon: "var(--color-terracotta)" },
    forest:     { bg: "var(--color-forest-pale)",      icon: "var(--color-forest)" },
    amber:      { bg: "var(--color-amber-light)",       icon: "var(--color-amber)" },
  };
  const c = colorMap[item.color];
  const Icon = item.icon;

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0, duration: 0.65, delay: index * 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 87%", once: true },
      }
    );
  }, [index]);

  return (
    <div
      ref={ref}
      className="p-7 rounded-2xl flex flex-col gap-4"
      style={{
        background: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
        <Icon size={22} style={{ color: c.icon }} />
      </div>
      <h3 className="font-semibold text-base" style={{ color: "var(--color-text-dark)" }}>
        {item.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {item.desc}
      </p>
    </div>
  );
}

function TeamCard({ member, index }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, scale: 0.94 },
      {
        opacity: 1, scale: 1, duration: 0.55, delay: index * 0.08, ease: "back.out(1.4)",
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      }
    );
  }, [index]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-3 p-6 rounded-2xl text-center"
      style={{
        background: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
        style={{
          background: "var(--color-forest-pale)",
          color: "var(--color-forest)",
          fontFamily: "var(--font-display)",
        }}
      >
        {member.initials}
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color: "var(--color-text-dark)" }}>
          {member.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {member.role}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-forest-muted)" }}>
        <MapPin size={11} />
        <span>{member.region}</span>
      </div>
    </div>
  );
}

export default function About() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const missionRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      heroRef.current?.children ? Array.from(heroRef.current.children) : [],
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (!missionRef.current) return;
    gsap.fromTo(missionRef.current,
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: missionRef.current, start: "top 85%", once: true },
      }
    );
  }, []);

  return (
    <div style={{ background: "var(--color-cream)" }}>

      {/* ── HERO ── */}
      <section
        className="relative pt-36 pb-28 px-5 text-center overflow-hidden"
        style={{ background: "var(--color-forest-deep)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(62,122,88,0.25) 0%, transparent 70%)",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-cream-light) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div ref={heroRef} className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "var(--color-forest-soft)" }}
          >
            Our story
          </span>
          <h1
            className="leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
              color: "var(--color-cream-light)",
            }}
          >
            Tourism That{" "}
            <span style={{ color: "var(--color-forest-soft)" }}>Gives Back</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: "var(--color-forest-soft)" }}>
            Bond was built because we believed communities deserve to tell their
            own stories — and travellers deserve to hear them.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <button
              onClick={() => navigate("/explore")}
              className="px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{ background: "var(--color-forest-light)", color: "white" }}
            >
              Explore Communities
            </button>
            <button
              onClick={() => navigate("/auth/register")}
              className="px-7 py-3 rounded-full text-sm font-semibold border transition-all duration-200 hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
            >
              Join Bond Free
            </button>
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-24 px-5">
        <div
          ref={missionRef}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div className="flex flex-col gap-5">
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--color-forest-muted)" }}
            >
              Our mission
            </p>
            <h2
              className="leading-snug"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.7rem)",
                color: "var(--color-text-dark)",
              }}
            >
              Connecting Curious Minds to Forgotten Places
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Northeast India is home to over 220 distinct ethnic groups, each with unique
              languages, cuisines, and traditions. Yet most of it stays invisible on conventional
              travel platforms. Bond changes that — one community listing at a time.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              We partner directly with local community leaders, provide tools for them to
              showcase their culture, and handle everything from bookings to dispute resolution
              so they can focus on what they do best: hosting.
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="self-start flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{ background: "var(--color-forest)", color: "white" }}
            >
              Explore Communities <ArrowRight size={16} />
            </button>
          </div>

          {/* Stats visual */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden"
            style={{ background: "var(--color-forest-deep)" }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: "var(--color-amber)", transform: "translate(30%, -30%)" }}
            />
            {STATS.map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-end border-b pb-4 last:border-0 last:pb-0"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <span className="text-sm" style={{ color: "var(--color-forest-soft)" }}>{label}</span>
                <span
                  className="text-3xl"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-cream-light)" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 px-5" style={{ background: "var(--color-cream-mid)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "var(--color-forest-muted)" }}
            >
              What we stand for
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--color-text-dark)",
              }}
            >
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v, i) => <ValueCard key={v.title} item={v} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "var(--color-terracotta)" }}
            >
              The people behind Bond
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--color-text-dark)",
              }}
            >
              Meet the Team
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {TEAM.map((m, i) => <TeamCard key={m.name} member={m} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      <section className="py-24 px-5" style={{ background: "var(--color-forest-pale)" }}>
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <FadeUp>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                color: "var(--color-forest-deep)",
              }}
            >
              Ready to travel differently?
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-mid)" }}>
              Join thousands of travellers choosing depth over distance, meaning over mileage.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/auth/register")}
                className="px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110"
                style={{ background: "var(--color-forest-deep)", color: "white" }}
              >
                Get Started Free
              </Button>
              <Button
                onClick={() => navigate("/explore")}
                className="px-8 py-3.5 rounded-full text-sm font-semibold border transition-all duration-200 hover:bg-forest/5"
                style={{ borderColor: "var(--color-border-mid)", color: "var(--color-forest)" }}
              >
                Browse Experiences
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}