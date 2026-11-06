import { useQuery } from '@tanstack/react-query';
import { ImageUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import api from '../../lib/api';

interface UploadFailure {
    id: string;
    createdAt: string;
    stage: 'prepare' | 'upload';
    folder: string | null;
    fileCount: number;
    totalBytes: number | null;
    fileTypes: string | null;
    errorName: string | null;
    errorMessage: string | null;
    userAgent: string | null;
    connection: string | null;
    userName: string | null;
}

interface UploadLogSummary {
    days: number;
    success: number;
    failed: number;
    failedPrepare: number;
    failedUpload: number;
    recentFailures: UploadFailure[];
}

const DAYS = 7;

function describeDevice(userAgent: string | null): string {
    if (!userAgent) return 'Unknown';
    const os = /iPhone|iPad|iPod/i.test(userAgent) ? 'iOS'
        : /Android/i.test(userAgent) ? 'Android'
        : /Windows/i.test(userAgent) ? 'Windows'
        : /Mac OS X/i.test(userAgent) ? 'macOS'
        : /Linux/i.test(userAgent) ? 'Linux'
        : 'Other';
    const browser = /SamsungBrowser/i.test(userAgent) ? 'Samsung Internet'
        : /CriOS|Chrome/i.test(userAgent) ? 'Chrome'
        : /FxiOS|Firefox/i.test(userAgent) ? 'Firefox'
        : /Safari/i.test(userAgent) ? 'Safari'
        : 'Browser';
    return `${os} · ${browser}`;
}

const formatBytes = (bytes: number | null) =>
    bytes == null ? '-' : bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export default function UploadReliabilityCard() {
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['admin', 'upload-logs', DAYS],
        queryFn: async () => (await api.get<UploadLogSummary>(`/admin/upload-logs?days=${DAYS}`)).data,
    });

    const total = (data?.success ?? 0) + (data?.failed ?? 0);
    const successRate = total > 0 ? ((data!.success / total) * 100).toFixed(1) : null;
    const isWarning = successRate !== null && parseFloat(successRate) < 90;

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardHeader className="border-b flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <ImageUp className="w-5 h-5 text-orange-500" /> Keandalan Upload Gambar
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Hasil upload yang dilaporkan browser pengguna dalam {DAYS} hari terakhir.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5 text-xs">
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
                {isLoading ? (
                    <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ) : isError || !data ? (
                    <div className="text-center py-8 text-xs text-gray-400 flex flex-col items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        Data upload tidak tersedia.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className={`p-3 rounded-xl border ${isWarning ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-100'}`}>
                                <p className="text-[11px] font-medium text-gray-500">Tingkat Berhasil</p>
                                <p className={`text-xl font-bold ${isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                                    {successRate !== null ? `${successRate}%` : '-'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl border border-gray-100">
                                <p className="text-[11px] font-medium text-gray-500">Berhasil</p>
                                <p className="text-xl font-bold text-gray-800">{data.success}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-gray-100">
                                <p className="text-[11px] font-medium text-gray-500">Gagal saat proses</p>
                                <p className="text-xl font-bold text-gray-800">{data.failedPrepare}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-gray-100">
                                <p className="text-[11px] font-medium text-gray-500">Gagal saat upload</p>
                                <p className="text-xl font-bold text-gray-800">{data.failedUpload}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-2.5 pb-2 border-b">Kegagalan Terbaru</p>
                            {data.recentFailures.length === 0 ? (
                                <p className="text-xs text-gray-400 py-4 text-center">Tidak ada kegagalan upload. 🎉</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.recentFailures.map((f) => (
                                        <div key={f.id} className="text-xs p-3 rounded-xl border border-gray-100 space-y-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="font-semibold text-gray-800">
                                                    {f.userName || 'Pengguna'} · {describeDevice(f.userAgent)}
                                                </span>
                                                <span className="text-gray-400">
                                                    {new Date(f.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            <p className="text-red-600 break-words">{f.errorMessage || f.errorName || 'Unknown error'}</p>
                                            <p className="text-gray-400">
                                                {f.stage === 'prepare' ? 'Saat memproses' : 'Saat mengunggah'} · {f.folder || '-'} · {f.fileCount} file · {formatBytes(f.totalBytes)} · {f.fileTypes || '-'} · koneksi {f.connection || '-'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
