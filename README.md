# WorkPay AI — AI-Powered Worker Hiring, Financial Management & Digital Payment Platform

> **Tagline:** *Connecting Workers, Securing Payments, Empowering Financial Growth.*

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4.21-blue.svg)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0_InnoDB-orange.svg)](https://mysql.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com)

---

## 1. Project Overview

WorkPay AI is a full-stack, enterprise-grade web application engineered to bridge the trust and payment deficit in India's informal labor economy. It connects domestic and commercial customers with verified skilled tradespeople (Electricians, Plumbers, Carpenters, Painters, Masons, Cooks, Cleaners, Drivers, Tutors, Mechanics) through:

1. **AI-Powered Matching & Wage Discovery**: Mathematical 0-100% compatibility scoring and benchmarked wage calculators.
2. **FinTech Digital Escrow & Wallet**: Internal double-entry ledger ensuring worker earnings are protected and paid promptly upon client satisfaction.
3. **Downloadable Tax Invoices & Receipts**: Automated GST-compliant PDF invoices with transaction audit references.
4. **Local MySQL 8 Relational Core**: 27 normalized tables with ACID transaction guarantees and connection pooling.

---

## 2. Strict Technology Stack

### Frontend
- **React 18** & **Vite 6**
- **Tailwind CSS** (Custom FinTech Navy & Electric Blue Palette)
- **React Router DOM v6** (Protected role-based routing)
- **Lucide React** (Modern high-contrast iconography)
- **Recharts** (Interactive financial and category trajectory charts)
- **Axios** (Centralized interceptors with automatic Bearer token management)

### Backend
- **Node.js** & **Express.js** (REST API Architecture)
- **MySQL 8** (Strict Local Windows Installation via `mysql2/promise` pooling)
- **JWT & Bcryptjs** (Stateless authentication & salted one-way hashing)
- **Socket.IO** (Real-time dispatch alerts and notifications)
- **PDFKit** (Branded downloadable PDF invoice streaming)
- **Crypto HMAC-SHA256** (Verifiable payment signature generation & auditing)

---

## 3. The 10 AI-Powered Differentiating Features

| # | AI Feature | Description & Implementation |
|---|---|---|
| **1** | **AI Worker Matching** | Evaluates skills overlap, experience delta, commute proximity, and budget fit to generate a 0-100% compatibility score with transparent explanation bullets. |
| **2** | **AI Salary & Wage Predictor** | Computes minimum, recommended, and maximum compensation ranges based on category baseline, city tier, duration, and trade complexity. |
| **3** | **Multilingual AI Chatbot** | Conversational virtual assistant supporting English, Kannada, and Hindi with speech-friendly intent detection and Gemini LLM API integration. |
| **4** | **AI Profile & Bio Builder** | Transforms brief, rough worker notes into a compelling, professional headline, summary, and verified skill bullet points. |
| **5** | **AI Skill Recommendations** | Recommends high-paying upskilling paths and complementary trade certifications to maximize worker daily earning potential. |
| **6** | **AI Fraud & Velocity Detection** | Scans transaction frequency, cancellation anomalies, and dispute velocity to flag high-risk activity for admin mediation. |
| **7** | **AI Review Analysis** | Natural language sentiment engine calculating client satisfaction index, top praised trade strengths, and constructive feedback. |
| **8** | **AI Job Description Generator** | Drafts structured job titles, scope of work, essential deliverables, and safety requirements with 1 click. |
| **9** | **AI Income Analysis** | Analyzes historical MySQL ledger records to provide weekly/monthly breakdowns, peak earning days, and personalized financial tips. |
| **10** | **Voice-Based Search** | Web Speech API integration allowing clients to search for workers or post jobs hands-free with intelligent category parsing. |

---

## 4. User Roles & Capabilities

### 1. Customer
- Search & filter verified workers with Voice Search and Side-by-Side Comparison.
- Post jobs with AI Description drafting and fair wage predictions.
- Review applicants with 0-100% AI compatibility score rings.
- Release digital payments securely into worker wallet upon completion.
- Download PDF tax invoices & receipts.
- Rate and review workers with verified completion marks.

### 2. Worker
- Professional public profile with verified trade badges, certificates, and weekly availability timetable.
- Browse open jobs & submit competitive proposals.
- Receive direct customer hiring offers (Accept / Decline).
- Track active work assignments and mark completion milestones.
- View real-time digital wallet (Available Balance, Pending Escrow, Lifetime Earnings).
- Request payout withdrawals to Bank Account or UPI VPA.
- Log business expenses (tools, fuel, materials) to track net profit.
- AI Income Insights & upskilling roadmaps.

### 3. Administrator
- Full operations dashboard with real-time MySQL metrics (GMV, platform revenue, users, jobs).
- Audit worker diplomas & award Verified Worker Badges.
- Manage trade categories, baseline hourly/daily wage standards.
- Audit platform transactions & review payout withdrawal requests (approve or reject with automatic wallet refund).
- Mediate disputes and issue supported refunds.
- Investigate AI fraud velocity alerts and suspend/restore accounts with an audit log.

---

## 5. Folder Structure

```
workpay-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (mysql2 pool & withTransaction), jwt.js, initDb.js
│   │   ├── controllers/     # auth, worker, customer, job, hiring, assignment, payment, wallet, dispute, admin, ai
│   │   ├── middleware/      # auth.js (JWT & RBAC guards), errorHandler.js
│   │   ├── routes/          # REST route modules mounted under /api
│   │   ├── services/
│   │   │   ├── ai/          # 10 AI algorithmic services (matching, salary, chatbot, fraud, etc.)
│   │   │   └── fintech/     # paymentGateway (Razorpay sandbox), walletService, invoiceGenerator
│   │   ├── uploads/         # Local certificate storage
│   │   ├── app.js           # Express app setup, CORS, Helmet, RateLimiting
│   │   └── server.js        # HTTP server & Socket.IO boot
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, AIChatbotWidget, VoiceSearchButton, AISalaryModal, AIWorkerMatchModal...
│   │   ├── context/         # AuthContext.jsx, SocketContext.jsx
│   │   ├── layouts/         # PublicLayout.jsx, DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── public/      # LandingPage, About, Features, HowItWorks, LoginPage, RegisterPage
│   │   │   ├── customer/    # FindWorkers, WorkerDetails, Compare, Dashboard, PostJob, MyJobs, Payments, Transactions...
│   │   │   ├── worker/      # Dashboard, EditProfile, FindJobs, Applications, HiringOffers, MyWork, Earnings, Wallet, AIInsights...
│   │   │   └── admin/       # Dashboard, Users, Verifications, Jobs, Categories, Payouts, Disputes, FraudAlerts
│   │   ├── services/        # api.js (Axios client with Bearer interceptors)
│   │   ├── App.jsx          # Protected routing & guards
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── workpay_ai.sql       # 27 InnoDB tables DDL + comprehensive seed data
│   ├── init.js              # One-click Node.js database creator & runner
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── docs/
│   ├── architecture.md      # Detailed system architecture blueprint
│   ├── database-design.md   # Entity-Relationship diagram & data dictionary
│   ├── api-documentation.md # Complete REST API endpoints reference
│   └── setup-guide.md       # Windows MySQL 8 startup guide & troubleshooting
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. Quick Start Guide (Windows)

### Step 1: Start MySQL 8
Open an **Administrator Command Prompt** and start the local Windows MySQL service:
```cmd
net start MySQL80
```

### Step 2: Configure Environment Variables
Open `backend/.env` and enter your MySQL root password:
```ini
DB_PASSWORD=YOUR_ACTUAL_LOCAL_MYSQL_PASSWORD
```

### Step 3: Initialize Database Schema & Seed Data
```bash
cd backend
npm run db:init
```

### Step 4: Start Backend Server
```bash
cd backend
npm start
```
*API running at: `http://localhost:5000` (Healthcheck: `http://localhost:5000/api/health`)*

### Step 5: Start Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
*Web application opens at: `http://localhost:5180` (or `http://localhost:5174` if 5173/5180 are in use)*

---

## 7. Pre-Configured Demo Accounts for Testing

All test accounts share the password: **`Password123!`**

- **Administrator**: `admin@workpay.ai`
- **Customer**: `customer.demo@workpay.ai`
- **Worker (Electrician)**: `ramesh.electrician@workpay.ai`
- **Worker (Plumber)**: `suresh.plumber@workpay.ai`
- **Worker (Cook & Chef)**: `anita.cook@workpay.ai`

*Tip: The Login page contains **1-Click Quick Demo Login** buttons for immediate examiner evaluation!*
