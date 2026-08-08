import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AudioReader from '@/components/AudioReader';
import UserAvatar from '@/components/UserAvatar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Tag, FileText, FileArchive, FileSpreadsheet, FileWarning, Clock, Share2 } from "lucide-react";
import { getPost, Post as PostType } from '@/lib/api'; // Assuming Post is the type, aliasing to avoid conflict
import Comments from '@/components/Comments';
import { ShareDropdown } from "@/components/ShareDropdown";
import { useSEO } from "@/hooks/use-seo";
import Lightbox from "yet-another-react-lightbox";
import PDFViewerDialog from "@/components/PDFViewerDialog";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";

const getReadTime = (content: string, hook: string) => {
    const wordCount = `${content} ${hook}`.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
};

const Post = () => {
    const { id } = useParams<{ id: string }>();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfOpen, setPdfOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const { data: postData, isLoading: loading, error: postError } = useQuery({
        queryKey: ['post', id],
        queryFn: () => getPost(id!),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    });
    const post: PostType | null = postData ?? null;
    const error = !id ? 'Липсва идентификатор на публикацията.' : postError instanceof Error ? postError.message : null;
    const galleryImages = useMemo(() => post?.gallery ?? [], [post?.gallery]);
    const lightboxSlides = useMemo(() => galleryImages.map((image, index) => ({
        src: image.image_url,
        alt: image.alt_text || image.title || `Снимка ${index + 1} към ${post?.title || ''}`,
    })), [galleryImages, post?.title]);
    const readTime = useMemo(() => post ? getReadTime(post.content, post.hook) : 0, [post]);

    useSEO({
        title: post ? post.title : "Зареждане...",
        description: post ? post.hook : "Зареждане на публикация...",
        ogImage: post?.banner || undefined,
        ogType: "article",
    });

    useEffect(() => {
        let animationFrameId: number | null = null;
        const updateProgress = () => {
            animationFrameId = null;
            if (!contentRef.current) return;
            
            const rect = contentRef.current.getBoundingClientRect();
            const scrollTop = window.scrollY;
            const viewportHeight = window.innerHeight;
            const contentTop = rect.top + scrollTop;
            const contentHeight = rect.height;
            
            // Total distance to scroll: from top of content at top of viewport 
            // to bottom of content at bottom of viewport
            const totalToScroll = contentHeight - viewportHeight;
            
            let progress = 0;
            if (totalToScroll <= 0) {
                // If content is shorter than viewport, it's 100% once it's fully visible
                progress = scrollTop + viewportHeight >= contentTop + contentHeight ? 100 : 0;
            } else {
                const currentScroll = scrollTop - contentTop;
                progress = (currentScroll / totalToScroll) * 100;
            }
            
            const nextProgress = Math.min(100, Math.max(0, progress));
            setScrollProgress((current) => Math.abs(current - nextProgress) < 0.1 ? current : nextProgress);
        };

        const scheduleProgressUpdate = () => {
            if (animationFrameId === null) animationFrameId = window.requestAnimationFrame(updateProgress);
        };

        window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
        window.addEventListener("resize", scheduleProgressUpdate);
        scheduleProgressUpdate();

        return () => {
            window.removeEventListener("scroll", scheduleProgressUpdate);
            window.removeEventListener("resize", scheduleProgressUpdate);
            if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId);
        };
    }, [post?.id]);


    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="h-6 w-6 text-red-500" />;
            case 'docx':
            case 'doc':
                return <FileText className="h-6 w-6 text-blue-500" />;
            case 'xlsx':
            case 'xls':
                return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
            case 'zip':
                return <FileArchive className="h-6 w-6 text-gray-500" />;
            default:
                return <FileWarning className="h-6 w-6 text-gray-500" />;
        }
    };

    const handleFileClick = (doc: { file_url: string }) => {
        const isPdf = doc.file_url.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            setPdfUrl(doc.file_url);
            setPdfOpen(true);
        } else {
            window.open(doc.file_url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="w-full bg-background">
            {/* RGB Reading Progress Bar */}
            <style>
                {`
                @keyframes rainbow-progress {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-rgb-bar {
                    background: linear-gradient(
                        90deg, 
                        #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff, #ff0000
                    );
                    background-size: 400% 100%;
                    animation: rainbow-progress 5s linear infinite;
                }
                `}
            </style>
            <div className="fixed top-16 left-0 w-full h-1.5 z-50 pointer-events-none">
                <div 
                    className="h-full animate-rgb-bar transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>
            <main className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                            <p className="mt-4 text-lg text-muted-foreground">Зареждане на публикацията...</p>
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center text-destructive">
                            <p className="text-lg font-semibold">{error}</p>
                        </div>
                    ) : post && id ? (
                        <article className="max-w-4xl mx-auto">
                            <div ref={contentRef}>
                                <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                                    <div className="flex items-center gap-1.5">
                                        <UserAvatar
                                            username={post.author_username}
                                            avatarUrl={post.author_avatar_url}
                                            className="h-6 w-6 text-xs"
                                        />
                                        <span>{post.author_username || `User ID: ${post.author}`}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(post.published_at || post.created_at).toLocaleDateString('bg-BG')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Tag className="h-4 w-4" />
                                        <Badge variant="secondary">{post.category_name}</Badge>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        <span>{readTime} мин. четене</span>
                                    </div>
                                    <ShareDropdown title={post.title} summary={post.hook}>
                                        <button 
                                            className="flex items-center justify-start gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-border/50 sm:border-t-0"
                                            title="Сподели тази статия"
                                        >
                                            <Share2 className="h-4 w-4" />
                                            <span>Сподели</span>
                                        </button>
                                    </ShareDropdown>
                                </div>

                                <AudioReader content={post.content} title={post.title} />

                                {post.banner && (
                                    <img
                                        src={post.banner}
                                        alt={`Банер за ${post.title}`}
                                        className="w-full max-h-96 object-contain rounded-3xl mb-8"
                                        loading="lazy"
                                    />
                                )}

                                <MarkdownRenderer 
                                    content={post.content} 
                                    onPdfClick={(url) => {
                                        setPdfUrl(url);
                                        setPdfOpen(true);
                                    }}
                                />

                                {/* Image Gallery Section */}
                                {galleryImages.length > 0 && (
                                    <div className="mt-12">
                                        <h2 className="text-2xl font-bold mb-4">Галерия</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {galleryImages.map((image, index) => (
                                                <figure
                                                    key={image.id}
                                                    className={image.is_featured ? "sm:col-span-2" : ""}
                                                >
                                                    <button
                                                        type="button"
                                                        className="group block w-full cursor-pointer overflow-hidden rounded-xl bg-muted text-left"
                                                        onClick={() => {
                                                            setLightboxIndex(index);
                                                            setLightboxOpen(true);
                                                        }}
                                                        aria-label={`Отвори снимка ${index + 1} от галерията`}
                                                    >
                                                        <img
                                                            src={image.image_url}
                                                            alt={image.alt_text || image.title || `Снимка ${index + 1} към ${post.title}`}
                                                            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${image.is_featured ? "aspect-video" : "aspect-square"}`}
                                                            style={{ objectPosition: `${image.focus_x}% ${image.focus_y}%` }}
                                                            loading="lazy"
                                                        />
                                                    </button>
                                                    {image.title && (
                                                        <figcaption className="mt-2 text-sm text-muted-foreground">
                                                            {image.title}
                                                        </figcaption>
                                                    )}
                                                </figure>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Document Section */}
                                {post.documents && post.documents.length > 0 && (
                                    <div className="mt-12">
                                        <h2 className="text-2xl font-bold mb-4">Прикачени файлове</h2>
                                        <div className="space-y-3">
                                            {post.documents.map((doc, index) => (
                                                <button 
                                                    key={doc.id || index} 
                                                    onClick={() => handleFileClick(doc)}
                                                    className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-muted transition-colors w-full min-w-0 text-left"
                                                >
                                                    <div className="shrink-0 flex items-center">
                                                        {getFileIcon(doc.file_url)}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-grow min-w-0 gap-x-4 gap-y-1">
                                                        <span className="font-medium text-card-foreground hover:underline truncate">
                                                            {decodeURIComponent(doc.file_url.split('/').pop() || '')}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground shrink-0 whitespace-nowrap sm:ml-auto">
                                                            Качено на: {new Date(doc.uploaded_at).toLocaleDateString('bg-BG')}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <Comments postId={id} />

                        </article>
                    ) : (
                        <div className="text-center">
                            <p className="text-lg text-muted-foreground">Публикацията не е намерена.</p>
                        </div>
                    )}
                </div>
            </main>

            {post && galleryImages.length > 0 && (
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    slides={lightboxSlides}
                    index={lightboxIndex}
                    plugins={[Zoom, Fullscreen, Thumbnails, Counter]}
                    styles={{ container: { padding: "env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0)" } }}
                    thumbnails={{
                        height: 60,
                        gap: 8,
                    }}
                    className="z-50"
                />
            )}

            <PDFViewerDialog 
                fileUrl={pdfUrl}
                isOpen={pdfOpen}
                onOpenChange={setPdfOpen}
                title={pdfUrl ? decodeURIComponent(pdfUrl.split('/').pop() || '') : "Преглед на документ"}
            />
        </div>
    );
};

export default Post;
