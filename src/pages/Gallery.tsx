import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Images, Search } from "lucide-react";
import { InteriorPage, InteriorPageHero, InteriorSection, SectionHeading } from "@/components/InteriorPage";
import { AlbumCard } from "@/components/gallery/AlbumCard";
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from "@/components/query/QueryStates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePosts } from "@/hooks/use-posts";
import { albumsFromPosts } from "@/lib/gallery";

export default function Gallery() {
  const { data, isPending, isError, refetch } = usePosts();
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(12);
  const search = params.get("q") || "";
  const year = params.get("year") || "";
  const albums = useMemo(() => albumsFromPosts(data || []), [data]);
  const years = [...new Set(albums.map((album) => album.schoolYear))].sort().reverse();
  const filtered = albums.filter((album) => (!year || album.schoolYear === year)
    && album.title.toLocaleLowerCase("bg").includes(search.trim().toLocaleLowerCase("bg")));
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
    setLimit(12);
  };

  return (
    <InteriorPage>
      <InteriorPageHero
        eyebrow="Училищният живот в кадри"
        title={<span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Галерия</span>}
        description="Събития, постижения и споделени моменти — разгледай снимките от нашите публикации."
        icon={Images}
      />
      <InteriorSection>
        <div className="mb-10 grid gap-5 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-lg shadow-black/5 backdrop-blur sm:grid-cols-[minmax(0,1fr)_220px] sm:p-6">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="gallery-search">Търси албум</Label>
            <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="gallery-search" type="search" placeholder="Заглавие на публикация…" value={search} onChange={(event) => updateFilter("q", event.target.value)} className="h-12 pl-11" /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gallery-year">Учебна година</Label>
            <Select value={year || "all"} onValueChange={(value) => updateFilter("year", value === "all" ? "" : value)}>
              <SelectTrigger id="gallery-year" className="h-12"><SelectValue placeholder="Всички години" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички години</SelectItem>
                {year && !years.includes(year) && <SelectItem value={year}>{year}</SelectItem>}
                {years.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isPending ? <ContentSkeleton label="Зареждане на албумите" /> : isError ? (
          <QueryErrorState title="Галерията не може да се зареди" onRetry={() => void refetch()} />
        ) : <>
          <SectionHeading eyebrow="Фотоархив" title={search || year ? "Резултати от филтрирането" : "Всички албуми"} description={`${filtered.length} ${filtered.length === 1 ? "намерен албум" : "намерени албума"}`} />
          <p role="status" className="sr-only">{filtered.length} {filtered.length === 1 ? "албум" : "албума"}</p>
          {!filtered.length ? <>
            <QueryEmptyState icon={Images} title={albums.length ? "Няма намерени албуми" : "Все още няма албуми"} description={albums.length ? "Опитай с друго заглавие или учебна година." : "Тук ще откриеш снимките от следващите ни публикации."} />
            {(search || year) && <Button variant="outline" className="mt-4" onClick={() => { setParams({}); setLimit(12); }}>Изчисти филтрите</Button>}
          </> : <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.slice(0, limit).map((album) => <AlbumCard key={album.id} album={album} />)}</div>
            {filtered.length > limit && <div className="mt-8 text-center"><Button variant="outline" onClick={() => setLimit((value) => value + 12)}>Покажи още албуми</Button></div>}
          </>}
        </>}
      </InteriorSection>
    </InteriorPage>
  );
}
