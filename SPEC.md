# AI Smart Clinic Management System - Specification

## Project Overview
- **Project Name**: MediSync AI - Smart Clinic Management System
- **Type**: Full-stack Healthcare Web Application
- **Core Functionality**: AI-powered clinic management with patient/doctor portals, appointment booking, and intelligent symptom analysis
- **Target Users**: Healthcare providers (doctors) and patients seeking medical care

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with role-based access
- **State**: Zustand
- **AI**: Google Gemini API

## UI/UX Specification

### Layout Structure
- **Sidebar Navigation**: Fixed left sidebar (280px) with role-based menu items
- **Main Content**: Responsive content area with max-width 1400px
- **Header**: Top bar with user info, theme toggle, notifications
- **Responsive Breakpoints**:
  - Mobile: < 768px (collapsible sidebar)
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Visual Design
- **Color Palette**:
  - Primary: #0F766E (Teal 700)
  - Primary Light: #14B8A6 (Teal 500)
  - Secondary: #6366F1 (Indigo 500)
  - Accent: #F59E0B (Amber 500)
  - Background: #F8FAFC (Slate 50)
  - Card Background: #FFFFFF
  - Text Primary: #1E293B (Slate 800)
  - Text Secondary: #64748B (Slate 500)
  - Success: #22C55E (Green 500)
  - Warning: #EAB308 (Yellow 500)
  - Error: #EF4444 (Red 500)
  - Dark Mode Background: #0F172A (Slate 900)

- **Typography**:
  - Font Family: Inter, system-ui
  - Headings: 
    - H1: 32px/40px, font-weight 700
    - H2: 24px/32px, font-weight 600
    - H3: 20px/28px, font-weight 600
  - Body: 16px/24px, font-weight 400
  - Small: 14px/20px, font-weight 400

- **Spacing System**: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- **Border Radius**: 8px (cards), 6px (buttons), 4px (inputs)
- **Shadows**: 
  - Card: 0 1px 3px rgba(0,0,0,0.1)
  - Elevated: 0 4px 6px rgba(0,0,0,0.1)

### Components
- **Cards**: White background, subtle shadow, 8px radius
- **Buttons**: Primary (teal), Secondary (indigo), Ghost
- **Forms**: Label above input, error states with red border
- **Modals**: Centered, backdrop blur, smooth scale animation
- **Tables**: Striped rows, sortable headers, pagination
- **Badges**: Status colors (pending=amber, approved=green, cancelled=red)
- **Alerts**: Warning badges for recurring issues

## Database Schema (Prisma)

### Models
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(PATIENT)
  createdAt DateTime @default(now())
  doctor    Doctor?
  patient   Patient?
}

enum Role {
  DOCTOR
  PATIENT
}

model Doctor {
  id              String        @id @default(cuid())
  userId          String        @unique
  user            User          @relation(fields: [userId], references: [id])
  specialization  String
  experience      Int
  appointments    Appointment[]
  medicalRecords  MedicalRecord[]
}

model Patient {
  id              String        @id @default(cuid())
  userId          String        @unique
  user            User          @relation(fields: [userId], references: [id])
  age             Int?
  gender          String?
  appointments    Appointment[]
  medicalRecords  MedicalRecord[]
}

model Appointment {
  id        String            @id @default(cuid())
  patientId String
  doctorId  String
  patient   Patient           @relation(fields: [patientId], references: [id])
  doctor    Doctor            @relation(fields: [doctorId], references: [id])
  date      DateTime
  status    AppointmentStatus @default(PENDING)
  createdAt DateTime          @default(now())
}

enum AppointmentStatus {
  PENDING
  APPROVED
  CANCELLED
}

model MedicalRecord {
  id        String   @id @default(cuid())
  patientId String
  doctorId  String
  patient   Patient  @relation(fields: [patientId], references: [id])
  doctor    Doctor   @relation(fields: [doctorId], references: [id])
  symptom   String
  duration  Int
  diagnosis String?
  treatment String?
  createdAt DateTime @default(now())
}
```

## Functionality Specification

### Authentication
- Login/Signup with email and password
- Role selection during signup (Doctor/Patient)
- JWT-based session management
- Protected routes based on role

### Doctor Features
1. **Dashboard**
   - Total patients count
   - Today's appointments
   - Frequent patients list
   - Risk alerts for recurring issues

2. **Patient Management**
   - View all patients
   - Search by name
   - Filter by symptom, duration, visit frequency

3. **Medical Records**
   - Add new record with symptoms, duration, diagnosis, treatment
   - View patient history timeline

4. **AI Features**
   - Auto Medical Notes: Input symptoms → Structured output
   - Patient Summary: AI-generated patient overview
   - Risk Alert: Warning for recurring symptoms

### Patient Features
1. **Dashboard**
   - Upcoming appointments
   - Medical history timeline
   - Health insights

2. **Smart Doctor Finder**
   - Input: symptom + duration
   - AI Logic:
     - ≤2 days: General Physician
     - 3-10 days: GP + Specialist
     - >10 days: Specialist with warning

3. **Doctor Listing**
   - Filter by specialization, experience, availability

4. **Appointment Booking**
   - Select doctor, date/time
   - Status tracking (pending/approved)

5. **Medical History**
   - Timeline view of all visits

### AI Integration
- Google Gemini API for:
  - Symptom analysis
  - Doctor suggestion based on duration
  - Medical note generation
  - Patient summary generation

## Acceptance Criteria

### Authentication
- [ ] User can signup as doctor or patient
- [ ] User can login with email/password
- [ ] Routes are protected based on role
- [ ] Session persists across refresh

### Doctor Portal
- [ ] Dashboard shows correct statistics
- [ ] Can search and filter patients
- [ ] Can add medical records with all fields
- [ ] Can view patient history timeline
- [ ] AI note generator works correctly
- [ ] Risk alerts appear for recurring issues

### Patient Portal
- [ ] Dashboard shows upcoming appointments
- [ ] Smart finder suggests doctors based on symptom duration
- [ ] Can browse and filter doctor list
- [ ] Can book appointments with any doctor
- [ ] Can view complete medical history
- [ ] Disclaimer is visible on dashboard

### UI/UX
- [ ] Responsive on all screen sizes
- [ ] Dark/light mode toggle works
- [ ] Smooth animations on interactions
- [ ] Modals open/close properly
- [ ] Loading states shown during API calls

### Performance
- [ ] Pages load without errors
- [ ] API responses under 2 seconds
- [ ] No console errors in production
