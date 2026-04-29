import { Compass } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon = Compass,
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="surface-panel flex flex-col items-center justify-center rounded-[12px] px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4E6DC] text-[#1C3D2E]">
        <Icon size={24} />
      </span>
      <h3 className="mt-4 font-display text-2xl text-[#1A2820]">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-[#7A9285]">{description}</p>}
      {actionLabel && onAction && (
        <Button type="button" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
