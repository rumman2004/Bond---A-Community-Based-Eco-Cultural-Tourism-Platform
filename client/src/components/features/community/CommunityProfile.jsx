import { useRef, useEffect } from "react";
import { MapPin, ShieldCheck, Star, BookOpen, Globe, Phone } from "lucide-react";
import { gsap } from "gsap";
import SustainabilityTags from "./SustainabilityTags";

export default function CommunityProfile({ community }) {
  const heroRef   = useRef(null);
  const bodyRef   = useRef(null);

  useEffect(() => {
    if (!community) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }
      );
      gsap.fromTo(bodyRef.current.children,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, delay: 0.25, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [community]);

  if (!community) return null;

  // Field mapping from communityController.getCommunityBySlug:
  // community.name, slug, short_description, description
  // community.village, district, state, country
  // community.avg_rating, total_reviews, status
  // community.cover_image_url, logo_url
  // community.contact_email, contact_phone, website
  // community.languages_spoken, best_visit_season
  // community.tags (from junction query)
  const location   = [community.village, community.district, community.state].filter(Boolean).join(", ") || community.location;
  const rating     = community.avg_rating ?? 0;
  const isVerified = community.status === "verified";

  return (
    <section>
      {/* Cover image */}
      <div ref={heroRef} className="relative h-64 overflow-hidden rounded-[14px] bg-[#D4E6DC] sm:h-80">
        {community.cover_image_url ? (
          <img src={community.cover_image_url} alt={community.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1C3D2E] to-[#3E7A58]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2419]/70 via-transparent to-transparent" />

        {/* Logo + name overlay */}
        <div className="absolute bottom-5 left-5 flex items-end gap-4">
          {community.logo_url ? (
            <img src={community.logo_url} alt="" className="h-16 w-16 rounded-[9px] border-2 border-white object-cover shadow-lg" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-[9px] border-2 border-white bg-[#1C3D2E] shadow-lg">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                {community.name?.[0]}
              </span>
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl text-white leading-tight">{community.name}</h1>
            {isVerified && (
              <span className="flex items-center gap-1 text-xs font-medium text-white/80">
                <ShieldCheck size={12} /> Verified community
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div ref={bodyRef} className="mt-6 space-y-5">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#3D5448]">
          {location && (
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#7A9285]" /> {location}</span>
          )}
          {rating > 0 && (
            <span className="flex items-center gap-1.5">
              <Star size={14} fill="var(--color-amber)" color="var(--color-amber)" />
              <strong className="text-[#1C3D2E]">{Number(rating).toFixed(1)}</strong>
              <span className="text-[#7A9285]">({community.total_reviews ?? 0} reviews)</span>
            </span>
          )}
          {community.best_visit_season && (
            <span className="flex items-center gap-1.5 text-[#7A9285]">
              <BookOpen size={14} /> Best: {community.best_visit_season}
            </span>
          )}
        </div>

        {/* Description */}
        {community.description && (
          <p className="max-w-3xl leading-relaxed text-[#3D5448]">{community.description}</p>
        )}

        {/* Tags */}
        {community.tags?.length > 0 && (
          <SustainabilityTags tags={community.tags} />
        )}

        {/* Contact strip */}
        <div className="flex flex-wrap gap-4 text-sm">
          {community.contact_phone && (
            <a href={`tel:${community.contact_phone}`} className="flex items-center gap-1.5 text-[#3E7A58] hover:underline">
              <Phone size={13} /> {community.contact_phone}
            </a>
          )}
          {community.website && (
            <a href={community.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#3E7A58] hover:underline">
              <Globe size={13} /> Website
            </a>
          )}
        </div>
      </div>
    </section>
  );
}