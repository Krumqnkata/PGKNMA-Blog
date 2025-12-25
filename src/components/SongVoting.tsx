import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApprovedSongs, voteForSong } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, Loader2, ServerCrash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import SongMediaDisplay from './SongMediaDisplay'; // Import the new component

export function SongVoting() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: songs, isLoading, isError, error } = useQuery({
        queryKey: ['approvedSongs'],
        queryFn: getApprovedSongs,
    });

    const voteMutation = useMutation({
        mutationFn: (songId: number) => voteForSong(songId),
        onSuccess: (updatedSong) => {
            queryClient.setQueryData(['approvedSongs'], (oldSongs: any[] | undefined) => {
                if (!oldSongs) return oldSongs;
                return oldSongs.map((song) =>
                    song.id === updatedSong.id ? updatedSong : song
                );
            });
            toast({
                title: "Успешен глас!",
                description: `Вие гласувахте за "${updatedSong.title}".`,
            });
        },
        onError: (error: any) => {
            console.error("Грешка при гласуване за песен:", error);
            toast({
                title: "Грешка при гласуване",
                description: error.message || "Възникна грешка. Моля, опитайте отново.",
                variant: "destructive",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center space-x-2 py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Зареждане на песните за гласуване...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center space-y-2 py-8 text-red-500">
                <ServerCrash className="h-8 w-8" />
                <span className="font-semibold">Грешка при зареждане</span>
                <p>{error?.message || "Не успяхме да заредим песните. Моля, опитайте по-късно."}</p>
            </div>
        );
    }

    if (!songs || songs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Все още няма одобрени песни за гласуване.</p>
            </div>
        );
    }

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">Гласуване за песен на звънеца</h2>
                <p className="mt-3 text-lg text-muted-foreground">
                    Изберете коя от одобрените песни да звучи в училище.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {songs.map((song) => (
                    <Card key={song.id} className="flex flex-col overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-lg">
                        <SongMediaDisplay link={song.link} title={song.title} />
                        
                        <div className="flex flex-1 flex-col p-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{song.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Предложена от: {song.user_username}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Времеви слот: {(() => {
                                        switch (song.slot) {
                                            case 'startClass': return 'Начало на час';
                                            case 'endClass': return 'Край на час';
                                            case 'beforeLunch': return 'Преди голямо междучасие';
                                            case 'afterLunch': return 'След голямо междучасие';
                                            case 'morning': return 'Сутрешен звънец';
                                            case 'special': return 'Специален повод';
                                            default: return song.slot;
                                        }
                                    })()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Изпратена на: {new Date(song.submitted_at).toLocaleDateString('bg-BG')}
                                </p>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ThumbsUp className="h-5 w-5 text-primary" />
                                    <span className="font-bold text-xl">{song.votes}</span>
                                </div>
                                <Button
                                    onClick={() => voteMutation.mutate(song.id)}
                                    disabled={!isAuthenticated || voteMutation.isPending || song.has_voted}
                                    title={!isAuthenticated ? "Трябва да сте вписани, за да гласувате" : (song.has_voted ? "Вече сте гласували за тази песен" : "Гласувай за тази песен")}
                                    variant={song.has_voted ? "secondary" : "default"}
                                    className="shrink-0"
                                >
                                    {song.has_voted ? "Гласувано" : "Гласувай"}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}