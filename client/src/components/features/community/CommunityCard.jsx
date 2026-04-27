import { useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, ShieldCheck } from "lucide-react";
import { gsap } from "gsap";
import SustainabilityTags from "./SustainabilityTags";

export default function CommunityCard({ community }) {
  const cardRef  = useRef(null);
  const imageRef = useRef(null);

  // Field mapping from top_communities view / communityService:
  // community.slug, community.name, community.cover_image_url
  // community.village, community.district, community.state
  // community.avg_rating, community.status, community.tags (from junction)
  // community.short_description
  const slug        = community.slug || community.id;
  const image       = community.cover_image_url || community.image;
  const location    = [community.village, community.district, community.state].filter(Boolean).join(", ") || community.location || "India";
  const rating      = community.avg_rating ?? community.rating;
  const isVerified  = community.status === "verified" || community.verified;
  const description = community.short_description || community.description || "";
  const tags        = community.tags || community.sustainability_tags || [];

  const handleEnter = () => {
    gsap.to(imageRef.current, { scale: 1.06, duration: 0.5, ease: "power2.out" });
    gsap.to(cardRef.current, { y: -5, boxShadow: "0 16px 40px rgba(28,61,46,0.13)", duration: 0.3, ease: "power2.out" });
  };
  const handleLeave = () => {
    gsap.to(imageRef.current, { scale: 1, duration: 0.5, ease: "power2.out" });
    gsap.to(cardRef.current, { y: 0, boxShadow: "0 4px 20px rgba(28,61,46,0.08)", duration: 0.3, ease: "power2.out" });
  };

  return (
    <Link to={`/community/${slug}`}>
      <article
        ref={cardRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="group rounded-[14px] border border-[#D9D0C2] bg-white overflow-hidden shadow-card transition-shadow cursor-pointer"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-[#D4E6DC]">
          {image ? (
            <img
              ref={imageRef}
              src={image}
              alt={community.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div ref={imageRef} className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1C3D2E] to-[#3E7A58]">
              <span className="text-5xl font-bold text-white/20" style={{ fontFamily: "var(--font-display)" }}>
                {community.name?.[0]}
              </span>
            </div>
          )}
          {isVerified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#2A5940] backdrop-blur-sm">
              <ShieldCheck size={11} /> Verified
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[#1A2820] leading-snug" style={{ fontFamily: "var(--font-sans)" }}>
              {community.name}
            </h3>
            {rating > 0 && (
              <span className="flex items-center gap-1 shrink-0 text-sm font-bold text-[#1C3D2E]">
                <Star size={13} fill="var(--color-amber)" color="var(--color-amber)" />
                {Number(rating).toFixed(1)}
              </span>
            )}
          </div>

          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#7A9285]">
            <MapPin size={12} className="shrink-0" /> {location}
          </p>

          {description && (
            <p className="mt-3 line-clamp-2 text-sm text-[#3D5448] leading-relaxed">{description}</p>
          )}

          {tags.length > 0 && (
            <div className="mt-4">
              <SustainabilityTags tags={tags.slice(0, 3)} />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}