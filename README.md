# Team: not-found

This repository contains the Tour de App 2026 project of team not-found.

## Team Members

- [**Team Leader**](https://github.com/bondar7)
- [**Full-Stack Developer & UI/UX**](https://github.com/afnesss)
- [**Backend Developer**](https://github.com/Shadowinger)

## Architecture and Documentation

The project is structured as a monorepo. For more detail about each part of the system, see:

- **[Frontend Documentation](apps/client/README.md)**
- **[Backend Documentation](apps/api/README.md)**

### Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **Infrastructure**: Docker, Docker Compose, Caddy, Render

---

## Local Development

For a consistent development environment, we use Docker.

### 1. Recommended Setup: Docker Compose

The easiest way to run the full stack locally is:

1. Copy `docker-compose.override.example.yaml` to `docker-compose.override.yaml`
2. Adjust the local-only development credentials there if needed
3. Start the stack:

```bash
docker-compose up --build
```

This starts:

- client
- api
- db
- caddy

This setup is the closest to the intended integrated environment because Caddy proxies frontend and backend under one entry point.
The base `docker-compose.yaml` intentionally uses placeholder secrets so the repository is safe to publish; the local untracked `docker-compose.override.yaml` provides convenient development values.

### 2. Alternative Setup

You can also run only the database in Docker and start the rest manually:

```bash
docker-compose up db
```

When running API or client outside Docker, create the relevant `.env` files in:

- `apps/client/.env`
- `apps/api/.env`

---

## Infrastructure and Routing

### Caddy (Reverse Proxy)

Caddy acts as the entry point for the local integrated stack.

- Requests to `/` are routed to the React frontend.
- Requests to `/api` are routed to the backend.

Because of this, the frontend can use relative API paths such as `fetch("/api/courses")` in same-origin deployments.

Key files:

- `apps/caddy/Caddyfile.development`
- `apps/caddy/Caddyfile.production`

---

## Deployment

The project currently has two deployment targets:

- **Tour de App / Tour de Cloud**: deployment based on `tourdeapp.yaml`
- **Render**: split deployment with separate services for frontend, backend, and database

## Render Deployment

- The frontend is deployed on Render as a `Static Site`.
- The backend is deployed separately as a `Web Service`, so frontend and backend run as cross-origin services.
- The frontend should use `VITE_API_BASE_URL` to communicate with the Render backend origin for the active environment.
- Render uses an SPA fallback rule so client routes resolve to `index.html`.

Main frontend entry points:

- `/` public start page
- `/:orgSlug` organization landing page
- `/:orgSlug/info` organization info page
- `/:orgSlug/login` organization login page
- `/:orgSlug/courses` student course area
- `/:orgSlug/dashboard` lecturer/staff dashboard

The seeded default organization is available at `/tda`.

### Important Deployment Files

- `tourdeapp.yaml`: Tour de Cloud service definition
- `.github/workflows/deploy.yml`: CI/CD workflow
- `apps/api/Dockerfile`: backend image build
- `apps/client/Dockerfile`: frontend Docker/nginx build
- `apps/client/nginx.conf`: SPA fallback for nginx-based deployment
- `apps/client/public/_redirects`: static-hosting fallback rule

### Render Notes

- **Frontend routing**: Render uses an SPA rewrite so client routes resolve to `index.html`.
- **Frontend API calls**: the frontend uses `VITE_API_BASE_URL` to communicate with the separate Render backend origin for the current deployment.
- **Authentication**: protected routes use cookie-based auth between the Render frontend and backend origins.

### Login Model

- `/:orgSlug/login` is used for organization login.
- Organization login supports two modes: `student` and `lecturer`.
- After organization login, students are sent to the organization courses area and lecturers are sent to the courses dashboard.
