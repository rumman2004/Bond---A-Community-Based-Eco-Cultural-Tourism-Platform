// ============================================================
// pages/community/CommunityRegistration.jsx
// Multi-step community registration wizard (Steps 1–4)
// ✓ Resumes saved data on page reload
// ✓ Offering images upload in background; required ID document upload blocks Step 2
// ✓ Shows "Verification in Progress" screen after submission
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Loader2,
  Shield, Clock, Search, Bell, ArrowRight, FileCheck,
} from "lucide-react";
import communityService from "../../services/communityService";
import { WIZARD_STEPS } from "../../utils/verificationConstants";
import {
  Step1BasicInfo,
  Step2TeamAndDocs,
  Step3Offerings,
  Step4Consent,
} from "./CommunityRegistrationSteps";

// ─── Progress stepper ─────────────────────────────────────────
function Stepper({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {WIZARD_STEPS.map((step, idx) => {
        const done   = current > step.num;
        const active = current === step.num;
        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all
                ${done   ? "bg-[#3E7A58] text-white"
                : active ? "bg-[#1C3D2E] text-white shadow-lg shadow-[#1C3D2E]/30"
                         : "bg-[#F0EBE3] text-[#9A9285]"}`}>
                {done ? "✓" : step.icon}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap
                ${active ? "text-[#1C3D2E]" : done ? "text-[#3E7A58]" : "text-[#B8AFA4]"}`}>
                {step.label}
              </span>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all
                ${current > step.num ? "bg-[#3E7A58]" : "bg-[#E8E1D5]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ type, message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  const ok = type === "success";
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-xl animate-[slideUp_0.3s_ease]"
      style={{ background: ok ? "#1C3D2E" : "#5C1A1A", color: "#F2EDE4" }}>
      {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {message}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", short_description: "", description: "",
  village: "", district: "", state: "", country: "India",
  pincode: "", best_visit_season: "",
};

export default function CommunityRegistration() {
  const navigate = useNavigate();

  const [step,      setStep]      = useState(1);
  const [commId,    setCommId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);  // true after consent or on resume
  const [communityData, setCommunityData] = useState(null); // for status screen

  // Upload tracking
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  // Step 1 state
  const [form,      setForm]      = useState(EMPTY_FORM);

  // Step 2 state
  const [members,   setMembers]   = useState([{ full_name: "", phone: "", role: "", is_owner: true }]);
  const [docFiles,  setDocFiles]  = useState([]);
  const [savedDocs, setSavedDocs] = useState([]);

  // Step 3 state
  const [offerings, setOfferings] = useState([]);

  // Step 4 state
  const [accepted,  setAccepted]  = useState(false);

  // Ref to track commId in async callbacks
  const commIdRef = useRef(null);
  useEffect(() => { commIdRef.current = commId; }, [commId]);

  // ── Resume: fetch existing community + verification data ────
  useEffect(() => {
    let cancelled = false;

    communityService.getOwn()
      .then(async (res) => {
        const c = res?.data?.community ?? res?.community;
        if (!c || cancelled) { setLoading(false); return; }

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

        // If already submitted, show verification status screen
        if (c.consent_accepted_at) {
          setCommunityData(c);
          setSubmitted(true);
          setLoading(false);
          return;
        }

        // Fetch verification data for resume (only if we have a valid id)
        if (c.id) {
          try {
            const vRes = await communityService.getVerificationData(c.id);
            const v = vRes?.data ?? {};

          if (v.members?.length > 0) {
            setMembers(v.members.map((m) => ({
              full_name: m.full_name ?? "",
              phone:     m.phone ?? "",
              role:      m.role ?? "",
              is_owner:  m.is_owner ?? false,
            })));
          }

          if (v.documents?.length > 0) setSavedDocs(v.documents);

          if (v.offerings?.length > 0) {
            setOfferings(v.offerings.map((o) => ({
              category:     o.category ?? "",
              custom_label: o.custom_label ?? "",
              description:  o.description ?? "",
              imageFiles:   [],
              savedImages:  o.images || [],
            })));
          }

          if (v.consent) setAccepted(true);
          } catch { /* no verification data yet */ }
        }

        const resumeStep = Math.max(1, Math.min(c.registration_step ?? 1, 4));
        if (!cancelled) setStep(resumeStep);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Validation ───────────────────────────────────────────────
  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.name.trim())        errs.name        = "Community name is required";
      if (!form.description.trim()) errs.description = "Description is required";
      if (!form.village.trim())     errs.village     = "Village is required";
      if (!form.state)              errs.state       = "State is required";
    }
    if (step === 2) {
      const hasInvalid = members.some((m) => !m.full_name.trim() || !m.phone.trim());
      if (hasInvalid) errs.members = "All members must have a name and phone number";
      if (docFiles.length === 0 && savedDocs.length === 0) errs.doc = "Please upload at least one ID document";
    }
    if (step === 3) {
      if (offerings.length === 0) errs.offerings = "Please add at least one offering";
      const hasNoCategory = offerings.some((o) => !o.category);
      if (hasNoCategory) errs.offerings = "All offerings must have a category selected";
    }
    if (step === 4) {
      if (!accepted) errs.consent = "You must accept the terms and conditions";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Required ID document uploader ───────────────────────────
  const uploadDocumentsNow = async (currentCommId, files) => {
    if (!currentCommId) throw new Error("Community profile is not ready yet. Please save Step 1 again.");
    if (!files || files.length === 0) return null;

    setUploading(true);
    setUploadMsg(`Uploading ${files.length} document(s)...`);

    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("document", f));
      fd.append("doc_type", "id_bundle");

      const res = await communityService.uploadDocument(currentCommId, fd);
      const newDocs = res?.data?.documents || [];

      setSavedDocs((prev) => [...newDocs, ...prev]);
      setDocFiles([]);
      return newDocs;
    } finally {
      setUploading(false);
      setUploadMsg("");
    }
  };

  // ── Background image uploader (doesn't block step transition) ─
  const uploadFilesInBackground = (currentCommId, stepNum, files) => {
    setUploading(true);

    const tasks = [];

    // Step 3: upload offering images
    if (stepNum === 3 && files.offeringImages?.length > 0) {
      setUploadMsg(`Uploading ${files.offeringImages.reduce((n, o) => n + o.files.length, 0)} image(s)…`);
      for (const { offeringId, files: imageFiles } of files.offeringImages) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("images", f));
        tasks.push(communityService.uploadOfferingImages(currentCommId, offeringId, fd));
      }
    }

    if (tasks.length === 0) {
      setUploading(false);
      return;
    }

    Promise.all(tasks)
      .then(() => {
        setToast({ type: "success", message: "✓ Files uploaded successfully", key: Date.now() });
        // Clear imageFiles from offerings state
        if (stepNum === 3) {
          setOfferings((prev) => prev.map((o) => ({ ...o, imageFiles: [] })));
        }
      })
      .catch((err) => {
        setToast({ type: "error", message: "File upload failed — you can re-upload later.", key: Date.now() });
        console.error("Background upload error:", err);
      })
      .finally(() => {
        setUploading(false);
        setUploadMsg("");
      });
  };

  // ── Next handler ─────────────────────────────────────────────
  const handleNext = async () => {
    if (!validateStep()) return;
    setSaving(true);
    setErrors({});

    try {
      // ── Step 1 → create / update community ──────────────────
      if (step === 1) {
        const payload = {
          ...form,
          slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        };
        if (commId) {
          await communityService.update(commId, payload);
        } else {
          const res = await communityService.create(payload);
          const created = res?.data?.community ?? res?.community;
          if (created?.id) setCommId(created.id);
          else throw new Error("Failed to create community");
        }
      }

      // ── Step 2 → save members, then upload required ID doc before continuing
      if (step === 2) {
        if (!commId) throw new Error("Community profile is not ready yet. Please save Step 1 again.");
        await communityService.saveMembers(commId, members);

        if (docFiles.length > 0) {
          await uploadDocumentsNow(commId, docFiles);
          setToast({ type: "success", message: "✓ ID documents uploaded and saved", key: Date.now() });
        }
      }

      // ── Step 3 → save offerings (fast), upload images in background
      if (step === 3) {
        const offeringPayload = offerings.map(({ category, custom_label, description }) => ({
          category, custom_label, description,
        }));
        const res = await communityService.saveOfferings(commId, offeringPayload);
        const savedOffs = res?.data?.offerings ?? [];

        // Collect any new image files to upload
        const offeringImages = [];
        savedOffs.forEach((saved, idx) => {
          const imageFiles = offerings[idx]?.imageFiles || [];
          if (imageFiles.length > 0) {
            offeringImages.push({ offeringId: saved.id, files: imageFiles });
          }
        });

        if (offeringImages.length > 0) {
          uploadFilesInBackground(commId, 3, { offeringImages });
        }
      }

      // ── Step 4 → record consent → show status screen ────────
      if (step === 4) {
        await communityService.recordConsent(commId);
        setCommunityData({ ...form, id: commId, consent_accepted_at: new Date().toISOString() });
        setSubmitted(true);
        setSaving(false);
        return;
      }

      setSaving(false);
      setStep((s) => s + 1);
      setToast({ type: "success", message: "✓ Saved", key: Date.now() });
    } catch (err) {
      setSaving(false);
      setUploading(false);
      setUploadMsg("");
      setToast({ type: "error", message: err?.response?.data?.message || err?.message || "Something went wrong.", key: Date.now() });
    }
  };

  // ── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#6B7C6E]">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm font-medium">Loading your registration data…</p>
        </div>
      </div>
    );
  }

  // ── Submitted / Verification in Progress screen ─────────────
  if (submitted) {
    const submittedDate = communityData?.consent_accepted_at
      ? new Date(communityData.consent_accepted_at).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    const communityName = communityData?.name || form.name || "Your community";
    const status = communityData?.verification_status || communityData?.status || "pending";

    return (
      <div className="min-h-screen bg-[#F5F2EE] py-10 px-4">
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(0.9); opacity: 0.7; }
            50% { transform: scale(1.15); opacity: 0; }
            100% { transform: scale(0.9); opacity: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}</style>

        <div className="max-w-xl mx-auto">
          {/* Hero card */}
          <div className="rounded-3xl border border-[#E8E1D5] bg-white shadow-sm p-8 md:p-10 text-center">

            {/* Animated shield */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-[#3E7A58]/10"
                style={{ animation: "pulse-ring 2s ease-in-out infinite" }} />
              <div className="absolute inset-2 rounded-full bg-[#3E7A58]/15"
                style={{ animation: "pulse-ring 2s ease-in-out infinite 0.3s" }} />
              <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-[#3E7A58] to-[#1C3D2E] shadow-lg shadow-[#3E7A58]/30"
                style={{ animation: "float 3s ease-in-out infinite" }}>
                <Shield size={36} className="text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[#1A2820] mb-2">Verification in Progress</h1>
            <p className="text-sm text-[#6B7C6E] max-w-sm mx-auto leading-relaxed">
              <strong className="text-[#1A2820]">{communityName}</strong> has been submitted for security review. Our team will verify your details shortly.
            </p>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 mt-5 rounded-full px-4 py-2"
              style={{ background: status === "verified" ? "#D1FAE5" : status === "rejected" ? "#FEE2E2" : "#FEF3C7" }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: status === "verified" ? "#10B981" : status === "rejected" ? "#EF4444" : "#F59E0B" }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{ background: status === "verified" ? "#10B981" : status === "rejected" ? "#EF4444" : "#F59E0B" }} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider"
                style={{ color: status === "verified" ? "#065F46" : status === "rejected" ? "#991B1B" : "#92400E" }}>
                {status === "verified" ? "Verified" : status === "rejected" ? "Rejected" : "Under Review"}
              </span>
            </div>

            {/* Submitted date */}
            <p className="mt-4 text-xs text-[#9A9285]">
              Submitted on {submittedDate}
            </p>
          </div>

          {/* What happens next timeline */}
          <div className="mt-6 rounded-3xl border border-[#E8E1D5] bg-white shadow-sm p-6 md:p-8">
            <h2 className="text-sm font-bold text-[#1A2820] uppercase tracking-wider mb-5">What happens next?</h2>

            <div className="space-y-0">
              {[
                {
                  icon: FileCheck, color: "#3E7A58", bg: "#D1FAE5",
                  title: "Application Received",
                  desc: "Your registration details, team info, ID documents, and offerings have been submitted.",
                  done: true,
                },
                {
                  icon: Search, color: "#D97706", bg: "#FEF3C7",
                  title: "Security Review",
                  desc: "Our security team will verify your identity documents and community details within 2–3 business days.",
                  done: false, active: true,
                },
                {
                  icon: Bell, color: "#6B7280", bg: "#F3F4F6",
                  title: "Notification",
                  desc: "You'll receive an email and dashboard notification once the review is complete.",
                  done: false,
                },
                {
                  icon: CheckCircle, color: "#6B7280", bg: "#F3F4F6",
                  title: "Go Live!",
                  desc: "Once approved, your community will be visible to travellers and you can start creating experiences.",
                  done: false,
                },
              ].map((item, idx, arr) => (
                <div key={idx} className="flex gap-4">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                      style={{ background: item.bg }}>
                      <item.icon size={16} style={{ color: item.color }} />
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="w-0.5 flex-1 my-1 rounded-full"
                        style={{ background: item.done ? "#3E7A58" : "#E8E1D5" }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-5 ${idx === arr.length - 1 ? "pb-0" : ""}`}>
                    <p className={`text-sm font-semibold ${item.done ? "text-[#3E7A58]" : item.active ? "text-[#92400E]" : "text-[#6B7C6E]"}`}>
                      {item.title}
                      {item.done && <span className="ml-1.5 text-xs">✓</span>}
                      {item.active && <span className="ml-1.5 text-xs font-normal text-amber-500">(in progress)</span>}
                    </p>
                    <p className="text-xs text-[#9A9285] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/community"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#1C3D2E" }}>
              Go to Dashboard <ArrowRight size={14} />
            </Link>
            <Link to="/community/profile"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#E0D8CE] px-5 py-3 text-sm font-medium text-[#6B7C6E] hover:bg-white transition-all">
              Edit Profile
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-[#B8AFA4]">
            Questions? Contact support at bond-support@example.com
          </p>
        </div>
      </div>
    );
  }

  const isLastStep = step === 4;

  return (
    <div className="min-h-screen bg-[#F5F2EE] py-10 px-4">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A2820]">Community Registration</h1>
          <p className="text-sm text-[#6B7C6E] mt-1">
            Complete all steps to submit your community for verification.
          </p>
        </div>

        <Stepper current={step} />

        {/* Background upload indicator */}
        {uploading && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Loader2 size={14} className="animate-spin shrink-0" />
            <span className="font-medium">{uploadMsg || "Uploading files in background…"}</span>
            <span className="text-xs text-amber-600 ml-auto">You can continue filling the next step</span>
          </div>
        )}

        {/* Step card */}
        <div className="rounded-3xl border border-[#E8E1D5] bg-white shadow-sm p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-[#F0EBE3]">
            <h2 className="text-lg font-bold text-[#1A2820]">
              Step {step} — {WIZARD_STEPS[step - 1]?.label}
            </h2>
            <p className="text-xs text-[#9A9285] mt-0.5">
              {step === 1 && "Basic information about your community"}
              {step === 2 && "List all team members and upload their ID documents"}
              {step === 3 && "Tell us what your community can offer to travellers"}
              {step === 4 && "Review and accept the terms before submitting"}
            </p>
          </div>

          {step === 1 && <Step1BasicInfo form={form} setForm={setForm} errors={errors} />}
          {step === 2 && (
            <Step2TeamAndDocs
              members={members} setMembers={setMembers}
              docFiles={docFiles} setDocFiles={setDocFiles}
              savedDocs={savedDocs}
              errors={errors}
            />
          )}
          {step === 3 && <Step3Offerings offerings={offerings} setOfferings={setOfferings} errors={errors} />}
          {step === 4 && <Step4Consent accepted={accepted} setAccepted={setAccepted} errors={errors} />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#F0EBE3]">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 rounded-xl border border-[#E0D8CE] px-5 py-2.5 text-sm font-medium text-[#6B7C6E] hover:bg-[#F5F2EE] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={15} /> Back
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#B8AFA4]">{step} of {WIZARD_STEPS.length}</span>
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#1C3D2E" }}>
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : isLastStep
                    ? <><CheckCircle size={14} /> Submit for Review</>
                    : <>Next <ChevronRight size={14} /></>}
              </button>
            </div>
          </div>
        </div>

        {commId && step > 1 && (
          <p className="mt-3 text-center text-xs text-[#9A9285]">
            ✓ Progress is saved. You can close and resume anytime.
          </p>
        )}
      </div>

      {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onDone={() => setToast(null)} />}
    </div>
  );
}
