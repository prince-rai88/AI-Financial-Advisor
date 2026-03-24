# 🚀 AI Financial Advisor

**AI-powered personal finance SaaS** that turns raw statements into insights, budgets, and anomaly alerts.

**Live:** [Frontend (Vercel)](https://your-vercel-app.vercel.app) • [Backend (Render)](https://your-render-api.onrender.com)

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Django%20%7C%20PostgreSQL-6c63ff)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stars](https://img.shields.io/github/stars/prince-rai88/AI-Financial-Advisor?style=social)

---

## ✨ Features
- 🔐 **JWT authentication** with secure per-user data isolation
- 📤 **CSV/XLSX upload** with automatic parsing and categorization
- 📊 **Dashboards & charts** with clean, dark SaaS UI
- 🧠 **ML insights** (trend detection + anomaly detection)
- 🧾 **Transactions management** with search, filters, and pagination
- 💸 **Budget prediction** for the next 30 days

---

## 🧱 Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Chart.js

**Backend**
- Django + Django REST Framework
- JWT Auth (SimpleJWT)
- Scikit-learn

**Database**
- PostgreSQL (Supabase)

**Deployment**
- Frontend: Vercel
- Backend: Render (Docker)
- DB: Supabase PostgreSQL

---

## 🧩 Architecture (Brief)
- React frontend consumes REST APIs from Django.
- Django parses uploads, stores transactions, and runs ML services.
- ML layer generates insights, anomalies, and budget predictions.

---

## 🧭 How It Works
1. **Sign up / log in**
2. **Upload a statement (CSV/XLSX)**
3. **Transactions are parsed and categorized**
4. **Insights & anomalies are computed**
5. **Dashboards update in real-time**

---

## 🖼 Screenshots
> Add screenshots here (Dashboard, Transactions, Insights, Budget)

---

## 🔌 API Overview
- `POST /api/register/`
- `POST /api/login/`
- `POST /api/refresh/`
- `GET /api/user/`
- `POST /api/upload/`
- `GET /api/transactions/`
- `GET /api/summary/`
- `GET /api/insights/`
- `GET /api/budget/`

---

## 📁 Sample CSV
Example format (headers required):
```
date,description,amount
2025-01-12,Swiggy Order,-450
2025-01-15,Uber Ride,-320
2025-01-20,Salary,50000
```

---

## ⚙️ Environment Variables

**Backend (`backend/.env`)**
```
DJANGO_SECRET_KEY=your-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173
MAX_UPLOAD_SIZE_MB=10
DATABASE_URL=postgres://user:pass@host:5432/db
```

**Frontend (`frontend/.env.development`)**
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

---

## 🛠 Local Setup

### Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Deployment
- **Frontend:** Vercel
- **Backend:** Render (Docker)
- **Database:** Supabase PostgreSQL

Make sure environment variables are configured in both platforms.

---

## 👤 Author
**Prince Rai**
- GitHub: https://github.com/prince-rai88
- LinkedIn: https://linkedin.com/in/your-link

If this helped you, **star the repo** ⭐ — it keeps the project moving.
