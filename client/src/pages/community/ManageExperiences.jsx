import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, CheckCircle, AlertCircle, MapPin, Clock, Tag, IndianRupee, X } from "lucide-react";
import PageShell from "../PageShell";
import experienceService from "../../services/experienceService";
import uploadService, { UPLOAD_FOLDERS } from "../../services/uploadService";

// ─── Field ────────────────────────────────────────────────────
function Field({ label, name, value, onChange, icon: Icon, type = "text", placeholder = "", required = false }) {
  return (
    <div className="group">
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8AFA4] group-focus-within:text-[#3E7A58] transition-colors pointer-events-none" />}
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
          className="w-full rounded-xl border border-[#E0D8CE] bg-white py-2.5 text-sm text-[#1A2820] focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]"
          style={{ paddingLeft: Icon ? "2.5rem" : "1rem", paddingRight: "1rem" }}
        />
      </div>
    </div>
  );
}

// ─── Cover uploader ───────────────────────────────────────────
function CoverUploader({ experienceId, currentUrl, currentImages = [], onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentUrl || "");
  const [gallery, setGallery] = useState(currentImages);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    if (!selected.length) return;
    const previewUrls = selected.map((file) => ({ image_url: URL.createObjectURL(file) }));
    setPreview(previewUrls[0].image_url);
    setGallery((prev) => [...previewUrls, ...(prev || [])].slice(0, 5));
    setUploading(true);
    try {
      if (experienceId) {
        const fd = new FormData();
        selected.forEach((file) => fd.append("images", file));
        const res = await experienceService.uploadImages(experienceId, fd);
        const images = res?.data?.images ?? res?.images ?? [];
        const url = images[0]?.image_url;
        if (url) onUploaded(url);
        if (images.length) {
          setGallery((prev) => [...images, ...(prev || []).filter((image) => !image.image_url?.startsWith("blob:"))].slice(0, 5));
        }
      } else {
        const res = await uploadService.uploadImages(selected, UPLOAD_FOLDERS.EXPERIENCE);
        const images = res?.data?.images ?? res?.images ?? [];
        const url = images[0]?.url;
        if (url) onUploaded(url);
      }
    } catch (err) {
      console.error("Experience image upload failed:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Experience Photos</label>
      <div onClick={() => inputRef.current?.click()}
        className="relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#D4C9BB] bg-[#F5F2EE] transition-all hover:border-[#3E7A58] hover:bg-[#EEF5F1]">
        {preview
          ? <img src={preview} alt="Cover" className="h-full w-full object-cover" />
          : <div className="flex flex-col items-center gap-1.5 text-[#9A9285]">
              <Upload size={20} />
              <p className="text-xs font-medium">Upload up to 5 photos</p>
            </div>
        }
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>
      {gallery.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {gallery.slice(0, 5).map((image, index) => (
            <img
              key={`${image.id || image.image_url}-${index}`}
              src={image.image_url}
              alt={`Experience ${index + 1}`}
              className="h-14 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  );
}

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

const EMPTY_FORM = { title: "", description: "", location: "", price: "", duration: "", category: "" };

// ─── Experience Form Panel ────────────────────────────────────
function ExperienceFormPanel({ editing, onSaved, onCancel }) {
  const [form,     setForm]     = useState(editing ? {
    title:       editing.title        ?? "",
    description: editing.description  ?? "",
    location:    editing.location     ?? "",
    price:       editing.price        ?? "",
    duration:    editing.duration     ?? "",
    category:    editing.category     ?? "",
  } : EMPTY_FORM);
  const [coverUrl, setCoverUrl] = useState(editing?.cover_image_url ?? editing?.cover_url ?? "");
  const [saving,   setSaving]   = useState(false);

  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        cover_url: coverUrl || undefined,
      };
      let saved;
      if (editing?.id) {
        const res = await experienceService.update(editing.id, payload);
        saved = res?.data?.experience ?? res?.experience ?? { ...editing, ...payload };
      } else {
        const res = await experienceService.create(payload);
        saved = res?.data?.experience ?? res?.experience ?? payload;
      }
      onSaved(saved, !!editing);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8E1D5] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1A2820]">{editing ? "Edit experience" : "New experience"}</h2>
        {editing && (
          <button type="button" onClick={onCancel} className="text-[#9A9285] hover:text-[#1A2820] transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <CoverUploader experienceId={editing?.id} currentUrl={coverUrl} currentImages={editing?.images || []} onUploaded={setCoverUrl} />

      <Field label="Title"       name="title"       value={form.title}       onChange={update} icon={Tag}        placeholder="e.g. Traditional weaving workshop" required />
      <Field label="Location"    name="location"    value={form.location}    onChange={update} icon={MapPin}     placeholder="e.g. Nagaland" />
      <Field label="Price (₹)"   name="price"       value={form.price}       onChange={update} icon={IndianRupee} type="number" placeholder="1800" />
      <Field label="Duration"    name="duration"    value={form.duration}    onChange={update} icon={Clock}      placeholder="e.g. 3 hours" />
      <Field label="Category"    name="category"    value={form.category}    onChange={update} icon={Tag}        placeholder="e.g. Craft, Food, Culture" />

      <div className="group">
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#9A9285] mb-2">Description</label>
        <textarea name="description" value={form.description} onChange={update} rows={4}
          placeholder="Describe the experience in detail…"
          className="w-full rounded-xl border border-[#E0D8CE] bg-white px-4 py-3 text-sm text-[#1A2820] resize-none focus:outline-none focus:border-[#3E7A58] focus:ring-2 focus:ring-[#3E7A58]/10 transition-all placeholder:text-[#C4B8A8]"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[#F2EDE4] hover:opacity-90 disabled:opacity-50 transition-all"
          style={{ background: "#1C3D2E" }}>
          {saving
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : <CheckCircle size={14} />}
          {editing ? "Save changes" : "Create"}
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

// ─── Experience Card ──────────────────────────────────────────
function ExperienceCard({ exp, onEdit, onDelete, deleting }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#E8E1D5] bg-white p-4 items-start">
      {(exp.images?.[0]?.image_url || exp.cover_image_url || exp.cover_url) ? (
        <img src={exp.images?.[0]?.image_url || exp.cover_image_url || exp.cover_url} alt={exp.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-[#E8F0EC] flex items-center justify-center shrink-0">
          <Tag size={20} className="text-[#3E7A58]" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1A2820] truncate">{exp.title}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-[#9A9285]">
          {exp.location  && <span className="flex items-center gap-1"><MapPin size={10} />{exp.location}</span>}
          {exp.price     && <span className="flex items-center gap-1"><IndianRupee size={10} />₹{Number(exp.price).toLocaleString("en-IN")}</span>}
          {exp.duration  && <span className="flex items-center gap-1"><Clock size={10} />{exp.duration}</span>}
          {exp.category  && <span className="flex items-center gap-1"><Tag size={10} />{exp.category}</span>}
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={() => onEdit(exp)}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E0D8CE] text-[#9A9285] hover:border-[#3E7A58] hover:text-[#3E7A58] transition-all">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(exp.id)} disabled={deleting === exp.id}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E0D8CE] text-[#9A9285] hover:border-red-400 hover:text-red-500 transition-all disabled:opacity-40">
          {deleting === exp.id
            ? <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  );
}

export default function ManageExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [editing,     setEditing]     = useState(null);   // null = create mode, object = edit mode
  const [showForm,    setShowForm]    = useState(false);
  const [deleting,    setDeleting]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [toast,       setToast]       = useState(null);

  useEffect(() => {
    experienceService.list("mine=true")
      .then(res => {
        const list = res?.data?.experiences ?? res?.experiences ?? res ?? [];
        setExperiences(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (saved, wasEditing) => {
    if (wasEditing) {
      setExperiences(prev => prev.map(e => e.id === saved.id ? saved : e));
      setToast({ type: "success", message: "Experience updated!", key: Date.now() });
    } else {
      setExperiences(prev => [saved, ...prev]);
      setToast({ type: "success", message: "Experience created!", key: Date.now() });
    }
    setEditing(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this experience?")) return;
    setDeleting(id);
    try {
      await experienceService.remove(id);
      setExperiences(prev => prev.filter(e => e.id !== id));
      setToast({ type: "success", message: "Experience deleted.", key: Date.now() });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Delete failed.", key: Date.now() });
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (exp) => { setEditing(exp); setShowForm(true); };
  const openCreate = () => { setEditing(null); setShowForm(true); };
  const closeForm = () => { setEditing(null); setShowForm(false); };

  return (
    <PageShell title="Manage Experiences" subtitle="Create and edit packages for travellers">

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={14} />{error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* ── Left: form ── */}
        <div>
          {showForm ? (
            <ExperienceFormPanel editing={editing} onSaved={handleSaved} onCancel={closeForm} />
          ) : (
            <button onClick={openCreate}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D4C9BB] bg-white py-8 text-sm font-semibold text-[#9A9285] transition-all hover:border-[#3E7A58] hover:text-[#3E7A58] hover:bg-[#EEF5F1]">
              <Plus size={16} /> Add new experience
            </button>
          )}
        </div>

        {/* ── Right: list ── */}
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#E8E1D5]" />)
          ) : experiences.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E1D5] bg-white py-16 text-center">
              <Tag size={28} className="text-[#D4C9BB] mb-3" />
              <p className="text-sm font-medium text-[#9A9285]">No experiences yet</p>
              <p className="text-xs text-[#B8AFA4] mt-1">Create your first listing to get started</p>
            </div>
          ) : (
            experiences.map(exp => (
              <ExperienceCard key={exp.id} exp={exp} onEdit={openEdit} onDelete={handleDelete} deleting={deleting} />
            ))
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onDone={() => setToast(null)} />}
    </PageShell>
  );
}
