# Backend Documentation

This `backend` folder contains the separate Express + Drizzle backend for the Yurucamp application, ready for Vercel deployment.

## Structure

- `src/app.ts`: Main Express application.
- `src/db/`: Database configuration (Drizzle) and schema.
- `src/routes/`: API routes.
    - `activities.ts`: Activities CRUD.
    - `campAreas.ts`: Camp Areas CRUD.
    - `events.ts`: Events CRUD & Participation.
    - `auth.ts`: Profile management & User context.
    - `interactions.ts`: Likes & Comments.
    - `utils.ts`: Helper endpoints (e.g. hero images).
- `src/middleware/auth.ts`: Middleware to verify Supabase JWT tokens.
- `api/index.ts`: Entry point for Vercel Serverless Functions.

## Setup

1.  **Install Dependencies** (using Bun as requested):
    ```bash
    cd backend
    bun install
    ```

2.  **Environment Variables**:
    Create a `.env` file in `backend/` with the following variables (copy from `.env.example`):
    ```env
    DATABASE_URL=... (Your Drizzle-compatible Postgres URL)
    CLOUDINARY_API_SECRET=...
    SUPABASE_JWT_SECRET=... (Found in Supabase Project Settings > API)
    # ... other variables from .env.example
    ```

3.  **Run Locally**:
    ```bash
    bun run bun:dev
    # Or simply: bun run dev
    ```
    The server will start on port 3333.

## Deployment to Vercel

1.  Push the changes to your repository.
2.  Import the project in Vercel.
3.  **Important**: If deploying as a monorepo (alongside Next.js):
    - Create a **new project** in Vercel.
    - Set the **Root Directory** to `backend`.
    - Vercel should automatically detect the configuration.
4.  Set the Environment Variables in Vercel for this new project.

## Authentication (Google OAuth)

Authentication is handled via Supabase Auth.
1.  **Frontend**: User logs in via Google (Supabase SDK).
2.  **Frontend**: Gets the `access_token` (JWT).
3.  **Frontend**: Sends requests to Backend with `Authorization: Bearer <token>`.
4.  **Backend**: Verifies the token using `SUPABASE_JWT_SECRET`.

This ensures that Google OAuth users (and Email/Password users) are correctly authenticated in the backend.

## API Endpoints

- `GET /activities`, `POST /activities`, etc.
- `GET /camp-areas`, `POST /camp-areas`, etc.
- `GET /events`, `POST /events`, `POST /events/:id/join`, etc.
- `GET /auth/me`, `PUT /auth/profile`
- `GET /interactions/video/:id`, `POST /interactions/like`, `POST /interactions/comment`
- `GET /utils/hero-images`
