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
import { FileText, Calendar, Users, GraduationCap, Mail, Home } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const pages = [
    { name: "Home", path: "/", icon: Home, keywords: "homepage main landing" },
    { name: "News & Updates", path: "/news", icon: FileText, keywords: "articles blog posts announcements" },
    { name: "School Calendar", path: "/events", icon: Calendar, keywords: "events schedule dates activities" },
    { name: "For Parents", path: "/parents", icon: Users, keywords: "parent portal resources" },
    { name: "For Students", path: "/students", icon: GraduationCap, keywords: "student portal grades schedule" },
    { name: "Contact", path: "/contact", icon: Mail, keywords: "contact us reach out email" },
  ];

  const filteredPages = pages.filter((page) => 
    page.name.toLowerCase().includes(search.toLowerCase()) ||
    page.keywords.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search pages and content..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
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
