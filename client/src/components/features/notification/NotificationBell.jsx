import { useRef, useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { gsap } from "gsap";
import NotificationList from "./NotificationList";
import notificationService from "../../../services/notificationService";

export default function NotificationBell() {
  const [open, setOpen]         = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]     = useState(0);
  const [loading, setLoading]   = useState(false);
  const dropRef   = useRef(null);
  const badgeRef  = useRef(null);

  // Fetch on mount and on open
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!dropRef.current) return;
    if (open) {
      gsap.fromTo(dropRef.current,
        { opacity: 0, y: -10, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power3.out" }
      );
      fetchNotifications();
    } else {
      gsap.to(dropRef.current, { opacity: 0, y: -6, duration: 0.18, ease: "power2.in" });
    }
  }, [open]);

  // Animate badge on unread change
  useEffect(() => {
    if (unread > 0 && badgeRef.current) {
      gsap.fromTo(badgeRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.3, ease: "back.out(2)" }
      );
    }
  }, [unread]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // notificationService.list() → GET /notifications
      const data = await notificationService.list();
      const list = data?.data?.notifications || data?.notifications || [];
      setNotifications(list);
      setUnread(data?.data?.unread_count ?? list.filter(n => !n.is_read).length ?? 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleRead = async (id) => {
    try {
      // notificationService.markRead(id) → PATCH /notifications/:id/read
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleReadAll = async () => {
    try {
      // notificationService.markAllRead() → PATCH /notifications/read-all
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch { /* ignore */ }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.closest("[data-notification-root]")?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div data-notification-root className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative rounded-full border border-[#D9D0C2] bg-white p-2 text-[#1C3D2E] transition hover:bg-[#FAF7F2] hover:border-[#A8CCBA]"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span ref={badgeRef} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4735A] text-[10px] font-bold text-white shadow-sm">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropRef}
          className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-[14px] border border-[#D9D0C2] bg-white shadow-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F2EDE4] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#1A2820]" style={{ fontFamily: "var(--font-sans)" }}>
              Notifications {unread > 0 && <span className="ml-1 rounded-full bg-[#D4735A] px-2 py-0.5 text-[10px] text-white">{unread}</span>}
            </h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={handleReadAll} className="text-xs text-[#3E7A58] hover:underline">Mark all read</button>
              )}
              <button onClick={() => setOpen(false)} className="text-[#7A9285] hover:text-[#1A2820]">
                <X size={14} />
              </button>
            </div>
          </div>

          <NotificationList
            notifications={notifications}
            loading={loading}
            onRead={handleRead}
          />
        </div>
      )}
    </div>
  );
}