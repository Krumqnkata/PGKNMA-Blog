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

const Post = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<PostType | null>(null);
    const [loading, setLoading] = useState(true);
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
        </div>
    );
};

export default Post;
