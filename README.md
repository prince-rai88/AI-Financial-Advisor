# 🚀 FinAI — Autonomous AI Financial Intelligence

> **Apple-inspired, high-precision financial intelligence platform.** Transform statements into crystal clarity with machine learning anomaly detection, predictive velocity forecasting, tactile glassmorphism, and an interactive 3D WebGL centerpiece.

**Live Demo:** [Web Application](https://ai-financial-advisor-rouge.vercel.app) • [API Endpoint](https://finai-backend-kmq3.onrender.com)

[![Status](https://img.shields.io/badge/status-live-brightgreen?style=flat-square)](https://ai-financial-advisor-rouge.vercel.app)
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20Three.js%20%7C%20Django%20%7C%20Supabase-00e599?style=flat-square)](https://github.com/prince-rai88/AI-Financial-Advisor)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/prince-rai88/AI-Financial-Advisor?style=flat-square)](https://github.com/prince-rai88/AI-Financial-Advisor)

---

## ✨ Highlights

- 💳 **Interactive 3D Apple Titanium Smart Card**: Sculptural Three.js WebGL card with 2K Retina texture, physical iridescence, 3D gold EMV microchip, holographic security band, dynamic pointer-tracking specular sheen, and live cardholder name binding.
- ⚡ **Zero-Friction Guest Mode**: Instant 1-click sandbox access to explore the complete suite of features with realistic deterministic financial data—no signup required, completely isolated from production user records.
- 🌫️ **Cinematic Glassmorphism**: Multi-depth frosted glass panels (`backdrop-filter`), luminous borders, ambient lighting fields, and smooth Framer Motion spring physics.
- 🧠 **Machine Learning Engine**: Real-time spending anomaly detection powered by `IsolationForest` (scikit-learn) and predictive 30-day velocity forecasting.
- 🔐 **Enterprise-Grade JWT Authentication**: Secure per-user data isolation with access/refresh token rotation and user-scoped database queries.
- 📤 **Instant Statement Ingestion**: High-throughput CSV/XLSX parser with automated schema normalization and smart category classification.
- 📊 **Dynamic Financial Visualizations**: Categorical expenditure breakdowns, cashflow trajectories, and interactive radar/doughnut distributions powered by Chart.js.

---

## 🧱 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Three.js, Framer Motion, Chart.js, Lucide Icons |
| **Backend** | Python 3.12+, Django 5, Django REST Framework, SimpleJWT |
| **Machine Learning** | Scikit-Learn (`IsolationForest`), Pandas, NumPy |
| **Database** | PostgreSQL (Supabase) |
| **Deployment** | Vercel (Frontend CI/CD), Render (Backend Web Service), Docker |

---

## 🧭 Architecture & Data Flow

```text
┌─────────────────┐       HTTPS / JSON       ┌────────────────────────┐
│  React 19 UI    │ ◄──────────────────────► │   Django REST API      │
│  Three.js 3D    │   (JWT / Guest Mode)     │  (Auth, Upload, CRUD)  │
│  Framer Motion  │                          └──────────┬─────────────┘
└─────────────────┘                                     │
                                            ┌───────────┴───────────┐
                                            ▼                       ▼
                                   ┌────────────────┐      ┌─────────────────┐
                                   │   Supabase DB  │      │    ML Engine    │
                                   │  (PostgreSQL)  │      │ IsolationForest │
                                   └────────────────┘      └─────────────────┘
```

---

## 🔌 API Overview

### Authentication & Sandbox
| Endpoint | Method | Description |
|---|---|---|
| `/api/register/` | `POST` | Create a new user account |
| `/api/login/` | `POST` | Authenticate and obtain JWT pair |
| `/api/refresh/` | `POST` | Refresh expired access token |
| `/api/user/` | `GET` | Retrieve current authenticated user profile |
| `/api/demo/transactions/` | `GET` | Isolated guest mode sandbox transaction data |
| `/api/demo/summary/` | `GET` | Isolated guest mode sandbox financial summary |
| `/api/demo/insights/` | `GET` | Isolated guest mode ML insights & anomalies |
| `/api/demo/budget/` | `GET` | Isolated guest mode 30-day predictive budget |

### User Financial Operations (Authenticated)
| Endpoint | Method | Description |
|---|---|---|
| `/api/upload/` | `POST` | Ingest and parse CSV/XLSX statement file |
| `/api/transactions/` | `GET, POST` | Query or manually create ledger entries |
| `/api/transactions/<id>/` | `PUT, DELETE` | Update or remove specific transaction |
| `/api/summary/` | `GET` | Real-time totals, net cashflow, and spending distribution |
| `/api/insights/` | `GET` | ML-driven anomaly detection and spending velocity |
| `/api/budget/` | `GET, POST` | 30-day budget prediction and category budget allocations |

---

## 📁 Sample Statement Ingestion CSV

```csv
date,description,amount
2026-03-01,Cloud Infrastructure Hosting,-149.00
2026-03-04,Client Retainer Invoice,4800.00
2026-03-08,Apple Hardware Store,-1299.00
2026-03-12,High-Speed Fiber Internet,-89.99
2026-03-15,Consulting Dividend,3500.00
```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
```env
DJANGO_SECRET_KEY=your-production-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost,your-domain.onrender.com
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,https://your-frontend.vercel.app
MAX_UPLOAD_SIZE_MB=10
DATABASE_URL=postgres://user:password@aws-0-region.pooler.supabase.com:6543/postgres
```

### Frontend (`frontend/.env` / `.env.production`)
```env
VITE_API_BASE_URL=https://finai-backend-kmq3.onrender.com/api/
```

---

## 🛠 Local Setup & Development

### 1. Clone Repository
```bash
git clone https://github.com/prince-rai88/AI-Financial-Advisor.git
cd AI-Financial-Advisor
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py test api  # Run automated test suite
python manage.py runserver 8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run lint  # Verify ESLint rules
npm run build # Test production build
npm run dev   # Start Vite local development server (http://localhost:5173)
```

---

## 👤 Author

**Prince Rai**  
- **GitHub:** [@prince-rai88](https://github.com/prince-rai88)  
- **LinkedIn:** [prince-rai-88pr127](https://www.linkedin.com/in/prince-rai-88pr127)  

⭐ **Star this repository if you find it inspiring or useful!**
