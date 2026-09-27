import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { PostGalleryImage } from "@/lib/api";

export function GalleryPhoto({ photo, alt }: { photo: PostGalleryImage; alt: string }) {
  const sources = [...new Set([photo.thumbnail_url, photo.display_url, photo.image_url].filter(Boolean))];
  const [sourceIndex, setSourceIndex] = useState(0);
  if (sourceIndex >= sources.length) {
    return <span role="img" aria-label={`${alt} — снимката е недостъпна`} className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground"><ImageOff className="size-8" aria-hidden="true" /></span>;
  }
  return (
    <img src={sources[sourceIndex]} alt={alt} loading="lazy" decoding="async"
      onError={() => setSourceIndex((index) => index + 1)}
      style={{ objectPosition: `${photo.focus_x ?? 50}% ${photo.focus_y ?? 50}%` }}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none" />
  );
}
