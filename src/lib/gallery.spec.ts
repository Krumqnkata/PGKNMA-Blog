import { describe, expect, it } from "vitest";
import type { Post, PostGalleryImage } from "@/lib/api";
import { albumFromPost, albumsFromPosts } from "@/lib/gallery";

const photo = (id: number, extra: Partial<PostGalleryImage> = {}): PostGalleryImage => ({ id, image_url: `/photo-${id}.jpg`, title: "", alt_text: "", position: id, is_featured: false, focus_x: 50, focus_y: 50, ...extra });
const post = (extra: Partial<Post> = {}): Post => ({ id: 1, title: "Събитие", published: true, allowed: true, created_at: "2025-06-01T09:00:00Z", published_at: null, gallery: [photo(1)], ...extra } as Post);
const now = Date.parse("2026-09-27T09:00:00Z");

describe("article albums", () => {
  it("excludes drafts, unapproved and scheduled articles, empty albums and banner-only articles", () => {
    const posts = [post({ published: false }), post({ allowed: false }), post({ published_at: "2026-10-01T09:00:00Z" }), post({ gallery: [] }), post({ gallery: [], banner: "/cover.jpg" }), post({ gallery: [photo(1, { image_url: "" })] })];
    expect(albumsFromPosts(posts, now)).toEqual([]);
  });

  it("uses the featured photograph as cover, preserves editorial order and counts duplicates once", () => {
    const gallery = [photo(1), photo(2, { is_featured: true }), photo(3, { image_url: "/photo-1.jpg" }), photo(4, { position: 0 })];
    expect(albumFromPost(post({ gallery }), now)?.photos.map(({ id }) => id)).toEqual([2, 4, 1]);
    expect(gallery.map(({ id }) => id)).toEqual([1, 2, 3, 4]);
  });

  it("sorts by publication date, falling back to creation date for older articles", () => {
    expect(albumsFromPosts([post({ id: 1 }), post({ id: 2, published_at: "2026-09-20T09:00:00Z" }), post({ id: 3, created_at: "2026-08-10T09:00:00Z" })], now).map(({ id }) => id)).toEqual([2, 3, 1]);
  });

  it("assigns the academic year at September midnight in Sofia", () => {
    expect(albumFromPost(post({ published_at: "2026-08-31T20:59:00Z" }), now)?.schoolYear).toBe("2025/2026");
    expect(albumFromPost(post({ published_at: "2026-08-31T21:00:00Z" }), now)?.schoolYear).toBe("2026/2027");
  });
});
