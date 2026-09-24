# ServiceHub — Enterprise Service & Issue Management Platform

ServiceHub is a polished, full-stack Enterprise Service Management application built with a modern tech stack (FastAPI, React, TypeScript, PostgreSQL, and Docker). It features role-based access control (RBAC), Service Level Agreement (SLA) tracking, an internal commenting system, activity timelines, notifications, and interactive role-specific dashboards.

## 🚀 Features

- **Role-Based Access Control (RBAC):** Distinct roles (Employee, Support Agent, Manager, Admin) determining ticket visibility and actions.
- **Dynamic SLA Tracking:** Real-time SLA countdowns with `SAFE`, `AT_RISK`, and `BREACHED` status badges.
- **Ticket Lifecycle Management:** Strict state machine (Open -> Assigned -> In Progress -> Resolved -> Closed).
- **Communication & Audit:** Comments (including internal notes), activity timelines, and an admin audit log.
- **In-App Notifications:** Real-time updates for assignments and status changes.
- **Dashboards:** Interactive, role-aware dashboard statistics using `recharts`.
- **Admin Panel:** Complete management of users, departments, ticket categories, and SLA policies.

## 🛠️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- React Router 7
- Tailwind CSS v4
- Axios + Lucide React + Recharts

**Backend:**
- Python 3.10+ + FastAPI
- SQLAlchemy + Alembic (Migrations)
- PostgreSQL (via Docker) or SQLite (for local dev)
- JWT Authentication (python-jose, passlib)
- Pytest (23/23 passing test suite)

**Infrastructure:**
- Docker & Docker Compose (Multi-stage builds)
- Nginx (for serving the frontend and proxying API traffic)

## 📦 Quick Start (Docker Production)

The easiest way to get the application up and running is via Docker Compose.

1. Ensure Docker and Docker Compose are installed.
2. Clone the repository and navigate to the project root.
3. Start the services:
   ```bash
   docker compose up --build -d
   ```
4. Seed the initial database (only needed the first time):
   ```bash
   docker exec -it servicehub_backend python app/seed.py
   ```
5. Access the application:
   - Frontend: `http://localhost:3000`
   - API Docs: `http://localhost:8000/api/v1/docs`

*For more detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).*

## 💻 Local Development

If you prefer to run the application locally without Docker (using SQLite for the database):

**1. Start the Backend:**
```bash
cd backend
pip install -r requirements.txt
python app/seed.py  # Populates the initial SQLite database
uvicorn app.main:app --reload --port 8000
```

**2. Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🧑‍💻 Demo Users

Use these credentials to log in and test different roles (Password for all: `password123`):

- **Admin:** `admin@servicehub.com`
- **Manager:** `manager@servicehub.com`
- **Support Agent:** `agent1@servicehub.com`
- **Employee:** `emp1@servicehub.com`

## 🏗️ Architecture

ServiceHub is structured as a Modular Monolith:
- **`backend/`**: Contains the FastAPI application, divided into `/api` (endpoints), `/core` (auth & business rules), `/models` (SQLAlchemy entities), and `/schemas` (Pydantic validation).
- **`frontend/`**: The React SPA, structured by features (`/components`, `/pages`, `/api`, `/context`). It uses Axios interceptors for JWT token handling and React Router for protected navigation.