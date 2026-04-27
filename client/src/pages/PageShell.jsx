export default function PageShell({ title, subtitle, children }) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-[#1A2820]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-[#7A9285]">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
