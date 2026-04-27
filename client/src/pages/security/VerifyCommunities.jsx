import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  Inbox,
  RefreshCw,
} from "lucide-react";
import securityService from "../../services/securityService";

function CommunityRow({ community }) {
  const { id, name, location, city, country, description, owner_name, owner_email, created_at } = community;

  const place = location || [city, country].filter(Boolean).join(", ") || "—";
  const age = created_at
    ? Math.floor((Date.now() - new Date(created_at)) / 86400000)
    : null;

  return (
    <Link
      to={`/security/verify-communities/${id}`}
      className="group flex items-start gap-5 rounded-2xl px-6 py-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: "var(--color-cream-light)",
        border: "1px solid var(--color-border-soft)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Avatar letter */}
      <span
        className="mt-0.5 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)" }}
      >
        {name?.[0]?.toUpperCase() ?? "?"}
      </span>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text-dark)" }}
          >
            {name}
          </h3>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
          >
            Pending
          </span>
        </div>

        <p
          className="mt-1 text-xs line-clamp-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description || "No description provided."}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          {place !== "—" && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <MapPin size={12} strokeWidth={1.8} />
              {place}
            </span>
          )}
          {owner_name && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <Users size={12} strokeWidth={1.8} />
              {owner_name}
              {owner_email && <span className="opacity-60">· {owner_email}</span>}
            </span>
          )}
          {age !== null && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <Clock size={12} strokeWidth={1.8} />
              {age === 0 ? "Today" : `${age}d ago`}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight
        size={16}
        className="mt-1 shrink-0 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
        style={{ color: "var(--color-forest)" }}
      />
    </Link>
  );
}

export default function VerifyCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    securityService
      .getPendingCommunities()
      .then((res) => setCommunities(res.data?.communities ?? []))
      .catch(() => setError("Failed to load pending communities."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
          >
            Verify Communities
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Review host profiles before they go live on the platform.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:bg-black/5"
          style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border-soft)" }}
        >
          <RefreshCw size={13} strokeWidth={1.8} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Count pill */}
      {!loading && !error && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "var(--color-forest-pale)", color: "var(--color-forest)" }}
        >
          <CheckCircle2 size={13} strokeWidth={2} />
          {communities.length} {communities.length === 1 ? "community" : "communities"} in queue
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: "#FEF2F2", color: "var(--color-terracotta)", border: "1px solid #FECACA" }}
        >
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ backgroundColor: "var(--color-border-soft)" }}
            />
          ))}
        </div>
      )}

      {/* List */}
      {!loading && !error && communities.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-16 rounded-2xl"
          style={{ border: "1px dashed var(--color-border-soft)" }}
        >
          <Inbox size={28} style={{ color: "var(--color-text-muted)" }} strokeWidth={1.4} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            All caught up — no pending communities.
          </p>
        </div>
      )}

      {!loading && !error && communities.length > 0 && (
        <div className="space-y-3">
          {communities.map((c) => (
            <CommunityRow key={c.id} community={c} />
          ))}
        </div>
      )}
    </div>
  );
}