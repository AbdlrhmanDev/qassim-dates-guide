import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DateType } from '@/lib/database.types';

interface DatesFilter {
  category?: string;
  search?: string;
}

async function fetchDates(filter: DatesFilter = {}): Promise<DateType[]> {
  const params = new URLSearchParams();
  if (filter.category && filter.category !== 'all') params.set('category', filter.category);
  if (filter.search) params.set('search', filter.search);

  const res = await fetch(`/api/dates?${params}`);
  if (!res.ok) throw new Error('Failed to fetch dates');
  return res.json();
}

async function fetchDateById(id: string): Promise<DateType> {
  const res = await fetch(`/api/dates/${id}`);
  if (!res.ok) throw new Error('Date not found');
  return res.json();
}

async function createDate(body: Partial<DateType>): Promise<DateType> {
  const res = await fetch('/api/dates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create date');
  return res.json();
}

async function updateDate(id: string, body: Partial<DateType>): Promise<DateType> {
  const res = await fetch(`/api/dates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update date');
  return res.json();
}

async function deleteDate(id: string): Promise<void> {
  const res = await fetch(`/api/dates/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete date');
}

// Hooks
export function useDates(filter: DatesFilter = {}) {
  return useQuery({
    queryKey: ['dates', filter],
    queryFn: () => fetchDates(filter),
  });
}

export function useDateById(id: string) {
  return useQuery({
    queryKey: ['dates', id],
    queryFn: () => fetchDateById(id),
    enabled: !!id,
  });
}

export function useCreateDate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dates'] }),
  });
}

export function useUpdateDate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<DateType> & { id: string }) => updateDate(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dates'] }),
  });
}

export function useDeleteDate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dates'] }),
  });
}
