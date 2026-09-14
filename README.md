# MediBook — Healthcare, simplified.

Phase 0 (project scaffold) and Phase 1 (Home, Doctors Listing, Doctor
Profile — built against local mock data) are complete.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Lucide React icons
- MongoDB / Mongoose (added Phase 2)
- NextAuth.js (added Phase 5)

## Getting started

```bash
cd medibook
npm install
npm run dev
```

Then open http://localhost:3000.

## What's in Phase 1

- **Home** (`/`) — Navbar with mobile menu, hero with a name/specialty +
  location search form, popular specialties grid, featured doctors,
  "How it works" (3 steps), trust/benefits section, final CTA, footer.
- **Doctors Listing** (`/doctors`) — search by name/specialty, filter by
  specialty/availability/fee, responsive doctor cards, a simulated
  loading state, and an empty-results state. Reads `?query=` and
  `?specialty=` from the URL so Home's search and specialty tiles link
  straight into filtered results.
- **Doctor Profile** (`/doctors/[doctorId]`) — photo, verified badge,
  credentials, about, languages, a visual weekly schedule preview,
  patient reviews, and a sticky booking sidebar.
- **`/book/[doctorId]`** — placeholder route so "Book Appointment"
  navigates somewhere real; the full booking flow is a later phase.
- **Mock data**: `lib/mock/doctors.ts` — 10 doctors across Cardiology,
  Dermatology, Neurology, Pediatrics, Dentistry, Orthopedics, General
  Physician, and Gynecology.

### Known Phase 1 scope boundaries

- `/login`, `/signup`, and `/appointments` are linked from the Navbar
  but not yet built — they'll 404 until the auth and appointments
  phases. This is expected.
- The doctor photos and hero image are hotlinked from `randomuser.me`
  and `images.unsplash.com` (already whitelisted in
  `next.config.js`) — swap for real assets whenever convenient.

## What's in Phase 0

- `app/layout.tsx` — root layout, Google Fonts (Sora for headlines, Inter
  for body text)
- `app/globals.css` — base styles, focus states, reduced-motion support
- `tailwind.config.ts` — full color/type/radius/shadow token system
- `components/ui/` — Button, Card, Badge, Input, Container primitives

## Design tokens quick reference

| Token | Value | Use |
|---|---|---|
| `primary-500` | `#1958C1` | Primary actions, links, active states |
| `primary-700` | `#123F8C` | Hover/pressed states |
| `surface` | `#FFFFFF` | Page background |
| `surface-muted` | `#F6F8FA` | Section backgrounds, subtle fills |
| `ink` | `#0F172A` | Body text |
| `ink-muted` | `#5B6472` | Secondary text |
| `success` | `#0F9D58` | Confirmed status |
| `danger` | `#DC2626` | Cancelled/error status |
| `warning` | `#B7791F` | Pending status |

Font families: `font-display` (Sora, headlines) and `font-sans`
(Inter, body/UI text).

## Next up — Phase 2

Introduce MongoDB/Mongoose models and wire the Doctors Listing and
Doctor Profile pages up to real API routes, replacing the local mock
data.

