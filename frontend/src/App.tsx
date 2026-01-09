import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import About from './pages/About';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import CampAreas from './pages/CampAreas';
import CampAreaDetail from './pages/CampAreaDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Watch from './pages/Watch';
import WatchSeason from './pages/WatchSeason';
import Dashboard from './pages/dashboard/Dashboard';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/activities" element={<Activities />} />
                        <Route path="/activities/:id" element={<ActivityDetail />} />
                        <Route path="/camp-areas" element={<CampAreas />} />
                        <Route path="/camp-areas/:id" element={<CampAreaDetail />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/watch" element={<Watch />} />
                        <Route path="/watch/:seasonId" element={<WatchSeason />} />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                    <Toaster position="top-right" />
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
