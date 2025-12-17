import { useQuery } from "@tanstack/react-query";
import { getPollStatistics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, Award, Users } from "lucide-react";

// A simple utility to format time since, as an example
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale';

const formatTimeAgo = (dateString: string) => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: bg });
    } catch (error) {
        return dateString;
    }
};


export const PollStatistics = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["pollStatistics"],
        queryFn: getPollStatistics,
    });

    if (isLoading) {
        return (
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Статистика</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-8 bg-muted rounded w-1/4"></div>
                        <div className="h-10 bg-muted rounded w-full"></div>
                        <div className="h-10 bg-muted rounded w-full"></div>
                        <div className="h-10 bg-muted rounded w-full"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="mt-8 bg-destructive/10 border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertCircle size={20} />
                        Грешка при зареждане на статистиката
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    const { leaderboard, recent_participants } = data || {};

    return (
        <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-500">
                        <Award size={22} />
                        Класация (Топ 10)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Потребител</TableHead>
                                <TableHead className="text-right">Верни отговори</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard && leaderboard.length > 0 ? (
                                leaderboard.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span>{user.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{user.correct_answers}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        Все още няма данни за класацията.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Recent Participants */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sky-500">
                        <Users size={22} />
                        Последни участвали
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Потребител</TableHead>
                                <TableHead className="text-right">Преди</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {recent_participants && recent_participants.length > 0 ? (
                                recent_participants.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                             <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span>{user.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{formatTimeAgo(user.last_answered)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">
                                        Никой не е участвал скоро.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
