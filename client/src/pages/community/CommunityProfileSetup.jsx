import { useState, useEffect, useRef } from "react";
import {
  Save, Upload, X, CheckCircle, AlertCircle,
  Globe, MapPin, FileText, Users, Hash, Leaf,
  Languages, Sun, Navigation, Pencil, ArrowLeft,
  Star, Calendar, Award, Camera, CheckCheck,
  Clock, Loader2,
} from "lucide-react";
import PageShell from "../PageShell";
import communityService from "../../services/communityService";
import uploadService, { UPLOAD_FOLDERS } from "../../services/uploadService";

// ─── Static data ──────────────────────────────────────────────
const SUSTAINABILITY_TAGS = [
  { id: 1,  label: "Eco-friendly",       icon: "🌿" },
  { id: 2,  label: "Organic farming",    icon: "🌾" },
  { id: 3,  label: "Handicrafts",        icon: "🪡" },
  { id: 4,  label: "Wildlife friendly",  icon: "🦋" },
  { id: 5,  label: "Zero waste",         icon: "♻️"  },
  { id: 6,  label: "Solar powered",      icon: "☀️"  },
  { id: 7,  label: "Water conservation", icon: "💧" },
  { id: 8,  label: "Cultural heritage",  icon: "🏺" },
  { id: 9,  label: "Community-led",      icon: "🤝" },
  { id: 10, label: "Forest stewardship", icon: "🌳" },
  { id: 11, label: "Tribal tourism",     icon: "🏕️"  },
  { id: 12, label: "Slow travel",        icon: "🐢" },
];

const SEASONS = ["Spring", "Summer", "Monsoon", "Autumn", "Winter", "Year-round"];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const EMPTY_FORM = {
  name: "", short_description: "", description: "",
  village: "", district: "", state: "", country: "India",
  pincode: "", best_visit_season: "",
};

// ─── Status badge config ──────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: "Under Review",  bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  verified:   { label: "Verified",      bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  rejected:   { label: "Rejected",      bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  suspended:  { label: "Suspended",     bg: "#F3F4F6", text: "#374151", dot: "#9CA3AF" },
};

// ─── Form sub-components ──────────────────────────────────────
function Field({ label, name, value, onChange, icon: Icon, multiline = false, placeholder = "", error = "", hint = "" }) {
  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3.5 top-3.5 text-[#B8AFA4] group-focus-within:text-[#3E7A58] transition-colors pointer-events-none" />}
        {multiline ? (
          <textarea name={name} value={value} onChange={onChange} rows={4} placeholder={placeholder}
            className={`w-full rounded-2xl border ${error ? "border-red-400 focus:ring-red-100" : "border-[#E0D8CE] focus:border-[#3E7A58] focus:ring-[#3E7A58]/10"} bg-white px-4 py-3 text-sm text-[#1A2820] resize-none focus:outline-none focus:ring-2 transition-all placeholder:text-[#C4B8A8]`}
            style={{ paddingLeft: Icon ? "2.5rem" : "1rem" }}
          />
        ) : (
          <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder}
            className={`w-full rounded-2xl border ${error ? "border-red-400 focus:ring-red-100" : "border-[#E0D8CE] focus:border-[#3E7A58] focus:ring-[#3E7A58]/10"} bg-white py-3 text-sm text-[#1A2820] focus:outline-none focus:ring-2 transition-all placeholder:text-[#C4B8A8]`}
            style={{ paddingLeft: Icon ? "2.5rem" : "1rem", paddingRight: "1rem" }}
          />
        )}
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-[#B8AFA4]">{hint}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, icon: Icon, placeholder = "Select…", error = "" }) {
  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3.5 top-3.5 text-[#B8AFA4] group-focus-within:text-[#3E7A58] transition-colors pointer-events-none z-10" />}
        <select name={name} value={value} onChange={onChange}
          className={`w-full rounded-2xl border ${error ? "border-red-400" : "border-[#E0D8CE] focus:border-[#3E7A58] focus:ring-[#3E7A58]/10"} bg-white py-3 pr-4 text-sm text-[#1A2820] focus:outline-none focus:ring-2 transition-all appearance-none`}
          style={{ paddingLeft: Icon ? "2.5rem" : "1rem" }}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      {error && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function LanguagesInput({ languages, onChange }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val && !languages.includes(val)) onChange([...languages, val]);
    setInput("");
  };
  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Languages spoken</label>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#E0D8CE] bg-white p-3 focus-within:border-[#3E7A58] focus-within:ring-2 focus-within:ring-[#3E7A58]/10 transition-all">
        {languages.map(lang => (
          <span key={lang} className="inline-flex items-center gap-1 rounded-full bg-[#EAF3DE] px-3 py-1 text-xs font-medium text-[#1C3D2E]">
            {lang}
            <button type="button" onClick={() => onChange(languages.filter(l => l !== lang))} className="ml-0.5 text-[#9A9285] hover:text-red-500 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder="Add language, press Enter"
          className="flex-1 min-w-[140px] bg-transparent text-sm text-[#1A2820] outline-none placeholder:text-[#C4B8A8]"
        />
      </div>
    </div>
  );
}

function SustainabilityTagPicker({ selectedIds, onChange }) {
  const toggle = (id) => onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-3">Sustainability tags</label>
      <div className="flex flex-wrap gap-2">
        {SUSTAINABILITY_TAGS.map(tag => {
          const active = selectedIds.includes(tag.id);
          return (
            <button key={tag.id} type="button" onClick={() => toggle(tag.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${active ? "border-[#3E7A58] bg-[#E8F0EC] text-[#1C3D2E]" : "border-[#E0D8CE] bg-white text-[#7A8C82] hover:border-[#3E7A58] hover:text-[#1C3D2E]"}`}
            >
              <span>{tag.icon}</span>{tag.label}
              {active && <X size={10} className="ml-0.5 opacity-60" />}
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 && <p className="mt-2 text-xs text-[#9A9285]">{selectedIds.length} selected</p>}
    </div>
  );
}

function CoverUploader({ communityId, currentUrl, currentImages = [], onUploaded, onImagesUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const [gallery, setGallery] = useState(currentImages);
  const inputRef = useRef(null);
  useEffect(() => { setPreview(currentUrl || ""); }, [currentUrl]);
  useEffect(() => { setGallery(currentImages || []); }, [currentImages]);

  const handleFile = async (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    if (!selected.length) return;
    const previewUrls = selected.map((file) => ({ image_url: URL.createObjectURL(file) }));
    setPreview(previewUrls[0].image_url);
    setGallery((prev) => [...previewUrls, ...(prev || [])].slice(0, 5));
    setUploading(true);
    try {
      if (communityId) {
        const fd = new FormData();
        selected.forEach((file) => fd.append("images", file));
        const res = await communityService.uploadImages(communityId, fd);
        const images = res?.data?.images ?? res?.images ?? [];
        const firstUrl = images[0]?.image_url;
        if (firstUrl) onUploaded(firstUrl);
        if (images.length) {
          setGallery((prev) => [...images, ...(prev || []).filter((image) => !image.image_url?.startsWith("blob:"))].slice(0, 5));
          onImagesUploaded?.(images);
        }
      } else {
        const res = await uploadService.uploadImages(selected, UPLOAD_FOLDERS.COMMUNITY);
        const images = res?.data?.images ?? res?.images ?? [];
        const firstUrl = images[0]?.url;
        if (firstUrl) onUploaded(firstUrl);
      }
    } catch (err) {
      console.error("Community image upload failed:", err);
      setPreview(currentUrl || "");
      setGallery(currentImages || []);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Cover Photos</label>
      <div onClick={() => inputRef.current?.click()}
        className="relative flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#D4C9BB] bg-[#F5F2EE] transition-all hover:border-[#3E7A58] hover:bg-[#EEF5F1]"
      >
        {preview ? (
          <img src={preview} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#9A9285]">
            <Upload size={24} />
            <p className="text-sm font-medium">Upload cover photos</p>
            <p className="text-xs">Select up to 5 JPG/PNG images · 1920×1080 recommended for best quality</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>
      {gallery.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {gallery.slice(0, 5).map((image, index) => (
            <img
              key={`${image.id || image.image_url}-${index}`}
              src={image.image_url}
              alt={`Community cover ${index + 1}`}
              className="h-16 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-[#F0EBE3]">
      <Icon size={15} className="text-[#3E7A58]" />
      <span className="text-xs font-semibold uppercase tracking-widest text-[#9A9285]">{title}</span>
    </div>
  );
}

function Toast({ type, message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  const ok = type === "success";
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-xl"
      style={{ background: ok ? "#1C3D2E" : "#5C1A1A", color: "#F2EDE4" }}>
      {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

// ─── Profile View (read-only) ─────────────────────────────────
function ProfileView({ community, tags, languages, onEditClick }) {
  const status = community.status ?? "pending";
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  const infoItems = [
    community.village && { icon: MapPin,   label: "Village",  value: community.village },
    community.district && { icon: MapPin,   label: "District", value: community.district },
    community.state && { icon: Navigation, label: "State",   value: community.state },
    community.country && { icon: Globe,     label: "Country",  value: community.country },
    community.pincode && { icon: Hash,      label: "Pincode",  value: community.pincode },
    community.best_visit_season && { icon: Sun, label: "Best Season", value: community.best_visit_season },
  ].filter(Boolean);
  const gallery = (community.images || []).map((image) => image.image_url).filter(Boolean);

  return (
    <div className="max-w-2xl space-y-5">

      {/* Cover + identity header */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E8E1D5] bg-white shadow-sm">

        {/* Cover image */}
        <div className="h-52 w-full bg-gradient-to-br from-[#2D5A3D] via-[#3E7A58] to-[#6AAF7A] relative">
          {community.cover_image_url ? (
            <img src={community.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center opacity-20">
              <Camera size={48} className="text-white" />
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
              style={{ background: statusCfg.bg, color: statusCfg.text }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusCfg.dot }} />
              {statusCfg.label}
            </span>
          </div>
          {/* Edit button */}
          <button onClick={onEditClick}
            className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-sm px-3.5 py-2 text-xs font-semibold text-[#1C3D2E] shadow-md hover:bg-white transition-all hover:shadow-lg active:scale-95">
            <Pencil size={13} />
            Edit profile
          </button>
        </div>
        {gallery.length > 1 && (
          <div className="grid grid-cols-4 gap-2 px-6 pb-6">
            {gallery.slice(1, 5).map((image, index) => (
              <img key={image} src={image} alt={`${community.name} gallery ${index + 1}`} className="h-20 w-full rounded-xl object-cover" />
            ))}
          </div>
        )}

        {/* Name & description */}
        <div className="p-6 space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-[#1A2820] leading-tight">{community.name}</h2>
            {community.short_description && (
              <p className="mt-1.5 text-sm text-[#6B7C6E] leading-relaxed">{community.short_description}</p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 pt-1">
            {community.avg_rating > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-[#9A9285]">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold text-[#1A2820]">{Number(community.avg_rating).toFixed(1)}</span>
                {community.total_reviews > 0 && <span>({community.total_reviews} reviews)</span>}
              </div>
            )}
            {community.total_bookings > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-[#9A9285]">
                <Calendar size={12} />
                <span>{community.total_bookings} bookings</span>
              </div>
            )}
            {community.created_at && (
              <div className="flex items-center gap-1.5 text-xs text-[#9A9285]">
                <Clock size={12} />
                <span>Since {new Date(community.created_at).getFullYear()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full description */}
      {community.description && (
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5">
          <SectionHeading icon={FileText} title="About" />
          <p className="mt-4 text-sm text-[#4A5E52] leading-relaxed whitespace-pre-line">
            {community.description}
          </p>
        </div>
      )}

      {/* Location & details */}
      {infoItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5">
          <SectionHeading icon={MapPin} title="Location & Details" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5 rounded-xl bg-[#F9F7F4] px-3.5 py-3">
                <Icon size={14} className="text-[#3E7A58] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-[#B8AFA4]">{label}</p>
                  <p className="text-sm font-medium text-[#1A2820] mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5">
          <SectionHeading icon={Languages} title="Languages spoken" />
          <div className="mt-4 flex flex-wrap gap-2">
            {languages.map(lang => (
              <span key={lang} className="inline-flex items-center gap-1 rounded-full bg-[#EAF3DE] px-3 py-1.5 text-xs font-medium text-[#1C3D2E]">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sustainability tags */}
      {tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5">
          <SectionHeading icon={Leaf} title="Sustainability" />
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map(tag => {
              const meta = SUSTAINABILITY_TAGS.find(t => t.id === tag.id);
              return (
                <span key={tag.id} className="inline-flex items-center gap-1.5 rounded-full border border-[#3E7A58] bg-[#E8F0EC] px-3 py-1.5 text-xs font-medium text-[#1C3D2E]">
                  {meta?.icon} {tag.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification notice */}
      {status === "pending" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <CheckCheck size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Profile submitted for review</p>
            <p className="mt-0.5 text-xs text-amber-700">Our team typically reviews within 2–3 business days. You'll be notified once verified.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Edit Form ────────────────────────────────────────────────
function EditForm({ form, setForm, languages, setLanguages, tagIds, setTagIds, coverUrl, setCoverUrl, coverImages, setCoverImages,
  commId, saving, fieldErrors, onSubmit, onCancel }) {
  const update = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">

      {/* Back button */}
      <button type="button" onClick={onCancel}
        className="inline-flex items-center gap-2 text-sm text-[#6B7C6E] hover:text-[#1C3D2E] transition-colors">
        <ArrowLeft size={15} />
        Back to profile
      </button>

      {/* Cover photo */}
      <CoverUploader
        communityId={commId}
        currentUrl={coverUrl}
        currentImages={coverImages}
        onUploaded={setCoverUrl}
        onImagesUploaded={(images) => setCoverImages((prev) => [...images, ...(prev || [])].slice(0, 5))}
      />

      {/* Identity */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5 space-y-5">
        <SectionHeading icon={Users} title="Identity" />
        <Field label="Community name" name="name" value={form.name} onChange={update}
          error={fieldErrors.name} icon={Users} placeholder="e.g. Ziro Valley Heritage Community" />
        <Field label="Short description" name="short_description" value={form.short_description} onChange={update}
          error={fieldErrors.short_description} icon={Hash}
          placeholder="One-line summary shown on listing cards (max 500 chars)"
          hint="Shown on explore cards — keep it punchy" />
        <Field label="Full description" name="description" value={form.description} onChange={update}
          error={fieldErrors.description} icon={FileText} multiline
          placeholder="Describe your community, culture, and what makes it special…" />
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5 space-y-5">
        <SectionHeading icon={MapPin} title="Location" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Village" name="village" value={form.village} onChange={update}
            error={fieldErrors.village} icon={MapPin} placeholder="e.g. Hong Village" />
          <Field label="District" name="district" value={form.district} onChange={update}
            error={fieldErrors.district} icon={MapPin} placeholder="e.g. Lower Subansiri" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField label="State" name="state" value={form.state} onChange={update}
            options={INDIAN_STATES} icon={Navigation} placeholder="Select state"
            error={fieldErrors.state} />
          <Field label="Country" name="country" value={form.country} onChange={update}
            error={fieldErrors.country} icon={Globe} placeholder="India" />
          <Field label="Pincode" name="pincode" value={form.pincode} onChange={update}
            error={fieldErrors.pincode} icon={Hash} placeholder="e.g. 791120" />
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5 space-y-5">
        <SectionHeading icon={Sun} title="Details" />
        <SelectField label="Best visit season" name="best_visit_season" value={form.best_visit_season} onChange={update}
          options={SEASONS} icon={Sun} placeholder="Select season" error={fieldErrors.best_visit_season} />
        <LanguagesInput languages={languages} onChange={setLanguages} />
      </div>

      {/* Sustainability */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5">
        <SectionHeading icon={Leaf} title="Sustainability" />
        <div className="mt-4">
          <SustainabilityTagPicker selectedIds={tagIds} onChange={setTagIds} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || !form.name.trim()}
          className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-[#F2EDE4] transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "#1C3D2E" }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {commId ? "Save changes" : "Create community"}
        </button>
        {commId && (
          <button type="button" onClick={onCancel}
            className="rounded-2xl border border-[#E0D8CE] px-5 py-3 text-sm font-medium text-[#6B7C6E] hover:bg-[#F5F2EE] transition-all">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function CommunityProfileSetup() {
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [languages,   setLanguages]   = useState([]);
  const [tagIds,      setTagIds]      = useState([]);
  const [coverUrl,    setCoverUrl]    = useState("");
  const [coverImages, setCoverImages] = useState([]);
  const [commId,      setCommId]      = useState(null);
  const [community,   setCommunity]   = useState(null);   // full community object
  const [tags,        setTags]        = useState([]);      // [{id,label,icon}]
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [loaded,      setLoaded]      = useState(false);
  const [isEditing,   setIsEditing]   = useState(false);  // false = view, true = edit form
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Load existing profile on mount ───────────────────────────
  const loadProfile = () =>
    communityService.getOwn()
      .then(res => {
        const c = res?.data?.community ?? res?.community;
        if (!c) return;
        setCommunity(c);
        setCommId(c.id);
        setForm({
          name:              c.name              ?? "",
          short_description: c.short_description ?? "",
          description:       c.description       ?? "",
          village:           c.village           ?? "",
          district:          c.district          ?? "",
          state:             c.state             ?? "",
          country:           c.country           ?? "India",
          pincode:           c.pincode           ?? "",
          best_visit_season: c.best_visit_season ?? "",
        });
        setLanguages(c.languages_spoken ?? []);
        setTags(c.tags ?? []);
        setTagIds(c.tags?.map(t => t.id).filter(Boolean) ?? []);
        setCoverUrl(c.cover_image_url ?? "");
        setCoverImages(c.images ?? []);
      })
      .catch(err => {
        if (err?.status !== 404 && err?.response?.status !== 404) {
          console.error("Failed to load community profile:", err);
        }
      })
      .finally(() => setLoaded(true));

  useEffect(() => { loadProfile(); }, []);

  // ── Submit (create or update) ─────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});

    try {
      const payload = { ...form, languages_spoken: languages };

      if (commId) {
        await communityService.update(commId, payload);
        await communityService.updateTags(commId, tagIds);
      } else {
        payload.slug = form.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        const res     = await communityService.create(payload);
        const created = res?.data?.community ?? res?.community;
        if (created?.id) {
          setCommId(created.id);
          if (tagIds.length > 0) await communityService.updateTags(created.id, tagIds);
        }
      }

      // Re-fetch fresh data and switch to profile view
      await loadProfile();
      setIsEditing(false);
      setToast({ type: "success", message: commId ? "Profile updated!" : "Community created!", key: Date.now() });
    } catch (err) {
      if (err?.errors && Array.isArray(err.errors)) {
        const errMap = {};
        err.errors.forEach(e => { errMap[e.path] = e.msg; });
        setFieldErrors(errMap);
      }
      setToast({ type: "error", message: err?.message || "Save failed.", key: Date.now() });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (!loaded) {
    return (
      <PageShell title="Community Profile" subtitle="Tell travellers what makes your place unique">
        <div className="max-w-2xl space-y-4">
          <div className="h-52 animate-pulse rounded-3xl bg-[#E8E1D5]" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-[#E8E1D5]" />
          ))}
        </div>
      </PageShell>
    );
  }

  // ── Decide what to render ─────────────────────────────────────
  // No community yet → always show setup form
  // Has community + not editing → show profile view
  // Has community + editing → show edit form
  const showForm    = !community || isEditing;
  const pageTitle   = community && !isEditing
    ? "Your Community"
    : community
      ? "Edit Profile"
      : "Community Setup";
  const pageSubtitle = community && !isEditing
    ? "Your community profile as seen by travellers"
    : "Tell travellers what makes your place unique";

  return (
    <PageShell title={pageTitle} subtitle={pageSubtitle}>

      {showForm ? (
        <EditForm
          form={form} setForm={setForm}
          languages={languages} setLanguages={setLanguages}
          tagIds={tagIds} setTagIds={setTagIds}
          coverUrl={coverUrl} setCoverUrl={setCoverUrl}
          coverImages={coverImages} setCoverImages={setCoverImages}
          commId={commId}
          saving={saving}
          fieldErrors={fieldErrors}
          onSubmit={handleSubmit}
          onCancel={community ? () => setIsEditing(false) : undefined}
        />
      ) : (
        <ProfileView
          community={community}
          tags={tags}
          languages={languages}
          onEditClick={() => setIsEditing(true)}
        />
      )}

      {toast && (
        <Toast key={toast.key} type={toast.type} message={toast.message} onDone={() => setToast(null)} />
      )}
    </PageShell>
  );
}
