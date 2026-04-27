const CONFIG = {
  pending:   { label: "Pending",   bg: "bg-[#FFF8EE]", text: "text-[#C8883A]", dot: "bg-[#C8883A]", pulse: true },
  confirmed: { label: "Confirmed", bg: "bg-[#EBF5EF]", text: "text-[#2A5940]", dot: "bg-[#3E7A58]", pulse: false },
  completed: { label: "Completed", bg: "bg-[#F2EDE4]", text: "text-[#1C3D2E]", dot: "bg-[#C8883A]", pulse: false },
  cancelled: { label: "Cancelled", bg: "bg-[#FFF0EC]", text: "text-[#D4735A]", dot: "bg-[#D4735A]", pulse: false },
  rejected:  { label: "Rejected",  bg: "bg-[#FFF0EC]", text: "text-[#D4735A]", dot: "bg-[#D4735A]", pulse: false },
};

export default function BookingStatus({ status = "pending" }) {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`relative flex h-2 w-2`}>
        {cfg.pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${cfg.dot}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
      </span>
      {cfg.label}
    </span>
  );
}