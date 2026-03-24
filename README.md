# 🚀 AI Financial Advisor

**AI-powered personal finance SaaS** that transforms statements into clarity — track spending, detect anomalies, and forecast budgets with machine learning.

**Live:** [Frontend](https://ai-financial-advisor-rouge.vercel.app) • [Backend](https://finai-backend-kmq3.onrender.com)

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Django%20%7C%20PostgreSQL-6c63ff)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stars](https://img.shields.io/github/stars/prince-rai88/AI-Financial-Advisor?style=social)

---

## ✨ Features
- 🔐 **JWT authentication** with secure per-user data isolation  
- 📤 **CSV/XLSX upload** for fast statement ingestion  
- 📊 **Dashboard analytics** with trends and summaries  
- 🧠 **ML insights** (anomaly detection + spending trends)  
- 💸 **Budget prediction** for the next 30 days  
- 🧾 **Expense tracking** with categories and filters  

---

## 🧱 Tech Stack

**Frontend**
- React, Vite, Tailwind CSS, Chart.js

**Backend**
- Django, Django REST Framework, JWT (SimpleJWT)

**Database**
- PostgreSQL (Supabase)

**Deployment**
- Vercel, Render, Docker

---

## 🧩 Architecture
**React → Django API → PostgreSQL → ML Layer**

---

## 🧭 How It Works
1. Sign up and log in with JWT authentication  
2. Upload a CSV/XLSX financial statement  
3. Transactions are parsed and categorized  
4. ML layer detects anomalies and trends  
5. Dashboard updates with insights and budget prediction  

---

## 🖼 Screenshots
_Add your product screenshots here (Dashboard, Transactions, Insights, Budget)._

---

## 🔌 API Overview
```http
POST /api/register/
POST /api/login/
POST /api/refresh/
GET  /api/user/
POST /api/upload/
GET  /api/transactions/
GET  /api/summary/
GET  /api/insights/
GET  /api/budget/
```

---

## 📁 Sample CSV
```csv
date,description,amount
2025-01-12,Swiggy Order,-450
2025-01-15,Uber Ride,-320
2025-01-20,Salary,50000
```

---

## ⚙️ Environment Variables

**Backend (`backend/.env`)**
```env
DJANGO_SECRET_KEY=your-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173
MAX_UPLOAD_SIZE_MB=10
DATABASE_URL=postgres://user:pass@host:5432/db
```

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

---

## 🛠 Local Setup

### Backend
```bash
cd backend
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

---

## 👤 Author
**Prince Rai**  
- GitHub: https://github.com/prince-rai88  
- LinkedIn: https://www.linkedin.com/in/prince-rai-88pr127  

⭐ **Star this repo if you found it useful**
