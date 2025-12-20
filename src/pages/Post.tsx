import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Loader2, Tag } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";
import { getPost, Post as PostType } from '@/lib/api'; // Assuming Post is the type, aliasing to avoid conflict
import Comments from '@/components/Comments';
import Lightbox from "yet-another-react-lightbox";
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

    return (
        <div className="min-h-screen w-full bg-background">
            <Header />
            <main className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                            <p className="mt-4 text-lg text-muted-foreground">Зареждане на публикацията...</p>
                        </div>
                    ) : post && id ? (
                        <article className="max-w-4xl mx-auto">
                            {post.banner && (
                                <img 
                                    src={post.banner} 
                                    alt={post.title} 
                                    className="w-full h-auto rounded-lg mb-8"
                                />
                            )}
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
                            </div>

                            <div className="prose prose-lg max-w-none break-words">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {post.content}
                                </ReactMarkdown>
                            </div>

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
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
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
        </div>
    );
};

export default Post;
