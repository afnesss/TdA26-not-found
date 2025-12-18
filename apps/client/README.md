# Frontend Client (`apps/client`)

## Table of Contents

- [Core Technologies](#core-technologies)
- [Project Architecture](#project-architecture)
- [UI & Styling](#ui--styling)
- [Data Fetching](#data-fetching)
- [State Management](#state-management)
- [Running Locally](#running-locally)

---

## Core Technologies

-   **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)

-   **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## Project Architecture

To keep our code organized and maintainable, we follow a specific folder structure. It's important to place new files in their correct locations.

- `src/api/`: This is where all logic related to fetching data from our backend lives.
  - `client.ts`: Contains the configured `axios` instance. If we need to add headers or interceptors, this is the place.
  - `queries.ts`: Contains the functions that actually call our API endpoints. These are designed to be used with TanStack Query.

- `src/components/`: This directory is for our reusable React components.
  - `ui/`: Contains the base UI components from `shadcn/ui` (e.g., `Button`, `Input`). Don't modify these directly unless necessary.
  - `layout/`: For major layout components like `Header`, `Footer`, `Sidebar`.
  - `shared/`: For custom, reusable components that are used across multiple pages (e.g., `UserAvatar`, `CourseCard`).

- `src/hooks/`: For custom React hooks that encapsulate reusable logic (e.g., `useCurrentUser`).

- `src/lib/`: Contains utility functions that are not specific to React (e.g., `cn` for classnames, date formatting functions).

- `src/pages/`: Each file in here is a main page of our application (e.g., `HomePage.tsx`).

- `src/store/`: For global state management using Zustand.

---

## UI & Styling

- **Styling**: We use [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow. This allows us to build custom designs quickly without writing a lot of custom CSS.
- **Component Library**: We use [shadcn/ui](https://ui.shadcn.com/).
  - **Why this library?** Unlike other component libraries, `shadcn/ui` is not a package of pre-built components. Instead, it provides beautifully designed and accessible components that we can copy directly into our codebase (`src/components/ui`). This gives us full control over their code, styling, and behavior, making our UI highly customizable and maintainable.

---

## Data Fetching

- **HTTP Client**: We use [Axios](https://axios-http.com/) to make requests to our backend API.
- **Server State Management**: We use [TanStack Query (React Query)](https://tanstack.com/query/latest) to manage the data we fetch from the server.
  - **Why do we need this?** Managing server state is complex. We need to handle loading states, error states, caching data to avoid re-fetching, and re-fetching data when it becomes stale. TanStack Query handles all of this complexity for us automatically with just a few lines of code. It's much simpler and more powerful than using `useEffect` and `useState` for data fetching.

---

## State Management

- **Client State Management**: We use [Zustand](https://zustand-demo.pmnd.rs/) for managing global client-side state (e.g., the current user's information, theme settings).
  - **Why this library?** Zustand is a very lightweight and simple state management library. It uses a simple hook-based API and avoids the boilerplate often associated with other state management solutions, which aligns with our "keep it simple" philosophy.

---

## Running Locally

The best way to run this application is through the Docker Compose setup in the root of the project. See the main `README.md` for instructions.
