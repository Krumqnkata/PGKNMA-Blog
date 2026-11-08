import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  FileLock,
  FileText,
  Gavel,
  Home,
  Laugh,
  Loader2,
  Mail,
  Music2,
  Newspaper,
  Clock3,
  HelpCircle,
  Vote,
} from "lucide-react";

import { SiteArt } from "@/components/art/SiteArt";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { globalSearch, type GlobalSearchResultKind } from "@/lib/api";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { name: "Начало", path: "/", icon: Home, keywords: "начална страница главно" },
  { name: "Новини и актуализации", path: "/news", icon: FileText, keywords: "статии блог публикации" },
  { name: "Училищен календар", path: "/events", icon: Calendar, keywords: "събития график дати" },
  { name: "Учебна програма", path: "/program", icon: Clock3, keywords: "часове разписание клас" },
  { name: "Помощ и въпроси", path: "/faq", icon: HelpCircle, keywords: "помощ често задавани въпроси" },
  { name: "Предложете звънец", path: "/bell-suggest#bell-song", icon: Music2, keywords: "песен звънец" },
  { name: "Седмична анкета", path: "/weekly-poll", icon: Vote, keywords: "анкета въпрос" },
  { name: "Меме на седмицата", path: "/meme-of-the-week", icon: Laugh, keywords: "меме забавление" },
  { name: "Контакт", path: "/contact", icon: Mail, keywords: "имейл връзка" },
  { name: "Политика за поверителност", path: "/privacy-policy", icon: FileLock, keywords: "лични данни gdpr" },
  { name: "Условия за ползване", path: "/terms-of-service", icon: Gavel, keywords: "правила условия" },
] as const;

const resultDetails: Record<GlobalSearchResultKind, { label: string; icon: typeof FileText }> = {
  post: { label: "Публикация", icon: Newspaper },
  event: { label: "Събитие", icon: Calendar },
  song: { label: "Песен", icon: Music2 },
  meme: { label: "Меме", icon: Laugh },
};

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 250);
  const normalizedSearch = search.trim().toLocaleLowerCase("bg");
  const searchQuery = useQuery({
    queryKey: ["global-search", debouncedSearch],
    queryFn: () => globalSearch(debouncedSearch),
    enabled: open && debouncedSearch.length >= 2,
    staleTime: 60_000,
  });
  const filteredPages = pages.filter((page) => (
    !normalizedSearch
    || page.name.toLocaleLowerCase("bg").includes(normalizedSearch)
    || page.keywords.includes(normalizedSearch)
  ));

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) setSearch("");
  };

  const handleSelect = (path: string) => {
    const [base, hash] = path.split("#");
    navigate(base || "/");
    if (hash) requestAnimationFrame(() => { window.location.hash = `#${hash}`; });
    handleOpenChange(false);
  };

  const results = searchQuery.data?.results ?? [];
  const awaitingQuery = search.trim() !== debouncedSearch;
  const showNoResults = !awaitingQuery && debouncedSearch.length >= 2
    && !searchQuery.isFetching
    && !searchQuery.isError
    && results.length === 0
    && filteredPages.length === 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      commandShouldFilter={false}
      title="Глобално търсене"
      description="Търсене в публикации, събития, песни, мемета и страници."
    >
      <CommandInput
        autoFocus
        placeholder="Потърсете новина, събитие, песен или страница..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[min(64vh,34rem)] py-2">
        {(searchQuery.isFetching || awaitingQuery) && search.length >= 2 && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Търсене в съдържанието...
          </div>
        )}

        {searchQuery.isError && (
          <div className="mx-3 my-2 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Търсенето временно не е достъпно. Бързите връзки отдолу продължават да работят.
          </div>
        )}

        {showNoResults && (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center text-sm text-muted-foreground">
            <SiteArt name="map" className="art-pop h-12 w-12" />
            <p className="font-semibold text-foreground [overflow-wrap:anywhere]">Претърсихме навсякъде за „{debouncedSearch}“, но не го намерихме.</p>
            <p>Опитайте с друга дума или по-кратко търсене.</p>
          </div>
        )}

        {!awaitingQuery && results.length > 0 && (
          <CommandGroup heading="Намерено съдържание">
            {results.map((result) => {
              const details = resultDetails[result.kind];
              const Icon = details.icon;
              return (
                <CommandItem
                  key={`${result.kind}-${result.id}`}
                  value={`${result.kind}-${result.id}`}
                  onSelect={() => handleSelect(result.url)}
                  className="group cursor-pointer gap-3 rounded-xl py-3"
                >
                  {result.image_url ? (
                    <img src={result.image_url} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold">{result.title}</span>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {details.label}
                      </span>
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">{result.description}</span>
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {filteredPages.length > 0 && (
          <CommandGroup heading={normalizedSearch ? "Страници" : "Бърз достъп"}>
            {filteredPages.map((page) => {
              const Icon = page.icon;
              return (
                <CommandItem
                  key={page.path}
                  value={page.path}
                  onSelect={() => handleSelect(page.path)}
                  className="cursor-pointer rounded-xl"
                >
                  <Icon className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
                  <span>{page.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
      <div className="flex items-center justify-between border-t bg-muted/35 px-4 py-2 text-[11px] text-muted-foreground">
        <span>Търси в публичното съдържание</span>
        <span className="hidden sm:inline">↑↓ избор · Enter отваряне · Esc затваряне</span>
      </div>
    </CommandDialog>
  );
};

export default SearchDialog;
