ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
  _meta_role text;
  _meta_username text;
BEGIN
  _meta_role := COALESCE(NEW.raw_user_meta_data->>'role', '');
  _meta_username := COALESCE(NEW.raw_user_meta_data->>'username', '');

  IF _meta_role IN ('student', 'supervisor', 'admin') THEN
    _role := _meta_role::app_role;
  ELSE
    _role := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, username, role, is_approved)
  VALUES (NEW.id, NEW.email, _meta_username, _role, false)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        username = COALESCE(EXCLUDED.username, public.profiles.username),
        role = EXCLUDED.role,
        is_approved = COALESCE(public.profiles.is_approved, false);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
