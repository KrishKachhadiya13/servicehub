# ServiceHub — Complete Project Context
> **Purpose**: Paste this file into a new chat window for full project continuity.
> **Last updated**: Phase 10 complete. Next: Phase 11 (Docker + Deployment Prep).
> **Test status**: 23/23 backend pytest PASS.

---

## 1. PROJECT GOAL

**ServiceHub** is a polished, resume-quality full-stack **Enterprise Service & Issue Management Platform**.

It demonstrates real-world skills in:
- Full-stack web development (FastAPI + React + TypeScript)
- JWT authentication and RBAC (Role-Based Access Control)
- Database design with SQLAlchemy + Alembic migrations
- SLA (Service Level Agreement) tracking with dynamic real-time state
- Enterprise UX patterns: role-based dashboards, audit logs, in-app notifications

This is NOT a toy CRUD app — it is production-quality code with proper architecture.

---

## 2. CURRENT IMPLEMENTATION STATUS

| Phase | Name | Status |
|-------|------|--------|
| 0  | Planning & Architecture            | COMPLETE |
| 1  | Project Foundation                 | COMPLETE |
| 2  | Database + Seed Data               | COMPLETE |
| 3  | Authentication + Authorization     | COMPLETE |
| 4  | Core Tickets                       | COMPLETE |
| 5  | Comments + History + Notifications | COMPLETE |
| 6  | SLA System + UI                    | COMPLETE |
| 7  | Notifications + Search/Filter/Pagination | COMPLETE |
| 8  | Frontend Dashboards (per role)     | COMPLETE |
| 9  | Admin Features                     | COMPLETE |
| 10 | Testing + Quality                  | COMPLETE |
| 11 | Docker + Deployment Preparation    | **NEXT** |
| 12 | Final Polish + README + Docs       | Pending |

---

## 3. TECHNOLOGIES & VERSIONS

### Backend
| Technology | Version/Notes |
|---|---|
| Python | 3.10+ |
| FastAPI | >=0.110.0 |
| Uvicorn | >=0.28.0 (standard extras) |
| SQLAlchemy | >=2.0.28 (Mapped/mapped_column ORM style) |
| Alembic | >=1.13.0 |
| Pydantic v2 | >=2.6.0 |
| pydantic-settings | >=2.2.0 |
| email-validator | >=2.1.0 |
| python-jose[cryptography] | >=3.3.0 (JWT) |
| passlib[bcrypt] | >=1.7.4 |
| python-multipart | >=0.0.9 (OAuth2 form) |
| psycopg2-binary | >=2.9.9 (PostgreSQL driver) |
| pytest | >=8.0.0 |
| httpx | >=0.27.0 (test client) |

### Frontend
| Technology | Version/Notes |
|---|---|
| React | ^19.2.8 |
| TypeScript | ~6.0.2 |
| Vite | ^8.3.0 |
| React Router | ^7.18.4 |
| Axios | ^1.20.0 |
| Tailwind CSS | ^4.3.3 (uses @tailwindcss/postcss — NOT v3 syntax) |
| lucide-react | ^1.47.0 |
| recharts | ^3.10.1 |
| clsx | ^2.1.1 |
| tailwind-merge | ^3.7.0 |
| oxlint | ^1.81.0 (linter) |

### Infrastructure
| Technology | Notes |
|---|---|
| PostgreSQL 15 | Via Docker in production |
| SQLite | Used locally in dev (auto-configured via DATABASE_URL in .env) |
| Docker + Docker Compose | Full-stack orchestration |

---

## 4. ARCHITECTURE

**Pattern**: Modular Monolith — React SPA (frontend) + FastAPI REST API (backend) + PostgreSQL DB

### Folder Structure (complete)

```
d:\Collage_STuffs\Other_things\Enterprice_project\
├── .env                        # Active env vars (SQLite dev mode)
├── .env.example                # Template without secrets
├── .gitignore
├── docker-compose.yml          # PostgreSQL + backend + frontend services
├── tasks.md                    # Phase-by-phase checklist
├── DEVELOPMENT_STATUS.md       # Current phase and known issues
├── PROJECT_CONTEXT.md          # This file
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── pytest.ini
│   ├── servicehub.db           # SQLite dev DB (auto-created by seed)
│   ├── alembic/                # DB migration scripts
│   ├── tests/
│   │   ├── conftest.py         # Shared test setup: SQLite test DB, seed, TestClient
│   │   ├── test_auth.py        # Auth endpoint tests
│   │   ├── test_tickets.py     # Ticket CRUD + state machine + SLA tests
│   │   ├── test_comments_history.py  # Comment + history endpoint tests
│   │   ├── test_admin.py       # Admin endpoints (dept, categories, SLA) tests
│   │   ├── test_database.py    # Model/DB integrity tests
│   │   └── test_health.py      # Health check test
│   └── app/
│       ├── __init__.py
│       ├── main.py             # FastAPI app instance + CORS middleware
│       ├── config.py           # Pydantic Settings (reads .env file)
│       ├── database.py         # SQLAlchemy engine, SessionLocal, Base, get_db()
│       ├── seed.py             # Seeds roles, depts, SLA, categories, demo users, sample tickets
│       ├── api/
│       │   └── v1/
│       │       ├── __init__.py
│       │       ├── router.py           # Central APIRouter combining all sub-routers
│       │       ├── health.py           # GET /health
│       │       ├── auth.py             # POST /auth/register, /login, /login/json, GET /auth/me
│       │       ├── tickets.py          # Full CRUD + /status, /assign, /priority, /comments, /history
│       │       ├── users.py            # GET /users, GET /users/{id} (Admin+Manager only)
│       │       ├── departments.py      # GET/POST /departments, PUT /departments/{id}
│       │       ├── categories.py       # GET/POST /categories, PUT /categories/{id}
│       │       ├── notifications.py    # GET /notifications, PATCH /notifications/{id}/read, PATCH /notifications/read-all
│       │       ├── audit.py            # GET /audit (Admin only, last 50 logs)
│       │       └── sla.py              # GET /sla, PUT /sla/{id} (Admin only)
│       ├── core/
│       │   ├── dependencies.py     # get_current_user, get_current_active_user, RoleChecker class
│       │   ├── security.py         # verify_password, get_password_hash, create_access_token
│       │   └── ticket_rules.py     # validate_status_transition, compute_sla_deadline, calculate_dynamic_sla
│       ├── models/
│       │   ├── __init__.py         # Re-exports all models and enums
│       │   ├── enums.py            # UserRoleEnum, TicketStatusEnum, TicketPriorityEnum, SLAStatusEnum
│       │   ├── role.py             # Role model
│       │   ├── department.py       # Department model
│       │   ├── user.py             # User model
│       │   ├── category.py         # Category model
│       │   ├── sla.py              # SLAPolicy model
│       │   ├── ticket.py           # Ticket model
│       │   ├── comment.py          # Comment model (with is_internal flag)
│       │   ├── history.py          # TicketHistory model
│       │   ├── notification.py     # Notification model
│       │   └── audit.py            # AuditLog model
│       └── schemas/
│           ├── __init__.py         # Exports all schemas
│           ├── auth.py             # Token, LoginRequest, TokenData
│           ├── user.py             # UserCreate, UserUpdate, UserResponse, RoleOut, DepartmentCreate, DepartmentOut
│           ├── category.py         # CategoryBase, CategoryCreate, CategoryOut
│           ├── ticket.py           # TicketCreate, TicketStatusUpdate, TicketAssign, TicketPriorityUpdate, TicketResponse, TicketPaginationResponse
│           ├── comment.py          # CommentCreate, CommentResponse
│           ├── history.py          # TicketHistoryResponse
│           ├── notification.py     # NotificationResponse
│           ├── audit.py            # AuditLogResponse
│           └── sla.py              # SLAPolicyBase, SLAPolicyUpdate, SLAPolicyOut
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts          # Dev proxy: /api -> http://localhost:8000
    ├── tailwind.config.js
    ├── postcss.config.js       # Uses @tailwindcss/postcss (Tailwind v4)
    ├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx             # Routes: login, register, dashboard, tickets, tickets/:id, admin
        ├── index.css           # Tailwind directives
        ├── App.css
        ├── api/
        │   ├── client.ts       # Axios instance, Bearer token interceptor, auto-redirect on 401
        │   ├── auth.ts         # loginApi, registerApi, getMeApi
        │   ├── tickets.ts      # fetchTicketsApi, getTicketApi, createTicketApi, updateStatus, assign, priority, comments, history, depts, categories
        │   ├── notifications.ts # getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi
        │   └── admin.ts        # dept CRUD, category CRUD, SLA get/update, audit logs fetch
        ├── context/
        │   └── AuthContext.tsx  # React context: user, token, login(), logout(), isAuthenticated
        ├── hooks/
        │   └── useAuth.ts       # useContext(AuthContext) convenience hook
        ├── types/
        │   ├── auth.ts          # User, Department interfaces
        │   ├── ticket.ts        # Ticket, TicketCreatePayload, TicketPagination, Category, TicketPriority, TicketStatus, SLAStatus
        │   ├── comment.ts       # Comment, CommentCreate, TicketHistory
        │   ├── notification.ts  # Notification
        │   └── audit.ts         # AuditLog
        ├── components/
        │   ├── layout/
        │   │   └── ProtectedLayout.tsx  # Route guard (redirects to /login), sidebar nav with notification bell
        │   ├── common/
        │   │   ├── StatusBadge.tsx      # Color-coded ticket status badge
        │   │   └── PriorityBadge.tsx    # Color-coded priority badge
        │   └── tickets/
        │       ├── SLATimer.tsx         # Live countdown timer with SAFE/AT_RISK/BREACHED styling
        │       ├── TicketCard.tsx        # Ticket summary card for list view
        │       └── TicketFormModal.tsx   # Create ticket modal form
        └── pages/
            ├── DashboardPage.tsx            # Role-aware dashboard with stats and charts (recharts)
            ├── auth/
            │   ├── LoginPage.tsx            # Login form with quick-fill role credential buttons
            │   └── RegisterPage.tsx         # Self-registration form (creates EMPLOYEE)
            ├── tickets/
            │   ├── TicketListPage.tsx       # Paginated ticket list with search, filters, sidebar
            │   └── TicketDetailPage.tsx     # Full ticket detail: info, SLA timer, comments, history timeline
            └── admin/
                ├── AdminPage.tsx            # Tabbed admin panel (users, departments, categories, SLA, audit)
                ├── DepartmentsTab.tsx       # Create/edit departments
                ├── CategoriesTab.tsx        # Create/edit categories
                └── SlaTab.tsx              # Edit SLA policy hours per priority
```

---

## 5. DATABASE SCHEMA (all 10 tables)

### `roles`
- `id` PK, `name` (UserRoleEnum unique), `description`

### `departments`
- `id` PK, `name` (unique), `description`, `created_at`

### `users`
- `id` PK, `email` (unique), `hashed_password`, `full_name`, `is_active`, `created_at`
- FK: `role_id → roles.id`, `department_id → departments.id` (nullable)

### `categories`
- `id` PK, `name` (unique), `description`
- FK: `department_id → departments.id` (nullable)

### `sla_policies`
- `id` PK, `priority` (TicketPriorityEnum unique), `resolution_time_hours`, `description`
- Default values: CRITICAL=4h, HIGH=8h, MEDIUM=24h, LOW=72h

### `tickets`
- `id` PK, `title` (varchar 255), `description` (text)
- FK: `creator_id → users.id`, `assigned_agent_id → users.id` (nullable)
- FK: `department_id → departments.id`, `category_id → categories.id`
- `priority` enum (LOW/MEDIUM/HIGH/CRITICAL), `status` enum (OPEN/ASSIGNED/IN_PROGRESS/RESOLVED/CLOSED/REOPENED)
- `sla_deadline` (datetime), `created_at`, `updated_at`, `resolved_at` (nullable), `closed_at` (nullable)

### `comments`
- `id` PK, `ticket_id` FK (CASCADE), `author_id` FK, `content` (text), `is_internal` (bool, default false), `created_at`

### `ticket_history`
- `id` PK, `ticket_id` FK (CASCADE), `actor_id` FK, `action` (string, e.g. "STATUS_CHANGED"), `old_value`, `new_value`, `timestamp`

### `notifications`
- `id` PK, `user_id` FK, `title`, `message`, `ticket_id` FK (nullable, CASCADE), `is_read` (bool), `created_at`

### `audit_logs`
- `id` PK, `actor_id` FK (nullable), `action`, `entity`, `entity_id`, `details`, `ip_address`, `timestamp`

---

## 6. COMPLETE API REFERENCE

Base URL: `/api/v1`  
Auth: Bearer JWT token in `Authorization` header (except public routes)

### Health
```
GET  /health                     Public. Returns app name, version, status, timestamp
```

### Auth (`/auth`)
```
POST /auth/register              Public. Body: {email, full_name, password, department_id?}. Creates EMPLOYEE user.
POST /auth/login                 Public. OAuth2 form (username/password). Returns Token.
POST /auth/login/json            Public. JSON body {email, password}. Returns Token + user object.
GET  /auth/me                    Bearer. Returns current user profile.
```

### Tickets (`/tickets`)
```
POST   /tickets                  Bearer (all roles). Create ticket. Body: TicketCreate.
GET    /tickets                  Bearer. List with role-scoped visibility.
                                   Query params: page, size, status, priority, department_id, category_id, search
GET    /tickets/{id}             Bearer. Get full ticket detail.
PATCH  /tickets/{id}/status      Bearer. Update status (state machine enforced). Body: {status}.
PATCH  /tickets/{id}/assign      Agent/Manager/Admin. Assign agent. Body: {assigned_agent_id}.
PATCH  /tickets/{id}/priority    Agent/Manager/Admin. Change priority + recalculate SLA. Body: {priority}.
POST   /tickets/{id}/comments    Bearer. Add comment. Body: {content, is_internal?}. Employee cannot post internal.
GET    /tickets/{id}/comments    Bearer. List comments. Employee cannot see internal comments.
GET    /tickets/{id}/history     Bearer. List history events ASC. Employee only sees own tickets.
```

### Users (`/users`)
```
GET  /users                      Admin + Manager. List all users.
GET  /users/{id}                 Admin + Manager. Get user by ID.
```

### Departments (`/departments`)
```
GET  /departments                Public. List all departments.
POST /departments                Admin only. Create department.
PUT  /departments/{id}           Admin only. Update department.
```

### Categories (`/categories`)
```
GET  /categories                 Public. List categories. Optional ?department_id= filter.
POST /categories                 Admin only. Create category.
PUT  /categories/{id}            Admin only. Update category.
```

### Notifications (`/notifications`)
```
GET    /notifications            Bearer. Get current user's notifications, newest first.
PATCH  /notifications/{id}/read  Bearer. Mark single notification as read.
PATCH  /notifications/read-all   Bearer. Mark all user's notifications as read.
```

### SLA (`/sla`)
```
GET  /sla                        Public. List all 4 SLA policies.
PUT  /sla/{id}                   Admin only. Update SLA hours/description.
```

### Audit (`/audit`)
```
GET  /audit                      Admin only. Get last 50 audit log entries, newest first.
```

---

## 7. RBAC — ROLE-BASED ACCESS CONTROL

| Action | EMPLOYEE | SUPPORT_AGENT | MANAGER | ADMIN |
|--------|----------|---------------|---------|-------|
| Create ticket | YES | YES | YES | YES |
| View OWN tickets only | YES | — | — | — |
| View dept tickets | — | YES | YES | YES |
| View ALL tickets | — | — | — | YES |
| Update ticket status | REOPEN only | YES | YES | YES |
| Assign ticket | NO | self-only | YES | YES |
| Change priority | NO | YES | YES | YES |
| Post internal comment | NO | YES | YES | YES |
| See internal comments | NO | YES | YES | YES |
| List all users | NO | NO | YES | YES |
| Create/edit depts/cats | NO | NO | NO | YES |
| Update SLA policies | NO | NO | NO | YES |
| View audit logs | NO | NO | NO | YES |

---

## 8. TICKET STATE MACHINE (enforced in backend)

```
OPEN        → ASSIGNED, IN_PROGRESS, CLOSED
ASSIGNED    → IN_PROGRESS, RESOLVED, CLOSED
IN_PROGRESS → RESOLVED, ASSIGNED, CLOSED
RESOLVED    → CLOSED, REOPENED
CLOSED      → REOPENED
REOPENED    → IN_PROGRESS, ASSIGNED, RESOLVED, CLOSED
```

Implementation: `backend/app/core/ticket_rules.py` → `validate_status_transition()`

---

## 9. SLA SYSTEM

- SLA deadline = `created_at + resolution_time_hours` from `sla_policies` by priority
- Fallback if no policy found: 48 hours
- Dynamic SLA status computed on EVERY ticket fetch (not stored in DB):
  - `SAFE`: > 25% of total SLA window remaining
  - `AT_RISK`: ≤ 25% of total SLA window remaining
  - `BREACHED`: deadline has passed
- For RESOLVED/CLOSED tickets: compares `resolved_at`/`closed_at` vs `sla_deadline`
- When priority changes: recalculates `sla_deadline` from original `created_at`
- Frontend: `SLATimer.tsx` component shows a live countdown with colored badge

---

## 10. ENVIRONMENT VARIABLES

File: `.env` in project root (loaded by backend via pydantic-settings)

```
PROJECT_NAME=ServiceHub Enterprise Platform
VERSION=1.0.0
ENVIRONMENT=development
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=servicehub
DATABASE_URL=sqlite:///./servicehub.db    # SQLite for local dev
SECRET_KEY=DEV_SECRET_KEY_CHANGE_IN_PRODUCTION_SERVICEHUB_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

> NOTE: Docker Compose overrides DATABASE_URL with the PostgreSQL connection string.
> The backend handles both SQLite and PostgreSQL transparently via SQLAlchemy.

---

## 11. FRONTEND AUTH FLOW

1. User submits login → `POST /api/v1/auth/login/json`
2. JWT stored in `localStorage` as `servicehub_token`
3. User object stored as `servicehub_user`
4. `AuthContext` provides `{ user, token, login(), logout(), isAuthenticated }`
5. `useAuth()` hook wraps the context
6. `ProtectedLayout` checks `isAuthenticated` → redirects to `/login` if false
7. `client.ts` Axios interceptor attaches `Authorization: Bearer <token>` to every request
8. On 401 response → clears localStorage + forces `window.location.href = '/login'` (bug fix applied in Phase 10)

---

## 12. FRONTEND ROUTING

```
/login          → LoginPage (public)
/register       → RegisterPage (public)
/dashboard      → DashboardPage (protected, role-aware stats)
/tickets        → TicketListPage (protected, paginated with filters)
/tickets/:id    → TicketDetailPage (protected, comments + history)
/admin          → AdminPage (protected, Admin-only tabbed panel)
*               → redirect to /tickets
```

---

## 13. SEED DATA

Run with: `python app/seed.py` from `backend/`

Creates:
- **Roles**: EMPLOYEE, SUPPORT_AGENT, MANAGER, ADMIN
- **Departments**: IT Support, Human Resources, Finance, Operations, Customer Support
- **SLA Policies**: CRITICAL=4h, HIGH=8h, MEDIUM=24h, LOW=72h
- **~15 Categories** linked to departments
- **Demo users** (password: `password123` for all):
  - `admin@servicehub.com` — ADMIN
  - `manager@servicehub.com` — MANAGER (IT Support)
  - `agent1@servicehub.com` — SUPPORT_AGENT (IT Support)
  - `agent2@servicehub.com` — SUPPORT_AGENT (Human Resources)
  - `emp1@servicehub.com` — EMPLOYEE (IT Support)
  - `emp2@servicehub.com` — EMPLOYEE (Finance)
- **~10 sample tickets** in various statuses with history entries

---

## 14. HOW TO RUN

### Local Development (SQLite — no Docker needed)

```powershell
# Terminal 1 — Backend
cd d:\Collage_STuffs\Other_things\Enterprice_project\backend
pip install -r requirements.txt
python app/seed.py         # first time only — creates servicehub.db
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd d:\Collage_STuffs\Other_things\Enterprice_project\frontend
npm install
npm run dev                # http://localhost:3000
```

API docs: `http://localhost:8000/api/v1/docs`

### Run Backend Tests (all 23 should pass)
```powershell
cd d:\Collage_STuffs\Other_things\Enterprice_project\backend
pytest -v
```

### Docker (PostgreSQL)
```powershell
cd d:\Collage_STuffs\Other_things\Enterprice_project
docker compose up --build
```

---

## 15. TEST COVERAGE SUMMARY (Phase 10)

**23 tests / 23 passing**

| File | Tests | What is tested |
|------|-------|---------------|
| test_health.py | 1 | Health endpoint |
| test_auth.py | ~6 | Register, login (form + JSON), /me, duplicate email, bad password |
| test_tickets.py | ~8 | Create, list, get, status transitions, state machine rejection, SLA calc |
| test_comments_history.py | ~5 | Add comment, list comments, internal comment RBAC, history endpoint |
| test_admin.py | ~3 | Dept/category/SLA admin endpoints |

**Testing setup**: All tests use a shared in-memory SQLite DB (test_shared.db) per session,
seeded via the actual `seed_data()` function. DB is cleaned up after test session.

---

## 16. IMPORTANT ARCHITECTURAL DECISIONS

1. **SQLite for local dev**: `DATABASE_URL=sqlite:///./servicehub.db` in `.env`. No PostgreSQL needed locally. Docker Compose uses real PostgreSQL.
2. **Pydantic v2**: All schemas use `ConfigDict(from_attributes=True)` — NOT `orm_mode = True`.
3. **Tailwind CSS v4**: Uses `@tailwindcss/postcss` in `postcss.config.js` — NOT the v3 `tailwindcss` plugin.
4. **JWT in localStorage**: Keys are `servicehub_token` and `servicehub_user`.
5. **SLA is computed dynamically**: Computed on every ticket read — NOT stored as a status column in the DB.
6. **Comments have `is_internal` flag**: Employees cannot create or see internal comments.
7. **TicketHistory is written on every change**: Status changes, assignments, priority changes all write history rows automatically.
8. **AuditLog**: Auth events (register, login) and ticket creation all write audit log rows automatically.
9. **Notifications**: Created automatically on ticket status changes and assignments.
10. **State machine is enforced server-side**: Invalid transitions return HTTP 422.
11. **Role visibility scoping is server-side**: Employees only see own tickets, agents see dept tickets, managers see their dept, admins see all.
12. **Test isolation**: Each test suite shares one seeded SQLite DB per session — no per-test DB creation (faster).
13. **`/notifications/read-all` route ordering**: Must be registered BEFORE `/{notification_id}/read` in the router to avoid FastAPI treating "read-all" as a notification ID.
14. **Axios auto-redirect on 401**: The response interceptor in `client.ts` forces `window.location.href = '/login'` when token expires (bug fixed in Phase 10).

---

## 17. KNOWN BUGS / ISSUES

**None currently known.**

Previous bugs fixed in Phase 10:
- Token expiry did not redirect to login → Fixed in `client.ts` response interceptor
- Pagination state not resetting on filter change → Fixed in `TicketListPage.tsx`
- Sidebar nav not highlighting active route → Fixed in `ProtectedLayout.tsx`

---

## 18. PHASE 11 — NEXT IMPLEMENTATION PLAN (Docker + Deployment)

### Tasks to complete:

**STEP 1 — Production Backend Dockerfile** (`backend/Dockerfile`)
- Multi-stage build with python:3.11-slim
- Install only production deps (no pytest/httpx in prod image)
- Run with: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Add HEALTHCHECK instruction

**STEP 2 — Production Frontend Dockerfile** (`frontend/Dockerfile`)
- Multi-stage: node:20-alpine to build, then nginx:alpine to serve
- Build: `npm run build` → `/app/dist`
- Nginx config to serve SPA correctly (handle client-side routing with `try_files`)
- Nginx proxy `/api/` to `http://backend:8000/api/`

**STEP 3 — Docker Compose Production** (`docker-compose.yml`)
- Already has postgres, backend, frontend services (basic version exists)
- Update: add `depends_on` healthcheck conditions
- Add: `restart: unless-stopped` for all services
- Add: proper network definition
- Add: volume for postgres data persistence

**STEP 4 — Nginx configuration file** (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://backend:8000;
    }
}
```

**STEP 5 — Deployment documentation** (`DEPLOYMENT.md`)
- How to run with Docker
- How to run locally
- Environment variable reference
- How to seed data in Docker
- Health check URLs

**STEP 6 — Update README.md**
- Project overview with screenshots description
- Tech stack badges
- Quick start guide

---

## 19. PHASE 12 — FINAL POLISH (after Phase 11)

- Polish UI: animations, loading spinners, empty states
- Error boundary components
- Responsive design review (mobile)
- Complete README with architecture diagram
- (Optional) Dark mode toggle

---

## 20. GIT COMMIT HISTORY SUMMARY

- Phase 0: "chore: initialize project structure and Phase 0 planning"
- Phase 1: "feat: bootstrap frontend (Vite+React+TS+Tailwind) and backend (FastAPI+SQLAlchemy+Alembic)"
- Phase 2: "feat: complete database models, alembic migrations, and seed script"
- Phase 3: "feat: JWT authentication, RBAC, AuthContext, ProtectedLayout, LoginPage, RegisterPage"
- Phase 4: "feat: core ticket CRUD, status state machine, SLA engine, ticket UI pages"
- Phase 5: "feat: comments, ticket history timeline, notifications API and bell UI"
- Phase 6: "feat: SLA UI timer component, real-time countdown, AT_RISK/BREACHED badges"
- Phase 7: "feat: notification read/unread, ticket list search, filters, pagination"
- Phase 8: "feat: role-aware dashboards with stats and recharts charts"
- Phase 9: "feat: admin panel with tabs for users, departments, categories, SLA, audit logs"
- Phase 10: "test: 23 backend tests passing, fix token expiry redirect, pagination reset, sidebar nav"
- Phase 11: "feat: production Dockerfiles, nginx config, compose orchestration"
- Phase 12: "docs: complete system deployment and onboarding documentation"
- Phase 13: "feat: enterprise design system, glassmorphic layout, high-density tables, SLA visualizations"

