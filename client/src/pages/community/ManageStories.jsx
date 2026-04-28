import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, CheckCircle, AlertCircle, BookOpen, Calendar, X, Eye } from "lucide-react";
import PageShell from "../PageShell";
import storyService from "../../services/storyService";
import uploadService, { UPLOAD_FOLDERS } from "../../services/uploadService";

// ─── Toast ────────────────────────────────────────────────────
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

// ─── Cover uploader ───────────────────────────────────────────
function CoverUploader({ storyId, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentUrl || "");
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      if (storyId) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await storyService.updateCover(storyId, fd);
        const url = res?.data?.cover_url ?? res?.cover_url;
        if (url) onUploaded(url);
      } else {
        const res = await uploadService.uploadImage(file, UPLOAD_FOLDERS.STORY);
        const url = res?.data?.url ?? res?.url;
        if (url) onUploaded(url);
      }
    } catch (err) {
      console.error("Cover upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Cover Image</label>
      <div onClick={() => inputRef.current?.click()}
        className="relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#D4C9BB] bg-[#F5F2EE] transition-all hover:border-[#3E7A58] hover:bg-[#EEF5F1]">
        {preview
          ? <img src={preview} alt="Cover" className="h-full w-full object-cover" />
          : <div className="flex flex-col items-center gap-1.5 text-[#9A9285]">
              <Upload size={20} />
              <p className="text-xs font-medium">Upload cover image</p>
            </div>
        }
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Story form panel ─────────────────────────────────────────
function StoryFormPanel({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title:   editing?.title   ?? "",
    excerpt: editing?.excerpt ?? "",
    content: editing?.content ?? "",
    tags:    editing?.tags?.join(", ") ?? "",
  });
  const [coverUrl, setCoverUrl] = useState(editing?.cover_url ?? "");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title:     form.title.trim(),
        excerpt:   form.excerpt.trim(),
        body:      form.content.trim(),
        tags:      form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        cover_url: coverUrl || undefined,
      };
      
      if (!editing?.id) {
        payload.slug = form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }

      let saved;
      if (editing?.id) {
        const res = await storyService.update(editing.id, payload);
        saved = res?.data?.story ?? res?.story ?? { ...editing, ...payload };
      } else {
        const res = await storyService.create(payload);
        saved = res?.data?.story ?? res?.story ?? payload;
      }
      onSaved(saved, !!editing);
    } catch (err) {
      console.error(err);
      if (err.errors && Array.isArray(err.errors)) {
        setError(`Validation failed: ${err.errors.map(e => e.message).join(", ")}`);
      } else {
        setError(err?.response?.data?.message ?? err?.message ?? "Failed to save story.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8E1D5] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1A2820]">{editing ? "Edit story" : "Write a story"}</h2>
        {editing && (
          <button type="button" onClick={onCancel} className="text-[#9A9285] hover:text-[#1A2820] transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ backgroundColor: "#5C1A1A", color: "#F2EDE4" }}>
          {error}
        </div>
      )}
      <CoverUploader storyId={editing?.id} currentUrl={coverUrl} onUploaded={setCoverUrl} />

      <div className="group">
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Title <span className="text-red-400">*</span></label>
        <input type="text" name="title" value={form.title} onChange={update} required
          placeholder="e.g. A harvest song at dusk"
          className="w-full rounded-xl border border-[#E0D8CE] bg-white px-4 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]"
        />
      </div>

      <div className="group">
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Excerpt</label>
        <input type="text" name="excerpt" value={form.excerpt} onChange={update}
          placeholder="One-line summary shown in feeds…"
          className="w-full rounded-xl border border-[#E0D8CE] bg-white px-4 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]"
        />
      </div>

      <div className="group">
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Content</label>
        <textarea name="content" value={form.content} onChange={update} rows={7}
          placeholder="Share the full story…"
          className="w-full rounded-xl border border-[#E0D8CE] bg-white px-4 py-3 text-sm text-[#1A2820] resize-none focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]"
        />
      </div>

      <div className="group">
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Tags <span className="font-normal text-[#B8AFA4]">(comma separated)</span></label>
        <input type="text" name="tags" value={form.tags} onChange={update}
          placeholder="culture, harvest, tradition"
          className="w-full rounded-xl border border-[#E0D8CE] bg-white px-4 py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[#F2EDE4] hover:opacity-90 disabled:opacity-50 transition-all"
          style={{ background: "#1C3D2E" }}>
          {saving
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : <CheckCircle size={14} />}
          {editing ? "Save changes" : "Publish story"}
        </button>
        {editing && (
          <button type="button" onClick={onCancel}
            className="rounded-xl border border-[#E0D8CE] px-4 py-2.5 text-sm font-medium text-[#9A9285] hover:bg-[#F5F2EE] transition-all">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Story card ───────────────────────────────────────────────
function StoryCard({ story, onEdit, onDelete, deleting }) {
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
  const tags = Array.isArray(story.tags) ? story.tags : [];

  return (
    <div className="rounded-2xl border border-[#E8E1D5] bg-white overflow-hidden flex flex-col sm:flex-row">
      {story.cover_url ? (
        <img src={story.cover_url} alt={story.title}
          className="h-32 w-full object-cover sm:h-auto sm:w-28 shrink-0" />
      ) : (
        <div className="h-32 sm:h-auto sm:w-28 shrink-0 bg-[#E8F0EC] flex items-center justify-center">
          <BookOpen size={24} className="text-[#3E7A58]" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-[#1A2820] truncate">{story.title}</p>
          {story.excerpt && <p className="mt-1 text-xs text-[#9A9285] line-clamp-2">{story.excerpt}</p>}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.slice(0, 4).map(t => (
                <span key={t} className="rounded-full bg-[#E8F0EC] px-2 py-0.5 text-xs font-medium text-[#3E7A58]">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-[#B8AFA4]">
            <Calendar size={10} />{fmtDate(story.created_at)}
          </span>
          <div className="flex gap-1.5">
            {story.slug && (
              <a href={`/stories/${story.slug}`} target="_blank" rel="noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#E0D8CE] text-[#9A9285] hover:border-[#3E7A58] hover:text-[#3E7A58] transition-all">
                <Eye size={12} />
              </a>
            )}
            <button onClick={() => onEdit(story)}
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#E0D8CE] text-[#9A9285] hover:border-[#3E7A58] hover:text-[#3E7A58] transition-all">
              <Pencil size={12} />
            </button>
            <button onClick={() => onDelete(story.id)} disabled={deleting === story.id}
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#E0D8CE] text-[#9A9285] hover:border-red-400 hover:text-red-500 transition-all disabled:opacity-40">
              {deleting === story.id
                ? <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                : <Trash2 size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageStories() {
  const [stories,  setStories]  = useState([]);
  const [editing,  setEditing]  = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [toast,    setToast]    = useState(null);

  useEffect(() => {
    storyService.getMyCommunityStories()
      .then(res => {
        const list = res?.data?.stories ?? res?.stories ?? res ?? [];
        setStories(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (saved, wasEditing) => {
    if (wasEditing) {
      setStories(prev => prev.map(s => s.id === saved.id ? saved : s));
      setToast({ type: "success", message: "Story updated!", key: Date.now() });
    } else {
      setStories(prev => [saved, ...prev]);
      setToast({ type: "success", message: "Story published!", key: Date.now() });
    }
    setEditing(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this story?")) return;
    setDeleting(id);
    try {
      await storyService.remove(id);
      setStories(prev => prev.filter(s => s.id !== id));
      setToast({ type: "success", message: "Story deleted.", key: Date.now() });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Delete failed.", key: Date.now() });
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (story) => { setEditing(story); setShowForm(true); };
  const openCreate = () => { setEditing(null); setShowForm(true); };
  const closeForm = () => { setEditing(null); setShowForm(false); };

  return (
    <PageShell title="Manage Stories" subtitle="Publish cultural stories from your community">

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} />{error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* ── Left: editor ── */}
        <div>
          {showForm ? (
            <StoryFormPanel editing={editing} onSaved={handleSaved} onCancel={closeForm} />
          ) : (
            <button onClick={openCreate}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D4C9BB] bg-white py-8 text-sm font-semibold text-[#9A9285] transition-all hover:border-[#3E7A58] hover:text-[#3E7A58] hover:bg-[#EEF5F1]">
              <Plus size={16} /> Write a new story
            </button>
          )}
        </div>

        {/* ── Right: story list ── */}
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#E8E1D5]" />)
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E1D5] bg-white py-16 text-center">
              <BookOpen size={28} className="text-[#D4C9BB] mb-3" />
              <p className="text-sm font-medium text-[#9A9285]">No stories yet</p>
              <p className="text-xs text-[#B8AFA4] mt-1">Share your community's culture with the world</p>
            </div>
          ) : (
            stories.map(s => (
              <StoryCard key={s.id} story={s} onEdit={openEdit} onDelete={handleDelete} deleting={deleting} />
            ))
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onDone={() => setToast(null)} />}
    </PageShell>
  );
}