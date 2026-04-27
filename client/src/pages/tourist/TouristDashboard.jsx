import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin, Clock, Star, Users, Compass, TrendingUp,
  Calendar, Heart, ChevronRight, Sparkles, Globe
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import experienceService from "../../services/experienceService";
import bookingService from "../../services/bookingService";
import PageShell from "../PageShell";

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_COLORS = {
  Culture:  { bg: "#F0EBE1", text: "#6B4F2A", dot: "#C4893F" },
  Eco:      { bg: "#E5EEE8", text: "#2A4D32", dot: "#4A8B5C" },
  Food:     { bg: "#F0E8EA", text: "#5C2A31", dot: "#B45C6A" },
  Craft:    { bg: "#E8E5F0", text: "#2A2A5C", dot: "#5C5CB4" },
  Festival: { bg: "#F0EDE5", text: "#5C4A2A", dot: "#B48A3C" },
  Nature:   { bg: "#E5EDE8", text: "#1E3D26", dot: "#3D7A4F" },
};

const STAT_ITEMS = [
  { icon: Compass,    label: "Experiences",   key: "experiences",  color: "#3E7A58" },
  { icon: Calendar,  label: "Upcoming",       key: "upcoming",     color: "#C4893F" },
  { icon: Heart,     label: "Saved",          key: "saved",        color: "#B45C6A" },
  { icon: Globe,     label: "States visited", key: "states",       color: "#5C5CB4" },
];

function StatCard({ icon: Icon, label, value, color, index }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 30, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: index * 0.1, ease: "power3.out" }
    );
  }, []);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[16px] bg-white border border-[#E8E1D5] p-5 group hover:shadow-md transition-shadow duration-300">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-10" style={{ background: color }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-1">{label}</p>
          <p className="text-3xl font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {value ?? "—"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({ exp, index }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const cat = CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Culture;

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, delay: 0.3 + index * 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%" }
      }
    );
  }, []);

  const handleMouseEnter = () => gsap.to(ref.current, { y: -4, duration: 0.3, ease: "power2.out" });
  const handleMouseLeave = () => gsap.to(ref.current, { y: 0, duration: 0.3, ease: "power2.out" });

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/experiences/${exp.slug || exp.id}`)}
      className="group cursor-pointer rounded-[18px] bg-white border border-[#E8E1D5] overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image placeholder with gradient */}
      <div className="relative h-44 overflow-hidden" style={{ background: `linear-gradient(135deg, ${cat.bg}, #F5F0E8)` }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Compass size={64} style={{ color: cat.dot }} />
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: cat.bg, color: cat.text }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.dot }} />
          {exp.category}
        </div>
        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#1A2820]">
          <Star size={11} fill="#C4893F" color="#C4893F" />
          {exp.rating ?? "New"}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#1A2820] text-sm leading-snug mb-2 group-hover:text-[#3E7A58] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
          {exp.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-[#7A9285] mb-3">
          <MapPin size={11} />
          <span>{exp.location || exp.community?.village}</span>
          {exp.duration && <><span className="mx-1 opacity-40">·</span><Clock size={11} /><span>{exp.duration}</span></>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
              ₹{(exp.price_per_person ?? exp.price)?.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[#9A9285] ml-1">/person</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#3E7A58] font-medium group-hover:gap-2 transition-all">
            Book <ChevronRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TouristDashboard() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const headerRef = useRef(null);
  const greetRef  = useRef(null);

  useEffect(() => {
    gsap.fromTo(greetRef.current,
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    Promise.all([
      experienceService.list("status=published&limit=6"),
      bookingService.getMyBookings(),
    ])
      .then(([expRes, bookRes]) => {
        const exps  = expRes?.data?.experiences ?? expRes?.experiences ?? [];
        const books = bookRes?.data?.bookings   ?? bookRes?.bookings   ?? [];
        setExperiences(exps);
        setBookings(books);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    experiences: bookings.length,
    upcoming:    bookings.filter(b => b.status === "confirmed" || b.status === "pending").length,
    saved:       "—",
    states:      [...new Set(bookings.map(b => b.location))].length || "—",
  };

  const firstName = user?.name?.split(" ")[0] || "Traveller";
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2]">

        {/* Hero greeting */}
        <div ref={greetRef} className="px-6 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#7A9285] font-medium mb-1">{greeting},</p>
              <h1 className="text-3xl font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {firstName} <span className="text-[#3E7A58]">✦</span>
              </h1>
              <p className="text-sm text-[#9A9285] mt-1">Discover community-led journeys across Northeast India</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1C3D2E] flex items-center justify-center">
              <Sparkles size={18} color="#F2EDE4" />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-6 grid grid-cols-2 gap-3 mb-8">
          {STAT_ITEMS.map((s, i) => (
            <StatCard key={s.key} {...s} value={stats[s.key]} index={i} />
          ))}
        </div>

        {/* Experiences grid */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} color="#3E7A58" />
              <h2 className="text-base font-semibold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Recommended for you
              </h2>
            </div>
            <button className="text-xs text-[#3E7A58] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              See all <ChevronRight size={13} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-[18px] bg-white border border-[#E8E1D5] h-64 animate-pulse" />
              ))}
            </div>
          ) : experiences.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiences.map((exp, i) => (
                <ExperienceCard key={exp.id} exp={exp} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Compass size={40} className="text-[#C4B8A8] mb-3" />
              <p className="text-[#7A9285] text-sm">No experiences available right now.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}