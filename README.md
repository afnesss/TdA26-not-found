# TdA26-not-found

This repository contains the monorepo for our Tour de App 2026 project. It includes the frontend client, backend API, and all necessary configuration for local development and production deployment.

## Table of Contents

- [Architecture Overview](#architecture-overview)
  - [Client (`apps/client`)](#client-appsclient)
  - [API (`apps/api`)](#api-appsapi)
  - [Database (`db`)](#database-db)
- [Local Development](#local-development)
  - [Recommended Setup: Docker Compose](#recommended-setup-docker-compose)
  - [Alternative Setup: Manual](#alternative-setup-manual)
- [Development Workflow](#development-workflow)
  - [Git Flow](#git-flow)
  - [Database Migrations](#database-migrations)
- [Commit Conventions](#commit-conventions)
- [Deployment](#deployment)
  - [Critical Deployment Files](#critical-deployment-files)
- [Tooling & Quality Assurance](#tooling--quality-assurance)
  - [Husky Pre-commit Hook](#husky-pre-commit-hook)

## Architecture Overview

This project is structured as a monorepo using npm workspaces, which allows us to manage multiple applications within a single repository.

### Client (`apps/client`)

- **Framework**: React with Vite
- **Styling**: Tailwind CSS.
- **Production Server**: The application is built into static files and served by Nginx. This is handled automatically within its Docker container during deployment.

### API (`apps/api`)

- **Framework**: Express.js.
- **Database Access**: We use Drizzle ORM. Drizzle is a modern TypeScript ORM that allows us to interact with our database in a type-safe way, catching potential errors at compile time instead of runtime. It generates and manages SQL migration files based on our schema definitions.

### Database (`db`)

- **Engine**: PostgreSQL

---

## Local Development

For a consistent and hassle-free development experience, we use Docker to containerize each part of our application.

### Recommended Setup: Docker Compose

The easiest way to run the entire stack locally is with Docker Compose. It builds and runs all services (`client`, `api`, `db`, and `caddy`) with a single command, ensuring the environment mirrors production as closely as possible. Caddy is included to act as a reverse proxy, just like in production.

1.  **Start the environment:**

    ```shell
    docker-compose up --build
    ```

2.  **Access the application:** The services will be available at the following ports on your local machine:

| Service           | Port                    | Description                                               |
| :---------------- | :---------------------- | :-------------------------------------------------------- |
| **Caddy (Proxy)** | `http://localhost:8080` | **Primary entry point.** Access this URL in your browser. |
| Client (Direct)   | `http://localhost:3001` | Direct access to the Vite dev server.                     |
| API (Direct)      | `http://localhost:3000` | Direct access to the Express API.                         |

### Alternative Setup: Manual

While not recommended, you can run services individually. This is useful if you only need the database running, for example.

1.  **Run only the Database:**

    ```shell
    docker-compose up db
    ```

2.  **Running Services Manually:** If you run the API or Client on your host machine, you will need to create a `.env` file for them and configure the environment variables correctly.
    - **API**: Requires `DATABASE_URL` (e.g., `postgresql://postgres:password@localhost:5432/tda26`).
    - **Client**: Will require `VITE_API_URL` (e.g., `http://localhost:3000`) once API calls are implemented.
    - Check .env.example files, there will be detailed and up to date information about required env vars.

---

## Development Workflow

### Git Flow

- **Do not push directly to `main`**. The `main` branch is protected.
- For any new feature or bugfix, create a new branch from `main`. Use a descriptive name (e.g., `feature/user-authentication`, `fix/login-button`).
- Once your work is complete, push your branch and open a Pull Request (PR) on GitHub for review.

### Database Migrations

We use Drizzle to manage database schema changes.

1.  **Make Schema Changes**: Modify the schema files in `apps/api/src/db/schema.ts`.
2.  **Generate a Migration**: After changing the schema, run the following command to generate a new SQL migration file(this is required to apply changes to the DB's existing structure):
    ```shell
    npm run db:generate -w api
    ```
3.  **Apply Migrations Locally**: The migrations are applied automatically when the API starts up via `docker-compose`. If you need to apply them manually, you can run:
    ```shell
    npm run db:migrate -w api
    ```
4.  Commit the newly generated migration file along with your schema changes. Migrations are run automatically on the production server at startup.

### Commit Conventions

While it is not strictly necessary, using a conventional commit message format helps to identify where changes were made without looking at the commit itself. It keeps the project history clean and easy to read.

A good format is `type(scope): description`. For example:

- `feat(client): add user login form`
- `fix(caddy): resolve api routing issue`
- `chore: update npm dependencies`
- `docs: explain local development setup`

- use it pls :D

---

## Deployment

Deployment to the Tour de Cloud platform is automated through a GitHub Actions workflow.

### Critical Deployment Files

The following files are essential for a successful deployment. **Do not modify them unless you are certain about what you are doing.** A mistake here can break the entire production environment.

- **`tourdeapp.yaml`**: The manifest file for Tour de Cloud. It defines which containers to build and run, their environment variables, and how they are exposed to the internet.
- **`apps/**/Dockerfile`**: Each service has its own `Dockerfile`. These files contain the instructions to build the lean, optimized production images for each part of our application.
- **`.github/workflows/deploy.yml`**: This file defines the CI/CD pipeline. It's triggered on pushes to the `main` branch, builds the Docker images, and pushes them to the Tour de Cloud registry.

---

## Tooling & Quality Assurance

To ensure our codebase remains clean and stable, we have automated checks in place.

### Husky Pre-commit Hook

This project uses Husky to manage a `pre-commit` Git hook.

- **What it is**: An automated script that runs every time you try to make a commit.
- **What it does**: It runs `typecheck` and `build` for both the `api` and `client` workspaces.
- **Why it's important**: If either the build or the type-checking fails, the commit is automatically aborted. This prevents broken or type-unsafe code from ever being committed to the repository, ensuring the `main` branch is always stable.
