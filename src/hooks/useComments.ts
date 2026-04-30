import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Comment } from '@/lib/database.types';

type TargetType = 'date_type' | 'trader' | 'exhibition';

interface CommentWithUser extends Comment {
  users: { full_name: string; avatar_url: string | null } | null;
}

async function fetchComments(targetType: TargetType, targetId: string): Promise<CommentWithUser[]> {
  const params = new URLSearchParams({ target_type: targetType, target_id: targetId });
  const res = await fetch(`/api/comments?${params}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

async function postComment(body: Partial<Comment>): Promise<Comment> {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

async function deleteComment(commentId: string): Promise<void> {
  const params = new URLSearchParams({ comment_id: commentId });
  const res = await fetch(`/api/comments?${params}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete comment');
}

// Hooks
export function useComments(targetType: TargetType, targetId: string) {
  return useQuery({
    queryKey: ['comments', targetType, targetId],
    queryFn: () => fetchComments(targetType, targetId),
    enabled: !!targetId,
  });
}

export function usePostComment(targetType: TargetType, targetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postComment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', targetType, targetId] }),
  });
}

export function useDeleteComment(targetType: TargetType, targetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', targetType, targetId] }),
  });
}
