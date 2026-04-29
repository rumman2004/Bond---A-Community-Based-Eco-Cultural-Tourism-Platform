import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { gsap } from "gsap";
import {
  LayoutDashboard,
  CheckCircle,
  AlertTriangle,
  UserX,
  ChevronRight,
  Users,
  Compass,
} from "lucide-react";

import { useSecurity } from "../../../context/SecurityContext";

export default function SecuritySidebar({ collapsed = false }) {
  const { stats } = useSecurity();
  const sidebarRef = useRef(null);

  const SECURITY_NAV = [
    {
      group: "Operations",
      links: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          to: "/security",
          badge: null,
        },
        {
          icon: CheckCircle,
          label: "Verify Communities",
          to: "/security/verify-communities",
          badge: stats?.pending_communities || null,
        },
        {
          icon: AlertTriangle,
          label: "Complaints",
          to: "/security/complaints",
          badge: stats?.open_reports || null,
        },
        {
          icon: UserX,
          label: "Suspended Users",
          to: "/security/suspended-users",
          badge: stats?.suspended_users || null,
        },
      ],
    },
    {
      group: "Monitoring",
      links: [
        {
          icon: Users,
          label: "Monitor Users",
          to: "/security/monitor-users",
          badge: null,
        },
        {
          icon: Compass,
          label: "Monitor Experiences",
          to: "/security/monitor-experiences",
          badge: null,
        },
      ],
    },
  ];

  const ALL_LINKS = SECURITY_NAV.flatMap(({ links }) => links);
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
          stagger: 0.05,
          delay: 0.25,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const indexCounter = useRef(0);
  indexCounter.current = 0;

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
        {SECURITY_NAV.map(({ group, links }) => (
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
              {links.map(({ icon: Icon, label, to, badge }) => {
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
                      end={to === "/security"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                          isActive ? "" : "hover:bg-black/5"
                        }`
                      }
                      style={({ isActive }) => ({
                        backgroundColor: isActive
                          ? "var(--color-forest-pale)"
                          : "",
                        color: isActive
                          ? "var(--color-forest)"
                          : "var(--color-text-mid)",
                        fontWeight: isActive ? 600 : 500,
                      })}
                      title={collapsed ? label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                              style={{ backgroundColor: "var(--color-forest)" }}
                            />
                          )}

                          <Icon
                            size={17}
                            style={{
                              color: isActive
                                ? "var(--color-forest)"
                                : "var(--color-text-muted)",
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
                              style={{ color: "var(--color-forest-muted)" }}
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
          className="px-4 py-4 mx-3 mb-4 rounded-xl flex items-start gap-3"
          style={{ backgroundColor: "var(--color-forest-pale)" }}
        >
          <span className="mt-1 relative flex h-2.5 w-2.5 shrink-0">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: "var(--color-forest-light)" }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: "var(--color-forest-light)" }}
            />
          </span>
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--color-forest)" }}
            >
              On Duty
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-mid)" }}
            >
              Monitoring platform activity
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}