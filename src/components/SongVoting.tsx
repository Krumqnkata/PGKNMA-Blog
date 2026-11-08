import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApprovedSongs, voteForSong, ApprovedSong } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsUp, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SongMediaDisplay from './SongMediaDisplay';
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from '@/components/query/QueryStates';
import { Link } from 'react-router-dom';
import { publicProfilePath } from '@/lib/public-profile';
import { formatSiteDate } from '@/lib/date-time';

export function SongVoting() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const { data: songs, isLoading, isError, error, refetch } = useQuery({
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

    const exportToPDF = async () => {
        setIsExporting(true);
        try {
        const [{ default: jsPDF }, { default: autoTable }, { addSiteFont, PDF_FONT }] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable'),
            import('@/lib/pdf-fonts'),
        ]);
        const doc = new jsPDF();
        // The built-in PDF fonts have no Cyrillic, so the site's own font is embedded.
        await addSiteFont(doc);

        doc.setFont(PDF_FONT, "bold");
        doc.setFontSize(18);
        doc.text("Предложения за звънеца – ПГКНМА", 14, 20);
        doc.setFont(PDF_FONT, "normal");
        doc.setFontSize(10);
        doc.text(`Създаден на: ${formatSiteDate(new Date())}`, 14, 28);

        autoTable(doc, {
            head: [["Песен", "Предложена от", "Гласове", "Дата", "Линк"]],
            body: songs ? songs.map(song => [
                song.title,
                song.user_username || "изтрит потребител",
                song.votes,
                formatSiteDate(song.submitted_at),
                "Отвори"
            ]) : [],
            startY: 35,
            theme: 'striped',
            styles: { font: PDF_FONT },
            headStyles: { fillColor: [13, 148, 136], fontStyle: 'bold' },
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
            <ContentSkeleton count={3} label="Зареждане на песните за гласуване" />
        );
    }

    if (isError) {
        return (
            <QueryErrorState message={error?.message} onRetry={() => void refetch()} />
        );
    }

    const safeSongs = Array.isArray(songs) ? songs : [];

    if (safeSongs.length === 0) {
        return (
            <QueryEmptyState art="bell" title="Все още няма песни за гласуване" description="Одобрените предложения ще се появят тук." />
        );
    }

    return (
        <section id="approved-songs" className="container relative mx-auto scroll-mt-24 px-4 py-12">
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
                                    Предложена от: {song.user_username ? <Link className="font-medium hover:text-primary hover:underline" to={publicProfilePath(song.user_username)}>{song.user_username}</Link> : 'изтрит потребител'}
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
                                    Изпратена на: {formatSiteDate(song.submitted_at)}
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
