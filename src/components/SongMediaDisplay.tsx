import { Music } from 'lucide-react';

interface SongMediaDisplayProps {
  link: string;
  title: string;
}

const SongMediaDisplay = ({ link, title }: SongMediaDisplayProps) => {
  // Regex for YouTube and Spotify
  const youtubeMatch = link.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([a-zA-Z0-9_-]{11})/);
  const spotifyMatch = link.match(/(?:https?:\/\/)?(?:open\.spotify\.com)\/(track|episode)\/([a-zA-Z0-9]{22})/);

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={`YouTube video player for ${title}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  if (spotifyMatch) {
    const trackId = spotifyMatch[2];
    return (
      <div className="w-full">
        <iframe
          style={{ borderRadius: '12px' }}
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`Spotify player for ${title}`}
        ></iframe>
      </div>
    );
  }

  // Fallback for unsupported links
  return (
    <div className="flex h-36 w-full items-center justify-center rounded-t-lg bg-secondary">
      <div className="text-center text-muted-foreground">
        <Music className="mx-auto h-8 w-8" />
        <p className="mt-2 text-sm">Няма налично превю</p>
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-1 text-xs text-primary underline hover:text-primary/80"
        >
          Отвори връзката
        </a>
      </div>
    </div>
  );
};

export default SongMediaDisplay;
