import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApprovedSongs, voteForSong, ApprovedSong } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsUp, Loader2, ServerCrash, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SongMediaDisplay from './SongMediaDisplay';

export function SongVoting() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const { data: songs, isLoading, isError, error } = useQuery({
        queryKey: ['approvedSongs'],
        queryFn: getApprovedSongs,
    });

    const voteMutation = useMutation({
        mutationFn: (songId: number) => voteForSong(songId),
        onSuccess: (updatedSong) => {
            queryClient.setQueryData(['approvedSongs'], (oldSongs: ApprovedSong[] | undefined) => {
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
        onError: (error: unknown) => {
            console.error("Грешка при гласуване за песен:", error);
            const errorMessage = error instanceof Error ? error.message : "Възникна грешка. Моля, опитайте отново.";
            toast({
                title: "Грешка при гласуване",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const transliterate = (text: string) => {
        const cyrillicToLatin: { [key: string]: string } = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y', 'Ю': 'Yu', 'Я': 'Ya'
        };
        return text.split('').map(char => cyrillicToLatin[char] || char).join('');
    };

    const exportToPDF = async () => {
        setIsExporting(true);
        try {
        const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable'),
        ]);
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Predlozheniya za zvunets - PGKNMA", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generirano na: ${new Date().toLocaleDateString()}`, 14, 28);

        autoTable(doc, {
            head: [["Pesen", "Predlozhena ot", "Glasove", "Data", "Link"]],
            body: songs ? songs.map(song => [
                transliterate(song.title),
                transliterate(song.user_username || ""),
                song.votes,
                new Date(song.submitted_at).toLocaleDateString(),
                "Link Pesen"
            ]) : [],
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [13, 148, 136] },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 4) {
                    const song = songs![data.row.index];
                    doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: song.link });
                }
            },
        });

        doc.save(`predlozheniya-zvunec.pdf`);
        } catch (error) {
            toast({
                title: "Грешка при експортиране",
                description: error instanceof Error ? error.message : "PDF файлът не можа да бъде създаден.",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

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

    const safeSongs = Array.isArray(songs) ? songs : [];

    if (safeSongs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Все още няма одобрени песни за гласуване.</p>
            </div>
        );
    }

    return (
        <section className="container mx-auto px-4 py-12 relative">
            <div className="absolute right-4 top-4 md:right-8 md:top-8">
                <Button 
                    onClick={() => void exportToPDF()}
                    disabled={isExporting}
                    variant="ghost" 
                    size="icon" 
                    title="Експортирай в PDF"
                    aria-label="Експортирай предложенията в PDF"
                    className="text-muted-foreground hover:text-primary transition-colors"
                >
                    {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                </Button>
            </div>

            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">Гласуване за песен на звънеца</h2>
                <p className="mt-3 text-lg text-muted-foreground">
                    Изберете коя от одобрените песни да звучи в училище.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {safeSongs.map((song) => (
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
