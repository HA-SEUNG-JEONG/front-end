import CommentInput from '@/components/features/feed/comment/CommentInput';
import CommentList from '../feed/comment/commentList/CommentList';
import useFeedComments from '@/hooks/useFeedComments';
import { CommentsResponse } from '@/types';
import { useState } from 'react';
import useConfirmModal from '@/hooks/useConfirmModal';
import ConfirmModal from '@/components/common/ConfirmModal';

interface UserProfile {
    nickname: string;
    profileImageUrl: string;
}

interface FeedCommentSectionProps {
    userProfile: UserProfile | null;
    comments: CommentsResponse | undefined;
    deleteComment: (commentId: number) => Promise<void>;
    feedId: string;
}

const FeedCommentSection = ({
    userProfile,
    comments,
    deleteComment,
    feedId,
}: FeedCommentSectionProps) => {
    const confirmModal = useConfirmModal();
    const { addComment } = useFeedComments(feedId);
    const [replyToId, setReplyToId] = useState<number | null>(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmitComment = async () => {
        if (!newComment.trim() || isSubmitting || !userProfile) return;
        setIsSubmitting(true);
        try {
            await addComment(newComment, replyToId);
            setNewComment('');
            setReplyToId(null);
        } catch (error) {
            alert(error instanceof Error ? error.message : '댓글 등록에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 댓글 삭제 버튼 클릭 시
    const handleDeleteClick = (commentId: number) => {
        confirmModal.show(
            {
                title: '댓글 삭제',
                description: '정말로 이 댓글을 삭제하시겠습니까?',
                confirmText: '삭제',
                cancelText: '취소',
            },
            async () => {
                await deleteComment(commentId);
            },
        );
    };

    return (
        <>
            <ConfirmModal
                {...confirmModal}
                onCancel={confirmModal.hide}
            />
            <CommentInput
                newComment={newComment}
                onCommentChange={(e) => setNewComment(e.target.value)}
                onCommentSubmit={(e) => {
                    e.preventDefault();
                    onSubmitComment();
                }}
                isSubmitting={isSubmitting}
                replyToId={replyToId}
                onCancelReply={() => setReplyToId(null)}
            />
            <CommentList
                comments={comments?.comments || []}
                userProfile={userProfile}
                onReply={(id: number) => setReplyToId(id)}
                onDelete={handleDeleteClick}
            />
        </>
    );
};

export default FeedCommentSection;
