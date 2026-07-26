import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Users, Calendar, Tent, TrendingUp, ArrowUpRight, ShieldCheck, Eye, MapPin, CheckCircle, XCircle, HardDrive, Database, Server, RefreshCw, Cpu, Layers, Activity } from "lucide-react";
import api from '../../lib/api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "../../components/ui/dialog";
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

interface DashboardStats {
    userCount: number;
    activeInfo: {
        campCount: number;
        activityCount: number;
        eventCount: number;
    };
    contentStats: Array<{ name: string; value: number }>;
    userGrowth: Array<{ date: string; count: number }>;
}

interface SystemHealthData {
    status: string;
    timestamp: string;
    cloudinary: {
        plan: string;
        storage: { usedBytes: number; usedFormatted: string; limitBytes: number; percentUsed: number };
        bandwidth: { usedBytes: number; usedFormatted: string; percentUsed: number };
        credits: { used: number; limit: number; percentUsed: number };
        objectsCount: number;
    } | null;
    postgres: {
        databaseSizePretty: string;
        databaseSizeBytes: number;
        topTables: Array<{ tableName: string; sizePretty: string; sizeBytes: number }>;
    } | null;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
    const [loadingHealth, setLoadingHealth] = useState(true);
    const [pendingRegions, setPendingRegions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPending, setLoadingPending] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState<any | null>(null);

    // Confirm action state
    type ActionType = 'approve' | 'reject';
    const [confirmAction, setConfirmAction] = useState<{ type: ActionType; id: string } | null>(null);

    const dialogConfig: Record<ActionType, { title: string; description: string; confirmText: string }> = {
        approve: {
            title: 'Setujui Region?',
            description: 'Apakah Anda yakin ingin menyetujui pembuatan region ini?',
            confirmText: 'Setujui',
        },
        reject: {
            title: 'Tolak Region?',
            description: 'Apakah Anda yakin ingin menolak pembuatan region ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Tolak',
        },
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemHealth = async () => {
        setLoadingHealth(true);
        try {
            const response = await api.get('/admin/system-health');
            setSystemHealth(response.data);
        } catch (error) {
            console.error('Failed to fetch system health:', error);
        } finally {
            setLoadingHealth(false);
        }
    };

    const fetchPendingRegions = async () => {
        try {
            const response = await api.get('/regions/pending');
            setPendingRegions(response.data);
        } catch (error) {
            console.error('Failed to fetch pending regions:', error);
        } finally {
            setLoadingPending(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchPendingRegions();
        fetchSystemHealth();
    }, []);

    const handleConfirm = async () => {
        if (!confirmAction) return;
        const { type, id } = confirmAction;
        try {
            await api.post(`/regions/${id}/${type}`);
            fetchPendingRegions();
            if (selectedRegion?.id === id) {
                setSelectedRegion(null);
            }
            toast.success(type === 'approve' ? 'Region disetujui' : 'Region ditolak');
        } catch (error) {
            console.error(`Failed to ${type} region:`, error);
            toast.error(type === 'approve' ? 'Gagal menyetujui region' : 'Gagal menolak region');
        } finally {
            setConfirmAction(null);
        }
    };
    const COLORS = ['#f97316', '#22c55e', '#f59e0b', '#3b82f6']; // Orange, Green, Amber, Blue

    if (loading) {
        return (
            <div className="space-y-8 p-1 pb-24 md:pb-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="h-36 bg-gradient-to-r from-orange-200 to-amber-200 rounded-2xl"></div>

                {/* Quick Actions Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4 h-80 bg-gray-100 rounded-xl"></div>
                    <div className="col-span-3 h-80 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    // Calculate total content count for pie chart center
    const totalContent = stats.contentStats.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="space-y-8 p-1 pb-24 md:pb-8">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 md:p-8 text-white shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
                        <ShieldCheck className="w-4 h-4" /> Admin Control Center
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                    <p className="text-orange-50 opacity-90 text-sm md:text-base leading-relaxed">
                        Selamat datang kembali! Berikut adalah ringkasan performa dan aktivitas platform Yurucamp Indonesia hari ini.
                    </p>
                </div>
                <Tent className="absolute right-[-20px] bottom-[-40px] h-56 w-56 md:h-72 md:w-72 text-white opacity-15 rotate-12 bg-blend-overlay pointer-events-none" />
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Navigasi & Akses Cepat</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link to="/admin/users" className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 font-medium text-sm transition-all group">
                        <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Kelola Pengguna</span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </Link>
                    <Link to="/admin/camp-areas" className="flex items-center justify-between p-3 rounded-lg bg-green-50/60 hover:bg-green-100/80 text-green-700 font-medium text-sm transition-all group">
                        <span className="flex items-center gap-2"><Tent className="w-4 h-4" /> Lokasi Camping</span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </Link>
                    <Link to="/admin/events" className="flex items-center justify-between p-3 rounded-lg bg-orange-50/60 hover:bg-orange-100/80 text-orange-700 font-medium text-sm transition-all group">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Kelola Event</span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </Link>
                    <Link to="/admin/regions" className="flex items-center justify-between p-3 rounded-lg bg-amber-50/60 hover:bg-amber-100/80 text-amber-700 font-medium text-sm transition-all group">
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Regional Komunitas</span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Link to="/admin/users">
                    <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm hover:-translate-y-1 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Pengguna</CardTitle>
                            <div className="p-2.5 bg-blue-50 rounded-xl">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">{stats.userCount}</div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
                                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                    Aktif <TrendingUp className="w-3 h-3" />
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/camp-areas">
                    <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm hover:-translate-y-1 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Lokasi Camping</CardTitle>
                            <div className="p-2.5 bg-green-50 rounded-xl">
                                <Tent className="h-5 w-5 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">{stats.activeInfo.campCount}</div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">Spot terverifikasi</p>
                                <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    Tayang
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/events">
                    <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm hover:-translate-y-1 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Acara & Event</CardTitle>
                            <div className="p-2.5 bg-orange-50 rounded-xl">
                                <Calendar className="h-5 w-5 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">{stats.activeInfo.eventCount}</div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">Kegiatan komunitas</p>
                                <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                    Mendatang
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/activities">
                    <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm hover:-translate-y-1 bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Postingan Aktivitas</CardTitle>
                            <div className="p-2.5 bg-amber-50 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-amber-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">{stats.activeInfo.activityCount}</div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">Catatan & foto user</p>
                                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    Feed
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Region Requests Section */}
            <div className="grid gap-6 md:grid-cols-1">
                <Card className="border-none shadow-md overflow-hidden bg-white">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-orange-500" /> Permintaan Pembuatan Region
                                </CardTitle>
                                <CardDescription>Review dan setujui permintaan pengajuan komunitas baru</CardDescription>
                            </div>
                            <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                {pendingRegions.length} Pending
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loadingPending ? (
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : pendingRegions.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border">
                                    <Tent className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Tidak ada permintaan pending</h3>
                                <p className="text-gray-500 text-sm mt-1">Semua pengajuan region komunitas telah diproses.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingRegions.map((region) => (
                                    <div key={region.id} className="group relative bg-white border rounded-xl p-4 md:p-5 hover:shadow-md transition-all duration-200 hover:border-orange-300">
                                        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-5">
                                            <div className="w-full md:w-20 h-32 md:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                                                {region.imageUrl ? (
                                                    <img src={region.imageUrl} alt={region.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold text-2xl">
                                                        {region.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 w-full">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">{region.name}</h4>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                                                Region Baru
                                                            </span>
                                                            <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                                                            <span className="text-xs text-gray-500">{new Date(region.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                                                    {region.description || "Tidak ada deskripsi yang diberikan oleh pengaju."}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-t pt-3 mt-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                            {region.creator?.fullName?.[0] || "?"}
                                                        </div>
                                                        <span className="font-medium text-gray-700 truncate max-w-[120px]">{region.creator?.fullName || "Pengaju"}</span>
                                                    </div>
                                                    <span className="hidden sm:inline h-1 w-1 rounded-full bg-gray-300"></span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span>{region.memberCount || 1} Anggota</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                <button
                                                    onClick={() => setSelectedRegion(region)}
                                                    className="flex-1 md:flex-none px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> Detail
                                                </button>
                                                <button
                                                    onClick={() => setConfirmAction({ type: 'approve', id: region.id })}
                                                    className="flex-1 md:flex-none px-3.5 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm hover:shadow flex items-center justify-center gap-1.5"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" /> Setujui
                                                </button>
                                                <button
                                                    onClick={() => setConfirmAction({ type: 'reject', id: region.id })}
                                                    className="flex-1 md:flex-none px-3.5 py-2 text-xs font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" /> Tolak
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* User Growth Chart */}
                <Card className="col-span-4 border-none shadow-md bg-white">
                    <CardHeader>
                        <CardTitle className="text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" /> Pertumbuhan Pengguna
                        </CardTitle>
                        <CardDescription>Jumlah pendaftaran user baru (30 hari terakhir)</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        interval="preserveStartEnd"
                                        minTickGap={50}
                                        tickFormatter={(value) => {
                                            if (!value) return '';
                                            const date = new Date(value);
                                            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                        }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                        dx={-10}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            border: '1px solid #f3f4f6',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }}
                                        labelFormatter={(value) => {
                                            if (!value) return '';
                                            const date = new Date(value);
                                            return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                                        }}
                                        formatter={(value: number | undefined) => [`${value ?? 0} user baru`, 'Pendaftaran']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, fill: '#f97316' }}
                                        fill="url(#colorCount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Distribution Chart */}
                <Card className="col-span-3 border-none shadow-md bg-white">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Distribusi Konten</CardTitle>
                        <CardDescription>Komposisi tipe data & konten di platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.contentStats}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.contentStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            border: '1px solid #f3f4f6',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs text-gray-600 font-medium ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text for Donut Chart */}
                            <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <div className="text-2xl font-bold text-gray-800">{totalContent}</div>
                                <div className="text-xs text-gray-400 uppercase font-semibold">Total Item</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Region Detail Modal */}
            {selectedRegion && (
                <Dialog open={!!selectedRegion} onOpenChange={() => setSelectedRegion(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">{selectedRegion.name}</DialogTitle>
                            <DialogDescription>
                                Detail permohonan pembentukan region komunitas baru.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedRegion.imageUrl && (
                            <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 my-2">
                                <img src={selectedRegion.imageUrl} alt={selectedRegion.name} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="space-y-3 py-2 text-sm">
                            <div>
                                <span className="font-semibold text-gray-700 block">Slug / URL Region:</span>
                                <span className="text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded">/region/{selectedRegion.slug}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700 block">Deskripsi:</span>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border">{selectedRegion.description || "Tidak ada deskripsi."}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                                <div>
                                    <span className="text-gray-500 block">Pengaju (Admin Region):</span>
                                    <span className="font-medium text-gray-800">{selectedRegion.creator?.fullName || "Unknown"}</span>
                                    <span className="text-gray-400 block text-[11px]">{selectedRegion.creator?.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Tanggal Pengajuan:</span>
                                    <span className="font-medium text-gray-800">{new Date(selectedRegion.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setSelectedRegion(null)}>
                                Tutup
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => setConfirmAction({ type: 'reject', id: selectedRegion.id })}
                                >
                                    Tolak
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => setConfirmAction({ type: 'approve', id: selectedRegion.id })}
                                >
                                    Setujui
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Confirmation Dialog */}
            {confirmAction && (
                <ConfirmationDialog
                    isOpen={!!confirmAction}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={handleConfirm}
                    title={dialogConfig[confirmAction.type].title}
                    description={dialogConfig[confirmAction.type].description}
                    confirmText={dialogConfig[confirmAction.type].confirmText}
                    cancelText="Batal"
                />
            )}
        </div>
    );
}
