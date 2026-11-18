# WorkPay AI — REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authentication Scheme:** Bearer JWT in `Authorization` header  
**Content-Type:** `application/json`

---

## 1. Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "full_name": "Ramesh Kumar",
    "email": "ramesh@workpay.ai",
    "phone": "+91 98765 43210",
    "password": "Password123!",
    "role": "worker",
    "address": "BTM Layout 2nd Stage",
    "preferred_location": "Bengaluru South",
    "category_id": 1,
    "experience_years": 4.5,
    "expected_salary": 650.00
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 4,
      "email": "ramesh@workpay.ai",
      "full_name": "Ramesh Kumar",
      "role": "worker"
    }
  }
  ```

### User Login
- **POST** `/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@workpay.ai",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 1,
      "email": "admin@workpay.ai",
      "full_name": "System Administrator",
      "role": "admin"
    }
  }
  ```

### Get Authenticated User Profile
- **GET** `/auth/me`
- **Access:** Private (Bearer Token)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": 4,
      "email": "ramesh.electrician@workpay.ai",
      "role": "worker",
      "full_name": "Ramesh Kumar",
      "worker_profile": { ... }
    }
  }
  ```

---

## 2. Worker Endpoints

### List Workers
- **GET** `/workers?category=electrician&location=Bengaluru&minRating=4.5&maxSalary=800`
- **Access:** Public
- **Response (200 OK):** Returns matching workers array with rating, verified status, and skills.

### Get Worker By ID
- **GET** `/workers/:id`
- **Access:** Public
- **Response (200 OK):** Returns worker bio, verified certificates, skills, weekly availability schedule, and reviews.

### Update Worker Profile
- **PUT** `/workers/profile`
- **Access:** Private (Worker Only)
- **Request Body:** `{ bio, expected_salary, payment_preference, availability_status }`

### Worker Dashboard Overview
- **GET** `/workers/me/dashboard`
- **Access:** Private (Worker Only)
- **Response:** Metrics (completed jobs, active jobs, pending requests, wallet balance, recent reviews).

---

## 3. Customer Endpoints

### Customer Dashboard Overview
- **GET** `/customers/me/dashboard`
- **Access:** Private (Customer Only)
- **Response:** Total jobs posted, active requirements, completed jobs, pending hiring offers, recent transactions.

---

## 4. Job Management Endpoints

### Create Job Requirement
- **POST** `/jobs`
- **Access:** Private (Customer Only)
- **Request Body:**
  ```json
  {
    "title": "Complete 3BHK Concealed Rewiring & Inverter Setup",
    "category_id": 1,
    "description": "Need licensed electrician to inspect Bellandur flat...",
    "location": "Bellandur, Bengaluru South",
    "budget": 3200.00,
    "payment_type": "per_job",
    "required_skills": "House Wiring, MCB Setup",
    "required_experience": 4.0,
    "expected_duration": "2 Days",
    "working_hours": "8 Hours/Day"
  }
  ```

### List Jobs
- **GET** `/jobs?category=electrician&status=open`
- **Access:** Public

### Get Job Details with AI Match Candidates
- **GET** `/jobs/:id`
- **Access:** Public / Customer
- **Response:** Returns job details and applicant roster evaluated with `aiMatchScore` (0-100%) and explanation reasons!

### Apply for Job
- **POST** `/jobs/:id/apply`
- **Access:** Private (Worker Only)
- **Request Body:**
  ```json
  {
    "proposed_rate": 3000.00,
    "proposal_text": "I carry digital multimeters and have 7 years experience."
  }
  ```

---

## 5. Direct Hiring & Assignments

### Send Direct Hiring Offer
- **POST** `/hiring/request`
- **Access:** Private (Customer Only)
- **Request Body:** `{ worker_id, offered_rate, payment_type, message }`

### Worker Responds to Offer
- **PUT** `/hiring/requests/:id/respond`
- **Access:** Private (Worker Only)
- **Request Body:** `{ "action": "accepted" }`
- **Note:** Acceptance creates an active `job_assignments` record atomically.

### Mark Assignment Completed by Worker
- **PUT** `/assignments/:id/complete-worker`
- **Access:** Private (Worker Only)

### Confirm Completion & Release Escrow by Customer
- **PUT** `/assignments/:id/confirm-customer`
- **Access:** Private (Customer Only)

---

## 6. FinTech & Payments

### Create Payment Order
- **POST** `/payments/create-order`
- **Access:** Private (Customer Only)
- **Request Body:** `{ jobId, workerId, amount, paymentMethod }`

### Verify Payment & Settle Ledger
- **POST** `/payments/verify`
- **Access:** Private (Customer Only)
- **Request Body:**
  ```json
  {
    "jobId": 1,
    "workerId": 4,
    "amount": 3200.00,
    "orderId": "order_xxx",
    "paymentId": "pay_xxx",
    "signature": "sig_xxx",
    "idempotencyKey": "idemp_xxx"
  }
  ```

### Download Branded PDF Tax Invoice
- **GET** `/payments/invoice/:invoiceNumber/pdf`
- **Access:** Public / Secure download link
- **Response:** PDF binary stream with `Content-Type: application/pdf`.

---

## 7. AI Engine Endpoints

| Endpoint | Method | Input Parameters | Output Description |
|---|:---:|---|---|
| `/ai/match-workers` | POST | `{ jobId, customJob }` | Ranked workers with 0-100% scores and top 4 reasons. |
| `/ai/predict-salary` | POST | `{ categorySlug, experienceYears, location, paymentType }` | Min, Recommended, and Max fair wage with rationale. |
| `/ai/chat` | POST | `{ message, language, sessionId }` | Multilingual assistant reply (English / Kannada / Hindi). |
| `/ai/build-profile` | POST | `{ category, experienceYears, rawDescription, location }` | Professional headline, structured bio, and bullet highlights. |
| `/ai/recommend-skills` | POST | `{ categorySlug, currentSkills }` | High-demand upskilling roadmap with earning boost percentages. |
| `/ai/generate-job-desc` | POST | `{ category, shortSummary, location, budget }` | Professional title, scope of work, and safety deliverables. |
| `/ai/income-insights/:id` | GET | `workerId` ('me' for current) | Real-time financial trajectory and personalized tips. |
| `/ai/analyze-reviews` | POST | `{ workerId, reviews }` | Satisfaction index, top strengths, areas of improvement. |
| `/ai/check-fraud/:userId` | GET | `userId` | Risk score (0-100), risk level, and velocity alerts. |
| `/ai/parse-voice-search` | POST | `{ transcript }` | Extracted intent, category, location, and clean search text. |

