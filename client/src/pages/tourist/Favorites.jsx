import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Heart, MapPin, Star, Trash2, Compass, Users, Inbox, AlertCircle } from "lucide-react";
import userService from "../../services/userService";
import PageShell from "../PageShell";

const TABS = [
  { key: "experience", label: "Experiences" },
  { key: "community",  label: "Communities" },
];

function FavoriteCard({ item, type, onRemove, index }) {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, scale: 0.94, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: index * 0.09, ease: "power3.out" }
    );
  }, []);

  const handleRemove = async (e) => {
    e.stopPropagation();
    gsap.to(ref.current, {
      opacity: 0, x: 40, duration: 0.35, ease: "power3.in",
      onComplete: () => onRemove(item.target_id, type)
    });
  };

  const isExp = type === "experience";

  return (
    <div
      ref={ref}
      onClick={() => navigate(isExp ? `/experiences/${item.target_id}` : `/communities/${item.target_id}`)}
      className="group relative bg-white rounded-[16px] border border-[#E8E1D5] overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      {/* Colour strip */}
      <div className="h-2 w-full" style={{ background: isExp ? "linear-gradient(90deg,#3E7A58,#A8CCBA)" : "linear-gradient(90deg,#C4893F,#E8D4A8)" }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: isExp ? "#E5EEE8" : "#F0EDE5" }}>
                {isExp ? <Compass size={12} color="#3E7A58" /> : <Users size={12} color="#C4893F" />}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: isExp ? "#3E7A58" : "#C4893F" }}>
                {isExp ? "Experience" : "Community"}
              </span>
            </div>

            <h3 className="font-semibold text-[#1A2820] text-sm leading-snug"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {item.name ?? item.title ?? `${isExp ? "Experience" : "Community"} #${item.target_id?.slice(0, 6)}`}
            </h3>

            {(item.location || item.village) && (
              <p className="flex items-center gap-1 text-xs text-[#9A9285] mt-1">
                <MapPin size={10} />{item.location ?? item.village}
              </p>
            )}

            {item.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={11} fill="#C4893F" color="#C4893F" />
                <span className="text-xs font-medium text-[#6B4F2A]">{item.rating}</span>
              </div>
            )}
          </div>

          {/* Remove btn */}
          <button
            onClick={handleRemove}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "#F5EAEA" }}
          >
            <Trash2 size={13} color="#B45C5C" />
          </button>
        </div>

        {item.description && (
          <p className="text-xs text-[#9A9285] mt-2 line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  );
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [tab, setTab]             = useState("experience");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const headerRef = useRef(null);
  const tabRef    = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    gsap.fromTo(tabRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2 });
  }, []);

  useEffect(() => {
    userService.getFavorites()
      .then(res => {
        const data = res?.data?.favorites ?? res?.favorites ?? [];
        setFavorites(Array.isArray(data) ? data : []);
      })
      .catch(err => setError(err.message || "Failed to load favorites."))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (targetId, targetType) => {
    try {
      await userService.removeFavorite(targetType, targetId);
      setFavorites(prev => prev.filter(f => !(f.target_id === targetId && f.target_type === targetType)));
    } catch (err) {
      console.error("Remove favorite failed:", err);
    }
  };

  const filtered = favorites.filter(f => f.target_type === tab);
  const counts   = { experience: favorites.filter(f => f.target_type === "experience").length, community: favorites.filter(f => f.target_type === "community").length };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F5E8EA" }}>
              <Heart size={18} fill="#B45C6A" color="#B45C6A" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>Favorites</h1>
              <p className="text-sm text-[#9A9285]">Saved communities and experiences</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div ref={tabRef} className="flex gap-2 mb-5">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                style={{ background: tab === t.key ? "#1C3D2E" : "#F0EBE3", color: tab === t.key ? "#F2EDE4" : "#7A9285" }}>
                {t.label}
                {counts[t.key] > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[10px]"
                    style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "#E0D8CE", color: tab === t.key ? "#F2EDE4" : "#9A9285" }}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-[16px] border border-[#E8E1D5] h-36 animate-pulse" />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-center">
              <AlertCircle size={36} className="text-[#B45C5C] mb-2" />
              <p className="text-sm text-[#9A9285]">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Inbox size={40} className="text-[#C4B8A8] mb-3" />
              <p className="text-sm text-[#9A9285]">No saved {tab === "experience" ? "experiences" : "communities"} yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((item, i) => (
                <FavoriteCard key={`${item.target_type}-${item.target_id}`} item={item} type={tab} onRemove={handleRemove} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}