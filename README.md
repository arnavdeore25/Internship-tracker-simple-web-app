# Internship Application Tracker

A small full-stack app to track internship applications (company, role, status, notes).

**Stack:** Node.js + Express (REST API), PostgreSQL, React (Vite), Docker Compose.

## Run with Docker (one command)

```bash
docker compose up --build
```

Open http://localhost:8080

## Run locally without Docker

1. Start PostgreSQL and create a database called `tracker`.
2. Backend:
   ```bash
   cd backend && npm install
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/tracker npm start
   ```
3. Frontend (new terminal):
   ```bash
   cd frontend && npm install && npm run dev
   ```
   Open http://localhost:5173 (Vite proxies `/api` to the backend on port 4000).

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/applications?status=interview` | List (optional status filter) |
| POST | `/api/applications` | Create |
| PUT | `/api/applications/:id` | Update |
| DELETE | `/api/applications/:id` | Delete |

Statuses: `applied`, `interview`, `offer`, `rejected`.

## Ideas to extend

- User login (JWT)
- Edit form for an existing application
- Deploy it (Render / Railway) and add the live link to your resume
