# 🏕️ Yurucamp Indonesia : Unofficial Fanpage

Welcome to the **Yurucamp Indonesia** project! This is a modern, full-stack web application designed for the camping community in Indonesia. It allows users to discover camping spots, join events, share activities, and connect with other outdoor enthusiasts.

![Campfire](frontend/public/campfire.svg)

## 🚀 Features

-   **Dashboard**: Manage your profile, view joined events, and organize your own activities.
-   **Activities**: Share and explore camping stories and activities.
-   **Events**: Find and join community camping events (Open Trip, Gathering, etc.).
-   **Camp Areas**: Discover the best camping spots with detailed information and galleries.
-   **Community**: Connect with other campers.
-   **Auth**: Secure authentication with Google and Email.

## 🛠️ Tech Stack

This project is a **Monorepo** consisting of a Frontend and a Backend.

### Frontend (`/frontend`)
-   **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **State/Data**: [TanStack Query](https://tanstack.com/query)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Runtime**: [Bun](https://bun.sh/)

### Backend (`/backend`)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Runtime**: [Bun](https://bun.sh/) or Node.js

## 🏁 Getting Started

### Prerequisites
-   [Bun](https://bun.sh/) (Recommended runtime)
-   [Docker](https://www.docker.com/) (For local database)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/itsmefdil/yurucamp-web.git
    cd yurucamp-web
    ```

2.  **Install Dependencies**
    
    Backend:
    ```bash
    cd backend
    bun install
    ```
    
    Frontend:
    ```bash
    cd ../frontend
    bun install
    ```

3.  **Environment Setup**
    
    Create `.env` files in both `backend` and `frontend` directories based on `.env.example`.

    **Backend (`backend/.env`):**
    ```env
    PORT=3000
    DATABASE_URL=postgres://user:password@localhost:5432/yurucamp
    JWT_SECRET=your_secret
    # ... other config
    ```

    **Frontend (`frontend/.env`):**
    ```env
    VITE_API_URL=http://localhost:3000
    ```

4.  **Database Setup**
    
    Ensure your PostgreSQL database is running, then push the schema:
    ```bash
    cd backend
    bun run migrate
    # Optional: Seed data
    bun run seed
    ```

### 🏃 Running Development

Open two terminals used to run the frontend and backend concurrently.

**Terminal 1 (Backend):**
```bash
cd backend
bun run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
bun run dev
```

Visit `http://localhost:5173` to see the app!

## 📦 Building for Production

**Frontend:**
```bash
cd frontend
bun run build
# Output in frontend/dist
```

**Backend:**
```bash
cd backend
bun run build
# Output in backend/dist
```

## 📄 License

This project is an Unofficial Fanpage and is not affiliated with the official Yuru Camp franchise.
