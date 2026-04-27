import { useRef } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import gsap from "gsap";

/**
 * Bond UI — Pagination
 *
 * Props:
 *  currentPage   number  (1-indexed)
 *  totalPages    number
 *  onPageChange  fn(page)
 *  siblings      number  pages on each side of current (default 1)
 *  showEdges     boolean show first/last page buttons (default true)
 *  className     string
 */

function getPageRange(current, total, siblings = 1) {
  const delta = siblings + 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - siblings && i <= current + siblings)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) rangeWithDots.push(l + 1);
      else if (i - l !== 1) rangeWithDots.push("…");
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
  showEdges = true,
  className = "",
}) {
  const wrapRef = useRef(null);

  const go = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    gsap.fromTo(
      wrapRef.current,
      { opacity: 0.6, y: 2 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
    );

    onPageChange?.(page);
  };

  const pages = getPageRange(currentPage, totalPages, siblings);

  const baseBtn =
    "inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-150 select-none";
  const activeBtn =
    "bg-[#1C3D2E] text-[#F2EDE4] cursor-default";
  const inactiveBtn =
    "text-[#3D5448] hover:bg-[#F2EDE4] hover:text-[#1C3D2E] cursor-pointer border border-transparent hover:border-[rgba(28,61,46,0.12)]";
  const navBtn =
    "text-[#3D5448] hover:bg-[#F2EDE4] hover:text-[#1C3D2E] cursor-pointer border border-[rgba(28,61,46,0.15)] disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div
      ref={wrapRef}
      className={`flex items-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      {/* Prev */}
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseBtn} ${navBtn}`}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`dots-${i}`}
            className="w-9 h-9 flex items-center justify-center text-[#7A9285]"
          >
            <MoreHorizontal size={14} />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={`${baseBtn} ${p === currentPage ? activeBtn : inactiveBtn}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseBtn} ${navBtn}`}
        aria-label="Next page"
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </div>
  );
}