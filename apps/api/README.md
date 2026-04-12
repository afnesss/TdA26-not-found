# Backend API (`apps/api`)

This is the backend API of the project, built with Node.js and Express.

## Table of Contents

- [Core Technologies](#core-technologies)
- [Project Architecture](#project-architecture)
- [Database & Migrations](#database--migrations)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)

---

## Core Technologies

- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)

---

## Project Architecture

To keep the backend organized, we follow a specific folder structure.

- `src/db/`: This is the heart of our database interaction.
  - `schema.ts`: **This is where you define your database tables.** Drizzle uses this file to generate and type-check your SQL queries.
  - `index.ts`: Contains the Drizzle client instance and the database connection logic.

- `src/routes/`: This is where the API endpoints are defined.
  - Each major feature of the application (e.g., `courses`, `users`) is grouped in its own router file such as `courseRoutes.ts`.
  - These router files are imported and mounted in `src/index.ts`.

- `src/index.ts`: The main entry point for the server. Its primary job is to set up middleware (like `cors` and `express.json`) and to wire up all the routers from the `src/routes/` directory.

---

## Database & Migrations

We use Drizzle to manage our database schema and migrations.

### The Workflow

1.  **Define Your Schema**: Schema changes are made in `src/db/schema.ts`, which is the source of truth for the database structure.

2.  **Generate a Migration**: After changing the schema, generate a new migration file. This file contains the SQL needed to apply the change. Run this command from the **root of the project**:

    ```shell
    npm run db:generate -w api
    ```

    This will create a new SQL file in the `drizzle` folder.

3.  **Commit the Migration**: Commit the generated migration file together with the related schema changes.

4.  **Applying Migrations**: The migrations are applied to the database automatically every time the server starts (thanks to the `npm run db:migrate` command in the `start` script). You don't need to do anything extra.

---

## Environment Variables

The API requires environment variables to run. When using the recommended Docker Compose setup, these are provided for you.

If you ever need to run the API manually, you must create a `.env` file inside this `apps/api` directory. You can copy the `env.example` file to get started.

- `DATABASE_URL`: The connection string for the PostgreSQL database.
- `PORT`: The port on which the Express server should listen.
- `JWT_SECRET`: Secret used to sign auth cookies/tokens.
- `NODE_ENV`: Runtime mode, important for production cookie settings.
- `ADMIN_USERNAME`: Platform admin login name.
- `ADMIN_PASSWORD`: Platform admin login password.

## Running Locally

The best way to run this application locally is through the Docker Compose setup in the root of the project. See the main `README.md` for instructions.
