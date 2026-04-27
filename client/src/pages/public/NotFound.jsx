import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Compass, ArrowLeft, MapPin } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const compassRef   = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      containerRef.current?.children ? Array.from(containerRef.current.children) : [],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.12, duration: 0.65 }
    );

    // Slow wobble
    gsap.to(compassRef.current, {
      rotation: 15,
      yoyo: true,
      repeat: -1,
      duration: 2.5,
      ease: "sine.inOut",
    });

    return () => tl.kill();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 text-center relative overflow-hidden"
      style={{ background: "var(--color-cream)" }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-1/3 -left-32 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "var(--color-forest-pale)" }}
      />
      <div
        className="absolute bottom-1/4 -right-24 w-72 h-72 rounded-full opacity-15 pointer-events-none"
        style={{ background: "var(--color-amber-light)" }}
      />

      <div ref={containerRef} className="relative flex flex-col items-center gap-6 max-w-md">

        {/* Compass icon */}
        <div
          ref={compassRef}
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--color-forest-pale)" }}
        >
          <Compass size={38} style={{ color: "var(--color-forest)" }} />
        </div>

        {/* Giant 404 */}
        <span
          className="-mt-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(5rem, 18vw, 9rem)",
            color: "var(--color-forest-pale)",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          404
        </span>

        {/* Headline */}
        <h1
          className="-mt-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            color: "var(--color-text-dark)",
          }}
        >
          You've wandered off the path.
        </h1>

        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          The page you're looking for doesn't exist — or it may have moved.
          Even the most experienced travellers take a wrong turn sometimes.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium border transition-all duration-200 hover:-translate-x-1"
            style={{
              borderColor: "var(--color-border-mid)",
              color: "var(--color-text-mid)",
              background: "transparent",
            }}
          >
            <ArrowLeft size={15} /> Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110"
            style={{ background: "var(--color-forest-deep)", color: "white" }}
          >
            <MapPin size={15} /> Back to Home
          </button>
        </div>

        {/* Subtle suggestion */}
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Or try exploring{" "}
          <button
            onClick={() => navigate("/explore")}
            className="underline underline-offset-2"
            style={{ color: "var(--color-forest)" }}
          >
            all experiences
          </button>{" "}
          instead.
        </p>
      </div>
    </div>
  );
}