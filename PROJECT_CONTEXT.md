# ServiceHub Enterprise Platform — Project Context

> **Last Updated:** 2026-09-24 | **Current Phase:** Phase 9 (Admin Features — in progress)

---

## 1. Project Goal

ServiceHub is a full-stack enterprise IT service desk / helpdesk platform. It allows employees to submit service request tickets, support agents to handle and resolve them, managers to oversee department-level SLA compliance, and admins to manage the entire system.

**Core capabilities:**
- Role-gated JWT authentication (Employee, Support Agent, Manager, Admin)
- Full ticket lifecycle management with enforced state machine transitions
- SLA policy enforcement with real-time dynamic status (SAFE / AT_RISK / BREACHED)
- Ticket comments (with internal-only visibility for staff)
- Ticket activity history / audit trail
- User notifications with bell UI and read/unread state
- Role-aware dashboards with live metrics
- Admin panel: audit log viewer + user listing

---

## 2. Current Implementation Status

| Phase | Name | Status |
|-------|------|--------|
| 0 | Planning | ✅ Complete |
| 1 | Project Foundation | ✅ Complete |
| 2 | Database + Seed Data | ✅ Complete |
| 3 | Authentication + Authorization | ✅ Complete |
| 4 | Core Tickets | ✅ Complete |
| 5 | Comments + History + Notifications | ✅ Complete |
| 6 | SLA System UI | ✅ Complete |
| 7 | Notifications + Search/Filter | ✅ Complete (implemented during Phase 4/5) |
| 8 | Frontend Dashboards | ✅ Complete |
| 9 | Admin Features | 🔄 In Progress |
| 10 | Testing + Quality | ⬜ Not Started |
| 11 | Docker + Deployment | ⬜ Not Started |
| 12 | Final Polish | ⬜ Not Started |

---

## 3. Architecture Overview

```
Enterprice_project/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py             # FastAPI app + CORS middleware
│   │   ├── config.py           # Pydantic settings (reads .env)
│   │   ├── database.py         # SQLAlchemy engine + SessionLocal
│   │   ├── seed.py             # Database seed script (roles, depts, users, tickets)
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py         # Central API router (mounts all sub-routers)
│   │   │       ├── health.py         # GET /health
│   │   │       ├── auth.py           # POST /auth/register, /login, /login/json, GET /auth/me
│   │   │       ├── users.py          # GET /users, GET /users/{id}
│   │   │       ├── tickets.py        # Full CRUD + /status, /assign, /priority, /comments, /history
│   │   │       ├── departments.py    # GET /departments
│   │   │       ├── categories.py     # GET /categories
│   │   │       ├── notifications.py  # GET /notifications, PATCH /{id}/read, PATCH /read-all
│   │   │       └── audit.py          # GET /audit (Admin only)
│   │   ├── core/
│   │   │   ├── security.py           # JWT encode/decode, password hashing (bcrypt)
│   │   │   ├── dependencies.py       # get_current_active_user, RoleChecker
│   │   │   └── ticket_rules.py       # State machine, SLA compute, dynamic SLA calc
│   │   ├── models/
│   │   │   ├── __init__.py           # Exports all models
│   │   │   ├── enums.py              # UserRoleEnum, TicketStatusEnum, TicketPriorityEnum, SLAStatusEnum
│   │   │   ├── user.py               # User model
│   │   │   ├── role.py               # Role model
│   │   │   ├── department.py         # Department model
│   │   │   ├── category.py           # Category model
│   │   │   ├── ticket.py             # Ticket model
│   │   │   ├── comment.py            # Comment model (is_internal flag)
│   │   │   ├── history.py            # TicketHistory model
│   │   │   ├── notification.py       # Notification model
│   │   │   ├── sla.py                # SLAPolicy model
│   │   │   └── audit.py              # AuditLog model
│   │   └── schemas/
│   │       ├── __init__.py           # Exports all Pydantic schemas
│   │       ├── user.py               # UserCreate, UserResponse, etc.
│   │       ├── auth.py               # LoginRequest, Token, TokenData
│   │       ├── category.py           # CategoryOut
│   │       ├── ticket.py             # TicketCreate, TicketResponse, TicketPaginationResponse
│   │       ├── comment.py            # CommentCreate, CommentResponse
│   │       ├── history.py            # TicketHistoryResponse
│   │       ├── notification.py       # NotificationResponse
│   │       └── audit.py              # AuditLogResponse
│   └── requirements.txt
├── frontend/                   # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── App.tsx             # Root router (React Router v6)
│   │   ├── main.tsx            # Vite entry point
│   │   ├── api/
│   │   │   ├── client.ts       # Axios instance (baseURL, Bearer token interceptor)
│   │   │   ├── tickets.ts      # fetchTicketsApi, createTicketApi, updateStatus, assign, comments, history
│   │   │   ├── notifications.ts# getNotificationsApi, markNotificationReadApi, markAllReadApi
│   │   │   └── audit.ts        # getAuditLogsApi
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── StatusBadge.tsx     # Colored badge for ticket status
│   │   │   │   └── PriorityBadge.tsx   # Colored badge for ticket priority
│   │   │   ├── layout/
│   │   │   │   └── ProtectedLayout.tsx # Route guard + header + notification bell
│   │   │   └── tickets/
│   │   │       ├── TicketCard.tsx       # Card for ticket list (with compact SLATimer)
│   │   │       ├── TicketFormModal.tsx  # Create ticket modal
│   │   │       └── SLATimer.tsx         # Real-time SLA countdown + progress bar
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # AuthProvider, login/logout, persisted JWT
│   │   ├── hooks/
│   │   │   └── useAuth.ts       # Hook for consuming AuthContext
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx        # Role-aware dashboard with metrics + recent tickets table
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx        # Enterprise login + quick-fill role credentials
│   │   │   │   └── RegisterPage.tsx     # User registration form
│   │   │   ├── tickets/
│   │   │   │   ├── TicketListPage.tsx   # Paginated ticket list with search/filter
│   │   │   │   └── TicketDetailPage.tsx # Ticket detail + comments + activity timeline
│   │   │   └── admin/
│   │   │       └── AdminPage.tsx        # Admin panel: tabbed audit logs + user listing
│   │   └── types/
│   │       ├── auth.ts           # User, UserRole, Department interfaces
│   │       ├── ticket.ts         # Ticket, TicketPriority, TicketStatus, SLAStatus
│   │       ├── comment.ts        # Comment interface
│   │       ├── notification.ts   # Notification interface
│   │       └── audit.ts          # AuditLog interface
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml          # postgres + backend + frontend services
├── .env                        # Local secrets (NOT committed)
├── .env.example                # Template for env vars (safe to commit)
├── tasks.md                    # Phase-by-phase task checklist
├── DEVELOPMENT_STATUS.md       # One-liner current status snapshot
└── PROJECT_CONTEXT.md          # This file
```

---

## 4. Technology Stack

### Backend
| Tech | Version / Notes |
|------|----------------|
| Python | 3.11+ |
| FastAPI | Latest |
| SQLAlchemy | 2.x (mapped_column style) |
| Alembic | Database migrations |
| PostgreSQL | 15 (via Docker or local) |
| Pydantic v2 | Settings + request/response schemas |
| pydantic-settings | For `.env` loading |
| python-jose | JWT encode/decode |
| passlib + bcrypt | Password hashing |
| uvicorn | ASGI server |

### Frontend
| Tech | Version / Notes |
|------|----------------|
| React | 18+ |
| TypeScript | 5+ |
| Vite | Build tool |
| React Router | v6 (declarative routing) |
| Axios | HTTP client with interceptor |
| Tailwind CSS | Utility-first styling |
| lucide-react | Icon library (Bell, etc.) |

---

## 5. Database Schema

### Tables

**`roles`** — `id`, `name` (EMPLOYEE/SUPPORT_AGENT/MANAGER/ADMIN), `description`

**`departments`** — `id`, `name`, `description`

**`categories`** — `id`, `name`, `description`, `department_id FK`

**`users`** — `id`, `email (unique)`, `hashed_password`, `full_name`, `is_active`, `created_at`, `role_id FK`, `department_id FK (nullable)`

**`sla_policies`** — `id`, `priority (unique enum)`, `resolution_time_hours`, `description`

**`tickets`** — `id`, `title`, `description`, `creator_id FK`, `assigned_agent_id FK (nullable)`, `department_id FK`, `category_id FK`, `priority (enum)`, `status (enum)`, `sla_deadline`, `created_at`, `updated_at`, `resolved_at (nullable)`, `closed_at (nullable)`

**`comments`** — `id`, `ticket_id FK CASCADE`, `author_id FK`, `content`, `is_internal (bool)`, `created_at`

**`ticket_history`** — `id`, `ticket_id FK CASCADE`, `actor_id FK`, `action`, `old_value`, `new_value`, `timestamp`

**`notifications`** — `id`, `user_id FK`, `title`, `message`, `ticket_id FK (nullable)`, `is_read (bool)`, `created_at`

**`audit_logs`** — `id`, `actor_id FK (nullable)`, `action`, `entity`, `entity_id`, `details`, `ip_address`, `timestamp`

### Enums
- `UserRoleEnum`: EMPLOYEE, SUPPORT_AGENT, MANAGER, ADMIN
- `TicketStatusEnum`: OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REOPENED
- `TicketPriorityEnum`: LOW, MEDIUM, HIGH, CRITICAL
- `SLAStatusEnum`: SAFE, AT_RISK, BREACHED (computed, not stored)

---

## 6. SLA Policy (Seeded defaults)
| Priority | Resolution Hours |
|----------|-----------------|
| LOW | 72h |
| MEDIUM | 48h |
| HIGH | 24h |
| CRITICAL | 4h |

SLA state is computed dynamically on every ticket fetch via `calculate_dynamic_sla()`:
- **BREACHED** → deadline passed (or resolved/closed after deadline)
- **AT_RISK** → less than 25% of total allocated time remaining
- **SAFE** → more than 25% remaining

---

## 7. Ticket State Machine

```
OPEN → ASSIGNED, IN_PROGRESS, CLOSED
ASSIGNED → IN_PROGRESS, RESOLVED, CLOSED
IN_PROGRESS → RESOLVED, ASSIGNED, CLOSED
RESOLVED → CLOSED, REOPENED
CLOSED → REOPENED
REOPENED → IN_PROGRESS, ASSIGNED, RESOLVED, CLOSED
```

State transitions enforced server-side in `ticket_rules.py::validate_status_transition()`.
Returns HTTP 422 for invalid transitions.

---

## 8. RBAC — Role-Based Access Control

| Action | EMPLOYEE | SUPPORT_AGENT | MANAGER | ADMIN |
|--------|----------|---------------|---------|-------|
| Create ticket | ✅ (own) | ✅ | ✅ | ✅ |
| View tickets | Own only | Assigned + dept | Dept only | All |
| Update status | REOPEN own only | ✅ | ✅ | ✅ |
| Assign ticket | ❌ | ✅ | ✅ | ✅ |
| Change priority | ❌ | ✅ | ✅ | ✅ |
| Add internal comment | ❌ | ✅ | ✅ | ✅ |
| View internal comments | ❌ | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |

---

## 9. API Endpoints

All routes under `/api/v1/`

### Auth
- `POST /auth/register` — Create new user account
- `POST /auth/login` — OAuth2 form-based login → JWT token
- `POST /auth/login/json` — JSON body login → JWT token
- `GET /auth/me` — Get current authenticated user

### Users
- `GET /users` — List all users (Admin + Manager)
- `GET /users/{id}` — Get user by ID (Admin + Manager)

### Tickets
- `POST /tickets` — Create ticket (all roles)
- `GET /tickets` — List tickets (role-scoped, supports `?search=`, `?status=`, `?priority=`, `?department_id=`, `?category_id=`, `?page=`, `?size=`)
- `GET /tickets/{id}` — Get ticket detail
- `PATCH /tickets/{id}/status` — Update status (enforces state machine)
- `PATCH /tickets/{id}/assign` — Assign agent
- `PATCH /tickets/{id}/priority` — Update priority
- `POST /tickets/{id}/comments` — Add comment (`is_internal` flag)
- `GET /tickets/{id}/comments` — Get comments (internal hidden from EMPLOYEE)
- `GET /tickets/{id}/history` — Get activity timeline

### Departments & Categories
- `GET /departments` — List all departments
- `GET /categories` — List all categories

### Notifications
- `GET /notifications` — Get current user's notifications
- `PATCH /notifications/{id}/read` — Mark one as read
- `PATCH /notifications/read-all` — Mark all as read

### Audit
- `GET /audit?limit=50` — Get system audit logs (Admin only)

### Health
- `GET /health` — Health check

**Docs available at:** `http://localhost:8000/api/v1/docs`

---

## 10. Environment Variables

Copy `.env.example` to `.env` and fill in values. Do NOT commit `.env`.

```env
PROJECT_NAME="ServiceHub Enterprise Platform"
VERSION="1.0.0"
ENVIRONMENT="development"

POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your_password>
POSTGRES_DB=servicehub
DATABASE_URL=postgresql://postgres:<your_password>@localhost:5432/servicehub

SECRET_KEY=<random_secure_string_min_32_chars>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

CORS origins are hardcoded in `config.py` to: `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:3000`

---

## 11. Commands to Run the Project

### Option A — Local Development (recommended)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Seed the database (first run only):**
```bash
cd backend
python -m app.seed
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                    # runs on http://localhost:5173
```

### Option B — Docker Compose

```bash
docker-compose up --build
```
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

### Run backend tests:
```bash
cd backend
pytest
```

---

## 12. Seed Data (Demo Accounts)

The seed script (`app/seed.py`) creates these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@servicehub.com | Admin@123 |
| Manager | manager@servicehub.com | Manager@123 |
| Support Agent | agent@servicehub.com | Agent@123 |
| Employee | employee@servicehub.com | Employee@123 |

Seed also creates: 3 departments, 4 SLA policies, categories, and sample tickets with history.

---

## 13. Key Implementation Decisions

1. **JWT stored in localStorage** via `AuthContext`. Token is attached to every request via Axios request interceptor. Token expiry is 24 hours.
2. **SLA status is NOT stored in DB** — it is computed on every ticket read via `calculate_dynamic_sla()` in `ticket_rules.py`. This avoids stale data and background job dependencies.
3. **State machine enforced server-side** — `validate_status_transition()` raises HTTP 422 for invalid transitions. Frontend does not need to replicate this logic.
4. **EMPLOYEE visibility scoping** — Employees can only see their own tickets. This is enforced at both list and detail endpoints. Internal comments are filtered out server-side.
5. **History logged automatically** — Every status change, priority change, and assignment is written to `ticket_history` table automatically in the API handler, not by the caller.
6. **AuditLog written on every mutation** — Ticket creation, status changes, assignments, priority changes all write an AuditLog entry.
7. **Tailwind CSS** used for all styling. Dark slate-based color palette. All pages mobile-responsive.
8. **`lucide-react`** used for icons throughout the frontend.
9. **Pydantic v2** used. `model_config = ConfigDict(from_attributes=True)` is used on all ORM-backed schemas.
10. **SQLAlchemy 2.x `Mapped[]` style** used for all models.

---

## 14. Frontend Architecture Decisions

- **`AuthContext`** wraps the entire app and holds `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`.
- **`ProtectedLayout`** is the route guard. It redirects unauthenticated users to `/login`, shows a 403 page for wrong roles, and renders the shared header (notification bell + user info) + `<Outlet />`.
- **`useAuth()`** hook provides access to auth state from any component.
- **`SLATimer`** is a self-contained component that accepts a `ticket` prop and maintains its own countdown via `setInterval`. Supports `compact` prop for card view vs. full view for detail page.
- **`DashboardPage`** uses `Promise.all` with 5 parallel API calls to render metrics without blocking.

---

## 15. Completed Tasks

- [x] Phase 0: Architecture, folder structure, planning
- [x] Phase 1: Repo, Vite frontend, FastAPI backend, PostgreSQL, Docker Compose, health endpoint
- [x] Phase 2: All SQLAlchemy models, Alembic migrations, seed data
- [x] Phase 3: JWT auth, bcrypt passwords, RBAC via `RoleChecker`, frontend AuthContext, LoginPage, RegisterPage
- [x] Phase 4: Full ticket CRUD, state machine, SLA deadline computation, role-scoped listing, search + filter + pagination
- [x] Phase 5: Comments (with `is_internal`), ticket history timeline, notifications API, notification bell in header
- [x] Phase 6: `SLATimer` component with live countdown + progress bar in TicketCard and TicketDetailPage
- [x] Phase 7: Notifications fully done; search/filter done in Phase 4 backend
- [x] Phase 8: `DashboardPage` rebuilt with role-aware title, live metrics cards, recent tickets table with SLA
- [x] Phase 9 (partial): `AdminPage` with tabbed audit log viewer + user listing; backend `/audit` route; `AuditLogResponse` schema

---

## 16. Unfinished / Remaining Tasks

### Phase 9 — Admin Features (in progress)
- [ ] Add nav link to `/admin` in `ProtectedLayout` sidebar/header (visible only to ADMIN)
- [ ] Department management UI (CRUD)
- [ ] Category management UI (CRUD)
- [ ] SLA policy management UI (edit `resolution_time_hours` per priority)

### Phase 10 — Testing + Quality
- [ ] Expand backend unit tests beyond auth (currently 12 tests pass)
- [ ] Add integration tests for ticket lifecycle
- [ ] Frontend E2E tests (Playwright or Cypress)

### Phase 11 — Docker + Deployment
- [ ] Write production `Dockerfile` for backend (multi-stage)
- [ ] Write production `Dockerfile` for frontend (nginx static)
- [ ] Update `docker-compose.yml` to use production builds
- [ ] Deployment documentation

### Phase 12 — Final Polish
- [ ] Navigation sidebar with links to Dashboard, Tickets, Admin
- [ ] README.md with screenshots and setup guide
- [ ] Architecture diagram

---

## 17. Known Issues / Bugs

1. **No sidebar navigation** — Users navigate by manually typing URLs or clicking in-page links. A sidebar nav menu needs to be added to `ProtectedLayout`.
2. **Notification bell does not auto-refresh** — Notifications are loaded once on mount. No polling or WebSocket real-time updates.
3. **`/admin` route not linked in the UI** — The `AdminPage` exists at `/admin` but there's no nav link to it. Admin users must manually navigate there.
4. **No confirmation dialog on destructive actions** — Status changes and assignments happen immediately on button click.
5. **Token expiry not handled gracefully** — When the JWT expires, Axios requests will 401 but the user won't be automatically redirected to login without a response interceptor.
6. **`DEVELOPMENT_STATUS.md` references Phase 7 as "implicitly done"** — This is accurate but the tasks.md still has Phase 7 search/filter/sorting/pagination items unchecked. The backend supports them; frontend pagination UI is not built.

---

## 18. Current Task & Exact Next Steps

**Current task:** Complete Phase 9 — Admin Features

**Files already created for Phase 9:**
- `backend/app/api/v1/audit.py` — `GET /audit` endpoint (Admin only, limit param)
- `backend/app/schemas/audit.py` — `AuditLogResponse` Pydantic schema
- `frontend/src/types/audit.ts` — `AuditLog` TypeScript interface
- `frontend/src/api/audit.ts` — `getAuditLogsApi()` function
- `frontend/src/pages/admin/AdminPage.tsx` — Tabbed admin panel (Audit Logs + Users)
- Registered `/admin` route in `App.tsx`
- Registered `audit` router in `backend/app/api/v1/router.py`

**Immediate next steps:**
1. Add an "Admin" navigation link in `ProtectedLayout.tsx` header (visible only when `user.role.name === 'ADMIN'`)
2. Add department management page (`/admin/departments`) with list + edit
3. Add category management page (`/admin/categories`) with list + edit
4. Add SLA policy management page (`/admin/sla`) to edit resolution hours per priority

---

## 19. Important Constraints & Instructions

- **Do NOT rewrite, refactor, or redesign** anything unless the user explicitly asks. Extend and add to existing code.
- **Always read actual source files** before modifying them — do not assume structure from memory.
- **Update `tasks.md` and `DEVELOPMENT_STATUS.md`** at the end of each completed phase.
- **Provide a humanized `git commit` message** at the end of each phase when requested.
- **Keep schemas and models in sync** — when adding a new model field, update the corresponding Pydantic schema too.
- **All new backend endpoints must use `get_current_active_user`** or `RoleChecker` — no unprotected mutation endpoints.
- **Frontend API calls go through `src/api/client.ts`** (Axios instance with auth interceptor) — never use raw `fetch`.
- The project was originally developed in another Antigravity account and was handed over. Always use the actual source files as the source of truth, not this document alone.
