
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  collection TEXT DEFAULT 'classic',
  badge TEXT,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  image_url TEXT DEFAULT '',
  stock_status TEXT DEFAULT 'instock',
  stock_quantity INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible products" ON public.products FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible collections" ON public.collections FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage collections" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Site content (key-value for editable content blocks)
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Store settings
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.store_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_address JSONB DEFAULT '{}',
  customer_email TEXT,
  customer_name TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed default collections
INSERT INTO public.collections (slug, name, description, sort_order) VALUES
  ('classic', 'Classic', 'Our signature collection. Clean lines, bold branding.', 1),
  ('vintage', 'Vintage', 'Heritage-inspired designs with retro handball aesthetics.', 2),
  ('kids', 'Kids', 'Playful designs for the next generation of players.', 3);

-- Seed default products
INSERT INTO public.products (slug, name, description, price, collection, badge, sizes, colors, image_url, stock_quantity, sort_order) VALUES
  ('classic-logo-hoodie', 'Classic Logo Hoodie', 'Our signature logo hoodie. Premium heavyweight cotton, minimal branding.', 79.00, 'classic', 'bestseller', ARRAY['S','M','L','XL','XXL'], ARRAY['Black'], '/products/classic-logo-hoodie.jpg', 150, 1),
  ('vintage-hoodie', 'Vintage Collection Hoodie', 'Retro handball heritage meets modern streetwear.', 89.00, 'vintage', 'vintage', ARRAY['S','M','L','XL','XXL'], ARRAY['Cream','Washed Black'], '/products/vintage-hoodie.jpg', 100, 2),
  ('kids-bunny-hoodie', 'Kids Bunny Hoodie', 'Playful handball mascot design for the next generation.', 59.00, 'kids', 'new', ARRAY['6Y','8Y','10Y','12Y','14Y'], ARRAY['Black'], '/products/kids-bunny-hoodie.jpg', 80, 3),
  ('classic-tee', 'Classic Logo Tee', 'Essential everyday tee with subtle branding. Premium cotton, relaxed fit.', 45.00, 'classic', 'bestseller', ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Dark Grey'], '/products/classic-tee.jpg', 300, 4),
  ('vintage-crewneck', 'Vintage Crewneck', 'Heritage-inspired crewneck with distressed print.', 75.00, 'vintage', 'new', ARRAY['S','M','L','XL'], ARRAY['Sand','Cream'], '/products/vintage-crewneck.jpg', 120, 5),
  ('classic-joggers', 'Classic Joggers', 'Tapered fit joggers with subtle branding.', 69.00, 'classic', NULL, ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Dark Grey'], '/products/classic-joggers.jpg', 200, 6),
  ('kids-logo-tee', 'Kids Logo Tee', 'Simple and bold for young handball fans.', 35.00, 'kids', 'new', ARRAY['6Y','8Y','10Y','12Y','14Y'], ARRAY['Black','White'], '/products/kids-logo-tee.jpg', 250, 7),
  ('vintage-cap', 'Vintage Cap', 'Structured cap with vintage embroidery.', 35.00, 'vintage', 'vintage', ARRAY['One Size'], ARRAY['Sand','Black'], '/products/vintage-cap.jpg', 200, 8);

-- Seed default store settings
INSERT INTO public.store_settings (key, value) VALUES
  ('shipping', '{"free_threshold": 100, "standard_cost": 5}'),
  ('general', '{"store_name": "Handball Seven", "currency": "EUR"}');

-- Seed default content
INSERT INTO public.site_content (key, value) VALUES
  ('hero', '{"title": "VIBE SA KVARNERA", "subtitle": "PREMIUM QUALITY STREETWEAR BRAND"}'),
  ('about', '{"story": "Our story begins on the handball courts of the Croatian coast..."}');
