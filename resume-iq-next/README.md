# ResumeIQ — Premium Full-Stack AI-Powered Resume Builder

ResumeIQ is a premium, enterprise-grade AI-powered Resume Builder SaaS. It features a futuristic Apple-inspired "Liquid Glass" design system, interactive 3D WebGL visuals, real-time drag-and-drop resume customizer, an AI career assistant, and a high-fidelity PDF/DOCX export system.

---

## 🚀 Key Features

* **Liquid Glass Theme**: Frosted glass panels, dynamic ambient gradient auroras, micro-animations (via GSAP and Framer Motion), and customizable accent colors.
* **Interactive 3D WebGL Canvas**: Renders a floating 3D document layout inside the Hero section that reacts dynamically to mouse interactions.
* **Zustand State Architecture**: Decoupled, centralized stores manage resume state modifiers, auth profiles, and toast notifications.
* **ATS Compatibility Score Scanner**: The built-in AI Assistant parses experience details, scoring parser match percentage, showing structural feedback, and listing gap keywords.
* **AI Bullet Optimizer**: Optimizes work achievements on-the-fly using Google's XYZ formula ("Accomplished [X], measured by [Y], by doing [Z]").
* **Tailored Cover Letter Writer**: Auto-compiles formal cover letters matching the pasted job description details.
* **High-Fidelity PDF & DOCX Exports**: One-click clientside compilations using `jsPDF` + `html2canvas` and `docx.js` which write logs directly to the export history dashboard. Supports native browser prints as well.
* **Protected Admin Panel**: Displays telemetry logs of AI requests (prompt and completion tokens) and user role upgrades.
* **Appwrite DB with Fallback Mode**: Instantly launches and saves state in `localStorage` if Appwrite credentials are not yet configured.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Three.js (React Three Fiber & Drei), GSAP.
* **Backend APIs**: Next.js Route Handlers (`app/api/ai/...`).
* **Database & File Store**: Appwrite Cloud Backend (Authentication, Storage, Database).
* **AI Service**: Google Gemini API (`gemini-2.5-flash` model).
* **Forms & Validation**: React Hook Form, Zod.

---

## 📁 Directory Structure

```
/resume-iq-next
├── /app
│   ├── layout.tsx                # Base HTML layout, Space Grotesk/Inter fonts, ToastProvider
│   ├── page.tsx                  # Premium Landing page (Hero, Features, Pricing, 3D Canvas, FAQs)
│   ├── login/page.tsx            # Glassmorphic Credentials Login
│   ├── register/page.tsx         # Glassmorphic Credentials Signup
│   ├── dashboard/
│   │   ├── layout.tsx            # Protecting route dashboard layout & Sidebar
│   │   ├── page.tsx              # Resumes lists grid and workspace stats
│   │   ├── builder/[id]/page.tsx # Workspace split-screen editor & AI panel drawer
│   │   ├── templates/page.tsx    # Templates selection
│   │   ├── export-history/page.tsx # PDF & DOCX export logs table
│   │   └── settings/page.tsx     # Profile updating settings & billing upgrade
│   ├── admin/
│   │   └── page.tsx              # Admin telemetry dashboard
│   └── api/
│       └── ai/                   # AI Route Handlers (summary, improve, ats, cover, match, interview)
├── /components
│   ├── /ui/ToastContainer.tsx    # Custom glassmorphic toasts
│   ├── HeroCanvas.tsx            # 3D WebGL scene Canvas
│   ├── LiquidGlassNavbar.tsx     # Apple-style sticky header navbar
│   ├── LandingSections.tsx       # Marketing sections
│   ├── ResumeEditor.tsx          # Workspace input forms
│   ├── ResumePreview.tsx         # Custom layout designs (ATS Classic, Modern Tech, Creative Glass)
│   └── Sidebar.tsx               # Dashboard navigation panel
├── /services
│   ├── appwrite.ts               # Appwrite integration wrapper (with Sandbox fallback)
│   └── aiService.ts              # Gemini API integrations layer
├── /store
│   ├── useAuthStore.ts           # Authentication session state
│   ├── useResumeStore.ts         # Resumes listings & workspace modifiers
│   └── useNotificationStore.ts   # Custom toast logs
├── /types/index.ts               # Domain TS interfaces
└── /utils
    ├── exportPdf.ts              # jsPDF + html2canvas compiler
    └── exportDocx.ts             # docx.js XML compiler
```

---

## ⚙️ Quick Start Setup

### 1. Install Dependencies
Run from the project root:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or `.env.local` and populate keys:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> If `GEMINI_API_KEY` and Appwrite credentials are not configured, the app launches in **Sandbox Mode** automatically. Auth details and resume records are stored in `localStorage` and AI results are generated via rule-based simulations.

---

## ⚡ Production Compilation
Verify code compilation and static site generation:
```bash
npm run build
```
```bash
npm run start
```
