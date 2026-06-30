'use client';

import { useEffect, useState } from 'react';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';
import { GroupUseCases } from '@/core/domain/use-cases/GroupUseCases';
import { GroupRepositoryImpl }  from '@/infrastructure/repositories/GroupRepositoryImpl';

export function PostCommentsList({ postId, groupId, currentUserId, currentUserName, currentUser,
    handleCommentLike, handleReplyToComment, handleReplyInputChange, handleReplySubmit,
    commentLikes, commentLikeCounts, replyingTo, replyingToName, setReplyingTo, replyInputs, refreshTrigger }: {
        postId: number;
        groupId: number;
        currentUserId: number;
        currentUserName: string;
        currentUser: any;
        handleCommentLike: (commentId: number) => void;
        handleReplyToComment: (commentId: number, userName: string) => void;
        handleReplyInputChange: (commentId: number, value: string) => void;
        handleReplySubmit: (commentId: number, postId: number) => Promise<void>;
        commentLikes: { [key: number]: boolean };
        commentLikeCounts: { [key: number]: number };
        replyingTo: number | null;
        replyingToName: string;
        setReplyingTo: (value: number | null) => void;
        replyInputs: { [key: number]: string };
        refreshTrigger?: number;
    }) {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                console.log(' Fetching comments for postId:', postId, 'groupId:', groupId);
                console.log(' Full URL should be: /contacts/extended/groups/' + groupId + '/posts/' + postId + '/comments');

                const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

                // Add retry logic for mobile
                let response;
                let retryCount = 0;
                const maxRetries = 3;

                while (retryCount < maxRetries) {
                    try {
                        response = await groupUseCases.getGroupComments(groupId, postId);
                        break; // Success, exit retry loop
                    } catch (retryError: any) {
                        retryCount++;
                        console.warn(` Retry ${retryCount}/${maxRetries} for comments:`, retryError.message);

                        if (retryCount >= maxRetries) {
                            throw retryError; // Max retries reached, throw error
                        }

                        // Wait before retry (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    }
                }

                console.log(' Comments response:', response);
                console.log(' Comments response type:', typeof response);
                console.log(' Comments response keys:', Object.keys(response || {}));
                console.log(' Comments content:', response?.content);
                console.log(' Comments content type:', typeof response?.content);
                console.log(' Comments array:', response?.content || []);
                console.log(' Comments length:', (response?.content || []).length);

                // Try different possible response structures
                let commentsArray = [];
                if (response?.content && Array.isArray(response.content)) {
                    commentsArray = response.content;
                } else if ((response as any)?.data && Array.isArray((response as any).data)) {
                    commentsArray = (response as any).data;
                } else if (Array.isArray(response)) {
                    commentsArray = response;
                } else if ((response as any)?.comments && Array.isArray((response as any).comments)) {
                    commentsArray = (response as any).comments;
                } else {
                    console.warn(' Unknown response structure:', response);
                }

                console.log(' Final comments array:', commentsArray);
                console.log(' Final comments length:', commentsArray.length);

                if (commentsArray.length === 0) {
                    console.warn('️ No comments found - Check backend logs for this postId:', postId);
                }

                setComments(commentsArray);
            } catch (error: any) {
                console.error('Error cargando comentarios:', error);

                // Handle network errors gracefully for mobile
                if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_CLOSED')) {
                    console.warn(' Mobile network error - showing placeholder');
                    setComments([]); // Set empty array to avoid infinite loading

                    // Show user-friendly message for mobile
                    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                        console.log(' Mobile detected - showing mobile-friendly message');
                    }
                } else {
                    console.error(' Different error type:', error.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [postId, groupId, refreshTrigger]);

    if (loading) return <div className="text-xs text-gray-400 dark:text-gray-500 py-2">Cargando comentarios...</div>;
    if (comments.length === 0) return (
        <div className="text-xs text-gray-400 dark:text-gray-500 py-2">
            No hay comentarios visibles.
            <br />
            <span className="text-xs">Escribe un comentario abajo para verlo aquí inmediatamente</span>
        </div>
    );

    return (
        <div className="space-y-2 mt-2" data-comments-for={postId}>
            {comments
                .filter((comment: any) => !comment.replyToCommentId) //  SOLO comentarios principales
                .map((comment: any, index: number) => (
                    <div key={comment.id || index} className="flex gap-2">
                        <UserAvatar
                            user={comment.userId === currentUserId ? currentUser : { firstName: comment.userName }}
                            size="xs"
                        />
                        <div className="flex-1">
                            <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                                <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                                    {comment.userId === currentUserId ? currentUserName : comment.userName || 'Usuario'}
                                </span>
                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{comment.content}</p>
                                <span className="text-xs text-gray-400 dark:text-gray-500">{comment.timeAgo}</span>
                            </div>

                            {/* Like and Reply buttons */}
                            <div className="flex gap-4 px-3 py-1">
                                <button
                                    onClick={() => handleCommentLike(comment.id)}
                                    className={`text-xs flex items-center gap-1 transition-colors ${commentLikes[comment.id] || comment.hasUserLiked
                                            ? 'text-blue-500 hover:text-brand font-medium'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <span className={commentLikes[comment.id] || comment.hasUserLiked ? 'text-blue-500' : ''}>
                                        {commentLikes[comment.id] || comment.hasUserLiked ? '' : ''}
                                    </span>
                                    {(commentLikeCounts[comment.id] || 0) + (commentLikes[comment.id] || comment.hasUserLiked ? 1 : 0) > 0 && (
                                        <span className="text-xs font-medium">
                                            {(commentLikeCounts[comment.id] || 0) + (commentLikes[comment.id] || comment.hasUserLiked ? 1 : 0)}
                                        </span>
                                    )}
                                    Me gusta
                                </button>

                                <button
                                    onClick={() => handleReplyToComment(comment.id, comment.userName)}
                                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Responder
                                </button>
                            </div>

                            {/* Reply input (WhatsApp style) */}
                            {replyingTo === comment.id && (
                                <div className="mt-2 px-3">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 dark:text-gray-300">
                                            <span>Respondiendo a {replyingToName}</span>
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                            >

                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <UserAvatar size="xs" />
                                            <input
                                                type="text"
                                                value={replyInputs[comment.id] || ''}
                                                onChange={(e) => handleReplyInputChange(comment.id, e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit(comment.id, postId)}
                                                placeholder={`Escribe una respuesta...`}
                                                className="flex-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleReplySubmit(comment.id, postId)}
                                                disabled={!replyInputs[comment.id]?.trim()}
                                                className="px-2 py-1 bg-brand text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Enviar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Replies to this comment */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {comment.replies.map((reply: any, replyIndex: number) => (
                                        <div key={reply.id || replyIndex} className="flex gap-2 pl-4">
                                            <UserAvatar
                                                user={reply.userId === currentUserId ? currentUser : { firstName: reply.userName }}
                                                size="xs"
                                            />
                                            <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1 border border-gray-100 dark:border-gray-600">
                                                <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                                                    {reply.userId === currentUserId ? currentUserName : reply.userName || 'Usuario'}
                                                </span>
                                                <p className="text-xs text-gray-800 dark:text-gray-200 mt-0.5">{reply.content}</p>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">{reply.timeAgo}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
        </div>
    );
}