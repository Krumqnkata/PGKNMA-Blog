import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TVBackground, TVScreenFooter, TVScreenHeader } from "@/components/tv/TVChrome";
import {
  EventsSection,
  MemesSection,
  PollUsersSection,
  SongsSection,
} from "@/components/tv/TVSections";
import type {
  ApprovedSong,
  LeaderboardEntry,
  Meme,
  TVEvent,
} from "@/components/tv/TVSections";
import {
  getApprovedSongs,
  getEvents,
  getMemes,
  getPollStatistics,
} from "@/lib/api";
import { ContentSkeleton } from "@/components/query/QueryStates";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PollStatistics {
  leaderboard: LeaderboardEntry[];
}

const SECTION_DURATION = 15_000;
const SECTION_COUNT = 4;

const TVScreen = () => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const songsQuery = useQuery<ApprovedSong[], Error>({ queryKey: ["approvedSongs"], queryFn: getApprovedSongs, refetchInterval: 30_000 });
  const memesQuery = useQuery<Meme[], Error>({ queryKey: ["memes"], queryFn: getMemes, refetchInterval: 30_000 });
  const pollQuery = useQuery<PollStatistics, Error>({ queryKey: ["pollStatistics"], queryFn: getPollStatistics, refetchInterval: 30_000 });
  const eventsQuery = useQuery<TVEvent[], Error>({ queryKey: ["events"], queryFn: getEvents, refetchInterval: 60_000 });

  useEffect(() => {
    const interval = window.setInterval(
      () => setCurrentSectionIndex((current) => (current + 1) % SECTION_COUNT),
      SECTION_DURATION,
    );
    return () => window.clearInterval(interval);
  }, []);

  const topSongs = useMemo(
    () => [...(songsQuery.data ?? [])].filter((song) => song.status === "approved").sort((a, b) => b.votes - a.votes).slice(0, 3),
    [songsQuery.data],
  );
  const topMemes = useMemo(
    () => [...(memesQuery.data ?? [])].filter((meme) => meme.status === "approved").sort((a, b) => b.votes - a.votes).slice(0, 3),
    [memesQuery.data],
  );
  const topPollUsers = useMemo(
    () => [...(pollQuery.data?.leaderboard ?? [])].sort((a, b) => b.correct_answers - a.correct_answers).slice(0, 3),
    [pollQuery.data?.leaderboard],
  );
  const upcomingEvents = useMemo(
    () => [...(eventsQuery.data ?? [])].filter((event) => new Date(event.start_datetime).getTime() > Date.now()).sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()).slice(0, 3),
    [eventsQuery.data],
  );

  const isLoading = songsQuery.isLoading || memesQuery.isLoading || pollQuery.isLoading || eventsQuery.isLoading;
  const isError = songsQuery.isError || memesQuery.isError || pollQuery.isError || eventsQuery.isError;

  if (isLoading) {
    return <div className="min-h-screen bg-gray-950 px-8 py-28 text-white"><ContentSkeleton count={3} label="Зареждане на данните за TV екрана" /></div>;
  }
  if (isError) {
    return <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 px-4 text-center text-white"><h1 className="text-2xl font-bold">TV данните не могат да бъдат заредени</h1><p className="text-gray-300">Проверете връзката и опитайте отново.</p><Button onClick={() => { void songsQuery.refetch(); void memesQuery.refetch(); void pollQuery.refetch(); void eventsQuery.refetch(); }}><RefreshCw className="h-4 w-4" />Опитай отново</Button></div>;
  }

  const sections = [
    <SongsSection key="songs" songs={topSongs} />,
    <MemesSection key="memes" memes={topMemes} />,
    <PollUsersSection key="polls" users={topPollUsers} />,
    <EventsSection key="events" events={upcomingEvents} />,
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      <TVBackground />
      <div className="relative z-10">
        <TVScreenHeader />
        {sections[currentSectionIndex]}
        <TVScreenFooter />
      </div>
    </div>
  );
};

export default TVScreen;
