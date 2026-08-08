import { useEffect, useMemo, useState } from "react";

import { TVBackground, TVScreenFooter, TVScreenHeader } from "@/components/tv/TVChrome";
import {
  EventsSection,
  MemesSection,
  PollUsersSection,
  SongsSection,
  TVDataNotice,
  TVModulePlaceholder,
  TVModuleUnavailable,
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
import { useResilientTVQuery } from "@/hooks/use-resilient-tv-query";

interface PollStatistics {
  leaderboard: LeaderboardEntry[];
}

const SECTION_DURATION = 15_000;
const SECTION_COUNT = 4;

const TVScreen = () => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const songsQuery = useResilientTVQuery<ApprovedSong[]>("songs", getApprovedSongs, 30_000);
  const memesQuery = useResilientTVQuery<Meme[]>("memes", getMemes, 30_000);
  const pollQuery = useResilientTVQuery<PollStatistics>("polls", getPollStatistics, 30_000);
  const eventsQuery = useResilientTVQuery<TVEvent[]>("events", getEvents, 60_000);

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

  const sections = [
    songsQuery.data === undefined
      ? songsQuery.isPending ? <TVModulePlaceholder key="songs" title="Зареждане на топ песните" /> : <TVModuleUnavailable key="songs" title="Топ песни" />
      : <div key="songs" className="relative"><SongsSection songs={topSongs} />{songsQuery.isRefetchError && <TVDataNotice>Показваме последно запазените песни</TVDataNotice>}</div>,
    memesQuery.data === undefined
      ? memesQuery.isPending ? <TVModulePlaceholder key="memes" title="Зареждане на топ меметата" /> : <TVModuleUnavailable key="memes" title="Топ мемета" />
      : <div key="memes" className="relative"><MemesSection memes={topMemes} />{memesQuery.isRefetchError && <TVDataNotice>Показваме последно запазените мемета</TVDataNotice>}</div>,
    pollQuery.data === undefined
      ? pollQuery.isPending ? <TVModulePlaceholder key="polls" title="Зареждане на класацията" /> : <TVModuleUnavailable key="polls" title="Класация на анкетите" />
      : <div key="polls" className="relative"><PollUsersSection users={topPollUsers} />{pollQuery.isRefetchError && <TVDataNotice>Показваме последно запазената класация</TVDataNotice>}</div>,
    eventsQuery.data === undefined
      ? eventsQuery.isPending ? <TVModulePlaceholder key="events" title="Зареждане на събитията" /> : <TVModuleUnavailable key="events" title="Предстоящи събития" />
      : <div key="events" className="relative"><EventsSection events={upcomingEvents} />{eventsQuery.isRefetchError && <TVDataNotice>Показваме последно запазените събития</TVDataNotice>}</div>,
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
