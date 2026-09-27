import type { Post, PostGalleryImage } from "@/lib/api";
import { siteDateKey } from "@/lib/date-time";

export interface GalleryAlbum {
  id: number;
  title: string;
  date: string;
  schoolYear: string;
  photos: PostGalleryImage[];
}

export function albumFromPost(post: Post, now = Date.now()): GalleryAlbum | null {
  const date = post.published_at || post.created_at;
  if (!post.published || !post.allowed || !Number.isFinite(Date.parse(date)) || Date.parse(date) > now) return null;

  // The API normalizes legacy `images` into `gallery`. Banners are article
  // covers, not album attachments; do not add them as extra photographs.
  const seen = new Set<string>();
  const photos = [...(post.gallery || [])]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.position - b.position || a.id - b.id)
    .filter((photo) => {
      const url = photo.image_url?.trim();
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  if (!photos.length) return null;

  const [year, month] = siteDateKey(date).split("-").map(Number);
  const startYear = month >= 9 ? year : year - 1;
  return { id: post.id, title: post.title, date, schoolYear: `${startYear}/${startYear + 1}`, photos };
}

export function albumsFromPosts(posts: Post[], now = Date.now()): GalleryAlbum[] {
  return posts.map((post) => albumFromPost(post, now))
    .filter((album): album is GalleryAlbum => album !== null)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id);
}

export const photoCountLabel = (count: number) => `${count} ${count === 1 ? "снимка" : "снимки"}`;
