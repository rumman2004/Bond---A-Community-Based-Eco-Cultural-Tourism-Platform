import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { formatCurrency } from "../../../utils/formatters";

// Fields match experienceController.createExperience:
// title, slug, description, short_description, category, difficulty,
// duration_hours, duration_days, max_participants, min_participants,
// price_per_person, currency, included_items, excluded_items,
// meeting_point, latitude, longitude, languages

const CATEGORIES  = ["Art & Craft", "Cultural", "Nature", "Agriculture", "Adventure", "Culinary", "Wellness", "Photography"];
const DIFFICULTIES = ["easy", "moderate", "challenging"];
const CURRENCIES  = ["INR", "USD", "EUR"];

export default function ExperienceForm({ initialValues = {}, onSubmit, loading = false }) {
  const formRef = useRef(null);
  const [form, setForm] = useState({
    title:             initialValues.title             || "",
    slug:              initialValues.slug              || "",
    short_description: initialValues.short_description || "",
    description:       initialValues.description       || "",
    category:          initialValues.category          || "",
    difficulty:        initialValues.difficulty        || "easy",
    duration_hours:    initialValues.duration_hours    || "",
    duration_days:     initialValues.duration_days     || "",
    max_participants:  initialValues.max_participants  || 10,
    min_participants:  initialValues.min_participants  || 1,
    price_per_person:  initialValues.price_per_person  || "",
    currency:          initialValues.currency          || "INR",
    meeting_point:     initialValues.meeting_point     || "",
    included_items:    initialValues.included_items?.join("\n") || "",
    excluded_items:    initialValues.excluded_items?.join("\n") || "",
    languages:         initialValues.languages?.join(", ") || "",
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: "power3.out" }
      );
    }, formRef);
    return () => ctx.revert();
  }, []);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === "title" ? { slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      ...form,
      duration_hours:   form.duration_hours   ? Number(form.duration_hours)   : null,
      duration_days:    form.duration_days     ? Number(form.duration_days)    : null,
      max_participants: Number(form.max_participants),
      min_participants: Number(form.min_participants),
      price_per_person: Number(form.price_per_person),
      included_items:   form.included_items.split("\n").map(s => s.trim()).filter(Boolean),
      excluded_items:   form.excluded_items.split("\n").map(s => s.trim()).filter(Boolean),
      languages:        form.languages.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  const input = (label, name, type = "text", placeholder = "", required = false) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={update}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
      />
    </div>
  );

  const select = (label, name, options) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">{label}</label>
      <select
        name={name}
        value={form[name]}
        onChange={update}
        className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={typeof o === "object" ? o.value : o}>{typeof o === "object" ? o.label : o}</option>)}
      </select>
    </div>
  );

  const textarea = (label, name, rows = 3, placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">{label}</label>
      <textarea
        name={name}
        value={form[name]}
        onChange={update}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition resize-none"
      />
    </div>
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {input("Title", "title", "text", "Mask making workshop…", true)}
        {input("Slug", "slug", "text", "mask-making-workshop")}
      </div>

      {input("Short description", "short_description", "text", "One-line summary for cards…")}
      {textarea("Full description", "description", 5, "Describe the experience in detail…")}

      <div className="grid gap-4 sm:grid-cols-2">
        {select("Category", "category", CATEGORIES)}
        {select("Difficulty", "difficulty", DIFFICULTIES)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {input("Duration (hours)", "duration_hours", "number", "4")}
        {input("Duration (days)", "duration_days", "number", "2")}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {input("Min guests", "min_participants", "number")}
        {input("Max guests", "max_participants", "number")}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">Price per person</label>
          <div className="flex gap-2">
            <select name="currency" value={form.currency} onChange={update}
              className="rounded-[9px] border border-[#D9D0C2] bg-white px-2 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none">
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" name="price_per_person" value={form.price_per_person} onChange={update} required
              placeholder="1500"
              className="flex-1 rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition" />
          </div>
          {form.price_per_person > 0 && (
            <p className="mt-1 text-xs text-[#7A9285]">= {formatCurrency(Number(form.price_per_person))}</p>
          )}
        </div>
      </div>

      {input("Meeting point", "meeting_point", "text", "Majuli ferry ghat, Kamalabari")}
      {input("Languages", "languages", "text", "Assamese, English, Hindi")}

      <div className="grid gap-4 sm:grid-cols-2">
        {textarea("What's included (one per line)", "included_items", 4, "Local breakfast\nGuide fees\nTransport")}
        {textarea("Not included (one per line)", "excluded_items", 4, "Personal transport\nTravel insurance")}
      </div>

      <button type="submit" disabled={loading}
        className="w-full rounded-[9px] bg-[#1C3D2E] py-3 text-sm font-semibold text-white transition hover:bg-[#2A5940] disabled:opacity-60">
        {loading ? "Saving…" : "Save experience"}
      </button>
    </form>
  );
}