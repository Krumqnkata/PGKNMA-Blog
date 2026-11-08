import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AudioReader from '@/components/AudioReader';
import UserAvatar from '@/components/UserAvatar';
import SiteRoleBadge from '@/components/SiteRoleBadge';
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, FileText, FileArchive, FileSpreadsheet, FileWarning, Clock, Eye, Share2, Printer } from "lucide-react";
import { getPost, Post as PostType, recordGamificationActivity } from '@/lib/api'; // Assuming Post is the type, aliasing to avoid conflict
import { getPostShareUrl } from '@/lib/share';
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
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from "@/components/query/QueryStates";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { InteriorPage, InteriorSection } from "@/components/InteriorPage";
import { useAuth } from '@/hooks/use-auth';
import { publicProfilePath } from '@/lib/public-profile';
import { formatSiteDate } from '@/lib/date-time';
import { formatMonthlyViews } from '@/lib/post-analytics';
import { usePosts } from '@/hooks/use-posts';
import { PostPager, RelatedPosts } from '@/components/news/PostNavigation';
import { PostPrintView } from '@/components/news/PostPrintView';
import { usePostPrint } from '@/hooks/use-post-print';

const getReadTime = (content: string, hook: string) => {
    const wordCount = `${content} ${hook}`.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
};

const Post = () => {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfOpen, setPdfOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const { data: postData, isLoading: loading, error: postError, refetch } = useQuery({
        queryKey: ['post', id],
        queryFn: () => getPost(id!),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    });
    const post: PostType | null = postData ?? null;
    const { data: allPosts = [] } = usePosts();
    const error = !id ? 'Липсва идентификатор на публикацията.' : postError instanceof Error ? postError.message : null;
    const galleryImages = useMemo(() => post?.gallery ?? [], [post?.gallery]);
    const lightboxSlides = useMemo(() => galleryImages.map((image, index) => ({
        src: image.display_url || image.image_url,
        thumbnail: image.thumbnail_url || image.image_url,
        alt: image.alt_text || image.title || `Снимка ${index + 1} към ${post?.title || ''}`,
    })), [galleryImages, post?.title]);
    const readTime = useMemo(() => post ? getReadTime(post.content, post.hook) : 0, [post]);
    const { viewRef: printViewRef, isMounted: isPrintViewMounted, isPreparing: isPreparingPrint, startPrint } = usePostPrint(post?.id);

    useEffect(() => {
        if (!user || !post?.id) return undefined;
        let visibleSeconds = 0;
        let recorded = false;
        const intervalId = window.setInterval(() => {
            if (document.visibilityState !== 'visible' || recorded) return;
            visibleSeconds += 1;
            if (visibleSeconds >= 15) {
                recorded = true;
                window.clearInterval(intervalId);
                void recordGamificationActivity('post_read', {
                    objectId: post.id,
                    engagementSeconds: visibleSeconds,
                }).catch(() => undefined);
            }
        }, 1000);
        return () => window.clearInterval(intervalId);
    }, [post?.id, user]);

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
        <InteriorPage>
            {/* Reading Progress Bar */}
            <style>
                {`
                @keyframes reading-progress-shimmer {
                    from { background-position: 0% 50%; }
                    to { background-position: 200% 50%; }
                }
                .reading-progress-bar {
                    background: linear-gradient(90deg, hsl(var(--primary)), #3b82f6, hsl(var(--primary)));
                    background-size: 200% 100%;
                    animation: reading-progress-shimmer 3s linear infinite;
                }
                `}
            </style>
            <div className="pointer-events-none fixed left-0 top-[calc(var(--site-header-height)+var(--header-greeting-height)+env(safe-area-inset-top,0px))] z-40 h-1 w-full bg-background/30">
                <div 
                    className="reading-progress-bar h-full rounded-r-full shadow-[0_0_12px_hsl(var(--primary)/0.45)] transition-all duration-150 ease-out motion-reduce:animate-none"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>
            <InteriorSection className="py-8 sm:py-12 lg:py-16">
                    {loading ? (
                        <ContentSkeleton variant="detail" label="Зареждане на публикацията" />
                    ) : error ? (
                        <QueryErrorState className="mx-auto max-w-2xl" message={error} onRetry={id ? () => void refetch() : undefined} />
                    ) : post && id ? (
                        <article className="mx-auto max-w-4xl">
                            <div ref={contentRef} className="overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-xl shadow-primary/5 sm:p-8 lg:p-10">
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {post.categories.map((c) => (
                                        <Badge key={c.id} variant="secondary"><Tag className="mr-1 h-3.5 w-3.5" aria-hidden="true" />{c.full_name}</Badge>
                                    ))}
                                </div>
                                <h1 className="text-balance text-3xl font-black leading-[1.08] tracking-[-0.035em] sm:text-4xl md:text-5xl">{post.title}</h1>
                                <p className="mt-4 text-pretty font-reading text-base leading-relaxed text-muted-foreground sm:text-lg">{post.hook}</p>
                                <div className="mb-8 mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-border/60 py-4 text-sm text-muted-foreground">
                                    {post.author_username ? <Link className="flex items-center gap-1.5 rounded hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to={publicProfilePath(post.author_username)}>
                                        <UserAvatar
                                            username={post.author_username}
                                            avatarUrl={post.author_avatar_url}
                                            siteRole={post.author_site_role}
                                            equippedRewards={post.author_equipped_rewards}
                                            className="h-6 w-6 text-xs"
                                        />
                                        <span>{post.author_username}</span>
                                        <SiteRoleBadge role={post.author_site_role} compact />
                                    </Link> : null}
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" aria-hidden="true" />
                                        <time dateTime={post.published_at || post.created_at}>{formatSiteDate(post.published_at || post.created_at)}</time>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        <span>{readTime} мин. четене</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="h-4 w-4" />
                                        <span>{formatMonthlyViews(post.views_this_month)}</span>
                                    </div>
                                    <div className="mt-2 flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-2 sm:mt-0 sm:w-auto sm:border-t-0 sm:pt-0">
                                        <ShareDropdown url={getPostShareUrl(post.id)} title={post.title}>
                                            <button
                                                className="flex items-center justify-start gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                title="Сподели тази статия"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span>Сподели</span>
                                            </button>
                                        </ShareDropdown>
                                        <button
                                            type="button"
                                            className="flex items-center justify-start gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-70"
                                            title="Принтирай статията със снимките"
                                            onClick={startPrint}
                                            disabled={isPreparingPrint}
                                        >
                                            <Printer className="h-4 w-4" aria-hidden="true" />
                                            <span aria-live="polite">{isPreparingPrint ? "Подготвям…" : "Принтирай"}</span>
                                        </button>
                                    </div>
                                </div>

                                <AudioReader content={post.content} title={post.title} />

                                {post.banner && (
                                    <img
                                        src={post.banner}
                                        alt={`Банер за ${post.title}`}
                                        className="mb-8 max-h-[32rem] w-full rounded-2xl border border-border/60 object-cover shadow-lg"
                                        loading="eager"
                                        fetchPriority="high"
                                        decoding="async"
                                    />
                                )}

                                {/* ~70 characters per line keeps long articles comfortable to read on wide screens. */}
                                <div className="max-w-[70ch] font-reading">
                                    <MarkdownRenderer
                                        content={post.content}
                                        onPdfClick={(url) => {
                                            setPdfUrl(url);
                                            setPdfOpen(true);
                                        }}
                                    />
                                </div>

                                {/* Image Gallery Section */}
                                {galleryImages.length > 0 && (
                                    <div className="mt-12">
                                        <h2 className="mb-5 text-2xl font-black tracking-tight sm:text-3xl">Галерия</h2>
                                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                            {galleryImages.map((image, index) => (
                                                <figure
                                                    key={image.id}
                                                    className={image.is_featured ? "sm:col-span-2" : ""}
                                                >
                                                    <button
                                                        type="button"
                                                        className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-muted text-left shadow-sm transition-shadow hover:shadow-lg"
                                                        onClick={() => {
                                                            setLightboxIndex(index);
                                                            setLightboxOpen(true);
                                                        }}
                                                        aria-label={`Отвори снимка ${index + 1} от галерията`}
                                                    >
                                                        <img
                                                            src={image.thumbnail_url || image.image_url}
                                                            alt={image.alt_text || image.title || `Снимка ${index + 1} към ${post.title}`}
                                                            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${image.is_featured ? "aspect-video" : "aspect-square"}`}
                                                            style={{ objectPosition: `${image.focus_x}% ${image.focus_y}%` }}
                                                            loading="lazy"
                                                            decoding="async"
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
                                        <h2 className="mb-5 text-2xl font-black tracking-tight sm:text-3xl">Прикачени файлове</h2>
                                        <div className="space-y-3">
                                            {post.documents.map((doc, index) => (
                                                <button 
                                                    key={doc.id || index} 
                                                    onClick={() => handleFileClick(doc)}
                                                    className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 text-left shadow-sm transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/50 hover:shadow-md motion-reduce:hover:translate-y-0"
                                                >
                                                    <div className="shrink-0 flex items-center">
                                                        {getFileIcon(doc.file_url)}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-grow min-w-0 gap-x-4 gap-y-1">
                                                        <span className="font-medium text-card-foreground hover:underline truncate">
                                                            {decodeURIComponent(doc.file_url.split('/').pop() || '')}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground shrink-0 whitespace-nowrap sm:ml-auto">
                                                            Качено на: {formatSiteDate(doc.uploaded_at)}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <PostPager post={post} posts={allPosts} />

                            <Comments postId={id} />

                            <RelatedPosts post={post} posts={allPosts} />

                        </article>
                    ) : (
                        <div className="mx-auto max-w-2xl text-center">
                            <QueryEmptyState
                                art="newspaper"
                                title="Публикацията вече не е налична"
                                description="Възможно е да е била изтрита, скрита или все още да не е публикувана."
                            />
                            <Link
                                to="/news"
                                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Виж актуалните новини
                            </Link>
                        </div>
                    )}
            </InteriorSection>

            {post && galleryImages.length > 0 && (
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    slides={lightboxSlides}
                    index={lightboxIndex}
                    carousel={{ preload: 1 }}
                    plugins={[Zoom, Fullscreen, Thumbnails, Counter]}
                    styles={{ container: { padding: "env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0)" } }}
                    thumbnails={{
                        height: 60,
                        gap: 8,
                    }}
                    className="z-50"
                />
            )}

            {post && isPrintViewMounted && <PostPrintView ref={printViewRef} post={post} />}

            <PDFViewerDialog
                fileUrl={pdfUrl}
                isOpen={pdfOpen}
                onOpenChange={setPdfOpen}
                title={pdfUrl ? decodeURIComponent(pdfUrl.split('/').pop() || '') : "Преглед на документ"}
            />
        </InteriorPage>
    );
};

export default Post;
