import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AlbumCard } from "@/components/gallery/AlbumCard";
import { Button } from "@/components/ui/button";
import { usePosts } from "@/hooks/use-posts";
import { albumsFromPosts } from "@/lib/gallery";
import { SiteArt } from "@/components/art/SiteArt";

export default function HomeGallery() {
  const { data } = usePosts();
  const albums = useMemo(() => albumsFromPosts(data || []).slice(0, 3), [data]);
  if (!albums.length) return null;

  return (
    <section id="home-gallery" aria-labelledby="home-gallery-title" className="border-b border-border py-10 sm:py-14">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <SiteArt name="photos" className="mb-3 block h-14 w-14 drop-shadow-sm" />
            <p className="mb-2 text-sm font-semibold text-primary">Училищният живот в кадри</p>
            <h2 id="home-gallery-title" className="text-3xl font-bold tracking-tight sm:text-4xl">Последни албуми</h2>
          </div>
          <Button asChild variant="outline"><Link to="/gallery">Всички албуми<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{albums.map((album) => <AlbumCard key={album.id} album={album} />)}</div>
      </div>
    </section>
  );
}
