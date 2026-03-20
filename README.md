# AI Finance Advisor

AI-powered personal finance application built with Django + React.

## Features
- JWT auth
- Secure per-user transactions
- CSV/XLSX ingestion with categorization
- Summary and chart analytics
- ML-powered insights (`/api/insights/`) using `scikit-learn`
- Responsive dashboard with toast notifications and loading skeletons

## Local Setup

### 1) Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment
Backend reads env vars from `backend/.env`.

Important:
- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `MAX_UPLOAD_SIZE_MB`

## Production
- `Procfile` included
- Gunicorn config at `backend/gunicorn.conf.py`
- Dockerfile included

Run with Gunicorn:
```bash
cd backend
gunicorn backend.wsgi:application -c gunicorn.conf.py
```

## API Endpoints
- `POST /api/register/`
- `POST /api/login/`
- `POST /api/refresh/`
- `GET /api/user/`
- `POST /api/upload/`
- `GET /api/transactions/`
- `GET /api/summary/`
- `GET /api/insights/`
