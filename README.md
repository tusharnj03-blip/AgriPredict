# AgriPredict AI – Indian Crop Yield Prediction & Agricultural Risk Intelligence System

**Production-grade, database-driven agricultural technology SaaS platform for Indian agriculture.**  
Designed and built for MCA Project Evaluation and enterprise deployment.

---

## 🌾 Overview

AgriPredict AI is an end-to-end intelligent agricultural management platform tailored to Indian agro-climatic zones. It integrates machine learning yield forecasting, multi-hazard risk assessment, crop recommendation, soil health evaluation, and an administrator governance console with live telemetry and database-driven analytics.

### Key Capabilities
- **ML Crop Yield Prediction:** Feature-engineered regression with 95% confidence intervals and SHAP feature impact analysis (metric units: tonnes/hectare).
- **Risk Intelligence Engine:** Deterministic multi-dimensional risk matrix (drought, flood, heat stress, water availability, soil pH degradation, and market volatility).
- **Crop Recommendation:** Suitability ranking across 17 major Indian Kharif/Rabi crops based on NPK, soil pH, rainfall, and temperature profiles.
- **Permanent Admin Console:** Complete user management, activity telemetry, system health monitoring, audit logs, and dynamic platform analytics.
- **Secure Authentication & RBAC:** Argon2id/bcrypt password hashing, stateless JWT authorization, strict rate-limiting, and server-side role enforcement.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Backend API** | FastAPI (Python 3.10+ / 3.14+), Uvicorn, Pydantic v2 |
| **Database & ORM** | SQLite / PostgreSQL, SQLAlchemy 2.0 ORM |
| **Authentication** | JWT (python-jose), Password Hashing (bcrypt), OAuth2 Bearer |
| **Testing** | pytest, FastAPI TestClient, httpx |

---

## 🔒 Permanent Administrator Configuration

Admin accounts are managed strictly through server-side configuration and secure bootstrap commands. **No demo passwords or public admin registration exist.**

### Environment Variables (`backend/.env`)
```ini
ADMIN_NAME=System Administrator
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=Your_Strong_Unique_Password
```

### Bootstrap Command
To bootstrap or verify the administrator account:
```powershell
cd backend
python -m app.cli create-admin
```
- If the account already exists, **no duplicates are created** and the existing password is preserved.
- Passwords must meet minimum security criteria (>= 8 characters, uppercase, digit).
- Admins can securely change their password at any time via the **Admin Settings** page (`/admin/settings`).

---

## 🚀 Quickstart & Localhost Startup Commands

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher & npm

### 1. Backend Setup & Startup
```powershell
# Navigate to backend directory
cd C:\Users\tt665\OneDrive\Desktop\AgriPredict\backend

# Install backend dependencies
pip install -r requirements_runtime.txt

# Bootstrap database and permanent administrator
python -m app.cli create-admin

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Frontend Setup & Startup
```powershell
# In a new terminal, navigate to frontend directory
cd C:\Users\tt665\OneDrive\Desktop\AgriPredict\frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Automated Tests

AgriPredict AI includes an automated test suite covering authentication security, role authorization, CRUD operations, prediction pipelines, admin analytics, and report privacy.

```powershell
cd C:\Users\tt665\OneDrive\Desktop\AgriPredict\backend
python -m pytest tests/test_suite.py -v
```

All 37 test cases execute against an isolated test database without modifying production records.

---

## 💾 Database Backup & Disaster Recovery

The system provides built-in backup and restoration procedures:

```powershell
cd C:\Users\tt665\OneDrive\Desktop\AgriPredict\backend

# Create a timestamped backup:
python -m app.cli backup-db

# Restore from a backup file:
python -m app.cli restore-db backups/agripredict_backup_YYYYMMDD_HHMMSS.db
```

---

## 🛡️ Security Features
1. **No Hardcoded Credentials:** Administrator credentials reside exclusively in `.env`.
2. **Strict RBAC:** API endpoints enforce `get_admin_user` dependency server-side.
3. **Data Isolation:** User resources (farms, predictions, reports) are strictly scoped by `user_id`.
4. **Anti-Enumeration:** Authentication and password reset endpoints return non-revealing error responses.
5. **Rate-Limiting:** IP-based throttling on authentication endpoints prevents brute-force attacks.
6. **SPA Fallback:** Vite dev and preview servers configure `historyApiFallback: true` to prevent `ERR_FILE_NOT_FOUND` errors on page reloads.

