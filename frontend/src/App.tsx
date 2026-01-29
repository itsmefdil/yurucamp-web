import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BottomNav } from './components/layout/BottomNav';
import { TitleUpdater } from './components/TitleUpdater';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminRoute } from './components/AdminRoute';

// Lazy load admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/Users'));
const AdminCampAreas = React.lazy(() => import('./pages/admin/CampAreas'));
const AdminActivities = React.lazy(() => import('./pages/admin/Activities'));
const AdminEvents = React.lazy(() => import('./pages/admin/Events'));
const AdminRegions = React.lazy(() => import('./pages/admin/Regions'));
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
import AddCampArea from './pages/AddCampArea';
import EditCampArea from './pages/EditCampArea';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import AddEvent from './pages/AddEvent';
import EditEvent from './pages/EditEvent';
import EventParticipants from './pages/EventParticipants';
import Watch from './pages/Watch';
import WatchSeason from './pages/WatchSeason';
import Dashboard from './pages/dashboard/Dashboard';
import AddActivity from './pages/dashboard/AddActivity';
import EditActivity from './pages/dashboard/EditActivity';
import EditProfile from './pages/dashboard/EditProfile';
import GearListDashboard from './pages/GearLists/GearListDashboard';
import GearListDetail from './pages/GearLists/GearListDetail';
import RegionDetail from './pages/RegionDetail';
import RegionManagement from './pages/RegionManagement';
import CreateRegion from './pages/CreateRegion';
import Community from './pages/Community';
import UserProfile from './pages/UserProfile';
import RegionMembers from './pages/RegionMembers';

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
                    <TitleUpdater />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/activities" element={<Activities />} />
                        <Route path="/a/:id" element={<ActivityDetail />} />
                        <Route path="/camp-areas" element={<CampAreas />} />
                        <Route path="/c/add" element={
                            <ProtectedRoute>
                                <AddCampArea />
                            </ProtectedRoute>
                        } />
                        <Route path="/c/:id" element={<CampAreaDetail />} />
                        <Route path="/c/:id/edit" element={
                            <ProtectedRoute>
                                <EditCampArea />
                            </ProtectedRoute>
                        } />
                        <Route path="/events" element={<Events />} />
                        <Route path="/e/add" element={
                            <ProtectedRoute>
                                <AddEvent />
                            </ProtectedRoute>
                        } />
                        <Route path="/e/:id" element={<EventDetail />} />
                        <Route path="/e/:id/edit" element={
                            <ProtectedRoute>
                                <EditEvent />
                            </ProtectedRoute>
                        } />
                        <Route path="/e/:id/participants" element={<EventParticipants />} />
                        <Route path="/watch" element={<Watch />} />
                        <Route path="/w/:seasonId" element={<WatchSeason />} />
                        <Route path="/r/create" element={
                            <ProtectedRoute>
                                <CreateRegion />
                            </ProtectedRoute>
                        } />
                        <Route path="/r/:slug" element={<RegionDetail />} />
                        <Route path="/r/:slug/members" element={<RegionMembers />} />
                        <Route path="/r/:slug/manage" element={
                            <ProtectedRoute>
                                <RegionManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/community" element={<Community />} />
                        <Route path="/u/:id" element={<UserProfile />} />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/add-activity"
                            element={
                                <ProtectedRoute>
                                    <AddActivity />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/edit-activity/:id"
                            element={
                                <ProtectedRoute>
                                    <EditActivity />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/pengaturan"
                            element={
                                <ProtectedRoute>
                                    <EditProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/gear-lists"
                            element={
                                <ProtectedRoute>
                                    <GearListDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Public Gear List View (for shared lists) */}
                        <Route path="/g/:id" element={<GearListDetail />} />

                        {/* Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminLayout />
                                </AdminRoute>
                            }
                        >
                            <Route index element={
                                <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
                                    <AdminDashboard />
                                </Suspense>
                            } />
                            <Route path="users" element={
                                <Suspense fallback={<div className="p-8">Loading users...</div>}>
                                    <AdminUsers />
                                </Suspense>
                            } />
                            <Route path="camp-areas" element={
                                <Suspense fallback={<div className="p-8">Loading camp areas...</div>}>
                                    <AdminCampAreas />
                                </Suspense>
                            } />
                            <Route path="activities" element={
                                <Suspense fallback={<div className="p-8">Loading activities...</div>}>
                                    <AdminActivities />
                                </Suspense>
                            } />
                            <Route path="events" element={
                                <Suspense fallback={<div className="p-8">Loading events...</div>}>
                                    <AdminEvents />
                                </Suspense>
                            } />
                            <Route path="regions" element={
                                <Suspense fallback={<div className="p-8">Loading regions...</div>}>
                                    <AdminRegions />
                                </Suspense>
                            } />
                            {/* Add more admin routes here */}
                        </Route>
                    </Routes>
                    <Toaster position="top-right" />
                    <BottomNav />
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
