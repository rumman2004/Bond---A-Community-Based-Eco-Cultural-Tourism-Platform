import { useState, useRef, useEffect } from "react";
import { BookOpen, Tag, Eye, EyeOff, Save } from "lucide-react";
import { gsap } from "gsap";
import storyService from "../../../services/storyService";

// Backend fields from storyController.createStory / updateStory:
// title, slug, body, excerpt, tags (array)
// status: 'draft' | 'published' | 'archived'

export default function StoryEditor({ initialValues = {}, onSuccess, onCancel }) {
  const formRef    = useRef(null);
  const previewRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm] = useState({
    title:   initialValues.title   || "",
    slug:    initialValues.slug    || "",
    excerpt: initialValues.excerpt || "",
    body:    initialValues.body    || initialValues.content || "",
    tags:    initialValues.tags?.join(", ") || "",
    status:  initialValues.status  || "draft",
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 14 },
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

  const togglePreview = () => {
    setPreview((v) => !v);
    if (!preview && previewRef.current) {
      gsap.fromTo(previewRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  };

  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.body.trim())  { setError("Story body is required."); return; }
    setError("");
    setLoading(true);

    const payload = {
      title:   form.title,
      slug:    form.slug,
      excerpt: form.excerpt,
      body:    form.body,
      tags:    form.tags.split(",").map(t => t.trim()).filter(Boolean),
      status:  publishNow ? "published" : form.status,
    };

    try {
      if (initialValues.id) {
        // storyService.update → PATCH /stories/:id
        await storyService.update(initialValues.id, payload);
      } else {
        // storyService.create → POST /stories
        await storyService.create(payload);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to save story.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = form.body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
            Story title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={update}
            placeholder="The Masks That Speak…"
            required
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-base font-semibold text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition"
            style={{ fontFamily: "var(--font-display)" }}
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">Slug</label>
          <input name="slug" value={form.slug} onChange={update} placeholder="the-masks-that-speak"
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm font-mono text-[#7A9285] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition" />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">Excerpt</label>
          <textarea name="excerpt" value={form.excerpt} onChange={update} rows={2}
            placeholder="Short teaser shown on story cards…"
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition resize-none" />
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3D5448]">Full story</label>
            <button type="button" onClick={togglePreview}
              className="flex items-center gap-1 text-xs text-[#3E7A58] hover:underline">
              {preview ? <><EyeOff size={12} /> Hide preview</> : <><Eye size={12} /> Preview</>}
            </button>
          </div>
          <textarea name="body" value={form.body} onChange={update} rows={12} required
            placeholder="Every year as the floods recede from Majuli…"
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition resize-none leading-relaxed" />
          <p className="mt-1 text-right text-xs text-[#7A9285]">{wordCount} words</p>
        </div>

        {/* Tags */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3D5448] mb-1.5">
            <Tag size={11} /> Tags
          </label>
          <input name="tags" value={form.tags} onChange={update}
            placeholder="tradition, craft, Assam, textile"
            className="w-full rounded-[9px] border border-[#D9D0C2] bg-white px-3 py-2.5 text-sm text-[#1A2820] focus:border-[#3E7A58] focus:outline-none focus:ring-2 focus:ring-[#3E7A58]/20 transition" />
          <p className="mt-1 text-xs text-[#7A9285]">Separate tags with commas</p>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-[9px] bg-[#FFF0EC] border border-[#D4735A]/30 px-3 py-2 text-sm text-[#D4735A]">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-1">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="rounded-[9px] border border-[#D9D0C2] px-4 py-2.5 text-sm font-medium text-[#3D5448] hover:bg-[#FAF7F2] transition">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 rounded-[9px] border border-[#D9D0C2] px-4 py-2.5 text-sm font-medium text-[#3D5448] hover:bg-[#FAF7F2] transition disabled:opacity-60">
            <Save size={14} /> {loading ? "Saving…" : "Save draft"}
          </button>
          <button type="button" disabled={loading}
            onClick={(e) => handleSubmit(e, true)}
            className="flex items-center gap-2 rounded-[9px] bg-[#1C3D2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2A5940] transition disabled:opacity-60">
            <BookOpen size={14} /> {loading ? "Publishing…" : "Publish story"}
          </button>
        </div>
      </form>

      {/* Live preview */}
      {preview && (
        <div ref={previewRef}
          className="rounded-[14px] border border-[#D9D0C2] bg-white p-6 overflow-y-auto max-h-[600px]">
          <p className="text-xs uppercase tracking-wider text-[#7A9285] mb-4">Preview</p>
          <h2 className="font-display text-3xl text-[#1A2820] leading-tight mb-3">
            {form.title || "Untitled story"}
          </h2>
          {form.excerpt && (
            <p className="text-[#7A9285] italic border-l-2 border-[#A8CCBA] pl-3 mb-4 text-sm">{form.excerpt}</p>
          )}
          <div className="text-[#3D5448] text-sm leading-8 whitespace-pre-wrap">
            {form.body || <span className="text-[#D9D0C2]">Start writing to see preview…</span>}
          </div>
          {form.tags && (
            <div className="mt-6 flex flex-wrap gap-2">
              {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                <span key={t} className="rounded-full bg-[#F2EDE4] px-3 py-1 text-xs text-[#3D5448]">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}