
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Calendar, MapPin, Edit, Ticket, Plus, Mountain, LogOut, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import type { User, Activity, Event } from '../../types';
import { EditEventModal } from '../events/EditEventModal';
import { DeleteEventDialog } from '../events/DeleteEventDialog';

interface DashboardViewProps {
    profile: User | null;
    activities: Activity[];
    joinedEvents: Event[];
    createdEvents: Event[];
}

export function DashboardView({ profile, activities, joinedEvents, createdEvents }: DashboardViewProps) {
    const [activeTab, setActiveTab] = useState("activities");
    const { logout } = useAuth();

    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                        <AvatarImage src={profile?.avatarUrl} />
                        <AvatarFallback>{profile?.fullName?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <Button size="icon" className="absolute bottom-0 right-0 rounded-full shadow-md h-10 w-10 border-2 border-white" asChild>
                        <Link to="/dashboard/pengaturan">
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-black text-gray-800">{profile?.fullName ?? 'User'}</h1>
                    <p className="text-gray-500 font-medium">{profile?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{profile?.levelName || 'Camper'}</span>
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Level {profile?.level || 1}</span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Member sejak {new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button variant="outline" className="rounded-full border-2 gap-2" asChild>
                        <Link to="/dashboard/pengaturan">
                            <Edit className="h-4 w-4" />
                            Edit Profil
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        className="rounded-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => logout()}
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { icon: Mountain, label: "Aktifitas", count: activities.length, color: "text-orange-500", bg: "bg-orange-50" },
                    { icon: Ticket, label: "Acara Diikuti", count: joinedEvents.length, color: "text-blue-500", bg: "bg-blue-50" },
                    { icon: Calendar, label: "Acara Dibuat", count: createdEvents.length, color: "text-green-500", bg: "bg-green-50" },
                ].map((item, i) => (
                    <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white">
                        <CardContent className="p-6 flex flex-col items-center justify-center gap-2 text-center">
                            <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} mb-2`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">{item.count}</h3>
                            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs Section */}
            <div className="space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Button
                        onClick={() => setActiveTab("activities")}
                        variant={activeTab === "activities" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "activities" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Aktifitas Saya
                    </Button>
                    <Button
                        onClick={() => setActiveTab("joined-events")}
                        variant={activeTab === "joined-events" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "joined-events" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Acara Diikuti
                    </Button>
                    <Button
                        onClick={() => setActiveTab("events")}
                        variant={activeTab === "events" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "events" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Acara Saya (Organizer)
                    </Button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* Activities Tab */}
                    {activeTab === "activities" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Daftar Aktifitas</h2>
                                <Button className="rounded-full gap-2" asChild>
                                    <Link to="/dashboard/add-activity">
                                        <Plus className="h-4 w-4" /> Tambah Aktifitas
                                    </Link>
                                </Button>
                            </div>

                            {activities.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Mountain className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada Aktifitas</h3>
                                    <p className="text-gray-500 mb-6">Bagikan pengalaman seru campingmu</p>
                                    <Button variant="outline" className="rounded-full" asChild>
                                        <Link to="/dashboard/add-activity">Buat Aktifitas Baru</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activities.map((activity) => (
                                        <Card key={activity.id} className="group overflow-hidden bg-white hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border-2 border-transparent hover:border-orange-200 shadow-md hover:shadow-xl rounded-3xl">
                                            <div className="relative aspect-video bg-orange-50 overflow-hidden m-2 rounded-2xl">
                                                {activity.imageUrl ? (
                                                    <img
                                                        src={activity.imageUrl}
                                                        alt={activity.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-orange-200">
                                                        <Mountain className="h-12 w-12" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                                    <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate max-w-[200px]">{activity.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <CardContent className="p-5 flex-1 flex flex-col">
                                                <div className="flex-1 mb-4">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                                                        {activity.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                                    <Button variant="outline" size="sm" className="flex-1 rounded-full text-xs font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" asChild>
                                                        <Link to={`/activities/${activity.id}`}>Lihat</Link>
                                                    </Button>
                                                    <Button size="sm" className="flex-1 rounded-full text-xs font-bold gap-1 bg-gray-900 hover:bg-orange-600 transition-colors" asChild>
                                                        <Link to={`/dashboard/edit-activity/${activity.id}`}>
                                                            <Edit className="h-3 w-3" /> Edit
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Joined Events Tab */}
                    {activeTab === "joined-events" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Acara yang Diikuti</h2>
                                <Button className="rounded-full gap-2" asChild>
                                    <Link to="/events">
                                        <Plus className="h-4 w-4" /> Cari Acara
                                    </Link>
                                </Button>
                            </div>

                            {joinedEvents.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Ticket className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">Belum mengikuti Acara</h3>
                                    <p className="text-gray-500 mb-6">Cari acara camping seru dan bergabunglah!</p>
                                    <Button variant="outline" className="rounded-full" asChild>
                                        <Link to="/events">Jelajahi Acara</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {joinedEvents.map((event) => (
                                        <Card key={event.id} className="group overflow-hidden bg-white hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border-2 border-transparent hover:border-blue-200 shadow-md hover:shadow-xl rounded-3xl">
                                            <div className="relative aspect-video bg-blue-50 overflow-hidden m-2 rounded-2xl">
                                                {event.imageUrl ? (
                                                    <img
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-blue-200">
                                                        <Ticket className="h-12 w-12" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                                                <div className="absolute top-3 right-3">
                                                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm">
                                                        Joined
                                                    </Badge>
                                                </div>
                                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                                    <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate max-w-[200px]">{event.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <CardContent className="p-5 flex-1 flex flex-col">
                                                <div className="flex-1 mb-4">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(event.dateStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                                    <Button variant="outline" size="sm" className="flex-1 rounded-full text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" asChild>
                                                        <Link to={`/events/${event.id}`}>Lihat Detail</Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Organizer Events Tab */}
                    {activeTab === "events" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Acara Saya (Organizer)</h2>
                                <Button className="rounded-full gap-2" asChild>
                                    <Link to="/dashboard/add-event">
                                        <Plus className="h-4 w-4" /> Buat Acara
                                    </Link>
                                </Button>
                            </div>

                            {createdEvents.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Ticket className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada Acara yang Dibuat</h3>
                                    <p className="text-gray-500 mb-6">Kamu belum membuat acara apapun.</p>
                                    <Button variant="outline" className="rounded-full" asChild>
                                        <Link to="/dashboard/add-event">Buat Acara Baru</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {createdEvents.map((event) => (
                                        <Card key={event.id} className="group overflow-hidden bg-white hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border-2 border-transparent hover:border-green-200 shadow-md hover:shadow-xl rounded-3xl">
                                            <div className="relative aspect-video bg-green-50 overflow-hidden m-2 rounded-2xl">
                                                {event.imageUrl ? (
                                                    <img
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-green-200">
                                                        <Ticket className="h-12 w-12" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                                                <div className="absolute top-3 right-3">
                                                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm">
                                                        Organizer
                                                    </Badge>
                                                </div>
                                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                                    <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate max-w-[200px]">{event.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <CardContent className="p-5 flex-1 flex flex-col">
                                                <div className="flex-1 mb-4">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-green-600 transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(event.dateStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                                    <Button variant="outline" size="sm" className="flex-1 rounded-full text-xs font-bold hover:bg-green-50 hover:text-green-600 hover:border-green-200" asChild>
                                                        <Link to={`/events/${event.id}`}>Lihat</Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="rounded-full text-xs font-bold gap-1 hover:bg-green-50 hover:text-green-600"
                                                        onClick={() => setEditingEvent(event)}
                                                    >
                                                        <Edit className="h-3 w-3" /> Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="rounded-full text-xs font-bold gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                        onClick={() => setDeletingEvent(event)}
                                                    >
                                                        <Trash2 className="h-3 w-3" /> Hapus
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <EditEventModal
                open={!!editingEvent}
                onOpenChange={(open) => !open && setEditingEvent(null)}
                event={editingEvent}
            />
            <DeleteEventDialog
                open={!!deletingEvent}
                onOpenChange={(open) => !open && setDeletingEvent(null)}
                event={deletingEvent}
            />
        </div>
    );
}
