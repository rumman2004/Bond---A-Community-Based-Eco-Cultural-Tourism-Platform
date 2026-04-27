import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { gsap } from "gsap";
import {
  LayoutDashboard,
  Users,
  ScrollText,
  BarChart2,
  Flag,
  ChevronRight,
  Shield,
} from "lucide-react";

const ADMIN_NAV = [
  {
    group: "Overview",
    links: [
      { icon: LayoutDashboard, label: "Dashboard", to: "/admin", badge: null },
      { icon: BarChart2, label: "Analytics", to: "/admin/analytics", badge: null },
    ],
  },
  {
    group: "Management",
    links: [
      { icon: Users, label: "Manage Users", to: "/admin/users", badge: null },
      { icon: Flag, label: "Reports", to: "/admin/reports", badge: null },
      { icon: ScrollText, label: "Activity Logs", to: "/admin/logs", badge: null },
      { icon: Shield, label: "Manage Securities", to: "/admin/manage-securities", badge: null },
    ],
  },
];

// Flatten all links once, at module level, so indices are stable
const ALL_LINKS = ADMIN_NAV.flatMap(({ links }) => links);

export default function AdminSidebar({ collapsed = false }) {
  const sidebarRef = useRef(null);
  // Pre-size the array to the exact number of nav items so indices never shift
  const itemsRef = useRef(new Array(ALL_LINKS.length).fill(null));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        itemsRef.current.filter(Boolean),
        { x: -12, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.04,
          delay: 0.25,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  // Track a stable flat index across groups using a ref so it never
  // triggers re-renders and is always current during the render pass.
  const indexCounter = useRef(0);
  indexCounter.current = 0; // reset at the top of every render

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-16 bottom-0 flex flex-col overflow-y-auto z-40"
      style={{
        width: collapsed ? "72px" : "260px",
        backgroundColor: "var(--color-forest)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        transition: "width 0.3s ease",
      }}
    >
      <nav className="flex-1 py-5 px-3 space-y-6">
        {ADMIN_NAV.map(({ group, links }) => (
          <div key={group}>
            {!collapsed && (
              <p
                className="text-[10px] uppercase tracking-widest font-semibold px-3 mb-2"
                style={{ color: "var(--color-forest-muted)" }}
              >
                {group}
              </p>
            )}
            <ul className="space-y-0.5">
              {links.map(({ icon: Icon, label, to, badge }) => {
                // Capture the current flat index for this item, then advance
                const flatIndex = indexCounter.current++;

                return (
                  <li
                    key={to}
                    ref={(el) => {
                      itemsRef.current[flatIndex] = el;
                    }}
                  >
                    <NavLink
                      to={to}
                      end={to === "/admin"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                          isActive ? "" : "hover:bg-white/10"
                        }`
                      }
                      style={({ isActive }) => ({
                        backgroundColor: isActive
                          ? "rgba(255,255,255,0.12)"
                          : "",
                        color: isActive ? "white" : "var(--color-forest-soft)",
                        fontWeight: isActive ? 600 : 500,
                      })}
                      title={collapsed ? label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                              style={{ backgroundColor: "var(--color-forest-pale)" }}
                            />
                          )}
                          <Icon
                            size={17}
                            style={{
                              color: isActive
                                ? "white"
                                : "var(--color-forest-muted)",
                              flexShrink: 0,
                            }}
                          />
                          {!collapsed && (
                            <span className="flex-1">{label}</span>
                          )}
                          {!collapsed && badge && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "var(--color-terracotta)",
                                color: "white",
                              }}
                            >
                              {badge}
                            </span>
                          )}
                          {!collapsed && isActive && !badge && (
                            <ChevronRight
                              size={13}
                              style={{ color: "var(--color-forest-soft)" }}
                            />
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

      {!collapsed && (
        <div
          className="px-4 py-4 mx-3 mb-4 rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-1"
            style={{ color: "var(--color-forest-muted)" }}
          >
            Bond Admin
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--color-forest-soft)" }}
          >
            v1.0.0 — Internal use only
          </p>
        </div>
      )}
    </aside>
  );
}