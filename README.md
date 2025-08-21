# Next.js Amazon Clone

A full‑stack ecommerce playground using Next.js (App Router) and a FastAPI backend. Built for learning modern web stacks.

## Stack
- Frontend: Next.js 14, TypeScript, TailwindCSS, NextUI, Zustand
- Backend: FastAPI, SQLAlchemy, Pydantic
- DB: PostgreSQL
- Auth: JWT (role-aware: admin, seller, customer)

## Features
- Product catalog, search, cart, checkout, orders
- Seller dashboard and admin UI (role-based)
- Product comments (public read, auth write/delete)
- REST APIs consumed by the client

## Quick start
1) Backend
- Copy `server-fastapi/.env.example` to `server-fastapi/.env` and set `DATABASE_URL`, `JWT_SECRET_KEY`.
- Install and run:
  - `pip install -e server-fastapi/`
  - `uvicorn app.main:app --reload --port 8000` (cwd: `server-fastapi`)

2) Frontend
- Copy `client/.env.example` to `client/.env` and set:
  - `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Install and run:
  - `npm install` (cwd: `client`)
  - `npm run dev`

Visit http://localhost:3000

## Useful endpoints
- GET /api/products — list products
- GET /api/sellers/{email}/products — products by seller email (public)
- GET /api/products/{id}/comments — comments for a product (public)
- POST /api/comments — add a comment (auth)

## Repo layout
- `client/` — Next.js app (UI, state, API clients)
- `server-fastapi/` — FastAPI service (DB models, routers, auth)

## Scripts
- Client build: `npm run build` (in `client/`)
- Backend dev: `uvicorn app.main:app --reload --port 8000` (in `server-fastapi/`)

## License
MIT
