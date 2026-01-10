import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ArrowLeft, Play, List, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// Season data with episodes
const seasonData: Record<string, {
    title: string;
    description: string;
    episodes: {
        id: number;
        title: string;
        duration: string;
        thumbnail: string;
        videoId: string;
    }[]
}> = {
    "season-1": {
        title: "Yuru Camp Season 1",
        description: "Nadeshiko, seorang siswi SMA yang pindah dari Shizuoka ke Yamanashi, memutuskan untuk melihat Gunung Fuji yang terkenal dan ada di uang kertas 1000 yen.",
        episodes: Array.from({ length: 12 }).map((_, i) => {
            const id = i + 1;
            const videoIds: Record<number, string> = {
                1: "toRv2b-iCs8",
                2: "XzE3LL7cbz4",
                3: "XUyFZeQ1mA0",
                5: "ZwFVNv1uGD0",
                6: "6Nzofu0TqKs",
                7: "H8kC21M1Sxk",
                8: "Dh8Xp2ReAYg",
                9: "mqprmP-l7GI",
                12: "aB_FSUGeQQw"
            };
            const videoId = videoIds[id] || "toRv2b-iCs8";
            return {
                id,
                title: `Episode ${id}`,
                duration: "24:00",
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                videoId: videoId
            };
        })
    },
    "season-2": {
        title: "Yuru Camp Season 2",
        description: "Para gadis kembali untuk petualangan berkemah lainnya! Bergabunglah dengan Nadeshiko, Rin, dan teman-teman saat mereka menjelajahi tempat perkemahan baru.",
        episodes: Array.from({ length: 13 }).map((_, i) => {
            const id = i + 1;
            const videoIds: Record<number, string> = {
                1: "jycSbANT_qw",
                2: "dSfXILVW7yk",
                3: "hgOsGfjF0Ys",
                4: "zdyTu-LS4tY",
                5: "E4ZNjUcvlEM",
                6: "vYH9nYc81_U",
                7: "QHrfjTR88Ok",
                8: "B7Hv8unabNw",
                9: "-8dJqdzT_XU",
                10: "MAPbaAK7XRs",
                11: "I0U7RhL4CiE",
                12: "93S5Hsa8-gc",
                13: "H2Pp8oAfXJY"
            };
            const videoId = videoIds[id] || "jycSbANT_qw";
            return {
                id,
                title: `Episode ${id}`,
                duration: "24:00",
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                videoId: videoId
            };
        })
    },
    "season-3": {
        title: "Yuru Camp Season 3",
        description: "Nadeshiko, Rin, dan yang lainnya kembali untuk petualangan berkemah lainnya! Seiring berjalannya tahun ajaran, tempat perkemahan baru dan makanan lezat menanti mereka.",
        episodes: Array.from({ length: 15 }).map((_, i) => {
            const id = i + 1;
            const videoIds: Record<number, string> = {
                1: "SGs03IvU7SQ",
                2: "7LuhosSqSwA",
                3: "oDN1ph1F5uA",
                4: "3VnyX9fCHQ8",
                5: "Z3Ab0-4C5og",
                6: "96MgAZblVtE",
                7: "New86X5qoyo",
                8: "cSjTrH1B4LA",
                9: "ScAD90TBtQk",
                10: "GR8iFH43vVI",
                11: "JsGCvzgLQSQ",
                12: "52lGGBLFokU",
                13: "yrI9orwLXIo",
                14: "AHnXBtTbMic",
                15: "ih_Io3cYLgU"
            };
            const videoId = videoIds[id] || "SGs03IvU7SQ";
            const isOVA = id > 12;
            return {
                id,
                title: isOVA ? `OVA ${id - 12}` : `Episode ${id}`,
                duration: "24:00",
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                videoId: videoId
            };
        })
    },
};

export default function WatchSeason() {
    const { seasonId } = useParams<{ seasonId: string }>();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentEpisodeId, setCurrentEpisodeId] = useState(1);
    const [commentText, setCommentText] = useState('');

    const season = seasonData[seasonId || "season-1"] || seasonData["season-1"];
    const currentEpisode = season.episodes.find(ep => ep.id === currentEpisodeId) || season.episodes[0];
    const videoId = currentEpisode.videoId;

    const handleEpisodeChange = (epId: number) => {
        setCurrentEpisodeId(epId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fetch interactions
    const { data: interactions } = useQuery({
        queryKey: ['interactions', 'video', videoId],
        queryFn: async () => {
            const response = await api.get(`/interactions/video/${videoId}`);
            return response.data;
        },
        enabled: !!videoId,
    });

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            await api.post('/interactions/like', { videoId });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['interactions', 'video', videoId] });
            toast.success(data.data.liked ? 'Video disukai!' : 'Like dihapus');
        },
        onError: () => {
            toast.error('Gagal memproses like');
        },
    });

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            await api.post('/interactions/comment', { videoId, content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interactions', 'video', videoId] });
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
            queryClient.invalidateQueries({ queryKey: ['interactions', 'video', videoId] });
            toast.success('Komentar dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus komentar');
        },
    });

    const handleLike = () => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu');
            // navigate('/login'); // Optional: redirect to login
            return;
        }
        likeMutation.mutate();
    };

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Silakan login terlebih dahulu');
            return;
        }
        if (!commentText.trim()) return;
        commentMutation.mutate(commentText);
    };

    const handleDeleteComment = (commentId: string) => {
        if (confirm('Hapus komentar ini?')) {
            deleteCommentMutation.mutate(commentId);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 pb-12 pt-20 lg:pt-32">
                <div className="container mx-auto px-0 md:px-4">
                    {/* Back Button */}
                    <div className="px-4 md:px-0 mb-4">
                        <Button variant="outline" size="sm" className="rounded-full" asChild>
                            <Link to="/watch">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
                        {/* Left Column: Player & Info */}
                        <div className="flex-1 min-w-0">
                            {/* Video Player */}
                            <div className="w-full aspect-video bg-black shadow-2xl overflow-hidden ring-1 ring-white/10 relative group z-40">
                                <iframe
                                    src={`https://www.youtube.com/embed/${currentEpisode.videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&playsinline=1&cc_load_policy=1&cc_lang_pref=id`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                />
                            </div>

                            {/* Episode Info */}
                            <div className="p-4 md:p-0 mt-2 lg:mt-6 space-y-4 md:space-y-6 bg-transparent relative z-30">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-orange-500 font-bold text-xs md:text-sm uppercase tracking-wider">
                                            {season.title} • Episode {currentEpisode.id}
                                        </div>

                                        {/* Like Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleLike}
                                            disabled={likeMutation.isPending}
                                            className={cn(
                                                "gap-2 rounded-full transition-all duration-300",
                                                interactions?.isLiked ? "text-red-500 bg-red-50" : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                                            )}
                                        >
                                            <Heart className={cn("h-5 w-5", interactions?.isLiked && "fill-current")} />
                                            <span className="font-medium">{interactions?.likeCount || 0}</span>
                                        </Button>
                                    </div>
                                    <h1 className="text-xl md:text-3xl font-black text-gray-800 mb-2 md:mb-4 leading-tight">
                                        {currentEpisode.title}
                                    </h1>
                                    <p className="text-gray-600 leading-relaxed text-sm md:text-lg">
                                        {season.description}
                                    </p>
                                </div>

                                {/* Comments Section */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5" />
                                        Komentar ({interactions?.comments?.length || 0})
                                    </h3>

                                    {/* Comment Input */}
                                    {user ? (
                                        <form onSubmit={handleComment} className="mb-6 flex gap-3">
                                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                                <AvatarImage src={user.avatarUrl} />
                                                <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 gap-2 flex flex-col items-end">
                                                <Textarea
                                                    placeholder="Tulis komentar..."
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    className="min-h-[80px] bg-white"
                                                />
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    className="rounded-full"
                                                    disabled={!commentText.trim() || commentMutation.isPending}
                                                >
                                                    Kirim
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="bg-gray-100 p-4 rounded-xl text-center mb-6">
                                            <p className="text-sm text-gray-500 mb-2">Login untuk berkomentar</p>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/login">Masuk</Link>
                                            </Button>
                                        </div>
                                    )}

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {interactions?.comments?.map((comment: any) => (
                                            <div key={comment.id} className="flex gap-3 text-sm">
                                                <Avatar className="h-8 w-8 mt-1">
                                                    <AvatarImage src={comment.user?.avatarUrl} />
                                                    <AvatarFallback>{comment.user?.fullName?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-gray-900">{comment.user?.fullName || 'User'}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>

                                                    {user?.id === comment.userId && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mt-1"
                                                        >
                                                            <Trash2 className="h-3 w-3" /> Hapus
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {(!interactions?.comments || interactions.comments.length === 0) && (
                                            <p className="text-center text-gray-400 italic py-4">Belum ada komentar.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Episode List */}
                        <div className="w-full lg:w-[400px] shrink-0 px-4 lg:px-0 mt-4 lg:mt-0">
                            <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 shadow-lg h-[400px] lg:h-[calc(100vh-140px)] flex flex-col lg:sticky lg:top-28">
                                <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="font-bold text-base md:text-lg flex items-center gap-2 text-gray-800">
                                        <List className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                                        Daftar Episode
                                    </h3>
                                    <span className="text-xs md:text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-500">
                                        {season.episodes.length} Episode
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {season.episodes.map((episode) => {
                                        const isActive = episode.id === currentEpisodeId;
                                        return (
                                            <div
                                                key={episode.id}
                                                onClick={() => handleEpisodeChange(episode.id)}
                                                className={cn(
                                                    "flex gap-3 p-2 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 group",
                                                    isActive ? "bg-orange-500/10 border border-orange-500/20" : "hover:bg-gray-50 border border-transparent"
                                                )}
                                            >
                                                <div className="relative w-24 md:w-32 aspect-video bg-gray-100 rounded-md md:rounded-lg overflow-hidden shrink-0 shadow-sm">
                                                    <img
                                                        src={episode.thumbnail}
                                                        alt={episode.title}
                                                        className={cn(
                                                            "w-full h-full object-cover transition-opacity",
                                                            isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                                                        )}
                                                    />
                                                    {isActive && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-orange-500 text-white flex items-center justify-center animate-pulse">
                                                                <Play className="h-3 w-3 md:h-4 md:w-4 fill-current ml-0.5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded font-mono backdrop-blur-sm">
                                                        {episode.duration}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <h4 className={cn(
                                                        "font-bold text-xs md:text-sm line-clamp-2 mb-1 transition-colors",
                                                        isActive ? "text-orange-500" : "text-gray-700 group-hover:text-orange-500"
                                                    )}>
                                                        {episode.id}. {episode.title}
                                                    </h4>
                                                    <p className="text-gray-400 text-[10px] md:text-xs">
                                                        20 Nov 2024
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
