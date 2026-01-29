import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Calendar, MapPin, Heart, MessageCircle, Share2, Trash2, Edit, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import api from '../lib/api';
import type { Activity, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatDateTime } from '../lib/utils';
import { toast } from 'sonner';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';


export default function ActivityDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch activity detail
    const { data: activity, isLoading } = useQuery({
        queryKey: ['activity', id],
        queryFn: async () => {
            const response = await api.get(`/activities/${id}`);
            return response.data as Activity;
        },
        enabled: !!id,
    });

    // Fetch interactions (likes & comments)
    const { data: interactions } = useQuery({
        queryKey: ['interactions', 'activity', id],
        queryFn: async () => {
            const response = await api.get(`/interactions/activity/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    // Fetch other activities
    const { data: otherActivities } = useQuery({
        queryKey: ['activities', 'others', id],
        queryFn: async () => {
            const response = await api.get('/activities');
            const all = response.data as Activity[];
            return all.filter(a => a.id !== id).slice(0, 5);
        },
        enabled: !!id,
    });

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            await api.post('/interactions/like', {
                activityId: id,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interactions', 'activity', id] });
            toast.success(interactions?.isLiked ? 'Like dihapus' : 'Activity disukai!');
        },
        onError: () => {
            toast.error('Gagal menyukai activity');
        },
    });

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            await api.post('/interactions/comment', {
                activityId: id,
                content,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interactions', 'activity', id] });
            setCommentText('');
            toast.success('Komentar ditambahkan!');
        },
        onError: () => {
            toast.error('Gagal menambahkan komentar');
        },
    });

    // Delete comment mutation
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: string) => {
            await api.delete(`/interactions/comment/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interactions', 'activity', id] });
            toast.success('Komentar dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus komentar');
        },
    });

    // Delete activity mutation
    const deleteActivityMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/activities/${id}`);
        },
        onSuccess: () => {
            toast.success('Activity berhasil dihapus');
            navigate('/activities');
        },
        onError: () => {
            toast.error('Gagal menghapus activity');
        },
    });

    const handleLike = () => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu');
            navigate('/login');
            return;
        }
        likeMutation.mutate();
    };

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Silakan login terlebih dahulu');
            navigate('/login');
            return;
        }
        if (!commentText.trim()) return;
        commentMutation.mutate(commentText);
    };

    const handleDeleteActivity = () => {
        setShowDeleteDialog(true);
    };

    const confirmDeleteActivity = () => {
        deleteActivityMutation.mutate();
        setShowDeleteDialog(false);
    };

    const handleShare = async () => {
        if (!activity) return;
        const shareData = {
            title: activity.title,
            text: `Lihat aktivitas ${activity.title} di Yurucamp!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link berhasil disalin!');
            } catch (err) {
                toast.error('Gagal menyalin link');
            }
        }
    };

    const handleDownload = async (e: React.MouseEvent, imageUrl: string) => {
        e.stopPropagation();
        try {
            toast.loading('Mengunduh foto...');
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = imageUrl.split('/').pop() || 'download.jpg';
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('Foto berhasil diunduh');
        } catch (error) {
            console.error('Download failed:', error);
            toast.dismiss();
            toast.error('Gagal mengunduh foto');
        }
    };

    // Combine cover + additional images for lightbox
    const allImages = activity ? [
        activity.imageUrl,
        ...(activity.additionalImages || [])
    ].filter(Boolean) as string[] : [];

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const goToPrev = useCallback(() => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
        }
    }, [lightboxIndex]);

    const goToNext = useCallback(() => {
        if (lightboxIndex !== null && lightboxIndex < allImages.length - 1) {
            setLightboxIndex(lightboxIndex + 1);
        }
    }, [lightboxIndex, allImages.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, goToPrev, goToNext]);

    // Touch swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToNext();
            else goToPrev();
        }
        setTouchStart(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Activity tidak ditemukan</h2>
                    <Button asChild>
                        <Link to="/activities">Kembali ke Activities</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = user?.id === activity.userId;

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <Navbar />
            <main className="flex-1 pb-24 md:pb-12">
                <div className="container mx-auto px-4 pt-24 md:pt-32">
                    {/* Hero Image */}
                    <div className="relative h-[45vh] md:h-[60vh] w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                        {activity.imageUrl ? (
                            <img
                                src={activity.imageUrl}
                                alt={activity.title}
                                className="w-full h-full object-cover opacity-90"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                                <span className="text-4xl font-bold opacity-30">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                        <div className="absolute top-6 left-6 z-20">
                            <Button variant="outline" size="icon" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md" asChild>
                                <Link to="/activities">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg border-none transition-all hover:scale-105"
                                onClick={handleShare}
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                            {isOwner && (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg border-none transition-all hover:scale-105"
                                        asChild
                                    >
                                        <Link to={`/a/${activity.id}/edit`}>
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="rounded-full shadow-lg"
                                        onClick={handleDeleteActivity}
                                        disabled={deleteActivityMutation.isPending}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-white/90 mb-3 md:mb-4 text-sm md:text-base font-medium">
                                    {activity.category && (
                                        <span className="bg-primary/90 backdrop-blur-sm px-3 md:px-4 py-1.5 rounded-full text-white text-[10px] md:text-sm font-bold uppercase tracking-wider shadow-lg">
                                            {typeof activity.category === 'object' ? activity.category.name : activity.category}
                                        </span>
                                    )}
                                    {activity.date && (
                                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/10 text-xs md:text-base">
                                            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
                                            {formatDate(activity.date)}
                                        </span>
                                    )}
                                    {activity.location && (
                                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/10 text-xs md:text-base">
                                            <MapPin className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
                                            {activity.location}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 drop-shadow-xl leading-tight tracking-tight">
                                    {activity.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 mt-8 relative z-30">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-8">
                            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white ring-1 ring-black/5">
                                <CardContent className="p-5 md:p-10 space-y-6">
                                    <div className="prose md:prose-lg prose-orange max-w-none text-gray-600 leading-relaxed">
                                        <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                            {activity.description || "Tidak ada deskripsi."}
                                        </ReactMarkdown>
                                    </div>
                                </CardContent>
                                <div className="px-6 md:px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`gap-2 rounded-full transition-all duration-300 group ${interactions?.isLiked ? 'text-red-600 bg-red-50 border-red-200' : 'hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                                                }`}
                                            onClick={handleLike}
                                            disabled={likeMutation.isPending}
                                        >
                                            <Heart className={`h-5 w-5 group-hover:scale-110 transition-transform ${interactions?.isLiked ? 'fill-current' : ''}`} />
                                            <span className="font-medium">{interactions?.likeCount || 0}</span>
                                        </Button>
                                        <Button variant="outline" size="sm" className="hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 gap-2 rounded-full transition-all duration-300 group" asChild>
                                            <a href="#comments">
                                                <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                                <span className="font-medium">Komentar</span>
                                            </a>
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-full"
                                        onClick={handleShare}
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Bagikan
                                    </Button>
                                </div>
                            </Card>

                            {/* Gallery - All Photos including Cover */}
                            {allImages.length > 0 && (
                                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-2xl font-bold">Galeri Foto ({allImages.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {allImages.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                                                    onClick={() => openLightbox(idx)}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={idx === 0 ? 'Cover' : `Gallery ${idx}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    {idx === 0 && (
                                                        <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            Cover
                                                        </span>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">Perbesar</span>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 hover:bg-white shadow-sm h-8 w-8"
                                                            onClick={(e) => handleDownload(e, img)}
                                                        >
                                                            <Download className="h-4 w-4 text-gray-700" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Comments Section */}
                            <Card id="comments" className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                                <CardHeader className="p-6 border-b">
                                    <CardTitle className="text-2xl font-bold">
                                        Komentar ({interactions?.comments?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Comment Form */}
                                    {user ? (
                                        <form onSubmit={handleComment} className="space-y-4">
                                            <Textarea
                                                placeholder="Tulis komentar..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={!commentText.trim() || commentMutation.isPending}
                                                className="rounded-full"
                                            >
                                                {commentMutation.isPending ? 'Mengirim...' : 'Kirim Komentar'}
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                                            <p className="text-gray-600 mb-4">Silakan login untuk berkomentar</p>
                                            <Button asChild>
                                                <Link to="/login">Login</Link>
                                            </Button>
                                        </div>
                                    )}

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {interactions?.comments && interactions.comments.length > 0 ? (
                                            interactions.comments.map((comment: Comment) => (
                                                <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                                    <a href={`/u/${comment.userId}`}>
                                                        <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all">
                                                            <AvatarImage src={comment.user?.avatarUrl} />
                                                            <AvatarFallback className="bg-primary text-white">
                                                                {comment.user?.fullName?.[0] || 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </a>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <a href={`/u/${comment.userId}`} className="font-bold text-gray-900 hover:text-orange-500 transition-colors">
                                                                {comment.user?.fullName || 'Pengguna'}
                                                            </a>
                                                            {user?.id === comment.userId && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mb-2">
                                                            {formatDateTime(comment.createdAt)}
                                                        </p>
                                                        <p className="text-gray-700">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                <p>Belum ada komentar</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Author Card */}
                            {activity.user && (
                                <Card className="border-none shadow-lg bg-white rounded-3xl p-6 ring-1 ring-black/5">
                                    <CardHeader className="p-0 mb-4">
                                        <CardTitle className="text-lg font-bold">Dibuat Oleh</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <a href={`/u/${activity.user.id}`} className="flex items-center gap-4 hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors">
                                            <div className="relative">
                                                <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                                                    <AvatarImage src={activity.user.avatarUrl} />
                                                    <AvatarFallback className="bg-primary text-white text-xl font-bold">
                                                        {activity.user.fullName?.[0] || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {activity.user.level && (
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/80 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
                                                        {activity.user.level}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{activity.user.fullName || 'Pengguna'}</h4>
                                                {activity.user.levelName && (
                                                    <p className="text-sm text-primary font-medium">{activity.user.levelName}</p>
                                                )}
                                                {activity.user.exp !== undefined && (
                                                    <p className="text-xs text-gray-400">{activity.user.exp} EXP</p>
                                                )}
                                            </div>
                                        </a>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="border-none shadow-lg bg-white rounded-3xl p-6 ring-1 ring-black/5">
                                <CardHeader className="p-0 mb-6 border-b border-gray-100 pb-4">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Aktivitas Lainnya
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    {otherActivities && otherActivities.length > 0 ? (
                                        otherActivities.map((item) => (
                                            <Link to={`/a/${item.id}`} key={item.id} className="flex gap-4 group p-2 hover:bg-gray-50 rounded-xl transition-all duration-300">
                                                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                                    <img
                                                        src={item.imageUrl || "/placeholder.jpg"}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 py-1">
                                                    <h4 className="font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                                                        {item.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {item.date ? formatDate(item.date) : "-"}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <MapPin className="h-3 w-3 text-red-300" />
                                                        <span className="truncate max-w-[120px]">{item.location || "Lokasi"}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-muted-foreground italic">Belum ada aktivitas lain.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Delete Confirmation Modal */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Aktivitas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus aktivitas ini? Semua foto yang terkait juga akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteActivity}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleteActivityMutation.isPending}
                        >
                            {deleteActivityMutation.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
                <DialogContent
                    aria-describedby={undefined}
                    showCloseButton={false}
                    className="max-w-[95vw] md:max-w-4xl p-0 bg-black/95 border-none shadow-2xl overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <DialogTitle className="sr-only">Galeri Foto</DialogTitle>
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                        {lightboxIndex !== null && allImages[lightboxIndex] && (
                            <img
                                src={allImages[lightboxIndex]}
                                alt={`Photo ${lightboxIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        )}

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full z-50"
                            onClick={closeLightbox}
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {/* Download Button */}
                        {lightboxIndex !== null && allImages[lightboxIndex] && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 left-4 text-white bg-black/50 hover:bg-black/70 rounded-full z-50"
                                onClick={(e) => handleDownload(e, allImages[lightboxIndex])}
                            >
                                <Download className="h-5 w-5" />
                            </Button>
                        )}

                        {/* Previous Button */}
                        {lightboxIndex !== null && lightboxIndex > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12"
                                onClick={goToPrev}
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </Button>
                        )}

                        {/* Next Button */}
                        {lightboxIndex !== null && lightboxIndex < allImages.length - 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12"
                                onClick={goToNext}
                            >
                                <ChevronRight className="h-8 w-8" />
                            </Button>
                        )}

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
                            {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {allImages.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    );
}
