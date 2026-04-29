import { ArrowUpRight } from "lucide-react";
import Card from "./Card";

export default function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "forest",
  trend,
  loading = false,
}) {
  const tones = {
    forest: { bg: "bg-[#D4E6DC]", text: "text-[#1C3D2E]", ring: "ring-[#A8CCBA]" },
    river: { bg: "bg-[#D8EEF2]", text: "text-[#256D85]", ring: "ring-[#9BCAD4]" },
    amber: { bg: "bg-[#F5E4CA]", text: "text-[#96601F]", ring: "ring-[#E8B96A]" },
    indigo: { bg: "bg-[#E6EAF2]", text: "text-[#33415C]", ring: "ring-[#B9C2D5]" },
    danger: { bg: "bg-[#FAF0EC]", text: "text-[#A04D38]", ring: "ring-[#EBB8AA]" },
  };
  const toneClass = tones[tone] || tones.forest;

  return (
    <Card hover padding="md" className="relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#F2EDE4]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A9285]">{label}</p>
          {loading ? (
            <span className="mt-3 block h-8 w-24 animate-pulse rounded-lg bg-[#E8E1D5]" />
          ) : (
            <p className="mt-2 font-display text-3xl leading-none text-[#1A2820]">{value}</p>
          )}
          {helper && <p className="mt-2 text-xs text-[#7A9285]">{helper}</p>}
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClass.bg} ${toneClass.text} ${toneClass.ring}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      {trend && (
        <div className="relative mt-4 inline-flex items-center gap-1 rounded-full bg-[#FAF7F2] px-2.5 py-1 text-xs font-medium text-[#3E7A58]">
          <ArrowUpRight size={12} />
          {trend}
        </div>
      )}
    </Card>
  );
}
