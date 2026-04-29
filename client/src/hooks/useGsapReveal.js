import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function useGsapReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current.children?.length ? Array.from(ref.current.children) : ref.current,
        {
          autoAlpha: 0,
          y: options.y ?? 18,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: options.duration ?? 0.5,
          stagger: options.stagger ?? 0.06,
          delay: options.delay ?? 0,
          ease: options.ease ?? "power2.out",
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [options.delay, options.duration, options.ease, options.stagger, options.y]);

  return ref;
}
