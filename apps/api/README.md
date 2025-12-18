# Backend API (`apps/api`)

This is the backend API for our project, built with Node.js and Express.

## Table of Contents

- [Core Technologies](#core-technologies)
- [Project Architecture](#project-architecture)
- [Database & Migrations](#database--migrations)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)

---

## Core Technologies

-   **Framework**: [Express.js](https://expressjs.com/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)

---

## Project Architecture

To keep the backend organized, we follow a specific folder structure.

-   `src/db/`: This is the heart of our database interaction.
    -   `schema.ts`: **This is where you define your database tables.** Drizzle uses this file to generate and type-check your SQL queries.
    -   `index.ts`: Contains the Drizzle client instance and the database connection logic.

-   `src/routes/`: This is where our API endpoints are defined.
    -   **How it works**: For each major feature of our application (e.g., `courses`, `users`), you should create a new file (e.g., `courseRoutes.ts`). This file will contain an Express Router for all endpoints related to that feature.
    -   These individual router files should then be imported and used in the main `src/index.ts` file.

-   `src/index.ts`: The main entry point for the server. Its primary job is to set up middleware (like `cors` and `express.json`) and to wire up all the routers from the `src/routes/` directory.

---

## Database & Migrations

We use Drizzle to manage our database schema and migrations.

### The Workflow

1.  **Define Your Schema**: To add a table or change a column, you must edit the schema definitions in `src/db/schema.ts`. This is the single source of truth for our database structure.

2.  **Generate a Migration**: After you've changed the schema, you must generate a new migration file. This file contains the raw SQL needed to apply your changes to the database. Run this command from the **root of the project**:
    ```shell
    npm run db:generate -w api
    ```
    This will create a new SQL file in the `drizzle` folder.

3.  **Commit the Migration**: You must commit the newly generated migration file along with your changes to `schema.ts`.

4.  **Applying Migrations**: The migrations are applied to the database automatically every time the server starts (thanks to the `npm run db:migrate` command in the `start` script). You don't need to do anything extra.

---

## Environment Variables

The API requires environment variables to run. When using the recommended Docker Compose setup, these are provided for you.

If you ever need to run the API manually, you must create a `.env` file inside this `apps/api` directory. You can copy the `env.example` file to get started.

-   `DATABASE_URL`: The connection string for the PostgreSQL database.
-   `PORT`: The port on which the Express server should listen.

---

## Running Locally

The best way to run this application is through the Docker Compose setup in the root of the project. See the main `README.md` for instructions.
