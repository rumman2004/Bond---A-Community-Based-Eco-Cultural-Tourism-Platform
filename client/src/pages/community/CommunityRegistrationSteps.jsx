// ============================================================
// pages/community/CommunityRegistrationSteps.jsx
// Individual step components for the 4-step registration wizard
// ✓ Shows previously saved docs and images on resume
// ============================================================

import { useState, useRef } from "react";
import {
  Plus, Trash2, Upload, X, FileText, User, Phone,
  Briefcase, Home, Utensils, Music, Image, ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  OFFERING_CATEGORIES, EVENT_SUBTYPES, MEMBER_ROLES,
  CONSENT_TEXT, INDIAN_STATES, SEASONS,
} from "../../utils/verificationConstants";

// ─── Shared UI atoms ──────────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-1.5">
    {children}
  </label>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full rounded-xl border ${error ? "border-red-400" : "border-[#E0D8CE] focus:border-[#3E7A58]"} bg-white px-3.5 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]`}
  />
);

const Textarea = ({ error, ...props }) => (
  <textarea
    rows={3}
    {...props}
    className={`w-full rounded-xl border ${error ? "border-red-400" : "border-[#E0D8CE] focus:border-[#3E7A58]"} bg-white px-3.5 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8] resize-none`}
  />
);

const Select = ({ options, placeholder = "Select…", ...props }) => (
  <select
    {...props}
    className="w-full rounded-xl border border-[#E0D8CE] focus:border-[#3E7A58] bg-white px-3.5 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/10 transition-all appearance-none"
  >
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

// ─── STEP 1 — Basic Info ──────────────────────────────────────
export function Step1BasicInfo({ form, setForm, errors }) {
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-5">
      <p className="text-sm text-[#6B7C6E]">Tell us about your community. This information will be shown to travellers.</p>

      <div>
        <Label>Community Name *</Label>
        <Input name="name" value={form.name} onChange={set} placeholder="e.g. Ziro Valley Heritage Community" error={errors.name} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <Label>Short Description</Label>
        <Input name="short_description" value={form.short_description} onChange={set} placeholder="One-line summary (max 500 chars)" />
      </div>

      <div>
        <Label>Full Description *</Label>
        <Textarea name="description" value={form.description} onChange={set} placeholder="Describe your community, culture, and what makes it special…" rows={5} error={errors.description} />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Village *</Label>
          <Input name="village" value={form.village} onChange={set} placeholder="e.g. Hong Village" error={errors.village} />
          {errors.village && <p className="mt-1 text-xs text-red-500">{errors.village}</p>}
        </div>
        <div>
          <Label>District *</Label>
          <Input name="district" value={form.district} onChange={set} placeholder="e.g. Lower Subansiri" error={errors.district} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>State *</Label>
          <Select name="state" value={form.state} onChange={set} options={INDIAN_STATES} placeholder="Select state" />
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
        </div>
        <div>
          <Label>Pincode</Label>
          <Input name="pincode" value={form.pincode} onChange={set} placeholder="e.g. 791120" />
        </div>
        <div>
          <Label>Best Season</Label>
          <Select name="best_visit_season" value={form.best_visit_season} onChange={set} options={SEASONS} placeholder="Select season" />
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2 — Team Members + ID Upload ───────────────────────
const EMPTY_MEMBER = { full_name: "", phone: "", role: "", is_owner: false };

export function Step2TeamAndDocs({ members, setMembers, docFiles = [], setDocFiles, savedDocs = [], errors }) {
  const fileRef = useRef(null);

  const addMember = () => setMembers((m) => [...m, { ...EMPTY_MEMBER }]);
  const removeMember = (i) => setMembers((m) => m.filter((_, idx) => idx !== i));
  const updateMember = (i, field, value) =>
    setMembers((m) => m.map((mem, idx) => (idx === i ? { ...mem, [field]: value } : mem)));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setDocFiles((prev) => [...prev, ...files].slice(0, 10)); // Max 10
    }
  };

  const removeDocFile = (idx) => {
    setDocFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const hasExistingDoc = savedDocs.length > 0;

  return (
    <div className="space-y-6">
      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#1A2820]">Team Members *</h3>
            <p className="text-xs text-[#9A9285] mt-0.5">Add all members who will be part of the community operations.</p>
          </div>
          <button type="button" onClick={addMember}
            className="flex items-center gap-1.5 rounded-xl bg-[#1C3D2E] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-all">
            <Plus size={13} /> Add Member
          </button>
        </div>

        {errors.members && <p className="mb-2 text-xs text-red-500">{errors.members}</p>}

        <div className="space-y-3">
          {members.map((m, i) => (
            <div key={i} className="rounded-2xl border border-[#E8E1D5] bg-[#FAFAF8] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9A9285] uppercase tracking-widest">Member {i + 1}</span>
                {members.length > 1 && (
                  <button type="button" onClick={() => removeMember(i)}
                    className="text-[#9A9285] hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Full Name *</Label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-3 text-[#B8AFA4] pointer-events-none" />
                    <input value={m.full_name} onChange={(e) => updateMember(i, "full_name", e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-xl border border-[#E0D8CE] bg-white pl-8 pr-3 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]" />
                  </div>
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-[#B8AFA4] pointer-events-none" />
                    <input value={m.phone} onChange={(e) => updateMember(i, "phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[#E0D8CE] bg-white pl-8 pr-3 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <Label>Role</Label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-3 text-[#B8AFA4] pointer-events-none z-10" />
                    <select value={m.role} onChange={(e) => updateMember(i, "role", e.target.value)}
                      className="w-full rounded-xl border border-[#E0D8CE] bg-white pl-8 pr-3 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] transition-all appearance-none">
                      <option value="">Select role…</option>
                      {MEMBER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id={`owner_${i}`} checked={m.is_owner}
                    onChange={(e) => updateMember(i, "is_owner", e.target.checked)}
                    className="h-4 w-4 rounded border-[#E0D8CE] text-[#3E7A58] focus:ring-[#3E7A58]" />
                  <label htmlFor={`owner_${i}`} className="text-xs text-[#4A5E52] cursor-pointer">This is the community owner</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previously uploaded documents */}
      {hasExistingDoc && (
        <div>
          <h3 className="text-sm font-semibold text-[#1A2820] mb-2">✓ Previously Uploaded Documents</h3>
          <div className="space-y-2">
            {savedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-800 truncate">
                    {doc.doc_type === "id_bundle" ? "ID Document" : doc.doc_type}
                  </p>
                  <p className="text-xs text-emerald-600">
                    Uploaded {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Upload */}
      <div>
        <h3 className="text-sm font-semibold text-[#1A2820] mb-1">
          {hasExistingDoc ? "Upload More ID Documents (optional)" : "ID Documents (Photos or PDF) *"}
        </h3>
        <p className="text-xs text-[#9A9285] mb-3">
          {hasExistingDoc
            ? "You can upload additional ID photos or documents for new team members."
            : "Upload photos or PDF copies of all team members' government-issued IDs (Aadhaar, PAN, Passport, etc.)."}
        </p>

        {errors.doc && <p className="mb-2 text-xs text-red-500">{errors.doc}</p>}

        <div className="space-y-3">
          {/* List of pending files */}
          {docFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-[#3E7A58] bg-[#EEF5F1] px-4 py-3">
              <FileText size={18} className="text-[#3E7A58] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C3D2E] truncate">{file.name}</p>
                <p className="text-[10px] text-[#6B7C6E]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={() => removeDocFile(idx)}
                className="text-red-500 hover:text-red-700 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Upload trigger */}
          {docFiles.length < 10 && (
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#D4C9BB] bg-[#F5F2EE] p-8 cursor-pointer transition-all hover:border-[#3E7A58] hover:bg-[#EEF5F1]">
              <Upload size={28} className="text-[#B8AFA4]" />
              <div className="text-center">
                <p className="text-sm font-medium text-[#6B7C6E]">Click to upload IDs</p>
                <p className="text-xs text-[#9A9285] mt-0.5">Select multiple JPG, PNG or PDF · max 10 MB each</p>
              </div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" multiple accept=".pdf,image/*" className="hidden" onChange={handleFiles} />
      </div>
    </div>
  );
}

// ─── STEP 3 — Offerings ───────────────────────────────────────
const EMPTY_OFFERING = { category: "", custom_label: "", description: "", imageFiles: [], savedImages: [] };

export function Step3Offerings({ offerings, setOfferings, errors }) {
  const imageRefs = useRef({});

  const addOffering = () => setOfferings((o) => [...o, { ...EMPTY_OFFERING }]);
  const removeOffering = (i) => setOfferings((o) => o.filter((_, idx) => idx !== i));
  const updateOffering = (i, field, value) =>
    setOfferings((o) => o.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  const handleImages = (i, files) => {
    const arr = Array.from(files).slice(0, 5);
    const current = offerings[i].imageFiles || [];
    const savedCount = (offerings[i].savedImages || []).length;
    const maxNew = 5 - savedCount;
    updateOffering(i, "imageFiles", [...current, ...arr].slice(0, maxNew));
  };

  const removeImage = (offeringIdx, imgIdx) =>
    updateOffering(offeringIdx, "imageFiles",
      offerings[offeringIdx].imageFiles.filter((_, idx) => idx !== imgIdx));

  const getCategoryMeta = (id) => OFFERING_CATEGORIES.find((c) => c.id === id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6B7C6E]">
            Add what your community offers. For each offering, provide a description and original photos.
          </p>
        </div>
        <button type="button" onClick={addOffering}
          className="flex items-center gap-1.5 rounded-xl bg-[#1C3D2E] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-all">
          <Plus size={13} /> Add Offering
        </button>
      </div>

      {/* Category quick-pick */}
      <div>
        <Label>Quick Add by Category</Label>
        <div className="flex flex-wrap gap-2">
          {OFFERING_CATEGORIES.map((cat) => (
            <button key={cat.id} type="button"
              onClick={() => setOfferings((o) => [...o, { ...EMPTY_OFFERING, category: cat.id }])}
              className="flex items-center gap-2 rounded-xl border border-[#E0D8CE] bg-white px-3 py-2 text-xs font-medium text-[#4A5E52] hover:border-[#3E7A58] hover:bg-[#EEF5F1] transition-all">
              {cat.icon} {cat.label}
            </button>
          ))}
          {EVENT_SUBTYPES.map((sub) => (
            <button key={sub.id} type="button"
              onClick={() => setOfferings((o) => [...o, { ...EMPTY_OFFERING, category: "event", custom_label: sub.label }])}
              className="flex items-center gap-2 rounded-xl border border-[#E0D8CE] bg-white px-3 py-2 text-xs font-medium text-[#4A5E52] hover:border-[#3E7A58] hover:bg-[#EEF5F1] transition-all">
              {sub.icon} {sub.label}
            </button>
          ))}
        </div>
      </div>

      {errors.offerings && <p className="text-xs text-red-500">{errors.offerings}</p>}

      {offerings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D4C9BB] bg-[#F5F2EE] p-8 text-center">
          <p className="text-sm text-[#9A9285]">No offerings added yet. Use "Quick Add" above or click "Add Offering".</p>
        </div>
      )}

      {offerings.map((off, i) => {
        const meta = getCategoryMeta(off.category);
        const saved = off.savedImages || [];
        const newFiles = off.imageFiles || [];
        const totalImages = saved.length + newFiles.length;

        return (
          <div key={i} className="rounded-2xl border border-[#E8E1D5] bg-[#FAFAF8] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-[#1A2820]">
                {meta?.icon || "🎁"} {meta?.label || "Offering"} {i + 1}
                {off.custom_label && <span className="text-xs text-[#6B7C6E]">({off.custom_label})</span>}
              </span>
              <button type="button" onClick={() => removeOffering(i)}
                className="text-[#9A9285] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <select value={off.category} onChange={(e) => updateOffering(i, "category", e.target.value)}
                  className="w-full rounded-xl border border-[#E0D8CE] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] transition-all appearance-none">
                  <option value="">Select…</option>
                  {OFFERING_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Custom Label / Sub-type</Label>
                <Input value={off.custom_label} onChange={(e) => updateOffering(i, "custom_label", e.target.value)}
                  placeholder="e.g. Dancing, Crafting, Farming…" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={off.description}
                onChange={(e) => updateOffering(i, "description", e.target.value)}
                placeholder="Describe this offering in detail — what guests will experience, duration, what's included…" />
            </div>

            {/* Images: show saved images from server + new file uploads */}
            <div>
              <Label>Photos ({totalImages}/5)</Label>
              <div className="flex flex-wrap gap-2">
                {/* Saved images from server */}
                {saved.map((img) => (
                  <div key={img.id} className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-emerald-300">
                    <img src={img.image_url} alt={img.caption || "Saved"} className="h-full w-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-emerald-600/80 text-white text-center text-[8px] py-0.5 font-semibold">
                      Saved ✓
                    </div>
                  </div>
                ))}

                {/* New file uploads (not yet on server) */}
                {newFiles.map((file, imgIdx) => (
                  <div key={`new-${imgIdx}`} className="relative h-20 w-20 rounded-xl overflow-hidden border border-[#E0D8CE]">
                    <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(i, imgIdx)}
                      className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-red-500 transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Add button */}
                {totalImages < 5 && (
                  <div onClick={() => imageRefs.current[i]?.click()}
                    className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#D4C9BB] bg-[#F5F2EE] hover:border-[#3E7A58] transition-all">
                    <Image size={16} className="text-[#B8AFA4]" />
                    <span className="text-[10px] text-[#9A9285]">Add</span>
                  </div>
                )}
                <input ref={(el) => (imageRefs.current[i] = el)} type="file" multiple accept="image/*"
                  className="hidden" onChange={(e) => handleImages(i, e.target.files)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 4 — Consent ─────────────────────────────────────────
export function Step4Consent({ accepted, setAccepted, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-[#1A2820] mb-1">Terms & Conditions</h3>
        <p className="text-xs text-[#9A9285]">Please read the following carefully before submitting.</p>
      </div>

      <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAFAF8] p-5 max-h-60 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-xs text-[#4A5E52] leading-relaxed font-sans">{CONSENT_TEXT}</pre>
      </div>

      <label className={`flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all ${accepted ? "border-[#3E7A58] bg-[#EEF5F1]" : "border-[#E0D8CE] bg-white"}`}>
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C4B8A8] text-[#3E7A58] focus:ring-[#3E7A58]" />
        <div>
          <p className="text-sm font-semibold text-[#1A2820]">I accept the Terms & Conditions</p>
          <p className="text-xs text-[#6B7C6E] mt-0.5">
            I confirm that all information provided is accurate and I agree to the platform's guidelines.
          </p>
        </div>
      </label>

      {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}

      {accepted && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="text-lg">✅</span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Ready to submit!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Your community will be submitted for security review. You'll be notified within 2–3 business days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
