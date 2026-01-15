# Yurucamp Backend

This `backend` folder contains the Express + Drizzle backend for the Yurucamp application.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: Passport.js (Google OAuth/Email) + JWT
- **Image Storage**: Cloudinary

## Structure

- `src/app.ts`: Main Express application configuration.
- `src/server.ts`: Entry point for local development.
- `src/db/`: Database configuration and schema definitions.
- `src/routes/`: API route handlers.
    - `auth.ts`: Authentication (Google OAuth, Profile).
    - `events.ts`: Event management.
    - `activities.ts`: Community activities.
    - `campAreas.ts`: Camping spot listings.
    - `gear.ts`: Gear lists and categories.
    - `interactions.ts`: Comments and likes.
- `src/middleware/`: Custom middlewares (Auth, etc.).
- `api/index.ts`: Entry point for Vercel Serverless deployment.

## Setup

### 1. Install Dependencies
Using Bun is recommended:
```bash
cd backend
bun install
```

### 2. Environment Variables
Create a `.env` file in `backend/` with the following variables:
```env
# Database (PostgreSQL)
DATABASE_URL="postgres://user:pass@host:port/dbname"

# Authentication (JWT)
JWT_SECRET="your-secure-random-string"
FRONTEND_URL="http://localhost:5173" # or your production URL

# OAuth (Google)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Database Migration
Sync your database schema with Drizzle:
```bash
# Generate migrations
bun run generate

# Push schema changes directly (for quick dev)
bun run push
# OR apply migrations formally
bun run migrate
```

### 4. Run Locally
Start the development server:
```bash
bun run dev
```
The server will start on port `3333` (or process.env.PORT).

## Deployment (Vercel)

This project is configured for deployment on Vercel as Serverless Functions.

1.  Push the changes to your repository.
2.  Import the project in Vercel.
3.  **Monorepo Setup**:
    - Select `backend` as the **Root Directory**.
    - Vercel should auto-detect the settings.
    - **Build Command**: `tsc` (or leave default if configured).
    - **Output Directory**: `dist` (or `.` if serving directly from api/index.ts).
4.  Add all Environment Variables in Vercel.

## Authentication Flow

1.  **Login**: User clicks "Login with Google".
2.  **Redirect**: Frontend redirects to `API_URL/auth/google`.
3.  **Callback**: Google redirects back to `API_URL/auth/google/callback`.
4.  **Token Generation**: Backend validates profile, creates/updates user in DB, generates a JWT.
5.  **Final Redirect**: Backend redirects to `FRONTEND_URL/auth/callback?token=JWT`.
6.  **Session**: Frontend stores the JWT and sends it in the `Authorization: Bearer <token>` header for subsequent requests.

## Scripts

- `bun run dev`: Start dev server with hot reload.
- `bun run build`: Build TypeScript to JavaScript.
- `bun run push`: Push schema changes to DB (Drizzle).
- `bun run seed`: Seed database with initial data.
