# 🚀 Atharv Tomar — 3D Portfolio & AI Resume Suite

A modern, interactive 3D developer portfolio featuring an interactive skill keyboard, side-by-side LaTeX resume editor, Gemini AI resume tailoring, and real-time IST clock. Built with Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS, GSAP, Spline, and Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AthaarvaTomar/New-Port-folio-)

---

## ✨ Key Features

- **Interactive 3D Keyboard Scene** — Custom Spline 3D keyboard where every keycap represents a tech skill with interactive hover and press responses.
- **AI Resume Tailor (Gemini AI)** — Instantly tailor your LaTeX resume for specific target roles and job descriptions using Gemini AI models with automatic fallback strategy.
- **Live LaTeX Editor & PDF Compiler** — Side-by-side CodeMirror LaTeX editor with real-time PDF preview and one-click compilation via local LaTeX engine.
- **Unified Admin Dashboard (`/admin`)** — Protected single-route admin portal with client-side mode switching between Manual LaTeX editing and AI Resume Tailoring.
- **Live IST Clock** — Real-time Indian Standard Time (`HH:MM:SS AM/PM IST`) clock component embedded in website footer and slide-out navigation menu.
- **Protected Authentication & Storage** — Supabase Auth and Supabase Storage integration with Middleware security sealing admin/editor pages.
- **Contact & Real-time Collaboration** — Email delivery via Resend/Nodemailer and live online user indicator via Socket.IO.
- **Responsive & Dynamic Aesthetics** — Dark cosmic theme with dynamic particle backgrounds, GSAP scroll animations, and smooth scrolling via Lenis.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Core Framework** | Next.js 16 (App Router & Turbopack), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS, Shadcn UI, Lucide Icons, CodeMirror |
| **3D & Animation** | Spline Runtime, GSAP, Motion |
| **AI Integration** | Google Gemini AI API (`gemini-3.5-flash`, `gemini-3.6-flash`) |
| **Database & Auth** | Supabase Auth (`@supabase/ssr`), Supabase Storage |
| **Email & Realtime** | Resend, Nodemailer, Socket.IO Client |
| **Utilities** | Lenis Smooth Scroll, Zod Validation, next-themes |

---

## 📁 Project Structure

```text
NEW-3d-portfolio/
├── src/
│   ├── app/
│   │   ├── admin/                 # Protected unified admin dashboard (/admin)
│   │   ├── api/
│   │   │   ├── compile/           # LaTeX compilation endpoint
│   │   │   ├── generate-resume/   # Gemini AI resume tailoring API endpoint
│   │   │   ├── generated-resumes/ # Generation history API endpoint
│   │   │   └── resumes/           # Resume CRUD & PDF endpoints
│   │   ├── resume/                # Public resume preview & login
│   │   ├── globals.css            # Core design system & CSS utilities
│   │   └── page.tsx               # Main 3D portfolio landing page
│   ├── components/
│   │   ├── admin/                 # AdminDashboardClient & AiTailorPanel
│   │   ├── common/                # IstClock component
│   │   ├── footer/                # Footer component with Live IST clock
│   │   ├── header/                # Header & slide-out navigation menu
│   │   ├── resume/                # ResumeEditor & SignOutButton
│   │   └── sections/              # Hero, Skills, Projects, Experience, Contact
│   ├── lib/                       # Supabase client/server helpers & utilities
│   └── data/                      # Portfolio configuration & content
├── middleware.ts                  # Route protection middleware for /admin & /resume-editor
├── next.config.mjs                # Next.js configuration & security headers
└── .env.example                   # Environment variable template
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local` and configure your API keys:

```bash
cp .env.example .env.local
```

### Required Variables:

```env
# Supabase Authentication & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI API Key (Resume Tailoring)
GEMINI_API_KEY=your_gemini_api_key

# Public Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 🔐 Admin Routes & AI Suite

- **Admin Login**: `http://localhost:3000/resume/login`
- **Unified Admin Dashboard**: `http://localhost:3000/admin`
  - Mode 1: **Manual Editor** — Direct LaTeX source editing with live side-by-side PDF preview.
  - Mode 2: **AI Tailor** — Input Company, Position, and Job Description to generate a tailored LaTeX resume using Gemini AI.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
