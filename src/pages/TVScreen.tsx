import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Instagram, Clock, Calendar, MapPin, Users } from "lucide-react";
import { getApprovedSongs, getMemes, getPollStatistics, getEvents, RecentParticipant } from "../lib/api";
import { format, parseISO } from "date-fns";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface ApprovedSong {
    id: number;
    link: string;
    slot: string;
    note: string;
    title: string;
    status: string;
    submitted_at: string;
    user_username: string;
    votes: number;
    has_voted: boolean;
}

interface Meme {
    id: number;
    title: string;
    image_url: string;
    user_username: string;
    created_at: string;
    is_approved: boolean;
    votes: number;
    has_voted: boolean;
}

interface LeaderboardEntry {
    id: number;
    username: string;
    correct_answers: number;
}

interface PollStatistics {
  leaderboard: LeaderboardEntry[];
  recent_participants: RecentParticipant[];
}

interface Event {
    id: number;
    title: string;
    start_datetime: string;
    end_datetime: string | null;
    location: string;
    category: string;
    description: string;
    attendees_text: string;
    published: boolean;
    created_at: string;
}

const SECTION_DURATION = 15000;
const BACKGROUND_CHANGE_DURATION = 8000;

// Images from /public/Landscape folder (numbered 1.jpg to 57.jpg)
const TOTAL_LANDSCAPE_IMAGES = 50;
const landscapeImages = Array.from(
  { length: TOTAL_LANDSCAPE_IMAGES },
  (_, i) => `/Landscape/${i + 1}.jpg`
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const TVScreenHeader = () => (
  <div className="fixed top-0 left-0 right-0 z-50 flex items-center p-4 bg-gray-900/20 backdrop-blur-sm shadow-lg border-b border-gray-800 h-24">
    <div className="flex items-center w-full max-w-7xl mx-auto px-4">
      <img src="/logo-dark.png" alt="School Logo" className="h-16 w-auto mr-4 object-contain" />
      <div className="flex-grow">
        <h1 className="text-3xl font-bold text-blue-400 drop-shadow">TV Екран на ПГКНМА Блог</h1>
        <p className="text-lg text-gray-300">Най-популярното съдържание и резултати от анкетите</p>
      </div>
      <p className="text-lg text-blue-300">
        Линк към блога: <a href="https://pgknma.space" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">pgknma.space</a>
      </p>
    </div>
  </div>
);

const TVScreenFooter = ({ currentDay, formattedTime }: { currentDay: string; formattedTime: string }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/20 backdrop-blur-sm shadow-lg border-t border-gray-800 text-gray-400 text-sm h-16">
    <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-4">
        <p>&copy; {new Date().getFullYear()} ПГКНМА Блог - Всички права запазени</p>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{currentDay}, {formattedTime}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-gray-500">Последвайте ни:</span>
        <a
          href="https://www.instagram.com/pgknma.prof.minko.balkanski"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-pink-500 transition-colors"
          aria-label="Instagram"
        >
          <Instagram className="h-5 w-5" />
          <span className="text-xs">@pgknma.prof.minko.balkanski</span>
        </a>
        <a
          href="https://www.tiktok.com/@pgknma.proffbalkanski"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-white transition-colors"
          aria-label="TikTok"
        >
          <TikTokIcon className="h-5 w-5" />
          <span className="text-xs">@pgknma.proffbalkanski</span>
        </a>
      </div>
    </div>
  </div>
);

const TVScreen = () => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const daysOfWeek = ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"];
  const currentDay = daysOfWeek[currentTime.getDay()];
  const formattedTime = currentTime.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const { data: songs, isLoading: isLoadingSongs, isError: isErrorSongs } = useQuery<ApprovedSong[], Error>({
    queryKey: ['approvedSongs'],
    queryFn: getApprovedSongs,
    refetchInterval: 30000,
  });

  const { data: memes, isLoading: isLoadingMemes, isError: isErrorMemes } = useQuery<Meme[], Error>({
    queryKey: ['memes'],
    queryFn: getMemes,
    refetchInterval: 30000,
  });

  const { data: pollStats, isLoading: isLoadingPollStats, isError: isErrorPollStats } = useQuery<PollStatistics, Error>({
    queryKey: ['pollStatistics'],
    queryFn: getPollStatistics,
    refetchInterval: 30000,
  });

  const { data: events, isLoading: isLoadingEvents, isError: isErrorEvents } = useQuery<Event[], Error>({
    queryKey: ['events'],
    queryFn: getEvents,
    refetchInterval: 60000,
  });

  useEffect(() => {
    const totalSections = 4;
    const interval = setInterval(() => {
      setCurrentSectionIndex((prevIndex) => (prevIndex + 1) % totalSections);
    }, SECTION_DURATION);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prevIndex) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * landscapeImages.length);
        } while (newIndex === prevIndex && landscapeImages.length > 1);
        return newIndex;
      });
    }, BACKGROUND_CHANGE_DURATION);

    return () => clearInterval(interval);
  }, []);

  if (isLoadingSongs || isLoadingMemes || isLoadingPollStats || isLoadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="h-10 w-10 animate-spin" />
        <span className="ml-4 text-xl">Зареждане на данни за ТВ Екран...</span>
      </div>
    );
  }

  if (isErrorSongs || isErrorMemes || isErrorPollStats || isErrorEvents) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">
        <span className="text-xl">Възникна грешка при зареждане на данни за ТВ Екран.</span>
      </div>
    );
  }

  const topSongs = (Array.isArray(songs) ? songs : []).filter(song => song.status === 'approved').sort((a, b) => b.votes - a.votes).slice(0, 3);
  const topMemes = (Array.isArray(memes) ? memes : []).filter(meme => meme.is_approved).sort((a, b) => b.votes - a.votes).slice(0, 3);
  const topPollUsers = (Array.isArray(pollStats?.leaderboard) ? pollStats.leaderboard : []).sort((a, b) => b.correct_answers - a.correct_answers).slice(0, 3);
  const upcomingEvents = (Array.isArray(events) ? events : []).filter(event => new Date(event.start_datetime) > new Date()).sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()).slice(0, 3);

  const getRankEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Academic: "bg-blue-500 text-blue-100",
      Sports: "bg-green-500 text-green-100",
      Arts: "bg-purple-500 text-purple-100",
      Community: "bg-orange-500 text-orange-100",
      Holiday: "bg-red-500 text-red-100",
    };
    return colors[category] || "bg-gray-500 text-gray-100";
  };

  const renderSongs = () => (
    <div className="min-h-screen pt-24 pb-16 flex flex-col justify-center items-center text-white p-8">
      <h1 className="text-6xl font-extrabold mb-12 text-center text-blue-400 drop-shadow-lg">🎵 Топ Песни</h1>
      <div className="flex justify-center items-stretch gap-8 w-full max-w-7xl px-4">
        {topSongs.length > 0 ? (
          topSongs.map((song, index) => (
            <div
              key={song.id}
              className={`flex flex-col items-center text-center p-6 rounded-lg shadow-xl bg-gray-900/80 backdrop-blur-sm transition-all duration-500 ease-in-out flex-1 min-w-0 h-full justify-between
                ${index === 0 ? 'border-4 border-yellow-400 scale-105' : ''}
                ${index === 1 ? 'border-4 border-gray-300' : ''}
                ${index === 2 ? 'border-4 border-orange-400 scale-95' : ''}
              `}
            >
              <span className="text-6xl mb-4">{getRankEmoji(index)}</span>
              <span className="text-4xl font-bold mb-2 leading-tight">{song.title}</span>
              <span className="text-2xl text-gray-300 mb-4 leading-tight">({song.user_username})</span>
              <span className="text-3xl text-blue-300 mt-auto">{song.votes} гласа</span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-300 text-5xl">Все още няма одобрени песни.</p>
        )}
      </div>
      <div className="mt-8 text-center text-gray-300 text-2xl max-w-4xl">
        <span className="text-yellow-500">ℹ️</span> <span className="italic">За да видите песента и да направите предложение, моля влезте в блога на адрес: <a href="https://pgknma.space" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-200">pgknma.space</a></span>
      </div>
    </div>
  );

  const renderMemes = () => (
    <div className="min-h-screen pt-24 pb-16 flex flex-col justify-center items-center text-white p-8">
      <h1 className="text-6xl font-extrabold mb-12 text-center text-purple-400 drop-shadow-lg">😂 Топ Мемета</h1>
      <div className="flex justify-center items-stretch gap-8 w-full max-w-7xl px-4">
        {topMemes.length > 0 ? (
          topMemes.map((meme, index) => (
            <div
              key={meme.id}
              className={`flex flex-col items-center text-center p-6 rounded-lg shadow-xl bg-gray-900/80 backdrop-blur-sm transition-all duration-500 ease-in-out flex-1 min-w-0 h-full justify-between
                ${index === 0 ? 'border-4 border-yellow-400 scale-105' : ''}
                ${index === 1 ? 'border-4 border-gray-300' : ''}
                ${index === 2 ? 'border-4 border-orange-400 scale-95' : ''}
              `}
            >
              <span className="text-6xl mb-4">{getRankEmoji(index)}</span>
              <span className="text-4xl font-bold mb-2 leading-tight">{meme.title}</span>
              <img src={meme.image_url} alt={meme.title} className="w-full h-40 object-contain rounded-md mb-4 bg-gray-800 p-2 flex-grow" />
              <span className="text-2xl text-gray-300 mb-4 leading-tight">({meme.user_username})</span>
              <span className="text-3xl text-blue-300 mt-auto">{meme.votes} гласа</span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-300 text-5xl">Все още няма одобрени мемета.</p>
        )}
      </div>
      <div className="mt-8 text-center text-gray-300 text-2xl max-w-4xl">
        <span className="text-yellow-500">ℹ️</span> <span className="italic">За да видите изображението и да качите мем, моля влезте в блога на адрес: <a href="https://pgknma.space" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-200">pgknma.space</a></span>
      </div>
    </div>
  );

  const renderPollUsers = () => (
    <div className="min-h-screen pt-24 pb-16 flex flex-col justify-center items-center text-white p-8">
      <h1 className="text-6xl font-extrabold mb-12 text-center text-yellow-400 drop-shadow-lg">🏆 Топ Майстори на Анкети</h1>
      <div className="flex justify-center items-stretch gap-8 w-full max-w-7xl px-4">
        {topPollUsers.length > 0 ? (
          topPollUsers.map((user, index) => (
            <div
              key={user.id}
              className={`flex flex-col items-center text-center p-6 rounded-lg shadow-xl bg-gray-900/80 backdrop-blur-sm transition-all duration-500 ease-in-out flex-1 min-w-0 h-full justify-between
                ${index === 0 ? 'border-4 border-yellow-400 scale-105' : ''}
                ${index === 1 ? 'border-4 border-gray-300' : ''}
                ${index === 2 ? 'border-4 border-orange-400 scale-95' : ''}
              `}
            >
              <span className="text-6xl mb-4">{getRankEmoji(index)}</span>
              <span className="text-4xl font-bold mb-2 leading-tight">{user.username}</span>
              <span className="text-3xl text-blue-300 mt-auto">{user.correct_answers} верни отговора</span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-300 text-5xl">Все още няма участници в анкетите.</p>
        )}
      </div>
      <div className="mt-8 text-center text-gray-300 text-2xl max-w-4xl">
        <span className="text-yellow-500">ℹ️</span> <span className="italic">За да участвате в анкетите и да спечелите награди, моля влезте в блога на адрес: <a href="https://pgknma.space" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-200">pgknma.space</a></span>
      </div>
    </div>
  );

  const renderEvents = () => {
    const eventsToShow = upcomingEvents.length > 0 ? upcomingEvents : [];
    
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col justify-center items-center text-white p-8">
        <h1 className="text-6xl font-extrabold mb-12 text-center text-green-400 drop-shadow-lg">📅 Предстоящи Събития</h1>
        
        {eventsToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
            {eventsToShow.map((event, index) => {
              const startDate = parseISO(event.start_datetime);
              const endDate = event.end_datetime ? parseISO(event.end_datetime) : null;
              const isToday = format(startDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              
              return (
                <div
                  key={event.id}
                  className={`relative flex flex-col items-start text-left p-6 rounded-xl shadow-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm transition-all duration-500 ease-in-out
                    ${isToday ? 'border-4 border-green-400 animate-pulse' : 'border-2 border-gray-700'}
                    ${index === 0 ? 'scale-105 z-10' : ''}
                  `}
                >
                  {/* Category Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold mb-4 ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  
                  {/* Title */}
                  <h3 className="text-3xl font-bold mb-4 leading-tight text-white">{event.title}</h3>
                  
                  {/* Date & Time */}
                  <div className="w-full space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Calendar className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <span className="text-xl truncate">
                        {format(startDate, "dd.MM.yyyy")}
                        {endDate && ` - ${format(endDate, "dd.MM.yyyy")}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Clock className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <span className="text-xl truncate">
                        {format(startDate, "HH:mm")}
                        {endDate && ` - ${format(endDate, "HH:mm")}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <span className="text-xl truncate">{event.location}</span>
                    </div>
                    {event.attendees_text && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <Users className="h-6 w-6 text-green-400 flex-shrink-0" />
                        <span className="text-xl truncate">{event.attendees_text}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Description with Markdown */}
                  {event.description && (
                    <div className="text-gray-400 text-lg mb-4 prose prose-invert prose-sm max-w-none">
                      <MarkdownRenderer content={event.description} />
                    </div>
                  )}
                  
                  {/* Today Badge */}
                  {isToday && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full animate-bounce">
                      ДНЕС!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-300 text-5xl">Все още няма предстоящи събития.</p>
        )}
        
        <div className="mt-8 text-center text-gray-300 text-2xl max-w-4xl">
          <span className="text-yellow-500">ℹ️</span> <span className="italic">За да видите всички събития и да участвате, моля влезте в блога на адрес: <a href="https://pgknma.space" target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-200">pgknma.space</a></span>
        </div>
      </div>
    );
  };

  const sections = [renderSongs, renderMemes, renderPollUsers, renderEvents];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background slideshow */}
      <div className="fixed inset-0 z-0">
        {landscapeImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBackgroundIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Overlay to improve text readability */}
            <div className="absolute inset-0 bg-gray-900/70" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <TVScreenHeader />
        {sections[currentSectionIndex]()}
        <TVScreenFooter currentDay={currentDay} formattedTime={formattedTime} />
      </div>
    </div>
  );
};

export default TVScreen;
