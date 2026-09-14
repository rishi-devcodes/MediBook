import type { Specialty } from "@/types/doctor";

export const SPECIALTIES: Specialty[] = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Dentistry",
  "Orthopedics",
  "General Physician",
  "Gynecology",
];

export const FEE_RANGES = [
  { id: "any", label: "Any fee", min: 0, max: Infinity },
  { id: "under-500", label: "Under ₹500", min: 0, max: 499 },
  { id: "500-1000", label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { id: "above-1000", label: "Above ₹1,000", min: 1001, max: Infinity },
] as const;

export const PLATFORM_NAME = "MediBook";
export const PLATFORM_TAGLINE = "Healthcare, simplified.";
