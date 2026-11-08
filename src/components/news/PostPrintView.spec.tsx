import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Post } from "@/lib/api";
import { PostPrintView } from "./PostPrintView";

const post = {
  id: 7,
  title: "Училищен празник",
  hook: "Кратък увод",
  content: "Текст на статията.\n\n![Снимка в текста](/files/inline.jpg)",
  banner: "/files/banner.jpg",
  categories: [{ id: 1, full_name: "Новини", short_name: "Н" }],
  author_username: "Редактор",
  created_at: "2026-11-07T10:00:00Z",
  published_at: "2026-11-07T10:00:00Z",
  gallery: [
    { id: 1, image_url: "/files/original-1.jpg", display_url: "/files/display-1.jpg", thumbnail_url: "/files/thumb-1.jpg", title: "Първи кадър", alt_text: "Първа снимка", position: 1, is_featured: false, focus_x: 50, focus_y: 50 },
    { id: 2, image_url: "/files/original-2.jpg", thumbnail_url: "/files/thumb-2.jpg", title: "", alt_text: "Втора снимка", position: 2, is_featured: true, focus_x: 50, focus_y: 50 },
  ],
  documents: [{ id: 1, file_url: "/files/%D0%BF%D0%BB%D0%B0%D0%BD.pdf", uploaded_at: "2026-11-07T10:00:00Z" }],
} as unknown as Post;

describe("PostPrintView", () => {
  it("renders as a direct child of body, where the print rules can isolate it", () => {
    render(<PostPrintView post={post} />);
    expect(document.querySelector("body > .post-print-view")).not.toBeNull();
  });

  it("prints gallery photos at full size rather than as cropped thumbnails", () => {
    render(<PostPrintView post={post} />);
    expect(screen.getByAltText("Първа снимка")).toHaveAttribute("src", "/files/display-1.jpg");
    expect(screen.getByAltText("Втора снимка")).toHaveAttribute("src", "/files/original-2.jpg");
    expect(screen.getByText("Първи кадър")).toBeInTheDocument();
  });

  it("loads every image eagerly, including those inside the article text", () => {
    render(<PostPrintView post={post} />);
    expect(screen.getByAltText("Снимка в текста")).toHaveAttribute("loading", "eager");
    document.querySelectorAll(".post-print-view img").forEach((image) => {
      expect(image).not.toHaveAttribute("loading", "lazy");
    });
  });

  it("includes the banner, decoded file names and the source link", () => {
    render(<PostPrintView post={post} />);
    expect(screen.getByAltText("Банер за Училищен празник")).toHaveAttribute("src", "/files/banner.jpg");
    expect(screen.getByText("план.pdf")).toBeInTheDocument();
    expect(screen.getByText(/Източник: .*\/post\/7$/)).toBeInTheDocument();
  });

  it("omits the sections an article does not have", () => {
    render(<PostPrintView post={{ ...post, banner: null, gallery: [], documents: [] }} />);
    expect(screen.queryByText("Галерия")).not.toBeInTheDocument();
    expect(screen.queryByText("Прикачени файлове")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Банер за Училищен празник")).not.toBeInTheDocument();
  });
});
