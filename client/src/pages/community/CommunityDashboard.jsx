import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Gift,
  Home,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import PageShell from "../PageShell";
import communityService from "../../services/communityService";
import bookingService from "../../services/bookingService";
import { Badge, Button, Card, EmptyState, MetricCard } from "../../components/ui";

const STATUS_META = {
  pending: { label: "Pending", variant: "warning", Icon: Clock },
  confirmed: { label: "Confirmed", variant: "success", Icon: CheckCircle },
  completed: { label: "Completed", variant: "success", Icon: CheckCircle },
  rejected: { label: "Rejected", variant: "danger", Icon: XCircle },
  cancelled: { label: "Cancelled", variant: "outline", Icon: AlertCircle },
};

const STEPS = [
  { step: 1, label: "Basic Info", icon: Home },
  { step: 2, label: "Team & IDs", icon: Users },
  { step: 3, label: "Offerings", icon: Gift },
  { step: 4, label: "Consent", icon: UserCheck },
];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <Badge variant={meta.variant} className="gap-1.5">
      <meta.Icon size={11} />
      {meta.label}
    </Badge>
  );
}

function VerificationBanner({ community, verification }) {
  const navigate = useNavigate();
  if (!community) return null;

  const regStep = community.registration_step ?? 1;
  const consentDone = Boolean(community.consent_accepted_at);
  const status = community.status;

  if (status === "verified") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <ShieldCheck size={21} className="mt-0.5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Community Verified</p>
          <p className="mt-1 text-xs leading-5 text-emerald-700">
            Your community is live. Travellers can now discover and book your experiences.
          </p>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <ShieldAlert size={21} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-800">Registration Rejected</p>
            {community.rejection_reason && (
              <p className="mt-1 text-xs leading-5 text-red-600">Reason: {community.rejection_reason}</p>
            )}
          </div>
        </div>
        <Button className="mt-4" size="sm" variant="danger" iconRight={ChevronRight} onClick={() => navigate("/community/register")}>
          Re-submit registration
        </Button>
      </div>
    );
  }

  if (status === "pending" && consentDone) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <Clock size={21} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Under Security Review</p>
          <p className="mt-1 text-xs leading-5 text-amber-700">
            Your registration is complete. The security team will review it within 2-3 business days.
          </p>
        </div>
      </div>
    );
  }

  const membersOk = (verification?.members?.length ?? 0) > 0;
  const docsOk = (verification?.documents?.length ?? 0) > 0;
  const offeringsOk = (verification?.offerings?.length ?? 0) > 0;
  const stepStatus = { 1: regStep > 1, 2: membersOk && docsOk, 3: offeringsOk, 4: consentDone };
  const nextIncomplete = STEPS.find((s) => !stepStatus[s.step]);

  return (
    <div className="surface-panel mb-6 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert size={21} className="mt-0.5 shrink-0 text-[#C8883A]" />
          <div>
            <p className="text-sm font-semibold text-[#1A2820]">Complete Your Registration</p>
            <p className="mt-1 text-xs leading-5 text-[#7A9285]">
              Finish the verification checklist so your community can be reviewed.
            </p>
          </div>
        </div>
        <Button size="sm" iconRight={ChevronRight} onClick={() => navigate("/community/register")}>
          {nextIncomplete ? `Continue: ${nextIncomplete.label}` : "Review & Submit"}
        </Button>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        {STEPS.map(({ step, label, icon: Icon }) => {
          const done = stepStatus[step];
          const active = step === nextIncomplete?.step;
          return (
            <div
              key={step}
              className={[
                "rounded-xl border p-3",
                done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : active
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-[#E8E1D5] bg-[#F5F2EE] text-[#7A9285]",
              ].join(" ")}
            >
              <Icon size={17} />
              <p className="mt-2 text-xs font-semibold">{label}</p>
            </div>
          );
        })}
      </div>

      {verification && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E8E1D5] pt-4">
          <Badge variant={membersOk ? "success" : "outline"}><Users size={11} />{membersOk ? `${verification.members.length} members` : "No members yet"}</Badge>
          <Badge variant={docsOk ? "success" : "outline"}><FileText size={11} />{docsOk ? "ID uploaded" : "No document yet"}</Badge>
          <Badge variant={offeringsOk ? "success" : "outline"}><Gift size={11} />{offeringsOk ? `${verification.offerings.length} offerings` : "No offerings yet"}</Badge>
          <Badge variant={consentDone ? "success" : "outline"}><UserCheck size={11} />{consentDone ? "Consent accepted" : "Consent pending"}</Badge>
        </div>
      )}
    </div>
  );
}

export default function CommunityDashboard() {
  const [stats, setStats] = useState(null);
  const [community, setCommunity] = useState(null);
  const [verification, setVerification] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      communityService.getStats(),
      communityService.getOwn(),
      bookingService.getCommunityBookings(),
    ])
      .then(([sRes, cRes, bRes]) => {
        setStats(sRes?.data ?? sRes);
        const comm = cRes?.data?.community ?? cRes?.community ?? cRes?.data ?? null;
        setCommunity(comm);
        const list = bRes?.data?.bookings ?? bRes?.bookings ?? bRes ?? [];
        setBookings(Array.isArray(list) ? list.slice(0, 5) : []);

        if (comm?.id) {
          communityService
            .getVerificationData(comm.id)
            .then((vRes) => setVerification(vRes?.data ?? null))
            .catch(() => {});
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const s = stats ?? {};
  const fmt = (n) => (n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—");
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <PageShell
      title="Community Dashboard"
      kicker="Host workspace"
      subtitle={`Welcome back${community?.name ? `, ${community.name}` : ""}. Track bookings, revenue, ratings, and registration status.`}
      icon={Home}
      actions={
        <Button size="sm" iconRight={ArrowUpRight} onClick={() => { window.location.href = "/community/experiences"; }}>
          Manage experiences
        </Button>
      }
    >
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
            <AlertCircle size={16} />
            {error}
          </div>
        </Card>
      )}

      {!loading && <VerificationBanner community={community} verification={verification} />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Bookings" icon={Calendar} value={s.total_bookings ?? "—"} helper="All time" tone="river" loading={loading} />
        <MetricCard label="Revenue" icon={TrendingUp} value={fmt(s.total_revenue)} helper="Net earnings" tone="forest" loading={loading} />
        <MetricCard label="Experiences" icon={Layers} value={s.total_experiences ?? "—"} helper="Live listings" tone="amber" loading={loading} />
        <MetricCard
          label="Avg Rating"
          icon={Star}
          value={s.avg_rating != null ? Number(s.avg_rating).toFixed(1) : "—"}
          helper={s.total_reviews ? `${s.total_reviews} reviews` : "No reviews yet"}
          tone="indigo"
          loading={loading}
        />
      </section>

      <Card className="mt-6" padding="lg">
        <Card.Header border>
          <div>
            <p className="text-xs font-semibold uppercase text-[#3E7A58]">Bookings</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#1A2820]">Recent requests</h2>
          </div>
          <Link to="/community/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-[#3E7A58] hover:underline">
            View all <ArrowUpRight size={14} />
          </Link>
        </Card.Header>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F5F2EE]" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No bookings yet"
            description="Traveller bookings will appear here as soon as your experiences start receiving requests."
          />
        ) : (
          <div className="divide-y divide-[#F0EBE3]">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1A2820]">
                    {booking.experience_title ?? booking.title ?? "Booking"}
                  </p>
                  <p className="mt-1 text-xs text-[#7A9285]">
                    {fmtDate(booking.date)}
                    {booking.guests ? ` · ${booking.guests} guest${booking.guests > 1 ? "s" : ""}` : ""}
                    {booking.traveller_name ? ` · ${booking.traveller_name}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {booking.total_amount != null && (
                    <span className="text-sm font-semibold text-[#1C3D2E]">{fmt(booking.total_amount)}</span>
                  )}
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
}
