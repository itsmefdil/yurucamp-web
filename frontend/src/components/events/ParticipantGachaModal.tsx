import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Dices, Trophy, PartyPopper, RefreshCw } from "lucide-react";
import confetti from 'canvas-confetti';

interface Participant {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    seatCount?: number;
}

interface ParticipantGachaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    participants: Participant[];
    organizerId?: string;
}

export function ParticipantGachaModal({ open, onOpenChange, participants, organizerId }: ParticipantGachaModalProps) {
    const [winner, setWinner] = useState<Participant | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [displayParticipant, setDisplayParticipant] = useState<Participant | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Use all participants including the organizer as requested
    const eligibleParticipants = participants;

    const startGacha = () => {
        if (eligibleParticipants.length === 0) return;

        setIsRolling(true);
        setWinner(null);

        // Fast rolling animation
        let counter = 0;
        const speed = 50; // ms

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
            setDisplayParticipant(eligibleParticipants[randomIndex]);
            counter++;
        }, speed);

        // Stop after 3 seconds
        setTimeout(() => {
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Pick definitive winner
            const finalIndex = Math.floor(Math.random() * eligibleParticipants.length);
            const finalWinner = eligibleParticipants[finalIndex];

            setDisplayParticipant(finalWinner);
            setWinner(finalWinner);
            setIsRolling(false);

            // Confetti effect
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f97316', '#fbbf24', '#ffffff'] // Orange and Yellow theme
            });

        }, 3000);
    };

    const reset = () => {
        setWinner(null);
        setDisplayParticipant(null);
    };

    // Cleanup interval on unmount or close
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (!open) {
            reset();
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRolling(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={(val) => !isRolling && onOpenChange(val)}>
            <DialogContent className="sm:max-w-md bg-[#FDFBF7] border-0 shadow-2xl">
                <DialogHeader className="text-center items-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-orange-50">
                        <Dices className="w-8 h-8 text-orange-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900">
                        Pemenang Beruntung
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                        Acak pemenang dari {eligibleParticipants.length} peserta
                    </DialogDescription>
                </DialogHeader>

                <div className="py-8 flex flex-col items-center justify-center min-h-[200px]">
                    {eligibleParticipants.length === 0 ? (
                        <p className="text-gray-500 font-medium">Tidak ada peserta yang cukup :(</p>
                    ) : (
                        displayParticipant ? (
                            <div className={`flex flex-col items-center transition-all duration-300 ${winner ? 'scale-110' : 'scale-100'}`}>
                                <div className="relative mb-6">
                                    <Avatar className={`w-32 h-32 border-4 ${winner ? 'border-orange-500 ring-4 ring-orange-200' : 'border-gray-200'}`}>
                                        <AvatarImage src={displayParticipant.avatarUrl} className="object-cover" />
                                        <AvatarFallback className="text-4xl bg-orange-100 text-orange-600 font-bold">
                                            {displayParticipant.fullName?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {winner && (
                                        <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-2 rounded-full shadow-lg animate-bounce">
                                            <Trophy className="w-6 h-6 fill-current" />
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-2xl font-bold text-center px-4 ${winner ? 'text-orange-600' : 'text-gray-800'}`}>
                                    {displayParticipant.fullName}
                                </h3>

                                {winner && (
                                    <div className="mt-2 inline-flex items-center gap-2 bg-orange-100 px-4 py-1.5 rounded-full text-orange-700 font-bold text-sm animate-in fade-in slide-in-from-bottom-2">
                                        <PartyPopper className="w-4 h-4" />
                                        Selamat!
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <div className="text-8xl mb-4 opacity-20 font-black">?</div>
                                <p>Tekan tombol untuk mengacak</p>
                            </div>
                        )
                    )}
                </div>

                <div className="flex gap-3">
                    <Button
                        size="lg"
                        className={`w-full font-bold h-12 text-lg rounded-xl shadow-lg transition-all ${isRolling
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/30'
                            }`}
                        onClick={startGacha}
                        disabled={isRolling || eligibleParticipants.length === 0}
                    >
                        {isRolling ? 'Mengacak...' : (winner ? 'Acak Lagi' : 'Mulai Gacha')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
