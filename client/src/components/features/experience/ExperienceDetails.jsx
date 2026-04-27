import { useRef, useEffect } from "react";
import { Clock, MapPin, Users, Star, CheckCircle, XCircle, Languages } from "lucide-react";
import { gsap } from "gsap";
import { formatCurrency } from "../../../utils/formatters";
import SustainabilityTags from "../community/SustainabilityTags";

export default function ExperienceDetails({ experience }) {
  const heroRef   = useRef(null);
  const bodyRef   = useRef(null);
  const statsRef  = useRef(null);

  useEffect(() => {
    if (!experience) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { opacity: 0, scale: 1.03 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }
      );
      gsap.fromTo(bodyRef.current.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, delay: 0.3, ease: "power3.out" }
      );
      gsap.fromTo(statsRef.current.children,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, delay: 0.5, ease: "back.out(1.4)" }
      );
    });
    return () => ctx.revert();
  }, [experience]);

  if (!experience) return null;

  // Fields from experienceController.getExperienceBySlug:
  // experience.title, description, short_description, category, difficulty
  // experience.cover_image_url, price_per_person, avg_rating, total_reviews
  // experience.duration_hours, duration_days, max_participants, min_participants
  // experience.meeting_point, latitude, longitude, languages
  // experience.included_items, excluded_items
  // experience.community_name, community_slug, village, district, state
  // experience.tags (from junction), experience.recent_reviews

  const image     = experience.cover_image_url || experience.image;
  const price     = experience.price_per_person ?? experience.price ?? 0;
  const rating    = experience.avg_rating ?? 0;
  const reviews   = experience.total_reviews ?? 0;
  const location  = experience.meeting_point
    || [experience.village, experience.district, experience.state].filter(Boolean).join(", ")
    || experience.location;
  const duration  = experience.duration_days
    ? `${experience.duration_days} day${experience.duration_days > 1 ? "s" : ""}`
    : experience.duration_hours
    ? `${experience.duration_hours} hours`
    : experience.duration || "1 day";

  return (
    <article className="overflow-hidden rounded-[14px] bg-white shadow-card">
      {/* Hero image */}
      <div ref={heroRef} className="relative h-72 overflow-hidden bg-[#D4E6DC] sm:h-96">
        {image ? (
          <img src={image} alt={experience.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1C3D2E] to-[#3E7A58]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2419]/60 via-transparent to-transparent" />

        {/* Floating badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {experience.category && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1C3D2E] backdrop-blur-sm">
              {experience.category}
            </span>
          )}
          {experience.difficulty && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
              experience.difficulty === "easy"     ? "bg-[#EBF5EF]/90 text-[#2A5940]" :
              experience.difficulty === "moderate" ? "bg-[#FFF8EE]/90 text-[#C8883A]" :
                                                     "bg-[#FFF0EC]/90 text-[#D4735A]"
            }`}>
              {experience.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div ref={bodyRef} className="space-y-6">
          {/* Title + rating */}
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div>
              <h1 className="font-display text-3xl text-[#1A2820] leading-tight sm:text-4xl">
                {experience.title}
              </h1>
              {experience.community_name && (
                <p className="mt-1 text-sm text-[#7A9285]">by {experience.community_name}</p>
              )}
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-2 rounded-[9px] bg-[#FAF7F2] px-4 py-2">
                <Star size={16} fill="var(--color-amber)" color="var(--color-amber)" />
                <span className="text-xl font-bold text-[#1C3D2E]">{Number(rating).toFixed(1)}</span>
                <span className="text-sm text-[#7A9285]">({reviews})</span>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div ref={statsRef} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: <MapPin size={16} />,  label: "Location",  val: location },
              { icon: <Clock size={16} />,   label: "Duration",  val: duration },
              { icon: <Users size={16} />,   label: "Group size", val: `${experience.min_participants ?? 1}–${experience.max_participants ?? 10}` },
              { icon: <Languages size={16} />, label: "Language", val: experience.languages?.join(", ") || "English" },
            ].map((s) => (
              <div key={s.label} className="rounded-[9px] border border-[#E8E1D5] bg-[#FAF7F2] px-3 py-3">
                <div className="flex items-center gap-1.5 text-[#7A9285] text-xs mb-1">{s.icon} {s.label}</div>
                <p className="text-sm font-semibold text-[#1C3D2E] truncate">{s.val}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="leading-relaxed text-[#3D5448]">{experience.description}</p>

          {/* Tags */}
          {experience.tags?.length > 0 && <SustainabilityTags tags={experience.tags} />}

          {/* Included / Excluded */}
          <div className="grid gap-4 sm:grid-cols-2">
            {experience.included_items?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3D5448]">What's included</p>
                <ul className="space-y-1.5">
                  {experience.included_items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#3D5448]">
                      <CheckCircle size={14} className="text-[#3E7A58] shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {experience.excluded_items?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3D5448]">Not included</p>
                <ul className="space-y-1.5">
                  {experience.excluded_items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#7A9285]">
                      <XCircle size={14} className="text-[#D9D0C2] shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Price footer */}
          <div className="flex items-center justify-between rounded-[9px] bg-gradient-to-r from-[#1C3D2E] to-[#2A5940] px-5 py-4">
            <div>
              <p className="text-xs text-white/60">Price per person</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                {formatCurrency(price)}
              </p>
            </div>
            <div className="text-right text-xs text-white/50">
              {experience.currency || "INR"} · taxes may apply
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}