import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// Уверете се, че CommentType в api.ts дефинира 'username: string'
import { getComments, addComment, Comment as CommentType } from '@/lib/api'; 
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// AvatarImage е импортиран, но не се използва, което е ОК.

interface CommentsProps {
    postId: string;
}

const Comments = ({ postId }: CommentsProps) => {
    const { isAuthenticated, user, openLoginDialog } = useAuth();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            setError('');
            try {
                const fetchedComments = await getComments(postId);
                if (fetchedComments) {
                    setComments(fetchedComments);
                }
            } catch (err) {
                // Тази грешка е логната, но CORS вече не би трябвало да я предизвиква
                setError('Failed to load comments.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        // ⚠️ Проверете дали потребителят е наличен, преди да изпращате
        if (!isAuthenticated || !user) {
            openLoginDialog(); 
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const added = await addComment(postId, newComment);
            if (added) {
                setComments(prevComments => [added, ...prevComments]); // Add new comment to the top
                setNewComment('');
            }
        } catch (err) {
            setError('Failed to submit comment. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
                <MessageSquare className="h-6 w-6 mr-3" />
                Comments
            </h2>

            {isAuthenticated ? (
                <div className="mb-8">
                    <div className="flex items-start gap-4">
                        <Avatar>
                            {/* Аватар за текущия потребител */}
                            <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="w-full">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="mb-2"
                                rows={3}
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleSubmit} disabled={submitting || !newComment.trim()}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            ) : (
                <p className="text-muted-foreground mb-8">
                    You must be <a href="#" onClick={(e) => { e.preventDefault(); openLoginDialog(); }} className="text-primary hover:underline">logged in</a> to post a comment.
                </p>
            )}

            {loading ? (
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading comments...</p>
                </div>
            ) : comments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet.</p>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-4">
                            <Avatar>
                                <AvatarFallback>
                                    {/* 🎯 КОРИГИРАНО: author_username -> username, Добавена проверка за безопасност */}
                                    {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'} 
                                </AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    {/* 🎯 КОРИГИРАНО: author_username -> username */}
                                    <span className="font-semibold">{comment.username}</span> 
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(comment.created_at).toLocaleString('bg-BG')}
                                    </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;

// ⚠️ ЗАБЕЛЕЖКА ЗА REACT ROUTER ПРЕДУПРЕЖДЕНИЯТА:
// За да премахнете Future Flag Warnings (v7_startTransition и v7_relativeSplatPath),
// добавете 'future' prop-а към вашия <BrowserRouter> във вашия главен файл (напр. main.tsx):
/*
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
</BrowserRouter>
*/