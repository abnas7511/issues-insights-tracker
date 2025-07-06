# Issues & Insights Tracker

A full-stack, production-ready portal for file-based feedback and analytics. Built with React (Vite, TypeScript, Tailwind), FastAPI, PostgreSQL, Celery, Redis, and Docker Compose.

---

## 🚀 Architecture Overview

**Frontend:**  
- React 18 (Vite, TypeScript, Tailwind CSS)
- Zustand for state management
- Clerk for authentication (email/password + Google OAuth)
- React Router, Recharts, React Hook Form, Dropzone, etc.

**Backend:**  
- FastAPI (Python)
- SQLAlchemy ORM, Alembic migrations
- JWT authentication with RBAC (ADMIN, MAINTAINER, REPORTER)
- WebSockets for real-time updates
- File uploads (local disk)
- Celery for background jobs (with Redis broker)
- PostgreSQL 15+ for persistent storage

**Other Services:**  
- Redis (for Celery and caching)
- Docker Compose for orchestration
- Playwright for E2E tests

**Service Interaction:**  
1. Users interact with the React frontend.
2. Frontend communicates with FastAPI backend via REST/WebSocket.
3. Backend persists data in PostgreSQL, manages auth, RBAC, and file uploads.
4. Background worker aggregates stats every 30 min.
5. Real-time updates via WebSocket.
6. All services run together via Docker Compose.

---

## ⚙️ How to Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm
- PostgreSQL 15+ (local or Docker)
- Redis (local or Docker)

### 1. Backend Setup

 You can refer the Readme inside the `backend` folder for backend setup instructions.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Set API base URL, Clerk keys, etc.
npm run dev
```
- Open http://localhost:5173

---

## 🐳 How to Run with Docker Compose

1. Build and start all services:
   ```bash
   docker compose up --build
   ```
2. Run DB migrations (in another terminal):
   ```bash
   docker compose exec backend alembic upgrade head
   ```
3. Access:
   - Frontend: http://localhost:3000 (or as mapped)
   - API docs: http://localhost:8000/api/docs
   - DB: localhost:5432 (see docker-compose.yml for credentials)

To stop:
```bash
docker compose down
```

---

## 🧪 Testing

### Backend
- Run unit/integration tests:
  ```bash
  cd backend
  pytest --cov
  ```
- Coverage report: 86%

### Frontend
- Run E2E tests (Playwright):
  ```bash
  npx playwright test
  ```

---

## 🏗️ CI/CD (GitHub Actions)
- Lint, test, and build for both frontend and backend
- Build Docker images
- Run DB migrations
- See `.github/workflows/ci.yml`

---

## ⚖️ Trade-offs & Design Choices

- **React (Vite):** Chosen for ecosystem, speed, and flexibility.
- **FastAPI:** Async, type-safe, auto OpenAPI docs, explicit RBAC.
- **Docker Compose:** One-command launch, easy local dev.
- **RBAC:** Enforced in both backend routes and UI.
- **WebSocket:** Simple, low-latency realtime.
- **Celery:** Reliable background jobs.
- **Testing:** High backend coverage, E2E happy path.
- **Observability:** Structured logging.

---

## 📂 Project Structure

```
project/
├── backend/         # FastAPI app, DB models, migrations, worker
├── frontend/        # React app (Vite, Tailwind)
├── e2e/             # Playwright E2E tests
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

---

## Additional Feature

- PDF/image preview in issue detail
- Dark mode toggle


## future improvements
- Production-grade monitoring
- Deploy to Fly.io/Render/Railway
- More granular RBAC

---

## 📝 How to Contribute

1. Fork & clone the repo
2. Create a feature branch
3. Commit with clear messages
4. Open a PR

---

## ℹ️ Assessment Notes

- All generative tools used are documented in this repo/chat
- See video demo for E2E flow
- You can check for Readmes inside frontend and backend to get more knowledge about APIS routes and all
