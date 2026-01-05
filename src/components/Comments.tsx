import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getComments, addComment, Comment as CommentType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, ReplyIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'sonner';

interface CommentItemProps {
    comment: CommentType;
    postId: string;
    onReplySuccess: () => void;
    level: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, onReplySuccess, level }) => {
    const { isAuthenticated, user, openLoginDialog } = useAuth();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const replyFormRef = useRef<HTMLTextAreaElement>(null);

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) {
            toast.error('Моля, напишете отговор.');
            return;
        }
        if (!isAuthenticated || !user) {
            openLoginDialog();
            return;
        }

        setSubmittingReply(true);
        try {
            await addComment(postId, replyContent, comment.id);
            setReplyContent('');
            setShowReplyForm(false);
            onReplySuccess(); // Trigger refresh of comments
            toast.success('Отговорът е добавен успешно!');
        } catch (err: any) {
            toast.error(err.message || 'Грешка при добавяне на отговора.');
            console.error(err);
        } finally {
            setSubmittingReply(false);
        }
    };

    useEffect(() => {
        if (showReplyForm && replyFormRef.current) {
            replyFormRef.current.focus();
        }
    }, [showReplyForm]);

    // Increase indentation to make reply hierarchy more visible
    const indentation = level * 24; // e.g., level 1 = 24px, level 2 = 48px

    return (
        <div
            style={{ paddingLeft: `${indentation}px` }}
            className={`py-4 border-b last:border-b-0 ${level > 0 ? 'relative pl-8' : ''}`}
        >
            {level > 0 && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"
                    style={{ left: `${level * 24 - 12}px` }}
                />
            )}
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarFallback>{comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{comment.username}</span>
                        <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString('bg-BG')}
                        </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto px-0 mt-2 text-xs text-primary"
                        onClick={() => {
                            if (!isAuthenticated) {
                                openLoginDialog();
                                return;
                            }
                            setShowReplyForm(!showReplyForm);
                        }}
                    >
                        <ReplyIcon className="h-3 w-3 mr-1" /> Отговор
                    </Button>

                    {showReplyForm && (
                        <div className="mt-3 flex items-start gap-3">
                             <Avatar className="h-7 w-7">
                                <AvatarFallback className="h-7 w-7 text-xs">
                                    {user?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <Textarea
                                    ref={replyFormRef}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Отговори на ${comment.username}...`}
                                    className="mb-2 text-sm"
                                    rows={2}
                                    disabled={submittingReply}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowReplyForm(false)}
                                        disabled={submittingReply}
                                    >
                                        Отказ
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleReplySubmit}
                                        disabled={submittingReply || !replyContent.trim()}
                                    >
                                        {submittingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Изпрати
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            onReplySuccess={onReplySuccess}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface CommentsProps {
    postId: string;
}

const Comments = ({ postId }: CommentsProps) => {
    const { isAuthenticated, user, openLoginDialog } = useAuth();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [submittingMainComment, setSubmittingMainComment] = useState(false);
    const [error, setError] = useState('');

    const fetchAndSetComments = async () => {
        setLoadingComments(true);
        setError('');
        try {
            const fetchedComments = await getComments(postId);
            if (fetchedComments) {
                setComments(fetchedComments);
            }
        } catch (err) {
            setError('Грешка при зареждане на коментарите.');
            console.error(err);
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        fetchAndSetComments();
    }, [postId]);

    const handleMainCommentSubmit = async () => {
        if (!newCommentContent.trim()) {
            toast.error('Моля, напишете коментар.');
            return;
        }
        if (!isAuthenticated || !user) {
            openLoginDialog();
            return;
        }

        setSubmittingMainComment(true);
        setError('');
        try {
            await addComment(postId, newCommentContent, null); // Parent is null for top-level comments
            setNewCommentContent('');
            fetchAndSetComments(); // Refresh all comments
            toast.success('Коментарът е добавен успешно!');
        } catch (err: any) {
            setError(err.message || 'Грешка при добавяне на коментара.');
            console.error(err);
        } finally {
            setSubmittingMainComment(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
                <MessageSquare className="h-6 w-6 mr-3" />
                Коментари
            </h2>

            {isAuthenticated ? (
                <div className="mb-8">
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="w-full">
                            <Textarea
                                value={newCommentContent}
                                onChange={(e) => setNewCommentContent(e.target.value)}
                                placeholder="Напишете коментар..."
                                className="mb-2"
                                rows={3}
                                disabled={submittingMainComment}
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleMainCommentSubmit}
                                    disabled={submittingMainComment || !newCommentContent.trim()}
                                >
                                    {submittingMainComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Изпрати коментар
                                </Button>
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            ) : (
                <p className="text-muted-foreground mb-8">
                    Трябва <a href="#" onClick={(e) => { e.preventDefault(); openLoginDialog(); }} className="text-primary hover:underline">да сте логнат</a> за да публикувате коментар.
                </p>
            )}

            {loadingComments ? (
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Зареждане на коментари...</p>
                </div>
            ) : comments.length === 0 ? (
                <p className="text-muted-foreground">Все още няма коментари.</p>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            onReplySuccess={fetchAndSetComments}
                            level={0} // Top-level comments start at level 0
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;