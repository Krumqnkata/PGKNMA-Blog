import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Link2, Check, Share2 } from "lucide-react";

interface ShareDropdownProps {
  url?: string;
  title: string;
  children: React.ReactNode;
}

export const ShareDropdown: React.FC<ShareDropdownProps> = ({ url, title, children }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const shareUrl = url || window.location.href;

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      setOpen(false);
    };

    // Automatically close the dropdown when scrolling the page
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Връзката е копирана успешно!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Грешка при копиране:", err);
      toast.error("Възникна грешка при копирането.");
    }
  };

  const isShareApiSupported = typeof navigator !== "undefined" && !!navigator.share;

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isShareApiSupported) return;
    try {
      await navigator.share({
        url: shareUrl,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Грешка при споделяне:", err);
      }
    }
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: (
        <svg className="w-4 h-4 mr-2.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      focusClass: "focus:text-[#1877F2] focus:bg-[#1877F2]/10",
    },
    {
      name: "Viber",
      icon: (
        <svg className="w-4 h-4 mr-2.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.693 6.698.623 9.82c-.06 3.11-.13 8.95 5.5 10.541v2.42s-.038.97.602 1.17c.79.25 1.24-.499 1.99-1.299l1.4-1.58c3.85.32 6.8-.419 7.14-.529.78-.25 5.181-.811 5.901-6.652.74-6.031-.36-9.831-2.34-11.551l-.01-.002c-.6-.55-3-2.3-8.37-2.32 0 0-.396-.025-1.038-.016zm.067 1.697c.545-.003.88.02.88.02 4.54.01 6.711 1.38 7.221 1.84 1.67 1.429 2.528 4.856 1.9 9.892-.6 4.88-4.17 5.19-4.83 5.4-.28.09-2.88.73-6.152.52 0 0-2.439 2.941-3.199 3.701-.12.13-.26.17-.35.15-.13-.03-.17-.19-.16-.41l.02-4.019c-4.771-1.32-4.491-6.302-4.441-8.902.06-2.6.55-4.732 2-6.172 1.957-1.77 5.475-2.01 7.11-2.02zm.36 2.6a.299.299 0 0 0-.3.299.3.3 0 0 0 .3.3 5.631 5.631 0 0 1 4.03 1.59c1.09 1.06 1.621 2.48 1.641 4.34a.3.3 0 0 0 .3.3v-.009a.3.3 0 0 0 .3-.3 6.451 6.451 0 0 0-1.81-4.76c-1.19-1.16-2.692-1.76-4.462-1.76zm-3.954.69a.955.955 0 0 0-.615.12h-.012c-.41.24-.788.54-1.148.94-.27.32-.421.639-.461.949a1.24 1.24 0 0 0 .05.541l.02.01a13.722 13.722 0 0 0 1.2 2.6 15.383 15.383 0 0 0 2.32 3.171l.03.04.04.03.03.03.03.03a15.603 15.603 0 0 0 3.18 2.33c1.32.72 2.122 1.06 2.602 1.2v.01c.14.04.268.06.398.06a1.84 1.84 0 0 0 1.102-.472c.39-.35.7-.738.93-1.148v-.01c.23-.43.15-.841-.18-1.121a13.632 13.632 0 0 0-2.15-1.54c-.51-.28-1.03-.11-1.24.17l-.45.569c-.23.28-.65.24-.65.24l-.012.01c-3.12-.8-3.95-3.959-3.95-3.959s-.04-.43.25-.65l.56-.45c.27-.22.46-.74.17-1.25a13.522 13.522 0 0 0-1.54-2.15.843.843 0 0 0-.504-.3zm4.473.89a.3.3 0 0 0 .002.6 3.78 3.78 0 0 1 2.65 1.15 3.5 3.5 0 0 1 .9 2.57.3.3 0 0 0 .3.299l.01.012a.3.3 0 0 0 .3-.301c.03-1.19-.34-2.19-1.07-2.99-.73-.8-1.75-1.25-3.05-1.34a.3.3 0 0 0-.042 0zm.49 1.619a.305.305 0 0 0-.018.611c.99.05 1.47.55 1.53 1.58a.3.3 0 0 0 .3.29h.01a.3.3 0 0 0 .29-.32c-.07-1.34-.8-2.091-2.1-2.161a.305.305 0 0 0-.012 0z" />
        </svg>
      ),
      url: `viber://forward?text=${encodeURIComponent(title + " " + shareUrl)}`,
      focusClass: "focus:text-[#7360F2] focus:bg-[#7360F2]/10",
    },
    {
      name: "Telegram",
      icon: (
        <svg className="w-4 h-4 mr-2.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.58.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.52 3.64-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.74-3.32 3.69-1.5 4.45-1.76 4.95-1.77.11 0 .36.03.52.16.13.1.17.24.19.34.02.13.02.26.01.37z" />
        </svg>
      ),
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      focusClass: "focus:text-[#24A1DE] focus:bg-[#24A1DE]/10",
    },
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-4 h-4 mr-2.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`,
      focusClass: "focus:text-[#25D366] focus:bg-[#25D366]/10",
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        side="bottom"
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-52 p-1.5 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-2.5 py-1.5">
          Сподели чрез
        </DropdownMenuLabel>
        
        {/* Copy Link */}
        <DropdownMenuItem 
          onClick={handleCopyLink}
          className="flex items-center px-2.5 py-2.5 rounded-lg cursor-pointer text-sm transition-colors text-muted-foreground focus:text-primary focus:bg-primary/10"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2.5 text-green-500 animate-in zoom-in duration-300" />
              <span className="font-semibold text-green-500">Копирано!</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4 mr-2.5 text-muted-foreground" />
              <span>Копирай връзка</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-muted" />

        {/* Social Platforms */}
        {shareOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            asChild
            className={`flex items-center px-2.5 py-2.5 rounded-lg cursor-pointer text-sm transition-colors text-muted-foreground ${option.focusClass}`}
          >
            <a href={option.url} target="_blank" rel="noopener noreferrer">
              {option.icon}
              <span>{option.name}</span>
            </a>
          </DropdownMenuItem>
        ))}

        {/* Native Web Share */}
        {isShareApiSupported && (
          <>
            <DropdownMenuSeparator className="my-1.5 bg-muted" />
            <DropdownMenuItem
              onClick={handleNativeShare}
              className="flex items-center px-2.5 py-2.5 rounded-lg cursor-pointer text-sm transition-colors text-muted-foreground focus:text-primary focus:bg-primary/10"
            >
              <Share2 className="h-4 w-4 mr-2.5 text-muted-foreground" />
              <span>Още опции...</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
