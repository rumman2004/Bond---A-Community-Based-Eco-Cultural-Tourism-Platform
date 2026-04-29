import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { CheckCircle, AlertCircle, Calendar, Users, ArrowRight, Shield, MapPin, Star, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import bookingService from "../../services/bookingService";
import experienceService from "../../services/experienceService";
import PageShell from "../PageShell";

export default function ConfirmBooking() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [idFile, setIdFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const date = state?.date || new Date().toISOString().split("T")[0];
  const guests = state?.guests || 2;

  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [loading]);

  useEffect(() => {
    const fetchExp = async () => {
      try {
        const res = await experienceService.getById(id);
        setExp(res?.data?.experience || res?.experience);
      } catch (err) {
        setError(err.message || "Failed to load experience details.");
      } finally {
        setLoading(false);
      }
    };
    fetchExp();
  }, [id]);

  const handleConfirm = async () => {
    if (!idFile) {
      setError("Please upload a photo copy of your ID to confirm this booking.");
      return;
    }
    setConfirming(true);
    try {
      const formData = new FormData();
      formData.append("experience_id", id);
      formData.append("booking_date", date);
      formData.append("num_guests", guests);
      formData.append("special_requests", "");
      formData.append("document", idFile);

      await bookingService.create(formData);
      navigate("/tourist/bookings");
    } catch (err) {
      setError(err.message || "Failed to confirm booking.");
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#3E7A58]/30 border-t-[#3E7A58]" />
        </div>
      </PageShell>
    );
  }

  if (error && !exp) {
    return (
      <PageShell>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] text-[#5C1A1A] gap-3">
          <AlertCircle size={32} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => navigate(-1)} className="text-xs underline mt-2">Go back</button>
        </div>
      </PageShell>
    );
  }

  const pricePerPerson = parseFloat(exp?.price_per_person) || 0;
  const totalAmount = pricePerPerson * guests;

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] px-4 pt-28 pb-16 flex items-start justify-center">
        <div ref={cardRef} className="max-w-4xl w-full bg-white rounded-[24px] border border-[#E8E1D5] p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Details & ID Proof */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1A2820]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Confirm Booking
              </h1>
              <p className="text-sm text-[#7A9285] mt-1">Review details before starting your journey</p>
            </div>

            {/* Experience snapshot */}
            <div className="bg-[#FAF7F2] rounded-[18px] p-4 border border-[#E8E1D5] mb-5 flex gap-4">
              {exp?.cover_image_url ? (
                <img src={exp.cover_image_url} alt={exp.title} className="w-20 h-20 object-cover rounded-[12px] border border-[#E0D8CE]" />
              ) : (
                <div className="w-20 h-20 bg-[#D4E6DC] text-[#3E7A58] rounded-[12px] flex items-center justify-center border border-[#E0D8CE]">
                  <MapPin size={24} />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-xs font-semibold text-[#3E7A58] uppercase tracking-wide">{exp?.category || "Cultural"}</span>
                <h3 className="text-base font-semibold text-[#1A2820] mt-0.5 line-clamp-2">{exp?.title}</h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-[#7A9285]">
                  <Star size={12} className="fill-amber-400 stroke-amber-400" />
                  <span>{exp?.avg_rating ? parseFloat(exp.avg_rating).toFixed(1) : "0.0"}</span>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="mb-5">
              <span className="text-xs font-semibold text-[#9A9285] uppercase tracking-wider block mb-2">Guest Details</span>
              <div className="bg-white border border-[#E0D8CE] rounded-[14px] p-4 text-sm text-[#1A2820] flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-[#7A9285]">Name</span>
                  <span className="font-medium">{user?.full_name || user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A9285]">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* ID Proof Upload */}
            <div className="mb-0">
              <span className="text-xs font-semibold text-[#9A9285] uppercase tracking-wider block mb-2">Upload ID Proof</span>
              <div className="bg-[#FAF7F2] border border-[#E0D8CE] rounded-[14px] p-4 text-sm text-[#1A2820]">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D9D0C2] rounded-[10px] p-6 cursor-pointer bg-white hover:border-[#3E7A58] transition-colors">
                  {previewUrl ? (
                    <img src={previewUrl} alt="ID Preview" className="w-full max-h-32 object-contain rounded-[8px] mb-2" />
                  ) : (
                    <Upload className="h-6 w-6 text-[#7A9285] mb-2" />
                  )}
                  <span className="text-xs font-semibold text-[#1A2820] text-center break-all px-2">
                    {idFile ? idFile.name : "Click to upload Photo ID proof"}
                  </span>
                  <span className="text-[10px] text-[#7A9285] mt-1">PDF, JPG, PNG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setIdFile(file);
                        setError(null);
                        if (file.type.startsWith("image/")) {
                          const reader = new FileReader();
                          reader.onloadend = () => setPreviewUrl(reader.result);
                          reader.readAsDataURL(file);
                        } else {
                          setPreviewUrl(null);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Action CTA */}
          <div className="w-full md:w-[340px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#E8E1D5] pt-6 md:pt-0 md:pl-8">
            <div>
              <span className="text-xs font-semibold text-[#9A9285] uppercase tracking-wider block mb-3">Experience Summary</span>
              <div className="bg-[#FAF7F2] border border-[#E0D8CE] rounded-[14px] p-4 text-sm text-[#1A2820] flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#7A9285]">
                    <Calendar size={16} />
                    <span>Date</span>
                  </div>
                  <span className="font-medium">{new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#7A9285]">
                    <Users size={16} />
                    <span>Guests</span>
                  </div>
                  <span className="font-medium">{guests} {guests === 1 ? "person" : "people"}</span>
                </div>
                <div className="h-px bg-[#E0D8CE] my-1" />
                <div className="flex justify-between text-xs text-[#7A9285]">
                  <span>₹{pricePerPerson.toLocaleString()} × {guests} guests</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1A2820] mt-1">
                  <span>Total Amount</span>
                  <span style={{ color: "var(--color-forest)" }}>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-[12px] border border-[#EBB8AA] bg-[#FAF0EC] px-4 py-3 text-xs text-[#A04D38] mb-4">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full flex items-center justify-center gap-2 rounded-[14px] py-3.5 font-semibold text-sm text-[#F2EDE4] transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                style={{ background: "var(--color-forest-deep)" }}
              >
                {confirming ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>Confirm Booking <ArrowRight size={16} /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-[#7A9285]">
                <Shield size={13} />
                <span>Secure booking supported by Bond Verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
