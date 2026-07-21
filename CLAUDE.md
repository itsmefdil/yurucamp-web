# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## High-Level Overview

This is a full-stack monorepo for "Yurucamp Indonesia," an unofficial fan page for camping enthusiasts.

- **Backend**: An Express.js API server written in TypeScript. It handles business logic, database interactions, and authentication.
- **Frontend**: A React single-page application built with Vite. It provides the user interface and interacts with the backend API.
- **Database**: The backend uses PostgreSQL with Drizzle ORM for database access and schema management.
- **Runtime**: The project is set up to use Bun for both the frontend and backend.

## Common Commands

The project uses `bun` for package management and running scripts. Most commands should be run from the repository root.

- **Install all dependencies:**
  ```bash
  cd backend && bun install && cd ../frontend && bun install
  ```
  Or from the root:
  ```bash
  bun run install:all
  ```

- **Run development servers (frontend and backend):**
  ```bash
  bun run dev
  ```
  This will start the backend on `http://localhost:3000` and the frontend on `http://localhost:5173`.

- **Build for production:**
  ```bash
  bun run build
  ```
  This builds both the frontend and backend into their respective `dist` directories.

### Backend-Specific Commands

These should be run from the `backend/` directory.

- **Run backend development server only:**
  ```bash
  bun run dev
  ```

- **Database Migrations:**
  - Apply migrations:
    ```bash
    bun run migrate
    ```
  - Generate new migrations after schema changes:
    ```bash
    bun run generate
    ```

- **Seed the database:**
  ```bash
  bun run seed
  ```

### Frontend-Specific Commands

These should be run from the `frontend/` directory.

- **Run frontend development server only:**
  ```bash
  bun run dev
  ```

## Code Architecture

### Monorepo Structure

- `/frontend`: Contains the React application.
  - `src/`: Main source code directory.
    - `components/`: Reusable React components, many using `shadcn/ui`.
    - `pages/`: Top-level page components for different routes.
    - `hooks/`: Custom React hooks, often for data fetching with TanStack Query.
    - `lib/`: Utility functions and configuration.
    - `App.tsx`: Main application component with routing setup.
- `/backend`: Contains the Express.js API server.
  - `src/`: Main source code directory.
    - `api/`: Route handlers organized by resource (e.g., `users`, `camps`).
    - `db/`: Drizzle ORM schema, migrations, and database connection setup.
    - `middleware/`: Express middleware for tasks like authentication.
    - `server.ts`: The main entry point that sets up the Express server.
  - `drizzle/`: Contains generated migration files.

### Key Technologies & Patterns

- **Frontend Data Fetching**: The frontend heavily uses **TanStack Query** (`@tanstack/react-query`) for server state management. When adding features that require fetching or mutating data, use TanStack Query's hooks (`useQuery`, `useMutation`).
- **UI Components**: The UI is built with **shadcn/ui**, which means components are added via the CLI and stored locally in `frontend/src/components/ui`. They are styled with **Tailwind CSS**.
- **Backend ORM**: The backend uses **Drizzle ORM**. Database queries should be written using the Drizzle query builder. Schema definitions are in `backend/src/db/schema.ts`.
- **Authentication**: Authentication is handled via JWTs, with support for Google OAuth. The core logic is in `backend/src/api/auth`.
