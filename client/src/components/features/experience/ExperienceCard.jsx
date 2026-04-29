import { useRef } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Star, Users } from "lucide-react";
import { gsap } from "gsap";
import { formatCurrency } from "../../../utils/formatters";
import { useAuth } from "../../../context/AuthContext";

export default function ExperienceCard({ experience }) {
  const { user } = useAuth();
  const cardRef  = useRef(null);
  const imageRef = useRef(null);

  // Fields from popular_experiences view + experienceService:
  // experience.slug, title, short_description, category
  // experience.cover_image_url, price_per_person, avg_rating
  // experience.duration_hours, duration_days, difficulty
  // experience.community_name, community_slug, village, state
  const slug        = experience.slug || experience.id;
  const image       = experience.images?.[0]?.image_url || experience.cover_image_url || experience.image;
  const href        = `${user?.role === "tourist" ? "/tourist" : ""}/experience/${slug}`;
  const price       = experience.price_per_person ?? experience.price ?? 0;
  const rating      = experience.avg_rating ?? experience.rating;
  const location    = [experience.village, experience.state].filter(Boolean).join(", ") || experience.community_location || experience.location;
  const duration    = experience.duration_days
    ? `${experience.duration_days}d`
    : experience.duration_hours
    ? `${experience.duration_hours}h`
    : experience.duration || "1 day";
  const category    = experience.category || "Experience";

  const handleEnter = () => {
    gsap.to(imageRef.current, { scale: 1.07, duration: 0.5, ease: "power2.out" });
    gsap.to(cardRef.current,  { y: -5, boxShadow: "0 16px 40px rgba(28,61,46,0.13)", duration: 0.3, ease: "power2.out" });
  };
  const handleLeave = () => {
    gsap.to(imageRef.current, { scale: 1, duration: 0.5, ease: "power2.out" });
    gsap.to(cardRef.current,  { y: 0, boxShadow: "0 4px 20px rgba(28,61,46,0.08)", duration: 0.3, ease: "power2.out" });
  };

  return (
    <Link to={href}>
      <article
        ref={cardRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="group rounded-[14px] border border-[#D9D0C2] bg-white overflow-hidden shadow-card cursor-pointer"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-[#D4E6DC]">
          {image ? (
            <img ref={imageRef} src={image} alt={experience.title} className="h-full w-full object-cover" />
          ) : (
            <div ref={imageRef} className="h-full w-full bg-gradient-to-br from-[#2A5940] to-[#5C8C72] flex items-center justify-center">
              <span className="text-4xl font-bold text-white/20" style={{ fontFamily: "var(--font-display)" }}>
                {experience.title?.[0]}
              </span>
            </div>
          )}
          {/* Category pill */}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-[#1C3D2E]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {category}
            </span>
          </div>
          {/* Difficulty badge */}
          {experience.difficulty && (
            <div className="absolute top-3 right-3">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ${
                experience.difficulty === "easy"       ? "bg-[#EBF5EF] text-[#2A5940]" :
                experience.difficulty === "moderate"   ? "bg-[#FFF8EE] text-[#C8883A]" :
                                                         "bg-[#FFF0EC] text-[#D4735A]"
              }`}>
                {experience.difficulty}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <h3 className="font-semibold text-[#1A2820] leading-snug line-clamp-2" style={{ fontFamily: "var(--font-sans)" }}>
            {experience.title}
          </h3>

          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#7A9285]">
            <MapPin size={12} className="shrink-0" /> {location}
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-[#7A9285]">
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {duration}
            </span>
            {rating > 0 && (
              <span className="flex items-center gap-1 font-semibold text-[#1C3D2E]">
                <Star size={12} fill="var(--color-amber)" color="var(--color-amber)" />
                {Number(rating).toFixed(1)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#F2EDE4] pt-3">
            <div>
              <span className="text-base font-bold text-[#1C3D2E]">{formatCurrency(price)}</span>
              <span className="text-xs text-[#7A9285]"> / person</span>
            </div>
            {experience.max_participants && (
              <span className="flex items-center gap-1 text-xs text-[#7A9285]">
                <Users size={11} /> Max {experience.max_participants}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
