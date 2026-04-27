import { useState, useRef, useEffect } from "react";
import { Building2, MapPin, Globe, Phone, Mail, AlignLeft } from "lucide-react";
import { gsap } from "gsap";

// Fields match communityController.createCommunity / updateCommunity:
// name, slug, description, short_description,
// village, district, state, country,
// latitude, longitude,
// contact_email, contact_phone, website,
// languages_spoken, best_visit_season

export default function CommunityForm({ initialValues = {}, onSubmit, loading = false }) {
  const formRef = useRef(null);
  const [form, setForm] = useState({
    name:              initialValues.name              || "",
    slug:              initialValues.slug              || "",
    short_description: initialValues.short_description || "",
    description:       initialValues.description       || "",
    village:           initialValues.village           || "",
    district:          initialValues.district          || "",
    state:             initialValues.state             || "",
    country:           initialValues.country           || "India",
    contact_email:     initialValues.contact_email     || "",
    contact_phone:     initialValues.contact_phone     || "",
    website:           initialValues.website           || "",
    languages_spoken:  initialValues.languages_spoken  || "",
    best_visit_season: initialValues.best_visit_season || "",
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 18 },
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
      // Auto-generate slug from name
      ...(name === "name" ? { slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      ...form,
      languages_spoken: form.languages_spoken ? form.languages_spoken.split(",").map(s => s.trim()) : [],
    });
  };

  const field = (label, name, type = "text", icon, placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A9285]">{icon}</span>}
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={update}
          placeholder={placeholder}
          className={`w-full rounded-[9px] border border-[#D9D0C2] bg-white ${icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition`}
        />
      </div>
    </div>
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Community name", "name", "text", <Building2 size={14} />, "e.g. Majuli River Island")}
        {field("Slug (URL)", "slug", "text", null, "majuli-river-island")}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">Short description</label>
        <div className="relative">
          <AlignLeft size={14} className="absolute left-3 top-3 text-[#7A9285]" />
          <textarea
            name="short_description"
            value={form.short_description}
            onChange={update}
            rows={2}
            placeholder="One sentence about your community…"
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white pl-9 pr-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition resize-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">Full description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={update}
          rows={5}
          placeholder="Tell visitors what makes your community special…"
          className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition resize-none"
          required
        />
      </div>

      <div className="rounded-[9px] bg-[#FAF7F2] p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7A9285]">Location</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {field("Village", "village", "text", <MapPin size={14} />)}
          {field("District", "district")}
          {field("State", "state")}
        </div>
        {field("Country", "country")}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {field("Contact email", "contact_email", "email", <Mail size={14} />)}
        {field("Phone", "contact_phone", "tel", <Phone size={14} />)}
        {field("Website", "website", "url", <Globe size={14} />, "https://")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field("Languages spoken", "languages_spoken", "text", null, "Assamese, Hindi, English")}
        {field("Best visit season", "best_visit_season", "text", null, "Oct–Mar")}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[9px] bg-[#1C3D2E] py-3 text-sm font-semibold text-white transition hover:bg-[#2A5940] disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save community"}
      </button>
    </form>
  );
}