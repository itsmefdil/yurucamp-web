import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Users, Calendar, Tent, TrendingUp } from "lucide-react";
import api from '../../lib/api';
import {
    LineChart,
    Line,
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


export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pendingRegions, setPendingRegions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPending, setLoadingPending] = useState(true);

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
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm('Setujui pembuatan region ini?')) return;
        try {
            await api.post(`/regions/${id}/approve`);
            // Refresh list
            fetchPendingRegions();
            // Optional: Show success toast
        } catch (error) {
            console.error('Failed to approve region:', error);
            alert('Gagal menyetujui region');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Tolak pembuatan region ini? Aksi ini tidak dapat dibatalkan.')) return;
        try {
            await api.post(`/regions/${id}/reject`);
            // Refresh list
            fetchPendingRegions();
        } catch (error) {
            console.error('Failed to reject region:', error);
            alert('Gagal menolak region');
        }
    };
    const COLORS = ['#f97316', '#22c55e', '#f59e0b', '#3b82f6']; // Orange, Green, Amber, Blue

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-8 p-1 pb-24 md:pb-8">
            {/* Validated Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 md:p-8 text-white shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                    <p className="text-orange-50 opacity-90 text-sm md:text-base pr-8">
                        Selamat datang kembali! Berikut adalah ringkasan aktivitas di platform Yurucamp.
                    </p>
                </div>
                <Tent className="absolute right-[-20px] bottom-[-40px] h-48 w-48 md:h-64 md:w-64 text-white opacity-10 rotate-12 bg-blend-overlay" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Link to="/admin/users">
                    <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">{stats.userCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Active platform users</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/camp-areas">
                    <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Camp Areas</CardTitle>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Tent className="h-5 w-5 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">{stats.activeInfo.campCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Registered locations</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/events">
                    <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Events</CardTitle>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">{stats.activeInfo.eventCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Upcoming & Past events</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/admin/activities">
                    <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-sm hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Activities</CardTitle>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-amber-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">{stats.activeInfo.activityCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">User activities posted</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Region Requests Section */}
            <div className="grid gap-6 md:grid-cols-1">
                <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl text-gray-800">Permintaan Pembuatan Region</CardTitle>
                                <CardDescription>Review dan setujui permintaan komunitas baru</CardDescription>
                            </div>
                            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">
                                {pendingRegions.length} Pending
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loadingPending ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="animate-pulse flex space-x-4">
                                    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                                    <div className="flex-1 space-y-6 py-1">
                                        <div className="h-2 bg-slate-200 rounded"></div>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                                                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                                            </div>
                                            <div className="h-2 bg-slate-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : pendingRegions.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-100">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Tent className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Tidak ada permintaan</h3>
                                <p className="text-gray-500 mt-1">Semua permintaan region telah diproses.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingRegions.map((region) => (
                                    <div key={region.id} className="group relative bg-white border rounded-xl p-4 md:p-5 hover:shadow-md transition-all duration-200 hover:border-orange-200">
                                        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-5">
                                            <div className="w-full md:w-20 h-32 md:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                                                {region.imageUrl ? (
                                                    <img src={region.imageUrl} alt={region.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-500 font-bold text-2xl">
                                                        {region.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 w-full">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">{region.name}</h4>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                Region Baru
                                                            </span>
                                                            <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                                                            <span className="text-xs text-gray-500">{new Date(region.createdAt).toLocaleDateString()}</span>
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
                                                        <span className="font-medium text-gray-700 truncate max-w-[120px]">{region.creator?.fullName || "Unknown"}</span>
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
                                                    onClick={() => handleApprove(region.id)}
                                                    className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => handleReject(region.id)}
                                                    className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    Tolak
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
                <Card className="col-span-4 border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Pertumbuhan Pengguna</CardTitle>
                        <CardDescription>Jumlah user baru per hari (30 hari terakhir)</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.userGrowth} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
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
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        labelFormatter={(value) => {
                                            if (!value) return '';
                                            const date = new Date(value);
                                            return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                                        }}
                                        formatter={(value: number | undefined) => [`${value ?? 0} user baru`, 'Jumlah']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, fill: '#f97316' }}
                                        fill="url(#colorCount)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Distribution Chart */}
                <Card className="col-span-3 border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Content Distribution</CardTitle>
                        <CardDescription>Sebaran tipe konten di platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.contentStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
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
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-sm text-gray-600 font-medium ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text for Donut Chart */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                                <div className="text-xl font-bold text-gray-800">Total</div>
                                <div className="text-sm text-gray-500">Content</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
