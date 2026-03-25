# MediSync AI - Smart Clinic Management System

An AI-powered clinic management system built with Next.js, featuring patient and doctor portals with intelligent symptom-based doctor suggestions.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Auth**: NextAuth.js with role-based access
- **State**: Zustand
- **AI**: Google Gemini API

## Features

### Doctor Features
- Dashboard with patient statistics and risk alerts
- Patient management with search and filters
- Medical records management
- AI-powered auto medical notes generator
- Patient summary generator
- Risk alert system for recurring symptoms

### Patient Features
- Dashboard with health insights
- Smart Doctor Finder (AI-based suggestions based on symptom duration)
- Doctor listing with filters
- Appointment booking
- Medical history timeline

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### Installation

1. Clone the repository
```bash
cd medisy
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your Supabase database connection strings and API keys:
```
# Database - Supabase (Production Ready)
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Client
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Brevo
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="your-verified-sender@email.com"

# AI
GEMINI_API_KEY="your-gemini-api-key"
```

4. Set up the database
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed sample data
npm run db:seed
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Test Accounts

After running the seed script, you can use these credentials:

**Doctor Account:**
- Email: dr.smith@medisy.com
- Password: password123

**Patient Account:**
- Email: john.doe@email.com
- Password: password123

## Project Structure

```
medisy/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── doctor/         # Doctor portal pages
│   │   ├── patient/        # Patient portal pages
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── components/         # React components
│   │   ├── ui/             # ShadCN UI components
│   │   └── sidebar.tsx     # Navigation sidebar
│   ├── features/           # Feature modules
│   │   └── auth/           # Authentication
│   ├── lib/               # Utilities
│   │   ├── prisma.ts       # Prisma client
│   │   ├── ai.ts           # AI helpers
│   │   └── utils.ts        # Utility functions
│   ├── store/              # Zustand store
│   └── types/              # TypeScript types
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Seed data
└── public/                # Static assets
```

## AI Features

### Smart Doctor Finder
The system analyzes symptoms and duration to suggest appropriate doctors:
- Duration ≤ 2 days: General Physician
- Duration 3-10 days: General Physician + Specialist
- Duration > 10 days: Specialist with warning

### Auto Medical Notes
Input brief symptoms and receive structured medical notes with:
- Identified symptoms
- Possible diagnosis
- Suggested treatment

### Patient Summary
AI-generated overview of patient medical history including:
- Recurring symptoms
- Visit frequency
- Health insights

## License

MIT
