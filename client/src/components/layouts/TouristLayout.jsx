import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { gsap } from "gsap";
import TouristNav from "./navbars/TouristNav";

export default function TouristLayout() {
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.15 }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="app-shell-bg min-h-screen flex flex-col"
      style={{ color: "var(--color-text-dark)" }}
    >
      <TouristNav />

      <main
        ref={mainRef}
        className="flex-1 pt-20"
      >
        <Outlet />
      </main>
    </div>
  );
}
