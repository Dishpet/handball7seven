import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StoreSize {
  id: string;
  name: string;
  sort_order: number;
}

export interface StoreColor {
  id: string;
  name: string;
  hex: string;
  sort_order: number;
}

// ── Sizes ──
export function useStoreSizes() {
  return useQuery({
    queryKey: ['store_sizes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_sizes').select('*').order('sort_order');
      if (error) throw error;
      return data as StoreSize[];
    },
  });
}

export function useUpsertStoreSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (size: Partial<StoreSize> & { name: string }) => {
      if (size.id) {
        const { error } = await supabase.from('store_sizes').update(size).eq('id', size.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('store_sizes').insert([size] as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store_sizes'] }),
  });
}

export function useDeleteStoreSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('store_sizes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store_sizes'] }),
  });
}

// ── Colors ──
export function useStoreColors() {
  return useQuery({
    queryKey: ['store_colors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_colors').select('*').order('sort_order');
      if (error) throw error;
      return data as StoreColor[];
    },
  });
}

export function useUpsertStoreColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (color: Partial<StoreColor> & { name: string }) => {
      if (color.id) {
        const { error } = await supabase.from('store_colors').update(color).eq('id', color.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('store_colors').insert([color] as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store_colors'] }),
  });
}

export function useDeleteStoreColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('store_colors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store_colors'] }),
  });
}

// ── All collection colors (bulk fetch for filtering) ──
export function useAllCollectionColors() {
  const { data: storeColors } = useStoreColors();
  return useQuery({
    queryKey: ['all_collection_colors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('collection_colors').select('collection_id, color_id');
      if (error) throw error;
      return data as { collection_id: string; color_id: string }[];
    },
  });
}

/**
 * Returns a function that, given a collection slug, returns the allowed StoreColor[] for that collection.
 * Uses the intersection of collection_colors table and store_colors.
 * If a collection has no color constraints set, returns all store colors (no restriction).
 */
export function useCollectionColorMap(collections?: { id: string; slug: string }[]) {
  const { data: storeColors } = useStoreColors();
  const { data: allColColors } = useAllCollectionColors();

  return useMemo(() => {
    const map: Record<string, StoreColor[]> = {};
    if (!storeColors || !allColColors || !collections) return map;

    for (const col of collections) {
      const colorIds = allColColors
        .filter(cc => cc.collection_id === col.id)
        .map(cc => cc.color_id);
      if (colorIds.length > 0) {
        map[col.slug.toUpperCase()] = storeColors.filter(sc => colorIds.includes(sc.id));
      } else {
        // No restriction = all colors allowed
        map[col.slug.toUpperCase()] = storeColors;
      }
    }
    return map;
  }, [storeColors, allColColors, collections]);
}

// ── Collection ↔ Size/Color mapping ──
export function useCollectionSizes(collectionId?: string) {
  return useQuery({
    queryKey: ['collection_sizes', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_sizes')
        .select('size_id')
        .eq('collection_id', collectionId!);
      if (error) throw error;
      return data.map((r: any) => r.size_id as string);
    },
    enabled: !!collectionId,
  });
}

export function useCollectionColors(collectionId?: string) {
  return useQuery({
    queryKey: ['collection_colors', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_colors')
        .select('color_id')
        .eq('collection_id', collectionId!);
      if (error) throw error;
      return data.map((r: any) => r.color_id as string);
    },
    enabled: !!collectionId,
  });
}

export function useSetCollectionSizes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, sizeIds }: { collectionId: string; sizeIds: string[] }) => {
      // Delete existing
      const { error: delErr } = await supabase.from('collection_sizes').delete().eq('collection_id', collectionId);
      if (delErr) throw delErr;
      // Insert new
      if (sizeIds.length > 0) {
        const rows = sizeIds.map(size_id => ({ collection_id: collectionId, size_id }));
        const { error } = await supabase.from('collection_sizes').insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, { collectionId }) => qc.invalidateQueries({ queryKey: ['collection_sizes', collectionId] }),
  });
}

export function useSetCollectionColors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, colorIds }: { collectionId: string; colorIds: string[] }) => {
      const { error: delErr } = await supabase.from('collection_colors').delete().eq('collection_id', collectionId);
      if (delErr) throw delErr;
      if (colorIds.length > 0) {
        const rows = colorIds.map(color_id => ({ collection_id: collectionId, color_id }));
        const { error } = await supabase.from('collection_colors').insert(rows as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, { collectionId }) => qc.invalidateQueries({ queryKey: ['collection_colors', collectionId] }),
  });
}
