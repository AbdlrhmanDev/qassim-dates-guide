import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Exhibition } from '@/lib/database.types';

async function fetchExhibitions(status?: string): Promise<Exhibition[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const res = await fetch(`/api/exhibitions?${params}`);
  if (!res.ok) throw new Error('Failed to fetch exhibitions');
  return res.json();
}

async function createExhibition(body: Partial<Exhibition>): Promise<Exhibition> {
  const res = await fetch('/api/exhibitions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create exhibition');
  return res.json();
}

// Hooks
export function useExhibitions(status?: string) {
  return useQuery({
    queryKey: ['exhibitions', status],
    queryFn: () => fetchExhibitions(status),
    staleTime: 0,          // always re-fetch on mount so new admin entries appear immediately
    refetchOnMount: true,
  });
}

export function useCreateExhibition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExhibition,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exhibitions'] }),
  });
}
