import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Server, HardDrive, Database, RefreshCw, Cpu, Layers, Activity, CheckCircle, AlertTriangle, Zap, Clock, ShieldAlert } from "lucide-react";
import { Button } from '../../components/ui/button';
import api from '../../lib/api';

interface SystemHealthData {
    status: string;
    timestamp: string;
    responseTimeMs: number;
    runtime: {
        nodeVersion: string;
        environment: string;
        uptimeSeconds: number;
        uptimeFormatted: string;
        memory: {
            heapUsedMB: string;
            heapTotalMB: string;
            rssMB: string;
            percentUsed: string;
        };
    };
    cloudinary: {
        plan: string;
        latencyMs: number;
        storage: { usedBytes: number; usedFormatted: string; limitBytes: number; percentUsed: number };
        bandwidth: { usedBytes: number; usedFormatted: string; percentUsed: number };
        credits: { used: number; limit: number; percentUsed: number };
        objectsCount: number;
    } | null;
    postgres: {
        latencyMs: number;
        activeConnections: number;
        databaseSizePretty: string;
        databaseSizeBytes: number;
        topTables: Array<{ tableName: string; sizePretty: string; sizeBytes: number }>;
    } | null;
}

export default function AdminSystemHealth() {
    const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSystemHealth = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/system-health');
            setSystemHealth(response.data);
        } catch (error) {
            console.error('Failed to fetch system health:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemHealth();
    }, []);

    const isStorageWarning = (systemHealth?.cloudinary?.storage?.percentUsed || 0) > 80;
    const isMemoryWarning = parseFloat(systemHealth?.runtime?.memory?.percentUsed || '0') > 85;

    return (
        <div className="space-y-6 pb-12">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold mb-2 backdrop-blur-md">
                        <Activity className="w-3.5 h-3.5" /> Real-time System Telemetry & Health
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">System Health & Storage</h1>
                    <p className="text-slate-300 text-sm mt-1 max-w-xl">
                        Pemantauan memori server Node.js, koneksi database PostgreSQL, sisa kuota media Cloudinary, dan latensi API.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    <Button
                        onClick={fetchSystemHealth}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg font-medium text-xs gap-2 px-4 py-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Telemetry
                    </Button>
                </div>
                <Server className="absolute right-[-20px] bottom-[-30px] h-52 w-52 text-white/5 rotate-12 pointer-events-none" />
            </div>

            {/* Warnings Banner */}
            {(isStorageWarning || isMemoryWarning) && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="text-xs">
                        <strong className="font-bold">Peringatan Kapasitas Sistem:</strong>
                        {isStorageWarning && <span> Storage Cloudinary mendekati batas kuota (&gt;80%).</span>}
                        {isMemoryWarning && <span> Penggunaan RAM Node.js cukup tinggi (&gt;85%).</span>}
                    </div>
                </div>
            )}

            {/* Top Quick Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-white p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">API Telemetry Latency</p>
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            {systemHealth?.responseTimeMs !== undefined ? `${systemHealth.responseTimeMs} ms` : 'Loading...'}
                        </h4>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">Node.js Memory (Heap)</p>
                        <h4 className="text-lg font-bold text-gray-800 mt-0.5">
                            {systemHealth?.runtime?.memory ? `${systemHealth.runtime.memory.heapUsedMB} MB (${systemHealth.runtime.memory.percentUsed}%)` : '0 MB'}
                        </h4>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Cpu className="w-5 h-5" />
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">Cloudinary Media Storage</p>
                        <h4 className="text-lg font-bold text-gray-800 mt-0.5">
                            {systemHealth?.cloudinary?.storage.usedFormatted || '0 MB'}
                        </h4>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <HardDrive className="w-5 h-5" />
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500">PostgreSQL Database Size</p>
                        <h4 className="text-lg font-bold text-gray-800 mt-0.5">
                            {systemHealth?.postgres?.databaseSizePretty || '0 MB'}
                        </h4>
                    </div>
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                        <Database className="w-5 h-5" />
                    </div>
                </Card>
            </div>

            {/* Server Runtime & DB Latency Info Bar */}
            <div className="bg-white border rounded-xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                    <span className="text-gray-400 font-medium block mb-1">Server Runtime Uptime</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {systemHealth?.runtime?.uptimeFormatted || '0j 0m 0d'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400 font-medium block mb-1">Environment & Version</span>
                    <span className="font-bold text-gray-800 uppercase font-mono">
                        {systemHealth?.runtime?.environment || 'prod'} • {systemHealth?.runtime?.nodeVersion || 'v20'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400 font-medium block mb-1">PostgreSQL Ping Latency</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        {systemHealth?.postgres?.latencyMs !== undefined ? `${systemHealth.postgres.latencyMs} ms` : '-'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400 font-medium block mb-1">Cloudinary CDN Latency</span>
                    <span className="font-bold text-blue-600 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        {systemHealth?.cloudinary?.latencyMs !== undefined ? `${systemHealth.cloudinary.latencyMs} ms` : '-'}
                    </span>
                </div>
            </div>

            {/* Main Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cloudinary Storage & Bandwidth Card */}
                <Card className="border-none shadow-md bg-white overflow-hidden flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <HardDrive className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-white font-bold">Cloudinary Media CDN</CardTitle>
                                    <CardDescription className="text-blue-100 text-xs">
                                        Plan Terdaftar: <span className="font-semibold text-white uppercase">{systemHealth?.cloudinary?.plan || 'Free Tier'}</span>
                                    </CardDescription>
                                </div>
                            </div>
                            <span className="text-xs bg-white/20 text-white font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                                {systemHealth?.cloudinary?.objectsCount || 0} File Ter-upload
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6 flex-1 flex flex-col justify-between">
                        {loading ? (
                            <div className="space-y-4 py-8 animate-pulse">
                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ) : systemHealth?.cloudinary ? (
                            <>
                                <div className="space-y-5">
                                    {/* Storage Usage Bar */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                                            <span className="text-gray-700 font-bold flex items-center gap-1.5">
                                                <HardDrive className="w-4 h-4 text-blue-500" /> Kapasitas Storage Terpakai
                                            </span>
                                            <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                                                {systemHealth.cloudinary.storage.usedFormatted} ({systemHealth.cloudinary.storage.percentUsed}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full rounded-full transition-all duration-700 shadow-sm"
                                                style={{ width: `${Math.max(2, Math.min(100, systemHealth.cloudinary.storage.percentUsed))}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Bandwidth Usage Bar */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                                            <span className="text-gray-700 font-bold flex items-center gap-1.5">
                                                <Server className="w-4 h-4 text-indigo-500" /> Bandwidth Bulanan Terpakai
                                            </span>
                                            <span className="text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                                                {systemHealth.cloudinary.bandwidth.usedFormatted} ({systemHealth.cloudinary.bandwidth.percentUsed}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                            <div
                                                className="bg-indigo-600 h-full rounded-full transition-all duration-700 shadow-sm"
                                                style={{ width: `${Math.max(2, Math.min(100, systemHealth.cloudinary.bandwidth.percentUsed))}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Monthly Cloud Credits */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 flex items-center justify-between border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-600 text-white rounded-lg">
                                                <Cpu className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">Cloud Credits Monthly Limit</p>
                                                <p className="text-[11px] text-gray-500">Transformasi & penyimpanan Cloudinary</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-sm">
                                            {systemHealth.cloudinary.credits.used} / {systemHealth.cloudinary.credits.limit || 25} Credits
                                        </span>
                                    </div>
                                </div>

                                <div className="text-[11px] text-gray-400 text-right pt-2 border-t">
                                    Pembaruan terakhir: {new Date(systemHealth.timestamp).toLocaleTimeString('id-ID')}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10 text-xs text-gray-400 flex flex-col items-center gap-2">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                                Data Cloudinary tidak tersedia.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* PostgreSQL Database Storage Card */}
                <Card className="border-none shadow-md bg-white overflow-hidden flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Database className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-white font-bold">PostgreSQL Relational DB</CardTitle>
                                    <CardDescription className="text-teal-100 text-xs">
                                        Engine: <span className="font-semibold text-white">PostgreSQL Connection Pool</span>
                                    </CardDescription>
                                </div>
                            </div>
                            <span className="text-xs bg-white/20 text-white font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                                Total: {systemHealth?.postgres?.databaseSizePretty || '0 MB'}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5 flex-1 flex flex-col justify-between">
                        {loading ? (
                            <div className="space-y-3 py-8 animate-pulse">
                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ) : systemHealth?.postgres?.topTables && systemHealth.postgres.topTables.length > 0 ? (
                            <div className="space-y-4">
                                <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-xs">
                                    <span className="font-medium text-gray-700 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-emerald-600" /> Active DB Connection Pool
                                    </span>
                                    <span className="font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded border border-emerald-200">
                                        {systemHealth.postgres.activeConnections} Koneksi Aktif
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2.5 pb-2 border-b">
                                        <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-emerald-600" /> 8 Tabel DB Terbesar</span>
                                        <span>Ukuran Data & Index</span>
                                    </div>
                                    <div className="space-y-2">
                                        {systemHealth.postgres.topTables.map((table, idx) => (
                                            <div
                                                key={table.tableName}
                                                className="flex items-center justify-between text-xs p-2 rounded-xl border border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="font-mono font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                                                        {table.tableName}
                                                    </span>
                                                </div>
                                                <span className="font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                                    {table.sizePretty}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-xs text-gray-400 flex flex-col items-center gap-2">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                                Data tabel PostgreSQL tidak tersedia.
                            </div>
                        )}

                        <div className="text-[11px] text-gray-400 text-right pt-4 border-t mt-4">
                            Statistik diambil langsung dari sistem schema PostgreSQL
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

