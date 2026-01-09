# Yurucamp Frontend (Vite + React)

Frontend application untuk Yurucamp, dibangun dengan Vite, React, dan TypeScript sebagai pengganti Next.js.

## Tech Stack

- **Framework**: Vite + React 19
- **Language**: TypeScript
- **Routing**: React Router DOM
- **State Management**: 
  - React Context (Auth)
  - TanStack Query (Server State)
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Bun atau Node.js 18+
- Backend API running on port 3333

### Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start development server
bun run dev
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3333
VITE_APP_NAME=Yurucamp
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── ui/          # Base UI components (Radix)
│   │   └── ...          # Feature components
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities
│   │   ├── api.ts       # Axios instance
│   │   └── utils.ts     # Helper functions
│   ├── pages/           # Page components
│   │   ├── dashboard/   # Dashboard pages
│   │   └── ...
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.example         # Environment variables template
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Features

### Implemented

- ✅ Project setup with Vite + React + TypeScript
- ✅ Tailwind CSS with custom theme
- ✅ React Router for routing
- ✅ Authentication context and protected routes
- ✅ Axios API client with interceptors
- ✅ TanStack Query for server state
- ✅ All dependencies installed
- ✅ Placeholder pages for all routes

### To Be Implemented

- ⏳ Login/Register pages with Google OAuth
- ⏳ Landing page
- ⏳ Activities CRUD
- ⏳ Camp Areas CRUD
- ⏳ Events CRUD
- ⏳ Dashboard
- ⏳ Settings pages
- ⏳ Watch videos feature
- ⏳ UI components from Next.js
- ⏳ Layout components (Header, Footer, Sidebar)

## Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Register page
- `/about` - About page
- `/activities` - Activities list
- `/activities/:id` - Activity detail
- `/camp-areas` - Camp areas list
- `/camp-areas/:id` - Camp area detail
- `/events` - Events list
- `/events/:id` - Event detail

### Protected Routes
- `/dashboard` - Dashboard home
- `/dashboard/*` - Dashboard sub-routes

## API Integration

The frontend communicates with the Express backend API running on port 3333.

### Authentication

- JWT tokens stored in localStorage
- Automatic token injection via Axios interceptors
- Automatic redirect to login on 401 errors

### File Uploads

All file uploads use `FormData` and are sent to backend endpoints as `multipart/form-data`.

## Development

```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Migration from Next.js

This project replaces the original Next.js frontend. Key changes:

1. **Routing**: Next.js App Router → React Router DOM
2. **Data Fetching**: Server Actions → Axios + TanStack Query
3. **Authentication**: Supabase Client → Backend API with JWT
4. **File Uploads**: Client-side Cloudinary → Backend multipart uploads
5. **SSR**: Removed (now pure SPA)

## Next Steps

1. Migrate UI components from Next.js `components/ui/`
2. Implement authentication pages (Login/Register)
3. Implement landing page
4. Migrate feature components (Activities, Camp Areas, Events)
5. Implement dashboard
6. Test all features with backend API
