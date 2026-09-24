# ServiceHub — PROJECT CONTEXT

> **Purpose of this file**: Paste this into a new chat window for full project continuity.
> Last updated: Phase 4 complete. Next: Phase 5 (Comments + History + Notifications).

---

## 1. PROJECT GOAL

**ServiceHub** is a polished, resume-quality full-stack **Enterprise Service & Issue Management Platform**.

Demonstrates real-world skills in:
- Full-stack web development (FastAPI + React + TypeScript)
- JWT authentication and RBAC (Role-Based Access Control)
- Database design with SQLAlchemy + Alembic migrations
- SLA (Service Level Agreement) tracking with dynamic state
- Enterprise UX patterns (role-based dashboards, audit logs, notifications)

This is NOT a toy CRUD app — production-quality code with proper architecture.

---

## 2. CURRENT IMPLEMENTATION STATUS

| Phase | Name | Status |
|-------|------|--------|
| 0 | Planning & Architecture | COMPLETE |
| 1 | Project Foundation | COMPLETE |
| 2 | Database + Seed Data | COMPLETE |
| 3 | Authentication + Authorization | COMPLETE |
| 4 | Core Tickets | COMPLETE |
| 5 | Comments + History + Notifications | NEXT |
| 6 | SLA System UI | Pending |
| 7 | Notifications + Search/Filter | Pending |
| 8 | Frontend Dashboards (per role) | Pending |
| 9 | Admin Features | Pending |
| 10 | Testing + Quality | Pending |
| 11 | Docker + Deployment Prep | Pending |
| 12 | Final Polish + Docs | Pending |

---

## 3. TECHNOLOGIES

### Backend
- Python 3.10+, FastAPI >=0.110.0, Uvicorn >=0.28.0
- SQLAlchemy >=2.0.28, Alembic >=1.13.0
- Pydantic v2 >=2.6.0, pydantic-settings >=2.2.0
- python-jose[cryptography] (JWT), passlib[bcrypt]
- psycopg2-binary (PostgreSQL driver)
- pytest + httpx (testing)

### Frontend
- React 19, TypeScript 6, Vite 8
- React Router 7, Axios 1.x
- Tailwind CSS v4 (@tailwindcss/postcss — NOT v3 syntax)
- lucide-react, recharts, clsx, tailwind-merge

### Infrastructure
- PostgreSQL 15 (Docker), SQLite (local dev via DATABASE_URL in .env)
- Docker + Docker Compose

---

## 4. FOLDER STRUCTURE

```
d:\Collage_STuffs\Other_things\Enterprice_project\
├── .env                    # Active env vars (SQLite dev DB)
├── .env.example
├── .gitignore
├── docker-compose.yml
├── tasks.md
├── DEVELOPMENT_STATUS.md
├── PROJECT_CONTEXT.md      # THIS FILE
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── pytest.ini
│   ├── servicehub.db       # SQLite dev database
│   ├── test_auth.db, test_shared.db, test_tickets.db
│   ├── alembic/            # DB migration scripts
│   ├── tests/              # pytest test files
│   └── app/
│       ├── main.py         # FastAPI app + CORS middleware
│       ├── config.py       # Pydantic Settings (reads .env)
│       ├── database.py     # SQLAlchemy engine + get_db()
│       ├── seed.py         # Seed roles, depts, users, SLA, tickets
│       ├── api/v1/
│       │   ├── router.py           # Central API router
│       │   ├── auth.py             # register, login, login/json, /me
│       │   ├── tickets.py          # Full ticket CRUD + assign + status + priority
│       │   ├── users.py            # List users (Admin only)
│       │   ├── departments.py      # List departments (public)
│       │   ├── categories.py       # List categories (public, optional dept filter)
│       │   └── health.py           # Health check
│       ├── core/
│       │   ├── dependencies.py     # get_current_user, get_current_active_user, RoleChecker
│       │   ├── security.py         # verify_password, get_password_hash, create_access_token
│       │   └── ticket_rules.py     # validate_status_transition, compute_sla_deadline, calculate_dynamic_sla
│       ├── models/
│       │   ├── __init__.py         # Re-exports all models + enums
│       │   ├── enums.py            # UserRoleEnum, TicketStatusEnum, TicketPriorityEnum, SLAStatusEnum
│       │   ├── user.py, role.py, department.py, category.py
│       │   ├── ticket.py, comment.py, history.py
│       │   ├── notification.py, audit.py, sla.py
│       └── schemas/
│           ├── __init__.py
│           ├── auth.py             # Token, LoginRequest, TokenData
│           ├── user.py             # UserCreate, UserResponse, DepartmentOut, RoleOut
│           ├── ticket.py           # TicketCreate, TicketResponse, TicketPaginationResponse, etc.
│           └── category.py         # CategoryOut
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts      # Proxy /api -> localhost:8000
    ├── tailwind.config.js, postcss.config.js
    └── src/
        ├── App.tsx             # Routes + AuthProvider
        ├── index.css, App.css
        ├── api/
        │   ├── client.ts       # Axios instance with Bearer token interceptor
        │   ├── auth.ts         # login, register, getMe
        │   └── tickets.ts      # fetchTickets, getTicket, create, updateStatus, assign, updatePriority, fetchDepts, fetchCategories
        ├── context/AuthContext.tsx   # user, token, login(), logout(), isAuthenticated
        ├── hooks/useAuth.ts          # useContext(AuthContext) wrapper
        ├── types/
        │   ├── auth.ts         # User, Department interfaces
        │   └── ticket.ts       # Ticket, TicketCreatePayload, TicketPagination, Category types
        ├── components/
        │   ├── layout/ProtectedLayout.tsx    # Route guard + sidebar navigation
        │   ├── common/StatusBadge.tsx, PriorityBadge.tsx
        │   └── tickets/TicketCard.tsx, TicketFormModal.tsx
        └── pages/
            ├── DashboardPage.tsx
            ├── auth/LoginPage.tsx, RegisterPage.tsx
            └── tickets/TicketListPage.tsx, TicketDetailPage.tsx
```

---

## 5. DATABASE SCHEMA

### roles
id PK | name (EMPLOYEE/SUPPORT_AGENT/MANAGER/ADMIN) | description

### departments
id PK | name (unique) | description | created_at

### users
id PK | email (unique) | hashed_password | full_name | is_active | created_at
FK: role_id -> roles.id | department_id -> departments.id (nullable)

### categories
id PK | name (unique) | description | department_id FK (nullable)

### sla_policies
id PK | priority (unique enum) | resolution_time_hours | description
Default: CRITICAL=4h, HIGH=8h, MEDIUM=24h, LOW=72h

### tickets
id PK | title | description
FK: creator_id, assigned_agent_id (nullable) -> users.id
FK: department_id -> departments.id | category_id -> categories.id
priority (LOW/MEDIUM/HIGH/CRITICAL) | status (OPEN/ASSIGNED/IN_PROGRESS/RESOLVED/CLOSED/REOPENED)
sla_deadline | created_at | updated_at | resolved_at | closed_at

### comments
id PK | ticket_id FK | author_id FK | content (text) | is_internal (bool) | created_at

### ticket_history
id PK | ticket_id FK | actor_id FK | action (string) | old_value | new_value | timestamp

### notifications
id PK | user_id FK | title | message | ticket_id FK (nullable) | is_read (bool) | created_at

### audit_logs
id PK | actor_id FK (nullable) | action | entity | entity_id | details | ip_address | timestamp

---

## 6. COMPLETE API ENDPOINTS

Base URL: /api/v1

### Auth (/auth)
POST /auth/register        - Public. Register new user (EMPLOYEE auto-assigned)
POST /auth/login           - Public. OAuth2 form login -> JWT
POST /auth/login/json      - Public. JSON body login -> JWT
GET  /auth/me              - Bearer. Get current user

### Tickets (/tickets)
POST   /tickets                    - Bearer (all roles). Create ticket
GET    /tickets                    - Bearer. List (role-scoped, paginated, filterable: status, priority, department_id, category_id, search, page, size)
GET    /tickets/{id}               - Bearer. Get ticket detail
PATCH  /tickets/{id}/status        - Bearer. Update status (state machine enforced)
PATCH  /tickets/{id}/assign        - Agent/Manager/Admin. Assign to agent
PATCH  /tickets/{id}/priority      - Agent/Manager/Admin. Change priority + recalc SLA

### Other
GET /health          - Public. Health check
GET /departments     - Public. List all departments
GET /categories      - Public. List categories (optional ?department_id=N)
GET /users           - Admin only. List all users

---

## 7. RBAC

| Action | EMPLOYEE | SUPPORT_AGENT | MANAGER | ADMIN |
|--------|----------|---------------|---------|-------|
| Create ticket | YES | YES | YES | YES |
| View own tickets only | YES | NO | NO | NO |
| View dept tickets | NO | YES | YES | YES |
| View all tickets | NO | NO | NO | YES |
| Change status | REOPEN only | YES | YES | YES |
| Assign ticket | NO | self-only | YES | YES |
| Change priority | NO | YES | YES | YES |
| List all users | NO | NO | NO | YES |

---

## 8. TICKET STATE MACHINE (backend enforced)

OPEN       -> ASSIGNED, IN_PROGRESS, CLOSED
ASSIGNED   -> IN_PROGRESS, RESOLVED, CLOSED
IN_PROGRESS -> RESOLVED, ASSIGNED, CLOSED
RESOLVED   -> CLOSED, REOPENED
CLOSED     -> REOPENED
REOPENED   -> IN_PROGRESS, ASSIGNED, RESOLVED, CLOSED

Enforced in: backend/app/core/ticket_rules.py -> validate_status_transition()

---

## 9. SLA SYSTEM

- Deadline = created_at + resolution_time_hours (from sla_policies by priority)
- Fallback if no policy found: 48h
- Dynamic SLA status computed on every GET (not stored):
  - SAFE: >25% time remaining
  - AT_RISK: <=25% time remaining
  - BREACHED: deadline passed
- Resolved/closed tickets: check resolved_at vs deadline
- Priority change: recalculates sla_deadline from original created_at

---

## 10. ENVIRONMENT VARIABLES

File: .env in project root

PROJECT_NAME="ServiceHub Enterprise Platform"
VERSION="1.0.0"
ENVIRONMENT="development"
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=servicehub
DATABASE_URL=sqlite:///./servicehub.db    <- SQLite for local dev, no PostgreSQL needed
SECRET_KEY=DEV_SECRET_KEY_CHANGE_IN_PRODUCTION_SERVICEHUB_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

Docker Compose overrides DATABASE_URL with PostgreSQL connection string.

---

## 11. FRONTEND AUTH FLOW

1. Login form -> POST /api/v1/auth/login/json
2. JWT stored in localStorage as "servicehub_token"
3. User object stored as "servicehub_user"
4. AuthContext provides { user, token, login, logout, isAuthenticated }
5. useAuth() hook wraps the context
6. ProtectedLayout checks isAuthenticated -> redirect to /login if not
7. Axios client.ts interceptor attaches Authorization: Bearer <token>
8. On 401 response -> clears localStorage automatically

---

## 12. SEED DATA (backend/app/seed.py)

Run: python app/seed.py (from backend/)

Creates:
- Roles: EMPLOYEE, SUPPORT_AGENT, MANAGER, ADMIN
- Departments: IT, HR, Finance, Operations, Customer Support
- SLA Policies: CRITICAL=4h, HIGH=8h, MEDIUM=24h, LOW=72h
- ~15 Categories linked to departments
- Demo users (password: password123):
  - admin@servicehub.com    - ADMIN
  - manager@servicehub.com  - MANAGER (IT dept)
  - agent1@servicehub.com   - SUPPORT_AGENT (IT dept)
  - agent2@servicehub.com   - SUPPORT_AGENT (HR dept)
  - emp1@servicehub.com     - EMPLOYEE (IT dept)
  - emp2@servicehub.com     - EMPLOYEE (Finance dept)
- ~10 sample tickets in various states with history

---

## 13. HOW TO RUN

### Local Dev (SQLite, no Docker)

Backend:
  cd backend
  pip install -r requirements.txt
  python app/seed.py        # first time only
  uvicorn app.main:app --reload --port 8000

Frontend:
  cd frontend
  npm install
  npm run dev               # http://localhost:3000

API Docs: http://localhost:8000/api/v1/docs

### Tests
  cd backend
  pytest -v

### Docker (PostgreSQL)
  docker compose up --build

---

## 14. IMPORTANT ARCHITECTURAL DECISIONS

1. SQLite for local dev: DATABASE_URL=sqlite:///./servicehub.db in .env
2. Pydantic v2: all schemas use ConfigDict(from_attributes=True) NOT orm_mode=True
3. Tailwind CSS v4: uses @tailwindcss/postcss in postcss.config.js (NOT v3 tailwindcss plugin)
4. JWT in localStorage: key "servicehub_token"
5. SLA status is DYNAMIC: computed on read, not stored as a DB column
6. Comment.is_internal: already in DB model. Employees cannot see internal comments.
7. TicketHistory: already being written on every status/assign/priority change
8. AuditLog: already written for auth events and ticket creation
9. Notifications: already created on status change and assignment - just need API to read them
10. Alembic: run "alembic upgrade head" for migrations

---

## 15. PHASE 5 - NEXT IMPLEMENTATION PLAN

### Backend Steps:

STEP 1 - Comments API (add to tickets.py or new comments.py):
  POST /api/v1/tickets/{ticket_id}/comments
    Body: { content: str, is_internal: bool = false }
    - EMPLOYEE cannot post internal comments (raise 403)
    - Returns CommentResponse

  GET /api/v1/tickets/{ticket_id}/comments
    - EMPLOYEE cannot see is_internal=True comments (filter them out)
    - Returns List[CommentResponse]

STEP 2 - History API:
  GET /api/v1/tickets/{ticket_id}/history
    - Returns List[TicketHistoryResponse]
    - Ordered by timestamp ASC

STEP 3 - Notifications API (new notifications.py):
  GET  /api/v1/notifications         - Current user notifications (ordered by created_at DESC)
  PATCH /api/v1/notifications/{id}/read  - Mark single as read
  PATCH /api/v1/notifications/read-all   - Mark all as read for current user

STEP 4 - New Schemas:
  schemas/comment.py:    CommentCreate, CommentResponse
  schemas/history.py:    TicketHistoryResponse
  schemas/notification.py: NotificationResponse

### Frontend Steps:

STEP 5 - TicketDetailPage upgrade:
  - Comment list below ticket details
  - Add Comment form (textarea + is_internal toggle for agents/managers/admins)
  - Activity timeline showing history events

STEP 6 - Header notification bell:
  - Bell icon in ProtectedLayout header
  - Unread count badge
  - Dropdown with recent notifications
  - Mark as read on click

STEP 7 - New API functions:
  src/api/tickets.ts:
    getTicketCommentsApi(ticketId)
    addCommentApi(ticketId, content, is_internal)
    getTicketHistoryApi(ticketId)
  src/api/notifications.ts:
    getNotificationsApi()
    markNotificationReadApi(id)
    markAllNotificationsReadApi()

STEP 8 - New TypeScript types:
  src/types/comment.ts:       Comment, CommentCreate
  src/types/notification.ts:  Notification

---

## 16. GIT COMMIT SUGGESTIONS

Phase 5 commit message:
  feat: Phase 5 - comments, activity timeline, and notifications

  - Backend: POST/GET /tickets/{id}/comments with internal flag and role visibility
  - Backend: GET /tickets/{id}/history endpoint
  - Backend: GET/PATCH /notifications endpoints
  - Frontend: Comment section and activity timeline on TicketDetailPage
  - Frontend: Notification bell in header with unread badge
