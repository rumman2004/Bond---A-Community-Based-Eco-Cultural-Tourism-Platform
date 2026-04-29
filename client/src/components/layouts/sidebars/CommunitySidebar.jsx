import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { gsap } from "gsap";
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  BookOpenText,
  DollarSign,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    group: "Overview",
    links: [
      { icon: LayoutDashboard, label: "Dashboard", to: "/community" },
      { icon: User, label: "Profile Setup", to: "/community/profile" },
    ],
  },
  {
    group: "Verification",
    links: [
      { icon: ShieldCheck, label: "Registration", to: "/community/register" },
    ],
  },
  {
    group: "Manage",
    links: [
      { icon: Compass, label: "Experiences", to: "/community/experiences" },
      { icon: CalendarCheck, label: "Bookings", to: "/community/bookings" },
      { icon: BookOpenText, label: "Stories", to: "/community/stories" },
    ],
  },
  {
    group: "Finance",
    links: [
      { icon: DollarSign, label: "Earnings", to: "/community/earnings" },
    ],
  },
];

export default function CommunitySidebar({ collapsed = false }) {
  const sidebarRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
      );

      if (itemsRef.current.length) {
        gsap.fromTo(
          itemsRef.current.filter(Boolean),
          { x: -12, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.045,
            delay: 0.25,
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  let itemIndex = 0;

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-16 bottom-0 flex flex-col overflow-y-auto z-40"
      style={{
        width: collapsed ? "72px" : "260px",
        backgroundColor: "var(--color-cream-light)",
        borderRight: "1px solid var(--color-border-soft)",
        transition: "width 0.3s ease",
      }}
    >
      <nav className="flex-1 py-5 px-3 space-y-6">
        {NAV_ITEMS.map(({ group, links }) => (
          <div key={group}>
            {!collapsed && (
              <p
                className="text-[10px] uppercase tracking-widest font-semibold px-3 mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                {group}
              </p>
            )}
            <ul className="space-y-0.5">
              {links.map(({ icon: Icon, label, to }) => {
                const ref = (el) => {
                  itemsRef.current[itemIndex] = el;
                  itemIndex++;
                };
                return (
                  <li key={to} ref={ref}>
                    <NavLink
                      to={to}
                      end={to === "/community"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                          isActive ? "" : "hover:bg-black/5"
                        }`
                      }
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? "var(--color-forest-pale)" : "",
                        color: isActive ? "var(--color-forest)" : "var(--color-text-mid)",
                        fontWeight: isActive ? 600 : 500,
                      })}
                      title={collapsed ? label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active indicator bar */}
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                              style={{ backgroundColor: "var(--color-forest)" }}
                            />
                          )}
                          <Icon
                            size={17}
                            style={{
                              color: isActive ? "var(--color-forest)" : "var(--color-text-muted)",
                              flexShrink: 0,
                            }}
                          />
                          {!collapsed && <span className="flex-1">{label}</span>}
                          {!collapsed && isActive && (
                            <ChevronRight size={13} style={{ color: "var(--color-forest-muted)" }} />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom hint */}
      {!collapsed && (
        <div
          className="px-4 py-4 mx-3 mb-4 rounded-xl"
          style={{
            backgroundColor: "var(--color-forest-pale)",
          }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-forest)" }}>
            🛡️ Verify your community
          </p>
          <p className="text-xs leading-relaxed mb-2.5" style={{ color: "var(--color-text-mid)" }}>
            Add team members, upload ID documents, list your offerings and accept T&C to go live.
          </p>
          <NavLink
            to="/community/register"
            className="text-xs font-semibold underline"
            style={{ color: "var(--color-forest-light)" }}
          >
            Start verification →
          </NavLink>
        </div>
      )}
    </aside>
  );
}