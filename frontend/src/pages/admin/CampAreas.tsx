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
import { Trash2, ExternalLink, Search, ChevronLeft, ChevronRight, Plus, Pencil } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialog';

export default function AdminCampAreas() {
    const [campAreas, setCampAreas] = useState<CampArea[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

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

    const handleDeleteClick = (id: string) => {
        setSelectedAreaId(id);
        setDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAreaId) return;

        try {
            await api.delete(`/admin/camp-areas/${selectedAreaId}`);
            toast.success("Camp area deleted");
            setCampAreas(campAreas.filter(area => area.id !== selectedAreaId));
        } catch (error) {
            console.error('Failed to delete camp area:', error);
            toast.error("Failed to delete camp area");
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedAreaId(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat lokasi camping...</div>;
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Kelola Lokasi Camping</h1>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                    <Link to="/c/new">
                        <Plus className="h-4 w-4 mr-2" /> Tambah Lokasi
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Cari nama atau lokasi..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Lokasi Camping ({filteredCampAreas.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Foto</TableHead>
                                <TableHead>Nama Lokasi</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Harga Est.</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCampAreas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Tidak ada lokasi camping yang cocok
                                    </TableCell>
                                </TableRow>
                            ) :
                                paginatedCampAreas.map((area) => (
                                    <TableRow key={area.id}>
                                        <TableCell>
                                            {area.imageUrl ? (
                                                <img
                                                    src={area.imageUrl}
                                                    alt={area.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
                                                    No Img
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{area.name}</TableCell>
                                        <TableCell>{area.location || '-'}</TableCell>
                                        <TableCell>
                                            {area.price && !isNaN(Number(area.price))
                                                ? `Rp ${Math.round(Number(area.price)).toLocaleString('id-ID')}`
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild title="Buka Detail">
                                                    <Link to={`/c/${area.id}`} target="_blank">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild title="Edit Lokasi">
                                                    <Link to={`/c/${area.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteClick(area.id)}
                                                    title="Hapus Lokasi"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-gray-500">
                            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} sampai {Math.min(currentPage * ITEMS_PER_PAGE, filteredCampAreas.length)} dari {filteredCampAreas.length} lokasi
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
                                Halaman {currentPage} dari {totalPages}
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
            </Card>

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Lokasi Camping?"
                description="Apakah Anda yakin ingin menghapus lokasi camping ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                cancelText="Batal"
            />
        </div>
    );
}
