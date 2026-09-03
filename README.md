# Trizen — Service Provider Onboarding Portal

A full-stack MERN application engineered for end-to-end service provider registration, multi-step onboarding, KYC document verification, and administrative lifecycle management.

---

## 🌟 Key Features

### 1. Service Provider Experience
- **Quick Registration & Auth**: Secure email/password authentication using JWT tokens and bcrypt encryption. Includes demo quick-fill buttons for instant testing.
- **6-Step Interactive Onboarding Wizard**:
  1. **Personal Information**: Name, contact details, date of birth, gender, and bio.
  2. **Profile Photo**: Avatar image upload with live client preview.
  3. **Professional Details**: Years of experience, past employment, and interactive skill tags.
  4. **Service Offerings**: Multi-select categories (Electrician, Plumber, Carpenter, Cleaning, Painting, AC Repair, Appliance Repair, Pest Control, Home Automation, etc.).
  5. **Location & Coverage**: Workshop address, city, state, pincode, and operational coverage radius in km.
  6. **KYC Document Upload**: Government ID proof, address proof, and trade certificates with multi-file upload, file size & type validation (PDF, JPG, PNG).
- **Draft Auto-Save & Progress Calculation**: Providers can save their application in draft mode at any time. A dynamic progress bar computes profile completeness (0–100%) in real time.
- **Live Status Tracking Timeline**:
  - Interactive stepper tracking application stages: Registered ➔ Form Completed ➔ Submitted ➔ KYC Review ➔ Decision.
  - Rejection recovery flow with administrative remarks banner and one-click edit & resubmission.
  - Active partner badge and verification certification upon approval.

### 2. Administrator Command Center
- **Executive Analytics Dashboard**: Real-time counter metrics for Total Providers, Pending Review, Approved Providers, Rejected Applications, and Drafts. Includes visual pipeline distribution bar.
- **Recent Applications Review**: Fast triage table for incoming partner submissions.
- **Provider Directory (Search, Filter & Pagination)**:
  - Full-text search across provider name, email, and phone.
  - Multi-criteria filtering by Application Status, Primary Service Category, City, and Experience.
  - Server-side pagination with configurable page size (5, 10, 20, 50).
- **Comprehensive Provider Dossier (`/admin/providers/:id`)**:
  - Detailed personal, contact, skill, service, and jurisdiction breakdown.
  - KYC document verification cards with file preview and download links.
  - Profile completeness rating.
  - **One-Click Approval**: Immediate status transition with confirmation modal.
  - **Structured Rejection**: Modal enforcing mandatory rejection remarks so providers know exactly what needs revision.

### 3. Security & Architecture
- **Role-Based Access Control (RBAC)**: Strict separation between `admin` and `provider` routes on both client (React Router `ProtectedRoute`) and server (Express JWT & `authorizeRoles` middlewares).
- **Input Validation**: Server-side payload validation for emails, phone numbers, password strength, and status transitions.
- **Document Management**: Multer integration with MIME-type filtering, file size caps (5MB), and static asset serving.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, React Router v6, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |
| **File Handling** | Multer (local disk storage with validation) |

---

## 📂 Project Structure

```
Trizen/
├── client/                     # Frontend Vite + React SPA
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, StatusBadge, FileUpload, Modal, ProgressBar, etc.)
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # Landing page
│   │   │   ├── Login.jsx       # Auth login with quick-fill demo buttons
│   │   │   ├── Register.jsx    # Provider registration
│   │   │   ├── provider/
│   │   │   │   ├── Dashboard.jsx        # Provider KPI dashboard
│   │   │   │   ├── OnboardingWizard.jsx # 6-Step onboarding form
│   │   │   │   └── StatusTracking.jsx   # Live milestone timeline
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx        # Metrics & recent applications
│   │   │       ├── ProviderList.jsx     # Directory with search, filters & pagination
│   │   │       └── ProviderDetail.jsx   # Dossier review & approval/rejection
│   │   ├── routes/             # ProtectedRoute wrapper
│   │   ├── services/           # Axios API service client
│   │   ├── App.jsx             # Route definitions
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Node.js Express REST API
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # authController, providerController, adminController
│   ├── middleware/             # authMiddleware, errorMiddleware, uploadMiddleware
│   ├── models/                 # User, ProviderProfile, Document schemas
│   ├── routes/                 # authRoutes, providerRoutes, adminRoutes
│   ├── seeders/                # seedAdmin.js (Seeds admin & sample providers)
│   ├── uploads/                # Uploaded files and KYC documents
│   ├── validators/             # inputValidators.js
│   ├── package.json
│   ├── server.js               # Express application entry point
│   └── test-verification.js    # Automated integration test suite
├── api-collection.json         # Postman / Bruno REST API collection
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18.x or later)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string)

### 1. Clone & Configure Server
```bash
cd server
npm install
```

Configure `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/trizen_onboarding
JWT_SECRET=trizen_jwt_super_secret_key_2026
JWT_EXPIRE=7d
```

### 2. Seed Database
Seed the database with the administrator account and realistic sample providers across all workflow stages (Approved, Submitted, Rejected, Draft):
```bash
npm run seed:admin
```

### 3. Start Backend Server
```bash
npm start
# or for live reload:
npm run dev
```
Server runs on: `http://localhost:5000`

### 4. Configure & Start Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
Client runs on: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password | Pre-seeded Status |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@123` | Full administrative control |
| **Provider (Approved)** | `rahul@example.com` | `Provider@123` | Approved (Certified Partner) |
| **Provider (Submitted)** | `priya.patel@example.com` | `Password@123` | Submitted (Awaiting KYC review) |
| **Provider (Rejected)** | `vikram.verma@example.com` | `Password@123` | Rejected (With review remarks) |
| **Provider (Draft)** | `anita.desai@example.com` | `Password@123` | Draft (Incomplete application) |

> 💡 **Quick Fill:** On the Login page (`/login`), click the **"Admin Demo"** or **"Provider Demo"** button to auto-fill credentials instantly.

---

## 🧪 Automated Testing

A comprehensive end-to-end API test suite verifies all 10 core workflows (Auth, Registration, Profile Updates, KYC Uploads, Dashboard Metrics, Filtering, Approvals, Rejections, and RBAC 403 enforcement):

```bash
cd server
node test-verification.js
```

### Verification Output:
```
🚀 Starting Automated Full-Stack API Verification...

✅ 1. Admin Login: SUCCESS (Role: admin)
✅ 2. Provider Login: SUCCESS (Role: provider)
✅ 3. Provider Registration: SUCCESS (Draft Profile Created)
✅ 4. Update Provider Profile: SUCCESS (Completeness: 80%)
✅ 5. Admin Dashboard Stats: SUCCESS (Total: 6, Pending: 1, Approved: 1)
✅ 6. Admin Search & Filter: SUCCESS (Found 2 in Bangalore)
✅ 7. Admin Provider Dossier Fetch: SUCCESS
✅ 8. Admin Reject with Remarks: SUCCESS (Status: Rejected)
✅ 9. Admin Approve Provider: SUCCESS (Status: Approved)
✅ 10. Role Protection: SUCCESS (403 Forbidden properly blocked provider from admin routes)

🎉 ALL 10 CORE AUTOMATED TESTS PASSED WITH 100% SUCCESS!
```

---

## 📬 API Collection

Import the included [`api-collection.json`](file:///c:/Users/aksha/OneDrive/Desktop/Trizen/api-collection.json) file directly into Postman, Insomnia, or Bruno to explore all available endpoints:

- `POST /api/auth/register` — Create new provider
- `POST /api/auth/login` — Login user & obtain JWT token
- `GET /api/auth/me` — Inspect authenticated user & profile
- `GET /api/provider/profile` — Fetch provider onboarding details
- `PUT /api/provider/profile` — Save onboarding details (draft mode)
- `POST /api/provider/profile-photo` — Upload provider avatar image
- `POST /api/provider/documents` — Upload KYC documents (ID proof, address proof, license)
- `GET /api/provider/documents` — List uploaded documents
- `DELETE /api/provider/documents/:id` — Delete uploaded document
- `POST /api/provider/submit` — Final submission for admin review
- `GET /api/provider/status` — Live application status & milestones
- `GET /api/admin/dashboard` — Platform counters & recent applicants
- `GET /api/admin/providers` — Filterable & paginated provider list
- `GET /api/admin/providers/:id` — Detailed applicant dossier
- `PUT /api/admin/providers/:id/approve` — Approve provider
- `PUT /api/admin/providers/:id/reject` — Reject provider with remarks
