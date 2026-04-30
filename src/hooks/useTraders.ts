import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Trader } from '@/lib/database.types';

interface TradersFilter {
  city?: string;
  search?: string;
}

async function fetchTraders(filter: TradersFilter = {}): Promise<Trader[]> {
  const params = new URLSearchParams();
  if (filter.city)   params.set('city', filter.city);
  if (filter.search) params.set('search', filter.search);

  const res = await fetch(`/api/traders?${params}`);
  if (!res.ok) throw new Error('Failed to fetch traders');
  return res.json();
}

async function fetchTraderById(id: string): Promise<Trader> {
  const res = await fetch(`/api/traders/${id}`);
  if (!res.ok) throw new Error('Trader not found');
  return res.json();
}

async function createTrader(body: Partial<Trader>): Promise<Trader> {
  const res = await fetch('/api/traders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create trader');
  return res.json();
}

async function updateTrader(id: string, body: Partial<Trader>): Promise<Trader> {
  const res = await fetch(`/api/traders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update trader');
  return res.json();
}

// Hooks
export function useTraders(filter: TradersFilter = {}) {
  return useQuery({
    queryKey: ['traders', filter],
    queryFn: () => fetchTraders(filter),
  });
}

export function useTraderById(id: string) {
  return useQuery({
    queryKey: ['traders', id],
    queryFn: () => fetchTraderById(id),
    enabled: !!id,
  });
}

export function useCreateTrader() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTrader,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['traders'] }),
  });
}

export function useUpdateTrader() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Trader> & { id: string }) => updateTrader(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['traders'] }),
  });
}
