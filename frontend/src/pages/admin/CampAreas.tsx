import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { CampArea } from '../../types';
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

export default function AdminCampAreas() {
    const [campAreas, setCampAreas] = useState<CampArea[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampAreas();
    }, []);

    const fetchCampAreas = async () => {
        try {
            const response = await api.get('/admin/camp-areas');
            setCampAreas(response.data);
        } catch (error) {
            console.error('Failed to fetch camp areas:', error);
            toast.error("Failed to load camp areas");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this camp area?")) return;

        try {
            await api.delete(`/admin/camp-areas/${id}`);
            toast.success("Camp area deleted");
            setCampAreas(campAreas.filter(area => area.id !== id));
        } catch (error) {
            console.error('Failed to delete camp area:', error);
            toast.error("Failed to delete camp area");
        }
    };

    if (loading) {
        return <div>Loading camp areas...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Camp Areas</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Camp Areas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campAreas.map((area) => (
                                <TableRow key={area.id}>
                                    <TableCell className="font-medium">{area.name}</TableCell>
                                    <TableCell>{area.location}</TableCell>
                                    <TableCell>{area.price}</TableCell>
                                    <TableCell>{area.user?.fullName || 'Unknown'}</TableCell>
                                    <TableCell className="flex items-center space-x-2">
                                        <Link to={`/c/${area.id}`} target="_blank">
                                            <Button variant="ghost" size="icon">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(area.id)}
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
