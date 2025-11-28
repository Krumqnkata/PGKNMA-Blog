import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, Calendar, Music2, Mail, Home, Vote, Laugh, FileLock, Gavel } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const pages = [
    { name: "Начало", path: "/", icon: Home, keywords: "начална страница главно кацане" },
    { name: "Новини и актуализации", path: "/news", icon: FileText, keywords: "статии блог публикации съобщения" },
    { name: "Училищен календар", path: "/events", icon: Calendar, keywords: "събития график дати дейности" },
    { name: "Предложете звънец", path: "/bell-suggest#bell-song", icon: Music2, keywords: "песен предложете звънец формуляр за песен на звънец" },
    { name: "Седмична анкета", path: "/weekly-poll", icon: Vote, keywords: "код на седмицата анкета предизвикателство въпрос" },
    { name: "Меме на седмицата", path: "/meme-of-the-week", icon: Laugh, keywords: "меме смях забавление училищен живот" },
    { name: "Контакт", path: "/contact", icon: Mail, keywords: "свържете се с нас пишете ни имейл" },
    { name: "Политика за поверителност", path: "/privacy-policy", icon: FileLock, keywords: "поверителност лични данни gdpr права" },
    { name: "Условия за ползване", path: "/terms-of-service", icon: Gavel, keywords: "условия правила услуги задължения" },
  ];

  const filteredPages = pages.filter((page) => 
    page.name.toLowerCase().includes(search.toLowerCase()) ||
    page.keywords.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path: string) => {
    if (path.includes("#")) {
      const [base, hash] = path.split("#");
      navigate(base || "/");
      requestAnimationFrame(() => {
        window.location.hash = hash ? `#${hash}` : "";
      });
    } else {
      navigate(path);
    }
    onOpenChange(false);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Търсене на страници и съдържание..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Няма намерени резултати.</CommandEmpty>
        <CommandGroup heading="Страници">
          {filteredPages.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem
                key={page.path}
                onSelect={() => handleSelect(page.path)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{page.name}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default SearchDialog;
