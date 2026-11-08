import { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useGoToLogin } from '@/hooks/use-go-to-login';
import { getComments, addComment, Comment as CommentType, User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, ReplyIcon, CornerDownRight } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import SiteRoleBadge from '@/components/SiteRoleBadge';
import { toast } from 'sonner';
import { ContentSkeleton, QueryEmptyState, QueryErrorState } from '@/components/query/QueryStates';
import { Link } from 'react-router-dom';
import { publicProfilePath } from '@/lib/public-profile';
import { formatSiteDateTime } from '@/lib/date-time';

interface CommentItemProps {
    comment: CommentType;
    postId: string;
    onReplySuccess: () => void;
    level: number;
    isAuthenticated: boolean;
    currentUser: User | null;
    goToLogin: () => void;
}

const requestedCommentId = () => {
    if (typeof window === 'undefined') return null;
    const match = window.location.hash.match(/^#comment-(\d+)$/);
    return match ? Number(match[1]) : null;
};

const containsComment = (comment: CommentType, targetId: number | null): boolean => (
    targetId !== null && (
        comment.id === targetId
        || Boolean(comment.replies?.some((reply) => containsComment(reply, targetId)))
    )
);

const CommentItem = memo(({ comment, postId, onReplySuccess, level, isAuthenticated, currentUser, goToLogin }: CommentItemProps) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const targetCommentId = requestedCommentId();
    const [showReplies, setShowReplies] = useState(() => containsComment(comment, targetCommentId));
    const replyFormRef = useRef<HTMLTextAreaElement>(null);
    const commentRef = useRef<HTMLDivElement>(null);

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) {
            toast.error('Моля, напишете отговор.');
            return;
        }
        if (!isAuthenticated || !currentUser) {
            goToLogin();
            return;
        }

        setSubmittingReply(true);
        try {
            // The backend now handles flattening, so we just send the direct parent ID.
            await addComment(postId, replyContent, comment.id);
            setReplyContent('');
            setShowReplyForm(false);
            onReplySuccess(); // Trigger refresh of all comments
            toast.success('Отговорът е добавен успешно!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Грешка при добавяне на отговора.';
            toast.error(errorMessage);
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

    useEffect(() => {
        if (containsComment(comment, targetCommentId)) setShowReplies(true);
        if (comment.id !== targetCommentId || !commentRef.current) return;
        const frame = window.requestAnimationFrame(() => {
            commentRef.current?.scrollIntoView({ block: 'center' });
            commentRef.current?.focus({ preventScroll: true });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [comment, targetCommentId]);

    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div
            id={`comment-${comment.id}`}
            ref={commentRef}
            tabIndex={comment.id === targetCommentId ? -1 : undefined}
            className={`scroll-mt-24 rounded-xl py-4 border-b last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${level > 0 ? 'pl-12 relative' : ''}`}
        >
             {level > 0 && (
                <CornerDownRight className="absolute left-4 top-7 h-5 w-5 text-gray-400" />
            )}
            <div className="flex items-start gap-4">
                {comment.username ? (
                    <Link to={publicProfilePath(comment.username)} aria-label={`Профил на ${comment.username}`} className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <UserAvatar username={comment.username} avatarUrl={comment.avatar_url} siteRole={comment.site_role} equippedRewards={comment.equipped_rewards} />
                    </Link>
                ) : <UserAvatar username={comment.username} avatarUrl={comment.avatar_url} siteRole={comment.site_role} equippedRewards={comment.equipped_rewards} />}
                <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                        {comment.username ? (
                            <Link className="font-semibold hover:text-primary hover:underline" to={publicProfilePath(comment.username)}>{comment.username}</Link>
                        ) : <span className="font-semibold">Изтрит потребител</span>}
                        <SiteRoleBadge role={comment.site_role} compact />
                        <span className="text-xs text-muted-foreground">
                            {formatSiteDateTime(comment.created_at)}
                        </span>
                    </div>
                     <p className="text-sm text-foreground">
                        {comment.parent_username && level > 0 && (
                            <Link className="mr-1 font-medium text-primary hover:underline" to={publicProfilePath(comment.parent_username)}>@{comment.parent_username}</Link>
                        )}
                        {comment.content}
                    </p>
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto px-0 mt-2 text-xs text-primary"
                        onClick={() => {
                            if (!isAuthenticated) {
                                goToLogin();
                                return;
                            }
                            setShowReplyForm(!showReplyForm);
                        }}
                    >
                        <ReplyIcon className="h-3 w-3 mr-1" /> Отговор
                    </Button>

                    {showReplyForm && (
                        <div className="mt-3 flex items-start gap-3">
                            <UserAvatar
                                username={currentUser?.username}
                                avatarUrl={currentUser?.avatar_url}
                                siteRole={currentUser?.site_role}
                                equippedRewards={currentUser?.equipped_rewards}
                                className="h-7 w-7 text-xs"
                            />
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

            {hasReplies && level === 0 && (
                <div className="mt-4 pl-12">
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-sm font-semibold"
                        onClick={() => setShowReplies(!showReplies)}
                    >
                        {showReplies ? 'Скрий отговорите' : `— Покажи ${comment.replies?.length} отговора`}
                    </Button>

                    {showReplies && (
                         <div className="mt-4">
                            {comment.replies?.map((reply) => (
                                 <CommentItem
                                     key={reply.id}
                                     comment={reply}
                                     postId={postId}
                                     onReplySuccess={onReplySuccess}
                                     level={level + 1}
                                     isAuthenticated={isAuthenticated}
                                     currentUser={currentUser}
                                     goToLogin={goToLogin}
                                 />
                             ))}
                         </div>
                    )}
                </div>
            )}
        </div>
    );
});

CommentItem.displayName = 'CommentItem';

const buildCommentTree = (comments: CommentType[]): CommentType[] => {
    const commentsById = new Map<number, CommentType>();
    comments.forEach((comment) => commentsById.set(comment.id, { ...comment, replies: [] }));

    const topLevelComments: CommentType[] = [];
    comments.forEach((comment) => {
        const currentComment = commentsById.get(comment.id)!;
        const parent = comment.parent_id ? commentsById.get(comment.parent_id) : undefined;
        if (parent) parent.replies = [...(parent.replies ?? []), currentComment];
        else topLevelComments.push(currentComment);
    });

    return topLevelComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

interface CommentsProps {
    postId: string;
}

const Comments = ({ postId }: CommentsProps) => {
    const { isAuthenticated, user } = useAuth();
    const goToLogin = useGoToLogin();
    const [newCommentContent, setNewCommentContent] = useState('');
    const [submittingMainComment, setSubmittingMainComment] = useState(false);
    const [submissionError, setSubmissionError] = useState('');
    const { data: rawComments = [], isLoading: loadingComments, error: commentsError, refetch } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () => getComments(postId),
        staleTime: 60 * 1000,
    });

    const refreshComments = useCallback(() => { void refetch(); }, [refetch]);
    const processedComments = useMemo(() => buildCommentTree(Array.isArray(rawComments) ? rawComments : []), [rawComments]);

    const handleMainCommentSubmit = async () => {
        if (!newCommentContent.trim()) {
            toast.error('Моля, напишете коментар.');
            return;
        }
        if (!isAuthenticated || !user) {
            goToLogin();
            return;
        }

        setSubmittingMainComment(true);
        setSubmissionError('');
        try {
            await addComment(postId, newCommentContent, null);
            setNewCommentContent('');
            await refetch();
            toast.success('Коментарът е добавен успешно!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Грешка при добавяне на коментара.';
            setSubmissionError(errorMessage);
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
                        <UserAvatar username={user?.username} avatarUrl={user?.avatar_url} siteRole={user?.site_role} equippedRewards={user?.equipped_rewards} />
                        <div className="w-full">
                            <p className="text-sm text-muted-foreground mb-2">
                                Моля, спазвайте добрия тон. Обидно съдържание и спам ще бъдат премахвани.
                            </p>
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
                    {submissionError && <p className="mt-2 text-sm text-destructive">{submissionError}</p>}
                </div>
            ) : (
                <p className="text-muted-foreground mb-8">
                    Трябва <button type="button" onClick={goToLogin} className="text-primary hover:underline">да сте логнат</button> за да публикувате коментар.
                </p>
            )}

            {loadingComments ? (
                <ContentSkeleton variant="list" count={3} label="Зареждане на коментарите" />
            ) : commentsError ? (
                <QueryErrorState message={commentsError instanceof Error ? commentsError.message : 'Грешка при зареждане на коментарите.'} onRetry={() => void refetch()} />
            ) : processedComments.length === 0 ? (
                <QueryEmptyState art="comment" title="Все още няма коментари" description="Бъдете първият, който ще се включи в разговора." />
            ) : (
                <div className="space-y-6">
                    {processedComments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            onReplySuccess={refreshComments}
                            level={0}
                            isAuthenticated={isAuthenticated}
                            currentUser={user}
                            goToLogin={goToLogin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;
