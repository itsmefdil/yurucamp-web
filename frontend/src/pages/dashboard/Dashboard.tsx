import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import type { Activity, Event } from '../../types';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();

    const { data: activities, isLoading: activitiesLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await api.get('/activities');
            return response.data as Activity[];
        }
    });

    const { data: joinedEvents, isLoading: joinedEventsLoading } = useQuery({
        queryKey: ['joined-events'],
        queryFn: async () => {
            const response = await api.get('/events/joined');
            return response.data as Event[];
        }
    });

    const { data: createdEvents, isLoading: createdEventsLoading } = useQuery({
        queryKey: ['created-events'],
        queryFn: async () => {
            const response = await api.get('/events/created');
            return response.data as Event[];
        }
    });

    if (authLoading || activitiesLoading || joinedEventsLoading || createdEventsLoading) {
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
    const myJoinedEvents = joinedEvents || [];
    const myCreatedEvents = createdEvents || [];

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <DashboardView
                    profile={user}
                    activities={myActivities}
                    joinedEvents={myJoinedEvents}
                    createdEvents={myCreatedEvents}
                />
            </main>
            <Footer />
        </div>
    );
}
