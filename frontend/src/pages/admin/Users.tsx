import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { User } from '../../types';
import api from '../../lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Pencil, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { toast } from 'sonner';

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        role: 'user',
        level: 1,
        exp: 0
    });

    // Valid role type & sort type for filter
    type RoleFilterType = 'all' | 'user' | 'admin';
    type SortOptionType = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

    // Filter & Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilterType>('all');
    const [sortBy, setSortBy] = useState<SortOptionType>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setFormData({
            role: user.role || 'user',
            level: user.level || 1,
            exp: user.exp || 0
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            await api.put(`/admin/users/${editingUser.id}`, formData);
            toast.success("User updated successfully");
            setIsDialogOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error("Failed to update user");
        }
    };

    const filteredUsers = users
        .filter(user => {
            const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            }
            if (sortBy === 'oldest') {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
            }
            if (sortBy === 'name-asc') {
                const nameA = a.fullName || a.email || '';
                const nameB = b.fullName || b.email || '';
                return nameA.localeCompare(nameB);
            }
            if (sortBy === 'name-desc') {
                const nameA = a.fullName || a.email || '';
                const nameB = b.fullName || b.email || '';
                return nameB.localeCompare(nameA);
            }
            return 0;
        });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    // Reset page when filter or sorting changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter, sortBy]);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat data pengguna...</div>;
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Cari nama atau email..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-gray-500 hidden sm:block" />
                    <Select
                        value={roleFilter}
                        onValueChange={(value) => setRoleFilter(value as RoleFilterType)}
                    >
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Peran / Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Peran</SelectItem>
                            <SelectItem value="user">User Biasa</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={sortBy}
                        onValueChange={(value) => setSortBy(value as SortOptionType)}
                    >
                        <SelectTrigger className="w-full sm:w-[170px]">
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Terbaru</SelectItem>
                            <SelectItem value="oldest">Terlama</SelectItem>
                            <SelectItem value="name-asc">Nama (A - Z)</SelectItem>
                            <SelectItem value="name-desc">Nama (Z - A)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Nama Lengkap</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Peran / Role</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead className="text-right">EXP</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        Tidak ada pengguna yang cocok dengan kriteria pencarian
                                    </TableCell>
                                </TableRow>
                            ) :
                                paginatedUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                                                <AvatarFallback>{user.fullName ? user.fullName[0].toUpperCase() : 'U'}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{user.fullName || 'Belum diisi'}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.level}</TableCell>
                                        <TableCell className="text-right">{user.exp}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)} title="Edit User">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-gray-500">
                            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} sampai {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} dari {filteredUsers.length} pengguna
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Data Pengguna</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Peran (Role)
                            </Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Pilih peran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User Biasa</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="level" className="text-right">
                                Level
                            </Label>
                            <Input
                                id="level"
                                type="number"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="exp" className="text-right">
                                Total EXP
                            </Label>
                            <Input
                                id="exp"
                                type="number"
                                value={formData.exp}
                                onChange={(e) => setFormData({ ...formData, exp: parseInt(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSave}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
