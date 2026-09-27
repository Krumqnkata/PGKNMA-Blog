import { Images } from "lucide-react";
import { Link } from "react-router-dom";
import { GalleryPhoto } from "@/components/gallery/GalleryPhoto";
import { formatSiteDate } from "@/lib/date-time";
import { photoCountLabel, type GalleryAlbum } from "@/lib/gallery";

export function AlbumCard({ album, heading: Heading = "h3" }: { album: GalleryAlbum; heading?: "h2" | "h3" }) {
  const cover = album.photos[0];
  return (
    <Link to={`/gallery/${album.id}`} className="group block h-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-2xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <GalleryPhoto key={cover.image_url} photo={cover} alt={cover.alt_text || cover.title || album.title} />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-medium text-white">
          <Images className="size-3.5" aria-hidden="true" />{photoCountLabel(album.photos.length)}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <time dateTime={album.date} className="text-xs text-muted-foreground">{formatSiteDate(album.date, { day: "numeric", month: "long", year: "numeric" })}</time>
        <Heading className="mt-2 line-clamp-2 break-words text-xl font-black leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-2xl">{album.title}</Heading>
      </div>
    </Link>
  );
}
