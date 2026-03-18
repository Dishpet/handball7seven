
-- Store-level available sizes
CREATE TABLE public.store_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

-- Store-level available colors
CREATE TABLE public.store_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  hex text NOT NULL DEFAULT '#000000',
  sort_order integer NOT NULL DEFAULT 0
);

-- Junction: which sizes are available per collection
CREATE TABLE public.collection_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  size_id uuid NOT NULL REFERENCES public.store_sizes(id) ON DELETE CASCADE,
  UNIQUE(collection_id, size_id)
);

-- Junction: which colors are available per collection
CREATE TABLE public.collection_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  color_id uuid NOT NULL REFERENCES public.store_colors(id) ON DELETE CASCADE,
  UNIQUE(collection_id, color_id)
);

-- RLS for store_sizes
ALTER TABLE public.store_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read sizes" ON public.store_sizes FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage sizes" ON public.store_sizes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS for store_colors
ALTER TABLE public.store_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read colors" ON public.store_colors FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage colors" ON public.store_colors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS for collection_sizes
ALTER TABLE public.collection_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read collection sizes" ON public.collection_sizes FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage collection sizes" ON public.collection_sizes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS for collection_colors
ALTER TABLE public.collection_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read collection colors" ON public.collection_colors FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage collection colors" ON public.collection_colors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
