import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  ChevronRight,
  Compass,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Shield,
  Leaf,
  Globe,
  ArrowRight,
  Search,
  BookOpen,
  Calendar,
  Heart,
  Clock,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import communityService from "../../services/communityService";
import storyService from "../../services/storyService";

function getCommunityImage(c) {
  return c.cover_image_url || c.images?.[0]?.image_url || c.image_url || "";
}

export default function TouristDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const heroRef = useRef(null);
  const communitiesRef = useRef(null);
  const storiesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commRes, storyRes] = await Promise.all([
          communityService.list("status=verified&limit=6"),
          storyService.list("limit=4")
        ]);
        
        setCommunities(commRes?.data?.communities ?? commRes?.communities ?? []);
        setStories(storyRes?.data?.stories ?? storyRes?.stories ?? []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.fromTo(heroRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8 }
      );

      if (communitiesRef.current) {
        tl.fromTo(communitiesRef.current.children, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 
          "-=0.4"
        );
      }

      if (storiesRef.current) {
        tl.fromTo(storiesRef.current.children, 
          { opacity: 0, x: 20 }, 
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1 }, 
          "-=0.4"
        );
      }
    });
    return () => ctx.revert();
  }, [loading]);

  const firstName = user?.name?.split(" ")[0] || "Traveller";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      
      {/* ── HERO SECTION ── */}
      <div className="pt-24 pb-12 px-5 max-w-7xl mx-auto">
        <div 
          ref={heroRef}
          className="relative overflow-hidden rounded-[2.5rem] shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #1C3D2E 0%, #2D6A4F 60%, #3E7A58 100%)",
            minHeight: "400px"
          }}
        >
          {/* Ambient visuals */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[80%] rounded-full bg-[#D4E6DC] blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-[#C8883A] blur-[100px] opacity-30" />
          </div>

          <div className="relative h-full flex flex-col justify-center p-8 md:p-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                <Sparkles size={14} className="text-[#A8CCBA]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8CCBA]">
                  Welcome back, Explorer
                </span>
              </div>
              
              <h1 
                className="text-4xl md:text-6xl text-white mb-6 leading-[1.1]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                {greeting}, <br className="hidden md:block" />
                <span style={{ color: "var(--color-amber-light)" }}>{firstName}</span>
              </h1>
              
              <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-lg italic font-medium">
                "BOND — Because every community has a story worth travelling for."
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/tourist/explore")}
                  className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#1C3D2E] font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Search size={18} />
                  Start Exploring
                </button>
                <button
                  onClick={() => navigate("/tourist/bookings")}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold transition-all duration-300 hover:bg-white/20"
                >
                  <Calendar size={18} />
                  My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURED COMMUNITIES ── */}
      <section className="pb-32 px-5 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-[1px] bg-[#3E7A58]/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E7A58]">Curated for you</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-[#1A2820]" style={{ fontFamily: "var(--font-display)" }}>
              Recommended <span className="text-[#3E7A58]">Communities</span>
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Hand-picked local communities offering authentic sustainable experiences across the Northeast.
            </p>
          </div>
          <button 
            onClick={() => navigate("/tourist/explore")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4E6DC] text-[#3E7A58] text-sm font-bold hover:bg-[#3E7A58] hover:text-white transition-all duration-300"
          >
            Explore All <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[450px] rounded-[2.5rem] animate-pulse bg-black/5" />
            ))}
          </div>
        ) : (
          <div ref={communitiesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {communities.map((c) => {
              const img = getCommunityImage(c);
              const loc = [c.village, c.state].filter(Boolean).join(", ") || "Northeast India";
              const rating = parseFloat(c.avg_rating) || 0;
              const reviewCount = parseInt(c.review_count) || 0;
              const memberCount = parseInt(c.member_count) || 0;
              
              return (
                <div 
                  key={c.id}
                  onClick={() => navigate(`/tourist/community/${c.slug || c.id}`)}
                  className="group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_32px_64px_-12px_rgba(28,61,46,0.15)] border border-black/[0.04]"
                >
                  {/* Image Container */}
                  <div className="relative h-72 overflow-hidden">
                    {img ? (
                      <img 
                        src={img} 
                        alt={c.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#D4E6DC] flex items-center justify-center text-[#3E7A58]">
                        <Globe size={48} />
                      </div>
                    )}
                    
                    {/* Top Layer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                    
                    {/* Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-black uppercase text-white tracking-widest shadow-lg">
                        {c.status === "verified" ? "Verified Partner" : "Featured"}
                      </div>
                    </div>

                    {/* Rating on Image */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-1.5 text-white">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#1A2820] text-xs font-bold shadow-sm">
                        <Star size={12} fill="#F59E0B" color="#F59E0B" />
                        {rating > 0 ? rating.toFixed(1) : "0.0"}
                      </div>
                      <span className="text-[10px] font-bold text-white/90 drop-shadow-md uppercase tracking-wider">
                        {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-grow relative">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#3E7A58] uppercase tracking-[0.2em] mb-4">
                      <MapPin size={14} className="opacity-50" /> {loc}
                    </div>
                    
                    <h3 className="text-2xl font-semibold mb-4 text-[#1A2820] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {c.name}
                    </h3>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 mb-8 leading-relaxed font-medium">
                      {c.description || "Immerse yourself in authentic cultural traditions and sustainable community-led initiatives."}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#D4E6DC] flex items-center justify-center overflow-hidden">
                              <User size={14} className="text-[#3E7A58]" />
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-[#1A2820] leading-none">{memberCount}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Members</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[11px] font-black text-[#3E7A58] uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
                        Profile <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FOOTER CTA ── */}
      <div className="pb-32 px-5 max-w-4xl mx-auto">
        <div className="bg-[#1A2820] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3E7A58] blur-[120px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C8883A] blur-[120px] opacity-10" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-[#A8CCBA] border border-white/10">
              <Heart size={32} />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white" style={{ fontFamily: "var(--font-display)" }}>
              Ready to make an impact?
            </h3>
            <p className="text-white/60 mb-12 leading-relaxed max-w-xl mx-auto text-lg">
              Every booking contributes to the preservation of indigenous cultures and the protection of biodiversity in the region.
            </p>
            <button
              onClick={() => navigate("/tourist/explore")}
              className="px-12 py-5 rounded-2xl bg-white text-[#1A2820] font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
