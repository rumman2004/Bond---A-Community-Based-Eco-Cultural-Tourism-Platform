import { useRef, useEffect } from "react";
import { Compass } from "lucide-react";
import { gsap } from "gsap";
import ExperienceCard from "./ExperienceCard";

export default function ExperienceList({ experiences = [], loading = false }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!experiences.length || !listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(listRef.current.children,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" }
      );
    }, listRef);
    return () => ctx.revert();
  }, [experiences]);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-[14px] border border-[#E8E1D5] bg-white overflow-hidden">
            <div className="h-48 bg-[#E8E1D5]" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-24 rounded bg-[#E8E1D5]" />
              <div className="h-4 w-full rounded bg-[#E8E1D5]" />
              <div className="h-3 w-32 rounded bg-[#E8E1D5]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!experiences.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#D9D0C2] bg-[#FAF7F2] py-16 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F2EDE4]">
          <Compass size={26} className="text-[#7A9285]" />
        </div>
        <h3 className="font-semibold text-[#1A2820]" style={{ fontFamily: "var(--font-sans)" }}>No experiences found</h3>
        <p className="mt-1 text-sm text-[#7A9285]">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {experiences.map((exp) => <ExperienceCard key={exp.id} experience={exp} />)}
    </div>
  );
}