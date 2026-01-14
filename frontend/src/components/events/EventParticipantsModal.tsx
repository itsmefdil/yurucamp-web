import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Badge } from "../../components/ui/badge";
import { User, Trophy } from "lucide-react";

interface Participant {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    level?: number;
    levelName?: string;
    exp?: number;
}

interface EventParticipantsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    participants: Participant[];
    title: string;
}

export function EventParticipantsModal({ open, onOpenChange, participants, title }: EventParticipantsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2 pr-8">
                        <UsersIcon className="w-5 h-5 text-orange-500" />
                        Peserta Event
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                            {participants.length} Orang
                        </Badge>
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                        {title}
                    </p>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4">
                    {participants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Belum ada peserta yang mendaftar.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {participants.map((participant) => (
                                <div key={participant.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border border-gray-200">
                                            <AvatarImage src={participant.avatarUrl} alt={participant.fullName} />
                                            <AvatarFallback>{participant.fullName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                                            Lv.{participant.level || 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{participant.fullName}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Trophy className="w-3 h-3 text-yellow-500" />
                                            <span>{participant.levelName || 'Camper Pemula'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
