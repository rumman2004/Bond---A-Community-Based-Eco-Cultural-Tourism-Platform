import { Link } from "react-router-dom";
import { Map, ShieldCheck } from "lucide-react";
import useGsapReveal from "../../hooks/useGsapReveal";

export default function AuthShell({
  kicker,
  title,
  description,
  highlights = [],
  note,
  children,
  footer,
}) {
  const panelRef = useGsapReveal({ y: 20, stagger: 0.08 });

  return (
    <main className="app-shell-bg min-h-screen lg:grid lg:grid-cols-[minmax(360px,0.45fr)_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#173426] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-12">
        <div className="absolute inset-0 hairline-grid opacity-30" />
        <div className="absolute left-8 top-28 h-px w-24 bg-[#8BC4A4]/40" />
        <div className="absolute bottom-16 right-10 h-28 w-px bg-[#8BC4A4]/30" />

        <Link to="/" className="relative z-10 inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Map size={18} strokeWidth={1.9} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Bond.</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase text-[#8BC4A4]">{kicker}</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/62">{description}</p>

          <div className="mt-9 space-y-4">
            {highlights.map(({ icon: Icon = ShieldCheck, title: itemTitle, description: itemDescription }) => (
              <div key={itemTitle} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#A8CCBA] ring-1 ring-white/10">
                  <Icon size={16} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{itemTitle}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-white/50">{itemDescription}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {note && (
          <div className="relative z-10 rounded-xl border border-white/10 bg-white/[0.07] p-5">
            <p className="text-sm font-semibold text-white">{note.title}</p>
            <p className="mt-1 text-xs leading-5 text-white/55">{note.description}</p>
          </div>
        )}
      </aside>

      <section className="flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8">
        <Link to="/" className="mb-9 inline-flex items-center gap-2.5 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C3D2E] text-white">
            <Map size={18} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-[#1C3D2E]">Bond.</span>
        </Link>

        <div ref={panelRef} className="w-full max-w-[430px]">
          {children}
          {footer}
        </div>
      </section>
    </main>
  );
}
