import { ChevronRight } from "lucide-react";
import useGsapReveal from "../hooks/useGsapReveal";

export default function PageShell({
  title,
  subtitle,
  kicker,
  icon: Icon,
  actions,
  breadcrumbs = [],
  children,
  contained = false,
}) {
  const revealRef = useGsapReveal({ y: 14, stagger: 0.05 });

  return (
    <section ref={revealRef} className={["space-y-6", contained ? "mx-auto max-w-7xl px-4 sm:px-6" : ""].filter(Boolean).join(" ")}>
      {(title || subtitle || actions || breadcrumbs.length > 0) && (
        <div className="surface-panel relative overflow-hidden rounded-[12px] p-5 sm:p-6">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 hairline-grid opacity-60 md:block" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              {breadcrumbs.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-1 text-xs font-medium text-[#7A9285]">
                  {breadcrumbs.map((item, index) => (
                    <span key={`${item}-${index}`} className="inline-flex items-center gap-1">
                      {item}
                      {index < breadcrumbs.length - 1 && <ChevronRight size={12} />}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-start gap-3">
                {Icon && (
                  <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D8EEF2] text-[#256D85] ring-1 ring-[#9BCAD4]">
                    <Icon size={20} />
                  </span>
                )}
                <div className="min-w-0">
                  {kicker && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5C8C72]">{kicker}</p>}
                  {title && <h1 className="font-display text-3xl leading-tight text-[#1A2820] sm:text-4xl">{title}</h1>}
                  {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5F7569]">{subtitle}</p>}
                </div>
              </div>
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className="content-fade">
        {children}
      </div>
    </section>
  );
}
