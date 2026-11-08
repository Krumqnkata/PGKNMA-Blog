import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Link2 } from "lucide-react";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { InteriorPage, InteriorSection } from "@/components/InteriorPage";
import { GalleryPhoto } from "@/components/gallery/GalleryPhoto";
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from "@/components/query/QueryStates";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { getPost } from "@/lib/api";
import { formatSiteDate } from "@/lib/date-time";
import { albumFromPost, photoCountLabel } from "@/lib/gallery";

export default function GalleryAlbum() {
  const { id = "" } = useParams();
  const [photoIndex, setPhotoIndex] = useState(-1);
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ["post", id], queryFn: () => getPost(id), staleTime: 5 * 60 * 1000 });
  const album = useMemo(() => data ? albumFromPost(data) : null, [data]);
  const slides = useMemo(() => album?.photos.map((photo, index) => ({
    src: photo.display_url || photo.image_url,
    alt: photo.alt_text || photo.title || `Снимка ${index + 1} — ${album.title}`,
  })) || [], [album]);
  useSEO({ title: album ? `${album.title} — Галерия` : "Галерия", description: album ? `${photoCountLabel(album.photos.length)} от „${album.title}“.` : "Снимки от училищния живот.", ogImage: album?.photos[0].display_url || album?.photos[0].image_url });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(`/gallery/${id}`, window.location.origin).href);
      toast.success("Връзката към албума е копирана.");
    } catch {
      toast.error("Копирай връзката от адресната лента на браузъра.");
    }
  };

  return (
    <InteriorPage>
      <InteriorSection>
        <Button asChild variant="ghost" className="mb-6 -ml-3"><Link to="/gallery"><ArrowLeft className="size-4" aria-hidden="true" />Всички албуми</Link></Button>
        {isPending ? <ContentSkeleton label="Зареждане на албума" /> : isError ? <QueryErrorState title="Албумът не може да се зареди" onRetry={() => void refetch()} /> : !album ? (
          <QueryEmptyState art="photos" title="Албумът не е наличен" description="Публикацията не е достъпна или няма прикачени снимки. Разгледай останалите албуми в галерията." />
        ) : <>
          <header className="mb-8">
            <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground"><time dateTime={album.date}>{formatSiteDate(album.date, { day: "numeric", month: "long", year: "numeric" })}</time><span aria-hidden="true">·</span><span>{photoCountLabel(album.photos.length)}</span></p>
            <h1 className="max-w-4xl break-words text-3xl font-bold tracking-tight sm:text-4xl">{album.title}</h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link to={`/post/${album.id}`}>Към статията<ArrowUpRight className="size-4" aria-hidden="true" /></Link></Button>
              <Button variant="ghost" onClick={() => void copyLink()}><Link2 className="size-4" aria-hidden="true" />Копирай връзка</Button>
            </div>
          </header>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {album.photos.map((photo, index) => <button key={photo.image_url} type="button" onClick={() => setPhotoIndex(index)} aria-label={`Отвори снимка ${index + 1}${photo.title ? `: ${photo.title}` : ""}`} className="group aspect-[4/3] overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <GalleryPhoto photo={photo} alt={slides[index].alt} />
            </button>)}
          </div>
          <Lightbox open={photoIndex >= 0} close={() => setPhotoIndex(-1)} index={Math.max(0, photoIndex)} slides={slides} carousel={{ preload: 1 }} plugins={[Zoom, Fullscreen, Counter]}
            labels={{ Close: "Затвори", Next: "Следваща снимка", Previous: "Предишна снимка", "Zoom in": "Увеличи", "Zoom out": "Намали", "Enter Fullscreen": "Цял екран", "Exit Fullscreen": "Изход от цял екран" }}
            styles={{ container: { padding: "env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0)" } }} />
        </>}
      </InteriorSection>
    </InteriorPage>
  );
}
