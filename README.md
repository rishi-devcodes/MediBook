# MediBook

> **Healthcare, simplified.**

MediBook is a full-stack doctor appointment booking platform designed to make healthcare appointment management simple, structured, and convenient.

The platform allows patients to discover doctors, view doctor profiles and schedules, book appointments, make payments through Razorpay Test Mode, manage appointments, reschedule or cancel bookings, submit reviews, and manage their profiles.

---

## ✨ Features

### 👨‍⚕️ Doctor Discovery
- Browse available doctors
- Filter doctors by specialty and other available criteria
- View detailed doctor profiles
- View consultation fees, experience, qualifications, clinic information, and reviews
- Check real-time appointment slot availability

### 📅 Appointment Booking
- Select a doctor
- Select appointment date
- Select available time slot
- Choose consultation type
- Enter patient details
- Add appointment reason
- Review booking information before payment

### 💳 Online Payment
- Razorpay Standard Checkout integration
- Razorpay **TEST MODE** support
- Payment order creation and verification
- Payment records stored in MongoDB
- Appointment confirmation after successful payment
- Razorpay webhook endpoint for payment events

### 🔐 Authentication & Authorization
- User registration and login
- Secure password hashing using bcrypt
- NextAuth Credentials authentication
- JWT-based sessions
- User-specific appointment access
- Protected profile and appointment routes

### 🗓️ Appointment Management
- View all appointments
- Filter appointments by:
  - All
  - Upcoming
  - Completed
  - Cancelled
- View complete appointment details
- Cancel appointments
- Reschedule appointments
- Automatic handling of past appointments

### ⭐ Reviews & Ratings
- Patients can review completed appointments
- Rating and written review support
- Duplicate review prevention
- Review count and rating information stored with doctor data

### 👤 Profile Management
- View user profile
- Edit personal information
- Change account password
- View account information

### 🎨 UI / UX
- Responsive design
- Premium dark healthcare interface
- Mobile-friendly navigation
- Loading and error states
- Accessible form controls and interactive elements
- Responsive appointment booking flow

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React**

### Backend
- **Next.js App Router**
- **Route Handlers**
- **MongoDB**
- **Mongoose**
- **Zod**

### Authentication
- **NextAuth.js**
- **bcryptjs**
- JWT Sessions

### Payments
- **Razorpay Standard Checkout**
- Razorpay Test Mode

### Development
- **Node.js**
- **npm**
- **Git & GitHub**

---

## 🏗️ Application Architecture

```text
                        ┌───────────────────┐
                        │      MediBook     │
                        │    Next.js App    │
                        └─────────┬─────────┘
                                  │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
               ▼                  ▼                  ▼
        ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
        │   Frontend  │    │ API Routes  │    │    Auth     │
        │ React +     │    │ Next.js     │    │ NextAuth    │
        │ Tailwind    │    │ Route       │    │ Credentials │
        └─────────────┘    │ Handlers    │    └─────────────┘
                           └──────┬──────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
             ┌─────────────┐            ┌─────────────┐
             │  MongoDB    │            │  Razorpay   │
             │ + Mongoose  │            │ Test Mode   │
             └─────────────┘            └─────────────┘
