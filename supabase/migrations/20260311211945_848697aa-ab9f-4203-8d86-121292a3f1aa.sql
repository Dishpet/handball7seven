
-- Function to list users with their roles (admin only, security definer)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  roles text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.email,
    p.full_name,
    u.created_at,
    COALESCE(array_agg(ur.role::text) FILTER (WHERE ur.role IS NOT NULL), '{}')
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin')
  GROUP BY u.id, u.email, p.full_name, u.created_at
  ORDER BY u.created_at DESC
$$;

-- Function to set user role (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _role app_role, _action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF _action = 'grant' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF _action = 'revoke' THEN
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
  END IF;
END;
$$;
