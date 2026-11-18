# WorkPay AI — System Architecture & Engineering Blueprint

**AI-Powered Worker Hiring, Financial Management, and Digital Payment Platform**  
*Tagline: Connecting Workers, Securing Payments, Empowering Financial Growth.*

---

## 1. Executive Summary

WorkPay AI addresses the deep structural problems in the informal blue-collar economy:
1. **Asymmetric Trust**: Customers struggle to verify trade skills, past performance, and pricing.
2. **Payment Insecurity**: Informal workers frequently suffer delayed or disputed payments without legal remedies.
3. **Absence of Organized Records**: Lack of verifiable transaction logs, preventing workers from accessing formal credit or banking services.
4. **Sub-optimal Matching & Pricing Inefficiencies**: Wage gouging or severe underpayment due to lack of localized market data.

WorkPay AI unifies:
- A verified, multi-tiered marketplace for skilled & unskilled labor.
- An intelligent algorithmic suite comprising 10 AI capabilities.
- A double-entry internal financial ledger with cryptographic verification and digital escrow workflows.
- A local, production-grade MySQL 8 database with connection pooling and ACID transactional integrity.

---

## 2. High-Level System Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                             CLIENT APPLICATION                                |
|             React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts          |
|                                                                               |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | Customer Dashboard |  |  Worker Dashboard  |  |   Admin Command Center  |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | Find & Compare     |  | My Work & Bio      |  | User & Worker Audits    |  |
|  | Post Jobs (AI)     |  | Wallet & Payouts   |  | Payouts & Disputes      |  |
|  | Digital Payments   |  | Income Insights    |  | Category & Fraud Shield |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  |     AI Multilingual Chatbot (English / Kannada / Hindi) & Voice Search  |  |
+---------------------------------------+---------------------------------------+
                                        | HTTPS / REST / Socket.IO
                                        v
+-------------------------------------------------------------------------------+
|                            NODE.JS EXPRESS BACKEND                            |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | Middleware: Helmet, CORS, Morgan, JWT Authenticator, Role-Based Guards  |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  +-------------------------+ +-----------------------+ +--------------------+ |
|  |       CONTROLLERS       | |      AI SERVICES      | |  FINTECH SERVICES  | |
|  +-------------------------+ +-----------------------+ +--------------------+ |
|  | • authController        | | 1. Worker Matching    | | • paymentGateway   | |
|  | • workerController      | | 2. Salary Prediction  | |   (Razorpay Sandbx | |
|  | • customerController    | | 3. Multilingual Chat  | |   + HMAC-SHA256)   | |
|  | • jobController         | | 4. Profile Builder    | | • walletService    | |
|  | • hiringController      | | 5. Skill Roadmaps     | |   (Double-Entry    | |
|  | • assignmentController  | | 6. Fraud Detection    | |    ACID Ledger)    | |
|  | • paymentController     | | 7. Review Analysis    | | • invoiceGenerator | |
|  | • walletController      | | 8. Job Desc Generator | |   (PDFKit Branded  | |
|  | • disputeController     | | 9. Income Analysis    | |    PDF Invoices)   | |
|  | • adminController       | | 10. Voice Parsing     | |                    | |
|  +-------------------------+ +-----------------------+ +--------------------+ |
+---------------------------------------+---------------------------------------+
                                        | mysql2 / Connection Pool
                                        v
+-------------------------------------------------------------------------------+
|                    LOCAL MYSQL 8 RELATIONAL DATABASE                          |
|                                                                               |
|  • 27 Normalized Tables (InnoDB Engine, utf8mb4)                              |
|  • Parameterized Prepared Statements & Connection Pooling                     |
|  • Atomic Multi-Table Financial Transactions (withTransaction)                |
|  • Strict Foreign Key Constraints, Indexes, and Idempotency Keys              |
+-------------------------------------------------------------------------------+
```

---

## 3. Technology Stack Rationale

| Layer | Selected Tech | Architecture Rationale |
|---|---|---|
| **Frontend** | React 18 (Vite) | Lightning fast HMR, reactive state management, modular components. |
| **Styling** | Tailwind CSS | Utility-first FinTech theme with deep navy, electric blue, and emerald accents. |
| **Visualization** | Recharts | Composable SVG dashboard analytics for income trajectory and category distribution. |
| **Icons** | Lucide React | High-contrast, clean icons tailored for accessibility and responsiveness. |
| **Backend** | Node.js & Express.js | Asynchronous non-blocking event-driven runtime; enterprise REST API standards. |
| **Database** | MySQL 8 (Local) | Strict local requirement; ACID compliance, transactional guarantees, `mysql2` pooling. |
| **Auth** | JWT + Bcrypt | Stateless cryptographic authentication with salt rounds = 10; RBAC for Customer, Worker, Admin. |
| **FinTech** | Razorpay Sandbox + HMAC SHA-256 | Real payment gateway workflows with verifiable cryptographic signatures & idempotency. |
| **Invoicing** | PDFKit | Server-rendered downloadable tax invoices with customer and worker metadata. |
| **Realtime** | Socket.IO | Live notification alerts for dispatch offers, job milestone completions, and payment confirmations. |

---

## 4. Role-Based Access Control (RBAC) Matrix

| Resource / Capability | Public | Customer | Worker | Administrator |
|---|:---:|:---:|:---:|:---:|
| Browse Marketplace Workers | Yes | Yes | Yes | Yes |
| Browse Open Job Postings | Yes | Yes | Yes | Yes |
| AI Wage & Salary Calculator | Yes | Yes | Yes | Yes |
| Multilingual AI Chatbot | Yes | Yes | Yes | Yes |
| Post Job Requirement | No | **Yes** | No | Yes (Moderate) |
| Send Direct Hiring Request | No | **Yes** | No | No |
| Apply for Job Proposals | No | No | **Yes** | No |
| Mark Work Completed | No | No | **Yes** | No |
| Confirm Completion & Release Escrow | No | **Yes** | No | No |
| Digital Wallet Withdrawal Request | No | No | **Yes** | No |
| Log Trade Expenses | No | No | **Yes** | No |
| Audit Worker Credentials & Verification | No | No | No | **Yes** |
| Process / Approve Payouts | No | No | No | **Yes** |
| Investigate & Resolve Disputes | No | No | No | **Yes** |
| Review AI Fraud Alerts | No | No | No | **Yes** |
| Toggle User Account Suspension | No | No | No | **Yes** |

---

## 5. Security & Financial Integrity Model

1. **Zero Raw Password Storage**: Passwords are exclusively stored as one-way salted hashes using `bcryptjs` (cost factor 10).
2. **Tamper-Proof Transactions**: Financial state mutations use `withTransaction` blocks:
   ```javascript
   await connection.beginTransaction();
   // 1. Lock wallet row FOR UPDATE
   // 2. Insert transaction record
   // 3. Post double-entry credit ledger record
   // 4. Update available & lifetime balance
   // 5. Emit tax invoice
   await connection.commit();
   ```
3. **Idempotency Protection**: Every payment record requires an `idempotency_key` and unique `transaction_reference`. Replay attacks or duplicate submissions are blocked before reaching database mutation.
4. **Defense in Depth**: Express rate limiting (`express-rate-limit`), Helmet security headers, CORS origin verification, and strictly parameterized SQL queries prevent SQL injection and denial-of-service vectors.

