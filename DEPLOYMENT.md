# ServiceHub Deployment Guide

This document describes how to deploy the ServiceHub Enterprise Platform using Docker Compose. The setup includes three services: a PostgreSQL database, a FastAPI backend, and a React frontend served by Nginx.

## Prerequisites

- Docker and Docker Compose installed on the host machine.
- Ports 8000, 3000, and 5432 must be available.

## Quick Start (Production)

To build and start the containers in production mode, run:

```bash
docker compose up --build -d
```

This command will:
1. Pull the `postgres:15-alpine` image.
2. Build the backend image (multi-stage, production dependencies only).
3. Build the frontend image (multi-stage, Node build -> Nginx serving).
4. Start all services in the background.

## Environment Variables

In production, you should override the default environment variables by either:
1. Modifying the `docker-compose.yml` file.
2. Passing an `.env` file to Docker Compose (e.g., `docker compose --env-file .prod.env up -d`).

**Key Variables to override:**
- `SECRET_KEY`: Set this to a strong, securely generated string.
- `POSTGRES_PASSWORD`: Use a secure password for the database.
- `DATABASE_URL`: Ensure this matches the `POSTGRES_PASSWORD` and DB configuration.

## Initial Database Seeding

After the containers are running for the first time, the database will be empty. To create the tables and seed the initial demo data (roles, SLA policies, demo users, categories, departments), execute the following command:

```bash
docker exec -it servicehub_backend python app/seed.py
```

*Note: You only need to run this once.*

## Services & Ports

- **Frontend (Nginx)**: Exposed on port `3000` (http://localhost:3000)
- **Backend (FastAPI)**: Exposed on port `8000` (http://localhost:8000/api/v1/docs)
- **Database (PostgreSQL)**: Exposed on port `5432`

## Health Checks

The setup includes Docker health checks to ensure reliability:
- **Postgres**: Uses `pg_isready` to verify database connections.
- **Backend**: Uses a `curl` request to the `/api/v1/health` endpoint.

## Stopping & Restarting

To stop the services gracefully:
```bash
docker compose stop
```

To stop and remove containers (data in the `postgres_data` volume is persisted):
```bash
docker compose down
```

To view logs for all services:
```bash
docker compose logs -f
```
