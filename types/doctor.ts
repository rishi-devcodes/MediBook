export type Specialty =
  | "Cardiology"
  | "Dermatology"
  | "Neurology"
  | "Pediatrics"
  | "Dentistry"
  | "Orthopedics"
  | "General Physician"
  | "Gynecology";

export type ConsultationType = "In-Person" | "Video";

export interface DoctorReview {
  id: string;
  appointmentId?: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string; // ISO date
}

export interface DayAvailability {
  day: string; // "Mon", "Tue", ...
  date: string; // display label e.g. "12 Sep"
  slots: string[]; // ["09:00 AM", "09:30 AM", ...]
}

export interface Doctor {
  id: string;
  name: string;
  photoUrl: string;
  specialty: Specialty;
  qualifications: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  consultationTypes: ConsultationType[];
  languages: string[];
  about: string;
  clinicName: string;
  clinicLocation: string;
  verified: boolean;
  isAvailableToday: boolean;
  nextAvailableLabel: string; // e.g. "Today, 4:30 PM"
  availability: DayAvailability[];
  reviews: DoctorReview[];
}
