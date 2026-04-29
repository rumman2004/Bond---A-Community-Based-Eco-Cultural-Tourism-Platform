// ============================================================
// utils/verificationConstants.js
// Static data for the community registration verification wizard
// ============================================================

export const OFFERING_CATEGORIES = [
  { id: "homestay", label: "Homestay",  icon: "🏠", hint: "Accommodation in local homes" },
  { id: "food",     label: "Food",      icon: "🍲", hint: "Traditional local cuisine & meals" },
  { id: "event",    label: "Events",    icon: "🎭", hint: "Cultural events & activities" },
];

export const EVENT_SUBTYPES = [
  { id: "dancing",     label: "Dancing",     icon: "💃" },
  { id: "crafting",    label: "Crafting",    icon: "🎨" },
  { id: "farming",     label: "Farming",     icon: "🌾" },
  { id: "music",       label: "Music",       icon: "🎵" },
  { id: "storytelling",label: "Storytelling",icon: "📖" },
];

export const MEMBER_ROLES = [
  "Community Owner", "Host", "Guide", "Cook",
  "Craft Instructor", "Farmer", "Event Coordinator", "Other",
];

export const WIZARD_STEPS = [
  { num: 1, label: "Basic Info",    icon: "🏡" },
  { num: 2, label: "Team & IDs",   icon: "👥" },
  { num: 3, label: "Offerings",    icon: "🎁" },
  { num: 4, label: "Consent",      icon: "✅" },
];

export const CONSENT_TEXT = `By submitting this form, I confirm that:

1. All information provided about the community is accurate and truthful.
2. All team members listed have given their consent to be included in this registration.
3. The uploaded ID documents are genuine and belong to the listed members.
4. The community agrees to abide by the platform's community guidelines and code of conduct.
5. The offering images are original photographs taken by or on behalf of the community.
6. The community will maintain the quality and standards described in the offerings.
7. Any changes to team members, offerings, or documents will be promptly updated.

This verification information will be reviewed by our security team within 2–3 business days.`;

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

export const SEASONS = ["Spring","Summer","Monsoon","Autumn","Winter","Year-round"];
