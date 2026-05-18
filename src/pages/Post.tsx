import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import hljs from 'highlight.js';
import '@/styles/atom-one-dark.css';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Loader2, Tag, FileText, FileArchive, FileSpreadsheet, FileWarning, Clock } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";
import { getPost, Post as PostType } from '@/lib/api'; // Assuming Post is the type, aliasing to avoid conflict
import Comments from '@/components/Comments';
import Lightbox from "yet-another-react-lightbox";
import PDFViewerDialog from "@/components/PDFViewerDialog";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";

const Post = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<PostType | null>(null);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfOpen, setPdfOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
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
            
            setScrollProgress(Math.min(100, Math.max(0, progress)));
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);
        
        // Initial calculation
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [post]);

    useEffect(() => {
        const fetchPost = async () => {
            if (id) {
                setLoading(true);
                const data = await getPost(id);
                if (data) {
                    setPost(data);
                } else {
                    console.log('API returned no data for this post.');
                }
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);


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

    const getReadTime = (content: string, hook: string) => {
        const text = `${content} ${hook}`;
        const wordsPerMinute = 200;
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    return (
        <div className="min-h-screen w-full bg-background">
            <Header />
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
                    ) : post && id ? (
                        <article className="max-w-4xl mx-auto">
                            <div ref={contentRef}>
                                <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-4 w-4" />
                                        <span>{post.author_username || `User ID: ${post.author}`}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(post.created_at).toLocaleDateString('bg-BG')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Tag className="h-4 w-4" />
                                        <Badge variant="secondary">{post.category_name}</Badge>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        <span>{getReadTime(post.content, post.hook)} мин. четене</span>
                                    </div>
                                </div>
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
                                {post.images && post.images.length > 0 && (
                                    <div className="mt-12">
                                        <h2 className="text-2xl font-bold mb-4">Галерия</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {post.images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        setLightboxIndex(index);
                                                        setLightboxOpen(true);
                                                    }}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Image ${index + 1} for post ${post.title}`}
                                                        className="w-full h-auto rounded-lg object-cover aspect-square transition-transform hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
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
            <Footer />
            <BackToTop />
            <CookieConsent />

            {post && post.images && (
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    slides={post.images.map(src => ({ src }))}
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
