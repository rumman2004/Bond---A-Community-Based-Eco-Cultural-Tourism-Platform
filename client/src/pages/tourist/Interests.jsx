import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Sparkles, Check, Save, AlertCircle, CheckCircle } from "lucide-react";
import userService from "../../services/userService";
import PageShell from "../PageShell";

// All available interest tags
const ALL_INTERESTS = [
  { label: "Culture",      emoji: "🏛️" },
  { label: "Food",         emoji: "🍛" },
  { label: "Craft",        emoji: "🪡" },
  { label: "Nature",       emoji: "🌿" },
  { label: "Festivals",    emoji: "🎉" },
  { label: "Photography",  emoji: "📷" },
  { label: "Trekking",     emoji: "🥾" },
  { label: "Homestay",     emoji: "🏡" },
  { label: "Meditation",   emoji: "🧘" },
  { label: "Wildlife",     emoji: "🦚" },
  { label: "Rivers",       emoji: "🌊" },
  { label: "Weaving",      emoji: "🧵" },
  { label: "Music",        emoji: "🎵" },
  { label: "Agriculture",  emoji: "🌾" },
  { label: "Eco-tourism",  emoji: "♻️" },
  { label: "Slow travel",  emoji: "🚶" },
];

function InterestChip({ item, selected, onToggle, index }) {
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, scale: 0.8, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, delay: index * 0.04, ease: "back.out(1.4)" }
    );
  }, []);

  const handleClick = () => {
    gsap.to(ref.current, { scale: 0.9, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.inOut" });
    onToggle(item.label);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className="relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 border"
      style={{
        background:   selected ? "#1C3D2E" : "#FFFFFF",
        borderColor:  selected ? "#1C3D2E" : "#E0D8CE",
        color:        selected ? "#F2EDE4" : "#3D5448",
      }}
    >
      <span>{item.emoji}</span>
      <span>{item.label}</span>
      {selected && (
        <span className="ml-0.5">
          <Check size={13} color="#A8CCBA" />
        </span>
      )}
    </button>
  );
}

function Toast({ type, message, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.timeline()
      .fromTo(ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" })
      .to(ref.current, { y: 20, opacity: 0, duration: 0.4, ease: "power3.in", delay: 2.5, onComplete: onDone });
  }, []);
  const ok = type === "success";
  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-[12px] px-4 py-3 shadow-xl text-sm font-medium"
      style={{ background: ok ? "#1C3D2E" : "#5C1A1A", color: "#F2EDE4" }}>
      {ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function Interests() {
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const headerRef = useRef(null);
  const btnRef    = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
  }, []);

  // Load saved interests
  useEffect(() => {
    userService.getInterests()
      .then(res => {
        const arr = res?.data?.interests ?? res?.interests ?? [];
        setSelected(new Set(Array.isArray(arr) ? arr : []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (label) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    gsap.to(btnRef.current, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 });
    try {
      await userService.updateInterests([...selected]);
      setToast({ type: "success", message: "Interests saved!", key: Date.now() });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Save failed.", key: Date.now() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div ref={headerRef} className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F0EDE5" }}>
                <Sparkles size={18} color="#C4893F" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Travel Interests
              </h1>
            </div>
            <p className="text-sm text-[#9A9285] ml-[52px]">
              Tune recommendations around the experiences you care about
            </p>
          </div>

          {/* Selection counter */}
          {!loading && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[#9A9285]">
                <span className="font-semibold text-[#1A2820]">{selected.size}</span> selected
              </p>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())} className="text-xs text-[#B45C5C] hover:underline">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Chips grid */}
          {loading ? (
            <div className="flex flex-wrap gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-10 rounded-full bg-[#E8E1D5] animate-pulse" style={{ width: `${80 + Math.random() * 60}px` }} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mb-8">
              {ALL_INTERESTS.map((item, i) => (
                <InterestChip
                  key={item.label}
                  item={item}
                  selected={selected.has(item.label)}
                  onToggle={toggle}
                  index={i}
                />
              ))}
            </div>
          )}

          {/* Save button */}
          <div className="sticky bottom-4">
            <button
              ref={btnRef}
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full flex items-center justify-center gap-2 rounded-[14px] py-3.5 text-sm font-semibold shadow-lg transition-all disabled:opacity-60 hover:opacity-90"
              style={{ background: "#1C3D2E", color: "#F2EDE4" }}
            >
              {saving
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                : <><Save size={15} /> Save interests</>
              }
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onDone={() => setToast(null)} />}
    </PageShell>
  );
}