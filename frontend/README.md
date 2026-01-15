# Yurucamp Frontend

The frontend application for Yurucamp, built with modern web technologies focusing on performance and user experience.

## Tech Stack

- **Core**: [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: 
  - [TanStack Query](https://tanstack.com/query/latest) (Server State & Caching)
  - React Context (Auth & Global UI State)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + CSS Variables
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI + Tailwind)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Integration**: Axios (API Client)
- **Markdown**: React Markdown (for rich text descriptions)

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base components (Button, Input, etc.)
│   │   ├── layout/      # Navbar, Footer, etc.
│   │   └── events/      # Feature-specific components
│   ├── contexts/        # React Context providers (AuthContext)
│   ├── hooks/           # Custom hooks (useAuth, etc.)
│   ├── lib/             # Utilities & Helpers
│   │   ├── api.ts       # Configured Axios instance
│   │   └── utils.ts     # Formatting helpers
│   ├── pages/           # Page components (routed)
│   │   ├── dashboard/   # Protected dashboard pages
│   │   └── ...
│   ├── types/           # Global TypeScript definitions
│   └── App.tsx          # Main App & Router configuration
├── public/              # Static assets
└── vite.config.ts       # Vite configuration
```

## Features

### ✅ Implemented
- **Authentication**: Google OAuth & Email login with JWT handling.
- **Event Management**:
  - Browse events with filtering.
  - View event details with map integration.
  - Join/Leave events (inc. seat selection).
  - Floating Action Button for mobile UX.
- **Camp Areas**:
  - Discover camping spots.
  - View facilities and locations.
- **Community Activities**:
  - Share camping methods/recipes.
  - Like and comment on activities.
- **Interactive Map**: Embedded Google Maps for locations.
- **Responsive Design**: Mobile-first approach with optimized layouts.

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (Recommended) or Node.js
- Backend server running (default: port 3333)

### Installation

```bash
# 1. Install dependencies
cd frontend
bun install

# 2. Configure Environment
cp .env.example .env
```

### Environment Variables

Edit `.env` to match your local setup:

```env
VITE_API_URL="http://localhost:3333"
VITE_APP_NAME="Yurucamp"
```

### Development

```bash
# Start development server
bun run dev
```
The app will open at `http://localhost:5173`.

### Building for Production

```bash
# Build the project
bun run build

# Preview the build locally
bun run preview
```

## Integrations

- **Backend API**: Connects to the Express backend.
- **Image Hosting**: Communicates via backend to Cloudinary.
- **Maps**: Google Maps Embed API.
