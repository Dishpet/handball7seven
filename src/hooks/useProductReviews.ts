import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ProductReview = {
  id: string;
  product_slug: string;
  user_id: string;
  user_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function useProductReviews(productSlug: string) {
  return useQuery({
    queryKey: ['product_reviews', productSlug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('product_reviews')
        .select('*')
        .eq('product_slug', productSlug)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProductReview[];
    },
    enabled: !!productSlug,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { product_slug: string; user_id: string; user_name: string; rating: number; comment: string }) => {
      const { error } = await (supabase as any)
        .from('product_reviews')
        .insert(review);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['product_reviews', vars.product_slug] });
    },
  });
}
