import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      }
    );
  }, []);

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className="relative rounded-3xl overflow-hidden px-10 py-20 text-center"
          style={{
            backgroundColor: "var(--color-forest)",
            boxShadow: "var(--shadow-modal)",
          }}
        >
          {/* Decorative radial */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 110%, rgba(62,122,88,0.4) 0%, transparent 70%)",
            }}
          />
          {/* Top dot grid decoration */}
          <div
            className="absolute top-0 left-0 w-64 h-64 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, var(--color-cream-light) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, var(--color-cream-light) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative">
            <p
              className="text-xs uppercase tracking-widest font-semibold mb-4"
              style={{ color: "var(--color-forest-muted)" }}
            >
              For communities
            </p>
            <h2
              className="text-4xl sm:text-5xl mb-5 tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "white" }}
            >
              Share your home with the world.
            </h2>
            <p
              className="text-base mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--color-forest-soft)" }}
            >
              List your community, create experience packages, and earn while
              preserving what makes your place unique. No platform fees for the
              first year.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/auth/register")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  backgroundColor: "var(--color-cream-light)",
                  color: "var(--color-forest-deep)",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                <Sparkles size={15} />
                Get started — it's free
              </button>
              <button
                onClick={() => navigate("/about")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold border transition-all duration-200 hover:bg-white/10"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                Learn how it works <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}