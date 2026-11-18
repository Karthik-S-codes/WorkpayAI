# WorkPay AI — Windows Local Setup & MySQL Guide

This guide walks you through starting MySQL Server, initializing the `workpay_ai` database, and launching the full-stack application on your Windows laptop.

---

## 1. Prerequisites Checklist

- **Windows OS** (Windows 10 / 11)
- **Node.js** v18+ or v20+ (`node -v`)
- **npm** v9+ or v10+ (`npm -v`)
- **MySQL 8.0 Community Server** installed on your system (`C:\Program Files\MySQL\MySQL Server 8.0`)

---

## 2. Starting MySQL Server on Windows

On your Windows laptop, MySQL 8 is configured as a background Windows Service named **`MySQL80`**.

### Method A: Start via Windows Command Prompt / PowerShell (Recommended)
1. Press the **Windows Key**, type `cmd` or `powershell`.
2. Right-click and choose **Run as Administrator**.
3. Execute the service start command:
   ```cmd
   net start MySQL80
   ```
   *(Or in Administrator PowerShell: `Start-Service MySQL80`)*
4. You will see:
   ```
   The MySQL80 service was started successfully.
   ```

### Method B: Start via Windows Services GUI
1. Press `Win + R`, type `services.msc`, and press **Enter**.
2. Scroll down alphabetically to locate **`MySQL80`** (or `MySQL`).
3. If Status is not "Running", right-click on it and click **Start**.

### Method C: If MySQL Server is Not Yet Installed
If you ever need to reinstall or install MySQL on another laptop:
1. Download **MySQL Installer for Windows** from the official portal:  
   `https://dev.mysql.com/downloads/installer/`
2. Run the installer and select **Developer Default** or **Server only + MySQL Workbench**.
3. In the Configuration Wizard:
   - Port: `3306`
   - Authentication Method: **Use Strong Password Encryption (Recommended)**
   - Enter your chosen `root` password. **Note down this password**.
   - Complete installation and verify the Windows Service `MySQL80` is marked to run automatically.

---

## 3. Configuring Database Credentials in WorkPay AI

Open `backend/.env` in your editor:

```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MySQL 8 Local Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_ACTUAL_LOCAL_MYSQL_PASSWORD
DB_NAME=workpay_ai

# Security
JWT_SECRET=workpay_ai_jwt_dev_secret_key_889214_college_major_project
JWT_EXPIRES_IN=7d

# FinTech / Sandbox Mode
PAYMENT_GATEWAY_MODE=sandbox
RAZORPAY_KEY_ID=rzp_test_workpayai2026
RAZORPAY_KEY_SECRET=rzp_secret_dummy_test_key_workpay

# AI Engine (Optional Gemini key; algorithmic fallback is built-in)
GEMINI_API_KEY=
```

> **Important**: Replace `YOUR_ACTUAL_LOCAL_MYSQL_PASSWORD` with your real Windows MySQL root password.

---

## 4. Initializing the Database (`database/workpay_ai.sql`)

Once MySQL is running and your `DB_PASSWORD` is configured in `backend/.env`, initialize all 27 tables and rich sample data with one command:

```bash
cd backend
npm run db:init
```

### What this automated command does:
1. Connects to `localhost:3306` using `mysql2`.
2. Creates the database `workpay_ai` if it does not already exist.
3. Executes `database/workpay_ai.sql`.
4. Populates all 14 categories, trade skills, sample verified workers, demo customers, jobs, wallets, ledger entries, and admin credentials.

*(Alternatively, you can open `database/workpay_ai.sql` in **MySQL Workbench** and execute the entire script).*

---

## 5. Running the Application

### Start the Backend API Server
Open a terminal in the project folder:
```bash
cd backend
npm start
```
- Server boots at: **`http://localhost:5000`**
- Healthcheck endpoint: **`http://localhost:5000/api/health`**
- Socket.IO real-time channel connects automatically.

### Start the React + Vite Frontend
Open a second terminal window:
```bash
cd frontend
npm run dev
```
- Frontend application opens at: **`http://localhost:5180`** (or `http://localhost:5174` if 5173/5180 are in use)

---

## 6. Pre-Configured Demo Accounts for Evaluation

All demo accounts use the standard password: **`Password123!`**

| Role | Email | Password | Pre-seeded Features |
|---|---|---|---|
| **Administrator** | `admin@workpay.ai` | `Password123!` | User management, worker verifications, category management, dispute resolution, AI fraud alerts, GMV analytics. |
| **Customer** | `customer.demo@workpay.ai` | `Password123!` | Posted jobs, active hiring requests, digital escrow payments, instant PDF invoices. |
| **Worker (Electrician)** | `ramesh.electrician@workpay.ai` | `Password123!` | 7.5 yrs exp, verified badge, digital wallet ledger with ₹4,850 balance, reviews, AI income insights. |
| **Worker (Plumber)** | `suresh.plumber@workpay.ai` | `Password123!` | 6.0 yrs exp, verified badge, pipe leak detection, ₹3,200 wallet balance. |
| **Worker (Cook & Chef)** | `anita.cook@workpay.ai` | `Password123!` | 5.0 yrs exp, certified culinary expert, regional South/North Indian meal prep. |

> **Pro Tip**: The Login page features **1-Click Demo Buttons** so evaluators and examiners can sign into any role instantly without typing!

---

## 7. Troubleshooting Common Errors

| Error | Root Cause | Solution |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL Service is not running | Run `net start MySQL80` in Administrator Command Prompt. |
| `ER_ACCESS_DENIED_ERROR` | Incorrect password in `backend/.env` | Update `DB_PASSWORD` in `backend/.env` with your real MySQL root password. |
| `ER_BAD_DB_ERROR` | Database `workpay_ai` not created yet | Run `npm run db:init` inside `backend`. |
| Port 5000 already in use | Stale Node process | In PowerShell run: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force` |

