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
import { Trash2, ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AdminCampAreas() {
    const [campAreas, setCampAreas] = useState<CampArea[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

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

    const filteredCampAreas = campAreas.filter(area => {
        const matchesSearch = area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (area.location || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredCampAreas.length / ITEMS_PER_PAGE);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const paginatedCampAreas = filteredCampAreas.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
        <div className="space-y-6 pb-24 md:pb-8">
            <h1 className="text-3xl font-bold tracking-tight">Camp Areas</h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search camp areas..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Camp Areas ({filteredCampAreas.length})</CardTitle>
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
                            {paginatedCampAreas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No camp areas found matching your criteria
                                    </TableCell>
                                </TableRow>
                            ) :
                                paginatedCampAreas.map((area) => (
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
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCampAreas.length)} of {filteredCampAreas.length} items
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
