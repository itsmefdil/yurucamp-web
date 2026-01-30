import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
import { Input } from '../../components/ui/input';
import { Trash2, Edit, Plus, Users, Check, X, Search, ChevronLeft, ChevronRight, Ban, PlayCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Label } from '../../components/ui/label';

interface Region {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    coverUrl?: string; // Added coverUrl
    status: 'active' | 'pending' | 'rejected' | 'suspended';
    memberCount?: number;
    creator?: {
        fullName: string;
    };
}

export default function AdminRegions() {
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null); // For dialog mode

    // Search & Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: ''
    });

    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            const response = await api.get('/admin/regions');
            setRegions(response.data);
        } catch (error) {
            console.error('Failed to fetch regions:', error);
            toast.error("Failed to load regions");
        } finally {
            setLoading(false);
        }
    };

    const filteredRegions = regions.filter(region => {
        const query = searchQuery.toLowerCase();
        return region.name.toLowerCase().includes(query) ||
            region.slug.toLowerCase().includes(query) ||
            (region.description || '').toLowerCase().includes(query);
    });

    const totalPages = Math.ceil(filteredRegions.length / ITEMS_PER_PAGE);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const paginatedRegions = filteredRegions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            toast.error("Name and slug are required");
            return;
        }

        try {
            if (editingId) {
                // Update
                const response = await api.put(`/regions/${editingId}`, formData);
                // Optimistic update
                setRegions(regions.map(r => r.id === editingId ? { ...r, ...response.data } : r));
                toast.success("Region updated");
            } else {
                // Create
                await api.post('/regions', formData);
                fetchRegions(); // Refresh to get all fields properly
                toast.success("Region created");
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save region:', error);
            toast.error(editingId ? "Failed to update region" : "Failed to create region");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this region?")) return;
        try {
            await api.delete(`/regions/${id}`);
            setRegions(regions.filter(r => r.id !== id));
            toast.success("Region deleted");
        } catch (error) {
            console.error('Failed to delete region:', error);
            toast.error("Failed to delete region");
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Setujui pembuatan region ini?')) return;
        try {
            await api.post(`/regions/${id}/approve`);
            fetchRegions();
            toast.success('Region disetujui');
        } catch (error) {
            console.error('Failed to approve region:', error);
            toast.error('Gagal menyetujui region');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Tolak pembuatan region ini?')) return;
        try {
            await api.post(`/regions/${id}/reject`);
            fetchRegions();
            toast.success('Region ditolak');
        } catch (error) {
            console.error('Failed to reject region:', error);
            toast.error('Gagal menolak region');
        }
    };

    const handleSuspend = async (id: string) => {
        if (!confirm('Suspend region ini? Region tidak akan bisa diakses publik.')) return;
        try {
            await api.post(`/regions/${id}/suspend`);
            fetchRegions();
            toast.success('Region disuspend');
        } catch (error) {
            console.error('Failed to suspend region:', error);
            toast.error('Gagal suspend region');
        }
    };

    const handleActivate = async (id: string) => {
        if (!confirm('Aktifkan kembali region ini?')) return;
        try {
            await api.post(`/regions/${id}/activate`);
            fetchRegions();
            toast.success('Region diaktifkan kembali');
        } catch (error) {
            console.error('Failed to activate region:', error);
            toast.error('Gagal mengaktifkan region');
        }
    };

    const openAddDialog = () => {
        setEditingId(null);
        resetForm();
        setIsDialogOpen(true);
    };

    const openEditDialog = (region: Region) => {
        setEditingId(region.id);
        setFormData({
            name: region.name,
            slug: region.slug,
            description: region.description || ''
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', description: '' });
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'suspended':
                return <Badge variant="destructive" className="bg-red-800 hover:bg-red-800 text-white">Suspended</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return <div>Loading regions...</div>;
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h1 className="text-3xl font-bold tracking-tight">Regions</h1>
                <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" /> Add Region
                </Button>
            </div>

            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search regions..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Regions ({filteredRegions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Creator</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRegions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No regions found matching your criteria
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRegions.map((region) => (
                                    <TableRow key={region.id}>
                                        <TableCell>
                                            <div className="font-medium">{region.name}</div>
                                            <div className="text-xs text-gray-500">{region.slug}</div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(region.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3 text-gray-500" />
                                                {region.memberCount || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {region.creator?.fullName || '-'}
                                        </TableCell>
                                        <TableCell className="text-gray-500 truncate max-w-[200px]">{region.description || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {region.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleApprove(region.id)}
                                                            title="Approve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleReject(region.id)}
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    title="View Region"
                                                >
                                                    <Link to={`/r/${region.slug}`} target="_blank">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {region.status === 'active' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                        onClick={() => handleSuspend(region.id)}
                                                        title="Suspend"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {region.status === 'suspended' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleActivate(region.id)}
                                                        title="Activate"
                                                    >
                                                        <PlayCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(region)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(region.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRegions.length)} of {filteredRegions.length} items
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Region" : "Tambah Region"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: !editingId ? generateSlug(e.target.value) : formData.slug })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slug" className="text-right">
                                Slug
                            </Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
