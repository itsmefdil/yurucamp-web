import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import type { Activity, CampArea } from '../../types';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();

    const { data: activities, isLoading: activitiesLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await api.get('/activities');
            return response.data as Activity[];
        }
    });

    const { data: campAreas, isLoading: campAreasLoading } = useQuery({
        queryKey: ['campAreas'],
        queryFn: async () => {
            const response = await api.get('/camp-areas');
            return response.data as CampArea[];
        }
    });

    if (authLoading || activitiesLoading || campAreasLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Should redirect via protected route normally
    }

    const myActivities = activities?.filter(a => a.userId === user.id) || [];
    const myCampAreas = campAreas?.filter(c => c.userId === user.id) || [];

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <DashboardView
                    profile={user}
                    activities={myActivities}
                    campAreas={myCampAreas}
                />
            </main>
            <Footer />
        </div>
    );
}
