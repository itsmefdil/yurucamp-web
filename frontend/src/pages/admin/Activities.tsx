import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { Activity } from '../../types';
import api from '../../lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Button } from '../../components/ui/button';
import { Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminActivities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await api.get('/admin/activities');
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            toast.error("Failed to load activities");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this activity?")) return;

        try {
            await api.delete(`/admin/activities/${id}`);
            toast.success("Activity deleted");
            setActivities(activities.filter(a => a.id !== id));
        } catch (error) {
            console.error('Failed to delete activity:', error);
            toast.error("Failed to delete activity");
        }
    };

    if (loading) {
        return <div>Loading activities...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Activities</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Activities</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Posted By</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell>
                                        {activity.date ? format(new Date(activity.date), 'dd MMM yyyy') : '-'}
                                    </TableCell>
                                    <TableCell className="font-medium">{activity.title}</TableCell>
                                    <TableCell>{activity.location}</TableCell>
                                    <TableCell>{activity.user?.fullName || 'Unknown'}</TableCell>
                                    <TableCell className="flex items-center space-x-2">
                                        <Link to={`/a/${activity.id}`} target="_blank">
                                            <Button variant="ghost" size="icon">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(activity.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
