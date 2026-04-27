import { useRef, useEffect } from "react";
import { Bell, BookOpen, Calendar, ShieldCheck, Star, AlertTriangle } from "lucide-react";
import { gsap } from "gsap";
import { formatDateTime } from "../../../utils/dateUtils";

// Backend notification fields:
// n.id, n.type, n.title, n.body, n.action_url
// n.is_read, n.read_at, n.entity_type, n.entity_id, n.created_at

const TYPE_ICON = {
  booking_received:  <Calendar size={14} className="text-[#3E7A58]" />,
  booking_confirmed: <Calendar size={14} className="text-[#3E7A58]" />,
  booking_cancelled: <Calendar size={14} className="text-[#D4735A]" />,
  booking_completed: <Calendar size={14} className="text-[#C8883A]" />,
  review_posted:     <Star size={14} className="text-[#C8883A]" />,
  community_verified: <ShieldCheck size={14} className="text-[#3E7A58]" />,
  community_rejected: <ShieldCheck size={14} className="text-[#D4735A]" />,
  story_published:   <BookOpen size={14} className="text-[#3E7A58]" />,
  account_suspended: <AlertTriangle size={14} className="text-[#D4735A]" />,
  system_message:    <Bell size={14} className="text-[#7A9285]" />,
};

export default function NotificationList({ notifications = [], loading = false, onRead }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!notifications.length || !listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(listRef.current.children,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }
      );
    }, listRef);
    return () => ctx.revert();
  }, [notifications]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-[#E8E1D5] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-[#E8E1D5]" />
              <div className="h-2.5 w-full rounded bg-[#E8E1D5]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <Bell size={28} className="text-[#D9D0C2] mb-2" />
        <p className="text-sm text-[#7A9285]">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="max-h-80 overflow-y-auto divide-y divide-[#F2EDE4]">
      {notifications.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => {
            onRead?.(n.id);
            if (n.action_url) window.location.href = n.action_url;
          }}
          className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-[#FAF7F2] ${!n.is_read ? "bg-[#F2EDE4]/50" : ""}`}
        >
          {/* Icon */}
          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.is_read ? "bg-[#F2EDE4]" : "bg-[#FAF7F2]"}`}>
            {TYPE_ICON[n.type] || <Bell size={14} className="text-[#7A9285]" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-snug ${!n.is_read ? "font-semibold text-[#1A2820]" : "font-medium text-[#3D5448]"}`}>
              {n.title}
            </p>
            {n.body && (
              <p className="mt-0.5 text-xs text-[#7A9285] line-clamp-2 leading-relaxed">{n.body}</p>
            )}
            <p className="mt-1 text-[11px] text-[#7A9285]">
              {n.created_at ? formatDateTime(n.created_at) : "Just now"}
            </p>
          </div>

          {/* Unread dot */}
          {!n.is_read && (
            <span className="mt-1.5 h-2 w-2 rounded-full bg-[#3E7A58] shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}