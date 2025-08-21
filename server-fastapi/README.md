# FastAPI backend (migration target)

A lightweight FastAPI service compatible with the Next.js client REST calls.

Routes under /api:
- Auth: GET /me, POST /login, POST /signup
- Categories: CRUD at /categories
- Products: CRUD at /products
- Orders: POST /orders, GET /orders, GET /orders/{id}, PATCH /orders/{id}

It reuses the same Postgres database schema as the former NestJS service (modeled with SQLAlchemy).

## Env configuration

- Prefer a single variable: `DATABASE_URL`, e.g.:
	- `postgresql://postgres:postgres@localhost:5432/postgres`
	- `postgres://user:pass@db:5432/mydb` (driver upgraded automatically)
- Legacy `DB_*` vars are still supported if `DATABASE_URL` is not set.

## Run locally

- Ensure Postgres from docker-compose is running and env variables are set (DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, JWT_SECRET_KEY, STRIPE_SECRET_KEY optional).

```bash
pip install -e .
uvicorn app.main:app --reload --port 3000
```

## Docker

```bash
docker build -t amazon-clone-fastapi ./server-fastapi
docker run --rm -p 3000:3000 --env-file ../server/.env amazon-clone-fastapi
```
