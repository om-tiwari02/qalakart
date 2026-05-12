# QalaKart Backend

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Endpoints

- `GET /health` – liveness (no DB call)
- `GET /ready` – readiness (checks Mongo connection)

