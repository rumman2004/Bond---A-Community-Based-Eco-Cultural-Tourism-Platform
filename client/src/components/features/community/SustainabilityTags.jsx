import { Leaf } from "lucide-react";

// Tags can be:
// - strings (from communities.sustainability_tags array column)
// - objects { slug, label, icon } (from junction table query)
export default function SustainabilityTags({ tags = [], max = null }) {
  const displayed = max ? tags.slice(0, max) : tags;
  const remaining = max && tags.length > max ? tags.length - max : 0;

  if (!displayed.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {displayed.map((tag, i) => {
        const label = typeof tag === "string" ? tag.replace(/-/g, " ") : (tag.label || tag.slug);
        const icon  = typeof tag === "object" ? tag.icon : null;
        const key   = typeof tag === "string" ? tag : (tag.slug || i);
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#5C8C72]/30 bg-[#F2EDE4] px-3 py-1 text-xs font-medium capitalize text-[#2A5940]"
          >
            {icon ? <span className="text-sm leading-none">{icon}</span> : <Leaf size={10} />}
            {label}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full border border-[#D9D0C2] bg-[#FAF7F2] px-3 py-1 text-xs text-[#7A9285]">
          +{remaining} more
        </span>
      )}
    </div>
  );
}